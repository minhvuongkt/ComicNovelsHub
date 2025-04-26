import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { Story } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { formatDate, truncateText } from "@/lib/utils";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Loader2, MoreHorizontal, BookOpenText, Trash2, Heart } from "lucide-react";

type FavoriteItem = {
  story: Story;
  favorite: {
    id: number;
    user_id: number;
    story_id: number;
    created_at: Date;
  };
};

export function FavoritesList() {
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedFavoriteId, setSelectedFavoriteId] = useState<number | null>(null);

  // Fetch favorites
  const { 
    data: favorites = [], 
    isLoading,
    isError,
  } = useQuery<FavoriteItem[]>({
    queryKey: ["/api/favorites"],
  });

  // Remove favorite mutation
  const removeFavoriteMutation = useMutation({
    mutationFn: async (storyId: number) => {
      await apiRequest("DELETE", `/api/favorites/${storyId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/favorites"] });
      setDialogOpen(false);
      toast({
        title: "Removed from favorites",
        description: "Story has been removed from your favorites.",
      });
    },
    onError: () => {
      toast({
        title: "Failed to remove from favorites",
        description: "There was a problem removing the story from your favorites. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleRemoveFavorite = (storyId: number) => {
    setSelectedFavoriteId(storyId);
    setDialogOpen(true);
  };

  const confirmRemoveFavorite = () => {
    if (selectedFavoriteId !== null) {
      removeFavoriteMutation.mutate(selectedFavoriteId);
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold">Favorite Stories</h3>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : isError ? (
          <div className="text-center py-12">
            <p className="text-red-500">Failed to load favorites.</p>
          </div>
        ) : favorites.length === 0 ? (
          <div className="text-center py-12">
            <Heart className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium mb-2">No favorites yet</h3>
            <p className="text-gray-500 mb-4">
              You haven't added any stories to your favorites yet.
            </p>
            <Link href="/">
              <Button>Browse Stories</Button>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Story</TableHead>
                  <TableHead>Genres</TableHead>
                  <TableHead>Added On</TableHead>
                  <TableHead className="w-[80px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {favorites.map((item) => (
                  <TableRow key={item.favorite.id}>
                    <TableCell>
                      <div className="flex items-start gap-3">
                        <div className="h-14 w-10 overflow-hidden rounded">
                          <img 
                            src={item.story.cover_image || "https://placehold.co/400x600/gray/white?text=No+Cover"} 
                            alt={item.story.title} 
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div>
                          <Link href={`/stories/${item.story.id}`} className="font-medium hover:text-primary">
                            {truncateText(item.story.title, 40)}
                          </Link>
                          <div className="text-xs text-gray-500 mt-1">
                            {item.story.chapters?.length || 0} chapters
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {item.story.genres?.slice(0, 3).map((genre) => (
                          <Badge key={genre.id} variant="outline" className="text-xs">
                            {genre.name}
                          </Badge>
                        ))}
                        {(item.story.genres?.length || 0) > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{(item.story.genres?.length || 0) - 3} more
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">
                      {formatDate(item.favorite.created_at)}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/stories/${item.story.id}`}>
                              <BookOpenText className="h-4 w-4 mr-2" />
                              View Story
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleRemoveFavorite(item.story.id)}
                            className="text-red-500 focus:text-red-500"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Remove from Favorites
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>

      {/* Remove confirmation dialog */}
      <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove from favorites?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove this story from your favorites list.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmRemoveFavorite}>
              {removeFavoriteMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}