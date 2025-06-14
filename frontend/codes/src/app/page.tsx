import { Suspense } from "react";
import { getBooksSSR, type BookFilters } from "@/lib/api";
import BooksList from "@/components/BooksList";

import { MdError, MdCheckCircle, MdCancel } from "react-icons/md";
import HomePageClient from "@/components/HomePageClient";

interface PageProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

function BooksLoading() {
  return (
    <div className="space-y-6">
      <div className="animate-pulse">
        <div className="h-4 bg-muted rounded w-1/4 mb-4 shimmer"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="bg-card border h-48 rounded-xl shimmer"
            ></div>
          ))}
        </div>
      </div>
    </div>
  );
}

function BooksError({ error }: { error: string }) {
  return (
    <div className="text-center py-8">
      <div className="text-destructive mb-4">
        <MdError className="mx-auto h-12 w-12" />
      </div>
      <h3 className="text-lg font-medium text-foreground mb-2">
        Error loading books
      </h3>
      <p className="text-muted-foreground">{error}</p>
    </div>
  );
}

function StatusMessages({
  searchParams,
}: {
  searchParams: PageProps["searchParams"];
}) {
  if (searchParams.created === "true") {
    return (
      <div className="bg-gradient-secondary border border-border rounded-xl p-4 mb-6 hover-glow-secondary">
        <div className="flex">
          <div className="text-chart-2">
            <MdCheckCircle className="h-5 w-5" />
          </div>
          <div className="ml-3">
            <p className="text-sm text-foreground font-medium">
              Book created successfully!
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (searchParams.error === "create-failed") {
    const message =
      typeof searchParams.message === "string"
        ? decodeURIComponent(searchParams.message)
        : "Error creating book. Please try again.";

    return (
      <div className="bg-gradient-secondary border border-destructive/20 rounded-xl p-4 mb-6 hover-glow-accent">
        <div className="flex">
          <div className="text-destructive">
            <MdCancel className="h-5 w-5" />
          </div>
          <div className="ml-3">
            <p className="text-sm text-foreground font-medium">{message}</p>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

async function BooksContent({ filters }: { filters: BookFilters }) {
  try {
    const data = await getBooksSSR(filters);
    return <BooksList data={data} />;
  } catch (error) {
    return (
      <BooksError
        error={error instanceof Error ? error.message : "Unknown error"}
      />
    );
  }
}

export default function HomePage({ searchParams }: PageProps) {
  const filters: BookFilters = {
    title:
      typeof searchParams.title === "string" ? searchParams.title : undefined,
    author:
      typeof searchParams.author === "string" ? searchParams.author : undefined,
    publisher:
      typeof searchParams.publisher === "string"
        ? searchParams.publisher
        : undefined,
    subjects:
      typeof searchParams.subjects === "string"
        ? searchParams.subjects
        : undefined,
    synopsis:
      typeof searchParams.synopsis === "string"
        ? searchParams.synopsis
        : undefined,
    pages_min:
      typeof searchParams.pages_min === "string"
        ? parseInt(searchParams.pages_min)
        : undefined,
    pages_max:
      typeof searchParams.pages_max === "string"
        ? parseInt(searchParams.pages_max)
        : undefined,
    format:
      typeof searchParams.format === "string" ? searchParams.format : undefined,
    order_by:
      typeof searchParams.order_by === "string"
        ? searchParams.order_by
        : undefined,
    order_direction:
      typeof searchParams.order_direction === "string"
        ? (searchParams.order_direction as "ASC" | "DESC")
        : undefined,
    page:
      typeof searchParams.page === "string" ? parseInt(searchParams.page) : 1,
    page_size: 12,
  };

  return (
    <div className="min-h-screen bg-background">
      <HomePageClient searchParams={searchParams}>
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <StatusMessages searchParams={searchParams} />

          <Suspense fallback={<BooksLoading />}>
            <BooksContent filters={filters} />
          </Suspense>
        </main>
      </HomePageClient>
    </div>
  );
}
