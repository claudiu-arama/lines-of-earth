import { useEffect } from "react";

// TODO: replace `any` with proper types
export const useBackgroundImage = (
  bgImageRef: any,
  setBgImageLoaded: any,
  placeholderImg: any,
  fallbackImg: any
) => {
  useEffect(() => {
    // Create an image element to preload the background
    const img = new Image();
    img.onload = () => {
      setBgImageLoaded(true);
    };
    img.onerror = () => {
      // setBgImageError(true);
    };
    // Check if browser supports WebP
    const canvas = document.createElement("canvas");
    const webpSupported =
      canvas.toDataURL("image/webp").indexOf("image/webp") === 5;

    img.src = webpSupported ? placeholderImg : fallbackImg;
    bgImageRef.current = img;
  }, []);
};
