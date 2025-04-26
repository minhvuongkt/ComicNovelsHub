import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { Story, Chapter } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { formatDate, truncateText, getReadingProgress } from "@/lib/utils";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";
import { Loader2, MoreHorizontal, BookOpenText, Trash2, RefreshCw } from "lucide-react";

type ReadingHistoryItem = {
  story: Story;
  chapter: Chapter;
  history: {
    id: number;
    user_id: number;
    story_id: number;
    chapter_id: number;
    progress: number;
    created_at: Date;
    updated_at: Date;
  };
};

export function ReadingHistoryList() {
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [clearAllDialogOpen, setClearAllDialogOpen] = useState(false);
  const [selectedHistoryId, setSelectedHistoryId] = useState<number | null>(null);

  // Fetch reading history
  const { 
    data: readingHistory = [], 
    isLoading,
    isError,
  } = useQuery<ReadingHistoryItem[]>({
    queryKey: ["/api/reading-history"],
  });

  // Delete reading history entry mutation
  const deleteHistoryMutation = useMutation({
    mutationFn: async (storyId: number) => {
      await apiRequest("DELETE", `/api/reading-history/${storyId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/reading-history"] });
      setDialogOpen(false);
      toast({
        title: "History entry removed",
        description: "Reading history entry has been removed.",
      });
    },
    onError: () => {
      toast({
        title: "Failed to remove history entry",
        description: "There was a problem removing the history entry. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Clear all reading history mutation
  const clearHistoryMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", "/api/reading-history");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/reading-history"] });
      setClearAllDialogOpen(false);
      toast({
        title: "Reading history cleared",
        description: "Your reading history has been cleared.",
      });
    },
    onError: () => {
      toast({
        title: "Failed to clear history",
        description: "There was a problem clearing your reading history. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleDeleteHistoryEntry = (storyId: number) => {
    setSelectedHistoryId(storyId);
    setDialogOpen(true);
  };

  const confirmDeleteHistoryEntry = () => {
    if (selectedHistoryId !== null) {
      deleteHistoryMutation.mutate(selectedHistoryId);
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold">Reading History</h3>
          {readingHistory.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setClearAllDialogOpen(true)}
              disabled={clearHistoryMutation.isPending}
            >
              {clearHistoryMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Clear History
                </>
              )}
            </Button>
          )}
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : isError ? (
          <div className="text-center py-12">
            <p className="text-red-500">Failed to load reading history.</p>
          </div>
        ) : readingHistory.length === 0 ? (
          <div className="text-center py-12">
            <BookOpenText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium mb-2">No reading history yet</h3>
            <p className="text-gray-500 mb-4">
              Start reading stories to build your history.
            </p>
            <Link href="/">
              <Button>Browse Stories</Button>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Story</TableHead>
                  <TableHead>Last Read</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead className="w-[80px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {readingHistory.map((item) => (
                  <TableRow key={item.history.id}>
                    <TableCell>
                      <div className="flex items-start gap-3">
                        <div className="h-14 w-10 overflow-hidden rounded">
                          <img 
                            src={item.story.cover_image || "https://placehold.co/400x600/gray/white?text=No+Cover"} 
                            alt={item.story.title} 
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div>
                          <Link href={`/stories/${item.story.id}`} className="font-medium hover:text-primary">
                            {truncateText(item.story.title, 40)}
                          </Link>
                          <div className="text-xs text-gray-500 mt-1">
                            Chapter {item.chapter.chapter_number}: {truncateText(item.chapter.title, 30)}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">
                      {formatDate(item.history.updated_at)}
                    </TableCell>
                    <TableCell>
                      <div className="w-full max-w-[120px]">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs text-gray-500">
                            {getReadingProgress(item.chapter.chapter_number, item.story.chapters?.length || 0)}%
                          </span>
                        </div>
                        <Progress 
                          value={getReadingProgress(item.chapter.chapter_number, item.story.chapters?.length || 0)} 
                          className="h-2"
                        />
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/reading/${item.story.id}/${item.chapter.id}`}>
                              <BookOpenText className="h-4 w-4 mr-2" />
                              Continue Reading
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDeleteHistoryEntry(item.story.id)}
                            className="text-red-500 focus:text-red-500"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Remove from History
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>

      {/* Delete confirmation dialog */}
      <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove from history?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove this story from your reading history. Your reading progress will be lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteHistoryEntry}>
              {deleteHistoryMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Clear all confirmation dialog */}
      <AlertDialog open={clearAllDialogOpen} onOpenChange={setClearAllDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear all reading history?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove all items from your reading history. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => clearHistoryMutation.mutate()}>
              {clearHistoryMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Clear All
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}