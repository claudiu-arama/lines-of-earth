import { useEffect, useRef } from "react";

import { LAYER_KEYS, MAP_PRESETS } from "constants/layerConfigs";
import { SCALE_BASE } from "constants/staticConstants";

// TODO: replace `any` with proper types
export const useDrawLogic = (
  canvasRef: any,
  pathObjects: any,
  transformRef: any,
  visibleLayers: any,
  layerColors: any
) => {
  const ctxRef = useRef<any>(null);
  const offscreenRef = useRef<any>(null);
  const baseTransformRef = useRef<any>(null);
  const timeoutRef = useRef<any>(null);

  const latestPropsRef = useRef<any>({});
  latestPropsRef.current = { pathObjects, visibleLayers, layerColors };
  //expensive draw
  const drawFull = () => {
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
      });
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
    const offCtx = offscreen.getContext("2d");

    const bgColor =
      currentColors["canvas"] ||
      MAP_PRESETS["ink-on-paper"].config.canvas.color ||
      "#fbfffa";

    offCtx.clearRect(0, 0, targetWidth, targetHeight);
    offCtx.fillStyle = bgColor;
    offCtx.fillRect(0, 0, targetWidth, targetHeight);

    const offsetX = multiplier > 1 ? Math.round(canvas.width / 2) : 0;
    const offsetY = multiplier > 1 ? Math.round(canvas.height / 2) : 0;

    offCtx.save();
    offCtx.translate(offsetX, offsetY);
    offCtx.scale(dpr, dpr);
    offCtx.translate(x, y);
    offCtx.scale(scale, scale);

    if (currentVisible.water && currentPaths.waterFill) {
      offCtx.save();
      offCtx.fillStyle =
        currentColors["water"] ||
        MAP_PRESETS["ink-on-paper"].config.water.color;
      offCtx.globalAlpha = 1;
      offCtx.fill(currentPaths.waterFill, "nonzero");
      offCtx.restore();
    }
    offCtx.lineJoin = "round";
    offCtx.lineCap = "round";

    for (let i = 0; i < LAYER_KEYS.length; i++) {
      const key = LAYER_KEYS[i];
      // TODO: replace `any` with proper types
      const config = (MAP_PRESETS["ink-on-paper"].config as any)[key];
      if (!currentVisible[key] || scale <= config.minScale) continue;
      const path = currentPaths[key];
      if (!path) continue;
      offCtx.strokeStyle = currentColors[key] || config.color;
      offCtx.lineWidth = Math.max(config.weight / scale, 0.25);
      offCtx.stroke(path);
    }

    if (currentPaths.labels) {
      offCtx.font = `${12 / scale}px Arial`;
      offCtx.fillStyle = "#666666";
      offCtx.textAlign = "center";
      // TODO: replace `any` with proper types
      currentPaths.labels.forEach((label: any) => {
        offCtx.fillText(label.text, label.x, label.y);
      });
    }

    offCtx.restore();

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(
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
  };
  //cheap-er draw
  const drawPan = () => {
    const canvas = canvasRef.current;
    if (!canvas || !offscreenRef.current || !baseTransformRef.current) {
      drawFull();
      return;
    }

    if (!ctxRef.current) {
      ctxRef.current = canvas.getContext("2d", {
        alpha: 1,
        desynchronized: true
      });
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
      MAP_PRESETS["ink-on-paper"].config.canvas.color ||
      "#fbfffa";
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.drawImage(
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
  };

  const drawScene = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    drawPan();
  };

  const drawSceneFull = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      drawFull();
    }, 50);
  };

  useEffect(() => {
    ctxRef.current = null;
    offscreenRef.current = null;
    baseTransformRef.current = null;
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [canvasRef]);

  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    drawFull();
  }, [pathObjects, visibleLayers, layerColors]);

  return { drawScene, drawSceneFull };
};
