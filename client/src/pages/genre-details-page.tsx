import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { Helmet } from "react-helmet";
import { Layout } from "@/components/layout/layout";
import { StoryCard } from "@/components/story/story-card";
import { StoryCardSkeleton } from "@/components/story/story-card-skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Pagination } from "@/components/ui/pagination";
import { Genre, Story } from "@shared/schema";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export default function GenreDetailsPage() {
  const [, params] = useRoute<{ id: string }>("/genres/:id");
  const genreId = parseInt(params?.id || "0");
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState("newest");
  const pageSize = 12;
  
  const { data: genre, isLoading: isLoadingGenre, error: genreError } = useQuery<Genre>({
    queryKey: ["/api/genres", genreId],
    enabled: !!genreId,
  });
  
  // Get stories by genre
  const { data: stories, isLoading: isLoadingStories, error: storiesError } = useQuery<Story[]>({
    queryKey: ["/api/genres", genreId, "stories", { page, sort }],
    enabled: !!genreId,
  });
  
  const totalPages = Math.ceil((stories?.length || 0) / pageSize);
  
  // Reset page when genre changes
  useEffect(() => {
    setPage(1);
  }, [genreId]);
  
  // Apply sorting and pagination
  const sortedStories = [...(stories || [])].sort((a, b) => {
    if (sort === "newest") {
      return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
    } else if (sort === "oldest") {
      return new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime();
    } else if (sort === "title_asc") {
      return a.title.localeCompare(b.title);
    } else if (sort === "title_desc") {
      return b.title.localeCompare(a.title);
    }
    return 0;
  });
  
  const paginatedStories = sortedStories.slice((page - 1) * pageSize, page * pageSize);
  
  const isLoading = isLoadingGenre || isLoadingStories;
  const error = genreError || storiesError;
  
  return (
    <Layout>
      <Helmet>
        <title>{genre ? `${genre.name} Stories - GocTruyenNho` : "Loading Genre - GocTruyenNho"}</title>
      </Helmet>
      
      <div className="container mx-auto py-8 px-4">
        {isLoading ? (
          <div className="max-w-4xl mx-auto">
            <div className="animate-pulse">
              <div className="h-8 w-1/3 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
              <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
              <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
          </div>
        ) : error ? (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              Failed to load genre information. Please try again later.
            </AlertDescription>
          </Alert>
        ) : genre ? (
          <div className="max-w-4xl mx-auto mb-10">
            <h1 className="text-3xl font-bold mb-4">{genre.name}</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {genre.description || "No description available for this genre."}
            </p>
          </div>
        ) : (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Not Found</AlertTitle>
            <AlertDescription>
              The genre you're looking for doesn't exist.
            </AlertDescription>
          </Alert>
        )}
        
        {/* Control bar */}
        {!error && genre && (
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
            <h2 className="text-xl font-semibold mb-4 sm:mb-0">Stories in {genre.name}</h2>
            <div className="w-full sm:w-auto">
              <Select value={sort} onValueChange={setSort}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                  <SelectItem value="title_asc">Title (A-Z)</SelectItem>
                  <SelectItem value="title_desc">Title (Z-A)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
        
        {/* Story grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <StoryCardSkeleton key={i} />
            ))}
          </div>
        ) : error ? null : stories?.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">No stories found for this genre.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {paginatedStories.map((story) => (
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
      </div>
    </Layout>
  );
}