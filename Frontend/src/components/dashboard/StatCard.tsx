import { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    isPositive: boolean;
  };
  icon: LucideIcon;
  iconColor?: string;
}

export function StatCard({
  title,
  value,
  change,
  icon: Icon,
  iconColor = "text-primary",
}: StatCardProps) {
  return (
    <Card className="p-6 hover:shadow-lg transition-all duration-200 animate-fade-in border-0 bg-gradient-card">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-muted-foreground mb-1">
            {title}
          </p>
          <h3 className="text-3xl font-bold mb-2">{value}</h3>
          {change && (
            <div className="flex items-center gap-1">
              <span
                className={cn(
                  "text-sm font-medium",
                  change.isPositive ? "text-accent" : "text-destructive"
                )}
              >
                {change.isPositive ? "+" : ""}
                {change.value}%
              </span>
              <span className="text-xs text-muted-foreground">
                vs dernier mois
              </span>
            </div>
          )}
        </div>
        <div
          className={cn(
            "p-3 rounded-xl bg-primary/10",
            iconColor
          )}
        >
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </Card>
  );
}
