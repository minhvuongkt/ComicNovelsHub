import { useState } from "react";
import { useLocation, useSearch } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Navbar } from "@/components/layout/navbar";
import { MobileNavbar } from "@/components/layout/mobile-navbar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ProfileForm } from "@/components/profile/profile-form";
import { ReadingHistoryList } from "@/components/profile/reading-history-list";
import { FavoritesList } from "@/components/profile/favorites-list";
import { SettingsForm } from "@/components/profile/settings-form";
import { PasswordForm } from "@/components/profile/password-form";
import { Pencil } from "lucide-react";
import { getInitials, getDefaultAvatarUrl, formatDate } from "@/lib/utils";

export default function ProfilePage() {
  const [location, navigate] = useLocation();
  const search = useSearch();
  const searchParams = new URLSearchParams(search);
  const tabParam = searchParams.get("tab") || "history";
  
  const [activeTab, setActiveTab] = useState<string>(tabParam);
  const { user } = useAuth();
  
  if (!user) {
    return null; // Protected route should handle redirect
  }
  
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    navigate(`/profile?tab=${value}`, { replace: true });
  };
  
  return (
    <div className="min-h-screen flex flex-col pb-16 md:pb-0">
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 pb-20 md:pb-8 pt-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          {/* Profile header */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex flex-col sm:flex-row items-center sm:items-start">
              <div className="relative mb-4 sm:mb-0 sm:mr-6">
                <Avatar className="h-24 w-24">
                  <AvatarImage 
                    src={user.avatar || getDefaultAvatarUrl(`${user.first_name} ${user.last_name}`)} 
                    alt={`${user.first_name} ${user.last_name}`} 
                  />
                  <AvatarFallback>{getInitials(user.first_name, user.last_name)}</AvatarFallback>
                </Avatar>
                <Button 
                  size="icon" 
                  className="absolute -bottom-1 -right-1 bg-primary hover:bg-primary-600 h-8 w-8 rounded-full"
                  onClick={() => handleTabChange("settings")}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              </div>
              <div className="text-center sm:text-left flex-grow">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {user.first_name} {user.last_name}
                </h1>
                <p className="text-gray-600 dark:text-gray-400">{user.email}</p>
                <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                  Member since: {formatDate(user.created_at)}
                </p>
                <div className="mt-3 flex justify-center sm:justify-start space-x-2">
                  <Button 
                    variant="outline" 
                    onClick={() => handleTabChange("profile")}
                  >
                    Edit Profile
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => handleTabChange("password")}
                  >
                    Change Password
                  </Button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Profile tabs */}
          <Tabs value={activeTab} onValueChange={handleTabChange}>
            <div className="border-b border-gray-200 dark:border-gray-700">
              <TabsList className="w-full justify-start p-0 h-auto bg-transparent">
                <TabsTrigger 
                  value="history" 
                  className="px-4 py-3 data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary dark:data-[state=active]:text-primary-400 rounded-none"
                >
                  Reading History
                </TabsTrigger>
                <TabsTrigger 
                  value="favorites" 
                  className="px-4 py-3 data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary dark:data-[state=active]:text-primary-400 rounded-none"
                >
                  Favorites
                </TabsTrigger>
                <TabsTrigger 
                  value="profile" 
                  className="px-4 py-3 data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary dark:data-[state=active]:text-primary-400 rounded-none"
                >
                  Profile
                </TabsTrigger>
                <TabsTrigger 
                  value="settings" 
                  className="px-4 py-3 data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary dark:data-[state=active]:text-primary-400 rounded-none"
                >
                  Settings
                </TabsTrigger>
                <TabsTrigger 
                  value="password" 
                  className="px-4 py-3 data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary dark:data-[state=active]:text-primary-400 rounded-none"
                >
                  Password
                </TabsTrigger>
              </TabsList>
            </div>
            
            <div className="p-4 sm:p-6">
              <TabsContent value="history">
                <ReadingHistoryList />
              </TabsContent>
              
              <TabsContent value="favorites">
                <FavoritesList />
              </TabsContent>
              
              <TabsContent value="profile">
                <ProfileForm user={user} />
              </TabsContent>
              
              <TabsContent value="settings">
                <SettingsForm />
              </TabsContent>
              
              <TabsContent value="password">
                <PasswordForm />
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </main>
      
      <MobileNavbar />
    </div>
  );
}
