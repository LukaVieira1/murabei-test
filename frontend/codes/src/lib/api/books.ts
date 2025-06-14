import { API_ENDPOINTS } from "../config/api";
import { apiRequest, buildQueryString } from "../utils/request";
import type {
  Book,
  BooksResponse,
  BookFilters,
  CreateBookResponse,
} from "../types";

export const booksApi = {
  getBooks: async (filters: BookFilters = {}): Promise<BooksResponse> => {
    const queryString = buildQueryString(
      filters as Record<string, string | number | boolean>
    );
    const endpoint = `${API_ENDPOINTS.BOOKS}${
      queryString ? `?${queryString}` : ""
    }`;
    return apiRequest<BooksResponse>(endpoint);
  },

  getBook: async (id: number): Promise<Book> => {
    return apiRequest<Book>(`${API_ENDPOINTS.BOOKS}/${id}`);
  },

  createBook: async (
    bookData: Omit<Book, "id">
  ): Promise<CreateBookResponse> => {
    return apiRequest(API_ENDPOINTS.BOOKS, {
      method: "POST",
      body: JSON.stringify(bookData),
    });
  },
};

export async function getBooksSSR(
  filters?: BookFilters
): Promise<BooksResponse> {
  try {
    return await booksApi.getBooks(filters);
  } catch (error) {
    console.error("Failed to fetch books on server:", error);
    return {
      books: [],
      pagination: {
        current_page: 1,
        page_size: 10,
        total_count: 0,
        total_pages: 0,
        has_next: false,
        has_prev: false,
      },
      filters_applied: {},
    };
  }
}
