import { useLayoutEffect } from "react";
import { debounce } from "../../helpers/utilities";

export const useCanvasResizer = (canvasRef, containerRef, setTransform) => {
    useLayoutEffect(() => {
        const update = () => {
            const canvas = canvasRef.current;
            const container = containerRef.current;
            if (!canvas) return;
            const w = canvas.clientWidth;
            const h = canvas.clientHeight;
            const rect = container.getBoundingClientRect();
            const dpr = window.devicePixelRatio || 1;

            if (w === 0 || h === 0) return;
            canvas.width = rect.width * dpr;
            canvas.height = rect.height * dpr;
            setTransform((t) => ({ ...t }));
        };
        const debouncedUpdate = debounce(update, 100);
        window.addEventListener("resize", debouncedUpdate);
        update();
        return () => window.removeEventListener("resize", debouncedUpdate);
    }, []);
}