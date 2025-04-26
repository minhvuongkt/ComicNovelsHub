import { useEffect } from "react";
import { useParams, Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Navbar } from "@/components/layout/navbar";
import { MobileNavbar } from "@/components/layout/mobile-navbar";
import { ChapterList } from "@/components/story/chapter-list";
import { CommentSection } from "@/components/story/comment-section";
import { Story, Author, Genre, TranslationGroup } from "@/types";
import { Button } from "@/components/ui/button";
import { 
  BookMarked, 
  User, 
  Users, 
  CalendarDays, 
  BookOpen, 
  Play,
  Loader2
} from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { formatDate, getGenreBadgeClass } from "@/lib/utils";

export default function StoryDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const storyId = parseInt(id);
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Fetch story details
  const { 
    data: story, 
    isLoading: isStoryLoading, 
    isError: isStoryError 
  } = useQuery<Story>({
    queryKey: [`/api/stories/${storyId}`],
  });
  
  // Get reading history for this story
  const { 
    data: readingHistory,
    isLoading: isHistoryLoading 
  } = useQuery({
    queryKey: ["/api/reading-history", storyId],
    queryFn: async () => {
      if (!user) return null;
      
      const res = await fetch("/api/reading-history");
      if (!res.ok) throw new Error("Failed to fetch reading history");
      
      const history = await res.json();
      return history.find((item: any) => item.story.id === storyId) || null;
    },
    enabled: !!user
  });
  
  // Add to favorites mutation
  const addToFavoritesMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/favorites", { story_id: storyId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/favorites"] });
      toast({
        title: "Added to favorites",
        description: `${story?.title} has been added to your favorites.`
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to add to favorites",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    }
  });
  
  // Check if story is in favorites
  const { 
    data: isFavorite,
    isLoading: isFavoriteLoading 
  } = useQuery({
    queryKey: ["/api/favorites", storyId],
    queryFn: async () => {
      if (!user) return false;
      
      const res = await fetch("/api/favorites");
      if (!res.ok) throw new Error("Failed to fetch favorites");
      
      const favorites = await res.json();
      return favorites.some((item: any) => item.story.id === storyId);
    },
    enabled: !!user
  });
  
  const handleAddToFavorites = () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to add favorites.",
        variant: "destructive",
      });
      return;
    }
    
    addToFavoritesMutation.mutate();
  };
  
  // If there's no story data yet, use a placeholder
  const placeholderStory: Story = {
    id: storyId,
    title: "Loading...",
    alternative_title: "",
    cover_image: "",
    description: "Loading story details...",
    created_at: new Date().toISOString(),
    release_year: undefined,
    author: { id: 0, name: "Unknown", created_at: "" } as Author,
    group: { id: 0, name: "Unknown", created_at: "" } as TranslationGroup,
    genres: [] as Genre[]
  };
  
  const storyData = story || placeholderStory;
  const isLoading = isStoryLoading || isHistoryLoading || isFavoriteLoading;
  
  return (
    <div className="min-h-screen flex flex-col pb-16 md:pb-0">
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 pb-20 md:pb-8 pt-4">
        {isStoryError ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Story not found</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">The story you're looking for doesn't exist or has been removed.</p>
              <Link href="/">
                <Button>Back to Home</Button>
              </Link>
            </div>
          </div>
        ) : isLoading ? (
          <div className="flex justify-center items-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row">
                <div className="sm:w-1/3 mb-4 sm:mb-0 sm:pr-6">
                  <div className="relative rounded-lg overflow-hidden">
                    <img 
                      src={storyData.cover_image || "https://placehold.co/400x560/gray/white?text=No+Cover"} 
                      alt={storyData.title} 
                      className="w-full h-auto object-cover aspect-[3/4]"
                    />
                    <div className="absolute top-2 right-2 p-1.5 bg-white dark:bg-gray-800 rounded-full shadow">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className={isFavorite ? "text-primary" : "text-gray-500 hover:text-primary dark:text-gray-400 dark:hover:text-primary-400"}
                        onClick={handleAddToFavorites}
                        disabled={addToFavoritesMutation.isPending}
                      >
                        <BookMarked className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                </div>
                
                <div className="sm:w-2/3">
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{storyData.title}</h1>
                  
                  {storyData.alternative_title && (
                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-3">
                      <span>Alternative: </span>
                      <span className="ml-1">{storyData.alternative_title}</span>
                    </div>
                  )}
                  
                  {storyData.genres && storyData.genres.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {storyData.genres.map((genre) => (
                        <Link key={genre.id} href={`/genres/${genre.id}`}>
                          <span className={`genre-badge ${getGenreBadgeClass(genre.name)}`}>
                            {genre.name}
                          </span>
                        </Link>
                      ))}
                    </div>
                  )}
                  
                  <div className="space-y-2 mb-4">
                    {storyData.author && (
                      <div className="flex items-start">
                        <User className="text-gray-500 dark:text-gray-400 mr-2 h-5 w-5" />
                        <div>
                          <div className="text-sm text-gray-700 dark:text-gray-300">Author</div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {storyData.author.name}
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {storyData.group && (
                      <div className="flex items-start">
                        <Users className="text-gray-500 dark:text-gray-400 mr-2 h-5 w-5" />
                        <div>
                          <div className="text-sm text-gray-700 dark:text-gray-300">Translation Group</div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {storyData.group.name}
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {storyData.release_year && (
                      <div className="flex items-start">
                        <CalendarDays className="text-gray-500 dark:text-gray-400 mr-2 h-5 w-5" />
                        <div>
                          <div className="text-sm text-gray-700 dark:text-gray-300">Year</div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {storyData.release_year}
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {story?.chapters && (
                      <div className="flex items-start">
                        <BookOpen className="text-gray-500 dark:text-gray-400 mr-2 h-5 w-5" />
                        <div>
                          <div className="text-sm text-gray-700 dark:text-gray-300">Chapters</div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {story.chapters.length} chapters
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-3 mt-5">
                    {story?.chapters && story.chapters.length > 0 ? (
                      <>
                        <Link href={`/reading/${storyId}/${story.chapters[0].id}`}>
                          <Button className="w-full sm:w-auto flex items-center">
                            <Play className="mr-2 h-4 w-4" /> Read First Chapter
                          </Button>
                        </Link>
                        
                        {readingHistory && (
                          <Link href={`/reading/${storyId}/${readingHistory.chapter.id}`}>
                            <Button variant="outline" className="w-full sm:w-auto flex items-center">
                              <BookMarked className="mr-2 h-4 w-4" /> Continue (Ch. {readingHistory.chapter.chapter_number})
                            </Button>
                          </Link>
                        )}
                      </>
                    ) : (
                      <Button disabled className="w-full sm:w-auto">
                        No Chapters Available
                      </Button>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Summary section */}
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Summary</h2>
                <div className="text-gray-700 dark:text-gray-300 prose dark:prose-invert">
                  {storyData.description ? (
                    <p>{storyData.description}</p>
                  ) : (
                    <p>No description available for this story.</p>
                  )}
                </div>
              </div>
            </div>
            
            {/* Chapters section */}
            {story?.chapters && (
              <ChapterList storyId={storyId} chapters={story.chapters} />
            )}
            
            {/* Comments section */}
            <CommentSection storyId={storyId} />
          </div>
        )}
      </main>
      
      <MobileNavbar />
    </div>
  );
}
