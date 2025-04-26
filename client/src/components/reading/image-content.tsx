import { useState } from "react";
import { 
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ImageIcon, Settings } from "lucide-react";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

type ImageContentProps = {
  images: string[];
  title: string;
};

type ViewMode = "continuous" | "single";

export function ImageContent({ images, title }: ImageContentProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("continuous");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [quality, setQuality] = useState<"high" | "medium" | "low">("high");
  
  // When in continuous mode, display all images
  // When in single mode, display only the current image and add navigation
  
  const handlePrevImage = () => {
    if (currentImageIndex > 0) {
      setCurrentImageIndex(prev => prev - 1);
      // Scroll to top when changing images in single mode
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };
  
  const handleNextImage = () => {
    if (currentImageIndex < images.length - 1) {
      setCurrentImageIndex(prev => prev + 1);
      // Scroll to top when changing images in single mode
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };
  
  const getImageQualityClass = () => {
    switch (quality) {
      case "medium":
        return "filter-none"; // No filter for medium quality
      case "low":
        return "filter blur-[0.5px]"; // Slight blur for low quality (saves bandwidth)
      case "high":
      default:
        return "filter-none"; // No filter for high quality
    }
  };
  
  return (
    <div className="chapter-content">
      <div className="sticky top-14 z-20 bg-white dark:bg-gray-800 p-2 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
        <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {viewMode === "single" && (
            <span>Page {currentImageIndex + 1} of {images.length}</span>
          )}
          {viewMode === "continuous" && (
            <span>{images.length} Pages</span>
          )}
        </div>
        
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="sm" className="flex items-center">
              <Settings className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Reading Settings</span>
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Reading Settings</SheetTitle>
              <SheetDescription>
                Customize your reading experience for {title}
              </SheetDescription>
            </SheetHeader>
            
            <div className="py-4 space-y-6">
              <div className="space-y-2">
                <Label htmlFor="view-mode">View Mode</Label>
                <Select
                  value={viewMode}
                  onValueChange={(value) => setViewMode(value as ViewMode)}
                >
                  <SelectTrigger id="view-mode">
                    <SelectValue placeholder="View mode" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="continuous">Continuous Scrolling</SelectItem>
                    <SelectItem value="single">Single Page</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="image-quality">Image Quality</Label>
                <Select
                  value={quality}
                  onValueChange={(value) => setQuality(value as "high" | "medium" | "low")}
                >
                  <SelectTrigger id="image-quality">
                    <SelectValue placeholder="Image quality" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">High Quality</SelectItem>
                    <SelectItem value="medium">Medium Quality (Save Data)</SelectItem>
                    <SelectItem value="low">Low Quality (Save Data)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="dark-reading-bg">Dark Background</Label>
                <Switch 
                  id="dark-reading-bg" 
                  checked={document.documentElement.classList.contains("dark")}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      document.documentElement.classList.add("dark");
                      localStorage.setItem("goctruyennho-theme", "dark");
                    } else {
                      document.documentElement.classList.remove("dark");
                      localStorage.setItem("goctruyennho-theme", "light");
                    }
                  }}
                />
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
      
      {viewMode === "continuous" ? (
        // Continuous scrolling view
        <div className="space-y-2 mt-2">
          {images.map((image, index) => (
            <div key={index} className="w-full">
              <img 
                src={image} 
                alt={`Page ${index + 1}`} 
                className={`w-full ${getImageQualityClass()}`}
                loading="lazy"
              />
            </div>
          ))}
        </div>
      ) : (
        // Single page view with navigation
        <div className="mt-2">
          {images.length > 0 ? (
            <>
              <div className="w-full flex justify-center">
                <img 
                  src={images[currentImageIndex]} 
                  alt={`Page ${currentImageIndex + 1}`} 
                  className={`w-full ${getImageQualityClass()}`}
                />
              </div>
              
              <div className="flex justify-between mt-4 space-x-2">
                <Button
                  variant="outline"
                  onClick={handlePrevImage}
                  disabled={currentImageIndex === 0}
                  className="flex-1"
                >
                  Previous Page
                </Button>
                <Button
                  variant="outline"
                  onClick={handleNextImage}
                  disabled={currentImageIndex === images.length - 1}
                  className="flex-1"
                >
                  Next Page
                </Button>
              </div>
            </>
          ) : (
            <div className="p-8 text-center bg-gray-100 dark:bg-gray-800 rounded-lg">
              <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-2 text-gray-500 dark:text-gray-400">No images available for this chapter.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
