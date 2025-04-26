import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X, Search as SearchIcon, Clock } from "lucide-react";
import { debounce } from "@/lib/utils";

type SearchOverlayProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function SearchOverlay({ isOpen, onClose }: SearchOverlayProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const [, setLocation] = useLocation();
  
  // Load recent searches from localStorage
  useEffect(() => {
    const savedSearches = localStorage.getItem("recentSearches");
    if (savedSearches) {
      setRecentSearches(JSON.parse(savedSearches));
    }
  }, []);
  
  // Save recent searches to localStorage
  const saveSearch = (term: string) => {
    if (term.trim() === "") return;
    
    const updatedSearches = [
      term,
      ...recentSearches.filter(s => s !== term)
    ].slice(0, 5);
    
    setRecentSearches(updatedSearches);
    localStorage.setItem("recentSearches", JSON.stringify(updatedSearches));
  };
  
  // Remove a search from history
  const removeSearch = (term: string) => {
    const updatedSearches = recentSearches.filter(s => s !== term);
    setRecentSearches(updatedSearches);
    localStorage.setItem("recentSearches", JSON.stringify(updatedSearches));
  };
  
  // Handle search submission
  const handleSearch = () => {
    if (searchTerm.trim() === "") return;
    saveSearch(searchTerm);
    setLocation(`/search?q=${encodeURIComponent(searchTerm)}`);
    onClose();
  };
  
  // Focus input when overlay opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);
  
  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-start pt-20 px-4" onClick={onClose}>
      <div className="w-full max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-xl overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center">
          <SearchIcon className="text-gray-500 mr-2 h-5 w-5" />
          <Input
            ref={inputRef}
            type="text"
            placeholder="Search stories, authors, genres..."
            className="w-full bg-transparent border-none focus:ring-0"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            autoFocus
          />
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        <div className="p-4 max-h-96 overflow-y-auto">
          {recentSearches.length > 0 && (
            <>
              <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">Recent Searches</div>
              <div className="space-y-2">
                {recentSearches.map((term, index) => (
                  <div key={index} className="flex items-center p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md">
                    <Clock className="text-gray-400 mr-2 h-4 w-4" />
                    <span className="flex-grow">{term}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeSearch(term);
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
