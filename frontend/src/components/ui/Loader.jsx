import React from "react";

const Loader = () => (
  <div className="loader-container">
    <video
      src="/public/Loaders/Loader1.webm"
      autoPlay
      loop
      muted
      className="loader-video" // Applying a class for styling
    />
  </div>
);

export default Loader;
