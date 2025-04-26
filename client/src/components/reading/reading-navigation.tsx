import { Link } from "wouter";
import { Chapter } from "@/types";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type ReadingNavigationProps = {
  storyId: number;
  chapters: Chapter[];
  currentChapterId: number;
  onChapterChange: (chapterId: number) => void;
};

export function ReadingNavigation({ 
  storyId, 
  chapters, 
  currentChapterId, 
  onChapterChange 
}: ReadingNavigationProps) {
  // Find current chapter index
  const currentIndex = chapters.findIndex(chapter => chapter.id === currentChapterId);
  const currentChapter = chapters[currentIndex];
  
  // Determine previous and next chapters
  const prevChapter = currentIndex > 0 ? chapters[currentIndex - 1] : null;
  const nextChapter = currentIndex < chapters.length - 1 ? chapters[currentIndex + 1] : null;
  
  const handleChapterSelect = (value: string) => {
    const chapterId = parseInt(value);
    onChapterChange(chapterId);
  };
  
  return (
    <div className="flex justify-between items-center mt-8 border-t border-gray-200 dark:border-gray-700 pt-4">
      {prevChapter ? (
        <Link href={`/reading/${storyId}/${prevChapter.id}`}>
          <Button 
            variant="outline" 
            className="flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-lg"
          >
            <ChevronLeft className="mr-1 h-4 w-4" />
            Previous
          </Button>
        </Link>
      ) : (
        <Button 
          variant="outline" 
          disabled
          className="flex items-center px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg opacity-50 cursor-not-allowed"
        >
          <ChevronLeft className="mr-1 h-4 w-4" />
          Previous
        </Button>
      )}
      
      <Select 
        value={currentChapterId.toString()} 
        onValueChange={handleChapterSelect}
      >
        <SelectTrigger className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary w-56">
          <SelectValue placeholder="Select chapter" />
        </SelectTrigger>
        <SelectContent>
          {chapters.map(chapter => (
            <SelectItem key={chapter.id} value={chapter.id.toString()}>
              Chapter {chapter.chapter_number}: {chapter.title.length > 30 ? `${chapter.title.substring(0, 30)}...` : chapter.title}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      {nextChapter ? (
        <Link href={`/reading/${storyId}/${nextChapter.id}`}>
          <Button 
            variant="outline" 
            className="flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-lg"
          >
            Next
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </Link>
      ) : (
        <Button 
          variant="outline" 
          disabled
          className="flex items-center px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg opacity-50 cursor-not-allowed"
        >
          Next
          <ChevronRight className="ml-1 h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
