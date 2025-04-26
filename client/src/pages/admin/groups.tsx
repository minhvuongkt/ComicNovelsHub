import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { AdminLayout } from "@/components/admin/layout";
import { DataTable } from "@/components/admin/data-table";
import { DataForm } from "@/components/admin/data-form";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Group, InsertGroup } from "@/types";
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

export default function AdminGroups() {
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"create" | "edit">("create");
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const { toast } = useToast();
  
  // Fetch translation groups
  const { 
    data: groups = [], 
    isLoading,
    refetch
  } = useQuery<Group[]>({
    queryKey: ["/api/groups"],
    queryFn: async () => {
      const res = await fetch("/api/groups");
      
      if (!res.ok) {
        throw new Error("Failed to fetch translation groups");
      }
      
      return res.json();
    },
  });
  
  // Create group mutation
  const createGroupMutation = useMutation({
    mutationFn: async (groupData: InsertGroup) => {
      const res = await apiRequest("POST", "/api/groups", groupData);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Translation group created",
        description: "Translation group has been successfully created.",
      });
      
      queryClient.invalidateQueries({ queryKey: ["/api/groups"] });
      setDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Failed to create translation group",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    }
  });
  
  // Update group mutation
  const updateGroupMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<InsertGroup> }) => {
      const res = await apiRequest("PATCH", `/api/groups/${id}`, data);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Translation group updated",
        description: "Translation group has been successfully updated.",
      });
      
      queryClient.invalidateQueries({ queryKey: ["/api/groups"] });
      setDialogOpen(false);
      setSelectedGroup(null);
    },
    onError: (error) => {
      toast({
        title: "Failed to update translation group",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    }
  });
  
  // Delete group mutation
  const deleteGroupMutation = useMutation({
    mutationFn: async (groupId: number) => {
      await apiRequest("DELETE", `/api/groups/${groupId}`);
    },
    onSuccess: () => {
      toast({
        title: "Translation group deleted",
        description: "Translation group has been successfully deleted.",
      });
      
      queryClient.invalidateQueries({ queryKey: ["/api/groups"] });
      setDeleteDialogOpen(false);
      setSelectedGroup(null);
    },
    onError: (error) => {
      toast({
        title: "Failed to delete translation group",
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
    setSelectedGroup(null);
    setDialogOpen(true);
  };
  
  // Open edit dialog
  const handleOpenEditDialog = (group: Group) => {
    setDialogMode("edit");
    setSelectedGroup(group);
    setDialogOpen(true);
  };
  
  // Open delete dialog
  const handleOpenDeleteDialog = (group: Group) => {
    setSelectedGroup(group);
    setDeleteDialogOpen(true);
  };
  
  // Prepare group form fields
  const formFields = [
    { name: "name", label: "Name", type: "text", required: true },
    { name: "description", label: "Description", type: "textarea" },
  ];
  
  // Filter groups by search term
  const filteredGroups = search 
    ? groups.filter(group => 
        group.name.toLowerCase().includes(search.toLowerCase()) ||
        (group.description && group.description.toLowerCase().includes(search.toLowerCase()))
      )
    : groups;
  
  // Table columns
  const columns = [
    {
      header: "Name",
      accessorKey: "name",
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
        return Math.floor(Math.random() * 15);
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
        const group = row.original;
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
                onClick={() => handleOpenEditDialog(group)}
              >
                <Edit className="mr-2 h-4 w-4" />
                <span>Edit Group</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer">
                <BookOpen className="mr-2 h-4 w-4" />
                <span>View Stories</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="cursor-pointer text-destructive focus:text-destructive"
                onClick={() => handleOpenDeleteDialog(group)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                <span>Delete Group</span>
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
            <h1 className="text-2xl font-bold">Translation Groups</h1>
            <p className="text-muted-foreground">Manage your platform's translation groups</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <form onSubmit={handleSearch} className="flex w-full">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search groups..."
                  className="pl-8 w-full"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <Button type="submit" className="ml-2">Search</Button>
            </form>
            
            <Button onClick={handleOpenCreateDialog} className="sm:ml-2">
              <Plus className="h-4 w-4 mr-2" />
              Add Group
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
            data={filteredGroups} 
          />
        )}
      </div>
      
      {/* Create/Edit Group Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {dialogMode === "create" ? "Add New Translation Group" : "Edit Translation Group"}
            </DialogTitle>
            <DialogDescription>
              {dialogMode === "create" 
                ? "Fill in the details below to create a new translation group." 
                : "Update the translation group information below."}
            </DialogDescription>
          </DialogHeader>
          
          <DataForm
            fields={formFields}
            onSubmit={(data) => {
              if (dialogMode === "create") {
                createGroupMutation.mutate(data as InsertGroup);
              } else if (selectedGroup) {
                updateGroupMutation.mutate({
                  id: selectedGroup.id,
                  data: data as Partial<InsertGroup>
                });
              }
            }}
            initialValues={selectedGroup || {}}
            isSubmitting={createGroupMutation.isPending || updateGroupMutation.isPending}
            submitText={dialogMode === "create" ? "Create Group" : "Update Group"}
          />
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete translation group{" "}
              <span className="font-semibold">{selectedGroup?.name}</span>.
              Stories associated with this group will not be deleted but will no longer have a translation group assigned.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (selectedGroup) {
                  deleteGroupMutation.mutate(selectedGroup.id);
                }
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteGroupMutation.isPending}
            >
              {deleteGroupMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Group"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
