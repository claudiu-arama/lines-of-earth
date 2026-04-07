export function useTest() {


    useEffect(() => {
            if (!processedData) {
                //early return
                setPathObjects(null);
                return;
            }
            const startTime = performance.now();
            const { roads, bounds } = processedData;
            const { clientWidth:width, clientHeight:height } = containerRef.current;
    
            const maxSpanLong = bounds.maxLat - bounds.minLat;
            const maxSpanLat = bounds.maxLon - bounds.minLon;
            const MaxSpan = maxSpanLong > maxSpanLat ? maxSpanLong : maxSpanLat;
    
            const scaleConstant = 0.0000018;
            const calculatedScale = (width / MaxSpan) * scaleConstant;
        
            const centerLat = (bounds.minLat + bounds.maxLat) / 2;
            const centerLon = (bounds.minLon + bounds.maxLon) / 2;
            
            // create a Path2D object for main and minor roads to act as buffer
            const mainPaths = new Path2D();
            const minorPaths = new Path2D();
            //process roads
            roads.forEach(road => {
                //project first to meters
                const projectedPoints = road.coordinates.map(p => 
                    projectCoordinateToMeters(p[0], p[1], centerLat, centerLon, 5)
                );
    
                // simplifyt to reduce points and aid CPU - scale 2m
                const simplified = simplifyPath(projectedPoints, 2.0);
                // if not road skip
                if (simplified.length < 2) return;
                
                const isMain = ["motorway", "trunk", "primary", "secondary"].includes(road.type);
                const targetPath = isMain ? mainPaths : minorPaths;
                
                targetPath.moveTo(simplified[0][0], simplified[0][1]);
                for (let i = 1; i < simplified.length; i++) {
                    targetPath.lineTo(simplified[i][0], simplified[i][1]);
                }
                if (road.isClosed) targetPath.closePath();
            });
            
            setPathObjects({ mainPaths, minorPaths });
            setRenderDuration((performance.now() - startTime).toFixed(2));
            // Reset camera to center
            if (containerRef.current) {
                const cx = containerRef.current.clientWidth / 2;
                const cy = containerRef.current.clientHeight / 2;
                setTransform({ scale: calculatedScale, x: cx, y: cy });
            }
        }, [processedData]);

        return {
            renderDuration,
            mainPaths, minorPaths
        }
}