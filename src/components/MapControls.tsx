import { useState } from "react";

import { CityHits } from "components/CityHits";
import { ColorPicker } from "components/ColorPicker";
import { MAP_PRESETS } from "constants/layerConfigs";
import { exportToSVG } from "helpers/exportToSVG";
import { formatLatLon } from "helpers/mathHelpers";

import style from "./MapControls.module.scss";

// TODO: replace with real theme data (name + 4 palette colors) once
// theme presets exist as a concept in the data layer.
const THEME_OPTIONS = [
  {
    name: "Classic Editorial",
    colors: ["#1f2a24", "#c9a15a", "#5b8a9a", "#a35b4a"]
  },
  { name: "Midnight", colors: ["#0f1420", "#3a4a5a", "#6a7a8a", "#1a1a1a"] },
  { name: "Coastal", colors: ["#4a90a4", "#a4c9d4", "#e8dcc0", "#2a5a6a"] },
  { name: "Forest", colors: ["#2f4a2a", "#5a7a4a", "#8a9a6a", "#1a2a1a"] },
  { name: "Sunset", colors: ["#c9506a", "#e8a05a", "#f0d0a0", "#8a2a3a"] }
];

const LogoMark = () => (
  <svg className={style.logoMark} viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="3" fill="currentColor" />
    <g stroke="currentColor" strokeWidth="1.5" opacity="0.6">
      <path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M18.4 5.6l-2.8 2.8M8.4 15.6l-2.8 2.8" />
    </g>
  </svg>
);

