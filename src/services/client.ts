const DEFAULT_API_BASE_URL = "http://localhost:8080";

/**
 * 获取后端 API 基础地址，优先使用环境变量，默认为本地服务。
 */
function getApiBaseUrl(): string {
  const base = import.meta.env?.VITE_API_BASE_URL || DEFAULT_API_BASE_URL;
  // 确保末尾没有多余的斜杠，避免重复 //
  return base.endsWith("/") ? base.slice(0, -1) : base;
}

/**
 * 统一的 fetch 封装，处理基础地址、JSON 解析和错误。
 */
export async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const baseUrl = getApiBaseUrl();
  const url = `${baseUrl}${path.startsWith("/") ? path : `/${path}`}`;

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(options.headers || {})
  };

  const resp = await fetch(url, { ...options, headers });

  const contentType = resp.headers.get("content-type") || "";
  const parseJson = contentType.includes("application/json");

  if (!resp.ok) {
    const errorBody = parseJson ? await resp.json().catch(() => undefined) : await resp.text().catch(() => "");
    const message = typeof errorBody === "object" ? JSON.stringify(errorBody) : String(errorBody || resp.statusText);
    throw new Error(`Request failed ${resp.status}: ${message}`);
  }

  if (parseJson) {
    return (await resp.json()) as T;
  }

  // @ts-expect-error - 允许非 JSON 场景返回文本
  return (await resp.text()) as T;
}

export const apiBaseUrl = getApiBaseUrl();


