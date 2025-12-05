import { useState } from "react";
import type { Project, FavoriteSite } from "../types";
import { login } from "../services/auth";

interface SettingsViewProps {
  projectRoot: string;
  projects: Project[];
  favoriteSites: FavoriteSite[];
  onBack: () => void;
  onSelectProjectRoot: () => Promise<void>;
  onOpenFavorites: () => void;
  authToken?: string;
  authUsername?: string;
  onLoginSuccess: (token: string, username?: string) => void;
  onLogout: () => void;
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
  onOpenFavorites,
  authToken,
  authUsername,
  onLoginSuccess,
  onLogout
}: SettingsViewProps): JSX.Element {
  const [statusBarMode, setStatusBarMode] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginStatus, setLoginStatus] = useState<string>("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const isLoggedIn = Boolean(authToken);

  const handleLogin = async (): Promise<void> => {
    if (isLoggedIn) {
      setLoginStatus("已登录，无需重复登录");
      return;
    }
    if (!username.trim() || !password.trim()) {
      setLoginStatus("请输入用户名和密码");
      return;
    }
    setIsLoggingIn(true);
    setLoginStatus("登录中...");
    try {
      const resp = await login({ username: username.trim(), password });
      if (resp?.token) {
        const displayName =
          resp.username ||
          (resp as { name?: string }).name ||
          (resp as { user?: { username?: string; name?: string } }).user?.username ||
          (resp as { user?: { username?: string; name?: string } }).user?.name ||
          username.trim();
        onLoginSuccess(resp.token, displayName);
        setUsername(displayName);
        setLoginStatus("登录成功");
      } else {
        setLoginStatus("登录失败：未返回 token");
      }
    } catch (e) {
      console.error("Login failed:", e);
      setLoginStatus("登录失败，请检查账号/密码或网络");
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = (): void => {
    onLogout();
    setLoginStatus("已退出登录");
    setPassword("");
  };

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
          <div className="settings-section-title">账号登录</div>
          {isLoggedIn ? (
            <div className="settings-field">
              <span className="settings-label">当前用户</span>
              <span style={{ fontSize: 13, color: "#333" }}>
                {authUsername || username || "已登录"}
              </span>
            </div>
          ) : (
            <>
              <div className="settings-field">
                <span className="settings-label">用户名</span>
                <input
                  className="settings-input"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="请输入用户名"
                />
              </div>
              <div className="settings-field">
                <span className="settings-label">密码</span>
                <input
                  className="settings-input"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="请输入密码"
                />
              </div>
            </>
          )}
          <div className="settings-field" style={{ gap: 8 }}>
            <button className="settings-close" onClick={handleLogin} disabled={isLoggingIn || isLoggedIn}>
              {isLoggedIn ? "已登录" : isLoggingIn ? "登录中..." : "登录"}
            </button>
            <button className="settings-close" onClick={handleLogout} disabled={!isLoggedIn}>
              退出登录
            </button>
            <span style={{ fontSize: 12, color: isLoggedIn ? "#2d8a34" : "#999" }}>
              {isLoggedIn ? "已登录，可同步收藏" : "未登录，收藏仅存本地"}
            </span>
          </div>
          {loginStatus && (
            <div style={{ fontSize: 12, color: "#666", marginTop: 4 }}>
              {loginStatus}
            </div>
          )}
        </div>
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

