import { ReactNode } from "react";
import { Navbar } from "./navbar";
import { MobileNavbar } from "./mobile-navbar";
import { useIsMobile } from "@/hooks/use-mobile";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const isMobile = useIsMobile();
  
  return (
    <div className="flex flex-col min-h-screen">
      {isMobile ? <MobileNavbar /> : <Navbar />}
      <main className="flex-grow">{children}</main>
      <footer className="bg-gray-100 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <h2 className="text-lg font-bold text-primary">GocTruyenNho</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Your go-to platform for reading comics and novels online.
              </p>
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              &copy; {new Date().getFullYear()} GocTruyenNho. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}