import styles from "./MapViewport.module.scss";
import { FRAME_CONFIG } from "../constants/layerConfigs";

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
}) {
    const hasMap = !!pathObjects;

    const frameCSSVars = {
    "--outer-border"  : `${FRAME_CONFIG.outerBorder}px`,
    "--mat"           : `${FRAME_CONFIG.mat}px`,
    "--inner-b1"      : `${FRAME_CONFIG.innerBorder1}px`,
    "--inner-gap"     : `${FRAME_CONFIG.innerGap}px`,
    "--inner-b2"      : `${FRAME_CONFIG.innerBorder2}px`,
    "--spread-b2"     : `${FRAME_CONFIG.innerBorder2}px`,
    "--spread-gap"    : `${FRAME_CONFIG.innerBorder2 + FRAME_CONFIG.innerGap}px`,
    "--spread-b1"     : `${FRAME_CONFIG.innerBorder2 + FRAME_CONFIG.innerGap + FRAME_CONFIG.innerBorder1}px`,
};

    return (
        <div className={styles.mapViewport} ref={mapViewportRef}>

            {!bgImageError && (
                <div
                    className={`${styles.background} ${hasMap ? styles.backgroundHidden : ""}`}
                    style={{ backgroundImage: `url(${bgImageLoaded ? bgImageSource : blurredPlaceholder})` }}
                />
            )}

            <div className={`${styles.wall} ${showFrame && hasMap ? styles.wallVisible : ""}`}>

                <div className={`
                    ${styles.frameOuter}
                    ${showFrame && hasMap ? styles.frameOuterVisible : styles.frameOuterHidden}
                    ${showFrame && hasMap && frameOrientation === "landscape" ? styles.frameOuterLandscape : ""}
                  `}
                  style={showFrame && hasMap ? frameCSSVars : undefined}>
                    <div className={`${styles.mat} ${showFrame && hasMap ? styles.matVisible : styles.matHidden}`}>
                        <div className={`${styles.doubleFrame} ${showFrame && hasMap ? styles.doubleFrameVisible : styles.doubleFrameHidden}`}>
                            <canvas
                                ref={canvasRef}
                                className={`${styles.canvas} ${hasMap ? "" : styles.canvasHidden}`}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {isRoadFetching && (
                <div className={styles.loadingScreen}>
                    <div className={styles.loadingCard}>
                        <div className={styles.spinnerLarge} />
                        <h2 className={styles.loadingTitle}>Building City Network</h2>
                        <p className={styles.loadingSubtitle}>
                            Fetching from mirror <strong>{currentMirrorIndex + 1}</strong> of {apiLength}
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