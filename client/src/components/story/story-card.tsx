import { Link } from "wouter";
import { Story } from "@shared/schema";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Heart, Star, Clock } from "lucide-react";
import { format } from "date-fns";

interface StoryCardProps {
  story: Story;
  showDetails?: boolean;
}

export function StoryCard({ story, showDetails = true }: StoryCardProps) {
  const formattedDate = story.created_at 
    ? format(new Date(story.created_at), 'MMM d, yyyy')
    : 'Unknown date';
    
  return (
    <Link href={`/stories/${story.id}`}>
      <Card className="h-full overflow-hidden hover:shadow-md transition-shadow cursor-pointer">
        <div className="relative pt-[140%]">
          <img
            src={story.cover_image || '/placeholder-cover.jpg'}
            alt={story.title}
            className="absolute inset-0 w-full h-full object-cover"
          />
        </div>
        
        <CardContent className="p-4">
          <h3 className="font-semibold text-base line-clamp-2 mb-2">{story.title}</h3>
          
          {showDetails && (
            <>
              {story.alternative_title && (
                <p className="text-sm text-muted-foreground line-clamp-1 mb-2">
                  {story.alternative_title}
                </p>
              )}
              
              <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                {story.description || "No description available"}
              </p>
              
              <div className="flex flex-wrap gap-1 mb-3">
                {story.genres && story.genres.slice(0, 3).map(genre => (
                  <Badge key={genre.id} variant="secondary" className="text-xs">
                    {genre.name}
                  </Badge>
                ))}
              </div>
              
              <div className="flex items-center text-xs text-muted-foreground">
                <Clock className="h-3 w-3 mr-1" />
                <span>{formattedDate}</span>
              </div>
            </>
          )}
        </CardContent>
        
        {showDetails && (
          <CardFooter className="p-4 pt-0 flex justify-between">
            <div className="flex items-center text-xs">
              <BookOpen className="h-3 w-3 mr-1" />
              <span>{story.chapters?.length || 0} chapters</span>
            </div>
            
            <div className="flex gap-3">
              <div className="flex items-center text-xs">
                <Heart className="h-3 w-3 mr-1 text-red-500" />
                <span>{story.favorites_count || 0}</span>
              </div>
              
              <div className="flex items-center text-xs">
                <Star className="h-3 w-3 mr-1 text-yellow-500" />
                <span>{story.rating || 0}</span>
              </div>
            </div>
          </CardFooter>
        )}
      </Card>
    </Link>
  );
}