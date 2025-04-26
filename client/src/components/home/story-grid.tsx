import { StorySummary } from "@/types";
import { Link } from "wouter";
import { StoryCard } from "@/components/story/story-card";
import { ArrowRight } from "lucide-react";

type StoryGridProps = {
  title: string;
  stories: StorySummary[];
  viewAllLink?: string;
};

export function StoryGrid({ title, stories, viewAllLink }: StoryGridProps) {
  if (!stories || stories.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h2>
          {viewAllLink && (
            <Link href={viewAllLink} className="text-primary dark:text-primary-400 text-sm font-medium flex items-center">
              View All <ArrowRight className="h-4 w-4 ml-1" />
            </Link>
          )}
        </div>
        <div className="h-40 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg">
          <p className="text-gray-500 dark:text-gray-400">No stories to display</p>
        </div>
      </div>
    );
  }
  
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h2>
        {viewAllLink && (
          <Link href={viewAllLink} className="text-primary dark:text-primary-400 text-sm font-medium flex items-center">
            View All <ArrowRight className="h-4 w-4 ml-1" />
          </Link>
        )}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {stories.map((story) => (
          <StoryCard key={story.id} story={story} />
        ))}
      </div>
    </div>
  );
}
