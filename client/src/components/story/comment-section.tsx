import { useState } from "react";
import { Comment } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { CommentForm } from "./comment-form";
import { CommentItem } from "./comment-item";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";

type CommentSectionProps = {
  storyId: number;
  chapterId?: number;
};

export function CommentSection({ storyId, chapterId }: CommentSectionProps) {
  const [visibleCount, setVisibleCount] = useState(5);
  const { user } = useAuth();
  
  // Fetch comments based on context (story or chapter)
  const endpoint = chapterId 
    ? `/api/chapters/${chapterId}/comments` 
    : `/api/stories/${storyId}/comments`;
  
  const { data: comments = [], isLoading, isError } = useQuery<Comment[]>({
    queryKey: [endpoint],
  });
  
  // Process comments to create a hierarchical structure
  const processedComments = comments.reduce((acc: Comment[], comment: Comment) => {
    if (!comment.parent_id) {
      // This is a top-level comment
      const replies = comments.filter(c => c.parent_id === comment.id);
      return [...acc, { ...comment, replies }];
    }
    return acc;
  }, []);
  
  const displayedComments = processedComments.slice(0, visibleCount);
  const hasMoreComments = visibleCount < processedComments.length;
  
  const handleLoadMore = () => {
    setVisibleCount(prev => prev + 5);
  };
  
  return (
    <div className="border-t border-gray-200 dark:border-gray-700">
      <div className="p-4 sm:p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          Comments ({comments.length})
        </h2>
        
        {/* Comment form */}
        {user ? (
          <CommentForm storyId={storyId} chapterId={chapterId} />
        ) : (
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 text-center mb-6">
            <p className="text-gray-600 dark:text-gray-300">
              Please <a href="/auth" className="text-primary hover:underline">sign in</a> to leave a comment.
            </p>
          </div>
        )}
        
        {/* Comments list */}
        {isLoading ? (
          <div className="py-8 text-center text-gray-500 dark:text-gray-400">
            Loading comments...
          </div>
        ) : isError ? (
          <div className="py-8 text-center text-red-500">
            Failed to load comments. Please try again later.
          </div>
        ) : processedComments.length === 0 ? (
          <div className="py-8 text-center text-gray-500 dark:text-gray-400">
            No comments yet. Be the first to comment!
          </div>
        ) : (
          <div className="space-y-6">
            {displayedComments.map(comment => (
              <CommentItem 
                key={comment.id} 
                comment={comment} 
                storyId={storyId} 
                chapterId={chapterId} 
              />
            ))}
          </div>
        )}
        
        {hasMoreComments && (
          <div className="flex justify-center mt-6">
            <Button
              variant="outline"
              onClick={handleLoadMore}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white rounded-lg font-medium flex items-center"
            >
              Show More Comments <ChevronDown className="ml-1 h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
