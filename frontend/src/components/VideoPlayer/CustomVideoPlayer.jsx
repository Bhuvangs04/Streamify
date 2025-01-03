import React, { useRef, useState, useEffect } from "react";
import VideoControls from "./VideoControls";
import Hls from "hls.js"; // Import HLS.js for non-Safari support
import "video.js/dist/video-js.css";

const CustomVideoPlayerPage = ({
  src,
  title,
  currentQuality,
  availableQualities,
  handleChangeQuality,
  onClose,
  handleTimeUpdate,
}) => {
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const hlsRef = useRef(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);

  useEffect(() => {
    const video = videoRef.current;

    if (!video || !src) return;

    setLoading(true);
    video.pause();

    // Cleanup previous HLS instance
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    if (Hls.isSupported()) {
      const hls = new Hls();
      hls.loadSource(src);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setLoading(false);
        video.currentTime = currentTime;
        if (isPlaying) {
          video.play().catch((err) => {
            if (err.name !== "AbortError") {
              console.error("Error resuming video playback:", err);
            }
          });
        }
      });

      hlsRef.current = hls;
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = src;
      video.addEventListener("canplay", () => {
        setLoading(false);
        video.currentTime = currentTime;
        if (isPlaying) {
          video.play().catch((err) => {
            if (err.name !== "AbortError") {
              console.error("Error resuming video playback:", err);
            }
          });
        }
      });
    } else {
      console.error("HLS is not supported in this browser.");
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [src]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateTime = () => {
      setCurrentTime(video.currentTime);
      if (handleTimeUpdate) {
        handleTimeUpdate(video.currentTime);
      }
    };

    const updateDuration = () => setDuration(video.duration);

    const updatePlayingState = () => setIsPlaying(!video.paused);

    video.addEventListener("timeupdate", updateTime);
    video.addEventListener("loadedmetadata", updateDuration);
    video.addEventListener("play", updatePlayingState);
    video.addEventListener("pause", updatePlayingState);

    return () => {
      video.removeEventListener("timeupdate", updateTime);
      video.removeEventListener("loadedmetadata", updateDuration);
      video.removeEventListener("play", updatePlayingState);
      video.removeEventListener("pause", updatePlayingState);
    };
  }, [handleTimeUpdate]);

  const handlePlayPause = () => {
    const video = videoRef.current;
    if (video) {
      if (isPlaying) {
        video.pause();
      } else if (video.paused) {
        video.play().catch((err) => {
          if (err.name !== "AbortError") {
            console.error("Error playing video:", err);
          }
        });
      }
    }
  };

  const handleSkip = (seconds) => {
    const video = videoRef.current;
    if (video) {
      video.currentTime = Math.min(
        Math.max(0, video.currentTime + seconds),
        video.duration
      );
    }
  };

  const handleQualityChange = (newQuality) => {
    const video = videoRef.current;

    if (video) {
      const wasPlaying = !video.paused;
      const currentPlaybackTime = video.currentTime;
      setLoading(true);
      video.pause();

      handleChangeQuality(newQuality, currentPlaybackTime, wasPlaying);
    }
  };

  const handleMuteToggle = () => {
    const video = videoRef.current;
    if (video) {
      video.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleVolumeChange = (newVolume) => {
    const video = videoRef.current;
    if (video) {
      const clampedVolume = Math.max(0, Math.min(1, newVolume));
      video.volume = clampedVolume;
      setVolume(clampedVolume);

      if (clampedVolume === 0) {
        video.muted = true;
        setIsMuted(true);
      } else if (isMuted) {
        video.muted = false;
        setIsMuted(false);
      }
    }
  };

  const handleFullscreen = () => {
    const container = containerRef.current;
    if (container) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else if (container.requestFullscreen) {
        container.requestFullscreen();
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center">
      <div className="relative w-full max-w-7xl mx-auto p-4">
        <div ref={containerRef} className="relative group">
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/75 z-50">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          )}

          <video
            ref={videoRef}
            className="w-full aspect-video rounded-lg"
            playsInline
            controls={false}
          />

          <VideoControls
            isPlaying={isPlaying}
            currentTime={currentTime}
            duration={duration}
            isMuted={isMuted}
            volume={volume}
            currentQuality={currentQuality}
            availableQualities={availableQualities.map((quality, index) => ({
              value:
                typeof quality === "object" ? quality.value || index : quality,
              label: `${quality}p`,
            }))}
            title={title}
            onPlayPause={handlePlayPause}
            onSkip={handleSkip}
            onMuteToggle={handleMuteToggle}
            onVolumeChange={handleVolumeChange}
            onFullscreen={handleFullscreen}
            handleChangeQuality={handleQualityChange}
            onClose={onClose}
          />
        </div>
      </div>
    </div>
  );
};

export default CustomVideoPlayerPage;
