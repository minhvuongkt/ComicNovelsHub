import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet";
import { Layout } from "@/components/layout/layout";
import { StoryCard } from "@/components/story/story-card";
import { StoryCardSkeleton } from "@/components/story/story-card-skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Pagination } from "@/components/ui/pagination";
import { Story } from "@shared/schema";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export default function RankingsPage() {
  const [page, setPage] = useState(1);
  const [activeTab, setActiveTab] = useState("popular");
  const [timeRange, setTimeRange] = useState("all");
  const pageSize = 12;
  
  // Get popular stories
  const { data: stories, isLoading, error } = useQuery<Story[]>({
    queryKey: ["/api/stories", { ranking: activeTab, timeRange, page, limit: 100 }],
  });
  
  const totalPages = Math.ceil((stories?.length || 0) / pageSize);
  const paginatedStories = stories?.slice((page - 1) * pageSize, page * pageSize) || [];
  
  return (
    <Layout>
      <Helmet>
        <title>Story Rankings - GocTruyenNho</title>
      </Helmet>
      
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-4xl mx-auto mb-10">
          <h1 className="text-3xl font-bold mb-4">Story Rankings</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Discover the most popular and highly rated stories on our platform.
          </p>
        </div>
        
        <Tabs
          defaultValue="popular"
          value={activeTab}
          onValueChange={(value) => {
            setActiveTab(value);
            setPage(1);
          }}
          className="mb-8"
        >
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
            <TabsList className="mb-4 sm:mb-0">
              <TabsTrigger value="popular">Most Popular</TabsTrigger>
              <TabsTrigger value="trending">Trending</TabsTrigger>
              <TabsTrigger value="rated">Highest Rated</TabsTrigger>
            </TabsList>
            
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Time Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="day">Today</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <TabsContent value="popular" className="mt-6">
            {renderContent()}
          </TabsContent>
          
          <TabsContent value="trending" className="mt-6">
            {renderContent()}
          </TabsContent>
          
          <TabsContent value="rated" className="mt-6">
            {renderContent()}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
  
  function renderContent() {
    if (isLoading) {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <StoryCardSkeleton key={i} />
          ))}
        </div>
      );
    }
    
    if (error) {
      return (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Failed to load ranked stories. Please try again later.
          </AlertDescription>
        </Alert>
      );
    }
    
    if (paginatedStories.length === 0) {
      return (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">
            No stories found for the selected criteria.
          </p>
        </div>
      );
    }
    
    return (
      <>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {paginatedStories.map((story, index) => (
            <div key={story.id} className="relative">
              {/* Ranking badge */}
              <div className="absolute top-2 left-2 z-10 bg-primary text-white font-bold rounded-full w-8 h-8 flex items-center justify-center">
                {(page - 1) * pageSize + index + 1}
              </div>
              <StoryCard story={story} />
            </div>
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
    );
  }
}