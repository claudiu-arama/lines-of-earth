import { useEffect, useRef } from "react";

import type {
  CanvasCoords,
  DrawScene,
  Position
} from "../../types/globals.types";

import { debounce } from "./../../helpers/utilities";

interface CameraState {
  isDragging: boolean;
  isPinchZooming: boolean;
  rafId: number | null;
  lastX: number;
  lastY: number;
  pendingPanX: number;
  pendingPanY: number;
  pendingZoom: {
    factor: number;
    x: number;
    y: number;
    panX: number;
    panY: number;
  } | null;
  pointers: Map<number, Position>;
  lastPinchDist: number;
  lastPinchMid: Position;
  canvasRect: DOMRect | null;
  needsFullDraw: boolean;
}

export const useCameraControls = (
  canvasRef: React.RefObject<HTMLCanvasElement>,
  transformRef: React.RefObject<CanvasCoords>,
  drawScene: DrawScene
) => {
  const drawSceneRef = useRef(drawScene.drawScene);
  const drawSceneFullRef = useRef(drawScene.drawSceneFull);

  useEffect(() => {
    drawSceneRef.current = drawScene.drawScene;
    drawSceneFullRef.current = drawScene.drawSceneFull;
  }, [drawScene.drawScene, drawScene.drawSceneFull]);

  useEffect(() => {
    const canvas = canvasRef?.current;
    if (!canvas) return;

    const state: CameraState = {
      isDragging: false,
      isPinchZooming: false,
      rafId: null,
      lastX: 0,
      lastY: 0,
      pendingPanX: 0,
      pendingPanY: 0,
      pendingZoom: null,
      pointers: new Map(),
      lastPinchDist: 0,
      lastPinchMid: { x: 0, y: 0 },
      canvasRect: null,
      needsFullDraw: false
    };

    const debouncedFullDraw = debounce(() => {
      if (state.isDragging || state.isPinchZooming) {
        scheduleFrame(true);
      }
    }, 50);

    const applyPendingTransforms = () => {
      const transf = transformRef.current;
      if (!transf) return;

      let hasChanges = false;

      if (state.pendingZoom) {
        const { factor, x, y, panX, panY } = state.pendingZoom;

        transf.x = x - (x - transf.x) * factor;
        transf.y = y - (y - transf.y) * factor;
        transf.scale *= factor;

        transf.x += panX;
        transf.y += panY;

        state.pendingZoom = null;
        state.needsFullDraw = true;
        hasChanges = true;
      }

      if (state.pendingPanX !== 0 || state.pendingPanY !== 0) {
        transf.x += state.pendingPanX;
        transf.y += state.pendingPanY;
        state.pendingPanX = 0;
        state.pendingPanY = 0;
        hasChanges = true;
      }

      if (hasChanges || state.needsFullDraw) {
        if (state.needsFullDraw) {
          drawSceneFullRef.current();
          state.needsFullDraw = false;
        } else {
          drawSceneRef.current();
        }
      }
    };

    const scheduleFrame = (forceFullDraw = false) => {
      if (forceFullDraw) {
        state.needsFullDraw = true;
      }
      if (state.rafId) return;

      state.rafId = requestAnimationFrame(() => {
        state.rafId = null;
        applyPendingTransforms();
      });
    };

    const panTo = (clientX: number, clientY: number) => {
      state.pendingPanX += clientX - state.lastX;
      state.pendingPanY += clientY - state.lastY;
      state.lastX = clientX;
      state.lastY = clientY;
      scheduleFrame(false);
    };

    const queueZoom = (zoomConfig: CameraState["pendingZoom"]) => {
      if (state.pendingZoom) {
        state.pendingZoom = {
          factor:
            state.pendingZoom.factor *
            (zoomConfig && zoomConfig.factor ? zoomConfig.factor : 1),
          x: zoomConfig && zoomConfig.x ? zoomConfig.x : 0,
          y: zoomConfig && zoomConfig.y ? zoomConfig.y : 0,
          panX:
            state.pendingZoom.panX +
            (zoomConfig && zoomConfig.panX ? zoomConfig.panX : 0),
          panY:
            state.pendingZoom.panY +
            (zoomConfig && zoomConfig.panY ? zoomConfig.panY : 0)
        };
      } else {
        state.pendingZoom = {
          factor: zoomConfig.factor,
          x: zoomConfig.centerX,
          y: zoomConfig.centerY,
          panX: zoomConfig.panX,
          panY: zoomConfig.panY
        };
      }
      scheduleFrame(true);
    };
    const handlePointerDown = (e: PointerEvent) => {
      if (e.cancelable) e.preventDefault();

      state.pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

      if (!state.canvasRect) {
        state.canvasRect = canvas.getBoundingClientRect();
      }

      if (state.pointers.size === 1) {
        state.isDragging = true;
        state.isPinchZooming = false;
        state.lastX = e.clientX;
        state.lastY = e.clientY;
        canvas.style.cursor = "grabbing";
      } else if (state.pointers.size === 2) {
        state.isDragging = false;
        state.isPinchZooming = true;

        // TODO: replace `any` with proper types
        const pts: Position[] = Array.from(state.pointers.values());
        state.lastPinchDist = Math.hypot(
          pts[1].x - pts[0].x,
          pts[1].y - pts[0].y
        );
        state.lastPinchMid = {
          x: (pts[0].x + pts[1].x) / 2,
          y: (pts[0].y + pts[1].y) / 2
        };
      }
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (!state.pointers.has(e.pointerId)) return;
      state.pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

      if (state.pointers.size === 1 && state.isDragging) {
        panTo(e.clientX, e.clientY);
        debouncedFullDraw();
      } else if (state.pointers.size === 2 && state.isPinchZooming) {
        const pts: Position[] = Array.from(state.pointers.values());
        const curDist = Math.hypot(pts[1].x - pts[0].x, pts[1].y - pts[0].y);
        const curMidX = (pts[0].x + pts[1].x) / 2;
        const curMidY = (pts[0].y + pts[1].y) / 2;

        if (state.lastPinchDist > 0) {
          const factor = curDist / state.lastPinchDist;
          const centerX = curMidX - (state?.canvasRect?.left ?? 0);
          const centerY = curMidY - (state?.canvasRect?.top ?? 0);
          const panX = curMidX - state.lastPinchMid.x;
          const panY = curMidY - state.lastPinchMid.y;

          queueZoom({ factor, x: centerX, y: centerY, panX, panY });
        }

        state.lastPinchDist = curDist;
        state.lastPinchMid = { x: curMidX, y: curMidY };
      }
    };

    const handlePointerUp = (e: PointerEvent) => {
      state.pointers.delete(e.pointerId);

      if (state.pointers.size === 0) {
        state.isDragging = false;
        state.isPinchZooming = false;
        state.canvasRect = null;
        canvas.style.cursor = "grab";

        debouncedFullDraw.cancel();
        if (state.rafId) {
          cancelAnimationFrame(state.rafId);
          state.rafId = null;
        }

        state.needsFullDraw = true;
        applyPendingTransforms();
      } else if (state.pointers.size === 1) {
        state.isPinchZooming = false;
        state.isDragging = true;

        const [remainingPointer] = state.pointers.values();
        state.lastX = remainingPointer.x;
        state.lastY = remainingPointer.y;
      }
    };

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();

      const rect = state.canvasRect || canvas.getBoundingClientRect();
      const factor = Math.pow(1.1, -e.deltaY / 50);
      const centerX = e.clientX - rect.left;
      const centerY = e.clientY - rect.top;

      queueZoom({ factor, centerX, centerY, panX: 0, panY: 0 });
    };

    canvas.addEventListener("pointerdown", handlePointerDown, {
      passive: false
    });
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    window.addEventListener("pointercancel", handlePointerUp);
    canvas.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      canvas.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("pointercancel", handlePointerUp);
      canvas.removeEventListener("wheel", handleWheel);

      if (state.rafId) cancelAnimationFrame(state.rafId);
      debouncedFullDraw.cancel();
    };
  }, []);
};
