import { useState, useEffect } from "react";

export const useLazyImage = (src) => {
  const [imageSrc, setImageSrc] = useState(
    "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"
  );
  const [imageRef, setImageRef] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    let observer;
    let didCancel = false;

    if (imageRef && src) {
      observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            const img = new Image();
            img.src = src;
            img.onload = () => {
              if (!didCancel) {
                setImageSrc(src);
                setIsLoaded(true);
              }
            };
            observer.unobserve(imageRef);
          }
        },
        {
          rootMargin: "50px",
        }
      );
      observer.observe(imageRef);
    }

    return () => {
      didCancel = true;
      if (observer && imageRef) {
        observer.unobserve(imageRef);
      }
    };
  }, [src, imageRef]);

  return [setImageRef, imageSrc, isLoaded];
};
