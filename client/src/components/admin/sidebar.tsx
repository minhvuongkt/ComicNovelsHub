import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/ui/theme-provider";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getInitials, getDefaultAvatarUrl } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  User,
  UsersRound,
  BookMarked,
  MessagesSquare,
  Flag,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Moon,
  Sun,
  Tag,
} from "lucide-react";

export function AdminSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();
  const { theme, setTheme } = useTheme();
  
  if (!user) return null;
  
  const handleLogout = () => {
    logoutMutation.mutate();
  };
  
  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };
  
  const isActive = (path: string) => {
    return location === path;
  };
  
  const menuItems = [
    { name: "Dashboard", path: "/admin", icon: <LayoutDashboard className="h-5 w-5" /> },
    { name: "Users", path: "/admin/users", icon: <Users className="h-5 w-5" /> },
    { name: "Stories", path: "/admin/stories", icon: <BookOpen className="h-5 w-5" /> },
    { name: "Authors", path: "/admin/authors", icon: <User className="h-5 w-5" /> },
    { name: "Translation Groups", path: "/admin/groups", icon: <UsersRound className="h-5 w-5" /> },
    { name: "Genres", path: "/admin/genres", icon: <Tag className="h-5 w-5" /> },
    { name: "Comments", path: "/admin/comments", icon: <MessagesSquare className="h-5 w-5" /> },
    { name: "Reports", path: "/admin/reports", icon: <Flag className="h-5 w-5" /> },
  ];
  
  return (
    <div 
      className={`bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col h-screen ${
        collapsed ? "w-[70px]" : "w-[280px]"
      } transition-all duration-300 z-20`}
    >
      <div className="h-16 border-b border-gray-200 dark:border-gray-700 flex items-center px-4 justify-between">
        <Link href="/admin" className="flex items-center">
          {!collapsed && (
            <span className="text-xl font-bold text-primary">GocTruyenNho</span>
          )}
          {collapsed && <BookMarked className="h-6 w-6 text-primary" />}
        </Link>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="h-8 w-8"
        >
          {collapsed ? (
            <ChevronRight className="h-5 w-5" />
          ) : (
            <ChevronLeft className="h-5 w-5" />
          )}
        </Button>
      </div>
      
      <ScrollArea className="flex-1">
        <div className="py-4 px-2">
          <div className="mb-4 px-2">
            <p className={`text-xs text-gray-500 mb-2 ${collapsed ? "sr-only" : ""}`}>Main</p>
            <nav className="space-y-1">
              {menuItems.map((item) => (
                <Link key={item.path} href={item.path}>
                  <div
                    className={`flex items-center rounded-md px-3 py-2 text-sm font-medium ${
                      isActive(item.path)
                        ? "bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/30"
                    } cursor-pointer`}
                  >
                    <span className="mr-3">{item.icon}</span>
                    {!collapsed && <span>{item.name}</span>}
                  </div>
                </Link>
              ))}
            </nav>
          </div>
          
          <Separator className="my-4" />
          
          <div className="px-2">
            <p className={`text-xs text-gray-500 mb-2 ${collapsed ? "sr-only" : ""}`}>Settings</p>
            <nav className="space-y-1">
              <button
                className="flex items-center rounded-md px-3 py-2 text-sm font-medium w-full text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/30"
                onClick={toggleTheme}
              >
                <span className="mr-3">
                  {theme === "dark" ? (
                    <Sun className="h-5 w-5" />
                  ) : (
                    <Moon className="h-5 w-5" />
                  )}
                </span>
                {!collapsed && (
                  <span>{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>
                )}
              </button>
              
              <Link href="/">
                <div className="flex items-center rounded-md px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/30 cursor-pointer">
                  <span className="mr-3">
                    <BookOpen className="h-5 w-5" />
                  </span>
                  {!collapsed && <span>Reader Site</span>}
                </div>
              </Link>
              
              <button
                className="flex items-center rounded-md px-3 py-2 text-sm font-medium w-full text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                onClick={handleLogout}
              >
                <span className="mr-3">
                  <LogOut className="h-5 w-5" />
                </span>
                {!collapsed && <span>Logout</span>}
              </button>
            </nav>
          </div>
        </div>
      </ScrollArea>
      
      <div className={`p-3 border-t border-gray-200 dark:border-gray-700 flex items-center ${collapsed ? "justify-center" : "justify-between"}`}>
        <div className="flex items-center">
          <Avatar className="h-8 w-8">
            <AvatarImage 
              src={user.avatar || getDefaultAvatarUrl(`${user.first_name} ${user.last_name}`)} 
              alt={`${user.first_name} ${user.last_name}`} 
            />
            <AvatarFallback>{getInitials(user.first_name, user.last_name)}</AvatarFallback>
          </Avatar>
          {!collapsed && (
            <div className="ml-2">
              <p className="text-sm font-medium">{`${user.first_name} ${user.last_name}`}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Admin</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
