import { SETTINGS_HEIGHT } from "../constants";
import type { SearchItem, ViewType } from "../types";

const FAVORITES_HEIGHT = 600;

interface UseActionHandlerParams {
  setView: (view: ViewType) => void;
  setQuery: (query: string) => void;
  setSelectedIndex: (index: number) => void;
  query: string;
}

/**
 * 操作处理 Hook
 */
export function useActionHandler({
  setView,
  setQuery,
  setSelectedIndex,
  query
}: UseActionHandlerParams): (item: SearchItem) => Promise<void> {
  const performAction = async (item: SearchItem): Promise<void> => {
    if (!item) return;

    if (item.action === "settings") {
      setView("settings");
      setSelectedIndex(0);
      window.electronAPI?.resizeWindow(SETTINGS_HEIGHT);
      return;
    }

    if (item.action === "favorites") {
      setView("favorites");
      setSelectedIndex(0);
      window.electronAPI?.resizeWindow(FAVORITES_HEIGHT);
      return;
    }

    if (item.action === "open-favorite") {
      if (item.url && window.electronAPI?.openExternal) {
        await window.electronAPI.openExternal(item.url);
      }
      setQuery("");
      setSelectedIndex(0);
      window.electronAPI?.hideWindow();
      return;
    }

    if (item.action === "open-project") {
      if (item.projectPath && window.electronAPI?.openProjectInEditor) {
        await window.electronAPI.openProjectInEditor(item.projectPath);
      }
      setQuery("");
      setSelectedIndex(0);
      window.electronAPI?.hideWindow();
      return;
    }

    if (item.action === "terminal") {
      if (window.electronAPI?.openTerminal) {
        await window.electronAPI.openTerminal();
      }
      setQuery("");
      setSelectedIndex(0);
      window.electronAPI?.hideWindow();
      return;
    }

    if (item.action === "calc") {
      const expr = query.trim();
      const safeExpr = expr.replace(/[^0-9+\-*/().]/g, "");
      if (!safeExpr) return;
      try {
        // eslint-disable-next-line no-eval
        const result = eval(safeExpr) as number;
        if (typeof result === "number" && !Number.isNaN(result)) {
          window.electronAPI?.writeClipboardText(String(result));
        }
      } catch (e) {
        // ignore eval error
      }
      setQuery("");
      setSelectedIndex(0);
      window.electronAPI?.hideWindow();
      return;
    }

    if (item.action === "google") {
      const q = item.query || query;
      const url = `https://www.google.com/search?q=${encodeURIComponent(q)}`;
      await window.electronAPI?.openExternal(url);
      setQuery("");
      setSelectedIndex(0);
      window.electronAPI?.hideWindow();
      return;
    }

    // 其他快速操作：这里只是示意，真实项目中可以根据平台启动应用
    if (["photoshop", "notepad", "safari"].includes(item.action)) {
      // 这里暂时使用 web 搜索代替真正打开应用的逻辑
      const url = `https://www.google.com/search?q=${encodeURIComponent(item.title)}`;
      await window.electronAPI?.openExternal(url);
      setQuery("");
      setSelectedIndex(0);
      window.electronAPI?.hideWindow();
    }
  };

  return performAction;
}

