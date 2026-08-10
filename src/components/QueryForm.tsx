import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useQueryClient } from "@tanstack/react-query";

import fallbackImg from "assets/fallback.png";
import placeholderImg from "assets/placeholder.webp";
import { MapViewport } from "components/MapViewport";
import { arrayofAPIs as api } from "constants/apis";
import { MAP_PRESETS } from "constants/layerConfigs";
import { BLURRED_PLACEHOLDER } from "constants/staticConstants";
import { responseRoads } from "helpers/formatCityHelper";
import type { CityDataInterface } from "helpers/globals";
import { fetchCitySuggestions } from "helpers/nominatimService";
import { usePrecalculatePaths } from "hooks/data/usePrecalculatePaths";
import { useRoadsData } from "hooks/data/useRoadsData";
import { useBackgroundImage } from "hooks/ui/useBackgroundImage";
import { useCameraControls } from "hooks/ui/useCameraControls";
import { useCanvasResizer } from "hooks/ui/useCanvasResizer";
import { useCenterCanvas } from "hooks/ui/useCenterCanvas";
import { useDrawLogic } from "hooks/ui/useDrawLogic";

import { MapControls } from "./MapControls";

import style from "./App.module.scss";

const DEFAULT_LAYER = "ink-on-paper";

export default function App() {
  // -- UI State --
  const [inputValue, setInputValue] = useState<string>("");
  const [inputQuery, setInputQuery] = useState<string>("");
  // Dev note -> test if this is needed/enhancement or relic
  // cityHit: "",
  // countryHit: ""
  const [queryCity, setQueryCity] = useState<CityDataInterface | null>(null);
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const [bgImageLoaded, setBgImageLoaded] = useState<boolean>(false);
  const [bgImageError, setBgImageError] = useState<boolean>(false);
  const [showFrame, setShowFrame] = useState<boolean>(true);
  const [frameOrientation, setFrameOrientation] = useState<string>("portrait");
  // const [layerScheme, setLayerScheme] = useState(MAP_PRESETS[DEFAULT_LAYER]);
  // -- Data State --
  const [pathObjects, setPathObjects] = useState<Path2D | null>(null); // The cached Path2D objects
  const [visibleLayers, setVisibleLayers] = useState<Record<string, boolean>>({
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
  const [fetchDuration, setFetchDuration] = useState<number | null>(null);
  const [renderDuration, setRenderDuration] = useState<number | null>(null);
  const [currentMirrorIndex, setCurrentMirrorIndex] = useState<number>(0);
  // -- Camera & Interaction --
  const transformRef = useRef<{ x: number; y: number; scale: number }>({
    x: 0,
    y: 0,
    scale: 1
  });
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapViewportRef = useRef<HTMLDivElement | null>(null);
  const bgImageRef = useRef<HTMLImageElement | null>(null);
  const queryClient = useQueryClient();
  //Dev note - what is this
  // TODO: replace `any` with proper types
  (window as any).__qc = queryClient;
  const lastSizeRef = useRef<{ w: number; h: number }>({ w: 0, h: 0 });
  const [layerColors, setLayerColors] = useState(
    Object.fromEntries(
      Object.entries(MAP_PRESETS[DEFAULT_LAYER].config).map(([key, cfg]) => [
        key,
        cfg.color
      ])
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
    // isPending: isRoadsPending,
    error: isRoadErrorInfo
  } = useRoadsData(
    queryCity,
    responseRoads,
    {
      enabled: !!queryCity,
      staleTime: 1000 * 60 * 3,
      gcTime: 1000 * 60 * 3
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
  useCenterCanvas(
    canvasRef,
    lastSizeRef,
    transformRef,
    drawScene,
    showFrame,
    frameOrientation
  );

  //MARK: precalculated paths
  usePrecalculatePaths(
    processedData,
    containerRef,
    setPathObjects,
    transformRef,
    drawScene,
    setRenderDuration
  );

  // MARK: Camera Control
  useCameraControls(canvasRef, transformRef, drawScene);

  // MARK: responsive canvas resizer
  useCanvasResizer(canvasRef, drawScene);

  const handleCitySelect = (city: CityDataInterface) => {
    setPathObjects(null);
    setRenderDuration(null);
    setFetchDuration(null);
    setQueryCity(city);
  };

  const handleOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setPathObjects(null);
      // TODO: replace `any` with proper types
      setInputQuery(inputValue as string);
    }, 500);
    return () => clearTimeout(timer);
  }, [inputValue]);

  //MARK: get city suggestions
  const {
    data: cityData,
    isError: isCityError,
    isFetching: isCityFetching,
    error
  } = useQuery({
    queryKey: ["cityQuery", inputQuery],
    // TODO: replace `any` with proper types
    queryFn: () => fetchCitySuggestions(inputQuery as any),
    enabled: (inputQuery as any).length > 2,
    retry: false,
    staleTime: 1000 * 60 * 5
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
          setQueryCity("");
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
