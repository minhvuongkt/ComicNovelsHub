import { Link } from "wouter";
import { StorySummary } from "@/types";
import { Star } from "lucide-react";

type StoryCardProps = {
  story: StorySummary;
};

export function StoryCard({ story }: StoryCardProps) {
  return (
    <div className="rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow">
      <Link href={`/stories/${story.id}`}>
        <div className="relative pb-[140%]">
          <img 
            src={story.cover_image || "https://placehold.co/400x560/gray/white?text=No+Cover"} 
            alt={story.title} 
            className="absolute inset-0 w-full h-full object-cover"
          />
          {story.latest_chapter && (
            <div className="absolute top-0 left-0 m-2 px-1.5 py-0.5 text-xs bg-primary text-white rounded">
              {story.completed ? "COMPLETED" : `CH. ${story.latest_chapter}`}
            </div>
          )}
        </div>
      </Link>
      <div className="p-2">
        <h3 className="text-sm font-semibold line-clamp-1 text-gray-900 dark:text-white">
          {story.title}
        </h3>
        <div className="flex items-center justify-between mt-1">
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {story.author_name || "Unknown Author"}
          </span>
          {story.rating && (
            <div className="flex items-center">
              <Star className="text-yellow-500 h-3 w-3 fill-current" />
              <span className="text-xs ml-1">{story.rating.toFixed(1)}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
