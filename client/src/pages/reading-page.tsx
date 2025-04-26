import { useState, useEffect } from "react";
import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { ReadingHeader } from "@/components/reading/reading-header";
import { ReadingNavigation } from "@/components/reading/reading-navigation";
import { ImageContent } from "@/components/reading/image-content";
import { TextContent } from "@/components/reading/text-content";
import { CommentSection } from "@/components/story/comment-section";
import { Flag, Loader2 } from "lucide-react";
import { Story, Chapter } from "@/types";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import { parseContentType } from "@/lib/utils";
import { Link } from "wouter";

export default function ReadingPage() {
  const { storyId, chapterId } = useParams<{ storyId: string, chapterId: string }>();
  const [isChapterListOpen, setIsChapterListOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  
  // Parse IDs
  const storyIdNum = parseInt(storyId);
  const chapterIdNum = parseInt(chapterId);
  
  // Fetch story details
  const { 
    data: story, 
    isLoading: isStoryLoading, 
    isError: isStoryError 
  } = useQuery<Story>({
    queryKey: [`/api/stories/${storyIdNum}`],
  });
  
  // Fetch chapter details
  const { 
    data: chapter, 
    isLoading: isChapterLoading, 
    isError: isChapterError 
  } = useQuery<Chapter>({
    queryKey: [`/api/chapters/${chapterIdNum}`],
  });
  
  // Handle chapter change
  const handleChapterChange = (newChapterId: number) => {
    window.location.href = `/reading/${storyIdNum}/${newChapterId}`;
  };
  
  // Process chapter content based on its type
  const renderContent = () => {
    if (!chapter) return null;
    
    try {
      const contentType = parseContentType(chapter.content);
      
      if (contentType === 'image') {
        // Parse image URLs
        try {
          const images = JSON.parse(chapter.content);
          return <ImageContent images={images} title={chapter.title} />;
        } catch (e) {
          return <div className="p-8 text-center text-red-500">Error parsing image content.</div>;
        }
      } else {
        // Text content (novel)
        return <TextContent content={chapter.content} title={chapter.title} />;
      }
    } catch (error) {
      return <div className="p-8 text-center text-red-500">Error displaying content. Please report this issue.</div>;
    }
  };
  
  // Scroll to top when chapter changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [chapterIdNum]);
  
  const isLoading = isStoryLoading || isChapterLoading;
  const isError = isStoryError || isChapterError;
  
  return (
    <div className="bg-white dark:bg-gray-900 min-h-screen">
      {isError ? (
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Something went wrong</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6 text-center">
            We couldn't load the content you requested. Please try again later.
          </p>
          <div className="flex space-x-4">
            <Link href={`/stories/${storyIdNum}`}>
              <Button variant="outline">Back to Story</Button>
            </Link>
            <Link href="/">
              <Button>Go Home</Button>
            </Link>
          </div>
        </div>
      ) : isLoading ? (
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : story && chapter ? (
        <>
          <ReadingHeader 
            story={story} 
            chapter={chapter} 
            onOpenChapterList={() => setDrawerOpen(true)} 
          />
          
          {/* Reading content */}
          <div className="reading-container py-6">
            {renderContent()}
            
            {/* Chapter navigation */}
            <ReadingNavigation 
              storyId={storyIdNum} 
              chapters={story.chapters || []} 
              currentChapterId={chapterIdNum}
              onChapterChange={handleChapterChange}
            />
            
            {/* Report issue button */}
            <div className="mt-6 text-center">
              <Link href={`/report?type=chapter&id=${chapterIdNum}`}>
                <Button variant="ghost" className="inline-flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary-400">
                  <Flag className="h-4 w-4 mr-1" /> Report an issue
                </Button>
              </Link>
            </div>
            
            {/* Comments section */}
            <CommentSection storyId={storyIdNum} chapterId={chapterIdNum} />
          </div>
          
          {/* Chapter list drawer */}
          <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
            <DrawerContent className="max-h-[90vh] overflow-y-auto">
              <div className="p-4 max-w-md mx-auto">
                <h3 className="font-semibold text-lg mb-4">Chapters</h3>
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {story.chapters && story.chapters.map((chapterItem) => (
                    <Link 
                      key={chapterItem.id} 
                      href={`/reading/${storyIdNum}/${chapterItem.id}`}
                      onClick={() => setDrawerOpen(false)}
                    >
                      <div 
                        className={`py-3 px-2 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded cursor-pointer ${
                          chapterItem.id === chapterIdNum ? 'bg-gray-50 dark:bg-gray-700/50' : ''
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <span className="font-medium text-gray-900 dark:text-white">
                              Chapter {chapterItem.chapter_number}:
                            </span>
                            <span className="text-gray-700 dark:text-gray-300 ml-2">
                              {chapterItem.title}
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </DrawerContent>
          </Drawer>
        </>
      ) : null}
    </div>
  );
}
