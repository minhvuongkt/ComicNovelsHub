import { useState } from "react";
import { Comment } from "@/types";
import { useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Trash2, ThumbsUp, Reply, MoreHorizontal } from "lucide-react";
import { formatRelativeTime, getInitials, getDefaultAvatarUrl } from "@/lib/utils";
import { CommentForm } from "./comment-form";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type CommentItemProps = {
  comment: Comment;
  storyId: number;
  chapterId?: number;
};

export function CommentItem({ comment, storyId, chapterId }: CommentItemProps) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [likes, setLikes] = useState(Math.floor(Math.random() * 30)); // For demo. In production, you'd fetch the actual count
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Delete comment mutation
  const deleteCommentMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", `/api/comments/${comment.id}`);
    },
    onSuccess: () => {
      // Invalidate the appropriate query to refresh comments
      const endpoint = chapterId 
        ? `/api/chapters/${chapterId}/comments`
        : `/api/stories/${storyId}/comments`;
      
      queryClient.invalidateQueries({ queryKey: [endpoint] });
      
      toast({
        title: "Comment deleted",
        description: "Your comment has been deleted successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to delete comment",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    }
  });
  
  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this comment?")) {
      deleteCommentMutation.mutate();
    }
  };
  
  // Report comment mutation
  const reportCommentMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/reports", {
        target_type: "comment",
        target_id: comment.id,
        reason: "Reported by user",
      });
    },
    onSuccess: () => {
      toast({
        title: "Comment reported",
        description: "Thank you for reporting this comment. Our team will review it shortly.",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to report comment",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    }
  });
  
  const handleReport = () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to report comments.",
        variant: "destructive",
      });
      return;
    }
    
    reportCommentMutation.mutate();
  };
  
  const canDelete = user && (user.id === comment.user_id || user.role === "admin");
  
  return (
    <div className="flex space-x-3">
      <Avatar className="h-10 w-10">
        <AvatarImage 
          src={comment.user?.avatar || getDefaultAvatarUrl(comment.user?.first_name || 'User')} 
          alt={comment.user ? `${comment.user.first_name} ${comment.user.last_name}` : 'User'} 
        />
        <AvatarFallback>
          {comment.user 
            ? getInitials(comment.user.first_name, comment.user.last_name) 
            : 'U'}
        </AvatarFallback>
      </Avatar>
      
      <div className="flex-grow">
        <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
          <div className="flex justify-between items-start">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white">
                {comment.user 
                  ? `${comment.user.first_name} ${comment.user.last_name}`
                  : 'Anonymous User'}
              </h4>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {formatRelativeTime(comment.created_at)}
              </p>
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {canDelete && (
                  <DropdownMenuItem 
                    onClick={handleDelete}
                    disabled={deleteCommentMutation.isPending}
                    className="text-red-500 focus:text-red-500"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    <span>Delete</span>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={handleReport} disabled={reportCommentMutation.isPending}>
                  <span>Report</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          <p className="mt-2 text-gray-700 dark:text-gray-300">
            {comment.content}
          </p>
          
          <div className="flex items-center space-x-4 mt-2">
            <Button 
              variant="ghost" 
              size="sm" 
              className="flex items-center text-sm text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-primary-400 px-1"
              onClick={() => setLikes(prev => prev + 1)}
            >
              <ThumbsUp className="h-4 w-4 mr-1" /> {likes}
            </Button>
            
            {user && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="flex items-center text-sm text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-primary-400 px-1"
                onClick={() => setShowReplyForm(!showReplyForm)}
              >
                <Reply className="h-4 w-4 mr-1" /> Reply
              </Button>
            )}
          </div>
        </div>
        
        {/* Reply form */}
        {showReplyForm && (
          <div className="mt-3 ml-6">
            <CommentForm 
              storyId={storyId} 
              chapterId={chapterId} 
              parentId={comment.id}
              onSuccess={() => setShowReplyForm(false)}
            />
          </div>
        )}
        
        {/* Nested replies */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-3 ml-6 space-y-3">
            {comment.replies.map(reply => (
              <div key={reply.id} className="flex space-x-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage 
                    src={reply.user?.avatar || getDefaultAvatarUrl(reply.user?.first_name || 'User')} 
                    alt={reply.user ? `${reply.user.first_name} ${reply.user.last_name}` : 'User'} 
                  />
                  <AvatarFallback>
                    {reply.user 
                      ? getInitials(reply.user.first_name, reply.user.last_name) 
                      : 'U'}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-grow">
                  <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          {reply.user 
                            ? `${reply.user.first_name} ${reply.user.last_name}`
                            : 'Anonymous User'}
                        </h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {formatRelativeTime(reply.created_at)}
                        </p>
                      </div>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {user && (user.id === reply.user_id || user.role === "admin") && (
                            <DropdownMenuItem 
                              onClick={() => {
                                if (window.confirm("Are you sure you want to delete this reply?")) {
                                  apiRequest("DELETE", `/api/comments/${reply.id}`).then(() => {
                                    const endpoint = chapterId 
                                      ? `/api/chapters/${chapterId}/comments`
                                      : `/api/stories/${storyId}/comments`;
                                    
                                    queryClient.invalidateQueries({ queryKey: [endpoint] });
                                    
                                    toast({
                                      title: "Reply deleted",
                                      description: "Your reply has been deleted successfully.",
                                    });
                                  }).catch(error => {
                                    toast({
                                      title: "Failed to delete reply",
                                      description: error instanceof Error ? error.message : "An unknown error occurred",
                                      variant: "destructive",
                                    });
                                  });
                                }
                              }}
                              className="text-red-500 focus:text-red-500"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              <span>Delete</span>
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem onClick={() => {
                            if (!user) {
                              toast({
                                title: "Authentication required",
                                description: "Please sign in to report comments.",
                                variant: "destructive",
                              });
                              return;
                            }
                            
                            apiRequest("POST", "/api/reports", {
                              target_type: "comment",
                              target_id: reply.id,
                              reason: "Reported by user",
                            }).then(() => {
                              toast({
                                title: "Reply reported",
                                description: "Thank you for reporting this reply. Our team will review it shortly.",
                              });
                            }).catch(error => {
                              toast({
                                title: "Failed to report reply",
                                description: error instanceof Error ? error.message : "An unknown error occurred",
                                variant: "destructive",
                              });
                            });
                          }}>
                            <span>Report</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    
                    <p className="mt-2 text-gray-700 dark:text-gray-300">
                      {reply.content}
                    </p>
                    
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="flex items-center text-sm text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-primary-400 px-1 mt-2"
                      onClick={() => {
                        // For demo purposes only
                        const likeBtn = document.querySelector(`[data-reply-id="${reply.id}"]`);
                        if (likeBtn) {
                          const count = parseInt(likeBtn.textContent?.trim() || "0");
                          likeBtn.textContent = `${count + 1}`;
                        }
                      }}
                    >
                      <ThumbsUp className="h-4 w-4 mr-1" /> 
                      <span data-reply-id={reply.id}>{Math.floor(Math.random() * 10)}</span>
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
