"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface SearchBarProps {
  onOpenFilters: () => void;
  activeFiltersCount: number;
  onClearFilters: () => void;
}

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default function SearchBar({
  onOpenFilters,
  activeFiltersCount,
  onClearFilters,
}: SearchBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get("title") || "");

  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  useEffect(() => {
    const titleFromUrl = searchParams.get("title") || "";
    if (titleFromUrl !== searchTerm && titleFromUrl !== debouncedSearchTerm) {
      setSearchTerm(titleFromUrl);
    }
  }, [searchParams]);

  useEffect(() => {
    const currentTitle = searchParams.get("title") || "";

    if (currentTitle !== debouncedSearchTerm) {
      const params = new URLSearchParams(searchParams.toString());

      params.delete("page");

      if (debouncedSearchTerm) {
        params.set("title", debouncedSearchTerm);
      } else {
        params.delete("title");
      }

      const url = params.toString() ? `/?${params.toString()}` : "/";
      router.push(url);
    }
  }, [debouncedSearchTerm, router, searchParams]);

  const handleClear = () => {
    onClearFilters();
  };

  return (
    <div className="flex items-center gap-3 p-4 bg-background/80 backdrop-blur-md rounded-2xl border border-border/50 shadow-xl">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary h-4 w-4" />
        <Input
          type="text"
          placeholder="Search books by title"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 pr-10 h-12 text-base bg-background/50 border-border/50 focus:border-primary focus:ring-primary/20 rounded-xl"
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm("")}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <Button
        variant="outline"
        onClick={onOpenFilters}
        className="h-12 px-4 relative bg-primary/10 border-primary/30 text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-300 rounded-xl"
      >
        <SlidersHorizontal className="h-4 w-4 mr-2" />
        Filters
        {activeFiltersCount > 0 && (
          <Badge
            variant="default"
            className="ml-2 h-5 w-5 p-0 flex items-center justify-center text-xs absolute -top-1 -right-1 bg-chart-3 text-background"
          >
            {activeFiltersCount}
          </Badge>
        )}
      </Button>

      {(searchTerm || activeFiltersCount > 0) && (
        <Button
          variant="ghost"
          onClick={handleClear}
          className="h-12 px-4 text-destructive hover:text-destructive hover:bg-destructive/10 transition-all duration-300 rounded-xl"
        >
          <X className="h-4 w-4 mr-2" />
          Clear All
        </Button>
      )}
    </div>
  );
}