const ResetGlyph = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
    <path
      d="M4 4v6h6M4.5 15a8 8 0 1 0 1.5-8.5L4 10"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const ChevronDown = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
    <path
      d="M6 9l6 6 6-6"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const Toggle = ({
  labelVisibility,
  onChange
}: {
  labelVisibility: boolean;
  onChange: () => void;
}) => (
  <div className={style.toggle}>
    <input type="checkbox" checked={labelVisibility} onChange={onChange} />
    <div className={style.toggleTrack} />
  </div>
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
  layerColors,
  labelSettings,
  updateLabelSettings,
  selectedStyle,
  setSelectedStyle,
  STYLE_OPTIONS
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
  labelSettings: any;
  updateLabelSettings: any;
  selectedStyle: any;
  setSelectedStyle: any;
  STYLE_OPTIONS: any;
}) {
  const [selectedTheme, setSelectedTheme] = useState(0);

  const handleChangeCity = () => {
    setQueryCity(null);
    setPathObjects(null);
    setInputValue("");
  };

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
      <button
        className={style.closeButton}
        onClick={() => setIsCollapsed(true)}
        aria-label="Hide search UI"
      />

      <div className={style.header}>
        <LogoMark />
        <h1 className={style.title}>City Frames</h1>
      </div>

      <div className={style.panelBody}>
        {!pathObjects && (
          <>
            <form
              className={style.searchForm}
              onSubmit={(e) => e.preventDefault()}
            >
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
              {!isRoadFetching && inputValue.length > 0 && (
                <CityHits
                  cityData={cityData}
                  handleCitySelect={handleCitySelect}
                />
              )}
            </div>
          </>
        )}

        {pathObjects && (
          <>
            <div className={style.section}>
              <div className={style.sectionHeaderRow}>
                <span className={style.sectionLabel}>City</span>
                <button className={style.linkButton} onClick={handleChangeCity}>
                  <ResetGlyph /> Change
                </button>
              </div>
              <div className={style.cityName}>
                <span className={style.cityName}>
                  {queryCity?.name || queryCity?.display_name}
                </span>
              </div>
            </div>

            <div className={style.toggleRow}>
              <span className={style.toggleRowLabel}>Show country name</span>
              <Toggle
                labelVisibility={labelSettings.showCountryName.enabled}
                onChange={() =>
                  updateLabelSettings("showCountryName", {
                    enabled: !labelSettings.showCountryName.enabled
                  })
                }
              />
            </div>

            <div className={style.fieldBlock}>
              <div className={style.fieldHeaderRow}>
                <span className={style.sectionLabel}>Tagline</span>
                <div className={style.fieldActions}>
                  <button
                    className={style.resetIcon}
                    onClick={() =>
                      updateLabelSettings("tagline", {
                        enabled: true,
                        text: "A city of seven hills"
                      })
                    }
                    aria-label="Reset tagline"
                  >
                    <ResetGlyph />
                  </button>
                  <Toggle
                    labelVisibility={labelSettings.tagline.enabled}
                    onChange={() =>
                      updateLabelSettings("tagline", {
                        enabled: !labelSettings.tagline.enabled
                      })
                    }
                  />
                </div>
              </div>
              <input
                className={style.textField}
                value={labelSettings.tagline.text}
                disabled={!labelSettings.tagline.enabled}
                onChange={(e) =>
                  updateLabelSettings("tagline", { text: e.target.value })
                }
              />
            </div>

            <div className={style.fieldBlock}>
              <div className={style.fieldHeaderRow}>
                <span className={style.sectionLabel}>Footnote</span>
                <div className={style.fieldActions}>
                  <button
                    className={style.resetIcon}
                    onClick={() =>
                      updateLabelSettings("footnote", {
                        enabled: true,
                        text: formatLatLon(queryCity.lat, queryCity.lon, 4)
                      })
                    }
                    aria-label="Reset footnote"
                  >
                    <ResetGlyph />
                  </button>
                  <Toggle
                    labelVisibility={labelSettings.footnote.enabled}
                    onChange={() =>
                      updateLabelSettings("footnote", {
                        enabled: !labelSettings.footnote.enabled
                      })
                    }
                  />
                </div>
              </div>
              <input
                className={style.textField}
                value={labelSettings.footnote.text}
                disabled={!labelSettings.footnote.enabled}
                onChange={(e) =>
                  updateLabelSettings("footnote", { text: e.target.value })
                }
              />
            </div>

            <div className={style.section}>
              <span className={style.sectionLabel}>Style</span>
              <div className={style.styleGrid}>
                {STYLE_OPTIONS.map((option) => (
                  <button
                    key={option}
                    className={`${style.styleOption} ${
                      selectedStyle === option ? style.selected : ""
                    }`}
                    onClick={() => setSelectedStyle(option)}
                  >
                    <div
                      className={`${style.styleIcon} ${
                        option === "classic" ? style.styleIconClassic : ""
                      } ${option === "vintage" ? style.styleIconVintage : ""} ${
                        option === "minimal" ? style.styleIconMinimal : ""
                      }`}
                    />
                    <span className={style.styleName}>
                      {option.charAt(0).toUpperCase() + option.slice(1)}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className={style.section}>
              <div className={style.sectionHeaderRow}>
                <span className={style.sectionLabel}>Theme</span>
                <span className={style.themeName}>
                  {MAP_PRESETS[selectedTheme].name}
                </span>
              </div>
              <div className={style.themeSwatches}>
                {MAP_PRESETS.map((theme, i) => (
                  <button
                    key={theme.name}
                    className={`${style.themeSwatch} ${
                      selectedTheme === i ? style.selected : ""
                    }`}
                    onClick={() => setSelectedTheme(i)}
                    aria-label={theme.name}
                  >
                    <div
                      className={style.themeSwatchInner}
                      style={{
                        background: `conic-gradient(${Object.values(
                          theme.config
                        )
                          .slice(0, 4)
                          .map((layer) => layer.color)
                          .join(", ")})`
                      }}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className={style.section}>
              <div className={style.sectionHeaderRow}>
                <span className={style.sectionLabel}>Layers</span>
                <button
                  className={style.resetIcon}
                  aria-label="Reset layers"
                  onClick={() => {
                    // TODO: wire to a real "reset to defaults" once default
                    // visibleLayers/layerColors values are available here.
                  }}
                >
                  <ResetGlyph />
                </button>
              </div>

              <div className={style.layerList}>
                {Object.keys(visibleLayers).map((layer) => (
                  <label key={layer} className={style.layerRow}>
                    <input
                      type="checkbox"
                      checked={visibleLayers[layer]}
                      onChange={() =>
                        setVisibleLayers((prev: any) => ({
                          ...prev,
                          [layer]: !prev[layer]
                        }))
                      }
                    />
                    {layer !== "canvas" && (
                      <div
                        className={`${style.draftCheckbox} ${
                          visibleLayers[layer] ? style.checked : ""
                        }`}
                      />
                    )}
                    <span className={style.layerName}>{layer}</span>

                    {/* TODO: replace with real sub-layer detail count once
                        road-detail levels exist as data, rather than a
                        hardcoded display value. */}
                    {layer === "roads" && (
                      <>
                        <span className={style.layerCount}>4/5</span>
                        <button
                          className={style.layerExpand}
                          onClick={(e) => e.preventDefault()}
                          aria-label="Expand road detail"
                        >
                          <ChevronDown />
                        </button>
                      </>
                    )}

                    <ColorPicker
                      value={layerColors[layer]}
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

            <div className={style.frameControls}>
              <div className={style.toggleRow}>
                <span className={style.toggleRowLabel}>Show frame</span>
                <Toggle
                  labelVisibility={showFrame}
                  onChange={() => setShowFrame((prev) => !prev)}
                />
              </div>

              {showFrame && (
                <select
                  className={style.draftSelect}
                  value={frameOrientation}
                  onChange={(e) => setFrameOrientation(e.target.value)}
                >
                  <option value="portrait">Portrait (50×70)</option>
                  <option value="landscape">Landscape (70×50)</option>
                  <option value="square">Square (70×70)</option>
                </select>
              )}
            </div>

            <button
              className={style.buttonSecondary}
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
          </>
        )}
      </div>

      {pathObjects && (
        <div className={style.footer}>
          <button className={style.addToCart} onClick={() => {}}>
            <span>Add to cart</span>
            <span className={style.cartPrice}>— from €39</span>
          </button>
        </div>
      )}
    </div>
  );
}
