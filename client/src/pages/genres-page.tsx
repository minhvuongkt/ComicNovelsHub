import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Helmet } from "react-helmet";
import { Layout } from "@/components/layout/layout";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Bookmark, 
  BookOpen, 
  Calendar, 
  Clock, 
  Film, 
  Flame, 
  Heart, 
  Laugh, 
  Layers, 
  Swords, 
  Zap 
} from "lucide-react";
import { Genre } from "@shared/schema";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

const GENRE_ICONS: Record<string, React.ReactNode> = {
  "Action": <Swords className="h-6 w-6" />,
  "Adventure": <Layers className="h-6 w-6" />,
  "Comedy": <Laugh className="h-6 w-6" />,
  "Drama": <Film className="h-6 w-6" />,
  "Fantasy": <Zap className="h-6 w-6" />,
  "Historical": <Calendar className="h-6 w-6" />,
  "Horror": <Flame className="h-6 w-6" />,
  "Romance": <Heart className="h-6 w-6" />,
  "Sci-Fi": <BookOpen className="h-6 w-6" />,
  "Slice of Life": <Clock className="h-6 w-6" />,
};

export default function GenresPage() {
  const { data: genres, isLoading, error } = useQuery<Genre[]>({
    queryKey: ["/api/genres"],
  });

  return (
    <Layout>
      <Helmet>
        <title>Browse Genres - GocTruyenNho</title>
      </Helmet>
      
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-4xl mx-auto mb-10">
          <h1 className="text-3xl font-bold mb-4">Browse Stories by Genre</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Explore our collection of stories categorized by genre. Click on a genre to see all stories in that category.
          </p>
        </div>
        
        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <GenreCardSkeleton key={i} />
            ))}
          </div>
        )}
        
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              Failed to load genres. Please try again later.
            </AlertDescription>
          </Alert>
        )}
        
        {genres && genres.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {genres.map((genre) => (
              <Link key={genre.id} href={`/genres/${genre.id}`}>
                <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="flex flex-col items-center text-center p-6">
                    <div className="bg-primary/10 rounded-full p-4 mb-4">
                      {GENRE_ICONS[genre.name] || <Bookmark className="h-6 w-6" />}
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{genre.name}</h3>
                    {genre.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {genre.description}
                      </p>
                    )}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
        
        {genres && genres.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">
              No genres found. Please check back later.
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
}

function GenreCardSkeleton() {
  return (
    <Card className="h-full">
      <CardContent className="flex flex-col items-center text-center p-6">
        <div className="bg-muted rounded-full p-4 mb-4 h-14 w-14"></div>
        <div className="h-6 bg-muted rounded w-24 mb-2"></div>
        <div className="h-4 bg-muted rounded w-full mb-1"></div>
        <div className="h-4 bg-muted rounded w-2/3"></div>
      </CardContent>
    </Card>
  );
}