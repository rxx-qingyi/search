import { BASE_HEIGHT, INPUT_HEIGHT, ITEM_HEIGHT, MORE_HEIGHT, MAX_VISIBLE_ITEMS } from "../constants";

/**
 * 根据搜索结果数量计算窗口高度
 */
export function calculateHeight(resultCount: number): number {
  if (resultCount <= 0) return BASE_HEIGHT;
  const visibleCount = Math.min(resultCount, MAX_VISIBLE_ITEMS);
  const more = resultCount > MAX_VISIBLE_ITEMS ? MORE_HEIGHT : 0;
  return INPUT_HEIGHT + visibleCount * ITEM_HEIGHT + more;
}

