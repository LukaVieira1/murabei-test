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

const MOCK_BOOKS_RESPONSE = {
  books: [
    {
      id: 1,
      title: "Clean Code: A Handbook of Agile Software Craftsmanship",
      author: "Robert C. Martin",
      publisher: "Pearson",
      synopsis:
        "A guide to writing clean, readable, and maintainable code. This book presents the principles of clean code in a practical way with lots of examples.",
      pages: 464,
      format: "Digital",
      subjects: "Programming, Software Engineering, Best Practices",
    },
    {
      id: 2,
      title: "The Clean Coder: A Code of Conduct for Professional Programmers",
      author: "Robert C. Martin",
      publisher: "Pearson",
      synopsis:
        "A practical guide to becoming a professional programmer. The book covers topics like responsibility, accountability, and how to deal with pressure.",
      pages: 256,
      format: "Physical",
      subjects: "Programming, Professional Development, Career",
    },
    {
      id: 3,
      title: "JavaScript: The Good Parts",
      author: "Douglas Crockford",
      publisher: "O'Reilly Media",
      synopsis:
        "This book explores the elegant subset of JavaScript that's more reliable, readable, and maintainable.",
      pages: 176,
      format: "Digital",
      subjects: "JavaScript, Programming, Web Development",
    },
    {
      id: 4,
      title: "Design Patterns: Elements of Reusable Object-Oriented Software",
      author: "Gang of Four",
      publisher: "Addison-Wesley",
      synopsis:
        "Captures a wealth of experience about the design of object-oriented software.",
      pages: 395,
      format: "Physical",
      subjects: "Design Patterns, OOP, Software Architecture",
    },
    {
      id: 5,
      title: "Refactoring: Improving the Design of Existing Code",
      author: "Martin Fowler",
      publisher: "Addison-Wesley",
      synopsis:
        "A handbook of techniques for restructuring existing code without changing its functionality.",
      pages: 448,
      format: "Digital",
      subjects: "Refactoring, Code Quality, Software Engineering",
    },
    {
      id: 6,
      title: "You Don't Know JS: Scope & Closures",
      author: "Kyle Simpson",
      publisher: "O'Reilly Media",
      synopsis: "Deep dive into JavaScript scope and closures concepts.",
      pages: 98,
      format: "Digital",
      subjects: "JavaScript, Programming, Web Development",
    },
  ],
  pagination: {
    current_page: 1,
    page_size: 12,
    total_count: 6,
    total_pages: 1,
    has_next: false,
    has_prev: false,
  },
  filters_applied: {},
};

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const isCypress =
    process.env.NEXT_PUBLIC_IS_CYPRESS_TEST === "true" ? true : false;

  if (isCypress) {
    console.log("🧪 Test mode detected - using mock data for:", endpoint);

    await new Promise((resolve) => setTimeout(resolve, 100));

    if (endpoint.includes("/api/v1/books")) {
      if (options.method === "POST") {
        return { message: "Book created successfully", id: 999 } as T;
      }
      if (options.method === "PUT") {
        return { message: "Book updated successfully" } as T;
      }
      if (options.method === "DELETE") {
        return { message: "Book deleted successfully" } as T;
      }

      const url = new URL(`http://localhost${endpoint}`);
      const searchParams = url.searchParams;

      let filteredBooks = [...MOCK_BOOKS_RESPONSE.books];

      const title = searchParams.get("title");
      if (title) {
        filteredBooks = filteredBooks.filter((book) =>
          book.title.toLowerCase().includes(title.toLowerCase())
        );
      }

      const author = searchParams.get("author");
      if (author) {
        filteredBooks = filteredBooks.filter((book) =>
          book.author.toLowerCase().includes(author.toLowerCase())
        );
      }

      const publisher = searchParams.get("publisher");
      if (publisher) {
        filteredBooks = filteredBooks.filter((book) =>
          book.publisher.toLowerCase().includes(publisher.toLowerCase())
        );
      }

      const format = searchParams.get("format");
      if (format) {
        filteredBooks = filteredBooks.filter((book) => book.format === format);
      }

      const pagesMin = searchParams.get("pages_min");
      if (pagesMin) {
        filteredBooks = filteredBooks.filter(
          (book) => book.pages >= parseInt(pagesMin)
        );
      }

      const pagesMax = searchParams.get("pages_max");
      if (pagesMax) {
        filteredBooks = filteredBooks.filter(
          (book) => book.pages <= parseInt(pagesMax)
        );
      }

      const filteredResponse = {
        books: filteredBooks,
        pagination: {
          current_page: 1,
          page_size: 12,
          total_count: filteredBooks.length,
          total_pages: Math.ceil(filteredBooks.length / 12),
          has_next: false,
          has_prev: false,
        },
        filters_applied: Object.fromEntries(searchParams.entries()),
      };

      return filteredResponse as T;
    }

    return {} as T;
  }

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
