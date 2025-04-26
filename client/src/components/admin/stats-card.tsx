import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowDownIcon, ArrowUpIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: number;
  description?: string;
  icon?: ReactNode;
  trend?: number;
  trendType?: "positive" | "negative" | "neutral";
}

export function StatsCard({
  title,
  value,
  description,
  icon,
  trend,
  trendType = "positive",
}: StatsCardProps) {
  // Function to format the value (e.g., add commas for thousands)
  const formatValue = (val: number): string => {
    return val.toLocaleString();
  };

  // Determine trend text and styling
  const trendText = trend !== undefined ? `${trend > 0 ? "+" : ""}${trend}%` : "";
  
  // Determine which arrow icon to use based on trend direction
  const getTrendIcon = () => {
    if (trend === undefined || trend === 0) return null;
    return trend > 0 ? <ArrowUpIcon className="h-3 w-3" /> : <ArrowDownIcon className="h-3 w-3" />;
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <h3 className="text-2xl font-bold mt-1">{formatValue(value)}</h3>
            {description && (
              <p className="text-xs text-muted-foreground mt-1">{description}</p>
            )}
          </div>
          {icon && <div className="text-primary">{icon}</div>}
        </div>

        {trend !== undefined && (
          <div className="mt-4">
            <div
              className={cn(
                "inline-flex items-center rounded-md px-2 py-1 text-xs font-medium",
                {
                  "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400":
                    trendType === "positive",
                  "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400":
                    trendType === "negative",
                  "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400":
                    trendType === "neutral",
                }
              )}
            >
              {getTrendIcon()}
              <span className="ml-1">{trendText}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}