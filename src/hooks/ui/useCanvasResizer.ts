import { useLayoutEffect } from "react";

// TODO: replace `any` with proper types
export const useCanvasResizer = (canvasRef: any, drawScene: any) => {
  useLayoutEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const update = () => {
      const dpr = window.devicePixelRatio || 1;
      const currentLayoutW = canvas.clientWidth;
      const currentLayoutH = canvas.clientHeight;

      if (currentLayoutW === 0 || currentLayoutH === 0) return;
      if (
        canvas.width === currentLayoutW * dpr &&
        canvas.height === currentLayoutH * dpr
      ) {
        return;
      }

      canvas.width = currentLayoutW * dpr;
      canvas.height = currentLayoutH * dpr;
      drawScene.drawSceneFull();
    };

    const observer = new ResizeObserver(update);
    observer.observe(canvas);

    update();

    return () => observer.disconnect();
  }, [drawScene]);
};
