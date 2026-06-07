import { useState } from "react";
import { Volume2 } from "lucide-react";
import type { Kana, KanaType } from "@/data/kana";
import { speakJapanese } from "@/utils/speech";
import { cn } from "@/lib/utils";

interface KanaCardProps {
  kana: Kana;
  type: KanaType;
  showRomaji?: boolean;
  size?: "sm" | "md" | "lg";
  onClick?: () => void;
  disabled?: boolean;
  selected?: boolean;
  correct?: boolean | null;
  showHint?: boolean;
}

export default function KanaCard({
  kana,
  type,
  showRomaji = true,
  size = "md",
  onClick,
  disabled = false,
  selected = false,
  correct = null,
  showHint = false,
}: KanaCardProps) {
  const [ripple, setRipple] = useState(false);

  const displayKana = type === "hiragana" ? kana.hiragana : kana.katakana;

  const sizeMap = {
    sm: {
      card: "w-20 h-24",
      kana: "text-3xl",
      romaji: "text-xs",
    },
    md: {
      card: "w-32 h-40",
      kana: "text-5xl",
      romaji: "text-sm",
    },
    lg: {
      card: "w-40 h-52",
      kana: "text-7xl",
      romaji: "text-base",
    },
  };

  const handleClick = () => {
    if (disabled) return;
    setRipple(true);
    setTimeout(() => setRipple(false), 600);
    speakJapanese(displayKana);
    onClick?.();
  };

  const borderClass =
    correct === true
      ? "border-green-400 ring-2 ring-green-300"
      : correct === false
      ? "border-red-400 ring-2 ring-red-300 animate-shake"
      : selected
      ? "border-sakura-400 ring-2 ring-sakura-300"
      : "border-sakura-100 hover:border-sakura-300";

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      className={cn(
        sizeMap[size].card,
        "relative flex flex-col items-center justify-center rounded-2xl border-2 bg-white shadow-soft",
        "transition-all duration-200 overflow-hidden",
        disabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer hover:shadow-card hover:-translate-y-1 active:scale-95",
        borderClass
      )}
    >
      {ripple && (
        <span className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span className="absolute w-12 h-12 rounded-full bg-sakura-200 animate-ripple" />
        </span>
      )}
      <span
        className={cn(
          "font-display text-indigo relative z-10",
          sizeMap[size].kana
        )}
      >
        {displayKana}
      </span>
      {showRomaji && (
        <span
          className={cn(
            "mt-2 text-sakura-500 font-medium uppercase tracking-wider",
            sizeMap[size].romaji
          )}
        >
          {kana.romaji}
        </span>
      )}
      {showHint && size !== "sm" && (
        <Volume2 className="absolute bottom-2 right-2 w-4 h-4 text-sakura-400 opacity-60" />
      )}
    </button>
  );
}
