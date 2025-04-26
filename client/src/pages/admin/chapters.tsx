import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { formatDate } from "@/lib/utils";
import { Chapter, Story } from "@/types";
import { InsertChapter } from "@shared/schema";
import { DataForm } from "@/components/admin/data-form";
import { DataTable } from "@/components/admin/data-table";
import { AdminLayout } from "@/components/admin/layout";
import { ChapterTypeSelector } from "@/components/admin/chapter-type-selector";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  ArrowLeft,
  Plus,
  Loader2
} from "lucide-react";

export default function AdminChapters() {
  const params = useParams<{ storyId: string }>();
  const storyId = params.storyId ? parseInt(params.storyId) : undefined;
  
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"create" | "edit">("create");
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const { toast } = useToast();
  
  // Fetch story details
  const { 
    data: story,
    isLoading: isStoryLoading
  } = useQuery<Story>({
    queryKey: ["/api/stories", storyId],
    queryFn: async () => {
      if (!storyId) return null;
      const res = await fetch(`/api/stories/${storyId}`);
      return res.json();
    },
    enabled: !!storyId
  });
  
  // Fetch chapters
  const { 
    data: chapters = [], 
    isLoading,
    refetch
  } = useQuery<Chapter[]>({
    queryKey: ["/api/stories", storyId, "chapters", { page, search }],
    queryFn: async () => {
      if (!storyId) return [];
      const queryParams = new URLSearchParams();
      queryParams.append("page", page.toString());
      if (search) queryParams.append("search", search);
      
      const res = await fetch(`/api/stories/${storyId}/chapters?${queryParams}`);
      return res.json();
    },
    enabled: !!storyId
  });
  
  // Create chapter mutation
  const createChapterMutation = useMutation({
    mutationFn: async (chapterData: InsertChapter) => {
      const res = await apiRequest("POST", "/api/chapters", chapterData);
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw new Error(errorData?.message || "Failed to create chapter");
      }
      
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Chapter created",
        description: "Chapter has been successfully created.",
      });
      
      queryClient.invalidateQueries({ queryKey: ["/api/stories", storyId, "chapters"] });
      setDialogOpen(false);
    },
    onError: (error) => {
      console.error("Create chapter error:", error);
      toast({
        title: "Failed to create chapter",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    }
  });
  
  // Update chapter mutation
  const updateChapterMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<InsertChapter> }) => {
      const res = await apiRequest("PATCH", `/api/chapters/${id}`, data);
      
      if (!res.ok) {
        try {
          const errorData = await res.json();
          throw new Error(errorData.message || "Failed to update chapter");
        } catch (e) {
          throw new Error(`Failed to update chapter: ${res.status} ${res.statusText}`);
        }
      }
      
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Chapter updated",
        description: "Chapter has been successfully updated.",
      });
      
      queryClient.invalidateQueries({ queryKey: ["/api/stories", storyId, "chapters"] });
      setDialogOpen(false);
      setSelectedChapter(null);
    },
    onError: (error) => {
      console.error("Update chapter error:", error);
      toast({
        title: "Failed to update chapter",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    }
  });
  
  // Delete chapter mutation
  const deleteChapterMutation = useMutation({
    mutationFn: async (chapterId: number) => {
      const res = await apiRequest("DELETE", `/api/chapters/${chapterId}`);
      
      if (!res.ok) {
        throw new Error(`Failed to delete chapter: ${res.status} ${res.statusText}`);
      }
    },
    onSuccess: () => {
      toast({
        title: "Chapter deleted",
        description: "Chapter has been successfully deleted.",
      });
      
      queryClient.invalidateQueries({ queryKey: ["/api/stories", storyId, "chapters"] });
      setDeleteDialogOpen(false);
      setSelectedChapter(null);
    },
    onError: (error) => {
      toast({
        title: "Failed to delete chapter",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    }
  });
  
  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    refetch();
  };
  
  // Open create dialog
  const handleOpenCreateDialog = () => {
    setDialogMode("create");
    setSelectedChapter(null);
    setDialogOpen(true);
  };
  
  // Open edit dialog
  const handleOpenEditDialog = (chapter: Chapter) => {
    setDialogMode("edit");
    setSelectedChapter(chapter);
    setDialogOpen(true);
  };
  
  // Open delete dialog
  const handleOpenDeleteDialog = (chapter: Chapter) => {
    setSelectedChapter(chapter);
    setDeleteDialogOpen(true);
  };
  
  // Prepare chapter form fields
  const formFields = [
    { 
      name: "story_id", 
      label: "Story ID", 
      type: "hidden", 
      value: storyId,
    },
    { 
      name: "title", 
      label: "Title", 
      type: "text", 
      required: true 
    },
    { 
      name: "chapter_number", 
      label: "Chapter Number", 
      type: "number", 
      required: true 
    },
    { 
      name: "content", 
      label: "Content", 
      type: "textarea", 
      required: true,
      rows: 10
    }
  ];
  
  // Table columns
  const columns = [
    {
      header: "Chapter",
      accessorKey: "chapter",
      cell: ({ row }: { row: any }) => {
        const chapter = row.original;
        return (
          <div>
            <p className="font-medium">Chapter {chapter.chapter_number}: {chapter.title}</p>
            <p className="text-xs text-muted-foreground truncate max-w-md">
              {chapter.content?.substring(0, 100)}...
            </p>
          </div>
        );
      },
    },
    {
      header: "Added",
      accessorKey: "created_at",
      cell: ({ row }: { row: any }) => {
        return formatDate(row.original.created_at);
      },
    },
    {
      header: "Actions",
      accessorKey: "actions",
      cell: ({ row }: { row: any }) => {
        const chapter = row.original;
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
              <DropdownMenuItem 
                className="cursor-pointer"
                onClick={() => handleOpenEditDialog(chapter)}
              >
                <Edit className="mr-2 h-4 w-4" />
                <span>Edit Chapter</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="cursor-pointer text-destructive focus:text-destructive"
                onClick={() => handleOpenDeleteDialog(chapter)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                <span>Delete Chapter</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];
  
  if (isStoryLoading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }
  
  if (!story && storyId) {
    return (
      <AdminLayout>
        <div className="py-12 text-center">
          <p className="text-lg text-muted-foreground">Story not found</p>
          <Button variant="outline" className="mt-4" onClick={() => window.history.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Stories
          </Button>
        </div>
      </AdminLayout>
    );
  }
  
  return (
    <AdminLayout>
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start">
          <div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={() => window.history.back()}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <h1 className="text-2xl font-bold">{story?.title} - Chapters</h1>
            </div>
            <p className="text-muted-foreground ml-9">Manage chapters for this story</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <form onSubmit={handleSearch} className="flex w-full">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search chapters..."
                  className="pl-8 w-full"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <Button type="submit" className="ml-2">Search</Button>
            </form>
            
            <Button onClick={handleOpenCreateDialog} className="sm:ml-2">
              <Plus className="h-4 w-4 mr-2" />
              Add Chapter
            </Button>
          </div>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <DataTable 
            columns={columns} 
            data={chapters} 
            currentPage={page}
            onPageChange={setPage}
            totalPages={Math.ceil(chapters.length / 10) || 1}
          />
        )}
      </div>
      
      {/* Create/Edit Chapter Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {dialogMode === "create" ? "Add New Chapter" : "Edit Chapter"}
            </DialogTitle>
            <DialogDescription>
              {dialogMode === "create" 
                ? "Fill in the details below to create a new chapter." 
                : "Update the chapter information below."}
            </DialogDescription>
          </DialogHeader>
          
          <DataForm
            fields={formFields}
            onSubmit={(data) => {
              if (dialogMode === "create") {
                createChapterMutation.mutate({
                  ...data,
                  story_id: storyId!
                } as InsertChapter);
              } else if (selectedChapter) {
                updateChapterMutation.mutate({
                  id: selectedChapter.id,
                  data: data as Partial<InsertChapter>
                });
              }
            }}
            initialValues={selectedChapter || { story_id: storyId }}
            isSubmitting={createChapterMutation.isPending || updateChapterMutation.isPending}
            submitText={dialogMode === "create" ? "Create Chapter" : "Update Chapter"}
          />
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete{" "}
              <span className="font-semibold">Chapter {selectedChapter?.chapter_number}: {selectedChapter?.title}</span>{" "}
              and all its associated comments.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (selectedChapter) {
                  deleteChapterMutation.mutate(selectedChapter.id);
                }
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteChapterMutation.isPending}
            >
              {deleteChapterMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Chapter"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}