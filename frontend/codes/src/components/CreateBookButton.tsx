"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import CreateBookModal from "./CreateBookModal";
import { useRouter } from "next/navigation";

export default function CreateBookButton() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();

  const handleSuccess = () => {
    router.refresh();
  };

  return (
    <>
      <Button
        className="bg-primary text-primary-foreground shadow-lg transition-all duration-300 font-semibold"
        onClick={() => setIsModalOpen(true)}
        size="sm"
      >
        <Plus className="h-4 w-4 mr-1.5" />
        <span className="hidden xs:inline sm:hidden md:inline">New Book</span>
      </Button>

      <CreateBookModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleSuccess}
      />
    </>
  );
}
