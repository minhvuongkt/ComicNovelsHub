import { useLocation, Link } from "wouter";
import { Home, BookOpen, TrendingUp, History, User } from "lucide-react";

export function MobileNavbar() {
  const [location] = useLocation();
  
  // Hide mobile navbar in reading view
  if (location.startsWith("/reading")) {
    return null;
  }
  
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
      <div className="grid grid-cols-5 h-16">
        <Link href="/" className={`flex flex-col items-center justify-center ${location === '/' ? 'text-primary dark:text-primary-400' : 'text-gray-500 dark:text-gray-400'}`}>
          <Home className="h-5 w-5" />
          <span className="text-xs mt-1">Home</span>
        </Link>
        <Link href="/genres" className={`flex flex-col items-center justify-center ${location === '/genres' ? 'text-primary dark:text-primary-400' : 'text-gray-500 dark:text-gray-400'}`}>
          <BookOpen className="h-5 w-5" />
          <span className="text-xs mt-1">Genres</span>
        </Link>
        <Link href="/rankings" className={`flex flex-col items-center justify-center ${location === '/rankings' ? 'text-primary dark:text-primary-400' : 'text-gray-500 dark:text-gray-400'}`}>
          <TrendingUp className="h-5 w-5" />
          <span className="text-xs mt-1">Rankings</span>
        </Link>
        <Link href="/recent" className={`flex flex-col items-center justify-center ${location === '/recent' ? 'text-primary dark:text-primary-400' : 'text-gray-500 dark:text-gray-400'}`}>
          <History className="h-5 w-5" />
          <span className="text-xs mt-1">Recent</span>
        </Link>
        <Link href="/profile" className={`flex flex-col items-center justify-center ${location === '/profile' ? 'text-primary dark:text-primary-400' : 'text-gray-500 dark:text-gray-400'}`}>
          <User className="h-5 w-5" />
          <span className="text-xs mt-1">Profile</span>
        </Link>
      </div>
    </div>
  );
}
