export const responseRoads = (newData) => newData?.elements.reduce((acc, el) => {
            if (el.type !== "way" || !el.geometry) return acc;
            // Calculate bounds locally
            el.geometry.forEach(p => {
                const { lat, lon } = p;
                if (lat < acc.bounds.minLat) acc.bounds.minLat = lat;
                if (lat > acc.bounds.maxLat) acc.bounds.maxLat = lat;
                if (lon < acc.bounds.minLon) acc.bounds.minLon = lon;
                if (lon > acc.bounds.maxLon) acc.bounds.maxLon = lon;
            });
            acc.roads.push({
                type: el.tags?.highway || "unclassified",
                //roundabouts
                isClosed: el.nodes[0] === el.nodes[el.nodes.length - 1],
                coordinates: el.geometry.map(p => [p.lat, p.lon])
            });
            return acc;
        }, { roads: [], bounds: { minLat: 90, maxLat: -90, minLon: 180, maxLon: -180 } });