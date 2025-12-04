import { useState } from "react";
import type { Project, FavoriteSite } from "../types";

interface SettingsViewProps {
  projectRoot: string;
  projects: Project[];
  favoriteSites: FavoriteSite[];
  onBack: () => void;
  onSelectProjectRoot: () => Promise<void>;
  onOpenFavorites: () => void;
}

/**
 * 设置视图组件
 */
export function SettingsView({
  projectRoot,
  projects,
  favoriteSites,
  onBack,
  onSelectProjectRoot,
  onOpenFavorites
}: SettingsViewProps): JSX.Element {
  const [statusBarMode, setStatusBarMode] = useState(false);

  return (
    <div className="settings-root">
      <div className="settings-header">
        <span className="settings-title">设置</span>
        <button className="settings-close" onClick={onBack}>
          返回
        </button>
      </div>
      <div className="settings-content">
        <div className="settings-section">
          <div className="settings-section-title">通用</div>
          <label className="settings-field">
            <span className="settings-label">启动时自动运行</span>
            <input type="checkbox" />
          </label>
          <label className="settings-field">
            <span className="settings-label">在状态栏显示图标</span>
            <input
              type="checkbox"
              checked={statusBarMode}
              onChange={(e) => {
                const enabled = e.target.checked;
                setStatusBarMode(enabled);
                window.electronAPI?.setStatusBarMode(enabled);
              }}
            />
          </label>
          <div style={{ fontSize: 11, color: "#999", marginTop: 4 }}>
            开启后，可以通过屏幕顶部状态栏图标快速打开/隐藏搜索窗口。
          </div>
        </div>
        <div className="settings-section">
          <div className="settings-section-title">搜索</div>
          <label className="settings-field">
            <span className="settings-label">默认搜索引擎</span>
            <select className="settings-input">
              <option value="google">Google</option>
            </select>
          </label>
          <label className="settings-field">
            <span className="settings-label">最大显示结果数</span>
            <input className="settings-input" type="number" min="1" max="10" defaultValue="3" />
          </label>
        </div>
        <div className="settings-section">
          <div className="settings-section-title">项目快速打开</div>
          <div className="settings-field">
            <span className="settings-label">项目根目录</span>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span
                style={{
                  maxWidth: 220,
                  fontSize: 12,
                  color: "#666",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis"
                }}
                title={projectRoot || "未选择"}
              >
                {projectRoot || "未选择"}
              </span>
              <button className="settings-close" onClick={onSelectProjectRoot}>
                选择...
              </button>
            </div>
          </div>
          {projects.length > 0 && (
            <div style={{ marginTop: 8 }}>
              <div
                style={{
                  fontSize: 12,
                  color: "#999",
                  marginBottom: 4
                }}
              >
                已检测到 {projects.length} 个项目：
              </div>
              <ul
                style={{
                  maxHeight: 200,
                  overflowY: "auto",
                  fontSize: 12,
                  color: "#555",
                  paddingLeft: 14,
                  margin: 0
                }}
              >
                {projects.map((p) => (
                  <li key={p.path}>{p.name}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
        <div className="settings-section">
          <div className="settings-section-title">收藏网站</div>
          <div className="settings-field">
            <span className="settings-label">管理收藏网站</span>
            <button className="settings-close" onClick={onOpenFavorites}>
              打开收藏管理
            </button>
          </div>
          {favoriteSites.length > 0 && (
            <div style={{ fontSize: 12, color: "#666", marginTop: 4 }}>
              当前有 {favoriteSites.length} 个收藏网站
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

