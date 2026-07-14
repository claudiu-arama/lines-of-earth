import { useLayoutEffect } from "react";

export const useCenterCanvas = (
  canvasRef,
  lastSizeRef,
  transformRef,
  drawScene,
  showFrame,
  frameOrientation
) => {
  useLayoutEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const frame = requestAnimationFrame(() => {
      const dpr = window.devicePixelRatio || 1;
      const newW = canvas.clientWidth;
      const newH = canvas.clientHeight;
      const { w: oldW, h: oldH } = lastSizeRef.current;

      if (newW === 0 || newH === 0) {
        lastSizeRef.current = { w: newW, h: newH };
        return;
      }

      canvas.width = newW * dpr;
      canvas.height = newH * dpr;

      if (oldW !== 0) {
        const { x, y, scale } = transformRef.current;
        if (scale !== 0) {
          const worldCX = (oldW / 2 - x) / scale;
          const worldCY = (oldH / 2 - y) / scale;

          transformRef.current = {
            scale,
            x: newW / 2 - worldCX * scale,
            y: newH / 2 - worldCY * scale
          };
        }
      }

      lastSizeRef.current = { w: newW, h: newH };

      drawScene.drawSceneFull();
    });

    return () => cancelAnimationFrame(frame);
  }, [showFrame, frameOrientation]);
};
