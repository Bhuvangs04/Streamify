import React from "react";
import axios from "axios";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "react-query";
import { Button } from "@/components/ui/button";

const fetchMovies = async () => {
  const response = await axios.post(
    "http://localhost:8081/api/admin/movie/uploaded/details"
  );
  if (response.status === 200) {
    return response.data.MovieDetails;
  } else {
    throw new Error("Failed to fetch movies");
  }
};

const AdminMovieStatus = () => {
  const navigate = useNavigate();
  const {
    data: movies = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["movies"],
    queryFn: fetchMovies,
    refetchInterval: 30000,
    onError: (error) => {
      //console.error("Error fetching movies:", error);
      toast.error("Failed to fetch movies");
    },
  });
  const handlePublishToggle = async (movieId, currentStatus) => {
    try {
      // Toggle the current status
      const toggledStatus =
        currentStatus === "true" || currentStatus === true ? "false" : "true";

      // Axios API call to toggle publish status
      const response = await axios.post(
        `http://localhost:8081/api/publish/${toggledStatus}/${movieId}/final`,
        {},
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true, // Ensures cookies or tokens are sent
        }
      );

      // Update the user with the success message
      const newStatus = response.data.publish;
      toast.success(
        `Movie successfully ${
          newStatus === "true" ? "published" : "unpublished"
        }`
      );

      // Refetch data to update UI
      refetch();
    } catch (error) {
      //console.error("Error toggling publish status:", error);
      toast.error("Failed to update publish status");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "processing":
        return "bg-yellow-500";
      case "queued":
        return "bg-blue-500";
      case "completed":
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  };
  const renderMovieSection = (title, filteredMovies) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-8"
    >
      <button
        onClick={() => navigate("/users/statics")}
        className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
      >
        <X className="h-6 w-6 text-gray-500" />
      </button>
      <h2 className="text-2xl font-bold text-white mb-4">{title}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMovies.map((movie, index) => (
          <motion.div
            key={movie._id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className="bg-gray-800 rounded-lg p-6 transform transition-all duration-300 hover:scale-105 hover:shadow-xl"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-white">
                {movie.title}
              </h2>
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                  movie.status
                )} text-white`}
              >
                {movie.status}
              </span>
            </div>
            {movie.status === "processing" && (
              <div className="w-full bg-gray-700 rounded-full h-2.5 mb-4">
                <div
                  className="bg-blue-600 h-2.5 rounded-full animate-pulse"
                  style={{ width: "45%" }}
                ></div>
              </div>
            )}
            <div className="text-gray-400">
              <p className="mb-2">
                Upload Date: {new Date(movie.uploadedDate).toLocaleDateString()}
              </p>
              {movie.status === "completed" && (
                <Button
                  onClick={() => handlePublishToggle(movie._id, movie.publish)}
                  className={`mt-4 w-full ${
                    movie.publish === "true"
                      ? "bg-red-500 hover:bg-red-600"
                      : "bg-green-500 hover:bg-green-600"
                  }`}
                >
                  {movie.publish === "true" ? "Unpublish" : "Publish"}
                </Button>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold text-white mb-8">
            Movie Processing Status
          </h1>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-gray-800 rounded-lg p-6 animate-pulse">
                <div className="h-4 bg-gray-700 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-gray-700 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return <div>Error loading movies. Please try again later.</div>;
  }

  const processingMovies = movies.filter(
    (movie) => movie.status === "processing"
  );
  const queuedMovies = movies.filter((movie) => movie.status === "queued");
  const completedMovies = movies.filter(
    (movie) => movie.status === "completed"
  );

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <Button onClick={refetch} className="mt-4 p-2 bg-blue-500 text-white">
        Refresh Movies
      </Button>
      <div className="max-w-7xl mx-auto">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-bold text-white mb-8"
        >
          Movie Processing Status
        </motion.h1>

        {processingMovies.length > 0 &&
          renderMovieSection("Processing", processingMovies)}
        {queuedMovies.length > 0 &&
          renderMovieSection("In Queue", queuedMovies)}
        {completedMovies.length > 0 &&
          renderMovieSection("Completed", completedMovies)}

        {movies.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center text-gray-400 mt-12"
          >
            <p className="text-xl">No movies found</p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default AdminMovieStatus;
