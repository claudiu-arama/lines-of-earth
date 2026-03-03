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