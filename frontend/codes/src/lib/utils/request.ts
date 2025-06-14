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
  const url = `${API_CONFIG.BASE_URL}${endpoint}`;

  try {
    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      next: {
        revalidate: API_CONFIG.CACHE_DURATION,
        tags: ["api-data"],
      },
      ...options,
    });

    if (!response.ok) {
      const errorData: ApiError = await response.json().catch(() => ({
        error: "Network Error",
        message: `HTTP ${response.status}: ${response.statusText}`,
      }));

      throw new Error(`API Error: ${errorData.message}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`API request failed for ${endpoint}:`, error);
    throw error instanceof Error ? error : new Error("Unknown API error");
  }
}

export async function revalidateApiData() {
  if (typeof window === "undefined") {
    const { revalidateTag } = await import("next/cache");
    revalidateTag("api-data");
  }
}
