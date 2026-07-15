import { FRAME_CONFIG, MAP_PRESETS } from "constants/layerConfigs";

import { CityLabel } from "./CityLabel";

import styles from "./MapViewport.module.scss";

// TODO: replace `any` with proper types
export function MapViewport({
  canvasRef,
  mapViewportRef,
  isRoadFetching,
  currentMirrorIndex,
  onCancelFetch,
  pathObjects,
  showFrame,
  frameOrientation,
  bgImageLoaded,
  bgImageError,
  bgImageSource,
  blurredPlaceholder,
  apiLength,
  isRoadsSuccess,
  isRoadError,
  layerColors,
  cityData
}: {
  canvasRef: any;
  mapViewportRef: any;
  isRoadFetching: any;
  currentMirrorIndex: any;
  onCancelFetch: any;
  pathObjects: any;
  showFrame: any;
  frameOrientation: any;
  bgImageLoaded: any;
  bgImageError: any;
  bgImageSource: any;
  blurredPlaceholder: any;
  apiLength: any;
  isRoadsSuccess: any;
  isRoadError: any;
  layerColors: any;
  cityData: any;
}) {
  const hasMap = !!pathObjects;

  const frameCSSVars = {
    "--outer-border": `${FRAME_CONFIG.outerBorder}px`,
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
                    cityName={cityData?.display_name?.split(",")[0]}
                    country={cityData?.display_name?.split(",")[1]}
                    message="A city of seven hills"
                    variant="fade"
                    bgColor={
                      layerColors["canvas"] ||
                      // TODO: replace `any` with proper types
                      (MAP_PRESETS as any).canvas.color
                    }
                    accentColor="#1a1a1a"
                    fontColor="#1a1a1a"
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
              {isRoadError}
              Getting data from server <strong>
                {currentMirrorIndex + 1}
              </strong>{" "}
              of {apiLength}
            </p>
            <button className={styles.cancelButton} onClick={onCancelFetch}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
