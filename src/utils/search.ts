import { predefinedItems } from "../data/predefinedItems";
import type { SearchItem, Project, FavoriteSite } from "../types";

/**
 * 过滤搜索项
 */
export function filterItems(
  query: string,
  projects: Project[] = [],
  favoriteSites: FavoriteSite[] = []
): SearchItem[] {
  const q = query.trim().toLowerCase();
  if (!q) {
    // 默认不展示任何结果，只展示搜索框
    return [];
  }

  const tokens = q.split(/\s+/);

  // 检查是否在搜索"收藏"相关关键词
  const isSearchingFavorites = q.includes("收藏") || q.includes("favorite") || q.includes("favorites") || q.includes("bookmark");

  const allItems: SearchItem[] = [
    ...predefinedItems,
    ...projects.map((p): SearchItem => ({
      type: "project",
      icon: "📁",
      title: p.name,
      desc: `project ${p.name}`,
      content: p.path,
      action: "open-project",
      projectPath: p.path
    })),
    // 如果搜索"收藏"关键词，则不包含收藏网站；否则包含
    ...(isSearchingFavorites
      ? []
      : favoriteSites.map((site): SearchItem => ({
          type: "favorite",
          icon: "🔖",
          title: site.name,
          desc: site.keywords ? `收藏 ${site.keywords}` : `收藏网站 ${site.name}`,
          content: site.url,
          action: "open-favorite",
          url: site.url,
          favoriteId: site.id
        })))
  ];

  const matches = allItems.filter((item) => {
    const text = (item.title + " " + item.desc).toLowerCase();
    return tokens.every((t) => text.includes(t));
  });

  const list: SearchItem[] = [...matches];

  // 只有在输入中包含"设置"或相关英文时，才出现"打开设置"模块
  if (q.includes("设置") || q.includes("setting") || q.includes("settings") || q.includes("config")) {
    list.push({
      type: "page",
      icon: "⚙️",
      title: "打开设置",
      desc: "设置 preferences config",
      content: "打开应用设置页面",
      action: "settings"
    });
  }

  // 只有在输入中包含"收藏"或相关英文时，才出现"打开收藏"模块
  if (isSearchingFavorites) {
    list.push({
      type: "page",
      icon: "🔖",
      title: "打开收藏",
      desc: "收藏 favorite bookmark 书签",
      content: "打开收藏网站管理页面",
      action: "favorites"
    });
  }

  // 输入包含 json 时，提供 JSON 编辑器入口
  if (q.includes("json")) {
    list.push({
      type: "page",
      icon: "🧩",
      title: "打开 JSON 编辑器",
      desc: "json editor",
      content: "打开设置页中的 JSON 编辑器",
      action: "json-editor"
    });
  }

  // 追加 Google 搜索
  const googleItem: SearchItem = {
    type: "web",
    icon: "🔍",
    title: `在 Google 中搜索 "${query}"`,
    desc: "google web search",
    content: "使用默认浏览器打开 Google 搜索",
    action: "google",
    query
  };

  return [...list, googleItem];
}

