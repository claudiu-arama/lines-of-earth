import {
  FRAME_CONFIG,
  LAYER_KEYS,
  LAYER_MAPPING_SETS,
  MAP_PRESETS
} from "constants/layerConfigs.js";
import { projectCoordinateToMeters } from "helpers/locationHelpers.js";
import { simplifyPath } from "helpers/mathHelpers.js";

export const exportToSVG = (
  processedData,
  canvasRef,
  showFrame,
  transformRef,
  visibleLayers,
  queryCity,
  frameOrientation,
  layerColors
) => {
  if (!processedData || !processedData.roads.length) return;

  const { roads, bounds } = processedData;
  const centerLat = (bounds.minLat + bounds.maxLat) / 2;
  const centerLon = (bounds.minLon + bounds.maxLon) / 2;

  const PRINT_SCALE = 4;
  const SVG_SIZE = 2000;

  const MAT = FRAME_CONFIG.mat;
  const INNER_B1 = FRAME_CONFIG.innerBorder1;
  const INNER_GAP = FRAME_CONFIG.innerGap;
  const INNER_B2 = FRAME_CONFIG.innerBorder2;

  const canvas = canvasRef.current;
  const canvasW = canvas?.clientWidth ?? SVG_SIZE;
  const canvasH = canvas?.clientHeight ?? SVG_SIZE;

  const totalChromePx = MAT + INNER_B1 + INNER_GAP + INNER_B2;

  const exportW = showFrame
    ? (canvasW + totalChromePx * 2) * PRINT_SCALE
    : SVG_SIZE;
  const exportH = showFrame
    ? (canvasH + totalChromePx * 2) * PRINT_SCALE
    : SVG_SIZE;

  const canvasOffsetX = showFrame ? totalChromePx * PRINT_SCALE : 0;
  const canvasOffsetY = showFrame ? totalChromePx * PRINT_SCALE : 0;
  const canvasExportW = showFrame ? canvasW * PRINT_SCALE : SVG_SIZE;
  const canvasExportH = showFrame ? canvasH * PRINT_SCALE : SVG_SIZE;

  let projectPoint;

  if (showFrame) {
    const { scale, x, y } = transformRef.current;
    projectPoint = (lon, lat) => {
      const [mx, my] = projectCoordinateToMeters(
        lon,
        lat,
        centerLat,
        centerLon,
        5
      );
      return {
        x: (mx * scale + x) * PRINT_SCALE + canvasOffsetX,
        y: (my * scale + y) * PRINT_SCALE + canvasOffsetY
      };
    };
  } else {
    const maxSpanLong = bounds.maxLat - bounds.minLat;
    const maxSpanLat = bounds.maxLon - bounds.minLon;
    const MaxSpan = maxSpanLong > maxSpanLat ? maxSpanLong : maxSpanLat;
    const scaleConstant = 0.0000018;
    const scale = (SVG_SIZE / MaxSpan) * scaleConstant;

    projectPoint = (lon, lat) => {
      const simplified = simplifyPath(
        [projectCoordinateToMeters(lon, lat, centerLat, centerLon, 5)],
        2.0
      );
      if (simplified.length === 0) return { x: 0, y: 0 };
      const [px, py] = simplified[0];
      return { x: px * scale + SVG_SIZE / 2, y: py * scale + SVG_SIZE / 2 };
    };
  }

  const layerBuckets = Object.fromEntries(LAYER_KEYS.map((k) => [k, ""]));
  let waterFillPaths = "";

  roads.forEach((road) => {
    if (!road.coordinates || road.coordinates.length < 2) return;

    const type = road.type?.toLowerCase() || "";
    let targetKey = "miscellaneous";

    if (LAYER_MAPPING_SETS.water.has(type)) targetKey = "water";
    else if (LAYER_MAPPING_SETS.express.has(type)) targetKey = "express";
    else if (LAYER_MAPPING_SETS.landmarks.has(type)) targetKey = "landmarks";
    else if (LAYER_MAPPING_SETS.arterial.has(type)) targetKey = "arterial";
    else if (LAYER_MAPPING_SETS.local.has(type)) targetKey = "local";
    else if (LAYER_MAPPING_SETS.service.has(type)) targetKey = "service";
    else if (LAYER_MAPPING_SETS.pedestrian.has(type)) targetKey = "pedestrian";
    else if (LAYER_MAPPING_SETS.nature.has(type)) targetKey = "nature";
    else if (LAYER_MAPPING_SETS.transportation.has(type))
      targetKey = "transportation";

    if (!visibleLayers[targetKey]) return;

    const pathData = road.coordinates
      .map((p, i) => {
        const { x, y } = projectPoint(p[0], p[1]);
        return `${i === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`;
      })
      .join(" ");

    if (!pathData) return;

    if (targetKey === "water" && road.isClosed) {
      waterFillPaths += `<path d="${pathData} Z" />`;
    }

    layerBuckets[targetKey] += `<path d="${pathData}" />`;
  });

  let svgString = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${exportW} ${exportH}">`;

  svgString += `
            <defs>
                <clipPath id="canvasClip">
                    <rect
                        x="${canvasOffsetX}"
                        y="${canvasOffsetY}"
                        width="${canvasExportW}"
                        height="${canvasExportH}"
                    />
                </clipPath>
            </defs>
        `;

  if (showFrame) {
    const s = PRINT_SCALE;
    const mp = MAT * s;
    const b2 = INNER_B2 * s;
    const ig = INNER_GAP * s;
    const b1 = INNER_B1 * s;

    svgString += `<rect x="0" y="0" width="${exportW}" height="${exportH}" fill="#fff"/>`;

    const ib1x = mp;
    const ib1y = mp;
    const ib1w = exportW - mp * 2;
    const ib1h = exportH - mp * 2;
    svgString += `<rect x="${ib1x}" y="${ib1y}" width="${ib1w}" height="${ib1h}" fill="none" stroke="#fff" stroke-width="${b1 * 2}"/>`;

    svgString += `<rect
                x="${canvasOffsetX - (b2 + ig + b1)}"
                y="${canvasOffsetY - (b2 + ig + b1)}"
                width="${canvasExportW + (b2 + ig + b1) * 2}"
                height="${canvasExportH + (b2 + ig + b1) * 2}"
                fill="none" stroke="#111111" stroke-width="${b1}"
            />`;

    svgString += `<rect
                x="${canvasOffsetX - (b2 + ig)}"
                y="${canvasOffsetY - (b2 + ig)}"
                width="${canvasExportW + (b2 + ig) * 2}"
                height="${canvasExportH + (b2 + ig) * 2}"
                fill="#ffffff"
            />`;

    svgString += `<rect
                x="${canvasOffsetX - b2}"
                y="${canvasOffsetY - b2}"
                width="${canvasExportW + b2 * 2}"
                height="${canvasExportH + b2 * 2}"
                fill="none" stroke="#111111" stroke-width="${b2}"
            />`;

    svgString += `<rect
                x="${canvasOffsetX}" y="${canvasOffsetY}"
                width="${canvasExportW}" height="${canvasExportH}"
                fill="${layerColors["canvas"]}"
            />`;
  } else {
    svgString += `<rect width="${exportW}" height="${exportH}" fill="${layerColors["canvas"]}"/>`;
  }

  if (waterFillPaths && visibleLayers.water) {
    const waterColor = layerColors["water"] || MAP_PRESETS.water.color;
    svgString += `<g
                id="layer-water-fill"
                clip-path="url(#canvasClip)"
                fill="${waterColor}"
                fill-opacity="0.6"
                stroke="none"
            >`;
    svgString += waterFillPaths;
    svgString += `</g>`;
  }

  LAYER_KEYS.forEach((key) => {
    if (!layerBuckets[key]) return;
    const color = layerColors[key] || MAP_PRESETS[key]?.color || "#3d3d3d";
    const strokeWidth = (MAP_PRESETS[key]?.weight || 0.5) * PRINT_SCALE;

    svgString += `<g
                id="layer-${key}"
                clip-path="url(#canvasClip)"
                fill="none"
                stroke="${color}"
                stroke-width="${strokeWidth}"
                stroke-linecap="round"
                stroke-linejoin="round"
            >`;
    svgString += layerBuckets[key];
    svgString += `</g>`;
  });

  svgString += `</svg>`;

  const cityName = queryCity.display_name.split(",")[0].toLowerCase();
  const suffix = showFrame ? `-framed-${frameOrientation}` : "";
  const blob = new Blob([svgString], { type: "image/svg+xml" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `city-frame-${cityName}${suffix}.svg`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
