import { useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { toast } from "@/hooks/use-toast";
import { Chapter, InsertChapter } from '@/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Image as ImageIcon, FileUp, X, Plus, Upload, Loader2 } from "lucide-react";

interface ChapterFormProps {
  storyId: number;
  chapter?: Chapter;
  onSubmit: (data: InsertChapter) => void;
  isSubmitting: boolean;
  mode: 'create' | 'edit';
}

const fontFamilyOptions = [
  { label: "Arial", value: "Arial, sans-serif" },
  { label: "Times New Roman", value: "Times New Roman, serif" },
  { label: "Georgia", value: "Georgia, serif" },
  { label: "Verdana", value: "Verdana, sans-serif" },
  { label: "Courier", value: "Courier, monospace" },
];

// Create schema for chapter form
const chapterSchema = z.object({
  title: z.string().min(1, "Title is required"),
  chapter_number: z.preprocess(
    (val) => (val === "" ? undefined : Number(val)),
    z.number({ required_error: "Chapter number is required" })
  ),
  story_id: z.number(),
  content: z.string().default(""),
  chapter_type: z.string().default("novel"),
  font_family: z.string().default("Arial, sans-serif"),
  images: z.string().default("[]"),
});

type ChapterFormValues = z.infer<typeof chapterSchema>;

export function ChapterForm({ storyId, chapter, onSubmit, isSubmitting, mode }: ChapterFormProps) {
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  
  // Initialize form with values
  const form = useForm<ChapterFormValues>({
    resolver: zodResolver(chapterSchema),
    defaultValues: chapter ? {
      ...chapter,
      story_id: storyId,
      images: typeof chapter.images === 'string' ? chapter.images : JSON.stringify(chapter.images),
    } : {
      title: '',
      chapter_number: chapter?.chapter_number || undefined,
      story_id: storyId,
      content: '',
      chapter_type: 'novel',
      font_family: 'Arial, sans-serif',
      images: '[]',
    }
  });
  
  // Parse images from string to array when component mounts
  useEffect(() => {
    if (chapter?.images) {
      try {
        const parsedImages = typeof chapter.images === 'string' 
          ? JSON.parse(chapter.images) 
          : Array.isArray(chapter.images) 
            ? chapter.images 
            : [];
        setImageUrls(Array.isArray(parsedImages) ? parsedImages : []);
      } catch (e) {
        console.error("Error parsing images:", e);
        setImageUrls([]);
      }
    }
  }, [chapter]);
  
  // Watch for changes in the chapter_type field
  const chapterType = form.watch('chapter_type');
  
  // Setup dropzone for image uploads
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
    },
    onDrop: (acceptedFiles) => {
      // In a production environment, you would upload these files to a server
      // and get back URLs. For demo purposes, we'll create Object URLs.
      const newUrls = acceptedFiles.map(file => URL.createObjectURL(file));
      const updatedUrls = [...imageUrls, ...newUrls];
      setImageUrls(updatedUrls);
      form.setValue('images', JSON.stringify(updatedUrls));
    }
  });
  
  // Handler to remove an image
  const handleRemoveImage = (index: number) => {
    const updatedUrls = imageUrls.filter((_, i) => i !== index);
    setImageUrls(updatedUrls);
    form.setValue('images', JSON.stringify(updatedUrls));
  };
  
  // Reorder images with drag-and-drop
  const handleMoveImage = (dragIndex: number, hoverIndex: number) => {
    const draggedImage = imageUrls[dragIndex];
    const updatedUrls = [...imageUrls];
    updatedUrls.splice(dragIndex, 1);
    updatedUrls.splice(hoverIndex, 0, draggedImage);
    setImageUrls(updatedUrls);
    form.setValue('images', JSON.stringify(updatedUrls));
  };
  
  // Handler for form submission
  const handleSubmit = (values: ChapterFormValues) => {
    // Ensure image array is serialized properly
    const formattedValues = {
      ...values,
      images: JSON.stringify(imageUrls)
    };
    
    onSubmit(formattedValues as InsertChapter);
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Chapter Title</FormLabel>
                <FormControl>
                  <Input placeholder="Enter chapter title" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="chapter_number"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Chapter Number</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="Enter chapter number" 
                    {...field}
                    onChange={(e) => {
                      field.onChange(e.target.value === "" ? "" : Number(e.target.value));
                    }}
                    value={field.value ?? ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="chapter_type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Chapter Type</FormLabel>
              <FormControl>
                <Tabs 
                  value={field.value || 'novel'}
                  onValueChange={field.onChange}
                  className="w-full"
                >
                  <TabsList className="grid grid-cols-3 mb-4">
                    <TabsTrigger value="novel">Novel</TabsTrigger>
                    <TabsTrigger value="oneshot">Oneshot</TabsTrigger>
                    <TabsTrigger value="comic">Comic</TabsTrigger>
                  </TabsList>
                  
                  {/* Novel Content */}
                  <TabsContent value="novel" className="space-y-4">
                    <FormField
                      control={form.control}
                      name="font_family"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Font Family</FormLabel>
                          <Select 
                            value={field.value || fontFamilyOptions[0].value}
                            onValueChange={field.onChange}
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
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="content"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Chapter Content</FormLabel>
                          <FormControl>
                            <Textarea 
                              style={{ fontFamily: form.watch('font_family') || fontFamilyOptions[0].value }}
                              className="min-h-[300px]"
                              placeholder="Enter your novel content here..."
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </TabsContent>
                  
                  {/* Oneshot Content */}
                  <TabsContent value="oneshot" className="space-y-4">
                    <div className="mb-4">
                      <FormLabel>Upload Images</FormLabel>
                      <div
                        {...getRootProps()} 
                        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                          isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/20 hover:border-primary/50'
                        }`}
                      >
                        <input {...getInputProps()} />
                        <div className="flex flex-col items-center justify-center space-y-2">
                          <Upload className="h-8 w-8 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">
                            {isDragActive ? 'Drop images here' : 'Drag & drop images here, or click to select files'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Oneshots typically have 1-2 high-quality images
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-4">
                      {imageUrls.map((url, index) => (
                        <Card key={index} className="relative overflow-hidden group">
                          <Button 
                            type="button" 
                            variant="destructive" 
                            size="icon" 
                            className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => handleRemoveImage(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                          <CardContent className="p-2">
                            <img src={url} alt={`Image ${index + 1}`} className="w-full h-auto rounded" />
                          </CardContent>
                        </Card>
                      ))}
                      
                      {imageUrls.length === 0 && (
                        <div className="border border-dashed rounded-lg p-8 text-center">
                          <ImageIcon className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">No images added yet</p>
                        </div>
                      )}
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="content"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Additional Notes (Optional)</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Any additional notes for this oneshot chapter..."
                              className="mt-2"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </TabsContent>
                  
                  {/* Comic Content */}
                  <TabsContent value="comic" className="space-y-4">
                    <div className="mb-4">
                      <FormLabel>Upload Comic Panels</FormLabel>
                      <div
                        {...getRootProps()} 
                        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                          isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/20 hover:border-primary/50'
                        }`}
                      >
                        <input {...getInputProps()} />
                        <div className="flex flex-col items-center justify-center space-y-2">
                          <Upload className="h-8 w-8 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">
                            {isDragActive ? 'Drop comic panels here' : 'Drag & drop comic panels here, or click to select files'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Upload individual comic panels in the correct reading order
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      {imageUrls.map((url, index) => (
                        <Card key={index} className="relative overflow-hidden group">
                          <div className="absolute top-0 left-0 right-0 bg-black/50 text-white text-xs font-medium px-2 py-1">
                            Panel {index + 1}
                          </div>
                          <Button 
                            type="button" 
                            variant="destructive" 
                            size="icon" 
                            className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => handleRemoveImage(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                          <CardContent className="p-2">
                            <img src={url} alt={`Panel ${index + 1}`} className="w-full h-auto rounded" />
                          </CardContent>
                        </Card>
                      ))}
                      
                      {imageUrls.length === 0 && (
                        <div className="border border-dashed rounded-lg p-8 text-center col-span-full">
                          <ImageIcon className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">No comic panels added yet</p>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : mode === 'create' ? 'Create Chapter' : 'Update Chapter'}
        </Button>
      </form>
    </Form>
  );
}