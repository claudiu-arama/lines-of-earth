import { ENCLOSED_WATER_TYPES, EXCLUDED_TYPES } from "constants/layerConfigs";

// TODO: replace `any` with proper types
export const responseRoads = (newData: any) =>
  newData?.elements.reduce(
    (acc: any, el: any) => {
      if (!["way", "relation", "node"].includes(el.type)) return acc;

      const tags = el.tags || {};
      const category =
        tags.amenity ||
        tags.leisure ||
        tags.natural ||
        tags.attraction ||
        tags.tourism ||
        tags.historic ||
        tags.building ||
        tags.railway ||
        tags.highway ||
        tags.water ||
        tags.waterway ||
        "unclassified";

      // TODO: replace `any` with proper types
      const updateBounds = (p: any) => {
        if (p.lat < acc.bounds.minLat) acc.bounds.minLat = p.lat;
        if (p.lat > acc.bounds.maxLat) acc.bounds.maxLat = p.lat;
        if (p.lon < acc.bounds.minLon) acc.bounds.minLon = p.lon;
        if (p.lon > acc.bounds.maxLon) acc.bounds.maxLon = p.lon;
      };

      // TODO: replace `any` with proper types
      const processGeometry = (geometry: any, type: any) => {
        if (!geometry || geometry.length < 2) return null;
        if (EXCLUDED_TYPES.has(type)) return null;
        geometry.forEach(updateBounds);
        const first = geometry[0];
        const last = geometry[geometry.length - 1];
        // TODO: replace `any` with proper types
        const isActuallyClosed =
          (first.lat === last.lat && first.lon === last.lon) ||
          (ENCLOSED_WATER_TYPES as any).has(type);
        return {
          type: category,
          isClosed: isActuallyClosed,
          // TODO: replace `any` with proper types
          coordinates: geometry.map((p: any) => [p.lat, p.lon])
        };
      };

      // TODO: replace `any` with proper types
      const chainOuterWays = (members: any) => {
        const outerWays = members.filter(
          (m: any) =>
            m.type === "way" && m.role === "outer" && m.geometry?.length >= 2
        );

        if (!outerWays.length) return null;

        const chain = [...outerWays[0].geometry];
        const remaining = outerWays.slice(1);

        while (remaining.length) {
          const lastPoint = chain[chain.length - 1];

          // TODO: replace `any` with proper types
          const nextIdx = remaining.findIndex((w: any) => {
            const first = w.geometry[0];
            const last = w.geometry[w.geometry.length - 1];
            return (
              (first.lat === lastPoint.lat && first.lon === lastPoint.lon) ||
              (last.lat === lastPoint.lat && last.lon === lastPoint.lon)
            );
          });

          if (nextIdx === -1) break; // gap in data, stop chaining

          const next = remaining.splice(nextIdx, 1)[0];
          const first = next.geometry[0];

          // Reverse if the way connects at its end rather than its start
          const coords =
            first.lat === lastPoint.lat && first.lon === lastPoint.lon
              ? next.geometry
              : [...next.geometry].reverse();

          chain.push(...coords.slice(1)); // skip first point to avoid duplicate
        }

        return chain;
      };

      if (el.type === "way") {
        const road = processGeometry(el.geometry, category);
        if (road) acc.roads.push(road);
      } else if (el.type === "relation" && el.members) {
        const isWaterRelation =
          el.tags?.natural === "water" || el.tags?.waterway === "riverbank";

        if (isWaterRelation) {
          const chain = chainOuterWays(el.members);
          if (chain) {
            const road = processGeometry(chain, category);
            if (road) acc.roads.push({ ...road, isClosed: true });
          }
        } else {
          // TODO: replace `any` with proper types
          el.members.forEach((member: any) => {
            if (member.type === "way") {
              const road = processGeometry(member.geometry, category);
              if (road) acc.roads.push(road);
            }
          });
        }
      }

      return acc;
    },
    {
      roads: [],
      bounds: { minLat: 90, maxLat: -90, minLon: 180, maxLon: -180 }
    }
  );
