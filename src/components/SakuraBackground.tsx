import { useMemo } from "react";

interface Petal {
  left: number;
  delay: number;
  duration: number;
  size: number;
  opacity: number;
}

export default function SakuraBackground() {
  const petals = useMemo<Petal[]>(() => {
    return Array.from({ length: 15 }, (_, i) => ({
      left: Math.random() * 100,
      delay: Math.random() * 8,
      duration: 6 + Math.random() * 6,
      size: 8 + Math.random() * 10,
      opacity: 0.4 + Math.random() * 0.4,
    }));
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {petals.map((p, i) => (
        <span
          key={i}
          className="absolute animate-sakura-fall"
          style={{
            left: `${p.left}%`,
            top: "-5vh",
            width: p.size,
            height: p.size,
            opacity: p.opacity,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
          }}
        >
          <svg viewBox="0 0 24 24" fill="#FFB7C5" className="w-full h-full">
            <path d="M12 2C12 2 8 6 8 10C8 13 10 15 12 22C14 15 16 13 16 10C16 6 12 2 12 2Z" />
          </svg>
        </span>
      ))}
    </div>
  );
}
