import { cn } from "@/lib/utils";

interface ProgressBarProps {
  value: number;
  max: number;
  className?: string;
  showLabel?: boolean;
  color?: "sakura" | "indigo" | "green";
  size?: "sm" | "md";
}

export default function ProgressBar({
  value,
  max,
  className,
  showLabel = false,
  color = "sakura",
  size = "md",
}: ProgressBarProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  const colorMap = {
    sakura: "bg-gradient-to-r from-sakura-300 to-sakura-500",
    indigo: "bg-gradient-to-r from-indigo-light to-indigo",
    green: "bg-gradient-to-r from-green-300 to-green-500",
  };

  const sizeMap = {
    sm: "h-1.5",
    md: "h-3",
  };

  return (
    <div className={cn("w-full", className)}>
      {showLabel && (
        <div className="flex justify-between text-xs text-indigo mb-1">
          <span>{value} / {max}</span>
          <span>{Math.round(percentage)}%</span>
        </div>
      )}
      <div
        className={cn(
          "w-full bg-gray-100 rounded-full overflow-hidden",
          sizeMap[size]
        )}
      >
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500 ease-out",
            colorMap[color]
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
