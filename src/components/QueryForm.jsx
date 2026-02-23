import { useState, useEffect, useRef, useLayoutEffect } from "react";
import "./QueryForm.scss";
import {simplifyPath, projectCoordinateToMeters, debounce} from "./Helpers.jsx";
/**
 * MAIN COMPONENT
 */
export default function App() {
    // -- UI State --
    const [inputValue, setInputValue] = useState("");
    const [suggestions, setSuggestions] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    // -- Data State --
    const [rawRoads, setRawRoads] = useState(null);
    const [pathObjects, setPathObjects] = useState(null); // The cached Path2D objects
    // -- Performance Data --
    const [fetchDuration, setFetchDuration] = useState(null);
    const [renderDuration, setRenderDuration] = useState(null);

    // -- Camera & Interaction --
    const [transform, setTransform] = useState({ scale: 0, x: 0, y: 0 }); 
    const isDragging = useRef(false);
    const lastMousePos = useRef({ x: 0, y: 0 });
    const canvasRef = useRef(null);
    const containerRef = useRef(null);

    //MARK: precalculated paths
    useEffect(() => {
        if (!rawRoads) {
            //early return
            setPathObjects(null);
            return;
        }

        const startTime = performance.now();
        const { roads, bounds } = rawRoads;
        
        const centerLat = (bounds.minLat + bounds.maxLat) / 2;
        const centerLon = (bounds.minLon + bounds.maxLon) / 2;

        // create a Path2D object for main and minor roads to act as buffer
        const mainPaths = new Path2D();
        const minorPaths = new Path2D();
        //process roads
        roads.forEach(road => {
            //project first to meters
            const projectedPoints = road.coordinates.map(p => 
                projectCoordinateToMeters(p[0], p[1], centerLat, centerLon, 10)
            );

            // simplifyt to reduce points and aid CPU - scale 2m
            const simplified = simplifyPath(projectedPoints, 2.0);
            // if not road skip
            if (simplified.length < 2) return;

            const isMain = ["motorway", "trunk", "primary", "secondary"].includes(road.type);
            const targetPath = isMain ? mainPaths : minorPaths;

            targetPath.moveTo(simplified[0][0], simplified[0][1]);
            for (let i = 1; i < simplified.length; i++) {
                targetPath.lineTo(simplified[i][0], simplified[i][1]);
            }
            if (road.isClosed) targetPath.closePath();
        });

        setPathObjects({ mainPaths, minorPaths });
        setRenderDuration((performance.now() - startTime).toFixed(2));

        // Reset camera to center
        if (containerRef.current) {
             const cx = containerRef.current.clientWidth / 2;
             const cy = containerRef.current.clientHeight / 2;
             setTransform({ scale: 0.04, x: cx, y: cy });
        }

    }, [rawRoads]);

    // MARK: Draw/Render Logic
    useEffect(() => {
        const canvas = canvasRef.current;
        //early return
        if (!canvas || !pathObjects) return;

        const canvasContext = canvas.getContext("2d");
        const { width, height } = canvas;

        // clear canvas
        canvasContext.fillStyle = "#fbfffa";
        canvasContext.fillRect(0, 0, width, height);

        // camera transformation
        // push state
        canvasContext.save();
        //move canvas origins
        canvasContext.translate(transform.x, transform.y);
        // scale values
        canvasContext.scale(transform.scale, transform.scale);

        // draw minor roads
        canvasContext.lineWidth = 0.7/ transform.scale;
        if (canvasContext.lineWidth < 0.5) canvasContext.lineWidth = 0.5; //min
        canvasContext.strokeStyle = "#2c2c2c";
        // Only render minor roads when zoomed in
        if (transform.scale > 0.0005) {
            canvasContext.stroke(pathObjects.minorPaths);
        }

        // draw main roads
        canvasContext.lineWidth = 1.7 / transform.scale;
        canvasContext.strokeStyle = "#333";
        canvasContext.stroke(pathObjects.mainPaths);
        canvasContext.restore();

    }, [pathObjects, transform]);

    // MARK: Camera Control
    useEffect(() => {
        const canvas = canvasRef.current;
        //early return
        if (!canvas) return;
        
        const handleMouseDown = (e) => {
            isDragging.current = true;
            lastMousePos.current = { x: e.clientX, y: e.clientY };
            canvas.style.cursor = 'grabbing';
        };
        
        const handleMouseMove = (e) => {
            if (!isDragging.current) return;
            const deltax = e.clientX - lastMousePos.current.x;
            const deltay = e.clientY - lastMousePos.current.y;
            
            setTransform(prev => ({ ...prev, x: prev.x + deltax, y: prev.y + deltay }));
            lastMousePos.current = { x: e.clientX, y: e.clientY };
        };
        
        const handleMouseUp = () => {
            isDragging.current = false;
            canvas.style.cursor = 'grab';
        };
        
        const handleWheel = (e) => {
            e.preventDefault();
            //scroll up is zoom in.
            const factor = Math.pow(1.05, -e.deltaY / 100);
            
            setTransform(prev => {
                const rect = canvas.getBoundingClientRect();
                const mouseX = e.clientX - rect.left;
                const mouseY = e.clientY - rect.top;
                
                const newScale = prev.scale * factor;
                // Zoom at mouse pointer with this
                const newX = mouseX - (mouseX - prev.x) * factor;
                const newY = mouseY - (mouseY - prev.y) * factor;

                return { scale: newScale, x: newX, y: newY };
            });
        };

        canvas.addEventListener('mousedown', handleMouseDown);
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
        // passive in order to do prevent default
        canvas.addEventListener('wheel', handleWheel, { passive: false });
        
        return () => {
            canvas.removeEventListener('mousedown', handleMouseDown);
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
            canvas.removeEventListener('wheel', handleWheel);
        };
    }, []); // listeners attached once on mount

    // MARK: responsive canvas resizer
    useLayoutEffect(() => {
        const update = () => {
            if (containerRef.current && canvasRef.current) {
                canvasRef.current.width = containerRef.current.clientWidth;
                canvasRef.current.height = containerRef.current.clientHeight;
                // Force a re-render
                // perhaps check if a userReducer might help with scaling
                setTransform(that => ({...that}));
            }
        };
        const debouncedUpdate = debounce(update, 100);
        window.addEventListener("resize", debouncedUpdate);
        update();
        return () => window.removeEventListener("resize", debouncedUpdate);
    }, []);

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        if (!inputValue) return;
        setSuggestions([]);
        setError(null);
        setIsLoading(true);

        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(inputValue)}&format=json&limit=5&addressdetails=1&accept-language=en`);
            const data = await response.json();
            if (data.length === 0) throw new Error("No cities found.");
            setSuggestions(data.map(item => ({
                display_name: item.display_name,
                areaId: item.osm_type === "relation" ? parseInt(item.osm_id) + 3600000000 : parseInt(item.osm_id) + 2400000000
            })));
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCitySelect = async (city) => {
        setIsLoading(true);
        setError(null);
        setRawRoads(null); // clear previous map
        
        try {
            const start = performance.now();
            const query = `[timeout:2700][out:json];area(${city.areaId})->.searchArea; (way["highway"](area.searchArea);way["junction"="roundabout"](area.searchArea););out geom;`;
            const response = await fetch(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`);
            const data = await response.json();
            setFetchDuration((performance.now() - start).toFixed(2));
            
            // only parse here
            const responseRoads = data.elements.reduce((acc, el) => {
                if (el.type !== "way" || !el.geometry) return acc;
                // Calculate bounds locally
                el.geometry.forEach(p => {
                   const { lat, lon } = p;
                    if (lat < acc.bounds.minLat) acc.bounds.minLat = lat;
                    if (lat > acc.bounds.maxLat) acc.bounds.maxLat = lat;
                    if (lon < acc.bounds.minLon) acc.bounds.minLon = lon;
                    if (lon > acc.bounds.maxLon) acc.bounds.maxLon = lon;
                });
                acc.roads.push({
                    type: el.tags?.highway || "unclassified",
                    //roundabouts
                    isClosed: el.nodes[0] === el.nodes[el.nodes.length - 1],
                    coordinates: el.geometry.map(p => [p.lat, p.lon])
                });
                return acc;
            }, { roads: [], bounds: { minLat: 90, maxLat: -90, minLon: 180, maxLon: -180 } });

            setRawRoads(responseRoads); // This triggers Step 1 (Processing)
            setSuggestions([]);
        } catch (err) {
            setError(err && err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="page-container" ref={containerRef}>
            {/* UI CODE REMAINS THE SAME AS BEFORE... */}
            <div className="search-overlay">
                <div className="search-card">
                    <h1 className="title">City Frames</h1>
                    
                    <form className="search-form" onSubmit={handleFormSubmit}>
                        <input 
                            type="text" 
                            className="search-input" 
                            placeholder="Enter city name..." 
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            disabled={isLoading}
                        />
                        {isLoading && (
                            <div className="spinner-overlay">
                                <svg className="spinner-svg" viewBox="0 0 50 50">
                                    <circle className="spinner-path" cx="25" cy="25" r="20" fill="none" strokeWidth="5"></circle>
                                </svg>
                            </div>
                        )}
                        <button 
                            type="submit" 
                            className="button submit-button" 
                            disabled={isLoading || !inputValue}
                        >
                            Search
                        </button>
                    </form>

                    {error && <div className="error-message">{error}</div>}

                    <div className="results-container">
                        {suggestions.map((city, i) => (
                            <div key={i} className="suggestion-item" onClick={() => handleCitySelect(city)}>
                                <span className="city-name">{city.display_name.split(',')[0]}</span>
                                <span className="city-meta">{city.display_name}</span>
                            </div>
                        ))}
                    </div>

                    {pathObjects && (
                        <div className="roads-info">
                            <div className="stat-row">
                                <label style={{fontSize: '0.75rem', color: '#666'}}>Roads loaded</label>
                                <span>{rawRoads?.roads.length.toLocaleString()}</span>
                            </div>
                            {renderDuration && (
                                <div className="stat-row">
                                    <label style={{fontSize: '0.75rem', color: '#666'}}>Render duration</label>
                                    <span>{renderDuration}ms</span>
                                </div>
                            )}
                            <div className="stat-row" style={{marginTop: '4px'}}>
                                <label style={{fontSize: '0.75rem', color: '#666'}}>Network fetch duration</label>
                                <span>{fetchDuration}ms</span>
                            </div>
                            <button className="button clear-button" onClick={() => {
                                setRawRoads(null);
                                setPathObjects(null);
                                setInputValue("");
                                setSuggestions([]);
                            }}>
                                Clear Map
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <div id="map-container">
                <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block', cursor: isDragging.current ? 'grabbing' : 'grab' }} />
            </div>
        </div>
    );
}