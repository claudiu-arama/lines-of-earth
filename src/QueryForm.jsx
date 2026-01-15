import { useState } from 'react';

function QueryForm() {
    const [inputValue, setInputValue] = useState("");
    const [suggestions, setSuggestions] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleInputChange = (event) => {
        const inputData = event.target.value.trim();
        if (inputData.includes(">") || inputData.includes("<")) {
            setError("Use of the special chars is not permitted.");
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
        <>
            <form onSubmit={handleFormSubmit}>
                <label htmlFor="searchInput">Search:</label>
                <input type="text" max-length="50" id="searchInput" value={inputValue} placeholder="start by searching for a city" onChange={handleInputChange} />
                <button type='submit'>Submit</button>
            </form>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <div style={{ marginTop: '20px' }}>
            {suggestions.length > 0 && (
            <ul style={{ listStyle: 'none', padding: 0 }}>
                {suggestions.map((city) => (
                <li key={city.osm_id} style={{ marginBottom: '10px', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
                    <strong>{city.display_name}</strong>
                    <br />
                    <small>Type: {city.type} | ID: {city.osm_id}</small>
                    <br />
                    <small>Lat: {city.lat} | Lon: {city.lon}</small>
                </li>
                ))}
            </ul>
            )}
        </div>
        </>
    );
}

export default QueryForm;