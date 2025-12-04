import React, { useState, useEffect } from "react";
import type { FavoriteSite } from "../types";
import { calculateHeight } from "../utils/window";
import { BASE_HEIGHT } from "../constants";

interface FavoritesViewProps {
  favoriteSites: FavoriteSite[];
  setFavoriteSites: (sites: FavoriteSite[]) => void;
  onBack: () => void;
}

/**
 * 收藏网站视图组件
 */
export function FavoritesView({
  favoriteSites,
  setFavoriteSites,
  onBack
}: FavoritesViewProps): JSX.Element {
  const [newSiteName, setNewSiteName] = useState<string>("");
  const [newSiteUrl, setNewSiteUrl] = useState<string>("");
  const [newSiteKeywords, setNewSiteKeywords] = useState<string>("");
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
  const handleAddSite = (): void => {
    if (!newSiteName.trim() || !newSiteUrl.trim()) {
      return;
    }

    const newSite: FavoriteSite = {
      id: Date.now().toString(),
      name: newSiteName.trim(),
      url: newSiteUrl.trim(),
      keywords: newSiteKeywords.trim() || undefined
    };

    setFavoriteSites([...favoriteSites, newSite]);
    setNewSiteName("");
    setNewSiteUrl("");
    setNewSiteKeywords("");
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
          <div className="settings-section-title">我的收藏</div>
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
              添加收藏
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

