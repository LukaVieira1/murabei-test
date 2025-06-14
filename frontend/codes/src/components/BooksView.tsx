"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import BooksGrid from "./BooksGrid";
import BooksList from "./BooksList";
import { Grid, List } from "lucide-react";
import type { BooksResponse } from "@/lib/types";

interface BooksViewProps {
  data: BooksResponse;
}

export default function BooksView({ data }: BooksViewProps) {
  const [currentView, setCurrentView] = useState("grid");
  const { books, pagination } = data;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Resultados da Busca</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="text-sm text-muted-foreground">
                {pagination.total_count}{" "}
                {pagination.total_count === 1 ? "book found" : "books found"}
              </div>
              <div className="text-sm text-muted-foreground">
                Página {pagination.current_page} de {pagination.total_pages}
              </div>
            </div>

            <Tabs
              value={currentView}
              onValueChange={setCurrentView}
              className="w-auto"
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="grid" className="flex items-center gap-2">
                  <Grid className="h-4 w-4" />
                  Grid
                </TabsTrigger>
                <TabsTrigger value="list" className="flex items-center gap-2">
                  <List className="h-4 w-4" />
                  Lista
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardContent>
      </Card>

      <Tabs value={currentView} onValueChange={setCurrentView}>
        <TabsContent value="grid" className="mt-0">
          <BooksGrid books={books} />
        </TabsContent>

        <TabsContent value="list" className="mt-0">
          <BooksList data={data} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
