import { Star } from "lucide-react";

interface StarRatingProps {
  stars: number;
  size?: "sm" | "md" | "lg";
  animate?: boolean;
}

export default function StarRating({
  stars,
  size = "md",
  animate = false,
}: StarRatingProps) {
  const sizeMap = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-12 h-12",
  };

  return (
    <div className="flex gap-1">
      {[0, 1, 2].map((i) => (
        <Star
          key={i}
          className={`${sizeMap[size]} ${
            i < stars
              ? "text-gold fill-gold"
              : "text-gray-300"
          } ${
            animate && i < stars ? "animate-bounce-in" : ""
          }`}
          style={animate ? { animationDelay: `${i * 0.2}s` } : undefined}
        />
      ))}
    </div>
  );
}
