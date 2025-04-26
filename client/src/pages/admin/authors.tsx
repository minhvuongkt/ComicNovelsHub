import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { AdminLayout } from "@/components/admin/layout";
import { DataTable } from "@/components/admin/data-table";
import { DataForm } from "@/components/admin/data-form";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Author, InsertAuthor } from "@/types";
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

export default function AdminAuthors() {
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"create" | "edit">("create");
  const [selectedAuthor, setSelectedAuthor] = useState<Author | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const { toast } = useToast();
  
  // Fetch authors
  const { 
    data: authors = [], 
    isLoading,
    refetch
  } = useQuery<Author[]>({
    queryKey: ["/api/authors"],
    queryFn: async () => {
      const res = await fetch("/api/authors");
      
      if (!res.ok) {
        throw new Error("Failed to fetch authors");
      }
      
      return res.json();
    },
  });
  
  // Create author mutation
  const createAuthorMutation = useMutation({
    mutationFn: async (authorData: InsertAuthor) => {
      const res = await apiRequest("POST", "/api/authors", authorData);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Author created",
        description: "Author has been successfully created.",
      });
      
      queryClient.invalidateQueries({ queryKey: ["/api/authors"] });
      setDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Failed to create author",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    }
  });
  
  // Update author mutation
  const updateAuthorMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<InsertAuthor> }) => {
      const res = await apiRequest("PATCH", `/api/authors/${id}`, data);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Author updated",
        description: "Author has been successfully updated.",
      });
      
      queryClient.invalidateQueries({ queryKey: ["/api/authors"] });
      setDialogOpen(false);
      setSelectedAuthor(null);
    },
    onError: (error) => {
      toast({
        title: "Failed to update author",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    }
  });
  
  // Delete author mutation
  const deleteAuthorMutation = useMutation({
    mutationFn: async (authorId: number) => {
      await apiRequest("DELETE", `/api/authors/${authorId}`);
    },
    onSuccess: () => {
      toast({
        title: "Author deleted",
        description: "Author has been successfully deleted.",
      });
      
      queryClient.invalidateQueries({ queryKey: ["/api/authors"] });
      setDeleteDialogOpen(false);
      setSelectedAuthor(null);
    },
    onError: (error) => {
      toast({
        title: "Failed to delete author",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    }
  });
  
  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Simple client-side filtering for this example
    // In a real app, you'd want to use server-side filtering
    refetch();
  };
  
  // Open create dialog
  const handleOpenCreateDialog = () => {
    setDialogMode("create");
    setSelectedAuthor(null);
    setDialogOpen(true);
  };
  
  // Open edit dialog
  const handleOpenEditDialog = (author: Author) => {
    setDialogMode("edit");
    setSelectedAuthor(author);
    setDialogOpen(true);
  };
  
  // Open delete dialog
  const handleOpenDeleteDialog = (author: Author) => {
    setSelectedAuthor(author);
    setDeleteDialogOpen(true);
  };
  
  // Prepare author form fields
  const formFields = [
    { name: "name", label: "Name", type: "text", required: true },
    { name: "bio", label: "Biography", type: "textarea" },
  ];
  
  // Filter authors by search term
  const filteredAuthors = search 
    ? authors.filter(author => 
        author.name.toLowerCase().includes(search.toLowerCase()) ||
        (author.bio && author.bio.toLowerCase().includes(search.toLowerCase()))
      )
    : authors;
  
  // Table columns
  const columns = [
    {
      header: "Name",
      accessorKey: "name",
    },
    {
      header: "Bio",
      accessorKey: "bio",
      cell: ({ row }: { row: any }) => {
        const bio = row.original.bio;
        return bio 
          ? bio.length > 100 ? `${bio.substring(0, 100)}...` : bio
          : "No biography available";
      },
    },
    {
      header: "# Stories",
      accessorKey: "storyCount",
      cell: () => {
        // In a real app, you'd fetch the actual count from the backend
        return Math.floor(Math.random() * 10);
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
        const author = row.original;
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
                onClick={() => handleOpenEditDialog(author)}
              >
                <Edit className="mr-2 h-4 w-4" />
                <span>Edit Author</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer">
                <BookOpen className="mr-2 h-4 w-4" />
                <span>View Stories</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="cursor-pointer text-destructive focus:text-destructive"
                onClick={() => handleOpenDeleteDialog(author)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                <span>Delete Author</span>
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
            <h1 className="text-2xl font-bold">Authors</h1>
            <p className="text-muted-foreground">Manage your platform's authors</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <form onSubmit={handleSearch} className="flex w-full">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search authors..."
                  className="pl-8 w-full"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <Button type="submit" className="ml-2">Search</Button>
            </form>
            
            <Button onClick={handleOpenCreateDialog} className="sm:ml-2">
              <Plus className="h-4 w-4 mr-2" />
              Add Author
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
            data={filteredAuthors} 
          />
        )}
      </div>
      
      {/* Create/Edit Author Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {dialogMode === "create" ? "Add New Author" : "Edit Author"}
            </DialogTitle>
            <DialogDescription>
              {dialogMode === "create" 
                ? "Fill in the details below to create a new author." 
                : "Update the author information below."}
            </DialogDescription>
          </DialogHeader>
          
          <DataForm
            fields={formFields}
            onSubmit={(data) => {
              if (dialogMode === "create") {
                createAuthorMutation.mutate(data as InsertAuthor);
              } else if (selectedAuthor) {
                updateAuthorMutation.mutate({
                  id: selectedAuthor.id,
                  data: data as Partial<InsertAuthor>
                });
              }
            }}
            initialValues={selectedAuthor || {}}
            isSubmitting={createAuthorMutation.isPending || updateAuthorMutation.isPending}
            submitText={dialogMode === "create" ? "Create Author" : "Update Author"}
          />
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete author{" "}
              <span className="font-semibold">{selectedAuthor?.name}</span>.
              Stories associated with this author will not be deleted but will no longer have an author assigned.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (selectedAuthor) {
                  deleteAuthorMutation.mutate(selectedAuthor.id);
                }
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteAuthorMutation.isPending}
            >
              {deleteAuthorMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Author"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
