import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Helmet } from "react-helmet";
import { Layout } from "@/components/layout/layout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { Genre } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";

export default function GenresPage() {
  const [searchQuery, setSearchQuery] = useState("");
  
  const { data: genres, isLoading, error } = useQuery<Genre[]>({
    queryKey: ["/api/genres"],
  });
  
  const filteredGenres = genres?.filter(genre => 
    genre.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (genre.description && genre.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <Layout>
      <Helmet>
        <title>Browse Genres - GocTruyenNho</title>
      </Helmet>
      
      <div className="container mx-auto py-8 px-4">
        <div className="flex flex-col items-center mb-8">
          <h1 className="text-3xl font-bold mb-4">Browse by Genre</h1>
          <p className="text-gray-600 dark:text-gray-400 text-center max-w-2xl mb-6">
            Discover stories across different genres. From action-packed adventures to heartwarming romances,
            find exactly what you're looking for.
          </p>
          
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <Input
              placeholder="Search genres..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(9)].map((_, index) => (
              <Card key={index} className="overflow-hidden">
                <CardHeader>
                  <Skeleton className="h-6 w-36 mb-1" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-3/4" />
                </CardContent>
                <CardFooter>
                  <Skeleton className="h-4 w-20" />
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-10">
            <p className="text-red-500">Failed to load genres. Please try again later.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGenres?.map((genre) => (
              <Link key={genre.id} href={`/genres/${genre.id}`}>
                <a className="block h-full">
                  <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
                    <CardHeader>
                      <CardTitle>{genre.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="line-clamp-3">
                        {genre.description || "No description available"}
                      </CardDescription>
                    </CardContent>
                    <CardFooter>
                      <p className="text-sm text-primary">Browse stories &rarr;</p>
                    </CardFooter>
                  </Card>
                </a>
              </Link>
            ))}
            
            {filteredGenres?.length === 0 && (
              <div className="col-span-3 text-center py-10">
                <p className="text-gray-500">No genres found matching your search criteria.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}