"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

import {
  X,
  Search,
  User,
  Building,
  BookOpen,
  Hash,
  SortAsc,
  SortDesc,
  Filter,
  FileText,
} from "lucide-react";
import type { BookFilters } from "@/lib/types";

interface FiltersSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function FiltersSidebar({
  isOpen,
  onClose,
}: FiltersSidebarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [localFilters, setLocalFilters] = useState<BookFilters>(() => {
    const params = Object.fromEntries(searchParams.entries());
    return {
      author: params.author || "",
      publisher: params.publisher || "",
      subjects: params.subjects || "",
      synopsis: params.synopsis || "",
      pages_min: params.pages_min ? parseInt(params.pages_min) : undefined,
      pages_max: params.pages_max ? parseInt(params.pages_max) : undefined,
      format: params.format || "",
      order_by: params.order_by || "",
      order_direction: (params.order_direction as "ASC" | "DESC") || "ASC",
    };
  });

  useEffect(() => {
    const params = Object.fromEntries(searchParams.entries());
    setLocalFilters({
      author: params.author || "",
      publisher: params.publisher || "",
      subjects: params.subjects || "",
      synopsis: params.synopsis || "",
      pages_min: params.pages_min ? parseInt(params.pages_min) : undefined,
      pages_max: params.pages_max ? parseInt(params.pages_max) : undefined,
      format: params.format || "",
      order_by: params.order_by || "",
      order_direction: (params.order_direction as "ASC" | "DESC") || "ASC",
    });
  }, [searchParams]);

  const handleFilterChange = (
    key: keyof BookFilters,
    value: string | number | undefined
  ) => {
    setLocalFilters((prev) => ({
      ...prev,
      [key]: value === "" ? undefined : value,
    }));
  };

  const handleApplyFilters = () => {
    const params = new URLSearchParams(searchParams.toString());

    params.delete("page");

    Object.entries(localFilters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        params.set(key, String(value));
      } else {
        params.delete(key);
      }
    });

    const url = params.toString() ? `/?${params.toString()}` : "/";
    router.push(url);
    onClose();
  };

  const handleClearFilters = () => {
    const clearedFilters = {
      author: "",
      publisher: "",
      subjects: "",
      synopsis: "",
      pages_min: undefined,
      pages_max: undefined,
      format: "",
      order_by: "",
      order_direction: "ASC" as const,
    };
    setLocalFilters(clearedFilters);
  };

  const activeFiltersCount = Object.entries(localFilters).filter(
    ([key, value]) => {
      if (key === "order_direction" && value === "ASC") return false;
      if (key === "order_by" && (!value || value === "")) return false;
      return value !== undefined && value !== null && value !== "";
    }
  ).length;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-40"
          />

          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-96 bg-card shadow-2xl z-50 overflow-y-auto border-l border-border"
            data-testid="filters-sidebar"
          >
            <div className="sticky top-0 bg-card border-b border-border p-4 flex items-center justify-between z-10">
              <div className="flex items-center gap-2">
                <Filter className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-semibold text-foreground">
                  Advanced Filters
                </h2>
                {activeFiltersCount > 0 && (
                  <Badge
                    variant="default"
                    className="bg-primary text-primary-foreground"
                  >
                    {activeFiltersCount} active
                  </Badge>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="hover:bg-accent"
                data-testid="close-filters"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="p-4 space-y-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-3">
                  <Search className="h-4 w-4 text-primary/70" />
                  <h3 className="font-medium text-sm text-foreground">
                    Text Search
                  </h3>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  <div className="space-y-1">
                    <Label
                      htmlFor="author"
                      className="text-xs text-muted-foreground flex items-center gap-1"
                    >
                      <User className="h-3 w-3 text-primary/70" />
                      Author
                    </Label>
                    <Input
                      id="author"
                      name="author"
                      type="text"
                      placeholder="Author name..."
                      value={localFilters.author || ""}
                      onChange={(e) =>
                        handleFilterChange("author", e.target.value)
                      }
                      className="h-9"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label
                      htmlFor="publisher"
                      className="text-xs text-muted-foreground flex items-center gap-1"
                    >
                      <Building className="h-3 w-3 text-chart-2/70" />
                      Publisher
                    </Label>
                    <Input
                      id="publisher"
                      name="publisher"
                      type="text"
                      placeholder="Publisher name..."
                      value={localFilters.publisher || ""}
                      onChange={(e) =>
                        handleFilterChange("publisher", e.target.value)
                      }
                      className="h-9"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label
                      htmlFor="subjects"
                      className="text-xs text-muted-foreground flex items-center gap-1"
                    >
                      <BookOpen className="h-3 w-3 text-chart-3/70" />
                      Subjects
                    </Label>
                    <Input
                      id="subjects"
                      type="text"
                      placeholder="Book subject..."
                      value={localFilters.subjects || ""}
                      onChange={(e) =>
                        handleFilterChange("subjects", e.target.value)
                      }
                      className="h-9"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label
                      htmlFor="synopsis"
                      className="text-xs text-muted-foreground flex items-center gap-1"
                    >
                      <FileText className="h-3 w-3 text-chart-4/70" />
                      Synopsis
                    </Label>
                    <Input
                      id="synopsis"
                      type="text"
                      placeholder="Search in synopsis..."
                      value={localFilters.synopsis || ""}
                      onChange={(e) =>
                        handleFilterChange("synopsis", e.target.value)
                      }
                      className="h-9"
                    />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-3">
                  <Hash className="h-4 w-4 text-chart-3/70" />
                  <h3 className="font-medium text-sm text-foreground">
                    Numeric Criteria
                  </h3>
                </div>

                <div className="space-y-3">
                  <div>
                    <Label className="text-xs text-muted-foreground mb-2 block">
                      Number of Pages
                    </Label>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Input
                          type="number"
                          name="pages_min"
                          placeholder="Min"
                          min="1"
                          value={localFilters.pages_min || ""}
                          onChange={(e) =>
                            handleFilterChange(
                              "pages_min",
                              e.target.value
                                ? parseInt(e.target.value)
                                : undefined
                            )
                          }
                          className="h-9"
                        />
                      </div>
                      <div>
                        <Input
                          type="number"
                          name="pages_max"
                          placeholder="Max"
                          min="1"
                          value={localFilters.pages_max || ""}
                          onChange={(e) =>
                            handleFilterChange(
                              "pages_max",
                              e.target.value
                                ? parseInt(e.target.value)
                                : undefined
                            )
                          }
                          className="h-9"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label
                      htmlFor="format"
                      className="text-xs text-muted-foreground"
                    >
                      Format
                    </Label>
                    <Input
                      id="format"
                      type="text"
                      placeholder="Ex: Hardcover, Paperback..."
                      value={localFilters.format || ""}
                      onChange={(e) =>
                        handleFilterChange("format", e.target.value)
                      }
                      className="h-9"
                    />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-3">
                  <SortAsc className="h-4 w-4 text-chart-4/70" />
                  <h3 className="font-medium text-sm text-foreground">
                    Sorting
                  </h3>
                </div>

                <div className="space-y-3">
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">
                      Sort by
                    </Label>
                    <Select
                      value={localFilters.order_by || "default"}
                      onValueChange={(value) =>
                        handleFilterChange(
                          "order_by",
                          value === "default" ? "" : value
                        )
                      }
                    >
                      <SelectTrigger
                        className="h-9"
                        data-testid="format-select"
                      >
                        <SelectValue placeholder="Select..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="default">Default</SelectItem>
                        <SelectItem value="title">Title</SelectItem>
                        <SelectItem value="author">Author</SelectItem>
                        <SelectItem value="publisher">Publisher</SelectItem>
                        <SelectItem value="pages">Pages</SelectItem>
                        <SelectItem
                          value="Digital"
                          data-testid="format-option-Digital"
                        >
                          Digital
                        </SelectItem>
                        <SelectItem
                          value="Physical"
                          data-testid="format-option-Physical"
                        >
                          Physical
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">
                      Direction
                    </Label>
                    <Select
                      value={localFilters.order_direction || "ASC"}
                      onValueChange={(value) =>
                        handleFilterChange(
                          "order_direction",
                          value as "ASC" | "DESC"
                        )
                      }
                    >
                      <SelectTrigger className="h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ASC">
                          <div className="flex items-center gap-2">
                            <SortAsc className="h-4 w-4" />
                            Ascending
                          </div>
                        </SelectItem>
                        <SelectItem value="DESC">
                          <div className="flex items-center gap-2">
                            <SortDesc className="h-4 w-4" />
                            Descending
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 bg-card border-t border-border p-4">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={handleClearFilters}
                  className="flex-1"
                  disabled={activeFiltersCount === 0}
                  data-testid="clear-filters"
                >
                  <X className="h-4 w-4 mr-2" />
                  Clear All
                </Button>
                <Button
                  onClick={handleApplyFilters}
                  className="flex-1"
                  data-testid="apply-filters"
                >
                  Apply Filters
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
