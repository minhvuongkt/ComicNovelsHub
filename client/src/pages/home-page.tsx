import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/layout/navbar";
import { MobileNavbar } from "@/components/layout/mobile-navbar";
import { StoryCarousel } from "@/components/home/story-carousel";
import { StoryGrid } from "@/components/home/story-grid";
import { LatestUpdates } from "@/components/home/latest-updates";
import { GenresGrid } from "@/components/home/genres-grid";
import { Story, StorySummary, Genre } from "@/types";
import { Loader2 } from "lucide-react";

export default function HomePage() {
  // Fetch genres
  const { data: genres = [] } = useQuery<Genre[]>({
    queryKey: ["/api/genres"],
  });
  
  // Fetch featured stories for carousel
  const { data: featuredStories = [], isLoading: isFeaturedLoading } = useQuery<Story[]>({
    queryKey: ["/api/stories", { featured: true }],
    queryFn: async () => {
      const res = await fetch("/api/stories?featured=true");
      if (!res.ok) throw new Error("Failed to fetch featured stories");
      return await res.json();
    },
  });
  
  // Fetch recommended stories
  const { data: recommendedStories = [], isLoading: isRecommendedLoading } = useQuery<StorySummary[]>({
    queryKey: ["/api/stories", { recommended: true }],
    queryFn: async () => {
      const res = await fetch("/api/stories?recommended=true");
      if (!res.ok) throw new Error("Failed to fetch recommended stories");
      return await res.json();
    },
  });
  
  // Fetch latest updates
  const { data: latestUpdates = [], isLoading: isUpdatesLoading } = useQuery<StorySummary[]>({
    queryKey: ["/api/stories", { latest: true }],
    queryFn: async () => {
      const res = await fetch("/api/stories?latest=true");
      if (!res.ok) throw new Error("Failed to fetch latest updates");
      return await res.json();
    },
  });
  
  // Mock data for initial render
  const demoFeaturedStories: Story[] = [
    {
      id: 1,
      title: "Demon Slayer",
      description: "Tanjiro sets out to become a demon slayer to avenge his family and cure his sister.",
      created_at: new Date().toISOString(),
      cover_image: "https://images.unsplash.com/photo-1618519764620-7403abdbdfe9?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1200&q=80",
      genres: [
        { id: 1, name: "Action", description: "", created_at: new Date().toISOString() },
        { id: 2, name: "Fantasy", description: "", created_at: new Date().toISOString() }
      ]
    },
  ];

  const demoRecommendedStories: StorySummary[] = [
    {
      id: 1,
      title: "One Piece",
      author_name: "Eiichiro Oda",
      cover_image: "https://images.unsplash.com/photo-1608889825103-eb5ed706fc64?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&q=80",
      latest_chapter: 1052,
      rating: 4.9
    },
    {
      id: 2,
      title: "Solo Leveling",
      author_name: "Chugong",
      cover_image: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&q=80",
      latest_chapter: 179,
      rating: 4.8
    },
    {
      id: 3,
      title: "Jujutsu Kaisen",
      author_name: "Gege Akutami",
      cover_image: "https://images.unsplash.com/photo-1516486392848-8b67ef89f113?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&q=80",
      latest_chapter: 213,
      rating: 4.7
    },
    {
      id: 4,
      title: "Attack on Titan",
      author_name: "Hajime Isayama",
      cover_image: "https://images.unsplash.com/photo-1614583225154-5fcdda07019e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&q=80",
      latest_chapter: 139,
      rating: 4.8,
      completed: true
    },
    {
      id: 5,
      title: "My Hero Academia",
      author_name: "Kohei Horikoshi",
      cover_image: "https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&q=80",
      latest_chapter: 380,
      rating: 4.6
    }
  ];
  
  const demoLatestUpdates: StorySummary[] = [
    {
      id: 6,
      title: "Chainsaw Man",
      author_name: "Tatsuki Fujimoto",
      cover_image: "https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&q=80",
      latest_chapter: 129,
      rating: 4.9
    },
    {
      id: 7,
      title: "Omniscient Reader",
      author_name: "Sing Shong",
      cover_image: "https://images.unsplash.com/photo-1628263202267-223eeb846b78?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&q=80",
      latest_chapter: 143,
      rating: 4.8
    },
    {
      id: 8,
      title: "The Beginning After The End",
      author_name: "TurtleMe",
      cover_image: "https://images.unsplash.com/photo-1629196814786-d086ef013600?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&q=80",
      latest_chapter: 413,
      rating: 4.9
    }
  ];

  const demoGenres: Genre[] = [
    { id: 1, name: "Action", description: "Stories with fighting, battles, and physical challenges.", created_at: new Date().toISOString() },
    { id: 2, name: "Fantasy", description: "Stories with magical elements, mythical creatures, and imaginary worlds.", created_at: new Date().toISOString() },
    { id: 3, name: "Romance", description: "Stories that focus on relationships and emotional attraction between characters.", created_at: new Date().toISOString() },
    { id: 4, name: "Comedy", description: "Humorous and entertaining stories that aim to make readers laugh.", created_at: new Date().toISOString() }
  ];
  
  // Check if loading
  const isLoading = isFeaturedLoading || isRecommendedLoading || isUpdatesLoading;
  
  return (
    <div className="min-h-screen flex flex-col pb-16 md:pb-0">
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 pb-20 md:pb-8 pt-4">
        <div className="space-y-8">
          {isLoading ? (
            <div className="flex justify-center items-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <>
              {/* Carousel for featured stories */}
              <StoryCarousel stories={featuredStories.length > 0 ? featuredStories : demoFeaturedStories} />
              
              {/* Recommended stories */}
              <StoryGrid 
                title="Recommended For You" 
                stories={recommendedStories.length > 0 ? recommendedStories : demoRecommendedStories} 
                viewAllLink="/recommended"
              />
              
              {/* Latest updates */}
              <LatestUpdates 
                updates={latestUpdates.length > 0 ? latestUpdates : demoLatestUpdates} 
                viewAllLink="/recent"
              />
              
              {/* Popular genres */}
              <GenresGrid 
                genres={genres.length > 0 ? genres : demoGenres} 
                viewAllLink="/genres"
              />
            </>
          )}
        </div>
      </main>
      
      <MobileNavbar />
    </div>
  );
}
