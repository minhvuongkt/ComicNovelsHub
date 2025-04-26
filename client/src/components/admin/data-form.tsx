import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";

type FieldType = {
  name: string;
  label: string;
  type: "text" | "textarea" | "number" | "select";
  required?: boolean;
  endpoint?: string;
  labelKey?: string;
  valueKey?: string;
  options?: { label: string; value: string | number }[];
  multiple?: boolean;
};

interface DataFormProps {
  fields: FieldType[];
  onSubmit: (data: any) => void;
  initialValues?: any;
  isSubmitting?: boolean;
  submitText?: string;
}

export function DataForm({
  fields,
  onSubmit,
  initialValues = {},
  isSubmitting = false,
  submitText = "Submit",
}: DataFormProps) {
  // Create a dynamic Zod schema based on fields
  const formSchema = z.object(
    fields.reduce(
      (acc, field) => {
        let schema;
        if (field.type === "number") {
          schema = z.preprocess(
            (val) => (val === "" ? undefined : Number(val)),
            z.number().optional()
          );
        } else if (field.type === "select" && field.multiple) {
          // For multiple select fields, expect an array of values
          schema = z.array(z.string()).optional().default([]);
        } else if (field.type === "select") {
          // For single select fields, accept either string or number but store as string
          schema = field.required
            ? z.string().min(1, `${field.label} is required`)
            : z.preprocess(
                (val) => val === null || val === undefined ? undefined : String(val),
                z.string().optional()
              );
        } else {
          schema = field.required
            ? z.string().min(1, `${field.label} is required`)
            : z.string().optional();
        }
        return { ...acc, [field.name]: schema };
      },
      {} as Record<string, any>
    )
  );

  // Initialize form with initial values
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: initialValues,
  });

  // Reset form when initialValues change
  useEffect(() => {
    form.reset(initialValues);
  }, [form, initialValues]);

  // Function to render the appropriate input type
  const renderField = (field: FieldType & { onChange: (...event: any[]) => void; value: any; }) => {
    switch (field.type) {
      case "textarea":
        return (
          <Textarea
            placeholder={`Enter ${field.label.toLowerCase()}`}
            className="resize-none min-h-[100px]"
            value={field.value || ""}
            onChange={field.onChange}
          />
        );
      case "select":
        if (field.endpoint) {
          return <SelectWithEndpoint field={field} />;
        } else if (field.options) {
          return (
            <Select
              value={field.value ? String(field.value) : undefined}
              onValueChange={field.onChange}
            >
              <SelectTrigger>
                <SelectValue placeholder={`Select ${field.label.toLowerCase()}`} />
              </SelectTrigger>
              <SelectContent>
                {field.options.map((option) => (
                  <SelectItem key={option.value} value={String(option.value)}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          );
        }
        return <Input type="text" value={field.value || ""} onChange={field.onChange} />;
      case "number":
        return <Input 
          type="number" 
          value={field.value === 0 ? "0" : (field.value || "")} 
          onChange={(e) => {
            const value = e.target.value === "" ? "" : Number(e.target.value);
            field.onChange(value);
          }}
        />;
      default:
        return <Input 
          type="text" 
          placeholder={`Enter ${field.label.toLowerCase()}`} 
          value={field.value || ""} 
          onChange={field.onChange}
        />;
    }
  };

  // Component for Select with API endpoint
  function SelectWithEndpoint({ field }: { field: FieldType & { onChange: (...event: any[]) => void; value: any; } }) {
    const { data = [], isLoading } = useQuery<any[]>({
      queryKey: [field.endpoint!],
      enabled: !!field.endpoint,
    });
    
    // If multiple selection is enabled
    if (field.multiple) {
      // Convert value to array if it exists, or use empty array
      const selectedValues = Array.isArray(field.value) ? field.value : (field.value ? [field.value] : []);
      
      return (
        <div className="space-y-2">
          <div className="flex flex-wrap gap-1 p-2 border rounded">
            {selectedValues.length > 0 ? (
              selectedValues.map((value) => {
                const item = data.find((d) => String(d[field.valueKey || "id"]) === String(value));
                return item ? (
                  <div key={value} className="bg-primary/10 text-primary px-2 py-1 rounded-md text-sm flex items-center">
                    {item[field.labelKey || "name"]}
                    <button 
                      type="button"
                      className="ml-1 hover:text-destructive"
                      onClick={() => {
                        const newValues = selectedValues.filter((v) => v !== value);
                        field.onChange(newValues);
                      }}
                    >
                      ×
                    </button>
                  </div>
                ) : null;
              })
            ) : (
              <div className="text-muted-foreground py-1 px-2 text-sm">
                {isLoading ? "Loading..." : `Select ${field.label.toLowerCase()}`}
              </div>
            )}
          </div>
          
          <Select
            value=""
            onValueChange={(newValue) => {
              // Don't add duplicates
              if (!selectedValues.includes(newValue)) {
                field.onChange([...selectedValues, newValue]);
              }
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder={isLoading ? "Loading..." : `Add ${field.label.toLowerCase()}...`} />
            </SelectTrigger>
            <SelectContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              ) : (
                data
                  // Filter out already selected items
                  .filter((item) => !selectedValues.includes(String(item[field.valueKey || "id"])))
                  .map((item) => (
                    <SelectItem 
                      key={item[field.valueKey || "id"]} 
                      value={String(item[field.valueKey || "id"])}
                    >
                      {item[field.labelKey || "name"]}
                    </SelectItem>
                  ))
              )}
            </SelectContent>
          </Select>
        </div>
      );
    }
    
    // Regular single selection
    return (
      <Select
        value={field.value ? String(field.value) : undefined}
        onValueChange={field.onChange}
      >
        <SelectTrigger>
          <SelectValue placeholder={isLoading ? "Loading..." : `Select ${field.label.toLowerCase()}`} />
        </SelectTrigger>
        <SelectContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-2">
              <Loader2 className="h-4 w-4 animate-spin" />
            </div>
          ) : (
            data.map((item) => (
              <SelectItem 
                key={item[field.valueKey || "id"]} 
                value={String(item[field.valueKey || "id"])}
              >
                {item[field.labelKey || "name"]}
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {fields.map((field) => (
          <FormField
            key={field.name}
            control={form.control}
            name={field.name}
            render={({ field: formField }) => (
              <FormItem>
                <FormLabel>{field.label}</FormLabel>
                <FormControl>{renderField({ ...field, ...formField })}</FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        ))}

        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            submitText
          )}
        </Button>
      </form>
    </Form>
  );
}