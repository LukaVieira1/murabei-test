"use server";

import { redirect } from "next/navigation";
import { booksApi } from "../api/books";

import type { BookFilters, Book } from "../types";
import { revalidateTag, revalidatePath } from "next/cache";

export async function filterBooks(formData: FormData) {
  const filters: BookFilters = {};

  const title = formData.get("title")?.toString().trim();
  const author = formData.get("author")?.toString().trim();
  const publisher = formData.get("publisher")?.toString().trim();
  const subjects = formData.get("subjects")?.toString().trim();
  const pagesMin = formData.get("pages_min")?.toString();
  const pagesMax = formData.get("pages_max")?.toString();
  const orderBy = formData.get("order_by")?.toString();
  const orderDirection = formData.get("order_direction")?.toString() as
    | "ASC"
    | "DESC";

  if (title) filters.title = title;
  if (author) filters.author = author;
  if (publisher) filters.publisher = publisher;
  if (subjects) filters.subjects = subjects;
  if (pagesMin) filters.pages_min = parseInt(pagesMin);
  if (pagesMax) filters.pages_max = parseInt(pagesMax);
  if (orderBy) filters.order_by = orderBy;
  if (orderDirection) filters.order_direction = orderDirection;

  const searchParams = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.set(key, String(value));
    }
  });

  const redirectUrl = searchParams.toString()
    ? `/?${searchParams.toString()}`
    : "/";
  redirect(redirectUrl);
}

export async function changePage(page: number) {
  const searchParams = new URLSearchParams();
  searchParams.set("page", String(page));

  redirect(`/?${searchParams.toString()}`);
}

export async function clearFilters() {
  redirect("/");
}

export async function createBook(formData: FormData) {
  try {
    const title = formData.get("title")?.toString().trim();
    const author = formData.get("author")?.toString().trim();
    const publisher = formData.get("publisher")?.toString().trim();
    const synopsis = formData.get("synopsis")?.toString().trim();
    const pages = formData.get("pages")?.toString();

    if (!title || !author) {
      throw new Error("Título e autor são obrigatórios");
    }

    const bookData = {
      title,
      author,
      ...(publisher && { publisher }),
      ...(synopsis && { synopsis }),
      ...(pages && { pages: parseInt(pages) }),
    };

    await booksApi.createBook(bookData);

    revalidateTag("api-data");
    revalidateTag("books");
    revalidatePath("/");

    redirect("/?created=true");
  } catch (error) {
    console.error("Falha ao criar livro:", error);
    redirect("/?error=create-failed");
  }
}

export async function createBookAction(formData: FormData) {
  try {
    const title = formData.get("title")?.toString().trim();
    const author = formData.get("author")?.toString().trim();

    if (!title || !author) {
      return {
        success: false,
        error: "Title and Author are required fields.",
      };
    }

    const bookData: Omit<Book, "id"> = {
      title,
      author,
    };

    const publisher = formData.get("publisher")?.toString().trim();
    if (publisher) bookData.publisher = publisher;

    const synopsis = formData.get("synopsis")?.toString().trim();
    if (synopsis) bookData.synopsis = synopsis;

    const subjects = formData.get("subjects")?.toString().trim();
    if (subjects) bookData.subjects = subjects;

    const isbn13 = formData.get("isbn13")?.toString().trim();
    if (isbn13) {
      const isbn13Number = parseInt(isbn13);
      if (!isNaN(isbn13Number)) {
        bookData.isbn13 = isbn13Number;
      }
    }

    const isbn10 = formData.get("isbn10")?.toString().trim();
    if (isbn10) bookData.isbn10 = isbn10;

    const price = formData.get("price")?.toString().trim();
    if (price) bookData.price = price;

    const format = formData.get("format")?.toString().trim();
    if (format) bookData.format = format;

    const pagesStr = formData.get("pages")?.toString().trim();
    if (pagesStr) {
      const pages = parseInt(pagesStr);
      if (!isNaN(pages) && pages > 0) {
        bookData.pages = pages;
      }
    }

    const result = await booksApi.createBook(bookData);

    revalidateTag("api-data");
    revalidateTag("books");
    revalidatePath("/");
    revalidatePath("/", "layout");

    return {
      success: true,
      book: result.book,
      message: "Book created successfully!",
    };
  } catch (error) {
    console.error("Error in createBookAction:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create book",
    };
  }
}

export async function createBookWithRedirect(formData: FormData) {
  const result = await createBookAction(formData);

  if (result.success) {
    redirect("/?created=true");
  } else {
    redirect(
      `/?error=create-failed&message=${encodeURIComponent(
        result.error || "Unknown error"
      )}`
    );
  }
}

export async function updateBookAction(bookId: number, formData: FormData) {
  try {
    const title = formData.get("title")?.toString().trim();
    const author = formData.get("author")?.toString().trim();

    if (!title || !author) {
      return {
        success: false,
        error: "Title and Author are required fields.",
      };
    }

    const bookData: Partial<Omit<Book, "id">> = {
      title,
      author,
    };

    const publisher = formData.get("publisher")?.toString().trim();
    if (publisher) bookData.publisher = publisher;

    const synopsis = formData.get("synopsis")?.toString().trim();
    if (synopsis) bookData.synopsis = synopsis;

    const subjects = formData.get("subjects")?.toString().trim();
    if (subjects) bookData.subjects = subjects;

    const isbn13 = formData.get("isbn13")?.toString().trim();
    if (isbn13) {
      const isbn13Number = parseInt(isbn13);
      if (!isNaN(isbn13Number)) {
        bookData.isbn13 = isbn13Number;
      }
    }

    const isbn10 = formData.get("isbn10")?.toString().trim();
    if (isbn10) bookData.isbn10 = isbn10;

    const price = formData.get("price")?.toString().trim();
    if (price) bookData.price = price;

    const format = formData.get("format")?.toString().trim();
    if (format) bookData.format = format;

    const pagesStr = formData.get("pages")?.toString().trim();
    if (pagesStr) {
      const pages = parseInt(pagesStr);
      if (!isNaN(pages) && pages > 0) {
        bookData.pages = pages;
      }
    }

    const result = await booksApi.updateBook(bookId, bookData);

    revalidateTag("api-data");
    revalidateTag("books");
    revalidatePath("/");
    revalidatePath("/", "layout");

    return {
      success: true,
      book: result.book,
      message: "Book updated successfully!",
    };
  } catch (error) {
    console.error("Error in updateBookAction:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update book",
    };
  }
}

export async function deleteBookAction(bookId: number) {
  try {
    await booksApi.deleteBook(bookId);

    revalidateTag("api-data");
    revalidateTag("books");
    revalidatePath("/");
    revalidatePath("/", "layout");

    return {
      success: true,
      message: "Book deleted successfully!",
    };
  } catch (error) {
    console.error("Error in deleteBookAction:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete book",
    };
  }
}
