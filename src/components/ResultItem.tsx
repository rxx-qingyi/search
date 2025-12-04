import React from "react";
import type { SearchItem } from "../types";

interface ResultItemProps {
  item: SearchItem;
  index: number;
  selectedIndex: number;
  onSelect: (index: number) => void;
  onClick: (item: SearchItem) => void;
}

/**
 * 搜索结果项组件
 */
export function ResultItem({
  item,
  index,
  selectedIndex,
  onSelect,
  onClick
}: ResultItemProps): JSX.Element {
  return (
    <div
      className={"result-item" + (index === selectedIndex ? " selected" : "")}
      onMouseEnter={() => onSelect(index)}
      onClick={() => onClick(item)}
    >
      <div className="result-icon">{item.icon}</div>
      <div className="result-text">
        <div className="result-title">{item.title}</div>
        <div className="result-desc">{item.content}</div>
      </div>
      <div className="result-hint">Enter 执行</div>
    </div>
  );
}

