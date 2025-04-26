import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { AdminLayout } from "@/components/admin/layout";
import { DataTable } from "@/components/admin/data-table";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Report } from "@/types";
import { formatDate, formatRelativeTime } from "@/lib/utils";
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
import { Badge } from "@/components/ui/badge";
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
  Eye,
  Trash2,
  CheckCircle2,
  Loader2,
} from "lucide-react";

export default function AdminReports() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState<string>("all");
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const { toast } = useToast();
  
  // Fetch reports
  const { 
    data: reports = [], 
    isLoading,
    refetch
  } = useQuery<Report[]>({
    queryKey: ["/api/admin/reports", { page, filter }],
    queryFn: async () => {
      const queryParams = new URLSearchParams();
      queryParams.append("page", page.toString());
      queryParams.append("limit", "20");
      if (filter !== "all") queryParams.append("filter", filter);
      
      const res = await fetch(`/api/reports?${queryParams.toString()}`);
      
      if (!res.ok) {
        throw new Error("Failed to fetch reports");
      }
      
      return res.json();
    },
  });
  
  // Delete report mutation
  const deleteReportMutation = useMutation({
    mutationFn: async (reportId: number) => {
      await apiRequest("DELETE", `/api/reports/${reportId}`);
    },
    onSuccess: () => {
      toast({
        title: "Report resolved",
        description: "Report has been marked as resolved and removed from the list.",
      });
      
      queryClient.invalidateQueries({ queryKey: ["/api/reports"] });
      setDeleteDialogOpen(false);
      setSelectedReport(null);
    },
    onError: (error) => {
      toast({
        title: "Failed to resolve report",
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
  const handleOpenDeleteDialog = (report: Report) => {
    setSelectedReport(report);
    setDeleteDialogOpen(true);
  };
  
  // Filter reports by search term (client-side)
  const filteredReports = search 
    ? reports.filter(report => 
        report.reason.toLowerCase().includes(search.toLowerCase()) ||
        report.target_type.toLowerCase().includes(search.toLowerCase())
      )
    : reports;
  
  // Get badge color based on target type
  const getTargetBadgeColor = (targetType: string) => {
    switch (targetType) {
      case "story":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300";
      case "chapter":
        return "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300";
      case "comment":
        return "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/40 dark:text-gray-300";
    }
  };
  
  // Table columns
  const columns = [
    {
      header: "Type",
      accessorKey: "target_type",
      cell: ({ row }: { row: any }) => {
        const targetType = row.original.target_type;
        return (
          <Badge className={getTargetBadgeColor(targetType) + " capitalize"}>
            {targetType}
          </Badge>
        );
      },
    },
    {
      header: "Target ID",
      accessorKey: "target_id",
    },
    {
      header: "Reason",
      accessorKey: "reason",
      cell: ({ row }: { row: any }) => {
        const reason = row.original.reason;
        return reason.length > 100 ? `${reason.substring(0, 100)}...` : reason;
      },
    },
    {
      header: "Reported By",
      accessorKey: "user_id",
      cell: ({ row }: { row: any }) => {
        // In a real app, you'd include user information
        return `User #${row.original.user_id}`;
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
        const report = row.original;
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
                <span>View Target</span>
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="cursor-pointer"
                onClick={() => handleOpenDeleteDialog(report)}
              >
                <CheckCircle2 className="mr-2 h-4 w-4" />
                <span>Mark as Resolved</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="cursor-pointer text-destructive focus:text-destructive"
                onClick={() => handleOpenDeleteDialog(report)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                <span>Delete Report</span>
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
            <h1 className="text-2xl font-bold">Reports</h1>
            <p className="text-muted-foreground">Manage user-submitted reports for content issues</p>
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
                <SelectItem value="all">All Reports</SelectItem>
                <SelectItem value="story">Story Reports</SelectItem>
                <SelectItem value="chapter">Chapter Reports</SelectItem>
                <SelectItem value="comment">Comment Reports</SelectItem>
              </SelectContent>
            </Select>
            
            <form onSubmit={handleSearch} className="flex w-full">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search reports..."
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
        ) : reports.length === 0 ? (
          <div className="bg-muted/50 rounded-lg p-8 text-center">
            <CheckCircle2 className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No pending reports</h3>
            <p className="text-muted-foreground">There are no active reports to handle at the moment.</p>
          </div>
        ) : (
          <DataTable 
            columns={columns} 
            data={filteredReports} 
            currentPage={page}
            onPageChange={setPage}
            totalPages={Math.ceil(filteredReports.length / 20) || 1}
          />
        )}
      </div>
      
      {/* Delete/Resolve confirmation dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Resolve this report?</AlertDialogTitle>
            <AlertDialogDescription>
              This action will mark the report as resolved and remove it from the active reports list.
              <div className="mt-4 p-3 bg-muted rounded-md">
                <div className="flex items-center gap-2 mb-2">
                  <Badge className={getTargetBadgeColor(selectedReport?.target_type || "") + " capitalize"}>
                    {selectedReport?.target_type}
                  </Badge>
                  <span>ID: {selectedReport?.target_id}</span>
                </div>
                <p className="italic">{selectedReport?.reason}</p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (selectedReport) {
                  deleteReportMutation.mutate(selectedReport.id);
                }
              }}
              disabled={deleteReportMutation.isPending}
            >
              {deleteReportMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Resolving...
                </>
              ) : (
                "Mark as Resolved"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
