import { Link } from "wouter";
import { StorySummary } from "@/types";
import { Button } from "@/components/ui/button";
import { BookmarkPlus } from "lucide-react";
import { formatRelativeTime } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";

type UpdateCardProps = {
  story: StorySummary;
};

export function UpdateCard({ story }: UpdateCardProps) {
  const { user } = useAuth();
  
  // Add favorite mutation
  const addFavoriteMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/favorites", { story_id: story.id });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/favorites"] });
    }
  });
  
  const handleAddFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (user) {
      addFavoriteMutation.mutate();
    } else {
      // Redirect to login if not authenticated
      window.location.href = "/auth";
    }
  };
  
  return (
    <div className="flex items-center bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
      <Link href={`/stories/${story.id}`} className="flex-shrink-0 w-16 h-20 sm:w-20 sm:h-24">
        <img 
          src={story.cover_image || "https://placehold.co/400x560/gray/white?text=No+Cover"} 
          alt={story.title} 
          className="w-full h-full object-cover"
        />
      </Link>
      <div className="flex-grow p-3">
        <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-1">{story.title}</h3>
        <p className="text-xs text-gray-500 dark:text-gray-400">{story.author_name || "Unknown Author"}</p>
        <div className="flex items-center mt-1">
          <span className="bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-300 px-2 py-0.5 rounded text-xs">
            {story.completed ? "Completed" : `Chapter ${story.latest_chapter}`}
          </span>
          <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
            {formatRelativeTime(new Date(Date.now() - Math.random() * 86400000 * 3))}
          </span>
        </div>
      </div>
      <div className="pr-3">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={handleAddFavorite}
          disabled={addFavoriteMutation.isPending}
        >
          <BookmarkPlus className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
