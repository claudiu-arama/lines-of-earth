import { useState, useEffect, useRef, useLayoutEffect, useCallback } from "react";
import style from "./App.module.scss";
import { useQuery } from "@tanstack/react-query";
import { fetchCitySuggestions } from "../helpers/nominatimService";
import { useRoadsData } from "../hooks/data/useRoadsData";
import { responseRoads } from "../helpers/formatCityHelper";
import { useQueryClient } from "@tanstack/react-query";
import { MapControls } from "./MapControls";
import placeholderImg from "../assets/placeholder.webp";
import fallbackImg from "../assets/fallback.png";
import { BLURRED_PLACEHOLDER } from "../constants/staticConstants";
import { MapViewport } from "../components/MapViewport";
import {arrayofAPIs as api} from "../constants/apis";
import { usePrecalculatePaths } from "../hooks/data/usePrecalculatePaths";
import { useDrawLogic } from "../hooks/ui/useDrawLogic";
import { useBackgroundImage } from "../hooks/ui/useBackgroundImage";
import { useCenterCanvas } from "../hooks/ui/useCenterCanvas";
import { useCanvasResizer } from "../hooks/ui/useCanvasResizer";
import { useCameraControls } from "../hooks/ui/useCameraControls";
import { MAP_PRESETS } from "../constants/layerConfigs";
const DEFAULT_LAYER = "ink-on-paper";

export default function App() {
    // -- UI State --
    const [inputValue, setInputValue] = useState("");
    const [inputQuery, setInputQuery] = useState({
        cityHit: "",
        countryHit: ""});
    const [queryCity, setQueryCity] = useState(null);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [bgImageLoaded, setBgImageLoaded] = useState(false);
    const [bgImageError, setBgImageError] = useState(false);
    const [showFrame, setShowFrame] = useState(true);
    const [frameOrientation, setFrameOrientation] = useState("portrait");
    const [layerScheme, setLayerScheme] = useState(MAP_PRESETS[DEFAULT_LAYER]);
    // -- Data State --
    const [pathObjects, setPathObjects] = useState(null); // The cached Path2D objects
    const [visibleLayers, setVisibleLayers] = useState({
        water: true,
        express: true,
        arterial: true,
        local: true,
        service: true,
        pedestrian: false,
        nature: true,
        landmarks: true,
        transportation: true,
        miscellaneous: true,
        canvas: true
    });
    // -- Performance Data --
    const [fetchDuration, setFetchDuration] = useState(null);
    const [renderDuration, setRenderDuration] = useState(null);
    const [currentMirrorIndex, setCurrentMirrorIndex] = useState(0);
    // -- Camera & Interaction --
    const drawSceneRef = useRef(null);
    const transformRef = useRef({ x: 0, y: 0, scale: 1 });
    const canvasRef = useRef(null);
    const containerRef = useRef(null);
    const mapViewportRef = useRef(null);
    const bgImageRef = useRef(null);
    const queryClient = useQueryClient();
    //debug
    window.__qc = queryClient;
    const lastSizeRef = useRef({ w: 0, h: 0 });
    const [layerColors, setLayerColors] = useState(
        Object.fromEntries(
            Object.entries(MAP_PRESETS[DEFAULT_LAYER].config).map(([key, cfg]) => [key, cfg.color])
        )
    );

    // MARK: Load background image on mount
    useBackgroundImage(bgImageRef, setBgImageLoaded, placeholderImg, fallbackImg);

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
        isSuccess: isRoadsSuccess,
        isPending: isRoadsPending,
        error: isRoadErrorInfo
    } = useRoadsData(
        queryCity,
        responseRoads,
        {
            enabled: !!queryCity,
            staleTime: 1000 * 60 * 3,
            gcTime: 1000 * 60  * 3,
        },
        setCurrentMirrorIndex,
        setFetchDuration,
        queryClient
    );

    // MARK: Draw/Render Logic
    const drawScene = useDrawLogic(
        canvasRef,
        pathObjects,
        transformRef,
        visibleLayers,
        layerColors
    );

    //MARK: keep map center
    useCenterCanvas(canvasRef, lastSizeRef, transformRef, drawScene, showFrame, frameOrientation);

    //MARK: precalculated paths
    usePrecalculatePaths(processedData, containerRef, setPathObjects, transformRef, drawScene, setRenderDuration);

    // MARK: Camera Control
    useCameraControls(canvasRef, transformRef, drawScene);

    // MARK: responsive canvas resizer
    useCanvasResizer(canvasRef, drawScene);

    const handleCitySelect = (city) => {
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

    return (
        <div className={style.pageContainer} ref={containerRef}>
            <div className={style.searchOverlay}>
                <MapControls
                    isCollapsed={isCollapsed}
                    setIsCollapsed={setIsCollapsed}
                    pathObjects={pathObjects}
                    processedData={processedData}
                    renderDuration={renderDuration}
                    fetchDuration={fetchDuration}
                    canvasRef={canvasRef}
                    showFrame={showFrame}
                    transformRef={transformRef}
                    visibleLayers={visibleLayers}
                    queryCity={queryCity}
                    handleCitySelect={handleCitySelect}
                    handleOnChange={handleOnChange}
                    inputValue={inputValue}
                    isRoadError={isRoadError}
                    isRoadErrorInfo={isRoadErrorInfo}
                    cityData={cityData}
                    setQueryCity={setQueryCity}
                    setPathObjects={setPathObjects}
                    setInputValue={setInputValue}
                    setFrameOrientation={setFrameOrientation}
                    frameOrientation={frameOrientation}
                    isCityFetching={isCityFetching}
                    isRoadFetching={isRoadFetching}
                    setVisibleLayers={setVisibleLayers}
                    setShowFrame={setShowFrame}
                    setLayerColors={setLayerColors}
                    layerColors={layerColors}
                />
            </div>

            <MapViewport
                canvasRef={canvasRef}
                mapViewportRef={mapViewportRef}
                isRoadFetching={isRoadFetching}
                isRoadsSuccess={isRoadsSuccess}
                isRoadError={isRoadError}
                currentMirrorIndex={currentMirrorIndex}
                apiLength={api.length}
                cityData={cityData}
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
                layerColors={layerColors}
            />
        </div>
    );
}
