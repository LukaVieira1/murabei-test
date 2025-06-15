"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "./ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { createBookAction } from "@/lib/actions/books";

interface CreateBookModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateBookModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateBookModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [priceValue, setPriceValue] = useState("");
  const [isbn10Value, setIsbn10Value] = useState("");
  const [isbn13Value, setIsbn13Value] = useState("");
  const formRef = useRef<HTMLFormElement>(null);
  const { toast } = useToast();

  const formatPriceInput = (inputValue: string) => {
    const numericValue = inputValue.replace(/[^\d]/g, "");

    if (!numericValue) return "";

    const cents = parseInt(numericValue);

    const dollars = cents / 100;

    return dollars.toFixed(2);
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;

    if (inputValue === "") {
      setPriceValue("");
      return;
    }

    const formattedValue = formatPriceInput(inputValue);
    setPriceValue(formattedValue);
  };

  const handleIsbn10Change = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^\d]/g, "");
    if (value.length <= 10) {
      setIsbn10Value(value);
    }
  };

  const handleIsbn13Change = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^\d]/g, "");
    if (value.length <= 13) {
      setIsbn13Value(value);
    }
  };

  const validateForm = () => {
    if (isbn10Value && isbn10Value.length !== 10) {
      toast({
        title: "Validation Error",
        description: "ISBN-10 must be exactly 10 digits",
        variant: "destructive",
      });
      return false;
    }

    if (isbn13Value && isbn13Value.length !== 13) {
      toast({
        title: "Validation Error",
        description: "ISBN-13 must be exactly 13 digits",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (formData: FormData) => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      if (priceValue) {
        formData.set("price", `$${priceValue}`);
      }
      if (isbn10Value) {
        formData.set("isbn10", isbn10Value);
      }
      if (isbn13Value) {
        formData.set("isbn13", isbn13Value);
      }

      const result = await createBookAction(formData);

      if (result.success) {
        toast({
          title: "Success!",
          description: result.message || "Book created successfully.",
        });

        formRef.current?.reset();
        setPriceValue("");
        setIsbn10Value("");
        setIsbn13Value("");
        onClose();

        setTimeout(() => {
          onSuccess();
        }, 100);
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to create book",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error creating book:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      formRef.current?.reset();
      setPriceValue("");
      setIsbn10Value("");
      setIsbn13Value("");
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent
        data-testid="create-book-modal"
        className="max-w-2xl max-h-[90vh] sm:max-h-[80vh] w-[90vw] sm:w-full mx-auto rounded-lg sm:rounded-xl flex flex-col"
      >
        <DialogHeader className="flex-shrink-0 p-4 sm:p-6 pb-0">
          <DialogTitle className="flex items-center justify-between text-lg sm:text-xl font-bold pr-8 leading-tight">
            Create New Book
          </DialogTitle>
          <DialogDescription className="text-sm sm:text-base">
            Add a new book to your library. Title and Author are required
            fields.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 pt-4">
          <form
            ref={formRef}
            action={handleSubmit}
            className="space-y-4 sm:space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-sm font-medium">
                  Title *
                </Label>
                <Input
                  id="title"
                  name="title"
                  placeholder="Enter book title"
                  required
                  disabled={isLoading}
                />
                <div
                  data-testid="title-error"
                  className="hidden text-xs text-red-500"
                >
                  Title is required
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="author" className="text-sm font-medium">
                  Author *
                </Label>
                <Input
                  id="author"
                  name="author"
                  placeholder="Enter author name"
                  required
                  disabled={isLoading}
                />
                <div
                  data-testid="author-error"
                  className="hidden text-xs text-red-500"
                >
                  Author is required
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
              <div className="space-y-2">
                <Label htmlFor="publisher" className="text-sm font-medium">
                  Publisher
                </Label>
                <Input
                  id="publisher"
                  name="publisher"
                  placeholder="Enter publisher"
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="format" className="text-sm font-medium">
                  Format
                </Label>
                <Input
                  id="format"
                  name="format"
                  placeholder="e.g., Paperback, Hardcover"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
              <div className="space-y-2">
                <Label htmlFor="pages" className="text-sm font-medium">
                  Pages
                </Label>
                <Input
                  id="pages"
                  name="pages"
                  type="number"
                  placeholder="Number of pages"
                  min="1"
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="isbn10" className="text-sm font-medium">
                  ISBN-10
                </Label>
                <Input
                  id="isbn10"
                  name="isbn10"
                  placeholder="10 digits"
                  value={isbn10Value}
                  onChange={handleIsbn10Change}
                  disabled={isLoading}
                  maxLength={10}
                  className={
                    isbn10Value &&
                    isbn10Value.length !== 10 &&
                    isbn10Value.length > 0
                      ? "border-red-500"
                      : ""
                  }
                />
                {isbn10Value &&
                  isbn10Value.length > 0 &&
                  isbn10Value.length !== 10 && (
                    <p className="text-xs text-red-500">
                      Must be exactly 10 digits
                    </p>
                  )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="isbn13" className="text-sm font-medium">
                  ISBN-13
                </Label>
                <Input
                  id="isbn13"
                  name="isbn13"
                  placeholder="13 digits"
                  value={isbn13Value}
                  onChange={handleIsbn13Change}
                  disabled={isLoading}
                  maxLength={13}
                  className={
                    isbn13Value &&
                    isbn13Value.length !== 13 &&
                    isbn13Value.length > 0
                      ? "border-red-500"
                      : ""
                  }
                />
                {isbn13Value &&
                  isbn13Value.length > 0 &&
                  isbn13Value.length !== 13 && (
                    <p className="text-xs text-red-500">
                      Must be exactly 13 digits
                    </p>
                  )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="price" className="text-sm font-medium">
                  Price
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                    $
                  </span>
                  <Input
                    id="price"
                    name="price"
                    placeholder="0.00"
                    value={priceValue}
                    onChange={handlePriceChange}
                    disabled={isLoading}
                    className="pl-8"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="subjects" className="text-sm font-medium">
                Subjects
              </Label>
              <Input
                id="subjects"
                name="subjects"
                placeholder="Enter subjects separated by commas"
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="synopsis" className="text-sm font-medium">
                Synopsis
              </Label>
              <Textarea
                id="synopsis"
                name="synopsis"
                placeholder="Enter book synopsis"
                rows={3}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="overview" className="text-sm font-medium">
                Overview
              </Label>
              <Textarea
                id="overview"
                name="overview"
                placeholder="Enter book overview"
                rows={2}
                disabled={isLoading}
              />
            </div>
          </form>
        </div>

        {/* Footer fixo com botões */}
        <div className="flex-shrink-0 bg-card border-t border-border p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
              className="w-full sm:w-auto flex-1"
              data-testid="close-modal"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full sm:w-auto flex-1"
              onClick={() => formRef.current?.requestSubmit()}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Book
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
