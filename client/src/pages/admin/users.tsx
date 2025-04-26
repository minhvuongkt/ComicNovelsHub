import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { AdminLayout } from "@/components/admin/layout";
import { DataTable } from "@/components/admin/data-table";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { User } from "@/types";
import { formatDate } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { Button } from "@/components/ui/button";
import { 
  Search, 
  MoreHorizontal, 
  UserCog, 
  Trash2, 
  Mail, 
  Loader2 
} from "lucide-react";

export default function AdminUsers() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const { toast } = useToast();
  
  // Fetch users
  const { 
    data: users = [], 
    isLoading,
    refetch
  } = useQuery<User[]>({
    queryKey: ["/api/admin/users", { page, search }],
    queryFn: async () => {
      const queryParams = new URLSearchParams();
      queryParams.append("page", page.toString());
      queryParams.append("limit", "10");
      if (search) queryParams.append("search", search);
      
      const res = await fetch(`/api/admin/users?${queryParams.toString()}`);
      
      if (!res.ok) {
        throw new Error("Failed to fetch users");
      }
      
      return res.json();
    },
  });
  
  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: async (userId: number) => {
      await apiRequest("DELETE", `/api/admin/users/${userId}`);
    },
    onSuccess: () => {
      toast({
        title: "User deleted",
        description: "User has been successfully deleted.",
      });
      
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      setShowDeleteDialog(false);
      setSelectedUser(null);
    },
    onError: (error) => {
      toast({
        title: "Failed to delete user",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    }
  });
  
  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1); // Reset to first page on new search
    refetch();
  };
  
  // Prepare columns for data table
  const columns = [
    {
      header: "User",
      accessorKey: "user",
      cell: ({ row }: { row: any }) => {
        const user = row.original;
        return (
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9">
              <AvatarImage src={user.avatar} alt={`${user.first_name} ${user.last_name}`} />
              <AvatarFallback>{`${user.first_name.charAt(0)}${user.last_name.charAt(0)}`}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{`${user.first_name} ${user.last_name}`}</p>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
          </div>
        );
      },
    },
    {
      header: "Role",
      accessorKey: "role",
      cell: ({ row }: { row: any }) => {
        const role = row.original.role;
        return (
          <div className="capitalize">{role}</div>
        );
      },
    },
    {
      header: "Joined",
      accessorKey: "created_at",
      cell: ({ row }: { row: any }) => {
        return formatDate(row.original.created_at);
      },
    },
    {
      header: "Actions",
      accessorKey: "actions",
      cell: ({ row }: { row: any }) => {
        const user = row.original;
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
                <UserCog className="mr-2 h-4 w-4" />
                <span>Edit User</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer">
                <Mail className="mr-2 h-4 w-4" />
                <span>Email User</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="cursor-pointer text-destructive focus:text-destructive"
                onClick={() => {
                  setSelectedUser(user);
                  setShowDeleteDialog(true);
                }}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                <span>Delete User</span>
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
            <h1 className="text-2xl font-bold">Users</h1>
            <p className="text-muted-foreground">Manage your platform users</p>
          </div>
          
          <form onSubmit={handleSearch} className="flex w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search users..."
                className="pl-8 w-full"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Button type="submit" className="ml-2">Search</Button>
          </form>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <DataTable 
            columns={columns} 
            data={users} 
            currentPage={page}
            onPageChange={setPage}
            totalPages={Math.ceil(users.length / 10) || 1}
          />
        )}
      </div>
      
      {/* Delete confirmation dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete{" "}
              <span className="font-semibold">
                {selectedUser ? `${selectedUser.first_name} ${selectedUser.last_name}'s` : "the user's"}
              </span>{" "}
              account and remove their data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (selectedUser) {
                  deleteUserMutation.mutate(selectedUser.id);
                }
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteUserMutation.isPending}
            >
              {deleteUserMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete User"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
