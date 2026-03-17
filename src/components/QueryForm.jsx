import { useState, useEffect, useRef, useLayoutEffect } from "react";
import style from  "./App.module.scss";
import { projectCoordinateToMeters } from "../helpers/locationHelpers.js";
import { simplifyPath } from "../helpers/mathHelpers.js"
import { debounce} from "../helpers/utilities.js";
import { useQuery } from "@tanstack/react-query";
import { fetchCitySuggestions } from "../helpers/nominatimService.js";
import { useRoadsData } from "../hooks/data/useRoadsData.js"
import { responseRoads } from "../helpers/formatCityHelper.js";
import { useQueryClient } from "@tanstack/react-query";
import { LAYER_KEYS, LAYER_CONFIG } from "../constants/layerConfigs.js";
/**
 * MAIN COMPONENT
 */
export default function App() {
    // -- UI State --
    const [inputValue, setInputValue] = useState("");
    const [inputQuery, setInputQuery] = useState("");
    const [queryCity, setQueryCity] = useState(null);
    const [isCollapsed, setIsCollapsed] = useState(false);

    // -- Data State --
    const [pathObjects, setPathObjects] = useState(null); // The cached Path2D objects
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

    const [visibleLayers, setVisibleLayers] = useState({
        express: true,
        arterial: true,
        local: true,
        service: false,
        pedestrian: false,
        nature: false,
        transit: true
    });

    const queryClient = useQueryClient();

    // MARK: get roads data - custom roads hook
    const { data: processedData, isError: isRoadError, isFetching: isRoadFetching } = useRoadsData(queryCity, {
        select: responseRoads,
        enabled: !!queryCity
    }, setCurrentMirrorIndex, setFetchDuration);

    const rafId = useRef(null);

    //MARK: precalculated paths
    useEffect(() => {
        if (!processedData) {
            //early return
            setPathObjects(null);
            return;
        }
        const startTime = performance.now();
        const { roads, bounds } = processedData;
        const { clientWidth:width, clientHeight:height } = containerRef.current;

        const maxSpanLong = bounds.maxLat - bounds.minLat;
        const maxSpanLat = bounds.maxLon - bounds.minLon;
        const MaxSpan = maxSpanLong > maxSpanLat ? maxSpanLong : maxSpanLat;

        const scaleConstant = 0.0000018;
        const calculatedScale = (width / MaxSpan) * scaleConstant;
    
        const centerLat = (bounds.minLat + bounds.maxLat) / 2;
        const centerLon = (bounds.minLon + bounds.maxLon) / 2;
        
        // create a Path2D object for main and minor roads to act as buffer
        const pathLayers = {
            express: new Path2D(),
            arterial: new Path2D(),
            local: new Path2D(),
            service: new Path2D(),
            pedestrian: new Path2D(),
            nature: new Path2D(),
            transit: new Path2D()
        };
        let roadTypes = {};
        //process roads
        roads.forEach(road => {
            //project first to meters
            const projectedPoints = road.coordinates.map(p => 
                projectCoordinateToMeters(p[0], p[1], centerLat, centerLon, 5)
            );

            // simplifyt to reduce points and aid CPU - scale 2m
            const simplified = simplifyPath(projectedPoints, 2.0);
            // if not road skip
            if (simplified.length < 2) return;

            const type = road.type;
            let targetPath;
            // if (roadTypes[type]) {
            //     roadTypes[type]++;
            // } else {
            //     roadTypes[type] = 1;
            // }
            
            if (['motorway', 'motorway_link', 'trunk', 'trunk_link'].includes(type)) {
                targetPath = pathLayers.express;
            } else if (['primary', 'primary_link', 'secondary', 'secondary_link'].includes(type)) {
                targetPath = pathLayers.arterial;
            } else if (['tertiary', 'tertiary_link', 'residential', 'unclassified', 'living_street', 'road'].includes(type)) {
                targetPath = pathLayers.local;
            } else if (['service', 'alley', 'services', 'driveway', 'passing_place'].includes(type)) {
                targetPath = pathLayers.service;
            } else if (['footway', 'pedestrian', 'corridor', 'platform', 'sidewalk'].includes(type)) {
                targetPath = pathLayers.pedestrian;
            } else if (['path', 'steps', 'cycleway', 'track', 'bridleway', 'staircase'].includes(type)) {
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
        // console.log(roadTypes);
        setPathObjects(pathLayers);
        setRenderDuration((performance.now() - startTime).toFixed(2));
        // Reset camera to center
        if (containerRef.current) {
            const cx = containerRef.current.clientWidth / 2;
            const cy = containerRef.current.clientHeight / 2;
            setTransform({ scale: calculatedScale, x: cx, y: cy });
        }
    }, [processedData]);

    // MARK: Draw/Render Logic
    useEffect(() => {
        const canvas = canvasRef.current;
        //early return
        if (!canvas || !pathObjects) return;

        const canvasContext = canvas.getContext("2d");
        const { width, height } = canvas;
        const { scale, x, y } = transform;

        // clear canvas
        canvasContext.fillStyle = "#fbfffa";
        canvasContext.fillRect(0, 0, width, height);

        // camera transformation
        // push state
        canvasContext.save();
        //move canvas origins
        canvasContext.translate(x, y);
        // scale values
        canvasContext.scale(scale, scale);

        for (let i = 0; i < LAYER_KEYS.length; i++) {
            const key = LAYER_KEYS[i];
            const config = LAYER_CONFIG[key];

            if (!visibleLayers[key] || scale <= config.minScale) {
                continue;
            }

            const path = pathObjects[key];
            if (!path) continue;

            // 3. Batch Context Updates
            canvasContext.strokeStyle = config.color;
            
            // Calculate responsive line width
            let lineWidth = config.weight / scale;
            if (lineWidth < 0.25) lineWidth = 0.25; // Floor to keep visible
            canvasContext.lineWidth = lineWidth;

            canvasContext.lineJoin = "round";
            canvasContext.lineCap = "round";

            // 4. The Draw Call
            canvasContext.stroke(path);
        }

        canvasContext.restore();

    }, [pathObjects, transform, visibleLayers]);

    // MARK: Camera Control
    useEffect(() => {
        const canvas = canvasRef.current;
        //early return
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
                setTransform(prev => ({ 
                    ...prev, 
                    x: prev.x + deltax,
                    y: prev.y + deltay
                }));
            });
        };
        
        const handleMouseUp = () => {
            isDragging.current = false;
            canvas.style.cursor = "grab";
        };
        
        const handleWheel = (e) => {
            e.preventDefault();
            //scroll up is zoom in.
            const factor = Math.pow(1.1, -e.deltaY / 50);
            
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

        canvas.addEventListener("mousedown", handleMouseDown);
        window.addEventListener("mousemove", handleMouseMove);
        window.addEventListener("mouseup", handleMouseUp);
        // passive in order to do prevent default
        canvas.addEventListener("wheel", handleWheel, { passive: false });
        
        return () => {
            canvas.removeEventListener("mousedown", handleMouseDown);
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("mouseup", handleMouseUp);
            canvas.removeEventListener("wheel", handleWheel);
        };
    }, []); //run on mount only

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

    const handleCitySelect = (city) => {
        setPathObjects(null);
        setRenderDuration(null);
        setFetchDuration(null);
        setQueryCity(city);
    };
    const handleOnChange = (e) => {
        setInputValue(e.target.value);
    }

    useEffect(() => {
        let timer = setTimeout(() => {
            setPathObjects(null);
            setInputQuery(inputValue);
        }, 500);
        return () => clearTimeout(timer);
    }, [inputValue]);

    //MARK: get city suggestions
    const { data:cityData, isError:isCityError, isFetching:isCityFetching, error } = useQuery({
        queryKey: ['cityQuery', inputQuery],
        queryFn: () => fetchCitySuggestions(inputQuery),
        enabled: inputQuery.length > 2,
        retry: false,
        staleTime: 1000 * 60 * 5
    })

    return (
    <div className={style.pageContainer} ref={containerRef}>
        <div className={style.searchOverlay}>
        {isCollapsed ? (
            /* --- COLLAPSED STATE (The Circle/Square) --- */
            <button 
            className={style.collapsedTrigger} 
            onClick={() => setIsCollapsed(false)}
            aria-label="Expand search UI"
            >
            <div className={style.squareIcon} />
            </button>
        ) : (
            /* --- EXPANDED STATE (The Card) --- */
            <div className={style.searchCard}>
            <button 
                className={style.closeButton} 
                onClick={() => setIsCollapsed(true)}
                aria-label="Hide search UI"
            >
                ✕
            </button>
            
            <h1 className={style.title}>City Frames</h1>
            
            <form className={style.searchForm} onSubmit={(e) => e.preventDefault()}>
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

            {isCityError && (
                <div className={style.errorMessage}>
                {error.message ?? "Something went horribly wrong!"}
                </div>
            )}

            <div className={style.resultsList}>
                {!pathObjects && !isRoadFetching && inputValue.length > 0 && 
                cityData?.map((city, i) => (
                    <div key={i} className={style.suggestionItem} onClick={() => handleCitySelect(city)}>
                    <span className={style.cityName}>{city.display_name.split(",")[0]}</span>
                    <span className={style.cityMeta}>{city.display_name}</span>
                    <div className={style.infoPanelSecondary}>
                        <span className={style.cityType}>{city.type}</span>
                        <span className={style.cityCoords}>{parseFloat(city.lat).toFixed(2)} / {parseFloat(city.lon).toFixed(2)}</span>
                    </div>
                    </div>
                ))
                }
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
                    {Object.keys(visibleLayers).map(layer => (
                    <label key={layer} className={style.layerLabel}>
                        <input 
                        type="checkbox" 
                        checked={visibleLayers[layer]} 
                        onChange={() => setVisibleLayers(prev => ({...prev, [layer]: !prev[layer]}))}
                        />
                        <span>{layer.charAt(0).toUpperCase() + layer.slice(1)}</span>
                        <div 
                        className={style.colorDot} 
                        style={{ '--layer-color': LAYER_CONFIG[layer]?.color }} 
                        />
                    </label>
                    ))}
                </div>

                <button className={style.buttonSecondary} onClick={(e) => {
                    e.preventDefault();
                    setQueryCity(null);
                    setPathObjects(null);
                    setInputValue("");
                    queryClient.removeQueries({ queryKey: ['cityQuery'] });
                }}>
                    Clear Map
                </button>
                </div>
            )}
            </div>
        )}
        </div>

        <div className={style.mapViewport}>
        {isRoadFetching && (
            <div className={style.loadingScreen}>
            <div className={style.loadingCard}>
                <div className={style.spinnerLarge} />
                <h2>Building City Network</h2>
                <p>
                Attempting to fetch data from source <strong>{currentMirrorIndex + 1}</strong> of 5
                </p>
                <button 
                className={`${style.buttonSecondary} ${style.btnCancel}`} 
                onClick={() => {
                    queryClient.cancelQueries({ queryKey: ["roads"]});
                    setQueryCity(null);
                }}
                >
                Cancel Map Fetch
                </button>
            </div>
            </div>
        )}
        <canvas ref={canvasRef} className={style.canvas} />
        </div>
    </div>
    );
}