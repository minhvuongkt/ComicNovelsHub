import { ReactNode } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation, useRoute, Redirect } from "wouter";
import { Loader2 } from "lucide-react";
import { AdminSidebar } from "./sidebar";

type AdminLayoutProps = {
  children: ReactNode;
};

export function AdminLayout({ children }: AdminLayoutProps) {
  const { user, isLoading } = useAuth();
  const [location] = useLocation();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (!user) {
    return <Redirect to="/auth" />;
  }
  
  if (user.role !== "admin") {
    return <Redirect to="/" />;
  }
  
  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900">
      <AdminSidebar />
      
      <div className="flex-1 overflow-auto">
        <main className="container mx-auto py-6 px-4 sm:px-6 mb-12">
          {children}
        </main>
      </div>
    </div>
  );
}
