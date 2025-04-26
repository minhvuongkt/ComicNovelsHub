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
      // First check the chapter_type field (new field)
      const chapterType = chapter.chapter_type || 'novel';
      
      if (chapterType === 'comic' || chapterType === 'oneshot') {
        // Parse image URLs from the images field or content
        try {
          let images: string[] = [];
          
          if (chapter.images) {
            // If we have the images field, use that
            images = typeof chapter.images === 'string' 
              ? JSON.parse(chapter.images) 
              : Array.isArray(chapter.images) 
                ? chapter.images 
                : [];
          } else {
            // Fallback to parsing content (for backward compatibility)
            const contentType = parseContentType(chapter.content);
            if (contentType === 'image') {
              images = JSON.parse(chapter.content);
            }
          }
          
          // If no images found, display error message
          if (images.length === 0) {
            return (
              <div className="p-8 text-center bg-gray-100 dark:bg-gray-800 rounded-lg my-4">
                <div className="flex flex-col items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                  </svg>
                  <p className="mt-2 text-gray-500 dark:text-gray-400">No images found for this chapter.</p>
                </div>
              </div>
            );
          }
          
          return <ImageContent 
            images={images} 
            title={chapter.title} 
            type={chapterType as 'comic' | 'oneshot'} 
          />;
        } catch (e) {
          console.error("Error parsing image content:", e);
          return (
            <div className="p-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/50 rounded-lg my-4">
              <div className="flex flex-col items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-red-500 dark:text-red-400 mb-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <h3 className="text-lg font-medium text-red-600 dark:text-red-400">Error loading images</h3>
                <p className="text-sm text-red-500 dark:text-red-300 text-center mt-1">
                  There was a problem loading the images for this chapter. Please try again later.
                </p>
              </div>
            </div>
          );
        }
      } else {
        // Novel/Text content
        const fontFamily = chapter.font_family || 'Arial, sans-serif';
        return <TextContent 
          content={chapter.content} 
          title={chapter.title} 
          fontFamily={fontFamily}
        />;
      }
    } catch (error) {
      console.error("Error displaying content:", error);
      return (
        <div className="p-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/50 rounded-lg my-4">
          <div className="flex flex-col items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-red-500 dark:text-red-400 mb-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <h3 className="text-lg font-medium text-red-600 dark:text-red-400">Error displaying content</h3>
            <p className="text-sm text-red-500 dark:text-red-300 text-center mt-1">
              There was a problem loading this chapter. Please report this issue.
            </p>
          </div>
        </div>
      );
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
