export const responseRoads = (newData) => newData?.elements.reduce((acc, el) => {
    if (!["way", "relation", "node"].includes(el.type)) return acc;

    const tags = el.tags || {};
    let category = tags.amenity || tags.leisure || tags.tourism || tags.historic || tags.building || tags.railway || tags.highway || "unclassified";

    const updateBounds = (p) => {
        if (p.lat < acc.bounds.minLat) acc.bounds.minLat = p.lat;
        if (p.lat > acc.bounds.maxLat) acc.bounds.maxLat = p.lat;
        if (p.lon < acc.bounds.minLon) acc.bounds.minLon = p.lon;
        if (p.lon > acc.bounds.maxLon) acc.bounds.maxLon = p.lon;
    };

    const processGeometry = (geometry) => {
        if (!geometry || geometry.length < 2) return null;
        geometry.forEach(updateBounds);
        
        const first = geometry[0];
        const last = geometry[geometry.length - 1];
        const isActuallyClosed = first.lat === last.lat && first.lon === last.lon;

        return {
            type: category,
            isClosed: isActuallyClosed,
            coordinates: geometry.map(p => [p.lat, p.lon])
        };
    };

    if (el.type === "way") {
        const road = processGeometry(el.geometry);
        if (road) acc.roads.push(road);
    } 
    else if (el.type === "relation" && el.members) {
        el.members.forEach(member => {
            if (member.type === "way") {
                const road = processGeometry(member.geometry);
                if (road) acc.roads.push(road);
            }
        });
    }

    return acc;
}, { roads: [], bounds: { minLat: 90, maxLat: -90, minLon: 180, maxLon: -180 } });