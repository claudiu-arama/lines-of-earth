import { useEffect } from "react";
import { LAYER_KEYS, LAYER_CONFIG } from "../../constants/layerConfigs.js";

export const useDrawLogic = (canvasRef, pathObjects, transform, visibleLayers, layerColors) => {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !pathObjects) return;

    const canvasContext = canvas.getContext("2d", {
      alpha: 1,
      desynchronized: true
    });

    const dpr = window.devicePixelRatio || 1;
    const displayWidth = canvas.clientWidth;
    const displayHeight = canvas.clientHeight;
    canvas.width = displayWidth * dpr;
    canvas.height = displayHeight * dpr;

    const canvasColor = layerColors['canvas'] || LAYER_CONFIG['canvas'];
    canvasContext.clearRect(0, 0, canvas.width, canvas.height);
    canvasContext.fillStyle = canvasColor || "#fbfffa";
    canvasContext.fillRect(0, 0, canvas.width, canvas.height);

    canvasContext.save();
    canvasContext.scale(dpr, dpr);

    const { scale, x, y } = transform;
    canvasContext.translate(x, y);
    canvasContext.scale(scale, scale);

    if (visibleLayers.water && pathObjects.waterFill) {
      canvasContext.save();
      canvasContext.fillStyle = layerColors['water'] || LAYER_CONFIG.water.color;
      canvasContext.globalAlpha = 1;
      canvasContext.fill(pathObjects.waterFill, "nonzero");
      canvasContext.restore();
    }

    for (let i = 0; i < LAYER_KEYS.length; i++) {
      const key = LAYER_KEYS[i];
      const config = LAYER_CONFIG[key];
      if (!visibleLayers[key] || scale <= config.minScale) continue;

      const path = pathObjects[key];
      if (!path) continue;

      canvasContext.strokeStyle = layerColors[key] || config.color;
      canvasContext.lineWidth = Math.max(config.weight / scale, 0.25);
      canvasContext.lineJoin = "round";
      canvasContext.lineCap = "round";
      canvasContext.stroke(path);
    }

    if (pathObjects.labels) {
      canvasContext.font = `${12 / scale}px Arial`;
      canvasContext.fillStyle = "#666666";
      canvasContext.textAlign = "center";
      pathObjects.labels.forEach(label => {
        canvasContext.fillText(label.text, label.x, label.y);
      });
    }

    canvasContext.restore();
    return () => {
        canvasContext.clearRect(0, 0, canvas.width, canvas.height);
    };
  }, [pathObjects, transform, visibleLayers, layerColors]);
};