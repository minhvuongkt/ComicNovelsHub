import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet";
import { Layout } from "@/components/layout/layout";
import { StoryCard } from "@/components/story/story-card";
import { StoryCardSkeleton } from "@/components/story/story-card-skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Pagination } from "@/components/ui/pagination";
import { Story, Chapter } from "@shared/schema";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export default function RecentPage() {
  const [page, setPage] = useState(1);
  const [activeTab, setActiveTab] = useState("stories");
  const pageSize = 12;
  
  // Get recent stories
  const { data: recentStories, isLoading: isLoadingStories, error: storiesError } = useQuery<Story[]>({
    queryKey: ["/api/stories", { recent: true, page, limit: 100 }],
  });
  
  // Get recent chapters (we'll need a dedicated endpoint for this in the backend)
  const { data: recentChapters, isLoading: isLoadingChapters, error: chaptersError } = useQuery<Chapter[]>({
    queryKey: ["/api/chapters", { recent: true, page, limit: 100 }],
  });
  
  const isLoading = activeTab === "stories" ? isLoadingStories : isLoadingChapters;
  const error = activeTab === "stories" ? storiesError : chaptersError;
  
  const getStoriesFromChapters = async () => {
    if (!recentChapters) return [];
    
    // Extract unique story IDs from chapters
    const storyIds = [...new Set(recentChapters.map(chapter => chapter.story_id))];
    
    // Fetch story details for each ID
    const stories: Story[] = [];
    for (const id of storyIds) {
      try {
        const response = await fetch(`/api/stories/${id}`);
        if (response.ok) {
          const story = await response.json();
          stories.push(story);
        }
      } catch (error) {
        console.error(`Failed to fetch story ${id}:`, error);
      }
    }
    
    return stories;
  };
  
  // Get stories for chapters tab
  const { data: chapterStories, isLoading: isLoadingChapterStories } = useQuery<Story[]>({
    queryKey: ["/api/chapters", "stories", { recent: true }],
    queryFn: getStoriesFromChapters,
    enabled: !!recentChapters && activeTab === "chapters",
  });
  
  const getDataForActiveTab = () => {
    if (activeTab === "stories") {
      return recentStories || [];
    } else {
      return chapterStories || [];
    }
  };
  
  const data = getDataForActiveTab();
  const totalPages = Math.ceil((data?.length || 0) / pageSize);
  const paginatedData = data.slice((page - 1) * pageSize, page * pageSize);
  
  return (
    <Layout>
      <Helmet>
        <title>Recent Updates - GocTruyenNho</title>
      </Helmet>
      
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-4xl mx-auto mb-10">
          <h1 className="text-3xl font-bold mb-4">Recent Updates</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Stay up to date with the latest stories and chapters added to our platform.
          </p>
        </div>
        
        <Tabs
          defaultValue="stories"
          value={activeTab}
          onValueChange={(value) => {
            setActiveTab(value);
            setPage(1);
          }}
          className="mb-8"
        >
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
            <TabsTrigger value="stories">New Stories</TabsTrigger>
            <TabsTrigger value="chapters">New Chapters</TabsTrigger>
          </TabsList>
          
          <TabsContent value="stories" className="mt-6">
            {isLoading || isLoadingChapterStories ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {[...Array(8)].map((_, i) => (
                  <StoryCardSkeleton key={i} />
                ))}
              </div>
            ) : error ? (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>
                  Failed to load recent stories. Please try again later.
                </AlertDescription>
              </Alert>
            ) : paginatedData.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400">No recent stories found.</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {paginatedData.map((story) => (
                    <StoryCard key={story.id} story={story} />
                  ))}
                </div>
                
                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-8 flex justify-center">
                    <Pagination
                      currentPage={page}
                      totalPages={totalPages}
                      onPageChange={setPage}
                    />
                  </div>
                )}
              </>
            )}
          </TabsContent>
          
          <TabsContent value="chapters" className="mt-6">
            {isLoading || isLoadingChapterStories ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {[...Array(8)].map((_, i) => (
                  <StoryCardSkeleton key={i} />
                ))}
              </div>
            ) : error ? (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>
                  Failed to load stories with recent chapters. Please try again later.
                </AlertDescription>
              </Alert>
            ) : paginatedData.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400">No stories with recent chapters found.</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {paginatedData.map((story) => (
                    <StoryCard key={story.id} story={story} />
                  ))}
                </div>
                
                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-8 flex justify-center">
                    <Pagination
                      currentPage={page}
                      totalPages={totalPages}
                      onPageChange={setPage}
                    />
                  </div>
                )}
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}