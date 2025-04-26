import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FormControl, FormDescription, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Image, FileUp, File, Upload, X } from "lucide-react";

interface ChapterTypeSelectorProps {
  value: {
    chapter_type: string;
    content: string;
    images?: string[];
    font_family?: string;
  };
  onChange: (value: any) => void;
  error?: string;
}

const fontFamilyOptions = [
  { label: "Arial", value: "Arial, sans-serif" },
  { label: "Times New Roman", value: "Times New Roman, serif" },
  { label: "Georgia", value: "Georgia, serif" },
  { label: "Verdana", value: "Verdana, sans-serif" },
  { label: "Courier", value: "Courier, monospace" },
];

export function ChapterTypeSelector({ value, onChange, error }: ChapterTypeSelectorProps) {
  const [imageUrls, setImageUrls] = useState<string[]>(value.images || []);
  const [newImageUrl, setNewImageUrl] = useState("");
  
  const handleTabChange = (type: string) => {
    onChange({
      ...value,
      chapter_type: type,
    });
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange({
      ...value,
      content: e.target.value
    });
  };

  const handleFontFamilyChange = (fontFamily: string) => {
    onChange({
      ...value,
      font_family: fontFamily
    });
  };

  const addImageUrl = () => {
    if (newImageUrl && !imageUrls.includes(newImageUrl)) {
      const updatedUrls = [...imageUrls, newImageUrl];
      setImageUrls(updatedUrls);
      setNewImageUrl("");
      onChange({
        ...value,
        images: updatedUrls,
        content: updatedUrls.join("\n") // Store image URLs in content as well for compatibility
      });
    }
  };

  const removeImageUrl = (index: number) => {
    const updatedUrls = imageUrls.filter((_, i) => i !== index);
    setImageUrls(updatedUrls);
    onChange({
      ...value,
      images: updatedUrls,
      content: updatedUrls.join("\n") // Update content field as well for compatibility
    });
  };

  return (
    <FormItem className="w-full">
      <FormLabel>Chapter Type</FormLabel>
      <FormControl>
        <Tabs 
          defaultValue={value.chapter_type || "novel"}
          onValueChange={handleTabChange}
          className="w-full"
        >
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="novel">Novel</TabsTrigger>
            <TabsTrigger value="oneshot">Oneshot</TabsTrigger>
            <TabsTrigger value="comic">Comic</TabsTrigger>
          </TabsList>
          
          <TabsContent value="novel" className="space-y-4">
            <FormDescription>
              Text-based chapter content with formatting options
            </FormDescription>
            
            <div className="mb-4">
              <FormLabel>Font Family</FormLabel>
              <Select 
                value={value.font_family || fontFamilyOptions[0].value}
                onValueChange={handleFontFamilyChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a font" />
                </SelectTrigger>
                <SelectContent>
                  {fontFamilyOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <Textarea 
              value={value.content || ""} 
              onChange={handleContentChange}
              style={{ fontFamily: value.font_family || fontFamilyOptions[0].value }}
              className="min-h-[300px]"
              placeholder="Enter your novel content here..."
            />
          </TabsContent>
          
          <TabsContent value="oneshot" className="space-y-4">
            <FormDescription>
              1-2 images per chapter with minimal text
            </FormDescription>
            
            <div className="flex items-center space-x-2 mb-4">
              <Input
                type="text"
                placeholder="Enter image URL"
                value={newImageUrl}
                onChange={(e) => setNewImageUrl(e.target.value)}
              />
              <Button type="button" onClick={addImageUrl} size="sm">
                <FileUp className="h-4 w-4 mr-2" />
                Add
              </Button>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              {imageUrls.map((url, index) => (
                <Card key={index} className="relative overflow-hidden">
                  <Button 
                    type="button" 
                    variant="destructive" 
                    size="icon" 
                    className="absolute top-2 right-2 h-6 w-6"
                    onClick={() => removeImageUrl(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                  <CardContent className="p-2 pt-6">
                    <img src={url} alt={`Image ${index + 1}`} className="w-full h-auto rounded" />
                  </CardContent>
                </Card>
              ))}
              
              {imageUrls.length === 0 && (
                <div className="border border-dashed rounded-lg p-8 text-center">
                  <Image className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm text-gray-500">No images added yet</p>
                </div>
              )}
            </div>
            
            <div className="pt-4">
              <FormLabel>Additional Notes (Optional)</FormLabel>
              <Textarea 
                placeholder="Any additional notes for this oneshot chapter..."
                className="mt-2"
              />
            </div>
          </TabsContent>
          
          <TabsContent value="comic" className="space-y-4">
            <FormDescription>
              Multiple images that form a comic chapter
            </FormDescription>
            
            <div className="flex items-center space-x-2 mb-4">
              <Input
                type="text"
                placeholder="Enter image URL"
                value={newImageUrl}
                onChange={(e) => setNewImageUrl(e.target.value)}
              />
              <Button type="button" onClick={addImageUrl} size="sm">
                <FileUp className="h-4 w-4 mr-2" />
                Add
              </Button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {imageUrls.map((url, index) => (
                <Card key={index} className="relative overflow-hidden">
                  <Button 
                    type="button" 
                    variant="destructive" 
                    size="icon" 
                    className="absolute top-2 right-2 h-6 w-6"
                    onClick={() => removeImageUrl(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                  <CardContent className="p-2 pt-6">
                    <img src={url} alt={`Panel ${index + 1}`} className="w-full h-auto rounded" />
                  </CardContent>
                </Card>
              ))}
              
              {imageUrls.length === 0 && (
                <div className="border border-dashed rounded-lg p-8 text-center col-span-2">
                  <Image className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm text-gray-500">No comic panels added yet</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </FormControl>
      {error && <FormMessage>{error}</FormMessage>}
    </FormItem>
  );
}