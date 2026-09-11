import { useCallback, useEffect, useLayoutEffect, useRef } from "react";

import { LAYER_KEYS, MAP_PRESETS } from "constants/layerConfigs";
import { SCALE_BASE } from "constants/staticConstants";

import type { CanvasCoords } from "../../types/globals.types";
type mapPresets = {
  [key: string]: {
    color: string;
    weight?: number;
    minScale: number;
  };
};

export const useDrawLogic = (
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  pathObjects: Record<string, Path2D> | null,
  transformRef: React.RefObject<CanvasCoords>,
  visibleLayers: Record<string, boolean>,
  layerColors: Record<string, string>
) => {
  const ctxRef = useRef<CanvasRenderingContext2D>(null);
  const offscreenRef = useRef<OffscreenCanvas | null>(null);
  const baseTransformRef = useRef<CanvasCoords | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const latestPropsRef = useRef<any>({});
  latestPropsRef.current = { pathObjects, visibleLayers, layerColors };
  //expensive draw
  const drawFull = useCallback(() => {
    const canvas = canvasRef.current;

    const {
      pathObjects: currentPaths,
      visibleLayers: currentVisible,
      layerColors: currentColors
    } = latestPropsRef.current;

    if (!canvas || !currentPaths) return;

    if (!ctxRef.current) {
      ctxRef.current = canvas.getContext("2d", {
        alpha: 1,
        desynchronized: true
      }) as CanvasRenderingContext2D | null;
    }
    const ctx = ctxRef.current;
    const dpr = window.devicePixelRatio || 1;

    const displayWidth = canvas.clientWidth;
    const displayHeight = canvas.clientHeight;
    canvas.width = Math.round(displayWidth * dpr);
    canvas.height = Math.round(displayHeight * dpr);

    const { scale, x, y } = transformRef.current;
    const multiplier = scale > SCALE_BASE ? 2 : 1;

    const targetWidth = canvas.width * multiplier;
    const targetHeight = canvas.height * multiplier;

    if (
      !offscreenRef.current ||
      offscreenRef.current.width !== targetWidth ||
      offscreenRef.current.height !== targetHeight
    ) {
      offscreenRef.current = new OffscreenCanvas(targetWidth, targetHeight);
    }
    const offscreen = offscreenRef.current;
    const offCtx = offscreen.getContext(
      "2d"
    ) as CanvasRenderingContext2D | null;

    const bgColor =
      currentColors["canvas"] ||
      MAP_PRESETS[0].config.canvas.color ||
      "#fbfffa";

    offCtx?.clearRect(0, 0, targetWidth, targetHeight);
    if (offCtx) {
      offCtx.fillStyle = bgColor;
    }
    offCtx?.fillRect(0, 0, targetWidth, targetHeight);

    const offsetX = multiplier > 1 ? Math.round(canvas.width / 2) : 0;
    const offsetY = multiplier > 1 ? Math.round(canvas.height / 2) : 0;

    offCtx?.save();
    offCtx?.translate(offsetX, offsetY);
    offCtx?.scale(dpr, dpr);
    offCtx?.translate(x, y);
    offCtx?.scale(scale, scale);

    if (currentVisible.water && currentPaths.waterFill) {
      offCtx?.save();
      if (offCtx) {
        offCtx.fillStyle =
          currentColors["water"] || MAP_PRESETS[0].config.water.color;
        offCtx.globalAlpha = 1;
        offCtx.fill(currentPaths.waterFill, "nonzero");
        offCtx.restore();
      }
    }
    if (offCtx) {
      offCtx.lineJoin = "round";
      offCtx.lineCap = "round";
    }
    for (let i = 0; i < LAYER_KEYS.length; i++) {
      const key = LAYER_KEYS[i];
      const config = (MAP_PRESETS[0].config as mapPresets)[key];
      if (!currentVisible[key] || scale <= config.minScale) continue;
      const path = currentPaths[key];
      if (!path) continue;
      if (offCtx) {
        offCtx.strokeStyle = currentColors[key] || config.color;
        offCtx.lineWidth = Math.max(
          config?.weight ? config.weight / scale : 0.25,
          0.25
        );
      }
      offCtx?.stroke(path);
    }

    offCtx?.restore();

    ctx?.clearRect(0, 0, canvas.width, canvas.height);
    ctx?.drawImage(
      offscreen,
      offsetX,
      offsetY,
      canvas.width,
      canvas.height,
      0,
      0,
      canvas.width,
      canvas.height
    );

    baseTransformRef.current = { ...transformRef.current };
  }, [canvasRef, transformRef]);
  //cheap-er draw
  const drawPan = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !offscreenRef.current || !baseTransformRef.current) {
      drawFull();
      return;
    }

    if (!ctxRef.current) {
      ctxRef.current = canvas.getContext("2d", {
        alpha: 1,
        desynchronized: true
      }) as CanvasRenderingContext2D | null;
    }
    const ctx = ctxRef.current;
    const dpr = window.devicePixelRatio || 1;

    const dx = (transformRef.current.x - baseTransformRef.current.x) * dpr;
    const dy = (transformRef.current.y - baseTransformRef.current.y) * dpr;

    const baseScale = baseTransformRef.current.scale;
    const multiplier = baseScale > SCALE_BASE ? 2 : 1;

    const offsetX = multiplier > 1 ? Math.round(canvas.width / 2) : 0;
    const offsetY = multiplier > 1 ? Math.round(canvas.height / 2) : 0;

    const sourceX = Math.round(offsetX - dx);
    const sourceY = Math.round(offsetY - dy);

    const { layerColors: currentColors } = latestPropsRef.current;
    const bgColor =
      currentColors["canvas"] ||
      MAP_PRESETS[0].config.canvas.color ||
      "#fbfffa";
    if (ctx) {
      ctx.fillStyle = bgColor;
    }
    ctx?.fillRect(0, 0, canvas.width, canvas.height);

    ctx?.drawImage(
      offscreenRef.current,
      sourceX,
      sourceY,
      canvas.width,
      canvas.height,
      0,
      0,
      canvas.width,
      canvas.height
    );
  }, [canvasRef, transformRef, drawFull]);

  const drawScene = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    drawPan();
  }, [drawPan]);

  const drawSceneFull = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      drawFull();
    }, 50);
  }, [drawFull]);

  useEffect(() => {
    ctxRef.current = null;
    offscreenRef.current = null;
    baseTransformRef.current = null;
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [canvasRef]);

  useLayoutEffect(() => {
    latestPropsRef.current = { pathObjects, visibleLayers, layerColors };

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    drawFull();
  }, [pathObjects, visibleLayers, layerColors, drawFull]);

  return { drawScene, drawSceneFull };
};
