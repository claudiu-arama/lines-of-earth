import type { Point } from "./utilities";

export const projectCoordinateToMeters = (latitude: number, longitude: number, centerLat: number, centerLon: number, scale: number): Point => {

    const EARTH_RADIUS_METERS = 6378137;
    const DEGREES_TO_RADIANS = Math.PI / 180;

    const longitudeDeltaInRadians = (longitude - centerLon) * DEGREES_TO_RADIANS;
    const latitudeInRadians = centerLat * DEGREES_TO_RADIANS;
    
    const x = longitudeDeltaInRadians * EARTH_RADIUS_METERS * Math.cos(latitudeInRadians);

    const latitudeDeltaInRadians = (latitude - centerLat) * DEGREES_TO_RADIANS;
    
    const y = -1 * (latitudeDeltaInRadians * EARTH_RADIUS_METERS);

    return [x * scale, y * scale];
};

export const pointInPolygon = ([px, py], polygon) => {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [xi, yi] = polygon[i];
    const [xj, yj] = polygon[j];
    const intersects = ((yi > py) !== (yj > py))
      && (px < (xj - xi) * (py - yi) / (yj - yi) + xi);
    if (intersects) inside = !inside;
  }
  return inside;
};