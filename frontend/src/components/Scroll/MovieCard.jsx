import React, { memo } from "react";
import { Lock } from "lucide-react";
import { useLazyImage } from "../../hooks/useLazyImage";
import { motion } from "framer-motion";

const MovieCard = memo(
  ({ title, imageUrl, rating, year, isLocked = true, index }) => {
    const [imageRef, currentSrc, isLoaded] = useLazyImage(imageUrl);

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: index * 0.1 }}
        className="relative group"
      >
        <div className="relative overflow-hidden rounded-xl aspect-[2/3] transition-transform duration-300 group-hover:scale-105">
          <div
            ref={imageRef}
            className={`w-full h-full bg-gray-800 transition-opacity duration-300 ${
              isLoaded ? "opacity-100" : "opacity-0"
            }`}
          >
            <img
              src={currentSrc}
              alt={title}
              className="object-cover w-full h-full"
              loading="lazy"
            />
          </div>
          {isLocked && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm">
              <Lock className="w-12 h-12 text-white/80" />
            </div>
          )}
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 to-transparent">
            <h3 className="text-lg font-semibold text-white truncate">
              {title}
            </h3>
            <div className="flex items-center justify-between mt-2">
              <span className="text-yellow-400">★ {rating}/10</span>
              <span className="text-gray-300">{year}</span>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }
);

MovieCard.displayName = "MovieCard";
export default MovieCard;
