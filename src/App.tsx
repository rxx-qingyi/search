import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
import { listBookmarks } from "./services/bookmarks";

const FAVORITES_HEIGHT = 600;

function App(): JSX.Element {
  const [query, setQuery] = useState<string>("");
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [view, setView] = useState<ViewType>("search");
  const [projectRoot, setProjectRoot] = useState<string>("");
  const [isComposing, setIsComposing] = useState<boolean>(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [favoriteSites, setFavoriteSites] = useState<FavoriteSite[]>(() => {
    try {
      const stored = localStorage.getItem("favoriteSites");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const [authToken, setAuthToken] = useState<string>(() => {
    try {
      return localStorage.getItem("authToken") || "";
    } catch {
      return "";
    }
  });
  const [authUsername, setAuthUsername] = useState<string>(() => {
    try {
      return localStorage.getItem("authUsername") || "";
    } catch {
      return "";
    }
  });
  const [isSyncingFavorites, setIsSyncingFavorites] = useState(false);
  const [favoriteSyncMessage, setFavoriteSyncMessage] = useState("");
  const isLoggedIn = Boolean(authToken);
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

  // 保存登录 token
  useEffect(() => {
    try {
      if (authToken) {
        localStorage.setItem("authToken", authToken);
      } else {
        localStorage.removeItem("authToken");
      }
    } catch (e) {
      console.error("Failed to save auth token:", e);
    }
  }, [authToken]);

  useEffect(() => {
    try {
      if (authUsername) {
        localStorage.setItem("authUsername", authUsername);
      } else {
        localStorage.removeItem("authUsername");
      }
    } catch (e) {
      console.error("Failed to save auth username:", e);
    }
  }, [authUsername]);

  const refreshFavoritesFromServer = useCallback(
    async (reason: "init" | "login" | "manual" | "after-add" = "manual"): Promise<void> => {
      if (!authToken) {
        setFavoriteSyncMessage("未登录，使用本地收藏");
        return;
      }
      setIsSyncingFavorites(true);
      setFavoriteSyncMessage(
        reason === "init" || reason === "login" ? "正在加载收藏..." : "正在刷新收藏..."
      );
      try {
        const list = await listBookmarks(authToken);
        const mapped: FavoriteSite[] = (list || [])
          .map((item) => ({
            id: item.id || item.url || item.name || Date.now().toString(),
            name: item.name,
            url: item.url,
            keywords: item.keywords
          }))
          .filter((item) => Boolean(item.name && item.url));
        setFavoriteSites(mapped);
        setFavoriteSyncMessage("已从服务器获取收藏");
      } catch (e) {
        console.error("Failed to fetch bookmarks:", e);
        setFavoriteSyncMessage("获取收藏失败，已使用本地缓存");
      } finally {
        setIsSyncingFavorites(false);
      }
    },
    [authToken, setFavoriteSites]
  );

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

    // 中文输入法选词时不执行快捷键
    if (e.nativeEvent.isComposing || isComposing) {
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

  // 登录成功
  const handleLoginSuccess = (token: string, username?: string): void => {
    setAuthToken(token);
    if (username) {
      setAuthUsername(username);
    }
  };

  // 退出登录
  const handleLogout = (): void => {
    setAuthToken("");
    setAuthUsername("");
  };

  // 启动时如果已登录，拉取收藏列表
  useEffect(() => {
    if (authToken) {
      void refreshFavoritesFromServer("init");
    }
  }, [authToken, refreshFavoritesFromServer]);

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
        className={view === "search" ? "drag-bar--plain" : "drag-bar--colored"}
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
          onCompositionStart={() => setIsComposing(true)}
          onCompositionEnd={() => setIsComposing(false)}
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
          authToken={authToken}
          authUsername={authUsername}
          onLoginSuccess={handleLoginSuccess}
          onLogout={handleLogout}
        />
      )}
      {view === "favorites" && (
        <FavoritesView
          favoriteSites={favoriteSites}
          setFavoriteSites={setFavoriteSites}
          isLoggedIn={isLoggedIn}
          authToken={authToken}
          onRefreshFromServer={() => refreshFavoritesFromServer("manual")}
          isSyncingFavorites={isSyncingFavorites}
          favoriteSyncMessage={favoriteSyncMessage}
          onBack={handleBackToSearch}
        />
      )}
    </div>
  );
}

export default App;

