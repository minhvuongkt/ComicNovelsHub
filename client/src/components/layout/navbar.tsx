import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useTheme } from "@/components/ui/theme-provider";
import { Button } from "@/components/ui/button";
import { SearchOverlay } from "./search-overlay";
import { UserMenu } from "./user-menu";
import { Moon, Sun, Search } from "lucide-react";

export function Navbar() {
  const [location] = useLocation();
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const [searchOpen, setSearchOpen] = useState(false);
  
  // Hide navbar in reading view
  if (location.startsWith("/reading")) {
    return null;
  }
  
  return (
    <>
      <header className="sticky top-0 z-50 bg-white dark:bg-gray-800 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            {/* Logo and navigation for desktop */}
            <div className="flex items-center space-x-4">
              <Link href="/" className="flex items-center">
                <span className="text-primary font-bold text-2xl">GocTruyenNho</span>
              </Link>
              <nav className="hidden md:flex items-center space-x-4">
                <Link href="/" className={`text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary-400 px-3 py-2 rounded-md text-sm font-medium ${location === '/' ? 'text-primary dark:text-primary-400' : ''}`}>
                  Home
                </Link>
                <Link href="/genres" className={`text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary-400 px-3 py-2 rounded-md text-sm font-medium ${location === '/genres' ? 'text-primary dark:text-primary-400' : ''}`}>
                  Genres
                </Link>
                <Link href="/rankings" className={`text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary-400 px-3 py-2 rounded-md text-sm font-medium ${location === '/rankings' ? 'text-primary dark:text-primary-400' : ''}`}>
                  Rankings
                </Link>
                <Link href="/recent" className={`text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary-400 px-3 py-2 rounded-md text-sm font-medium ${location === '/recent' ? 'text-primary dark:text-primary-400' : ''}`}>
                  Recent
                </Link>
              </nav>
            </div>

            {/* Search and user actions */}
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSearchOpen(true)}
                aria-label="Search"
              >
                <Search className="h-5 w-5" />
              </Button>
              
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                aria-label="Toggle theme"
              >
                {theme === "dark" ? (
                  <Sun className="h-5 w-5" />
                ) : (
                  <Moon className="h-5 w-5" />
                )}
              </Button>
              
              {user ? (
                <UserMenu user={user} />
              ) : (
                <Link href="/auth">
                  <Button variant="default" size="sm">
                    Sign In
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>
      
      <SearchOverlay isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
