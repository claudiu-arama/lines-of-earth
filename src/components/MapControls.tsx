import { CityHits } from "components/CityHits";
import { ColorPicker } from "components/ColorPicker";
import { exportToSVG } from "helpers/exportToSVG";

import style from "./MapControls.module.scss";

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
      <line x1="50" y1="20" x2="50" y2="10" />
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
      <line x1="50" y1="0" x2="50" y2="10" />
      <line x1="100" y1="0" x2="100" y2="10" />
      <line x1="150" y1="0" x2="150" y2="17" />
      <line x1="200" y1="0" x2="200" y2="10" />
      <line x1="250" y1="0" x2="250" y2="10" />
    </g>
  </svg>
);

// TODO: replace `any` with proper types
//TODO: refactor and use Context API to avoid prop drilling
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
  cityData, // passed to CityHits component
  handleCitySelect, // passed to CityHits component
  renderDurationRef,
  fetchDurationRef,
  visibleLayers,
  setVisibleLayers,
  showFrame,
  setShowFrame,
  frameOrientation,
  setFrameOrientation,
  setQueryCity, // used for clearing the map when clicking "Clear map" button
  setPathObjects, // used for clearing the map when clicking "Clear map" button
  setInputValue, // used for clearing the map when clicking "Clear map" button
  canvasRef, // sent to exportToSVG function for exporting the map as SVG
  transformRef, // sent to exportToSVG function for exporting the map as SVG
  queryCity, // sent to exportToSVG function for exporting the map as SVG
  setLayerColors, // used for updating the color of each layer when changed in the ColorPicker component
  layerColors
}: {
  pathObjects: any;
  processedData: any;
  isCollapsed: any;
  setIsCollapsed: any;
  inputValue: any;
  handleOnChange: any;
  isCityFetching: any;
  isRoadError: any;
  isRoadErrorInfo: any;
  isRoadFetching: any;
  cityData: any;
  handleCitySelect: any;
  renderDurationRef: any;
  fetchDurationRef: any;
  visibleLayers: any;
  setVisibleLayers: any;
  showFrame: any;
  setShowFrame: any;
  frameOrientation: any;
  setFrameOrientation: any;
  setQueryCity: any;
  setPathObjects: any;
  setInputValue: any;
  canvasRef: any;
  transformRef: any;
  queryCity: any;
  setLayerColors: any;
  layerColors: any;
}) {
  return isCollapsed ? (
    <button
      className={style.collapsedTrigger}
      onClick={() => setIsCollapsed(false)}
      aria-label="Expand search UI"
    >
      <div className={style.squareIcon} />
    </button>
  ) : (
    <div className={`${style.searchCard} ${pathObjects ? style.anchored : ""}`}>
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
          <div className={style.errorMessage}>{isRoadErrorInfo.message}</div>
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
                        // TODO: replace `any` with proper types
                        setVisibleLayers((prev: any) => ({
                          ...prev,
                          [layer]: !prev[layer]
                        }))
                      }
                    />
                    {layer !== "canvas" && (
                      <div
                        className={`${style.draftCheckbox} ${visibleLayers[layer] ? style.checked : ""}`}
                      />
                    )}
                    <span>{layer}</span>
                    <ColorPicker
                      value={layerColors[layer]}
                      // TODO: replace `any` with proper types
                      onChange={(color: string) =>
                        setLayerColors((prev: any) => ({
                          ...prev,
                          [layer]: color
                        }))
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
                <div
                  className={`${style.draftCheckbox} ${showFrame ? style.checked : ""}`}
                />
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
              {renderDurationRef.current !== null && (
                <div className={style.statRow}>
                  <span className={style.statLabel}>Render time</span>
                  <span className={style.statValue}>
                    {renderDurationRef.current} ms
                  </span>
                </div>
              )}
              <div className={style.statRow}>
                <span className={style.statLabel}>Network</span>
                <span className={style.statValue}>
                  {fetchDurationRef.current} ms
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      <ScaleBarBottom />
    </div>
  );
}
