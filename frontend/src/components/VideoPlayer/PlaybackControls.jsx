import React, { useEffect } from "react";
import { Play, Pause, SkipBack, SkipForward } from "lucide-react";

const PlaybackControls = ({ isPlaying, onPlayPause, onSkip }) => {
  // Handle keyboard events for playback controls
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.code === "Space") {
        event.preventDefault(); // Prevent page scroll when pressing Space
        onPlayPause();
      } else if (event.code === "ArrowRight") {
        onSkip(10); // Skip forward 10 seconds
      } else if (event.code === "ArrowLeft") {
        onSkip(-10); // Skip backward 10 seconds
      }
    };

    // Add event listener for keydown
    window.addEventListener("keydown", handleKeyDown);

    // Cleanup event listener on unmount
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onPlayPause, onSkip]);

  return (
    <div className="flex items-center gap-6">
      {/* Play/Pause Button */}
      <button
        onClick={onPlayPause}
        className="text-white/90 hover:text-white transition"
      >
        {isPlaying ? (
          <Pause className="w-6 h-6" />
        ) : (
          <Play className="w-6 h-6" />
        )}
      </button>

      {/* Skip Backward Button */}
      <button
        onClick={() => onSkip(-10)}
        className="text-white/90 hover:text-white transition"
      >
        <SkipBack className="w-6 h-6" />
      </button>

      {/* Skip Forward Button */}
      <button
        onClick={() => onSkip(10)}
        className="text-white/90 hover:text-white transition"
      >
        <SkipForward className="w-6 h-6" />
      </button>
    </div>
  );
};

export default PlaybackControls;
