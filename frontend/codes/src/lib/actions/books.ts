"use server";

import { redirect } from "next/navigation";
import { booksApi } from "../api/books";
import { revalidateApiData } from "../utils/request";
import type { BookFilters } from "../types";

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

    await revalidateApiData();

    redirect("/?created=true");
  } catch (error) {
    console.error("Falha ao criar livro:", error);
    redirect("/?error=create-failed");
  }
}
