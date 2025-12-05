import React, { useState } from "react";
import type { FavoriteSite } from "../types";
import { addBookmark } from "../services/bookmarks";

interface FavoritesViewProps {
  favoriteSites: FavoriteSite[];
  setFavoriteSites: (sites: FavoriteSite[]) => void;
  onBack: () => void;
  isLoggedIn: boolean;
  authToken?: string;
  onRefreshFromServer?: () => Promise<void>;
  isSyncingFavorites?: boolean;
  favoriteSyncMessage?: string;
}

/**
 * 收藏网站视图组件
 */
export function FavoritesView({
  favoriteSites,
  setFavoriteSites,
  onBack,
  isLoggedIn,
  authToken,
  onRefreshFromServer,
  isSyncingFavorites,
  favoriteSyncMessage
}: FavoritesViewProps): JSX.Element {
  const [newSiteName, setNewSiteName] = useState<string>("");
  const [newSiteUrl, setNewSiteUrl] = useState<string>("");
  const [newSiteKeywords, setNewSiteKeywords] = useState<string>("");
  const [addStatus, setAddStatus] = useState<string>("");
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState<string>("");
  const [editUrl, setEditUrl] = useState<string>("");
  const [editKeywords, setEditKeywords] = useState<string>("");

  // 打开收藏网站
  const handleOpenSite = async (url: string): Promise<void> => {
    if (window.electronAPI?.openExternal) {
      await window.electronAPI.openExternal(url);
    }
  };

  // 添加收藏网站
  const handleAddSite = async (): Promise<void> => {
    if (!newSiteName.trim() || !newSiteUrl.trim()) {
      setAddStatus("请填写网站名称和地址");
      return;
    }

    const payload = {
      name: newSiteName.trim(),
      url: newSiteUrl.trim(),
      keywords: newSiteKeywords.trim() || undefined
    };

    // 未登录时仅存本地
    if (!isLoggedIn) {
      const localSite: FavoriteSite = {
        id: Date.now().toString(),
        ...payload
      };
      setFavoriteSites([...favoriteSites, localSite]);
      setNewSiteName("");
      setNewSiteUrl("");
      setNewSiteKeywords("");
      setAddStatus("未登录，已保存到本地");
      return;
    }

    setIsSaving(true);
    setAddStatus("正在同步到后端...");

    try {
      const resp = await addBookmark(payload, authToken);
      const newSite: FavoriteSite = {
        id: resp?.id || Date.now().toString(),
        name: resp?.name || payload.name,
        url: resp?.url || payload.url,
        keywords: resp?.keywords || payload.keywords
      };

      setFavoriteSites([...favoriteSites, newSite]);
      setNewSiteName("");
      setNewSiteUrl("");
      setNewSiteKeywords("");
      setAddStatus("添加成功，已同步到后端，正在刷新列表...");
      if (onRefreshFromServer) {
        await onRefreshFromServer();
        setAddStatus("添加成功，已从后端刷新");
      } else {
        setAddStatus("添加成功，已同步到后端");
      }
    } catch (error) {
      console.error("Failed to add bookmark:", error);
      const fallbackSite: FavoriteSite = {
        id: Date.now().toString(),
        ...payload
      };
      // 失败时仍然落本地，避免用户输入丢失
      setFavoriteSites([...favoriteSites, fallbackSite]);
      setAddStatus("后端请求失败，已先保存到本地");
    } finally {
      setIsSaving(false);
    }
  };

  // 删除收藏网站
  const handleDeleteSite = (id: string): void => {
    setFavoriteSites(favoriteSites.filter((site) => site.id !== id));
  };

  // 开始编辑
  const handleStartEdit = (site: FavoriteSite): void => {
    setEditingId(site.id);
    setEditName(site.name);
    setEditUrl(site.url);
    setEditKeywords(site.keywords || "");
  };

  // 保存编辑
  const handleSaveEdit = (): void => {
    if (!editingId || !editName.trim() || !editUrl.trim()) {
      return;
    }

    setFavoriteSites(
      favoriteSites.map((site) =>
        site.id === editingId
          ? {
              ...site,
              name: editName.trim(),
              url: editUrl.trim(),
              keywords: editKeywords.trim() || undefined
            }
          : site
      )
    );

    setEditingId(null);
    setEditName("");
    setEditUrl("");
    setEditKeywords("");
  };

  // 取消编辑
  const handleCancelEdit = (): void => {
    setEditingId(null);
    setEditName("");
    setEditUrl("");
    setEditKeywords("");
  };

  return (
    <div className="settings-root">
      <div className="settings-header">
        <span className="settings-title">收藏网站</span>
        <button className="settings-close" onClick={onBack}>
          返回
        </button>
      </div>
      <div className="settings-content">
        {/* 收藏网站列表 */}
        <div className="settings-section">
          <div className="settings-section-title" style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span>我的收藏</span>
            <button
              className="favorite-btn-add"
              style={{ padding: "4px 10px" }}
              onClick={() => onRefreshFromServer?.()}
              disabled={!isLoggedIn || isSyncingFavorites}
            >
              {isSyncingFavorites ? "刷新中..." : "刷新"}
            </button>
          </div>
          {favoriteSites.length === 0 ? (
            <p style={{ fontSize: 12, color: "#999", padding: "8px 0" }}>暂无收藏网站</p>
          ) : (
            <div className="favorites-list">
              {favoriteSites.map((site) => (
                <div key={site.id} className="favorite-item">
                  {editingId === site.id ? (
                    <div className="favorite-edit-form">
                      <input
                        type="text"
                        className="favorite-edit-input"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        placeholder="网站名称"
                      />
                      <input
                        type="url"
                        className="favorite-edit-input"
                        value={editUrl}
                        onChange={(e) => setEditUrl(e.target.value)}
                        placeholder="网站地址"
                      />
                      <input
                        type="text"
                        className="favorite-edit-input"
                        value={editKeywords}
                        onChange={(e) => setEditKeywords(e.target.value)}
                        placeholder="搜索关键词（可选）"
                      />
                      <div className="favorite-edit-actions">
                        <button className="favorite-btn-save" onClick={handleSaveEdit}>
                          保存
                        </button>
                        <button className="favorite-btn-cancel" onClick={handleCancelEdit}>
                          取消
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="favorite-info">
                        <div className="favorite-name">{site.name}</div>
                        <div className="favorite-url" title={site.url}>
                          {site.url}
                        </div>
                        {site.keywords && (
                          <div className="favorite-keywords">关键词: {site.keywords}</div>
                        )}
          {favoriteSyncMessage && (
            <div style={{ fontSize: 12, color: "#666", marginTop: 6 }}>{favoriteSyncMessage}</div>
          )}
                      </div>
                      <div className="favorite-actions">
                        <button
                          className="favorite-btn-open"
                          onClick={() => handleOpenSite(site.url)}
                        >
                          打开
                        </button>
                        <button
                          className="favorite-btn-edit"
                          onClick={() => handleStartEdit(site)}
                        >
                          编辑
                        </button>
                        <button
                          className="favorite-btn-delete"
                          onClick={() => handleDeleteSite(site.id)}
                        >
                          删除
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 添加新收藏 */}
        <div className="settings-section">
          <div className="settings-section-title">添加收藏</div>
          <div className="favorite-add-form">
            <input
              type="text"
              className="favorite-add-input"
              placeholder="网站名称（如: GitHub）"
              value={newSiteName}
              onChange={(e) => setNewSiteName(e.target.value)}
            />
            <input
              type="url"
              className="favorite-add-input"
              placeholder="网站地址（如: https://github.com）"
              value={newSiteUrl}
              onChange={(e) => setNewSiteUrl(e.target.value)}
            />
            <input
              type="text"
              className="favorite-add-input"
              placeholder="搜索关键词（可选，空格分隔）"
              value={newSiteKeywords}
              onChange={(e) => setNewSiteKeywords(e.target.value)}
            />
            <button className="favorite-btn-add" onClick={handleAddSite}>
              {isSaving ? "添加中..." : "添加收藏"}
            </button>
            {addStatus && (
              <div style={{ fontSize: 12, color: "#666" }}>
                {addStatus}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

