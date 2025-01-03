import React, { useState, useCallback, useRef } from "react";
import MovieCard from "./MovieCard";
import { SAMPLE_MOVIES } from "@/components/Scroll/Samplemovies";
import { useIntersectionObserver } from "../../hooks/useIntersectionObserver";

const ITEMS_PER_PAGE = 10;

const InfiniteMovieGrid = () => {
  const [items, setItems] = useState(SAMPLE_MOVIES.slice(0, ITEMS_PER_PAGE));
  const [hasMore, setHasMore] = useState(true);
  const [loadingRef, isIntersecting] = useIntersectionObserver({
    threshold: 0.5,
    rootMargin: "100px",
  });

  const currentPage = useRef(1);

  const loadMore = useCallback(() => {
    const nextPage = currentPage.current + 1;
    const start = (nextPage - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;

    // Simulate infinite data by cycling through the sample movies
    const newItems = [...items];
    for (let i = start; i < end; i++) {
      const movie = SAMPLE_MOVIES[i % SAMPLE_MOVIES.length];
      newItems.push({
        ...movie,
        id: `${movie.title}-${i}`, // Ensure unique keys
      });
    }

    setItems(newItems);
    currentPage.current = nextPage;

    // Optional: Set hasMore to false after certain number of items
    if (newItems.length >= 20) {
      setHasMore(false);
    }
  }, [items]);

  React.useEffect(() => {
    if (isIntersecting && hasMore) {
      loadMore();
    }
  }, [isIntersecting, hasMore, loadMore]);

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 p-6">
      {items.map((movie, index) => (
        <MovieCard key={`${movie.title}-${index}`} {...movie} index={index} />
      ))}
      {hasMore && (
        <div ref={loadingRef} className="col-span-full flex justify-center p-4">
          <div className="animate-pulse flex space-x-2">
            <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
            <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
            <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InfiniteMovieGrid;
