import { useEffect } from "react";

export const useCameraControls = (canvasRef, lastMousePos, isDragging, rafId, setTransform) => {
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const handleMouseDown = (e) => {
            isDragging.current = true;
            lastMousePos.current = { x: e.clientX, y: e.clientY };
            canvas.style.cursor = "grabbing";
        };

        const handleMouseMove = (e) => {
            if (!isDragging.current) return;
            const deltax = e.clientX - lastMousePos.current.x;
            const deltay = e.clientY - lastMousePos.current.y;
            lastMousePos.current = { x: e.clientX, y: e.clientY };

            if (rafId.current) cancelAnimationFrame(rafId.current);
            rafId.current = requestAnimationFrame(() => {
                setTransform((prev) => ({ ...prev, x: prev.x + deltax, y: prev.y + deltay }));
            });
        };

        const handleMouseUp = () => {
            isDragging.current = false;
            canvas.style.cursor = "grab";
        };

        const handleWheel = (e) => {
            e.preventDefault();
            const factor = Math.pow(1.1, -e.deltaY / 50);
            setTransform((prev) => {
                const rect = canvas.getBoundingClientRect();
                const mouseX = e.clientX - rect.left;
                const mouseY = e.clientY - rect.top;
                return {
                    scale: prev.scale * factor,
                    x: mouseX - (mouseX - prev.x) * factor,
                    y: mouseY - (mouseY - prev.y) * factor,
                };
            });
        };

        canvas.addEventListener("mousedown", handleMouseDown);
        window.addEventListener("mousemove", handleMouseMove);
        window.addEventListener("mouseup", handleMouseUp);
        canvas.addEventListener("wheel", handleWheel, { passive: false });

        return () => {
            canvas.removeEventListener("mousedown", handleMouseDown);
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("mouseup", handleMouseUp);
            canvas.removeEventListener("wheel", handleWheel);
        };
    }, []);
}