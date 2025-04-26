import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { AdminLayout } from "@/components/admin/layout";
import { DataTable } from "@/components/admin/data-table";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Comment } from "@/types";
import { formatDate, formatRelativeTime, truncateText } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  MoreHorizontal,
  Trash2,
  Eye,
  Flag,
  Loader2,
  MoveRight,
} from "lucide-react";

export default function AdminComments() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState<string>("all");
  const [selectedComment, setSelectedComment] = useState<Comment | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const { toast } = useToast();
  
  // Fetch comments
  const { 
    data: comments = [], 
    isLoading,
    refetch
  } = useQuery<Comment[]>({
    queryKey: ["/api/admin/comments", { page, filter }],
    queryFn: async () => {
      const queryParams = new URLSearchParams();
      queryParams.append("page", page.toString());
      queryParams.append("limit", "20");
      if (filter !== "all") queryParams.append("filter", filter);
      
      const res = await fetch(`/api/admin/comments?${queryParams.toString()}`);
      
      if (!res.ok) {
        throw new Error("Failed to fetch comments");
      }
      
      return res.json();
    },
  });
  
  // Delete comment mutation
  const deleteCommentMutation = useMutation({
    mutationFn: async (commentId: number) => {
      await apiRequest("DELETE", `/api/comments/${commentId}`);
    },
    onSuccess: () => {
      toast({
        title: "Comment deleted",
        description: "Comment has been successfully deleted.",
      });
      
      queryClient.invalidateQueries({ queryKey: ["/api/admin/comments"] });
      setDeleteDialogOpen(false);
      setSelectedComment(null);
    },
    onError: (error) => {
      toast({
        title: "Failed to delete comment",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    }
  });
  
  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    refetch();
  };
  
  // Open delete dialog
  const handleOpenDeleteDialog = (comment: Comment) => {
    setSelectedComment(comment);
    setDeleteDialogOpen(true);
  };
  
  // Filter comments by search term (client-side)
  const filteredComments = search 
    ? comments.filter(comment => 
        comment.content.toLowerCase().includes(search.toLowerCase()) ||
        (comment.user?.first_name.toLowerCase().includes(search.toLowerCase())) ||
        (comment.user?.last_name.toLowerCase().includes(search.toLowerCase()))
      )
    : comments;
  
  // Table columns
  const columns = [
    {
      header: "User",
      accessorKey: "user",
      cell: ({ row }: { row: any }) => {
        const user = row.original.user;
        if (!user) return "Anonymous";
        
        return (
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user.avatar} alt={`${user.first_name} ${user.last_name}`} />
              <AvatarFallback>{`${user.first_name.charAt(0)}${user.last_name.charAt(0)}`}</AvatarFallback>
            </Avatar>
            <span>{`${user.first_name} ${user.last_name}`}</span>
          </div>
        );
      },
    },
    {
      header: "Content",
      accessorKey: "content",
      cell: ({ row }: { row: any }) => {
        const content = row.original.content;
        return truncateText(content, 100);
      },
    },
    {
      header: "Story/Chapter",
      accessorKey: "target",
      cell: ({ row }: { row: any }) => {
        const comment = row.original;
        
        return (
          <div className="flex items-center">
            <span>{`Story #${comment.story_id}`}</span>
            {comment.chapter_id && (
              <div className="flex items-center">
                <MoveRight className="h-3 w-3 mx-1" />
                <span>{`Chapter #${comment.chapter_id}`}</span>
              </div>
            )}
          </div>
        );
      },
    },
    {
      header: "Date",
      accessorKey: "created_at",
      cell: ({ row }: { row: any }) => {
        return (
          <div className="flex flex-col">
            <span className="text-xs">{formatDate(row.original.created_at)}</span>
            <span className="text-xs text-muted-foreground">{formatRelativeTime(row.original.created_at)}</span>
          </div>
        );
      },
    },
    {
      header: "Actions",
      accessorKey: "actions",
      cell: ({ row }: { row: any }) => {
        const comment = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer">
                <Eye className="mr-2 h-4 w-4" />
                <span>View in Context</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer">
                <Flag className="mr-2 h-4 w-4" />
                <span>Mark as Reviewed</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="cursor-pointer text-destructive focus:text-destructive"
                onClick={() => handleOpenDeleteDialog(comment)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                <span>Delete Comment</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];
  
  return (
    <AdminLayout>
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold">Comments</h1>
            <p className="text-muted-foreground">Manage user comments across your platform</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <Select
              value={filter}
              onValueChange={setFilter}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Comments</SelectItem>
                <SelectItem value="reported">Reported Comments</SelectItem>
                <SelectItem value="recent">Recent Comments</SelectItem>
              </SelectContent>
            </Select>
            
            <form onSubmit={handleSearch} className="flex w-full">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search comments..."
                  className="pl-8 w-full"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <Button type="submit" className="ml-2">Search</Button>
            </form>
          </div>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <DataTable 
            columns={columns} 
            data={filteredComments} 
            currentPage={page}
            onPageChange={setPage}
            totalPages={Math.ceil(filteredComments.length / 20) || 1}
          />
        )}
      </div>
      
      {/* Delete confirmation dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the comment{" "}
              and remove it from our servers.
              <div className="mt-4 p-3 bg-muted rounded-md">
                <p className="italic">{selectedComment?.content}</p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (selectedComment) {
                  deleteCommentMutation.mutate(selectedComment.id);
                }
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteCommentMutation.isPending}
            >
              {deleteCommentMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Comment"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
