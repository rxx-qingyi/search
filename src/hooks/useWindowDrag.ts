import { useState } from "react";
import type { DragState } from "../types";

interface UseWindowDragReturn {
  dragState: DragState;
  handleDragMouseDown: (e: React.MouseEvent) => void;
  handleDragMouseMove: (e: React.MouseEvent) => void;
  handleDragMouseUp: () => void;
  inputMouseDown: (e: React.MouseEvent) => void;
  inputMouseMove: (e: React.MouseEvent) => void;
  inputMouseUp: () => void;
}

/**
 * 窗口拖动 Hook
 */
export function useWindowDrag(): UseWindowDragReturn {
  const [dragState, setDragState] = useState<DragState>({ isDown: false, startX: 0, startY: 0 });

  const handleDragMouseDown = (e: React.MouseEvent): void => {
    setDragState({ isDown: true, startX: e.screenX, startY: e.screenY });
    window.electronAPI?.windowDragStart({ x: e.screenX, y: e.screenY });
  };

  const handleDragMouseMove = (e: React.MouseEvent): void => {
    if (!dragState.isDown) return;
    window.electronAPI?.windowDrag({ x: e.screenX, y: e.screenY });
  };

  const handleDragMouseUp = (): void => {
    if (!dragState.isDown) return;
    setDragState((s) => ({ ...s, isDown: false }));
    window.electronAPI?.windowDragEnd();
  };

  // 输入框上的拖动：超过 5px 触发拖动
  const inputMouseDown = (e: React.MouseEvent): void => {
    setDragState({ isDown: true, startX: e.screenX, startY: e.screenY });
    window.electronAPI?.windowDragStart({ x: e.screenX, y: e.screenY });
  };

  const inputMouseMove = (e: React.MouseEvent): void => {
    if (!dragState.isDown) return;
    const dx = Math.abs(e.screenX - dragState.startX);
    const dy = Math.abs(e.screenY - dragState.startY);
    if (dx > 5 || dy > 5) {
      window.electronAPI?.windowDrag({ x: e.screenX, y: e.screenY });
    }
  };

  const inputMouseUp = (): void => {
    if (!dragState.isDown) return;
    setDragState((s) => ({ ...s, isDown: false }));
    window.electronAPI?.windowDragEnd();
  };

  return {
    dragState,
    handleDragMouseDown,
    handleDragMouseMove,
    handleDragMouseUp,
    inputMouseDown,
    inputMouseMove,
    inputMouseUp
  };
}

