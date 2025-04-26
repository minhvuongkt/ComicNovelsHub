import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { AdminLayout } from "@/components/admin/layout";
import { DataTable } from "@/components/admin/data-table";
import { DataForm } from "@/components/admin/data-form";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Story, InsertStory } from "@/types";
import { formatDate } from "@/lib/utils";
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
  BookOpen,
  Plus,
  Loader2
} from "lucide-react";

export default function AdminStories() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"create" | "edit">("create");
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const { toast } = useToast();
  
  // Fetch stories
  const { 
    data: stories = [], 
    isLoading,
    refetch
  } = useQuery<Story[]>({
    queryKey: ["/api/stories", { page, search }],
    queryFn: async () => {
      const queryParams = new URLSearchParams();
      queryParams.append("page", page.toString());
      queryParams.append("limit", "10");
      if (search) queryParams.append("filters", JSON.stringify({ title: search }));
      
      const res = await fetch(`/api/stories?${queryParams.toString()}`);
      
      if (!res.ok) {
        throw new Error("Failed to fetch stories");
      }
      
      return res.json();
    },
  });
  
  // Create story mutation
  const createStoryMutation = useMutation({
    mutationFn: async (storyData: InsertStory) => {
      const res = await apiRequest("POST", "/api/stories", storyData);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Story created",
        description: "Story has been successfully created.",
      });
      
      queryClient.invalidateQueries({ queryKey: ["/api/stories"] });
      setDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Failed to create story",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    }
  });
  
  // Update story mutation
  const updateStoryMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<InsertStory> }) => {
      const res = await apiRequest("PATCH", `/api/stories/${id}`, data);
      
      if (!res.ok) {
        // Try to parse the error response
        try {
          const errorData = await res.json();
          throw new Error(errorData.message || "Failed to update story");
        } catch (e) {
          // If parsing fails, throw a generic error with the status
          throw new Error(`Failed to update story: ${res.status} ${res.statusText}`);
        }
      }
      
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Story updated",
        description: "Story has been successfully updated.",
      });
      
      queryClient.invalidateQueries({ queryKey: ["/api/stories"] });
      setDialogOpen(false);
      setSelectedStory(null);
    },
    onError: (error) => {
      console.error("Update story error:", error);
      toast({
        title: "Failed to update story",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    }
  });
  
  // Delete story mutation
  const deleteStoryMutation = useMutation({
    mutationFn: async (storyId: number) => {
      await apiRequest("DELETE", `/api/stories/${storyId}`);
    },
    onSuccess: () => {
      toast({
        title: "Story deleted",
        description: "Story has been successfully deleted.",
      });
      
      queryClient.invalidateQueries({ queryKey: ["/api/stories"] });
      setDeleteDialogOpen(false);
      setSelectedStory(null);
    },
    onError: (error) => {
      toast({
        title: "Failed to delete story",
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
    setSelectedStory(null);
    setDialogOpen(true);
  };
  
  // Open edit dialog
  const handleOpenEditDialog = (story: Story) => {
    setDialogMode("edit");
    setSelectedStory(story);
    setDialogOpen(true);
  };
  
  // Open delete dialog
  const handleOpenDeleteDialog = (story: Story) => {
    setSelectedStory(story);
    setDeleteDialogOpen(true);
  };
  
  // Prepare story form fields
  const formFields = [
    { name: "title", label: "Title", type: "text", required: true },
    { name: "alternative_title", label: "Alternative Title", type: "text" },
    { name: "description", label: "Description", type: "textarea" },
    { name: "cover_image", label: "Cover Image URL", type: "text" },
    { name: "author_id", label: "Author", type: "select", 
      endpoint: "/api/authors", labelKey: "name", valueKey: "id" },
    { name: "group_id", label: "Translation Group", type: "select", 
      endpoint: "/api/groups", labelKey: "name", valueKey: "id" },
    { name: "release_year", label: "Release Year", type: "number" },
  ];
  
  // Table columns
  const columns = [
    {
      header: "Story",
      accessorKey: "story",
      cell: ({ row }: { row: any }) => {
        const story = row.original;
        return (
          <div className="flex items-center gap-3">
            <div className="h-12 w-10 overflow-hidden rounded">
              <img 
                src={story.cover_image || "https://placehold.co/400x560/gray/white?text=No+Cover"} 
                alt={story.title} 
                className="h-full w-full object-cover"
              />
            </div>
            <div>
              <p className="font-medium">{story.title}</p>
              {story.alternative_title && (
                <p className="text-xs text-muted-foreground">{story.alternative_title}</p>
              )}
            </div>
          </div>
        );
      },
    },
    {
      header: "Author",
      accessorKey: "author_id",
      cell: ({ row }: { row: any }) => {
        const author = row.original.author;
        return author ? author.name : "Unknown";
      },
    },
    {
      header: "Translation Group",
      accessorKey: "group_id",
      cell: ({ row }: { row: any }) => {
        const group = row.original.group;
        return group ? group.name : "Unknown";
      },
    },
    {
      header: "Chapters",
      accessorKey: "chapters",
      cell: ({ row }: { row: any }) => {
        const chaptersCount = row.original.chapters?.length || 0;
        return chaptersCount;
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
        const story = row.original;
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
                onClick={() => handleOpenEditDialog(story)}
              >
                <Edit className="mr-2 h-4 w-4" />
                <span>Edit Story</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer">
                <BookOpen className="mr-2 h-4 w-4" />
                <span>Manage Chapters</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="cursor-pointer text-destructive focus:text-destructive"
                onClick={() => handleOpenDeleteDialog(story)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                <span>Delete Story</span>
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
            <h1 className="text-2xl font-bold">Stories</h1>
            <p className="text-muted-foreground">Manage your platform's stories</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <form onSubmit={handleSearch} className="flex w-full">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search stories..."
                  className="pl-8 w-full"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <Button type="submit" className="ml-2">Search</Button>
            </form>
            
            <Button onClick={handleOpenCreateDialog} className="sm:ml-2">
              <Plus className="h-4 w-4 mr-2" />
              Add Story
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
            data={stories} 
            currentPage={page}
            onPageChange={setPage}
            totalPages={Math.ceil(stories.length / 10) || 1}
          />
        )}
      </div>
      
      {/* Create/Edit Story Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {dialogMode === "create" ? "Add New Story" : "Edit Story"}
            </DialogTitle>
            <DialogDescription>
              {dialogMode === "create" 
                ? "Fill in the details below to create a new story." 
                : "Update the story information below."}
            </DialogDescription>
          </DialogHeader>
          
          <DataForm
            fields={formFields}
            onSubmit={(data) => {
              if (dialogMode === "create") {
                createStoryMutation.mutate(data as InsertStory);
              } else if (selectedStory) {
                updateStoryMutation.mutate({
                  id: selectedStory.id,
                  data: data as Partial<InsertStory>
                });
              }
            }}
            initialValues={selectedStory || {}}
            isSubmitting={createStoryMutation.isPending || updateStoryMutation.isPending}
            submitText={dialogMode === "create" ? "Create Story" : "Update Story"}
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
              <span className="font-semibold">{selectedStory?.title}</span>{" "}
              and all its associated chapters and comments.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (selectedStory) {
                  deleteStoryMutation.mutate(selectedStory.id);
                }
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteStoryMutation.isPending}
            >
              {deleteStoryMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Story"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
