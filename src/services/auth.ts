import { request } from "./client";

export interface LoginPayload {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  username?: string;
  name?: string;
  user?: {
    username?: string;
    name?: string;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

/**
 * 登录接口
 */
export async function login(payload: LoginPayload): Promise<LoginResponse> {
  return request<LoginResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}


