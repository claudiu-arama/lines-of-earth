import { FRAME_CONFIG, MAP_PRESETS } from "constants/layerConfigs";

import { CityLabel } from "./CityLabel";

import styles from "./MapViewport.module.scss";

// TODO: replace `any` with proper types
//TODO: refactor and use Context API to avoid prop drilling

export function MapViewport({
  canvasRef,
  mapViewportRef,
  isRoadFetching,
  mirrorIndex,
  onCancelFetch,
  pathObjects,
  showFrame,
  frameOrientation,
  frameStyle,
  bgImageLoaded,
  bgImageError,
  bgImageSource,
  blurredPlaceholder,
  apiLength,
  isRoadsSuccess,
  isRoadError,
  layerColors,
  queryCity,
  labelSettings
}: {
  canvasRef: any;
  mapViewportRef: any;
  isRoadFetching: any;
  mirrorIndex: number | null;
  onCancelFetch: any;
  pathObjects: Record<string, Path2D> | null;
  showFrame: any;
  frameOrientation: any;
  frameStyle: any;
  bgImageLoaded: any;
  bgImageError: any;
  bgImageSource: any;
  blurredPlaceholder: any;
  apiLength: any;
  isRoadsSuccess: any;
  isRoadError: any;
  layerColors: any;
  queryCity: any;
  labelSettings: any;
}) {
  const hasMap = !!pathObjects;

  const frameCSSVars = {
    "--mat": `${FRAME_CONFIG.mat}px`,
    "--inner-b1": `${FRAME_CONFIG.innerBorder1}px`,
    "--inner-gap": `${FRAME_CONFIG.innerGap}px`,
    "--inner-b2": `${FRAME_CONFIG.innerBorder2}px`,
    "--spread-b2": `${FRAME_CONFIG.innerBorder2}px`,
    "--spread-gap": `${FRAME_CONFIG.innerBorder2 + FRAME_CONFIG.innerGap}px`,
    "--spread-b1": `${FRAME_CONFIG.innerBorder2 + FRAME_CONFIG.innerGap + FRAME_CONFIG.innerBorder1}px`
  };

  return (
    <div className={styles.mapViewport} ref={mapViewportRef}>
      {!bgImageError && (
        <div
          className={`${styles.background} ${hasMap ? styles.backgroundHidden : ""}`}
          style={{
            backgroundImage: `url(${bgImageLoaded ? bgImageSource : blurredPlaceholder})`
          }}
        />
      )}

      <div
        className={`${styles.wall} ${showFrame && hasMap ? styles.wallVisible : ""}`}
      >
        <div
          className={`
                    ${styles.frameOuter}
                    ${showFrame && hasMap ? styles.frameOuterVisible : styles.frameOuterHidden}
                    ${showFrame && hasMap && frameOrientation === "landscape" ? styles.frameOuterLandscape : frameOrientation === "square" ? styles.frameOuterSquare : ""}
                  `}
          data-frame-style={frameStyle}
          // TODO: replace `any` with proper types
          style={showFrame && hasMap ? (frameCSSVars as any) : undefined}
        >
          <div
            className={`${styles.mat} ${showFrame && hasMap ? styles.matVisible : styles.matHidden}`}
          >
            <div
              className={`${styles.doubleFrame} ${showFrame && hasMap ? styles.doubleFrameVisible : styles.doubleFrameHidden}`}
            >
              <div
                style={{ position: "relative", width: "100%", height: "100%" }}
              >
                <canvas
                  ref={canvasRef}
                  className={`${styles.canvas} ${hasMap ? "" : styles.canvasHidden}`}
                />
                {showFrame && hasMap && (
                  <CityLabel
                    cityName={
                      queryCity?.display_name?.split(",")[0] || queryCity?.name
                    }
                    country={queryCity?.country}
                    message="A city of seven hills"
                    variant="fade"
                    bgColor={
                      layerColors["canvas"] ||
                      // TODO: replace `any` with proper types
                      (MAP_PRESETS as any).canvas.color
                    }
                    accentColor="#1a1a1a"
                    fontColor="#1a1a1a"
                    labelSettings={labelSettings}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      {isRoadFetching && !isRoadsSuccess && (
        <div className={styles.loadingScreen}>
          <div className={styles.loadingCard}>
            <div className={styles.spinnerLarge} />
            <h2 className={styles.loadingTitle}>Building City Network</h2>
            <p className={styles.loadingSubtitle}>
              Getting data from server{" "}
              <strong>{mirrorIndex !== null ? mirrorIndex + 1 : 0}</strong> of{" "}
              {apiLength}
            </p>
            <div className={styles.progressTrack}>
              <div
                className={styles.progressFill}
                style={{
                  width: `${((mirrorIndex !== null ? mirrorIndex + 1 : 0) / apiLength) * 100}%`
                }}
              />
            </div>

            {isRoadError && (
              <p className={styles.loadingError}>
                Trouble reaching this server — trying another…
              </p>
            )}
            <button className={styles.cancelButton} onClick={onCancelFetch}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
