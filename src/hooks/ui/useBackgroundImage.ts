import { useEffect } from "react";

export const useBackgroundImage = (
  bgImageRef: React.RefObject<HTMLImageElement | null>,
  setBgImageLoaded: (loaded: boolean) => void,
  placeholderImg: string,
  fallbackImg: string
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
