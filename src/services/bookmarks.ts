import { request } from "./client";

export interface AddBookmarkPayload {
  name: string;
  url: string;
  keywords?: string;
}

export interface BookmarkDTO {
  id?: string;
  name: string;
  url: string;
  keywords?: string;
}

/**
 * 添加收藏网站
 */
export async function addBookmark(payload: AddBookmarkPayload, token?: string): Promise<BookmarkDTO> {
  return request<BookmarkDTO>("/api/v1/bookmarks/add", {
    method: "POST",
    body: JSON.stringify(payload),
    headers: token
      ? {
          Authorization: `Bearer ${token}`
        }
      : undefined
  });
}

/**
 * 获取收藏网站列表
 */
export async function listBookmarks(token: string): Promise<BookmarkDTO[]> {
  return request<BookmarkDTO[]>("/api/v1/bookmarks/list", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
}


