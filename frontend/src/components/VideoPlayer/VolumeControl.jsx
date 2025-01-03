import React, { useEffect } from "react";
import { Volume2, VolumeX } from "lucide-react";

const VolumeControl = ({ isMuted, volume, onMuteToggle, onVolumeChange }) => {
  // Handle keyboard events for volume control
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "ArrowUp") {
        // Increase the volume when up arrow key is pressed
        const newVolume = Math.min(volume + 0.05, 1); // Increase volume by 5%
        onVolumeChange(newVolume);
        if (isMuted) onMuteToggle(false); // Unmute if it's muted
      } else if (event.key === "ArrowDown") {
        // Decrease the volume when down arrow key is pressed
        const newVolume = Math.max(volume - 0.05, 0); // Decrease volume by 5%
        onVolumeChange(newVolume);
        if (newVolume === 0) {
          onMuteToggle(true); // Mute if volume reaches 0
        } else if (isMuted) {
          onMuteToggle(false); // Unmute when volume is increased
        }
      }
    };

    // Add event listener for keydown
    window.addEventListener("keydown", handleKeyDown);

    // Clean up the event listener
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [volume, onVolumeChange, isMuted, onMuteToggle]);

  const handleSliderClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    const newVolume = Math.max(0, Math.min(1, pos));
    onVolumeChange(newVolume);

    // Automatically unmute when the volume is greater than 0
    if (newVolume > 0 && isMuted) {
      onMuteToggle(false); // Unmute when volume is above 0
    }
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    onVolumeChange(newVolume);

    // Automatically unmute when the volume is greater than 0
    if (newVolume > 0 && isMuted) {
      onMuteToggle(false); // Unmute when volume is above 0
    } else if (newVolume === 0) {
      onMuteToggle(true); // Mute when volume is 0
    }
  };

  return (
    <div className="group/volume relative flex items-center gap-2">
      <button
        onClick={() => onMuteToggle(!isMuted)}
        className="text-white/90 hover:text-white transition"
      >
        {isMuted ? (
          <VolumeX className="w-6 h-6" />
        ) : (
          <Volume2 className="w-6 h-6" />
        )}
      </button>

      {/* Visual Slider */}
      <div
        className="w-24 h-1.5 bg-gray-600/50 rounded-full hidden group-hover/volume:block cursor-pointer"
        onClick={handleSliderClick}
      >
        <div
          className="h-full bg-white/90 rounded-full"
          style={{ width: `${volume * 100}%` }}
        ></div>
      </div>

      {/* Slider for Volume */}
      <input
        type="range"
        min="0"
        max="1"
        step="0.01"
        value={isMuted ? 0 : volume}
        onChange={handleVolumeChange}
        className="w-24 accent-white"
        aria-label="Volume control"
      />
    </div>
  );
};

export default VolumeControl;
