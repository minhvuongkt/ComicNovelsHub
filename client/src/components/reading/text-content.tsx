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
import { Settings } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";

type TextContentProps = {
  content: string;
  title: string;
  fontFamily?: string;
};

export function TextContent({ content, title, fontFamily: initialFontFamily }: TextContentProps) {
  const [fontSize, setFontSize] = useState(16);
  const [lineHeight, setLineHeight] = useState(1.6);
  const [selectedFontFamily, setSelectedFontFamily] = useState<"serif" | "sans-serif" | "monospace">("sans-serif");
  
  // Get the default font family from the chapter or use the selected one from UI
  const fontFamilyMap = {
    "serif": "'Georgia', serif",
    "sans-serif": "'Nunito', sans-serif",
    "monospace": "'JetBrains Mono', monospace",
    "default": initialFontFamily || "'Nunito', sans-serif"
  };
  
  const textStyles = {
    fontSize: `${fontSize}px`,
    lineHeight: lineHeight,
    fontFamily: initialFontFamily || fontFamilyMap[selectedFontFamily]
  };
  
  return (
    <div className="chapter-content">
      <div className="sticky top-14 z-20 bg-white dark:bg-gray-800 p-2 border-b border-gray-200 dark:border-gray-700 flex justify-end">
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
                <div className="flex justify-between items-center">
                  <Label>Font Size: {fontSize}px</Label>
                </div>
                <Slider
                  value={[fontSize]}
                  min={12}
                  max={24}
                  step={1}
                  onValueChange={(value) => setFontSize(value[0])}
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label>Line Height: {lineHeight.toFixed(1)}</Label>
                </div>
                <Slider
                  value={[lineHeight * 10]}
                  min={10}
                  max={25}
                  step={1}
                  onValueChange={(value) => setLineHeight(value[0] / 10)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="font-family">Font Family</Label>
                <Select
                  value={selectedFontFamily}
                  onValueChange={(value) => setSelectedFontFamily(value as "serif" | "sans-serif" | "monospace")}
                >
                  <SelectTrigger id="font-family">
                    <SelectValue placeholder="Font family" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="serif">Serif</SelectItem>
                    <SelectItem value="sans-serif">Sans-serif</SelectItem>
                    <SelectItem value="monospace">Monospace</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="dark-reading-mode">Dark Mode</Label>
                <Switch 
                  id="dark-reading-mode" 
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
      
      <div 
        className="prose prose-lg dark:prose-invert max-w-none mt-4"
        style={textStyles}
        dangerouslySetInnerHTML={{ __html: content }}
      />
    </div>
  );
}
