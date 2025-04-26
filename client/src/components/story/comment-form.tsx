import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { getInitials, getDefaultAvatarUrl } from "@/lib/utils";

type CommentFormProps = {
  storyId: number;
  chapterId?: number;
  parentId?: number;
  onSuccess?: () => void;
};

export function CommentForm({ storyId, chapterId, parentId, onSuccess }: CommentFormProps) {
  const [content, setContent] = useState("");
  const { user } = useAuth();
  const { toast } = useToast();
  
  const createCommentMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/comments", {
        story_id: storyId,
        chapter_id: chapterId,
        parent_id: parentId,
        content,
      });
    },
    onSuccess: () => {
      setContent("");
      
      // Invalidate the appropriate query to refresh comments
      const endpoint = chapterId 
        ? `/api/chapters/${chapterId}/comments`
        : `/api/stories/${storyId}/comments`;
      
      queryClient.invalidateQueries({ queryKey: [endpoint] });
      
      toast({
        title: "Comment posted",
        description: "Your comment has been posted successfully.",
      });
      
      if (onSuccess) {
        onSuccess();
      }
    },
    onError: (error) => {
      toast({
        title: "Failed to post comment",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    }
  });
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim()) {
      toast({
        title: "Empty comment",
        description: "Please write something before posting.",
        variant: "destructive",
      });
      return;
    }
    
    createCommentMutation.mutate();
  };
  
  if (!user) return null;
  
  return (
    <form onSubmit={handleSubmit} className="flex space-x-3 mb-6">
      <Avatar className="h-10 w-10">
        <AvatarImage 
          src={user.avatar || getDefaultAvatarUrl(`${user.first_name} ${user.last_name}`)} 
          alt={`${user.first_name} ${user.last_name}`} 
        />
        <AvatarFallback>{getInitials(user.first_name, user.last_name)}</AvatarFallback>
      </Avatar>
      
      <div className="flex-grow">
        <Textarea
          rows={2}
          placeholder="Write a comment..."
          className="w-full px-3 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 resize-none"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          disabled={createCommentMutation.isPending}
        />
        
        <div className="flex justify-end mt-2">
          <Button 
            type="submit" 
            disabled={createCommentMutation.isPending}
            className="px-4 py-1.5 bg-primary hover:bg-primary/90 text-white font-medium rounded-lg text-sm"
          >
            {createCommentMutation.isPending ? "Posting..." : "Post Comment"}
          </Button>
        </div>
      </div>
    </form>
  );
}
