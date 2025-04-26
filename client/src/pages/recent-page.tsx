import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet";
import { format } from "date-fns";
import { Layout } from "@/components/layout/layout";
import { StoryCard } from "@/components/story/story-card";
import { StoryCardSkeleton } from "@/components/story/story-card-skeleton";
import { Pagination } from "@/components/ui/pagination";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Story } from "@shared/schema";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export default function RecentPage() {
  const [page, setPage] = useState(1);
  const [tab, setTab] = useState("all");
  const pageSize = 12;

  // Get stories from API
  const { data: stories, isLoading, error } = useQuery<Story[]>({
    queryKey: ["/api/stories"],
  });

  // Process stories based on tab
  const processedStories = stories
    ? stories
        .slice()
        .sort((a, b) => {
          if (!a.created_at || !b.created_at) return 0;
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        })
        .filter((story) => {
          if (tab === "all") return true;
          
          // For "today", "week", and "month" tabs, filter by date
          const now = new Date();
          const storyDate = story.created_at ? new Date(story.created_at) : null;
          if (!storyDate) return false;
          
          if (tab === "today") {
            return storyDate.toDateString() === now.toDateString();
          } else if (tab === "week") {
            const oneWeekAgo = new Date();
            oneWeekAgo.setDate(now.getDate() - 7);
            return storyDate >= oneWeekAgo;
          } else if (tab === "month") {
            const oneMonthAgo = new Date();
            oneMonthAgo.setMonth(now.getMonth() - 1);
            return storyDate >= oneMonthAgo;
          }
          
          return true;
        })
    : [];

  // Group stories by date
  const storyGroups = processedStories.reduce((groups, story) => {
    if (!story.created_at) return groups;
    
    const date = new Date(story.created_at);
    const dateString = format(date, "yyyy-MM-dd");
    
    if (!groups[dateString]) {
      groups[dateString] = [];
    }
    
    groups[dateString].push(story);
    return groups;
  }, {} as Record<string, Story[]>);
  
  // Get sorted dates for display
  const sortedDates = Object.keys(storyGroups).sort((a, b) => {
    return new Date(b).getTime() - new Date(a).getTime();
  });
  
  // Calculate pagination
  const totalPages = Math.ceil(sortedDates.length / pageSize);
  const paginatedDates = sortedDates.slice((page - 1) * pageSize, page * pageSize);
  
  return (
    <Layout>
      <Helmet>
        <title>Recently Added - GocTruyenNho</title>
      </Helmet>
      
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-4xl mx-auto mb-10">
          <h1 className="text-3xl font-bold mb-4">Recently Added</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Browse the latest stories added to our platform.
          </p>
        </div>
        
        <Tabs
          defaultValue="all"
          value={tab}
          onValueChange={(value) => {
            setTab(value);
            setPage(1);
          }}
          className="mb-8"
        >
          <TabsList>
            <TabsTrigger value="all">All Time</TabsTrigger>
            <TabsTrigger value="month">This Month</TabsTrigger>
            <TabsTrigger value="week">This Week</TabsTrigger>
            <TabsTrigger value="today">Today</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="mt-6">
            {renderContent()}
          </TabsContent>
          
          <TabsContent value="month" className="mt-6">
            {renderContent()}
          </TabsContent>
          
          <TabsContent value="week" className="mt-6">
            {renderContent()}
          </TabsContent>
          
          <TabsContent value="today" className="mt-6">
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
            Failed to load stories. Please try again later.
          </AlertDescription>
        </Alert>
      );
    }
    
    if (paginatedDates.length === 0) {
      return (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">
            No stories found for the selected time period.
          </p>
        </div>
      );
    }
    
    return (
      <>
        {paginatedDates.map((dateString) => (
          <div key={dateString} className="mb-10">
            <h2 className="text-xl font-semibold mb-4 border-b pb-2">
              {format(new Date(dateString), "EEEE, MMMM d, yyyy")}
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {storyGroups[dateString].map((story) => (
                <StoryCard key={story.id} story={story} />
              ))}
            </div>
          </div>
        ))}
        
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