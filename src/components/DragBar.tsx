import React from "react";

interface DragBarProps {
  onMouseDown: (e: React.MouseEvent) => void;
  onMouseMove: (e: React.MouseEvent) => void;
  onMouseUp: () => void;
  className?: string;
}

/**
 * 拖动条组件
 */
export function DragBar({ onMouseDown, onMouseMove, onMouseUp, className }: DragBarProps): JSX.Element {
  return (
    <div
      className={["drag-bar", className].filter(Boolean).join(" ")}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
    />
  );
}

