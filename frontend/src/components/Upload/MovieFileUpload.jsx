import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Film } from "lucide-react";

const MovieFileUpload = ({ onFileSelect, preview, selectedFile }) => {
  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => onFileSelect(file, reader.result);
      reader.readAsDataURL(file);
    }
  };

  return (
    <Card className="bg-[#222222] border-[#403E43]">
      <CardHeader>
        <CardTitle className="text-white">Movie File</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="border-2 border-dashed border-[#403E43] rounded-lg p-8 text-center">
          <input
            type="file"
            accept="video/*"
            onChange={handleFileSelect}
            className="hidden"
            id="movie-upload"
          />
          <label
            htmlFor="movie-upload"
            className="cursor-pointer flex flex-col items-center"
          >
            {preview ? (
              <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden">
                <video
                  src={preview}
                  className="w-full h-full object-cover"
                  controls
                />
              </div>
            ) : (
              <>
                <Film className="h-16 w-16 text-[#0FA0CE] mb-4" />
                <p className="text-lg mb-2">Drag and drop your movie file</p>
                <p className="text-sm text-gray-400">
                  or click to browse files
                </p>
              </>
            )}
          </label>
          {selectedFile && (
            <p className="mt-4 text-sm text-gray-400">
              Selected: {selectedFile.name}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default MovieFileUpload;
