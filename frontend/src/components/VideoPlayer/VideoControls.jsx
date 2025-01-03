import React, { useState } from "react";
import { Maximize, X, Settings } from "lucide-react";
import TimeDisplay from "./TimeDisplay";
import VolumeControl from "./VolumeControl";
import ProgressBar from "./ProgressBar";
import PlaybackControls from "./PlaybackControls";

const VideoControlsPage = ({
  isPlaying,
  currentTime = 0,
  duration = 0,
  isMuted = false,
  volume = 1,
  currentQuality,
  availableQualities = [],
  title,
  onPlayPause,
  onSkip,
  onMuteToggle,
  onVolumeChange,
  handleChangeQuality,
  onFullscreen,
  onClose,
}) => {
  const [isQualityDropdownOpen, setQualityDropdownOpen] = useState(false);

  const toggleQualityDropdown = () => {
    setQualityDropdownOpen((prev) => !prev);
  };

  const progress = duration ? (currentTime / duration) * 100 : 0;

  // Handle quality change only if the selected quality is different
  const handleQualityChange = (qualityValue) => {
    if (qualityValue !== currentQuality) {
      handleChangeQuality(qualityValue);
      setQualityDropdownOpen(false); // Close dropdown after selection
    }
  };

  return (
    <div className="absolute inset-0 group">
      {/* Top gradient and title */}
      <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/90 via-black/60 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="flex justify-between items-center">
          <h2 className="text-white text-xl font-semibold">{title}</h2>
          <button
            onClick={onClose}
            className="text-white/90 hover:text-white transition"
            aria-label="Close Video Player"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Bottom controls */}
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <ProgressBar
          progress={progress}
          duration={duration}
          currentTime={currentTime}
          onSkip={onSkip}
        />

        {/* Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <PlaybackControls
              isPlaying={isPlaying}
              onPlayPause={onPlayPause}
              onSkip={onSkip}
            />

            <TimeDisplay currentTime={currentTime} duration={duration} />

            {/* Volume Control */}
            <div className="flex items-center gap-2">
              <VolumeControl
                isMuted={isMuted}
                volume={volume}
                onMuteToggle={onMuteToggle}
                onVolumeChange={onVolumeChange}
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Quality Selector */}
            <div className="relative">
              <button
                onClick={toggleQualityDropdown}
                className="text-white/90 hover:text-white transition flex items-center gap-2"
                aria-label="Change Quality"
                aria-expanded={isQualityDropdownOpen ? "true" : "false"}
                aria-controls="quality-dropdown"
              >
                <Settings className="w-6 h-6" />
                <span className="text-sm">{currentQuality}</span>
              </button>
              {isQualityDropdownOpen && (
                <div
                  id="quality-dropdown"
                  className="absolute bottom-full right-0 mb-2 bg-black/95 rounded-lg p-2 min-w-[100px] z-50"
                >
                  {availableQualities.map((quality) => (
                    <button
                      key={quality.value}
                      onClick={() => handleQualityChange(quality.value)}
                      className={`block w-full px-4 py-2 text-sm text-left hover:bg-white/10 rounded ${
                        currentQuality === quality.value
                          ? "text-red-500"
                          : "text-white/90 hover:text-white"
                      }`}
                    >
                      {quality.value}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Fullscreen */}
            <button
              onClick={onFullscreen}
              className="text-white/90 hover:text-white transition"
              aria-label="Fullscreen"
            >
              <Maximize className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoControlsPage;
