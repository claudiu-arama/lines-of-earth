import {CityHits} from "../components/CityHits";
import { exportToSVG } from "../helpers/exportToSVG";
import style from "./MapControls.module.scss";
import { debounce } from "../helpers/utilities";
import { ColorPicker } from "../components/ColorPicker";

const ScaleBarTop = () => (
    <svg
        className={style.scaleBar}
        height="20"
        viewBox="0 0 300 20"
        xmlns="http://www.w3.org/2000/svg"
        style={{ borderBottom: "1px solid #1a1a1e" }}
    >
        <rect width="300" height="20" fill="#faf9f5" />

        <g stroke="#1a1a1e" strokeWidth="0.75">
            <line x1="50"  y1="20" x2="50"  y2="10" />
            <line x1="100" y1="20" x2="100" y2="10" />
            <line x1="150" y1="20" x2="150" y2="3" />
            <line x1="200" y1="20" x2="200" y2="10" />
            <line x1="250" y1="20" x2="250" y2="10" />
        </g>
    </svg>
);

const ScaleBarBottom = () => (
    <svg
        className={style.scaleBar}
        height="20"
        viewBox="0 0 300 20"
        xmlns="http://www.w3.org/2000/svg"
        style={{ borderTop: "1px solid #1a1a1e" }}
    >
        <rect width="300" height="20" fill="#faf9f5" />

        <g stroke="#1a1a1e" strokeWidth="0.75">
            <line x1="50"  y1="0" x2="50"  y2="10" />
            <line x1="100" y1="0" x2="100" y2="10" />
            <line x1="150" y1="0" x2="150" y2="17" />
            <line x1="200" y1="0" x2="200" y2="10" />
            <line x1="250" y1="0" x2="250" y2="10" />
        </g>
    </svg>
);

export function MapControls({
    pathObjects,
    processedData,
    isCollapsed,
    setIsCollapsed,
    inputValue,
    handleOnChange,
    isCityFetching,
    isRoadError,
    isRoadErrorInfo,
    isRoadFetching,
    cityData,
    handleCitySelect,
    renderDuration,
    fetchDuration,
    visibleLayers,
    setVisibleLayers,
    showFrame,
    setShowFrame,
    frameOrientation,
    setFrameOrientation,
    setQueryCity,
    setPathObjects,
    setInputValue,
    canvasRef,
    transformRef,
    queryCity,
    setLayerColors,
    layerColors
}) {
    return (
    isCollapsed ? (
            <button
                className={style.collapsedTrigger}
                onClick={() => setIsCollapsed(false)}
                aria-label="Expand search UI"
            >
                <div className={style.squareIcon} />
            </button>
        ) : (
        <div
            className={`${style.searchCard} ${pathObjects ? style.anchored : ""}`}
        >
            <ScaleBarTop />

            <button
                className={style.closeButton}
                onClick={() => setIsCollapsed(true)}
                aria-label="Hide search UI"
            />

            <div className={style.panelBody}>

                <h1 className={style.title}>City Frames</h1>

                <form className={style.searchForm} onSubmit={(e) => e.preventDefault()}>
                    <div className={style.searchWrapper}>
                        <input
                            type="text"
                            className={style.searchInput}
                            placeholder="enter city name..."
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

                {isRoadError && (
                    <div className={style.errorMessage}>
                        {isRoadErrorInfo.message}
                    </div>
                )}

                <div className={style.resultsList}>
                    {!pathObjects && !isRoadFetching && inputValue.length > 0 && (
                        <CityHits cityData={cityData} handleCitySelect={handleCitySelect} />
                    )}
                </div>

                {pathObjects && (
                    <div className={style.infoPanel}>
                        <div>
                            <p className={style.sectionLabel}>Map layers</p>
                            <div className={style.layerToggles}>
                                {Object.keys(visibleLayers).map((layer) => (
                                    <label key={layer} className={style.layerLabel}>
                                        <input
                                            type="checkbox"
                                            checked={visibleLayers[layer]}
                                            onChange={() =>
                                                setVisibleLayers((prev) => ({
                                                    ...prev,
                                                    [layer]: !prev[layer],
                                                }))
                                            }
                                            />
                                            {layer !== "canvas" && 
                                                <div className={`${style.draftCheckbox} ${visibleLayers[layer] ? style.checked : ""}`} />
                                            }
                                        <span>{layer}</span>
                                        <ColorPicker
                                            value={layerColors[layer]}
                                            onChange={(color) =>
                                                setLayerColors((prev) => ({ ...prev, [layer]: color }))
                                            }
                                        />
                                    </label>
                                ))}
                            </div>
                        </div>

                        <button
                            className={style.buttonPrimary}
                            onClick={() =>
                                exportToSVG(
                                    processedData,
                                    canvasRef,
                                    showFrame,
                                    transformRef,
                                    visibleLayers,
                                    queryCity,
                                    frameOrientation,
                                    layerColors
                                )
                            }
                        >
                            ↓ Download map
                        </button>

                        <button
                            className={style.buttonSecondary}
                            onClick={(e) => {
                                e.preventDefault();
                                setQueryCity(null);
                                setPathObjects(null);
                                setInputValue("");
                            }}
                        >
                            Clear map
                        </button>

                        <div className={style.frameControls}>
                            <label className={style.frameToggle}>
                                <input
                                    type="checkbox"
                                    checked={showFrame}
                                    onChange={() => setShowFrame(!showFrame)}
                                />
                                <div className={`${style.draftCheckbox} ${showFrame ? style.checked : ""}`} />
                                <span>Show frame</span>
                            </label>

                            {showFrame && (
                                <label className={style.orientationToggle}>
                                    <select
                                        className={style.draftSelect}
                                        value={frameOrientation}
                                        onChange={(e) => setFrameOrientation(e.target.value)}
                                    >
                                        <option value="portrait">Portrait (50×70)</option>
                                        <option value="landscape">Landscape (70×50)</option>
                                        <option value="square">Square (70×70)</option>
                                    </select>
                                </label>
                            )}
                        </div>

                        <hr className={style.statsDivider} />

                        <div className={style.statsBlock}>
                            <div className={style.statRow}>
                                <span className={style.statLabel}>Roads loaded</span>
                                <span className={style.statValue}>
                                    {processedData?.roads.length.toLocaleString()}
                                </span>
                            </div>
                            {renderDuration && (
                                <div className={style.statRow}>
                                    <span className={style.statLabel}>Render time</span>
                                    <span className={style.statValue}>{renderDuration} ms</span>
                                </div>
                            )}
                            <div className={style.statRow}>
                                <span className={style.statLabel}>Network</span>
                                <span className={style.statValue}>{fetchDuration} ms</span>
                            </div>
                        </div>

                    </div>
                )}

            </div>

            <ScaleBarBottom />
        </div>
        )
    );
}