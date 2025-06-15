"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { BookOpen, User, Building, FileText, Eye } from "lucide-react";
import BookActionsDropdown from "./BookActionsDropdown";
import type { Book } from "@/lib/types";

interface BooksGridProps {
  books: Book[];
  onRefresh?: () => void;
}

interface BookCardProps {
  book: Book;
  onRefresh?: () => void;
}

interface BookDetailsModalProps {
  book: Book;
  isOpen: boolean;
  onClose: () => void;
}

function stripHtmlTags(text: string | undefined): string {
  if (!text) return "";
  return text.replace(/<[^>]*>/g, "").trim();
}

function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + "...";
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring" as const,
      stiffness: 300,
      damping: 24,
    },
  },
};

function BookDetailsModal({ book, isOpen, onClose }: BookDetailsModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] sm:max-h-[80vh] overflow-y-auto w-[90vw] sm:w-full p-4 sm:p-6 mx-auto rounded-lg sm:rounded-xl">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl font-bold pr-8 leading-tight">
            {stripHtmlTags(book.title)}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 sm:space-y-6">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
            {book.author && (
              <div className="flex items-start space-x-2">
                <User className="h-4 w-4 sm:h-5 sm:w-5 text-primary/70 flex-shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground">
                    Author
                  </p>
                  <p className="text-sm sm:text-sm text-foreground break-words">
                    {stripHtmlTags(book.author)}
                  </p>
                </div>
              </div>
            )}

            {book.publisher && (
              <div className="flex items-start space-x-2">
                <Building className="h-4 w-4 sm:h-5 sm:w-5 text-chart-2/70 flex-shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground">
                    Publisher
                  </p>
                  <p className="text-sm sm:text-sm text-foreground break-words">
                    {stripHtmlTags(book.publisher)}
                  </p>
                </div>
              </div>
            )}

            {book.pages && (
              <div className="flex items-start space-x-2">
                <BookOpen className="h-4 w-4 sm:h-5 sm:w-5 text-chart-3/70 flex-shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground">
                    Pages
                  </p>
                  <p className="text-sm sm:text-sm text-foreground">
                    {book.pages}
                  </p>
                </div>
              </div>
            )}

            {book.format && (
              <div className="flex items-start space-x-2">
                <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-chart-4/70 flex-shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground">
                    Format
                  </p>
                  <p className="text-sm sm:text-sm text-foreground break-words">
                    {stripHtmlTags(book.format)}
                  </p>
                </div>
              </div>
            )}
          </div>

          {book.subjects && (
            <div>
              <h4 className="text-sm font-medium text-foreground mb-2">
                Subjects
              </h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {stripHtmlTags(book.subjects)}
              </p>
            </div>
          )}

          {book.synopsis && (
            <div>
              <h4 className="text-sm font-medium text-foreground mb-2">
                Synopsis
              </h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {stripHtmlTags(book.synopsis)}
              </p>
            </div>
          )}

          <div className="border-t border-border/50 pt-3 sm:pt-4">
            <h4 className="text-sm font-medium text-foreground mb-3">
              Technical Information
            </h4>
            <div className="space-y-3 sm:grid sm:grid-cols-2 sm:gap-4 sm:space-y-0">
              {book.isbn13 && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground">
                    ISBN-13
                  </p>
                  <p className="text-sm text-foreground font-mono break-all">
                    {book.isbn13}
                  </p>
                </div>
              )}

              {book.isbn10 && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground">
                    ISBN-10
                  </p>
                  <p className="text-sm text-foreground font-mono break-all">
                    {stripHtmlTags(book.isbn10)}
                  </p>
                </div>
              )}

              {book.price && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground">
                    Price
                  </p>
                  <p className="text-sm text-foreground font-semibold">
                    {stripHtmlTags(book.price)}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function BookCard({ book, onRefresh }: BookCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <motion.div variants={itemVariants}>
        <Card
          data-testid="book-card"
          className="h-80 hover:shadow-lg transition-all duration-300 group cursor-pointer flex flex-col bg-card border-border"
        >
          <CardHeader className="pb-3 flex-shrink-0">
            <div className="flex items-start justify-between mb-2">
              <CardTitle
                data-testid="book-title"
                className="text-base font-semibold line-clamp-2 group-hover:text-primary transition-colors flex-1 pr-2"
              >
                {stripHtmlTags(book.title)}
              </CardTitle>
              <div className="flex items-center gap-2 flex-shrink-0">
                {book.pages && (
                  <Badge
                    variant="secondary"
                    className="bg-primary/10 text-primary"
                  >
                    {book.pages}p
                  </Badge>
                )}
                {onRefresh && (
                  <BookActionsDropdown book={book} onSuccess={onRefresh} />
                )}
              </div>
            </div>

            {book.author && (
              <div className="flex items-center text-sm text-muted-foreground">
                <User className="h-4 w-4 mr-2 shrink-0 text-primary" />
                <span className="line-clamp-1">
                  {stripHtmlTags(book.author)}
                </span>
              </div>
            )}
          </CardHeader>

          <CardContent className="pt-0 flex-1 flex flex-col justify-between">
            <div className="space-y-2 flex-1">
              {book.publisher && (
                <div className="flex items-center text-sm text-muted-foreground">
                  <Building className="h-4 w-4 mr-2 shrink-0 text-muted-foreground" />
                  <span className="line-clamp-1">
                    {stripHtmlTags(book.publisher)}
                  </span>
                </div>
              )}

              {book.subjects && (
                <div className="flex items-start text-sm text-muted-foreground">
                  <BookOpen className="h-4 w-4 mr-2 mt-0.5 shrink-0 text-muted-foreground" />
                  <span className="line-clamp-2">
                    {truncateText(stripHtmlTags(book.subjects), 80)}
                  </span>
                </div>
              )}

              {book.synopsis && (
                <div className="flex items-start text-sm text-muted-foreground">
                  <FileText className="h-4 w-4 mr-2 mt-0.5 shrink-0 text-muted-foreground" />
                  <span className="line-clamp-3">
                    {truncateText(stripHtmlTags(book.synopsis), 120)}
                  </span>
                </div>
              )}
            </div>

            <div className="pt-3 mt-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsModalOpen(true)}
                className="w-full"
              >
                <Eye className="h-4 w-4 mr-2" />
                View Details
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <BookDetailsModal
        book={book}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}

export default function BooksGrid({ books, onRefresh }: BooksGridProps) {
  if (books.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-12"
      >
        <div className="bg-card rounded-full p-6 w-24 h-24 mx-auto mb-6">
          <BookOpen className="w-12 h-12 text-primary mx-auto" />
        </div>
        <h3 className="text-lg font-medium text-foreground mb-2">
          No books found
        </h3>
        <p className="text-muted-foreground">
          Try adjusting the filters to find more books.
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
    >
      {books.map((book) => (
        <BookCard key={book.id} book={book} onRefresh={onRefresh} />
      ))}
    </motion.div>
  );
}
