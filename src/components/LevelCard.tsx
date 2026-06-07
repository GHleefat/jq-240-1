import { Lock } from "lucide-react";
import StarRating from "./StarRating";
import { cn } from "@/lib/utils";

interface LevelCardProps {
  name: string;
  levelNumber: number;
  stars: number;
  unlocked: boolean;
  onClick: () => void;
  type: "hiragana" | "katakana";
}

export default function LevelCard({
  name,
  levelNumber,
  stars,
  unlocked,
  onClick,
  type,
}: LevelCardProps) {
  const typeColors = {
    hiragana: "from-sakura-100 to-sakura-200 hover:from-sakura-200 hover:to-sakura-300",
    katakana: "from-indigo-50 to-indigo-100 hover:from-indigo-100 hover:to-indigo-200",
  };

  return (
    <button
      onClick={onClick}
      disabled={!unlocked}
      className={cn(
        "relative p-5 rounded-2xl shadow-soft transition-all duration-300 text-left w-full",
        "border-2",
        unlocked
          ? `bg-gradient-to-br ${typeColors[type]} border-white hover:shadow-card hover:-translate-y-1 active:scale-98 border-transparent`
          : "bg-gray-100 border-gray-200 cursor-not-allowed opacity-70"
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <div
            className={cn(
              "text-xs font-medium mb-1",
              unlocked ? "text-indigo" : "text-gray-400"
            )}
          >
            第 {levelNumber + 1} 关
          </div>
          <div
            className={cn(
              "text-xl font-bold font-display",
              unlocked ? "text-indigo-dark" : "text-gray-400"
            )}
          >
            {name}
          </div>
        </div>
        {!unlocked && (
          <Lock className="w-5 h-5 text-gray-400 mt-1" />
        )}
      </div>
      <StarRating stars={stars} size="sm" />
    </button>
  );
}
