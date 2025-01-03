import React from "react";

const ProgressBar = ({ progress, duration, currentTime, onSkip }) => (
  <div
    className="w-full h-1.5 bg-gray-600/50 rounded-full mb-4 cursor-pointer group/progress"
    onClick={(e) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const pos = (e.clientX - rect.left) / rect.width;
      if (onSkip) onSkip(pos * duration - currentTime);
    }}
  >
    <div
      className="h-full bg-red-600 rounded-full relative group-hover/progress:bg-red-500"
      style={{ width: `${progress}%` }}
    >
      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-red-600 rounded-full opacity-0 group-hover/progress:opacity-100"></div>
    </div>
  </div>
);

export default ProgressBar;
