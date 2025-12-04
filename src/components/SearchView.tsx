import React, { RefObject } from "react";
import { ResultItem } from "./ResultItem";
import { MAX_VISIBLE_ITEMS } from "../constants";
import type { SearchItem } from "../types";

interface SearchViewProps {
  query: string;
  setQuery: (query: string) => void;
  results: SearchItem[];
  selectedIndex: number;
  setSelectedIndex: (index: number) => void;
  inputRef: RefObject<HTMLInputElement>;
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onInputMouseDown: (e: React.MouseEvent<HTMLInputElement>) => void;
  onInputMouseMove: (e: React.MouseEvent<HTMLInputElement>) => void;
  onInputMouseUp: () => void;
  onItemClick: (item: SearchItem) => void;
}

/**
 * 搜索视图组件
 */
export function SearchView({
  query,
  setQuery,
  results,
  selectedIndex,
  setSelectedIndex,
  inputRef,
  onKeyDown,
  onInputMouseDown,
  onInputMouseMove,
  onInputMouseUp,
  onItemClick
}: SearchViewProps): JSX.Element {
  return (
    <>
      <div className="search-container">
        <input
          ref={inputRef}
          className="search-input"
          placeholder="搜索..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setSelectedIndex(0);
          }}
          onKeyDown={onKeyDown}
          onMouseDown={onInputMouseDown}
          onMouseMove={onInputMouseMove}
          onMouseUp={onInputMouseUp}
        />
      </div>
      {results.length > 0 && (
        <>
          <div className="results-container">
            {results.slice(0, MAX_VISIBLE_ITEMS).map((item, index) => (
              <ResultItem
                key={`${item.action}-${index}`}
                item={item}
                index={index}
                selectedIndex={selectedIndex}
                onSelect={setSelectedIndex}
                onClick={onItemClick}
              />
            ))}
          </div>
          {results.length > MAX_VISIBLE_ITEMS && (
            <div className="more-hint">↓ 向下滚动查看更多</div>
          )}
        </>
      )}
    </>
  );
}

