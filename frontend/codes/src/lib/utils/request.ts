import { API_CONFIG } from "../config/api";
import type { ApiError, QueryParams } from "../types";

export function buildQueryString(params: QueryParams): string {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.append(key, String(value));
    }
  });

  return searchParams.toString();
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const isServer = typeof window === "undefined";
  const baseUrl = isServer
    ? process.env.API_URL || "http://localhost:5000"
    : API_CONFIG.BASE_URL;

  const url = `${baseUrl}${endpoint}`;

  try {
    const requestOptions: RequestInit = {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    };

    if (isServer && (!options.method || options.method === "GET")) {
      requestOptions.next = {
        revalidate: API_CONFIG.CACHE_DURATION,
        tags: ["api-data"],
      };
    }

    const response = await fetch(url, requestOptions);

    if (!response.ok) {
      const errorText = await response.text();

      let errorData: ApiError;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = {
          error: "Network Error",
          message: `HTTP ${response.status}: ${response.statusText}`,
        };
      }

      throw new Error(`API Error: ${errorData.message}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error(`API request failed for ${endpoint}:`, error);
    throw error instanceof Error ? error : new Error("Unknown API error");
  }
}
