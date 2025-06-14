export interface Book {
  id: number;
  title: string;
  author: string;
  author_id?: number;
  biography?: string;
  authors?: string;
  publisher?: string;
  synopsis?: string;
  subjects?: string;
  pages?: number;
  format?: string;
  price?: string;
  isbn13?: number;
  isbn10?: string;
}

export interface Author {
  id: number;
  title: string;
  slug: string;
  biography: string;
}

export interface BooksResponse {
  books: Book[];
  pagination: {
    current_page: number;
    page_size: number;
    total_count: number;
    total_pages: number;
    has_next: boolean;
    has_prev: boolean;
  };
  filters_applied: Record<string, string | number | boolean>;
}

export interface CreateBookResponse {
  message: string;
  book: Book;
}

export interface BookFilters {
  title?: string;
  author?: string;
  publisher?: string;
  subjects?: string;
  synopsis?: string;
  pages_min?: number;
  pages_max?: number;
  format?: string;
  page?: number;
  page_size?: number;
  order_by?: string;
  order_direction?: "ASC" | "DESC";
}

export interface FilterOptions {
  text_filters: string[];
  exact_filters: string[];
  numeric_filters: string[];
  multi_value_filters: string[];
  available_subjects: string[];
  available_publishers: string[];
  sort_options: string[];
}

export interface ApiError {
  error: string;
  message: string;
}

export type QueryParams = Record<string, string | number | boolean>;
