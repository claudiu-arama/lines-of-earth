import { useEffect } from "react";

export const useCenterCanvas = (canvasRef, lastSizeRef, setTransform, showFrame, frameOrientation) => {
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const frame = requestAnimationFrame(() => {
            const newW = canvas.clientWidth;
            const newH = canvas.clientHeight;

            // Get prev
            const { w: oldW, h: oldH } = lastSizeRef.current;

            if (newW === 0 || newH === 0 || oldW === 0) {
                // save on initial load
                lastSizeRef.current = { w: newW, h: newH };
                return;
            }

            // update with new values
            canvas.width = newW;
            canvas.height = newH;

            // update ref
            lastSizeRef.current = { w: newW, h: newH };

            setTransform((prev) => {
                if (prev.scale === 0) return prev;

                //get old center
                const worldCX = (oldW / 2 - prev.x) / prev.scale;
                const worldCY = (oldH / 2 - prev.y) / prev.scale;

                // keep center
                return {
                    ...prev,
                    x: newW / 2 - worldCX * prev.scale,
                    y: newH / 2 - worldCY * prev.scale,
                };
            });

        });

        return () => cancelAnimationFrame(frame);
    }, [showFrame, frameOrientation]);
};
