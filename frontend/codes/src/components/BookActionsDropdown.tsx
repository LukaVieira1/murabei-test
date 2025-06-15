"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { MoreVertical, Edit, Trash2 } from "lucide-react";
import { deleteBookAction } from "@/lib/actions/books";
import EditBookModal from "./EditBookModal";
import type { Book } from "@/lib/types";

interface BookActionsDropdownProps {
  book: Book;
  onSuccess: () => void;
}

export default function BookActionsDropdown({
  book,
  onSuccess,
}: BookActionsDropdownProps) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  const handleDelete = async () => {
    setIsDeleting(true);

    try {
      const result = await deleteBookAction(book.id);

      if (result.success) {
        toast({
          title: "Success!",
          description: result.message || "Book deleted successfully.",
        });

        setIsDeleteDialogOpen(false);

        setTimeout(() => {
          onSuccess();
        }, 100);
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to delete book",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error deleting book:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 hover:bg-muted"
            data-testid="book-actions-dropdown"
          >
            <MoreVertical className="h-4 w-4" />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
          <DropdownMenuItem
            onClick={() => setIsEditModalOpen(true)}
            className="cursor-pointer"
            data-testid="edit-book-option"
          >
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setIsDeleteDialogOpen(true)}
            className="cursor-pointer text-red-600 focus:text-red-600"
            data-testid="delete-book-option"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <EditBookModal
        book={book}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSuccess={onSuccess}
      />

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent data-testid="confirm-delete-modal">
          <DialogHeader>
            <DialogTitle>Are you sure?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete the
              book &quot;{book.title}&quot; from the library.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={isDeleting}
              data-testid="cancel-delete-button"
            >
              Cancel
            </Button>
            <Button
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
              data-testid="confirm-delete-button"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
