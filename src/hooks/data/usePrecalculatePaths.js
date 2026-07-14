import { useEffect } from "react";

import { LAYER_MAPPING_SETS } from "constants/layerConfigs";
import { projectCoordinateToMeters } from "helpers/locationHelpers";
import { simplifyPath } from "helpers/mathHelpers";

//debug
const pathLayerRegistry = new FinalizationRegistry((label) => {
  console.log(
    `%c[GC] pathLayers for "${label}" was collected`,
    "color: green; font-weight: bold"
  );
});

export function usePrecalculatePaths(
  processedData,
  containerRef,
  setPathObjects,
  transformRef,
  drawScene,
  setRenderDuration
) {
  useEffect(() => {
    if (!processedData) {
      setPathObjects(null);
      return;
    }
    let cancelled = false;
    const startTime = performance.now();
    const { roads, bounds } = processedData;
    const { clientWidth: width } = containerRef.current;

    const maxSpanLong = bounds.maxLat - bounds.minLat;
    const maxSpanLat = bounds.maxLon - bounds.minLon;
    const MaxSpan = maxSpanLong > maxSpanLat ? maxSpanLong : maxSpanLat;
    const scaleConstant = 0.0000018;
    const calculatedScale = (width / MaxSpan) * scaleConstant;
    const centerLat = (bounds.minLat + bounds.maxLat) / 2;
    const centerLon = (bounds.minLon + bounds.maxLon) / 2;

    const pathLayers = {
      waterFill: new Path2D(),
      water: new Path2D(),
      landmarks: new Path2D(),
      express: new Path2D(),
      arterial: new Path2D(),
      local: new Path2D(),
      service: new Path2D(),
      pedestrian: new Path2D(),
      nature: new Path2D(),
      transportation: new Path2D(),
      miscellaneous: new Path2D()
    };

    roads.forEach((road) => {
      if (cancelled) return;
      const projectedPoints = road.coordinates.map((p) =>
        projectCoordinateToMeters(p[0], p[1], centerLat, centerLon, 5)
      );
      const simplified = simplifyPath(projectedPoints, 2.0);
      if (simplified.length < 2) return;

      const type = road.type;
      let targetPath;

      if (LAYER_MAPPING_SETS.water.has(type)) {
        targetPath = pathLayers.water;
        if (road.isClosed) {
          pathLayers.waterFill.moveTo(simplified[0][0], simplified[0][1]);
          for (let i = 1; i < simplified.length; i++) {
            pathLayers.waterFill.lineTo(simplified[i][0], simplified[i][1]);
          }
          pathLayers.waterFill.closePath();
        }
      } else if (LAYER_MAPPING_SETS.landmarks.has(type)) {
        targetPath = pathLayers.landmarks;
      } else if (LAYER_MAPPING_SETS.express.has(type)) {
        targetPath = pathLayers.express;
      } else if (LAYER_MAPPING_SETS.arterial.has(type)) {
        targetPath = pathLayers.arterial;
      } else if (LAYER_MAPPING_SETS.local.has(type)) {
        targetPath = pathLayers.local;
      } else if (LAYER_MAPPING_SETS.service.has(type)) {
        targetPath = pathLayers.service;
      } else if (LAYER_MAPPING_SETS.pedestrian.has(type)) {
        targetPath = pathLayers.pedestrian;
      } else if (LAYER_MAPPING_SETS.nature.has(type)) {
        targetPath = pathLayers.nature;
      } else if (LAYER_MAPPING_SETS.transportation.has(type)) {
        targetPath = pathLayers.transportation;
      } else {
        targetPath = pathLayers.miscellaneous;
      }

      targetPath.moveTo(simplified[0][0], simplified[0][1]);
      for (let i = 1; i < simplified.length; i++) {
        targetPath.lineTo(simplified[i][0], simplified[i][1]);
      }
      if (road.isClosed) targetPath.closePath();
    });

    if (!cancelled) {
      setPathObjects(pathLayers);
      setRenderDuration((performance.now() - startTime).toFixed(2));
      //debug
      const label = `city-${Date.now()}`;
      window.__cityRefs = window.__cityRefs || {};
      window.__cityRefs[label] = new WeakRef(pathLayers);
      console.log(`Registered pathLayers as "${label}"`);
      if (containerRef.current) {
        const cx = containerRef.current.clientWidth / 2;
        const cy = containerRef.current.clientHeight / 2;
        transformRef.current = { scale: calculatedScale, x: cx, y: cy };
        drawScene.drawScene();
      }
    }

    return () => {
      cancelled = true;
    };
  }, [processedData]);
}
