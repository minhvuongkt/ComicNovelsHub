import { Link } from "wouter";
import { Story, Chapter } from "@/types";
import { Button } from "@/components/ui/button";
import { ArrowLeft, BookmarkPlus, List, MoreVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";

type ReadingHeaderProps = {
  story: Story;
  chapter: Chapter;
  onOpenChapterList?: () => void;
};

export function ReadingHeader({ story, chapter, onOpenChapterList }: ReadingHeaderProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Add favorite mutation
  const addFavoriteMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/favorites", { story_id: story.id });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/favorites"] });
      toast({
        title: "Added to favorites",
        description: `${story.title} has been added to your favorites.`
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to add favorite",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    }
  });
  
  // Update reading history
  const updateReadingHistoryMutation = useMutation({
    mutationFn: async () => {
      if (!user) return;
      
      await apiRequest("POST", "/api/reading-history", {
        story_id: story.id,
        chapter_id: chapter.id,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/reading-history"] });
    }
  });
  
  // Report issue mutation
  const reportIssueMutation = useMutation({
    mutationFn: async () => {
      if (!user) return;
      
      await apiRequest("POST", "/api/reports", {
        target_type: "chapter",
        target_id: chapter.id,
        reason: "Reported by user from reading interface",
      });
    },
    onSuccess: () => {
      toast({
        title: "Issue reported",
        description: "Thank you for reporting this issue. Our team will review it shortly."
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to report issue",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    }
  });
  
  // Update reading history when chapter is loaded
  React.useEffect(() => {
    if (user) {
      updateReadingHistoryMutation.mutate();
    }
  }, [chapter.id, user]);
  
  return (
    <div className="sticky top-0 z-30 bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between h-14 px-4">
        <div className="flex items-center">
          <Link href={`/stories/${story.id}`}>
            <Button variant="ghost" size="icon" className="mr-2">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-sm sm:text-base font-medium text-gray-900 dark:text-white line-clamp-1">
              {story.title}
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Chapter {chapter.chapter_number}: {chapter.title}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-1">
          <Button
            variant="ghost" 
            size="icon"
            onClick={() => {
              if (user) {
                addFavoriteMutation.mutate();
              } else {
                toast({
                  title: "Authentication required",
                  description: "Please sign in to add favorites.",
                  variant: "destructive",
                });
              }
            }}
            disabled={addFavoriteMutation.isPending}
          >
            <BookmarkPlus className="h-5 w-5" />
          </Button>
          
          <Button
            variant="ghost" 
            size="icon"
            onClick={onOpenChapterList}
          >
            <List className="h-5 w-5" />
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => {
                if (user) {
                  reportIssueMutation.mutate();
                } else {
                  toast({
                    title: "Authentication required",
                    description: "Please sign in to report issues.",
                    variant: "destructive",
                  });
                }
              }}>
                Report Issue
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
