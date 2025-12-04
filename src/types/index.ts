// 搜索项类型定义
export interface SearchItem {
  type: "action" | "calc" | "web" | "page" | "project" | "favorite";
  icon: string;
  title: string;
  desc: string;
  content: string;
  action: string;
  query?: string;
  projectPath?: string;
  url?: string; // 收藏网站的 URL
  favoriteId?: string; // 收藏网站的 ID
}

// 项目类型定义
export interface Project {
  name: string;
  path: string;
}

// 拖动状态类型定义
export interface DragState {
  isDown: boolean;
  startX: number;
  startY: number;
}

// 收藏网站类型定义
export interface FavoriteSite {
  id: string;
  name: string;
  url: string;
  keywords?: string; // 搜索关键词，用于快速匹配
}

// 视图类型
export type ViewType = "search" | "settings" | "favorites";

// Electron API 类型定义
export interface ElectronAPI {
  onFocusSearch: (callback: () => void) => void;
  hideWindow: () => void;
  resizeWindow: (height: number) => void;
  setStatusBarMode: (enabled: boolean) => void;
  windowDragStart: (coords: { x: number; y: number }) => void;
  windowDrag: (coords: { x: number; y: number }) => void;
  windowDragEnd: () => void;
  openExternal: (url: string) => Promise<void>;
  writeClipboardText: (text: string) => void;
  selectProjectRoot: () => Promise<string | null>;
  readProjects: (rootPath: string) => Promise<Project[]>;
  openProjectInEditor: (projectPath: string) => Promise<void>;
  openTerminal: () => Promise<void>;
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}

