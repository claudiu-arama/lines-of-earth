import { useState, useEffect, useRef, useLayoutEffect } from "react";
import style from "./App.module.scss";
import { useQuery } from "@tanstack/react-query";
import { fetchCitySuggestions } from "../helpers/nominatimService.js";
import { useRoadsData } from "../hooks/data/useRoadsData.js";
import { responseRoads } from "../helpers/formatCityHelper.js";
import { useQueryClient } from "@tanstack/react-query";
import { MapControls } from "./MapControls.jsx";
import placeholderImg from "../assets/placeholder.webp";
import fallbackImg from "../assets/fallback.png";
import { BLURRED_PLACEHOLDER } from "../constants/staticConstants.js";
import { MapViewport } from "../components/MapViewport.jsx";
import {arrayofAPIs as api} from "../constants/apis.js";
import { usePrecalculatePaths } from "../hooks/data/usePrecalculatePaths.js";
import { useDrawLogic } from "../hooks/ui/useDrawLogic.js";
import { useBackgroundImage } from "../hooks/ui/useBackgroundImage.js";
import { useCenterCanvas } from "../hooks/ui/useCenterCanvas.js";
import { useCanvasResizer } from "../hooks/ui/useCanvasResizer.js";
import { useCameraControls } from "../hooks/ui/useCameraControls.js";
import { LAYER_CONFIG } from "../constants/layerConfigs.js";

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
    const [transform, setTransform] = useState({ scale: 0, x: 0, y: 0 });
    const isDragging = useRef(false);
    const lastMousePos = useRef({ x: 0, y: 0 });
    const canvasRef = useRef(null);
    const containerRef = useRef(null);
    const mapViewportRef = useRef(null);
    const bgImageRef = useRef(null);
    const rafId = useRef(null);
    const queryClient = useQueryClient();
    const lastSizeRef = useRef({ w: 0, h: 0 });
    const [layerColors, setLayerColors] = useState(
        Object.fromEntries(
            Object.entries(LAYER_CONFIG).map(([key, cfg]) => [key, cfg.color])
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
        error: isRoadErrorInfo
    } = useRoadsData(
        queryCity,
        {
            select: responseRoads,
            enabled: !!queryCity,
            staleTime: 1000 * 60 * 5,
        },
        setCurrentMirrorIndex,
        setFetchDuration,
        queryClient
    );

    //MARK: precalculated paths
    usePrecalculatePaths(processedData, containerRef, setPathObjects, setTransform, setRenderDuration);

    //MARK: keep map center
    useCenterCanvas(canvasRef, lastSizeRef, setTransform, showFrame, frameOrientation);
    

    // MARK: Draw/Render Logic
    useDrawLogic(canvasRef, pathObjects, transform, visibleLayers, layerColors);

    // MARK: Camera Control
    useCameraControls(canvasRef, lastMousePos, isDragging, rafId, setTransform);

    // MARK: responsive canvas resizer
    useCanvasResizer(canvasRef, containerRef, setTransform);

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
                    transform={transform}
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
