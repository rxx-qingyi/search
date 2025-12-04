import React from "react";

interface DragBarProps {
  onMouseDown: (e: React.MouseEvent) => void;
  onMouseMove: (e: React.MouseEvent) => void;
  onMouseUp: () => void;
}

/**
 * 拖动条组件
 */
export function DragBar({ onMouseDown, onMouseMove, onMouseUp }: DragBarProps): JSX.Element {
  return (
    <div
      className="drag-bar"
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
    />
  );
}

