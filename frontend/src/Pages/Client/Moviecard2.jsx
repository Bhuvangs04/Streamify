import React, { useState } from "react";
import { Button } from "@/components/ui/button"; // Import Button component
import { ChevronDown, ChevronUp, Play } from "lucide-react"; // Import icons
import axios from "axios"; // Axios for API calls

export function MovieCard({ movie, onPlay, onRemove }) {
  const [showDescription, setShowDescription] = useState(false);
  const [removing, setRemoving] = useState(false); // Track removal state

  const toggleDescription = () => setShowDescription((prev) => !prev);

  const handleRemove = async () => {
    try {
      setRemoving(true);
      // Call the backend to delete the movie from the wishlist
      await axios.delete(
        `http://localhost:8081/api/user/${movie.id}/wishlist`,
        { withCredentials: true } // Include credentials for authentication
      );
      // Notify parent component to remove the movie
      onRemove(movie.id);
    } catch (error) {
      //console.error("Error removing from wishlist:", error);
      alert("Failed to remove from wishlist. Please try again.");
    } finally {
      setRemoving(false);
    }
  };

  return (
    <div className="ml-2 w-80 bg-gray-800 text-white rounded-lg shadow-lg overflow-hidden">
      <div className="relative">
        <img
          src={`http://localhost:8081${movie.poster}`}
          alt={movie.title}
          className="w-full h-48 object-cover"
          loading="lazy"
        />
      </div>

      <div className="p-4">
        <h3 className="text-xl font-bold">{movie.title}</h3>

        <div className="mt-4 flex gap-4">
          {/* Play Button */}
          <Button
            onClick={() => onPlay(movie)}
            className="bg-blue-500 hover:bg-blue-700 flex items-center gap-2 px-4 py-2"
          >
            <Play className="w-5 h-5 text-white" />
            Play
          </Button>

          {/* Remove Button */}
          <Button
            onClick={handleRemove}
            disabled={removing}
            className={`bg-red-500 text-white px-4 py-2 rounded ${
              removing ? "cursor-not-allowed bg-gray-500" : "hover:bg-red-700"
            }`}
          >
            {removing ? "Removing..." : "Remove"}
          </Button>

          {/* Toggle Description */}
          <Button
            onClick={toggleDescription}
            className="flex items-center gap-2 px-4 py-2"
          >
            {showDescription ? (
              <>
                <ChevronUp className="w-5 h-5" />
                Hide
              </>
            ) : (
              <>
                <ChevronDown className="w-5 h-5" />
                More
              </>
            )}
          </Button>
        </div>

        {/* Description Section */}
        {showDescription && (
          <div className="mt-4 text-sm text-gray-300">
            <p>{movie.description}</p>
          </div>
        )}
      </div>
    </div>
  );
}
