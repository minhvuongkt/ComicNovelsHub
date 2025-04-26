import { useState } from "react";
import { Link } from "wouter";
import { Chapter } from "@/types";
import { cn, formatRelativeTime } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";

type ChapterListProps = {
  storyId: number;
  chapters: Chapter[];
};

export function ChapterList({ storyId, chapters }: ChapterListProps) {
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");
  const [visibleCount, setVisibleCount] = useState(10);
  
  // Sort chapters based on selected order
  const sortedChapters = [...chapters].sort((a, b) => {
    if (sortOrder === "newest") {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    } else {
      return a.chapter_number - b.chapter_number;
    }
  });

  const displayedChapters = sortedChapters.slice(0, visibleCount);
  const hasMoreChapters = visibleCount < chapters.length;

  const handleLoadMore = () => {
    setVisibleCount(prev => prev + 10);
  };

  return (
    <div className="border-t border-gray-200 dark:border-gray-700">
      <div className="p-4 sm:p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Chapters</h2>
          <div className="flex items-center">
            <label className="mr-2 text-sm text-gray-700 dark:text-gray-300">Sort:</label>
            <Select
              value={sortOrder}
              onValueChange={(value) => setSortOrder(value as "newest" | "oldest")}
            >
              <SelectTrigger className="text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md px-2 py-1 w-36">
                <SelectValue placeholder="Sort order" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {chapters.length === 0 ? (
          <div className="py-8 text-center text-gray-500 dark:text-gray-400">
            No chapters available yet.
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {displayedChapters.map((chapter) => (
              <Link
                key={chapter.id}
                href={`/reading/${storyId}/${chapter.id}`}
                className="block py-3 px-2 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <span className="font-medium text-gray-900 dark:text-white">
                      Chapter {chapter.chapter_number}:
                    </span>
                    <span className="text-gray-700 dark:text-gray-300 ml-2">{chapter.title}</span>
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {formatRelativeTime(chapter.created_at)}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
        
        {hasMoreChapters && (
          <div className="flex justify-center mt-4">
            <Button
              variant="outline"
              onClick={handleLoadMore}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white rounded-lg font-medium flex items-center"
            >
              Load More <ChevronDown className="ml-1 h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
