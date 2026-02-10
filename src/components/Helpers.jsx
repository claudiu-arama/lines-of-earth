const findPerpendicularDistance = (p, p1, p2) => {
        const x = p[0], y = p[1], x1 = p1[0], y1 = p1[1], x2 = p2[0], y2 = p2[1];
        const num = Math.abs((y2 - y1) * x - (x2 - x1) * y + x2 * y1 - y2 * x1);
        const den = Math.sqrt(Math.pow(y2 - y1, 2) + Math.pow(x2 - x1, 2));
        return den === 0 ? 0 : num / den;
    };

export const simplifyDP = (points, epsilon) => {
        if (points.length <= 2) return points;
        let dmax = 0, idx = 0;
        for (let i = 1; i < points.length - 1; i++) {
            const d = findPerpendicularDistance(points[i], points[0], points[points.length - 1]);
            if (d > dmax) { idx = i; dmax = d; }
        }
        return dmax > epsilon 
            ? [...simplifyDP(points.slice(0, idx + 1), epsilon).slice(0, -1), ...simplifyDP(points.slice(idx), epsilon)]
            : [points[0], points[points.length - 1]];
    };

export const project = (coords, bounds, w, h) => {
        const { minLat, maxLat, minLon, maxLon } = bounds;
        const avgLat = (minLat + maxLat) / 2;
        const latScale = 1 / Math.cos(avgLat * Math.PI / 180);
        const lonR = maxLon - minLon, latR = (maxLat - minLat) * latScale;
        const padding = 40;
        const s = Math.min((w - padding * 2) / lonR, (h - padding * 2) / latR);
        const ox = (w - lonR * s) / 2, oy = (h - latR * s) / 2;
        return coords.map(([lat, lon]) => [
            (lon - minLon) * s + ox,
            h - ((lat - minLat) * latScale * s + oy)
        ]);
    };

    export const debounce = (callback, timer, ) => {
        let timerID;
        clearInterval(timer);
        return (...args) => {
            clearInterval(timerID);
            timerID = setTimeout(() => callback(...args), timer);
        }
    }