import React, { useEffect, useMemo, useRef, useState } from "react";
import { DragBar } from "./components/DragBar";
import { SearchView } from "./components/SearchView";
import { SettingsView } from "./components/SettingsView";
import { FavoritesView } from "./components/FavoritesView";
import { useWindowDrag } from "./hooks/useWindowDrag";
import { useActionHandler } from "./hooks/useActionHandler";
import { filterItems } from "./utils/search";
import { calculateHeight } from "./utils/window";
import { SETTINGS_HEIGHT } from "./constants";
import type { ViewType, Project, FavoriteSite } from "./types";

const FAVORITES_HEIGHT = 600;

function App(): JSX.Element {
  const [query, setQuery] = useState<string>("");
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [view, setView] = useState<ViewType>("search");
  const [projectRoot, setProjectRoot] = useState<string>("");
  const [projects, setProjects] = useState<Project[]>([]);
  const [favoriteSites, setFavoriteSites] = useState<FavoriteSite[]>(() => {
    try {
      const stored = localStorage.getItem("favoriteSites");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const inputRef = useRef<HTMLInputElement>(null);

  // 窗口拖动逻辑
  const {
    handleDragMouseDown,
    handleDragMouseMove,
    handleDragMouseUp,
    inputMouseDown,
    inputMouseMove,
    inputMouseUp
  } = useWindowDrag();

  // 保存收藏网站到 localStorage
  useEffect(() => {
    try {
      localStorage.setItem("favoriteSites", JSON.stringify(favoriteSites));
    } catch (e) {
      console.error("Failed to save favorite sites:", e);
    }
  }, [favoriteSites]);

  // 搜索结果
  const results = useMemo(() => {
    if (view !== "search") return [];
    return filterItems(query, projects, favoriteSites);
  }, [query, view, projects, favoriteSites]);

  // 操作处理
  const performAction = useActionHandler({
    setView,
    setQuery,
    setSelectedIndex,
    query
  });

  // IPC: 焦点控制
  useEffect(() => {
    if (!window.electronAPI) return;
    const handler = (): void => {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 10);
    };
    window.electronAPI.onFocusSearch(handler);
  }, []);

  // 根据结果动态调整高度
  useEffect(() => {
    if (!window.electronAPI) return;
    if (view === "settings") {
      window.electronAPI.resizeWindow(SETTINGS_HEIGHT);
    } else if (view === "favorites") {
      window.electronAPI.resizeWindow(FAVORITES_HEIGHT);
    } else {
      const height = calculateHeight(results.length);
      window.electronAPI.resizeWindow(height);
    }
  }, [results.length, view]);

  // 键盘导航
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    // 设置页面和收藏页面内不处理搜索结果导航
    if (view === "settings" || view === "favorites") {
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => Math.min(prev + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (results[selectedIndex]) {
        performAction(results[selectedIndex]);
      }
    }
  };

  // 设置页面：返回搜索视图
  const handleBackToSearch = (): void => {
    setView("search");
    setQuery("");
    setSelectedIndex(0);
    if (window.electronAPI) {
      const height = calculateHeight(0);
      window.electronAPI.resizeWindow(height);
    }
  };

  // 设置页面：选择项目根目录
  const handleSelectProjectRoot = async (): Promise<void> => {
    if (!window.electronAPI?.selectProjectRoot) return;
    const root = await window.electronAPI.selectProjectRoot();
    if (!root) return;
    setProjectRoot(root);
    if (window.electronAPI.readProjects) {
      const list = await window.electronAPI.readProjects(root);
      setProjects(list || []);
    }
  };

  // 打开收藏页面
  const handleOpenFavorites = (): void => {
    setView("favorites");
    setQuery("");
    setSelectedIndex(0);
    if (window.electronAPI) {
      window.electronAPI.resizeWindow(FAVORITES_HEIGHT);
    }
  };

  return (
    <div className="app-root">
      <DragBar
        onMouseDown={handleDragMouseDown}
        onMouseMove={handleDragMouseMove}
        onMouseUp={handleDragMouseUp}
      />
      {view === "search" && (
        <SearchView
          query={query}
          setQuery={setQuery}
          results={results}
          selectedIndex={selectedIndex}
          setSelectedIndex={setSelectedIndex}
          inputRef={inputRef}
          onKeyDown={handleKeyDown}
          onInputMouseDown={inputMouseDown}
          onInputMouseMove={inputMouseMove}
          onInputMouseUp={inputMouseUp}
          onItemClick={performAction}
        />
      )}
      {view === "settings" && (
        <SettingsView
          projectRoot={projectRoot}
          projects={projects}
          favoriteSites={favoriteSites}
          onBack={handleBackToSearch}
          onSelectProjectRoot={handleSelectProjectRoot}
          onOpenFavorites={handleOpenFavorites}
        />
      )}
      {view === "favorites" && (
        <FavoritesView
          favoriteSites={favoriteSites}
          setFavoriteSites={setFavoriteSites}
          onBack={handleBackToSearch}
        />
      )}
    </div>
  );
}

export default App;

