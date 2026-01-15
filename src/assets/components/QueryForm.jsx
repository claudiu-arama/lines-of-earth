import { useState } from 'react';
import './QueryForm.scss';

function QueryForm() {
    const [inputValue, setInputValue] = useState("");
    const [suggestions, setSuggestions] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleInputChange = (event) => {
        const inputData = event.target.value.trim();
        if (inputData.includes(">") || inputData.includes("<")) {
            setError("Use of the special characters is not permitted.");
            return;
        }
        setInputValue(inputData);
    };

    const handleFormSubmit = async (event) => {
        event.preventDefault();
        // clear all previous data
        setSuggestions([]);
        setError(null);
        setIsLoading(true);

    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(inputValue)}&format=json&limit=5&polygon_geojson=1`;

        try {
            const response = await fetch(url,
                {
                    headers: {
                        "User-Agent": "First-app-lines-of-earth/1.0"
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
                areaId: item.osm_type === 'relation' ? parseInt(item.osm_id) + 3600000000 : null,
                bbox: item.boundingbox
            }))
            setSuggestions(formattedData);
        } catch (error) {
            setError(error.message);
            //always
        } finally {
            setIsLoading(false);
        }
    }

    return (
    <div className="page-container">
      <div className="search-card">
        <h1 className="title">City Explorer</h1>
        <p className="subtitle">
          First enter your city name.
        </p>

        <form onSubmit={handleFormSubmit} className="search-form">
          <input 
            type="text" 
            className="search-input"
            value={inputValue} 
            placeholder="Search for a city..." 
            onChange={handleInputChange} 
            disabled={isLoading}
          />
          
          <button type='submit' className="submit-button" disabled={isLoading}>
            {isLoading ? 'Searching...' : 'Find City'}
          </button>
        </form>

        {error && <p className="error-message">{error}</p>}

        <div className="results-container">
          {suggestions.map((city) => (
            <button 
              key={city.osm_id} 
              className="suggestion-item"
              disabled={!city.areaId}
            >
              <div className="city-name">{city.display_name}</div>
              <div className="city-meta">
                Type : {city.type} <br />
                Lat: {city.lat} | Lon: {city.lon} <br />
                OSM ID: {city.osm_id} 
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default QueryForm;