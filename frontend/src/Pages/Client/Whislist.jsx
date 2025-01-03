import React, { useState, useEffect, useRef } from "react";
import Hls from "hls.js"; // Import the hls.js library
import { MovieCard } from "./Moviecard2"; // Import the MovieCard component
import axios from "axios";
import NavbarPage from "./NavBar";

export default function WishlistPage() {
  const [wishlistMovies, setWishlistMovies] = useState([]);
  const [selectedMovie, setSelectedMovie] = useState(null); // Movie to play
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [removingMovies, setRemovingMovies] = useState([]); // Track movies being removed
  const [availableQualities, setAvailableQualities] = useState([]); // Quality options
  const [currentQuality, setCurrentQuality] = useState(null); // Current quality
  const videoRef = useRef(null);
  const hlsRef = useRef(null); // Ref to manage the HLS instance

  // Fetch wishlist movies
  useEffect(() => {
    const fetchWishlistMovies = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          "http://localhost:8081/api/user/get-movies-wishlist",
          { withCredentials: true }
        );

        const movies = Array.isArray(response.data?.movies)
          ? response.data.movies
          : [];

        // Map movies only if valid
        const moviesWithResolutions = movies.map((movie) => ({
          id: movie._id,
          title: movie.title,
          description: movie.description,
          genre: movie.genre,
          resolutions: movie.resolutions || [], // Ensure resolutions is defined
          poster: movie.poster?.url || "", // Handle missing poster
          videoUrl: movie.videoUrl || "", // Assuming the movie object has a videoUrl field
        }));

        setWishlistMovies(moviesWithResolutions);
      } catch (err) {
        setError(
          err.response?.data?.message || err.message || "An error occurred."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchWishlistMovies();
  }, []);

  // Handle movie play button click
  const handlePlayMovie = (movie) => {
    setSelectedMovie(movie);
    setAvailableQualities(movie.resolutions);
    setCurrentQuality(movie.resolutions[0]?.quality || null);

    // Initialize HLS.js and start video streaming
    if (Hls.isSupported() && videoRef.current) {
      const hls = new Hls();
      hls.loadSource(movie.videoUrl); // Load the video URL (HLS stream)
      hls.attachMedia(videoRef.current);
      hlsRef.current = hls; // Store the instance for cleanup later
    } else if (videoRef.current.canPlayType("application/vnd.apple.mpegurl")) {
      // Fallback for browsers like Safari
      videoRef.current.src = movie.videoUrl;
    }
  };

  // Handle wishlist removal
  const handleRemoveFromWishlist = async (movieId) => {
    try {
      setRemovingMovies((prev) => [...prev, movieId]); // Track the movie being removed
      await axios.delete(`http://localhost:8081/api/user/${movieId}/wishlist`, {
        withCredentials: true,
      });

      setWishlistMovies((prevMovies) =>
        prevMovies.filter((movie) => movie.id !== movieId)
      );

      // If the movie is the one currently being played, stop the HLS instance
      if (selectedMovie && selectedMovie.id === movieId && hlsRef.current) {
        hlsRef.current.destroy(); // Cleanup the HLS instance
        setSelectedMovie(null); // Reset the currently playing movie
      }
    } catch (error) {
      console.error("Error removing from wishlist:", error);
      alert("Failed to remove from wishlist. Please try again.");
    } finally {
      setRemovingMovies((prev) => prev.filter((id) => id !== movieId)); // Stop tracking the movie
    }
  };

  if (loading) return <div>Loading wishlist...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <NavbarPage />
      {wishlistMovies.length === 0 ? (
        <div className="text-center text-gray-500">
          <h2>You haven't added any movies to your wishlist yet.</h2>
        </div>
      ) : (
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {wishlistMovies.map((movie) => (
            <div key={movie.id} className="relative">
              <MovieCard
                key={movie.id}
                movie={movie}
                onPlay={handlePlayMovie}
                onRemove={(id) =>
                  setWishlistMovies((prev) => prev.filter((m) => m.id !== id))
                }
              />
            </div>
          ))}
        </div>
      )}

      {selectedMovie && (
        <div className="mt-8">
          <h2>Now Playing: {selectedMovie.title}</h2>
          <video
            ref={videoRef}
            controls
            style={{ width: "100%", maxHeight: "500px" }}
          >
            Your browser does not support the video tag.
          </video>

          <div style={{ marginTop: "10px" }}>
            <h4>Change Quality</h4>
            {availableQualities.map((quality) => (
              <button
                key={quality.quality}
                onClick={() => setCurrentQuality(quality.quality)}
                style={{
                  padding: "10px",
                  marginRight: "10px",
                  background:
                    currentQuality === quality.quality ? "blue" : "gray",
                  color: "white",
                  border: "none",
                  borderRadius: "5px",
                  cursor: "pointer",
                }}
              >
                {quality.quality}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
