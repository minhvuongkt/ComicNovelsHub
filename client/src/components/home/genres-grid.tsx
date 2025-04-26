import { Link } from "wouter";
import { Genre } from "@/types";
import { ArrowRight } from "lucide-react";

const GENRE_ICONS: Record<string, string> = {
  action: "sports_martial_arts",
  adventure: "explore",
  comedy: "sentiment_very_satisfied",
  drama: "theater_comedy",
  fantasy: "auto_awesome",
  horror: "mood_bad",
  mystery: "search",
  romance: "favorite",
  "sci-fi": "rocket_launch",
  "slice of life": "home"
};

const GENRE_GRADIENTS: Record<string, string> = {
  action: "from-blue-500 to-blue-700",
  adventure: "from-green-500 to-green-700",
  comedy: "from-yellow-500 to-yellow-700",
  drama: "from-orange-500 to-orange-700",
  fantasy: "from-purple-500 to-purple-700",
  horror: "from-red-500 to-red-700",
  mystery: "from-indigo-500 to-indigo-700",
  romance: "from-pink-500 to-pink-700",
  "sci-fi": "from-cyan-500 to-cyan-700",
  "slice of life": "from-teal-500 to-teal-700"
};

type GenresGridProps = {
  genres: Genre[];
  limit?: number;
  viewAllLink?: string;
};

export function GenresGrid({ genres, limit = 4, viewAllLink }: GenresGridProps) {
  const displayedGenres = genres.slice(0, limit);
  
  if (!genres || genres.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Popular Genres</h2>
          {viewAllLink && (
            <Link href={viewAllLink} className="text-primary dark:text-primary-400 text-sm font-medium flex items-center">
              View All <ArrowRight className="h-4 w-4 ml-1" />
            </Link>
          )}
        </div>
        <div className="h-40 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg">
          <p className="text-gray-500 dark:text-gray-400">No genres to display</p>
        </div>
      </div>
    );
  }
  
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Popular Genres</h2>
        {viewAllLink && (
          <Link href={viewAllLink} className="text-primary dark:text-primary-400 text-sm font-medium flex items-center">
            View All <ArrowRight className="h-4 w-4 ml-1" />
          </Link>
        )}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {displayedGenres.map((genre) => {
          const genreLower = genre.name.toLowerCase();
          const iconName = GENRE_ICONS[genreLower] || "auto_awesome";
          const gradientClass = GENRE_GRADIENTS[genreLower] || "from-gray-500 to-gray-700";
          
          return (
            <Link key={genre.id} href={`/genres/${genre.id}`}>
              <div className={`bg-gradient-to-br ${gradientClass} text-white rounded-lg p-4 flex flex-col items-center justify-center aspect-[4/3] hover:shadow-lg transition-shadow`}>
                <span className="material-icons mb-2">{iconName}</span>
                <span className="font-medium">{genre.name}</span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
