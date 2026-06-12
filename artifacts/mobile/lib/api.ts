import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";

export const AUTH_TOKEN_KEY = "auth_session_token";

export function getApiBase(): string {
  if (process.env.EXPO_PUBLIC_DOMAIN) {
    return `https://${process.env.EXPO_PUBLIC_DOMAIN}`;
  }
  return "";
}

async function buildHeaders(extra?: Record<string, string>): Promise<HeadersInit> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...extra,
  };
  if (Platform.OS !== "web") {
    const token = await SecureStore.getItemAsync(AUTH_TOKEN_KEY);
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

export async function apiGet(path: string): Promise<Response> {
  return fetch(`${getApiBase()}${path}`, {
    credentials: "include",
    headers: await buildHeaders(),
  });
}

export async function apiPost(path: string, body: unknown): Promise<Response> {
  return fetch(`${getApiBase()}${path}`, {
    method: "POST",
    credentials: "include",
    headers: await buildHeaders(),
    body: JSON.stringify(body),
  });
}

export async function apiPut(path: string, body: unknown): Promise<Response> {
  return fetch(`${getApiBase()}${path}`, {
    method: "PUT",
    credentials: "include",
    headers: await buildHeaders(),
    body: JSON.stringify(body),
  });
}

export async function apiDelete(path: string): Promise<Response> {
  return fetch(`${getApiBase()}${path}`, {
    method: "DELETE",
    credentials: "include",
    headers: await buildHeaders(),
  });
}
