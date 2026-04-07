import { useState, useEffect, useRef, useLayoutEffect } from "react";
import style from "./App.module.scss";
import { projectCoordinateToMeters } from "../helpers/locationHelpers.js";
import { simplifyPath } from "../helpers/mathHelpers.js";
import { debounce } from "../helpers/utilities.js";
import { useQuery } from "@tanstack/react-query";
import { fetchCitySuggestions } from "../helpers/nominatimService.js";
import { useRoadsData } from "../hooks/data/useRoadsData.js";
import { responseRoads } from "../helpers/formatCityHelper.js";
import { useQueryClient } from "@tanstack/react-query";
import {
    LAYER_KEYS,
    LAYER_CONFIG,
    LAYER_MAPPING,
    FRAME_CONFIG
} from "../constants/layerConfigs.js";
import placeholderImg from "../assets/placeholder.webp";
import fallbackImg from "../assets/fallback.png";
import { BLURRED_PLACEHOLDER } from "../constants/staticConstants.js";
import { MapViewport } from "../components/MapViewport.jsx";
import {arrayofAPIs as api} from "../constants/apis.js";

export default function App() {
    // -- UI State --
    const [inputValue, setInputValue] = useState("");
    const [inputQuery, setInputQuery] = useState("");
    const [queryCity, setQueryCity] = useState(null);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [bgImageLoaded, setBgImageLoaded] = useState(false);
    const [bgImageError, setBgImageError] = useState(false);
    const [showFrame, setShowFrame] = useState(true);
    const [frameOrientation, setFrameOrientation] = useState("portrait");
    // -- Data State --
    const [pathObjects, setPathObjects] = useState(null); // The cached Path2D objects
    const [visibleLayers, setVisibleLayers] = useState({
        express: true,
        arterial: true,
        local: true,
        service: true,
        pedestrian: false,
        nature: true,
        transit: true,
        landmarks: true
    });
    // -- Performance Data --
    const [fetchDuration, setFetchDuration] = useState(null);
    const [renderDuration, setRenderDuration] = useState(null);
    const [currentMirrorIndex, setCurrentMirrorIndex] = useState(0);
    // -- Camera & Interaction --
    const [transform, setTransform] = useState({ scale: 0, x: 0, y: 0 });
    const isDragging = useRef(false);
    const lastMousePos = useRef({ x: 0, y: 0 });
    const canvasRef = useRef(null);
    const containerRef = useRef(null);
    const mapViewportRef = useRef(null);
    const bgImageRef = useRef(null);

    const queryClient = useQueryClient();

    // MARK: Load background image on mount
    useEffect(() => {
        // Create an image element to preload the background
        const img = new Image();
        img.onload = () => {
            setBgImageLoaded(true);
        };
        img.onerror = () => {
            setBgImageError(true);
        };
        // Check if browser supports WebP
        const canvas = document.createElement("canvas");
        const webpSupported =
            canvas.toDataURL("image/webp").indexOf("image/webp") === 5;

        img.src = webpSupported ? placeholderImg : fallbackImg;
        bgImageRef.current = img;
    }, []);

    const getBackgroundImageSource = () => {
        if (bgImageError) return "none";

        const canvas = document.createElement("canvas");
        const webpSupported =
            canvas.toDataURL("image/webp").indexOf("image/webp") === 5;

        return webpSupported ? placeholderImg : fallbackImg;
    };

    // MARK: get roads data - custom roads hook
    const {
        data: processedData,
        isError: isRoadError,
        isFetching: isRoadFetching,
        error: isRoadErrorInfo
    } = useRoadsData(
        queryCity,
        {
            select: responseRoads,
            enabled: !!queryCity,
        },
        setCurrentMirrorIndex,
        setFetchDuration,
    );

    const rafId = useRef(null);

    //MARK: precalculated paths
    useEffect(() => {
        if (!processedData) {
            setPathObjects(null);
            return;
        }

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
            landmarks: new Path2D(),
            express: new Path2D(),
            arterial: new Path2D(),
            local: new Path2D(),
            service: new Path2D(),
            pedestrian: new Path2D(),
            nature: new Path2D(),
            transit: new Path2D(),
        };

        roads.forEach((road) => {
            const projectedPoints = road.coordinates.map((p) =>
                projectCoordinateToMeters(p[0], p[1], centerLat, centerLon, 5),
            );

            const simplified = simplifyPath(projectedPoints, 2.0);
            if (simplified.length < 2) return;

            const type = road.type;
            let targetPath;
            if (LAYER_MAPPING.landmarks.includes(type)) {
                targetPath = pathLayers.landmarks;
             } else if (LAYER_MAPPING.express.includes(type)) {
                targetPath = pathLayers.express;
            } else if (LAYER_MAPPING.arterial.includes(type)) {
                targetPath = pathLayers.arterial;
            } else if (LAYER_MAPPING.local.includes(type)) {
                targetPath = pathLayers.local;
            } else if (LAYER_MAPPING.service.includes(type)) {
                targetPath = pathLayers.service;
            } else if (LAYER_MAPPING.pedestrian.includes(type)) {
                targetPath = pathLayers.pedestrian;
            } else if (LAYER_MAPPING.nature.includes(type)) {
                targetPath = pathLayers.nature;
            } else {
                targetPath = pathLayers.transit;
            }

            targetPath.moveTo(simplified[0][0], simplified[0][1]);
            for (let i = 1; i < simplified.length; i++) {
                targetPath.lineTo(simplified[i][0], simplified[i][1]);
            }
            if (road.isClosed) targetPath.closePath();
        });

        setPathObjects(pathLayers);
        setRenderDuration((performance.now() - startTime).toFixed(2));

        if (containerRef.current) {
            const cx = containerRef.current.clientWidth / 2;
            const cy = containerRef.current.clientHeight / 2;
            setTransform({ scale: calculatedScale, x: cx, y: cy });
        }
    }, [processedData]);

    useEffect(() => {
    const canvas    = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    // Let the browser paint the new layout first, then read actual dimensions
    const frame = requestAnimationFrame(() => {
        const w = canvas.clientWidth;
        const h = canvas.clientHeight;

        if (w === 0 || h === 0) return; // not yet painted

        setTransform((prev) => {
            if (prev.scale === 0) return prev; // no map loaded yet
            const oldW = showFrame ? container.clientWidth  : w;
            const oldH = showFrame ? container.clientHeight : h;
            const newW = showFrame ? w  : container.clientWidth;
            const newH = showFrame ? h  : container.clientHeight;
            const worldCX = (oldW / 2 - prev.x) / prev.scale;
            const worldCY = (oldH / 2 - prev.y) / prev.scale;
            return {
                ...prev,
                x: newW / 2 - worldCX * prev.scale,
                y: newH / 2 - worldCY * prev.scale,
            };
        });

        canvas.width  = w;
        canvas.height = h;
    });

    return () => cancelAnimationFrame(frame);
}, [showFrame, frameOrientation]);


    // MARK: Draw/Render Logic
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || !pathObjects) return;

        const canvasContext = canvas.getContext("2d");
        const dpr = window.devicePixelRatio || 1;
        const { width, height } = canvas;
        const { scale, x, y } = transform;
        canvasContext.clearRect(0, 0, width, height);

        canvasContext.fillStyle = "#fbfffa";
        canvasContext.fillRect(0, 0, width, height);

        canvasContext.save();
        canvasContext.scale(dpr, dpr);
        canvasContext.translate(x, y);
        canvasContext.scale(scale, scale);

        for (let i = 0; i < LAYER_KEYS.length; i++) {
            const key = LAYER_KEYS[i];
            const config = LAYER_CONFIG[key];

            if (!visibleLayers[key] || scale <= config.minScale) continue;

            const path = pathObjects[key];
            if (!path) continue;

            canvasContext.strokeStyle = config.color;
            canvasContext.lineWidth = Math.max(config.weight / scale, 0.25);
            canvasContext.lineJoin = "round";
            canvasContext.lineCap = "round";
            canvasContext.stroke(path);
        }

        canvasContext.restore();
    }, [pathObjects, transform, visibleLayers]);

    // MARK: Camera Control
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const handleMouseDown = (e) => {
            isDragging.current = true;
            lastMousePos.current = { x: e.clientX, y: e.clientY };
            canvas.style.cursor = "grabbing";
        };

        const handleMouseMove = (e) => {
            if (!isDragging.current) return;
            const deltax = e.clientX - lastMousePos.current.x;
            const deltay = e.clientY - lastMousePos.current.y;
            lastMousePos.current = { x: e.clientX, y: e.clientY };

            if (rafId.current) cancelAnimationFrame(rafId.current);
            rafId.current = requestAnimationFrame(() => {
                setTransform((prev) => ({ ...prev, x: prev.x + deltax, y: prev.y + deltay }));
            });
        };

        const handleMouseUp = () => {
            isDragging.current = false;
            canvas.style.cursor = "grab";
        };

        const handleWheel = (e) => {
            e.preventDefault();
            const factor = Math.pow(1.1, -e.deltaY / 50);
            setTransform((prev) => {
                const rect = canvas.getBoundingClientRect();
                const mouseX = e.clientX - rect.left;
                const mouseY = e.clientY - rect.top;
                return {
                    scale: prev.scale * factor,
                    x: mouseX - (mouseX - prev.x) * factor,
                    y: mouseY - (mouseY - prev.y) * factor,
                };
            });
        };

        canvas.addEventListener("mousedown", handleMouseDown);
        window.addEventListener("mousemove", handleMouseMove);
        window.addEventListener("mouseup", handleMouseUp);
        canvas.addEventListener("wheel", handleWheel, { passive: false });

        return () => {
            canvas.removeEventListener("mousedown", handleMouseDown);
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("mouseup", handleMouseUp);
            canvas.removeEventListener("wheel", handleWheel);
        };
    }, []);

    // MARK: responsive canvas resizer
    useLayoutEffect(() => {
        const update = () => {
            const canvas = canvasRef.current;
            const container = containerRef.current;
            if (!canvas) return;
            const w = canvas.clientWidth;
            const h = canvas.clientHeight;
            const rect = container.getBoundingClientRect();
            const dpr = window.devicePixelRatio || 1;

            console.log("canvas sizes", w, h);
            if (w === 0 || h === 0) return;
            canvas.width  = rect.width * dpr;
            canvas.height = rect.height * dpr;
            canvas.style.width = `${rect.width}px`;
            canvas.style.height = `${rect.height}px`;
            setTransform((t) => ({ ...t }));
        };
        const debouncedUpdate = debounce(update, 100);
        window.addEventListener("resize", debouncedUpdate);
        update();
        return () => window.removeEventListener("resize", debouncedUpdate);
    }, []);

    const handleCitySelect = (city) => {
        queryClient.removeQueries({ queryKey: ["roads", city.osm_id ?? null] });
        setPathObjects(null);
        setRenderDuration(null);
        setFetchDuration(null);
        setQueryCity(city);
    };

    const handleOnChange = (e) => {
        setInputValue(e.target.value);
    };

    useEffect(() => {
        let timer = setTimeout(() => {
            setPathObjects(null);
            setInputQuery(inputValue);
        }, 500);
        return () => clearTimeout(timer);
    }, [inputValue]);

    //MARK: get city suggestions
    const {
        data: cityData,
        isError: isCityError,
        isFetching: isCityFetching,
        error,
    } = useQuery({
        queryKey: ["cityQuery", inputQuery],
        queryFn: () => fetchCitySuggestions(inputQuery),
        enabled: inputQuery.length > 2,
        retry: false,
        staleTime: 1000 * 60 * 5,
    });

    const exportToSVG = () => {
        if (!processedData || !processedData.roads.length) return;

        const { roads, bounds } = processedData;
        const centerLat = (bounds.minLat + bounds.maxLat) / 2;
        const centerLon = (bounds.minLon + bounds.maxLon) / 2;

        const PRINT_SCALE = 4;
        const SVG_SIZE    = 2000;

        const MAT = FRAME_CONFIG.mat;
        const INNER_B1 = FRAME_CONFIG.innerBorder1;
        const INNER_GAP = FRAME_CONFIG.innerGap;
        const INNER_B2 = FRAME_CONFIG.innerBorder2;

        const canvas = canvasRef.current;
        const canvasW = canvas?.clientWidth  ?? SVG_SIZE;
        const canvasH = canvas?.clientHeight ?? SVG_SIZE;

        const totalChromePx = MAT + INNER_B1 + INNER_GAP + INNER_B2;

        const exportW = showFrame
            ? (canvasW + totalChromePx * 2) * PRINT_SCALE
            : SVG_SIZE;
        const exportH = showFrame
            ? (canvasH + totalChromePx * 2) * PRINT_SCALE
            : SVG_SIZE;

        // Pixel offset from SVG origin to the canvas area (top-left of roads)
        const canvasOffsetX = showFrame ? totalChromePx * PRINT_SCALE : 0;
        const canvasOffsetY = showFrame ? totalChromePx * PRINT_SCALE : 0;
        const canvasExportW = showFrame ? canvasW * PRINT_SCALE : SVG_SIZE;
        const canvasExportH = showFrame ? canvasH * PRINT_SCALE : SVG_SIZE;

        let projectPoint;

        if (showFrame) {
            const { scale, x, y } = transform;
            projectPoint = (lon, lat) => {
                const [mx, my] = projectCoordinateToMeters(lon, lat, centerLat, centerLon, 5);
                return {
                    x: (mx * scale + x) * PRINT_SCALE + canvasOffsetX,
                    y: (my * scale + y) * PRINT_SCALE + canvasOffsetY,
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
                    [projectCoordinateToMeters(lon, lat, centerLat, centerLon, 5)], 2.0
                );
                if (simplified.length === 0) return { x: 0, y: 0 };
                const [px, py] = simplified[0];
                return { x: px * scale + SVG_SIZE / 2, y: py * scale + SVG_SIZE / 2 };
            };
        }

        const layerBuckets = Object.fromEntries(LAYER_KEYS.map(k => [k, ""]));

        roads.forEach((road) => {
            if (!road.coordinates || road.coordinates.length < 2) return;

            const type = road.type?.toLowerCase() || "";
            let targetKey = "transit";

            if (LAYER_MAPPING.express.includes(type)) targetKey = "express";
            else if (LAYER_MAPPING.landmarks.includes(type)) targetKey = "landmarks";
            else if (LAYER_MAPPING.arterial.includes(type)) targetKey = "arterial";
            else if (LAYER_MAPPING.local.includes(type)) targetKey = "local";
            else if (LAYER_MAPPING.service.includes(type)) targetKey = "service";
            else if (LAYER_MAPPING.pedestrian.includes(type)) targetKey = "pedestrian";
            else if (LAYER_MAPPING.nature.includes(type)) targetKey = "nature";

            if (!visibleLayers[targetKey]) return;

            const pathData = road.coordinates
                .map((p, i) => {
                    const { x, y } = projectPoint(p[0], p[1]);
                    return `${i === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`;
                })
                .join(" ");

            if (pathData) layerBuckets[targetKey] += `<path d="${pathData}" />`;
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
            const s  = PRINT_SCALE;
            const mp = MAT           * s;
            const b2 = INNER_B2      * s;
            const ig = INNER_GAP     * s;
            const b1 = INNER_B1      * s;

            svgString += `<rect
                x="0" y="0"
                width="${exportW}" height="${exportH}"
                fill="#fff"
            />`;

            const ib1x = mp;
            const ib1y = mp;
            const ib1w = exportW - mp * 2;
            const ib1h = exportH - mp * 2;
            svgString += `<rect
                x="${ib1x}" y="${ib1y}"
                width="${ib1w}" height="${ib1h}"
                fill="none" stroke="#fff" stroke-width="${b1 * 2}"
            />`;

            const gapInset = ib1x + b1 + ig;
            const b1Inset = canvasOffsetX - (b2 + ig + b1);
            const b1Size  = canvasExportW + (b2 + ig + b1) * 2;

            const gapInsetV = canvasOffsetX - (b2 + ig);
            const gapSize   = canvasExportW + (b2 + ig) * 2;

            const b2Inset = canvasOffsetX - b2;
            const b2Size  = canvasExportW + b2 * 2;
            const b2InsetY = canvasOffsetY - b2;
            const b2SizeH  = canvasExportH + b2 * 2;

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
                fill="#fbfffa"
            />`;

        } else {
            svgString += `<rect width="${exportW}" height="${exportH}" fill="#fbfffa"/>`;
        }

        LAYER_KEYS.forEach((key) => {
            if (!layerBuckets[key]) return;
            const color = LAYER_CONFIG[key]?.color || "#3d3d3d";
            const strokeWidth = (LAYER_CONFIG[key]?.weight || 0.5) * PRINT_SCALE;

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

    return (
        <div className={style.pageContainer} ref={containerRef}>
            <div className={style.searchOverlay}>
                {isCollapsed ? (
                    <button
                        className={style.collapsedTrigger}
                        onClick={() => setIsCollapsed(false)}
                        aria-label="Expand search UI"
                    >
                        <div className={style.squareIcon} />
                    </button>
                ) : (
                    <div
                        className={style.searchCard}
                        style={{
                            top: pathObjects ? "20px" : "50%",
                            left: pathObjects ? "20px" : "50%",
                            transform: pathObjects ? "none" : "translate(-50%, -50%)",
                            transition: "all 0.5s ease-in-out",
                            zIndex: 20,
                        }}
                    >
                        <button
                            className={style.closeButton}
                            onClick={() => setIsCollapsed(true)}
                            aria-label="Hide search UI"
                        >
                            ✕
                        </button>

                        <h1 className={style.title}>City Frames</h1>

                        <form
                            className={style.searchForm}
                            onSubmit={(e) => e.preventDefault()}
                        >
                            <div className={style.searchWrapper}>
                                <input
                                    type="text"
                                    className={style.searchInput}
                                    placeholder="Enter city name..."
                                    value={inputValue}
                                    onChange={handleOnChange}
                                />
                                {isCityFetching && (
                                    <div className={style.inputLoader}>
                                        <div className={style.spinnerSmall} />
                                    </div>
                                )}
                            </div>
                        </form>

                        {isRoadError && (
                            <div className={style.errorMessage}>
                                {isRoadErrorInfo.message}
                            </div>
                        )}

                        <div className={style.resultsList}>
                            {!pathObjects &&
                                !isRoadFetching &&
                                inputValue.length > 0 &&
                                cityData?.map((city, i) => (
                                    <div
                                        key={i}
                                        className={style.suggestionItem}
                                        onClick={() => handleCitySelect(city)}
                                    >
                                        <span className={style.cityName}>
                                            {city.display_name.split(",")[0]}
                                        </span>
                                        <span className={style.cityMeta}>{city.display_name}</span>
                                        <div className={style.infoPanelSecondary}>
                                            <span className={style.cityType}>{city.type}</span> <br />
                                            <span className={style.cityCoords}>
                                                Lat: {city.lat} / Lon: {city.lon}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                        </div>

                        {pathObjects && (
                            <div className={style.infoPanel}>
                                <div className={style.statsGrid}>
                                    <div className={style.statItem}>
                                        <label>Roads Loaded</label>
                                        <span>{processedData?.roads.length.toLocaleString()}</span>
                                    </div>
                                    {renderDuration && (
                                        <div className={style.statItem}>
                                            <label>Render Time</label>
                                            <span>{renderDuration}ms</span>
                                        </div>
                                    )}
                                    <div className={style.statItem}>
                                        <label>Network</label>
                                        <span>{fetchDuration}ms</span>
                                    </div>
                                </div>

                                <div className={style.layerToggles}>
                                    <p className={style.sectionLabel}>Map Layers</p>
                                    {Object.keys(visibleLayers).map((layer) => (
                                        <label key={layer} className={style.layerLabel}>
                                            <input
                                                type="checkbox"
                                                checked={visibleLayers[layer]}
                                                onChange={() =>
                                                    setVisibleLayers((prev) => ({
                                                        ...prev,
                                                        [layer]: !prev[layer],
                                                    }))
                                                }
                                            />
                                            <span>
                                                {layer.charAt(0).toUpperCase() + layer.slice(1)}
                                            </span>
                                            <div
                                                className={style.colorDot}
                                                style={{ "--layer-color": LAYER_CONFIG[layer]?.color }}
                                            />
                                        </label>
                                    ))}
                                </div>

                                <button
                                    className={style.buttonSecondary}
                                    style={{
                                        background: "#10b981",
                                        color: "white",
                                        marginTop: "8px",
                                    }}
                                    onClick={exportToSVG}
                                >
                                    Download Map
                                </button>

                                <button
                                    className={style.buttonSecondary}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        setQueryCity(null);
                                        setPathObjects(null);
                                        setInputValue("");
                                    }}
                                >
                                    Clear Map
                                </button>
                                <div className={style.frameControls}>
                                    <label className={style.frameToggle}>
                                        <input
                                            type="checkbox"
                                            checked={showFrame}
                                            onChange={() => setShowFrame(!showFrame)}
                                        />
                                        <span>Show Frame</span>
                                    </label>

                                    {showFrame && (
                                        <label className={style.orientationToggle}>
                                            <select
                                                value={frameOrientation}
                                                onChange={(e) => setFrameOrientation(e.target.value)}
                                            >
                                                <option value="portrait">Portrait (50x70)</option>
                                                <option value="landscape">Landscape (70x50)</option>
                                            </select>
                                        </label>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <MapViewport
                canvasRef={canvasRef}
                mapViewportRef={mapViewportRef}
                isRoadFetching={isRoadFetching}
                currentMirrorIndex={currentMirrorIndex}
                apiLength={api.length}
                onCancelFetch={() => {
                    queryClient.cancelQueries({ queryKey: ["roads"] });
                    setQueryCity(null);
                }}
                pathObjects={pathObjects}
                showFrame={showFrame}
                frameOrientation={frameOrientation}
                bgImageLoaded={bgImageLoaded}
                bgImageError={bgImageError}
                bgImageSource={getBackgroundImageSource()}
                blurredPlaceholder={BLURRED_PLACEHOLDER}
            />
        </div>
    );
}
