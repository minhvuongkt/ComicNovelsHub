import { StorySummary } from "@/types";
import { Link } from "wouter";
import { UpdateCard } from "@/components/story/update-card";
import { ArrowRight } from "lucide-react";

type LatestUpdatesProps = {
  updates: StorySummary[];
  viewAllLink?: string;
};

export function LatestUpdates({ updates, viewAllLink }: LatestUpdatesProps) {
  if (!updates || updates.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Latest Updates</h2>
          {viewAllLink && (
            <Link href={viewAllLink} className="text-primary dark:text-primary-400 text-sm font-medium flex items-center">
              View All <ArrowRight className="h-4 w-4 ml-1" />
            </Link>
          )}
        </div>
        <div className="h-40 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg">
          <p className="text-gray-500 dark:text-gray-400">No updates to display</p>
        </div>
      </div>
    );
  }
  
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Latest Updates</h2>
        {viewAllLink && (
          <Link href={viewAllLink} className="text-primary dark:text-primary-400 text-sm font-medium flex items-center">
            View All <ArrowRight className="h-4 w-4 ml-1" />
          </Link>
        )}
      </div>
      <div className="space-y-3">
        {updates.map((update) => (
          <UpdateCard key={update.id} story={update} />
        ))}
      </div>
    </div>
  );
}
