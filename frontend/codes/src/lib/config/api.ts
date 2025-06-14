export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || "http://backend:5000",
  TIMEOUT: 10000,
  CACHE_DURATION: 60,
  RETRY_ATTEMPTS: 3,
} as const;

export const API_ENDPOINTS = {
  BOOKS: "/api/v1/books",
  AUTHORS: "/api/v1/authors",
  SUBJECTS: "/api/v1/subjects",
  PUBLISHERS: "/api/v1/publishers",
  FILTER_OPTIONS: "/api/v1/filter-options",
} as const;

export const CACHE_TAGS = {
  BOOKS: "books",
  AUTHORS: "authors",
  SUBJECTS: "subjects",
  PUBLISHERS: "publishers",
  FILTER_OPTIONS: "filter-options",
} as const;
