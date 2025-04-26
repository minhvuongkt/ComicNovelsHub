import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { Helmet } from "react-helmet";
import { Layout } from "@/components/layout/layout";
import { StoryCard } from "@/components/story/story-card";
import { StoryCardSkeleton } from "@/components/story/story-card-skeleton";
import { Pagination } from "@/components/ui/pagination";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, ArrowLeft, Bookmark } from "lucide-react";
import { Genre, Story } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function GenreDetailsPage() {
  const [, params] = useRoute<{ id: string }>("/genres/:id");
  const [page, setPage] = useState(1);
  const pageSize = 12;
  
  const genreId = params ? parseInt(params.id) : 0;
  
  const { data: genre, isLoading: isLoadingGenre, error: genreError } = useQuery<Genre>({
    queryKey: [`/api/genres/${genreId}`],
    enabled: !!genreId,
  });
  
  const { data: stories, isLoading: isLoadingStories, error: storiesError } = useQuery<Story[]>({
    queryKey: [`/api/genres/${genreId}/stories`],
    enabled: !!genreId,
  });
  
  const isLoading = isLoadingGenre || isLoadingStories;
  const error = genreError || storiesError;
  
  // Calculate pagination
  const totalPages = Math.ceil((stories?.length || 0) / pageSize);
  const paginatedStories = stories?.slice((page - 1) * pageSize, page * pageSize) || [];
  
  return (
    <Layout>
      <Helmet>
        <title>{genre ? `${genre.name} Stories - GocTruyenNho` : "Loading..."}</title>
      </Helmet>
      
      <div className="container mx-auto py-8 px-4">
        {/* Back button */}
        <div className="mb-6">
          <Link href="/genres">
            <Button variant="ghost" className="pl-0">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Genres
            </Button>
          </Link>
        </div>
        
        {/* Genre header */}
        {isLoadingGenre ? (
          <div className="flex flex-col items-center mb-8">
            <div className="bg-muted rounded-full p-4 mb-4 h-14 w-14"></div>
            <div className="h-8 bg-muted rounded w-48 mb-2"></div>
            <div className="h-4 bg-muted rounded w-full max-w-lg mb-1"></div>
            <div className="h-4 bg-muted rounded w-2/3 max-w-md"></div>
          </div>
        ) : genre ? (
          <div className="flex flex-col items-center mb-8">
            <div className="bg-primary/10 rounded-full p-4 mb-4">
              <Bookmark className="h-8 w-8" />
            </div>
            <h1 className="text-3xl font-bold mb-2">{genre.name}</h1>
            {genre.description && (
              <p className="text-gray-600 dark:text-gray-400 text-center max-w-lg mb-6">
                {genre.description}
              </p>
            )}
          </div>
        ) : null}
        
        {/* Error alert */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              Failed to load content. Please try again later.
            </AlertDescription>
          </Alert>
        )}
        
        {/* Results count */}
        {!isLoading && !error && stories && (
          <div className="mb-6">
            <p className="text-muted-foreground">
              Found {stories.length} {stories.length === 1 ? "story" : "stories"} in this genre
            </p>
          </div>
        )}
        
        {/* Stories grid */}
        {isLoadingStories ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <StoryCardSkeleton key={i} />
            ))}
          </div>
        ) : !error && paginatedStories.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
              {paginatedStories.map((story) => (
                <StoryCard key={story.id} story={story} />
              ))}
            </div>
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center">
                <Pagination
                  currentPage={page}
                  totalPages={totalPages}
                  onPageChange={setPage}
                />
              </div>
            )}
          </>
        ) : !error && stories?.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">
              No stories found in this genre. Check back later for updates.
            </p>
          </div>
        ) : null}
      </div>
    </Layout>
  );
}