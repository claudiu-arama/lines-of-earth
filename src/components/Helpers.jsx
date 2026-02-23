const getSquaredSegmentDistance = (point, segmentStart, segmentEnd) => {
    let startX = segmentStart[0];
    let startY = segmentStart[1];
    
    // set a "vector"
    let deltaX = segmentEnd[0] - startX;
    let deltaY = segmentEnd[1] - startY;

    // if sengment is not a point
    if (deltaX !== 0 || deltaY !== 0) {

        let prejection = ((point[0] - startX) * deltaX + (point[1] - startY) * deltaY) /
                (deltaX * deltaX + deltaY * deltaY);
        // the point is close to the end.
        if (prejection > 1) {
            // The closest part of the line to our point is the END point
            startX = segmentEnd[0];
            startY = segmentEnd[1];
        //the point is close to the start.
        } else if (prejection > 0) {
            // The closest part of the line is somewhere in the MIDDLE
            startX += deltaX * prejection;
            startY += deltaY * prejection;
        }
    }
    // calculate the distance from our point to the closest spot found
    let dx = point[0] - startX;
    let dy = point[1] - startY;
    
    // return the sq distance to keep CPU from sqrt
    return dx * dx + dy * dy;
};

const simplifyDouglasPeuckerStep = (allPoints, startIndex, endIndex, squaredTolerance, simplifiedResults) => {
    let maxSquaredDistance = squaredTolerance;
    let mostDistantIndex = -1;
    // Look at every point start to finish
    for (let i = startIndex + 1; i < endIndex; i++) {
        let currentDistance = getSquaredSegmentDistance(allPoints[i], allPoints[startIndex], allPoints[endIndex]);
        // always remember the farthest point
        if (currentDistance > maxSquaredDistance) {
            mostDistantIndex = i;
            maxSquaredDistance = currentDistance;
        }
    }
    if (mostDistantIndex !== -1) {
       //check for 'bends' between start and 'peak'
        if (mostDistantIndex - startIndex > 1) {
            simplifyDouglasPeuckerStep(allPoints, startIndex, mostDistantIndex, squaredTolerance, simplifiedResults);
        }
        //save the 'peak'
        simplifiedResults.push(allPoints[mostDistantIndex]);
        //check for 'bends' between 'peak' and end
        if (endIndex - mostDistantIndex > 1) {
            simplifyDouglasPeuckerStep(allPoints, mostDistantIndex, endIndex, squaredTolerance, simplifiedResults);
        }
    }
};

export const simplifyPath = (allPoints, distanceThreshold) => {
    // If road only has 2 points no work needed
    if (allPoints.length <= 2) return allPoints;

    const squaredTolerance = distanceThreshold !== undefined
        ? distanceThreshold * distanceThreshold : 1;

    const lastIndex = allPoints.length - 1;

    // keep 1st point
    let simplifiedResults = [allPoints[0]];

    // simplify the rest
    simplifyDouglasPeuckerStep(allPoints, 0, lastIndex, squaredTolerance, simplifiedResults);
    //keep last point
    simplifiedResults.push(allPoints[lastIndex]);

    return simplifiedResults;
};

export const projectCoordinateToMeters = (latitude, longitude, centerLat, centerLon, scale) => {

    const EARTH_RADIUS_METERS = 6378137;
    const DEGREES_TO_RADIANS = Math.PI / 180;

    const longitudeDeltaInRadians = (longitude - centerLon) * DEGREES_TO_RADIANS;
    const latitudeInRadians = centerLat * DEGREES_TO_RADIANS;
    
    const x = longitudeDeltaInRadians * EARTH_RADIUS_METERS * Math.cos(latitudeInRadians);

    const latitudeDeltaInRadians = (latitude - centerLat) * DEGREES_TO_RADIANS;
    
    const y = -1 * (latitudeDeltaInRadians * EARTH_RADIUS_METERS);

    return [x * scale, y * scale];
};

export const debounce = (func, wait) => {
    let timeout;
    return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
};
