import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useToast } from "@/components/hooks/use-toast";
import MovieFileUpload from "@/components/Upload/MovieFileUpload";
import MoviePosterUpload from "@/components/Upload/MoviePosterUpload";
import MovieDetailsForm from "@/components/Upload/MovieDetailsForm";
import {
  uploadMovieChunk,
  uploadPosterAndMetadata,
  calculateChunks,
  getChunk,
} from "@/utils/uploadHelpers";

const MovieUpload = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedPoster, setSelectedPoster] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [movieId, setMovieId] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    director: "",
    releaseYear: "",
    genre: "",
  });

  const handleFileSelect = async (file) => {
    setSelectedFile(file);
    if (file && movieId) {
      await handleMovieUpload(file);
    }
  };

  const handlePosterSelect = (file) => {
    setSelectedPoster(file);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleMovieUpload = async (file) => {
    setUploading(true);
    setUploadProgress(0);

    try {
      const totalChunks = calculateChunks(file.size);

      for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
        const chunk = getChunk(file, chunkIndex);
        await uploadMovieChunk(
          chunk,
          file.name,
          chunkIndex,
          totalChunks,
          movieId,
          formData.title
        );

        // Update progress and free up memory
        const progress = Math.round(((chunkIndex + 1) / totalChunks) * 100);
        setUploadProgress(progress);

        // Give the browser time to garbage collect
        await new Promise((resolve) => setTimeout(resolve, 100));
      }

      toast({
        title: "Success!",
        description: "Movie uploaded successfully.",
      });

      // Reset form
      setFormData({
        title: "",
        description: "",
        director: "",
        releaseYear: "",
        genre: "",
      });
      setSelectedFile(null);
      setSelectedPoster(null);
      setMovieId(null);
      setStep(1);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to upload movie.",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedPoster) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please select a poster image.",
      });
      return;
    }

    try {
      const formDataToSend = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        formDataToSend.append(key, value);
      });
      formDataToSend.append("poster", selectedPoster);

      const { movieId: newMovieId } = await uploadPosterAndMetadata(
        formDataToSend
      );
      setMovieId(newMovieId);
      setStep(2);

      toast({
        title: "Success!",
        description: "Metadata saved. Please proceed with movie upload.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to save metadata.",
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#1A1F2C] text-white p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Upload Movie</h1>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/users/statics")}
            className="hover:bg-gray-800 rounded-full"
          >
            <X className="h-6 w-6" />
          </Button>
        </div>

        {step === 1 ? (
          <div className="grid md:grid-cols-2 gap-6">
            <MoviePosterUpload
              onPosterSelect={handlePosterSelect}
              selectedPoster={selectedPoster}
            />
            <MovieDetailsForm
              formData={formData}
              onChange={handleInputChange}
              onSubmit={handleSubmit}
              uploading={uploading}
            />
          </div>
        ) : (
          <MovieFileUpload
            onFileSelect={handleFileSelect}
            selectedFile={selectedFile}
            uploading={uploading}
            uploadProgress={uploadProgress}
          />
        )}
      </div>
    </div>
  );
};

export default MovieUpload;
