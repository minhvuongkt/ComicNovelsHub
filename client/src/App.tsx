import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/use-auth";
import { ThemeProvider } from "@/components/ui/theme-provider";

import HomePage from "@/pages/home-page";
import AuthPage from "@/pages/auth-page";
import StoryDetailsPage from "@/pages/story-details-page";
import ReadingPage from "@/pages/reading-page";
import ProfilePage from "@/pages/profile-page";
import NotFound from "@/pages/not-found";

import AdminDashboard from "@/pages/admin/dashboard";
import AdminUsers from "@/pages/admin/users";
import AdminStories from "@/pages/admin/stories";
import AdminAuthors from "@/pages/admin/authors";
import AdminGroups from "@/pages/admin/groups";
import AdminGenres from "@/pages/admin/genres";
import AdminComments from "@/pages/admin/comments";
import AdminReports from "@/pages/admin/reports";

import { ProtectedRoute } from "./lib/protected-route";

function Router() {
  return (
    <Switch>
      {/* Public routes */}
      <Route path="/" component={HomePage} />
      <Route path="/auth" component={AuthPage} />
      <Route path="/stories/:id" component={StoryDetailsPage} />
      <Route path="/reading/:storyId/:chapterId" component={ReadingPage} />
      
      {/* Protected routes */}
      <ProtectedRoute path="/profile" component={ProfilePage} />
      
      {/* Admin routes */}
      <ProtectedRoute path="/admin" component={AdminDashboard} adminOnly />
      <ProtectedRoute path="/admin/users" component={AdminUsers} adminOnly />
      <ProtectedRoute path="/admin/stories" component={AdminStories} adminOnly />
      <ProtectedRoute path="/admin/authors" component={AdminAuthors} adminOnly />
      <ProtectedRoute path="/admin/groups" component={AdminGroups} adminOnly />
      <ProtectedRoute path="/admin/genres" component={AdminGenres} adminOnly />
      <ProtectedRoute path="/admin/comments" component={AdminComments} adminOnly />
      <ProtectedRoute path="/admin/reports" component={AdminReports} adminOnly />
      
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="goctruyennho-theme">
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
