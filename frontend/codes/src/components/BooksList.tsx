"use client";

import { useRouter } from "next/navigation";
import BooksGrid from "@/components/BooksGrid";
import Pagination from "@/components/Pagination";
import type { BooksResponse } from "@/lib/types";

interface BooksListProps {
  data: BooksResponse;
}

export default function BooksList({ data }: BooksListProps) {
  const router = useRouter();
  const { books, pagination } = data;

  const handlePageChange = (page: number) => {
    const url = new URL(window.location.href);
    url.searchParams.set("page", String(page));
    router.push(url.pathname + url.search);
  };

  const handleRefresh = () => {
    router.refresh();
  };

  console.log(data);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-foreground">
          {pagination.total_count === 0
            ? "No results found"
            : `${pagination.total_count} book${
                pagination.total_count > 1 ? "s" : ""
              } found${pagination.total_count > 1 ? "s" : ""}`}
        </h2>

        {pagination.total_count > 0 && (
          <p className="text-sm text-muted-foreground">
            Page {pagination.current_page} of {pagination.total_pages}
          </p>
        )}
      </div>

      <BooksGrid books={books} onRefresh={handleRefresh} />

      {pagination.total_pages > 1 && (
        <Pagination
          current={pagination.current_page}
          total={pagination.total_count}
          pages={pagination.total_pages}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
}
