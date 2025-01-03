import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, Heart, Play } from "lucide-react";
import axios from "axios";
import { cn } from "@/lib/utils";

export function MovieCard({ movie, onPlay }) {
  const [showDescription, setShowDescription] = useState(false);
  const [isInWishlist, setIsInWishlist] = useState(movie.isInWishlist || false);
  const [isHovered, setIsHovered] = useState(false);

  const toggleDescription = () => setShowDescription(!showDescription);

  const toggleWishlist = async () => {
    try {
      const url = `http://localhost:8081/api/user/${movie.id}/wishlist`;
      const method = isInWishlist ? "DELETE" : "POST";

      await axios({
        method,
        url,
        withCredentials: true,
      });

      setIsInWishlist(!isInWishlist);
    } catch (error) {
      //console.error("Error toggling wishlist:", error);
      alert("Failed to update wishlist. Please try again.");
    }
  };

  return (
    <div
      className={cn(
        "movie-card group relative rounded-lg overflow-hidden transition-all duration-300 flex-shrink-0 w-[240px]",
        isHovered && "scale-105 z-10 shadow-xl"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Movie Poster */}
      <img
        src={`http://localhost:8081${movie.poster}`}
        alt={movie.title}
        className="w-full h-[320px] object-cover rounded-lg"
        loading="lazy"
      />

      {/* Overlay with Content */}
      <div
        className={cn(
          "absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent",
          "opacity-0 group-hover:opacity-100 transition-opacity duration-300",
          "flex flex-col justify-end p-4"
        )}
      >
        <div className="space-y-3 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
          {/* Title */}
          <h3 className="text-lg font-bold text-white">{movie.title}</h3>

          {/* Description (Expandable) */}
          <div
            className={cn(
              "text-xs text-gray-200 transition-all duration-300",
              showDescription ? "line-clamp-none" : "line-clamp-2"
            )}
          >
            {movie.description}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={() => onPlay(movie)}
              className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full h-8 px-3 text-xs"
            >
              <Play className="w-4 h-4 mr-1" />
              Play
            </Button>

            <Button
              onClick={toggleWishlist}
              variant="outline"
              className={cn(
                "rounded-full border-2 transition-colors duration-300 h-8 px-3 text-xs",
                isInWishlist
                  ? "bg-destructive text-destructive-foreground border-destructive"
                  : "hover:bg-destructive hover:text-destructive-foreground border-destructive/50"
              )}
            >
              <Heart className="w-4 h-4 mr-1" />
              {isInWishlist ? "Remove" : "Add"}
            </Button>

            <Button
              onClick={toggleDescription}
              variant="ghost"
              className="rounded-full hover:bg-white/10 h-8 px-3 text-xs"
            >
              {showDescription ? (
                <ChevronUp className="w-4 h-4 mr-1" />
              ) : (
                <ChevronDown className="w-4 h-4 mr-1" />
              )}
              {showDescription ? "Less" : "More"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
