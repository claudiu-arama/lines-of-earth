import { useState, useEffect, useRef } from "react";
import "./QueryForm.scss";
import L from "leaflet";
import 'leaflet/dist/leaflet.css';

const ROAD_QUERIES = {
    BASIC: 'way[highway~"^(motorway|primary|secondary|tertiary)|residential"]',
    STRICT:
        'way[highway~"^(((motorway|trunk|primary|secondary|tertiary)(_link)?)|unclassified|residential|living_street|pedestrian|service|track)$"][area!=yes]',
};

function QueryForm() {
    const [inputValue, setInputValue] = useState("");
    const [suggestions, setSuggestions] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [roads, setRoadsNetwork] = useState(null);


    const mapRef = useRef(null);
    const mapContainerRef = useRef(null);

    // MARK: - handleInputChange
    const handleInputChange = (event) => {
        const inputData = event.target.value.trim();
        if (inputData.includes(">") || inputData.includes("<")) {
            setError("Use of the special characters is not permitted.");
            return;
        }
        setInputValue(inputData);
    };

    // MARK: - draw city map
     useEffect(() => {
        if (!roads || !mapContainerRef.current) return;

        // Cleanup existing instance
        if (mapRef.current) {
            mapRef.current.remove();
            mapRef.current = null;
        }

        // Initialize Map
        const map = L.map(mapContainerRef.current).setView(roads.center, 13);
        mapRef.current = map;

        // L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        //     attribution: '&copy; OpenStreetMap contributors'
        // }).addTo(map);

        const roadLayer = L.featureGroup();
        roads.roads.forEach(road => {
            if (road.coordinates && road.coordinates.length > 0) {
                L.polyline(road.coordinates, {
                    color: '#34d399',
                    weight: 1.5,
                    opacity: 0.7,
                    smoothFactor: 3
                }).addTo(roadLayer);
            }
        });

        roadLayer.addTo(map);

        if (roads.roads.length > 0) {
            map.fitBounds(roadLayer.getBounds(), { padding: [20, 20] });
        }

        return () => {
            if (mapRef.current) {
                mapRef.current.remove();
                mapRef.current = null;
            }
        };
    }, [roads]);

    // MARK: - handleFormSubmit
    const handleFormSubmit = async (event) => {
        event.preventDefault();
        // clear all previous data
        setSuggestions([]);
        setError(null);
        setIsLoading(true);

         const baseUrl = "https://nominatim.openstreetmap.org/search";
        const params = new URLSearchParams({
            q: inputValue,
            format: "json",
            limit: "5",
            polygon_geojson: "1",
            "accept-language": "en"
        });

        try {
            const response = await fetch(`${baseUrl}?${params.toString()}`, {
                method: 'GET',
                mode: 'cors',
                headers: {
                    "Accept": "application/json",
                    "User-Agent": "first-app-city-lines/v1.0" 
                }
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            const formattedData = data.map((item) => ({
                display_name: item.display_name,
                type: item.type,
                lat: item.lat,
                lon: item.lon,
                osm_id: item.osm_id,
                areaId:
                    item.osm_type === "relation"
                        ? parseInt(item.osm_id) + 3600000000
                        : null,
                bbox: item.boundingbox,
            }));
            setSuggestions(formattedData);
        } catch (error) {
            setError(error.message);
            //regardless
        } finally {
            setIsLoading(false);
        }
    };
    // MARK: - handleCitySelect
    const handleCitySelect = async (city) => {
        if (!city.areaId) {
            setError("No valid city selected");
            return;
        }
        setIsLoading(true);
        setError(null);
        // We use the "Strict" query for a high-quality map skeleton
        const queryFilter = ROAD_QUERIES.STRICT;

        const overpassQuery = `
            [out:json][timeout:90];
            area(${city.areaId})->.searchArea;
            (
              ${queryFilter}(area.searchArea);
            );
            out geom;
        `;

        const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(
            overpassQuery.trim()
        )}`;

        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Overpass error! status: ${response.status}`);
            }
            const data = await response.json();

            if (!data.elements || data.elements.length === 0) {
                setError("No valid city selected");
                return;
            }
            let responseRoads = data.elements
                .filter((el) => el.type === "way" && el.geometry)
                .map((way) => ({
                    id: way.id,
                    type: way.tags.highway,
                    name: way.tags.name || "Unnamed Road",
                    //convert lat/lon to [lat, lon].
                    coordinates: way.geometry.map((p) => [p.lat, p.lon]),
                }));
            setRoadsNetwork({
                cityName: city.display_name,
                center: [parseFloat(city.lat), parseFloat(city.lon)],
                roads: responseRoads,
            });
        } catch (error) {
            setError(`Network error, ${error}`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="page-container">
            <div className={`search-card ${suggestions.length > 0 ? 'has-results' : ''} ${roads ? 'active-map' : ''}`}>
                <h1 className="title">City Explorer</h1>
                <p className="subtitle">Search for a city to view its roads.</p>

                <form onSubmit={handleFormSubmit} className="search-form">
                    <input
                        type="text"
                        className="search-input"
                        value={inputValue}
                        placeholder="Search for a city..."
                        onChange={handleInputChange}
                        disabled={isLoading}
                    />
                    <button type="submit" className="submit-button" disabled={isLoading}>
                        {isLoading ? "Fetching Data..." : "Find City"}
                    </button>
                </form>

                {error && <div className="error-message">✕ {error}</div>}

                <div className="results-container">
                    {suggestions.map((city, index) => (
                        <button
                            key={city.osm_id}
                            className="suggestion-item"
                            style={{ "--item-index": index }}
                            onClick={() => handleCitySelect(city)}
                        >
                            <div className="city-name">{city.display_name}</div>
                            <div className="city-meta">{city.type}</div>
                        </button>
                    ))}
                </div>

                 {roads && (
                    <div className="roads-info">
                        <span>{roads.roads.length.toLocaleString()} segments loaded</span>
                        <button onClick={() => setRoadsNetwork(null)}>Clear View</button>
                    </div>
                )}
            </div>

            <div id="map-container" ref={mapContainerRef}>
                { !roads && !isLoading && (
                    <div className="map-placeholder">Find a city to start exploring</div>
                )}
            </div>
        </div>
    );
}

export default QueryForm;
