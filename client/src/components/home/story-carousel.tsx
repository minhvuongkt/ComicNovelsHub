import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Story } from "@/types";
import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";
import { cn } from "@/lib/utils";

type StoryCarouselProps = {
  stories: Story[];
};

export function StoryCarousel({ stories }: StoryCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [autoplay, setAutoplay] = useState(true);
  
  // Autoplay functionality
  useEffect(() => {
    if (!autoplay || stories.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % stories.length);
    }, 5000);
    
    return () => clearInterval(interval);
  }, [autoplay, stories.length]);
  
  // Pause autoplay on hover
  const handleMouseEnter = () => setAutoplay(false);
  const handleMouseLeave = () => setAutoplay(true);
  
  // Skip to a specific slide
  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    setAutoplay(false);
    setTimeout(() => setAutoplay(true), 5000);
  };
  
  if (!stories || stories.length === 0) {
    return (
      <div className="relative overflow-hidden rounded-lg h-64 sm:h-80 bg-gray-200 dark:bg-gray-800 animate-pulse">
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-gray-400 dark:text-gray-500">No stories available</span>
        </div>
      </div>
    );
  }
  
  const currentStory = stories[currentIndex];
  
  return (
    <div 
      className="relative overflow-hidden rounded-lg h-64 sm:h-80"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="absolute inset-0 flex transition-opacity duration-500">
        <div className="relative w-full flex-shrink-0">
          <img 
            src={currentStory.cover_image || 'https://placehold.co/1200x600/gray/white?text=No+Cover'} 
            alt={currentStory.title} 
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent"></div>
          <div className="absolute bottom-0 left-0 p-4 sm:p-6 w-full">
            <h2 className="text-white text-xl sm:text-2xl font-bold mb-1">{currentStory.title}</h2>
            <p className="text-gray-300 text-sm sm:text-base line-clamp-2 mb-2">
              {currentStory.description || 'No description available'}
            </p>
            {currentStory.genres && (
              <div className="flex items-center space-x-2 text-xs sm:text-sm">
                {currentStory.genres.slice(0, 2).map((genre) => (
                  <span key={genre.id} className="bg-primary text-white px-2 py-1 rounded">
                    {genre.name}
                  </span>
                ))}
              </div>
            )}
            <Link href={`/stories/${currentStory.id}`}>
              <Button className="mt-3 bg-white text-gray-900 hover:bg-gray-100 flex items-center">
                <Play className="h-4 w-4 mr-1" /> Read Now
              </Button>
            </Link>
          </div>
        </div>
      </div>
      
      {/* Carousel indicators */}
      {stories.length > 1 && (
        <div className="absolute bottom-4 right-4 flex space-x-2">
          {stories.map((_, index) => (
            <button
              key={index}
              className={cn(
                "h-2 rounded-full",
                index === currentIndex
                  ? "w-6 bg-white opacity-90" 
                  : "w-2 bg-white/50"
              )}
              onClick={() => goToSlide(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
