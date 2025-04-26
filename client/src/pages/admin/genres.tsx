import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { AdminLayout } from "@/components/admin/layout";
import { DataTable } from "@/components/admin/data-table";
import { DataForm } from "@/components/admin/data-form";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Genre, InsertGenre } from "@/types";
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
  Plus,
  Loader2,
  BookOpen,
} from "lucide-react";

export default function AdminGenres() {
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"create" | "edit">("create");
  const [selectedGenre, setSelectedGenre] = useState<Genre | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const { toast } = useToast();
  
  // Fetch genres
  const { 
    data: genres = [], 
    isLoading,
    refetch
  } = useQuery<Genre[]>({
    queryKey: ["/api/genres"],
    queryFn: async () => {
      const res = await fetch("/api/genres");
      
      if (!res.ok) {
        throw new Error("Failed to fetch genres");
      }
      
      return res.json();
    },
  });
  
  // Create genre mutation
  const createGenreMutation = useMutation({
    mutationFn: async (genreData: InsertGenre) => {
      const res = await apiRequest("POST", "/api/genres", genreData);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Genre created",
        description: "Genre has been successfully created.",
      });
      
      queryClient.invalidateQueries({ queryKey: ["/api/genres"] });
      setDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Failed to create genre",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    }
  });
  
  // Update genre mutation
  const updateGenreMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<InsertGenre> }) => {
      const res = await apiRequest("PATCH", `/api/genres/${id}`, data);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Genre updated",
        description: "Genre has been successfully updated.",
      });
      
      queryClient.invalidateQueries({ queryKey: ["/api/genres"] });
      setDialogOpen(false);
      setSelectedGenre(null);
    },
    onError: (error) => {
      toast({
        title: "Failed to update genre",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    }
  });
  
  // Delete genre mutation
  const deleteGenreMutation = useMutation({
    mutationFn: async (genreId: number) => {
      await apiRequest("DELETE", `/api/genres/${genreId}`);
    },
    onSuccess: () => {
      toast({
        title: "Genre deleted",
        description: "Genre has been successfully deleted.",
      });
      
      queryClient.invalidateQueries({ queryKey: ["/api/genres"] });
      setDeleteDialogOpen(false);
      setSelectedGenre(null);
    },
    onError: (error) => {
      toast({
        title: "Failed to delete genre",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    }
  });
  
  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Simple client-side filtering for this example
    refetch();
  };
  
  // Open create dialog
  const handleOpenCreateDialog = () => {
    setDialogMode("create");
    setSelectedGenre(null);
    setDialogOpen(true);
  };
  
  // Open edit dialog
  const handleOpenEditDialog = (genre: Genre) => {
    setDialogMode("edit");
    setSelectedGenre(genre);
    setDialogOpen(true);
  };
  
  // Open delete dialog
  const handleOpenDeleteDialog = (genre: Genre) => {
    setSelectedGenre(genre);
    setDeleteDialogOpen(true);
  };
  
  // Prepare genre form fields
  const formFields = [
    { name: "name", label: "Name", type: "text", required: true },
    { name: "description", label: "Description", type: "textarea" },
  ];
  
  // Filter genres by search term
  const filteredGenres = search 
    ? genres.filter(genre => 
        genre.name.toLowerCase().includes(search.toLowerCase()) ||
        (genre.description && genre.description.toLowerCase().includes(search.toLowerCase()))
      )
    : genres;
  
  // Table columns
  const columns = [
    {
      header: "Name",
      accessorKey: "name",
      cell: ({ row }: { row: any }) => {
        const genre = row.original;
        return (
          <div className="flex items-center">
            <span className={`genre-badge ${genre.name.toLowerCase()} mr-2 w-2 h-2 rounded-full`}></span>
            <span>{genre.name}</span>
          </div>
        );
      },
    },
    {
      header: "Description",
      accessorKey: "description",
      cell: ({ row }: { row: any }) => {
        const description = row.original.description;
        return description 
          ? description.length > 100 ? `${description.substring(0, 100)}...` : description
          : "No description available";
      },
    },
    {
      header: "# Stories",
      accessorKey: "storyCount",
      cell: () => {
        // In a real app, you'd fetch the actual count from the backend
        return Math.floor(Math.random() * 25);
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
        const genre = row.original;
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
                onClick={() => handleOpenEditDialog(genre)}
              >
                <Edit className="mr-2 h-4 w-4" />
                <span>Edit Genre</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer">
                <BookOpen className="mr-2 h-4 w-4" />
                <span>View Stories</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="cursor-pointer text-destructive focus:text-destructive"
                onClick={() => handleOpenDeleteDialog(genre)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                <span>Delete Genre</span>
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
            <h1 className="text-2xl font-bold">Genres</h1>
            <p className="text-muted-foreground">Manage your platform's genres</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <form onSubmit={handleSearch} className="flex w-full">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search genres..."
                  className="pl-8 w-full"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <Button type="submit" className="ml-2">Search</Button>
            </form>
            
            <Button onClick={handleOpenCreateDialog} className="sm:ml-2">
              <Plus className="h-4 w-4 mr-2" />
              Add Genre
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
            data={filteredGenres} 
          />
        )}
      </div>
      
      {/* Create/Edit Genre Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {dialogMode === "create" ? "Add New Genre" : "Edit Genre"}
            </DialogTitle>
            <DialogDescription>
              {dialogMode === "create" 
                ? "Fill in the details below to create a new genre." 
                : "Update the genre information below."}
            </DialogDescription>
          </DialogHeader>
          
          <DataForm
            fields={formFields}
            onSubmit={(data) => {
              if (dialogMode === "create") {
                createGenreMutation.mutate(data as InsertGenre);
              } else if (selectedGenre) {
                updateGenreMutation.mutate({
                  id: selectedGenre.id,
                  data: data as Partial<InsertGenre>
                });
              }
            }}
            initialValues={selectedGenre || {}}
            isSubmitting={createGenreMutation.isPending || updateGenreMutation.isPending}
            submitText={dialogMode === "create" ? "Create Genre" : "Update Genre"}
          />
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete genre{" "}
              <span className="font-semibold">{selectedGenre?.name}</span>. 
              Stories associated with this genre will not be deleted but will no longer have this genre assigned.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (selectedGenre) {
                  deleteGenreMutation.mutate(selectedGenre.id);
                }
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteGenreMutation.isPending}
            >
              {deleteGenreMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Genre"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
