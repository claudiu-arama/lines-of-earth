import { useQuery } from "@tanstack/react-query";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";

import fallbackImg from "assets/fallback.png";
import placeholderImg from "assets/placeholder.webp";
import { MapViewport } from "components/MapViewport";
import { arrayofAPIs as api } from "constants/apis";
import { MAP_PRESETS, STYLE_OPTIONS } from "constants/layerConfigs";
import { BLURRED_PLACEHOLDER } from "constants/staticConstants";
import { responseRoads } from "helpers/formatCityHelper";
import { formatLatLon } from "helpers/mathHelpers";
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

import type { CanvasCoords, CityData, DrawScene } from "../types/globals.types";
import type { LabelSettings, LayerList } from "../types/label.types";
import type { QueryClient } from "@tanstack/react-query";

const DEFAULT_LAYER = 0;

export default function App() {
  // -- UI State --
  const [inputValue, setInputValue] = useState<string>("");
  const [inputQuery, setInputQuery] = useState<string>("");
  const [labelSettings, setLabelSettings] = useState<LabelSettings>({
    showCountryName: {
      enabled: true
    },
    tagline: {
      enabled: true,
      text: "A city of seven hills"
    },
    footnote: {
      enabled: true,
      text: "51.5072° N, 0.1276° W"
    }
  });
  const [selectedStyle, setSelectedStyle] = useState<string>(STYLE_OPTIONS[0]);

  // Dev note -> test if this is needed/enhancement or relic
  // cityHit: "",
  // countryHit: ""
  const [queryCity, setQueryCity] = useState<CityData | null>(null);
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const [bgImageLoaded, setBgImageLoaded] = useState<boolean>(false);
  const [bgImageError, setBgImageError] = useState<boolean>(false);
  const [showFrame, setShowFrame] = useState<boolean>(true);
  const [frameOrientation, setFrameOrientation] = useState<string>("portrait");
  // const [layerScheme, setLayerScheme] = useState(MAP_PRESETS[DEFAULT_LAYER]);
  // -- Data State --
  const [pathObjects, setPathObjects] = useState<Record<string, Path2D> | null>(
    null
  ); // The cached Path2D objects
  const [visibleLayers, setVisibleLayers] = useState<LayerList>({
    express: true,
    arterial: true,
    local: true,
    service: true,
    pedestrian: true,
    nature: true,
    transportation: true,
    miscellaneous: true,
    landmarks: true,
    water: false,
    canvas: true
  });
  // -- Performance Data --
  const fetchDurationRef = useRef<number | null>(null);
  const renderDurationRef = useRef<number | null>(null);
  const [mirrorIndex, setMirrorIndex] = useState<number | null>(null);
  // -- Camera & Interaction --
  const transformRef = useRef<CanvasCoords>({
    x: 0,
    y: 0,
    scale: 1
  });
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapViewportRef = useRef<HTMLDivElement | null>(null);
  const bgImageRef = useRef<HTMLImageElement | null>(null);
  const queryClient = useQueryClient();
  const lastSizeRef = useRef<{ w: number; h: number }>({ w: 0, h: 0 });
  const [layerColors, setLayerColors] = useState(
    Object.fromEntries(
      Object.entries(MAP_PRESETS[0].config).map(([key, cfg]) => [
        key,
        cfg.color
      ])
    )
  );

  // MARK: Helper for Labels

  const updateLabelSettings = (
    field: string,
    patch: { enabled: boolean; text: string }
  ) => {
    setLabelSettings((prev) => ({
      ...prev,
      [field]: { ...prev[field], ...patch }
    }));
  };

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
    queryCity as CityData,
    responseRoads as any,
    {
      enabled: !!queryCity,
      staleTime: 1000 * 60 * 3,
      gcTime: 1000 * 60 * 3
    },
    setMirrorIndex as React.Dispatch<React.SetStateAction<number | null>>,
    fetchDurationRef as React.RefObject<number | null>,
    queryClient as QueryClient
  );

  // MARK: Draw/Render Logic
  const drawScene = useDrawLogic(
    canvasRef as React.RefObject<HTMLCanvasElement>,
    pathObjects as Record<string, Path2D> | null,
    transformRef as React.RefObject<CanvasCoords>,
    visibleLayers as Record<string, boolean>,
    layerColors as Record<string, string>
  );

  //MARK: keep map center
  useCenterCanvas(
    canvasRef as React.RefObject<HTMLCanvasElement>,
    lastSizeRef as React.RefObject<{ w: number; h: number }>,
    transformRef as React.RefObject<CanvasCoords>,
    drawScene,
    showFrame,
    frameOrientation
  );

  //MARK: precalculated paths
  usePrecalculatePaths(
    processedData,
    containerRef as React.RefObject<HTMLDivElement>,
    setPathObjects,
    transformRef as React.RefObject<CanvasCoords>,
    drawScene as DrawScene,
    renderDurationRef as React.RefObject<number | null>
  );

  // MARK: Camera Control
  useCameraControls(canvasRef, transformRef, drawScene);

  // MARK: responsive canvas resizer
  useCanvasResizer(canvasRef, drawScene);

  const handleCitySelect = (city: CityData) => {
    setPathObjects(null);
    renderDurationRef.current = null;
    fetchDurationRef.current = null;
    setQueryCity(city);
    updateLabelSettings("footnote", {
      enabled: true,
      text: formatLatLon(city.lat, city.lon, 4)
    });
    queryClient.invalidateQueries({ queryKey: ["roads", city.areaId] });
  };

  const handleOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setPathObjects(null);
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
    queryFn: () => fetchCitySuggestions(inputQuery as string),
    enabled: (inputQuery as string).length > 2,
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
          renderDurationRef={renderDurationRef}
          fetchDurationRef={fetchDurationRef}
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
          labelSettings={labelSettings}
          updateLabelSettings={updateLabelSettings}
          selectedStyle={selectedStyle}
          setSelectedStyle={setSelectedStyle}
          STYLE_OPTIONS={STYLE_OPTIONS}
        />
      </div>

      <MapViewport
        canvasRef={canvasRef}
        mapViewportRef={mapViewportRef}
        isRoadFetching={isRoadFetching}
        isRoadsSuccess={isRoadsSuccess}
        isRoadError={isRoadError}
        mirrorIndex={mirrorIndex}
        apiLength={api.length}
        queryCity={queryCity}
        onCancelFetch={() => {
          queryClient.cancelQueries({ queryKey: ["roads"] });
          setQueryCity(null);
          setMirrorIndex(0);
        }}
        pathObjects={pathObjects}
        showFrame={showFrame}
        frameOrientation={frameOrientation}
        bgImageLoaded={bgImageLoaded}
        bgImageError={bgImageError}
        bgImageSource={getBackgroundImageSource()}
        blurredPlaceholder={BLURRED_PLACEHOLDER}
        layerColors={layerColors}
        labelSettings={labelSettings}
        frameStyle={selectedStyle}
      />
    </div>
  );
}
