"use client";

import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface PaginationProps {
  current: number;
  total: number;
  pages: number;
  onPageChange: (page: number) => void;
}

const ITEMS_PER_PAGE = 12;

export default function Pagination({
  current,
  total,
  pages,
  onPageChange,
}: PaginationProps) {
  if (pages <= 1) return null;

  const startItem = (current - 1) * ITEMS_PER_PAGE + 1;
  const endItem = Math.min(current * ITEMS_PER_PAGE, total);

  const getPageNumbers = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (let i = 1; i <= pages; i++) {
      if (
        i === 1 ||
        i === pages ||
        (i >= current - delta && i <= current + delta)
      ) {
        range.push(i);
      }
    }

    let prev = 0;
    for (const i of range) {
      if (prev + 1 < i) {
        rangeWithDots.push("...");
      }
      rangeWithDots.push(i);
      prev = i;
    }

    return rangeWithDots;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div
      className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2"
      data-testid="pagination"
    >
      <div
        className="text-sm text-muted-foreground order-2 sm:order-1"
        data-testid="results-range"
      >
        Showing <span className="font-medium text-foreground">{startItem}</span>{" "}
        to <span className="font-medium text-foreground">{endItem}</span> of{" "}
        <span className="font-medium text-foreground">{total}</span> results
      </div>

      <div className="flex items-center space-x-1 order-1 sm:order-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(1)}
          disabled={current === 1}
          className="hidden sm:flex h-8 w-8 p-0 hover-glow-primary"
          data-testid="first-page"
          aria-label="First page"
        >
          <ChevronsLeft className="h-4 w-4" />
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(current - 1)}
          disabled={current === 1}
          className="h-8 px-2 sm:px-3 hover-glow-primary"
          data-testid="previous-page"
          aria-label="Previous page"
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="hidden sm:inline ml-1">Previous</span>
        </Button>

        <div className="flex items-center space-x-1">
          {pageNumbers.map((page, index) => {
            if (page === "...") {
              return (
                <span
                  key={`dots-${index}`}
                  className="h-8 w-8 flex items-center justify-center text-muted-foreground"
                >
                  ...
                </span>
              );
            }

            return (
              <Button
                key={page}
                variant={current === page ? "default" : "outline"}
                size="sm"
                onClick={() => onPageChange(page as number)}
                className={
                  current === page
                    ? "h-8 w-8 p-0 bg-gradient-primary text-primary-foreground hover-glow-primary"
                    : "h-8 w-8 p-0 hover-glow-secondary"
                }
                data-testid={`page-${page}`}
                aria-label={`Go to page ${page}`}
                aria-current={current === page ? "page" : undefined}
              >
                {page}
              </Button>
            );
          })}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(current + 1)}
          disabled={current === pages}
          className="h-8 px-2 sm:px-3 hover-glow-primary"
          data-testid="next-page"
          aria-label="Next page"
        >
          <span className="hidden sm:inline mr-1">Next</span>
          <ChevronRight className="h-4 w-4" />
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(pages)}
          disabled={current === pages}
          className="hidden sm:flex h-8 w-8 p-0 hover-glow-primary"
          data-testid="last-page"
          aria-label="Last page"
        >
          <ChevronsRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
