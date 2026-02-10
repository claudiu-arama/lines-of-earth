import { useState, useEffect, useRef, useLayoutEffect } from "react";
import "./QueryForm.scss";
import {simplifyDP, project, debounce} from "./Helpers";

const ROAD_QUERIES = {
    BASIC:
        'way[highway~"^(motorway|primary|secondary|tertiary)|residential"]',
    STRICT:
        'way[highway~"^(((motorway|trunk|primary|secondary|tertiary)(_link)?)|unclassified|residential|living_street|pedestrian|service|track)$"][area!=yes]',
};

function QueryForm() {
    // -- UI State --
    const [inputValue, setInputValue] = useState("");
    const [suggestions, setSuggestions] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    // -- Data State --
    const [roads, setRoadsNetwork] = useState(null);

    // -- Performance & Interactive State --
    const [renderDuration, setRenderDuration] = useState(null);
    const [visibleCount, setVisibleCount] = useState(0);
    const [startTime, setStartTime] = useState(null);
    const [isMoving, setIsMoving] = useState(false);

    // -- Camera (Transformation) State --
    const [transform, setTransform] = useState({ scale: 1, x: 0, y: 0 });
    
    // -- Interaction Refs --
    const isDragging = useRef(false);
    const lastMousePos = useRef({ x: 0, y: 0 });
    const canvasRef = useRef(null);
    const containerRef = useRef(null);
    const moveTimeout = useRef(null);

    // MARK: handleInputChange
    const handleInputChange = (event) => {
        const inputData = event.target.value;
        if (inputData.includes(">") || inputData.includes("<")) {
            setError("Use of the special characters is not permitted.");
            return;
        }
        setInputValue(inputData);
    };

    // Helper to manage "Moving" state
    const startMoving = () => {
        setIsMoving(true);
        if (moveTimeout.current) clearTimeout(moveTimeout.current);
        moveTimeout.current = setTimeout(() => setIsMoving(false), 150);
    };

    // MARK: panning
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const handleMouseDown = (e) => {
            isDragging.current = true;
            lastMousePos.current = { x: e.clientX, y: e.clientY };
        };

        const handleMouseMove = (e) => {
            if (!isDragging.current) return;
            const dx = e.clientX - lastMousePos.current.x;
            const dy = e.clientY - lastMousePos.current.y;

            startMoving();
            setTransform(prev => ({
                ...prev,
                x: prev.x + dx,
                y: prev.y + dy
            }));
            lastMousePos.current = { x: e.clientX, y: e.clientY };
        };

        const handleMouseUp = () => { isDragging.current = false; };

        canvas.addEventListener('mousedown', handleMouseDown);
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
        return () => {
            canvas.removeEventListener('mousedown', handleMouseDown);
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [roads]);

    // MARK: zooming
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const handleWheel = (e) => {
            e.preventDefault();
            //use this factor to normalize values for each (trackpad, mouse, etc.)
            const factor = Math.pow(1.1, -e.deltaY / 100);

            startMoving();
            setTransform(prev => {
                //set min and max zoom levels
                const newScale = Math.min(Math.max(prev.scale * factor, 1.0), 10);
                const rect = canvas.getBoundingClientRect();
                //get mouse position relative to canvas bounds
                const mouseX = e.clientX - rect.left;
                const mouseY = e.clientY - rect.top;
                //get the actual percentage change of the zoom
                const actualFactor = newScale / prev.scale;

                return {
                    scale: newScale,
                    //keep the map "scaling" under the cursor
                    x: mouseX - (mouseX - prev.x) * actualFactor,
                    y: mouseY - (mouseY - prev.y) * actualFactor
                };
            });
        };

        canvas.addEventListener('wheel', handleWheel, { passive: false });
        return () => canvas.removeEventListener('wheel', handleWheel);
    }, [roads]);

    // MARK: draw
    useEffect(() => {
        if (!roads || !canvasRef.current || !roads.bounds) return;
        
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        const { width, height } = canvas;

        // Clear background
        ctx.fillStyle = "#fcf2c5";
        ctx.fillRect(0, 0, width, height);

        // Viewport bounds in world (pixel) space - draw only what is visible
        const viewPointX1 = -transform.x / transform.scale;
        const viewPointY1 = -transform.y / transform.scale;
        const viewPointX2 = (width - transform.x) / transform.scale;
        const viewPointY2 = (height - transform.y) / transform.scale;

        ctx.save();
        ctx.translate(transform.x, transform.y);
        ctx.scale(transform.scale, transform.scale);

        let drawnCount = 0;
        
        // Dynamic delta: Increase simplification while moving for FPS but still maitains sharpness
        const currentDelta = (isMoving ? 1.2 : 0.5) / transform.scale;

        roads.roads.forEach(road => {
            const pixelPoints = project(road.coordinates, roads.bounds, width, height);
            
            // process only visible nodes
            let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
            for (let i = 0; i < pixelPoints.length; i++) {
                const p = pixelPoints[i];
                if (p[0] < minX) minX = p[0];
                if (p[0] > maxX) maxX = p[0];
                if (p[1] < minY) minY = p[1];
                if (p[1] > maxY) maxY = p[1];
            }

            if (maxX < viewPointX1 || minX > viewPointX2 || maxY < viewPointY1 || minY > viewPointY2) return;

            drawnCount++;
            const simplified = simplifyDP(pixelPoints, currentDelta);

            ctx.beginPath();
            ctx.moveTo(simplified[0][0], simplified[0][1]);
            for (let i = 1; i < simplified.length; i++) {
                ctx.lineTo(simplified[i][0], simplified[i][1]);
            }

            const isMain = ["motorway", "trunk", "primary", "secondary"].includes(road.type);
            
            // Visual styles
            ctx.strokeStyle = isMain ? "#070a09" : "#222423";
            ctx.lineWidth = (isMain ? 1.5 : 0.6) / transform.scale;
            ctx.globalAlpha = isMain ? 0.9 : 0.45;
            ctx.stroke();
        });

        ctx.restore();
        setVisibleCount(drawnCount);

        if (startTime) {
            setRenderDuration((performance.now() - startTime).toFixed(2));
            setStartTime(null); 
        }
    }, [roads, transform, isMoving, startTime]);

    // Resize logic
    useLayoutEffect(() => {
        const update = () => {
            if (containerRef.current && canvasRef.current) {
                canvasRef.current.width = containerRef.current.clientWidth;
                canvasRef.current.height = containerRef.current.clientHeight;
                if (roads) setTransform(prev => ({...prev}));
            }
        };
        window.addEventListener("resize", debounce(update, 90));
        update();
        return () => window.removeEventListener("resize", update);
    }, [roads]);

    const handleFormSubmit = async (event) => {
        event.preventDefault();
        setSuggestions([]);
        setError(null);
        setIsLoading(true);
        setRoadsNetwork(null);

        if (!inputValue) {
            setError("No valid input to query");
            setIsLoading(false);
            return;
        }

        const params = new URLSearchParams({
            q: inputValue,
            format: "json",
            limit: "5",
            polygon_geojson: "1",
            "accept-language": "en",
        });

        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/search?${params.toString()}`);
            if (!response.ok) throw new Error("Search failed.");
            const data = await response.json();
            setSuggestions(data.map((item) => ({
                display_name: item.display_name,
                type: item.type,
                osm_id: item.osm_id,
                areaId: item.osm_type === "relation" ? parseInt(item.osm_id) + 3600000000 : null,
            })));
        } catch (error) {
            setError(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCitySelect = async (city) => {
        if (!city.areaId) {
            setError("No valid city selected");
            return;
        }

        setIsLoading(true);
        setError(null);

        const overpassQuery = `[out:json][timeout:90];area(${city.areaId})->.searchArea;(${ROAD_QUERIES.STRICT}(area.searchArea););out geom;`;

        try {
            const response = await fetch(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(overpassQuery)}`);
            if (!response.ok) throw new Error("Map data fetch failed. Try again or give it a minute.");
            
            setStartTime(performance.now());
            setRenderDuration(null);

            const data = await response.json();
            if (!data.elements?.length) throw new Error("No map data found. Try again!");

            const responseRoads = data.elements.reduce((acc, el) => {
                if (el.type !== "way" || !el.geometry) return acc;
                if (el.bounds) {
                    acc.bounds.minLat = Math.min(acc.bounds.minLat, el.bounds.minlat);
                    acc.bounds.maxLat = Math.max(acc.bounds.maxLat, el.bounds.maxlat);
                    acc.bounds.minLon = Math.min(acc.bounds.minLon, el.bounds.minlon);
                    acc.bounds.maxLon = Math.max(acc.bounds.maxLon, el.bounds.maxlon);
                }
                acc.roads.push({
                    type: el.tags?.highway || "unclassified",
                    coordinates: el.geometry.map(p => [p.lat, p.lon])
                });
                return acc;
            }, { roads: [], bounds: { minLat: 90, maxLat: -90, minLon: 180, maxLon: -180 } });

            setTransform({ scale: 1, x: 0, y: 0 });
            setRoadsNetwork(responseRoads);
        } catch (error) {
            setError(error.message);
            setStartTime(null);
        } finally {
            setIsLoading(false);
        }
    };
    return (
        <div className="page-container" ref={containerRef}>
            <div className="search-overlay">
                <div className="search-card">
                    <h1 className="title">City Frames</h1>

                    <form onSubmit={handleFormSubmit} className="search-form">
                        <input
                            type="text"
                            className="search-input"
                            value={inputValue}
                            placeholder="Search city..."
                            onChange={handleInputChange}
                            disabled={isLoading}
                        />
                        <button
                            type="submit"
                            className="button submit-button"
                            disabled={isLoading}
                        >
                            {isLoading ? "Getting city data.." : "Find City"}
                            {isLoading && (
                                <svg className="spinner" width="24" height="24" viewBox="0 0 24 24">
                                    <circle className="path" cx="12" cy="12" r="8" fill="none" strokeWidth="3"></circle>
                                </svg>
                            )}
                        </button>
                    </form>

                    {error && (
                        <div className="error-message">✕ {error}</div>
                    )}

                    <div className="results-container">
                        {!roads && suggestions.map((city) => (
                            <button
                                key={city.osm_id}
                                className="suggestion-item"
                                onClick={() => handleCitySelect(city)}
                            >
                                <span className="city-name">{city.display_name}</span>
                                <span className="city-meta">{city.type}</span>
                            </button>
                        ))}
                    </div>

                    {roads && (
                        <div className="roads-info">
                            <div className="stat-row">
                                <span>{roads.roads.length.toLocaleString()} segments</span>
                                <span>{visibleCount.toLocaleString()} visible</span>
                                {renderDuration && (
                                    <span className="perf-tag">Processed in : {renderDuration}ms</span>
                                )}
                            </div>
                            <button className="button reset-button"
                                onClick={() => {
                                    setRoadsNetwork(null);
                                    setSuggestions([]);
                                    setRenderDuration(null);
                                    setError()
                                }}
                            >
                                Reset View
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <canvas id="map-container" ref={canvasRef}></canvas>
        </div>
    );
}

export default QueryForm;
