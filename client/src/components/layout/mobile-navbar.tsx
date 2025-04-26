import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { SearchOverlay } from "./search-overlay";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Menu, 
  Search, 
  Home, 
  BookOpen, 
  Award, 
  Clock, 
  LogOut,
  Shield,
  User,
  Heart,
  Settings,
  History
} from "lucide-react";

export function MobileNavbar() {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  
  // Hide navbar in reading view
  if (location.startsWith("/reading")) {
    return null;
  }

  const initials = user 
    ? `${user.first_name?.charAt(0) || ""}${user.last_name?.charAt(0) || ""}`.toUpperCase()
    : "";
  
  return (
    <>
      <header className="sticky top-0 z-50 bg-white dark:bg-gray-800 shadow-sm md:hidden">
        <div className="px-4">
          <div className="flex justify-between items-center h-14">
            <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Menu">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[280px] sm:w-[350px] p-0">
                <div className="flex flex-col h-full">
                  <div className="p-4 border-b">
                    {user ? (
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={user.avatar || undefined} alt={`${user.first_name} ${user.last_name}`} />
                          <AvatarFallback>{initials}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{user.first_name} {user.last_name}</p>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                    ) : (
                      <Link href="/auth">
                        <Button className="w-full">Sign In</Button>
                      </Link>
                    )}
                  </div>
                  
                  <div className="flex-1 py-2 overflow-y-auto">
                    <nav className="space-y-1 px-2">
                      <Link href="/" onClick={() => setMenuOpen(false)}>
                        <Button
                          variant="ghost"
                          className={`w-full justify-start ${location === '/' ? 'bg-muted' : ''}`}
                        >
                          <Home className="mr-2 h-5 w-5" />
                          Home
                        </Button>
                      </Link>
                      
                      <Link href="/genres" onClick={() => setMenuOpen(false)}>
                        <Button
                          variant="ghost"
                          className={`w-full justify-start ${location === '/genres' ? 'bg-muted' : ''}`}
                        >
                          <BookOpen className="mr-2 h-5 w-5" />
                          Genres
                        </Button>
                      </Link>
                      
                      <Link href="/rankings" onClick={() => setMenuOpen(false)}>
                        <Button
                          variant="ghost"
                          className={`w-full justify-start ${location === '/rankings' ? 'bg-muted' : ''}`}
                        >
                          <Award className="mr-2 h-5 w-5" />
                          Rankings
                        </Button>
                      </Link>
                      
                      <Link href="/recent" onClick={() => setMenuOpen(false)}>
                        <Button
                          variant="ghost"
                          className={`w-full justify-start ${location === '/recent' ? 'bg-muted' : ''}`}
                        >
                          <Clock className="mr-2 h-5 w-5" />
                          Recent
                        </Button>
                      </Link>
                    </nav>
                    
                    {user && (
                      <>
                        <div className="mt-6 pt-6 border-t px-2">
                          <h3 className="px-3 text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Account
                          </h3>
                          <nav className="mt-2 space-y-1">
                            <Link href="/profile" onClick={() => setMenuOpen(false)}>
                              <Button
                                variant="ghost"
                                className={`w-full justify-start ${location === '/profile' ? 'bg-muted' : ''}`}
                              >
                                <User className="mr-2 h-5 w-5" />
                                Profile
                              </Button>
                            </Link>
                            
                            <Link href="/profile/favorites" onClick={() => setMenuOpen(false)}>
                              <Button
                                variant="ghost"
                                className={`w-full justify-start ${location === '/profile/favorites' ? 'bg-muted' : ''}`}
                              >
                                <Heart className="mr-2 h-5 w-5" />
                                Favorites
                              </Button>
                            </Link>
                            
                            <Link href="/profile/reading-history" onClick={() => setMenuOpen(false)}>
                              <Button
                                variant="ghost"
                                className={`w-full justify-start ${location === '/profile/reading-history' ? 'bg-muted' : ''}`}
                              >
                                <History className="mr-2 h-5 w-5" />
                                Reading History
                              </Button>
                            </Link>
                            
                            <Link href="/profile/settings" onClick={() => setMenuOpen(false)}>
                              <Button
                                variant="ghost"
                                className={`w-full justify-start ${location === '/profile/settings' ? 'bg-muted' : ''}`}
                              >
                                <Settings className="mr-2 h-5 w-5" />
                                Settings
                              </Button>
                            </Link>
                            
                            {user.role === "admin" && (
                              <Link href="/admin" onClick={() => setMenuOpen(false)}>
                                <Button
                                  variant="ghost"
                                  className={`w-full justify-start ${location.startsWith('/admin') ? 'bg-muted' : ''}`}
                                >
                                  <Shield className="mr-2 h-5 w-5" />
                                  Admin Dashboard
                                </Button>
                              </Link>
                            )}
                            
                            <Button
                              variant="ghost"
                              className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                              disabled={logoutMutation.isPending}
                              onClick={() => {
                                logoutMutation.mutate();
                                setMenuOpen(false);
                              }}
                            >
                              <LogOut className="mr-2 h-5 w-5" />
                              {logoutMutation.isPending ? "Logging out..." : "Log out"}
                            </Button>
                          </nav>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
            
            <Link href="/" className="flex items-center">
              <span className="text-primary font-bold text-xl">GocTruyenNho</span>
            </Link>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSearchOpen(true)}
              aria-label="Search"
            >
              <Search className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>
      
      <SearchOverlay isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}