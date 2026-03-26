import { ReactNode } from "react";

interface StatCardProps {
  title: string;
  value: string;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon: ReactNode;
}

const StatCard = ({ title, value, change, changeType = "neutral", icon }: StatCardProps) => {
  const changeColor = {
    positive: "text-success",
    negative: "text-destructive",
    neutral: "text-muted-foreground",
  }[changeType];

  return (
    <div className="bg-card rounded-xl border border-border p-3 md:p-5 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-glow)] card-interactive">
      <div className="flex items-start justify-between">
        <div className="min-w-0">
          <p className="text-xs md:text-sm text-muted-foreground truncate">{title}</p>
          <p className="text-lg md:text-2xl font-display font-bold mt-1">{value}</p>
          {change && (
            <p className={`text-[10px] md:text-xs mt-1 ${changeColor} truncate`}>{change}</p>
          )}
        </div>
        <div className="p-2 md:p-2.5 rounded-lg bg-primary/10 text-primary shrink-0">
          {icon}
        </div>
      </div>
    </div>
  );
};

export default StatCard;
