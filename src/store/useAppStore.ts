import { create } from "zustand";
import { persist } from "zustand/middleware";
import { kanaRows, getLevelId, KanaType } from "@/data/kana";
import { getTodayString, isYesterday } from "@/utils/helpers";

export interface LevelProgress {
  stars: number;
  unlocked: boolean;
  bestScore: number;
}

export interface UserProgress {
  totalStars: number;
  learnedCount: number;
  lastStudyDate: string;
  streakDays: number;
}

interface AppState {
  levelProgress: Record<string, LevelProgress>;
  userProgress: UserProgress;
  updateStars: (levelId: string, stars: number, score: number) => void;
  getLevelProgress: (type: KanaType, rowIndex: number) => LevelProgress;
  isLevelUnlocked: (type: KanaType, rowIndex: number) => boolean;
  updateStreak: () => void;
  resetProgress: () => void;
}

function createInitialLevelProgress(): Record<string, LevelProgress> {
  const progress: Record<string, LevelProgress> = {};
  kanaRows.forEach((_, idx) => {
    progress[getLevelId("hiragana", idx)] = {
      stars: 0,
      unlocked: idx === 0,
      bestScore: 0,
    };
    progress[getLevelId("katakana", idx)] = {
      stars: 0,
      unlocked: idx === 0,
      bestScore: 0,
    };
  });
  return progress;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      levelProgress: createInitialLevelProgress(),
      userProgress: {
        totalStars: 0,
        learnedCount: 0,
        lastStudyDate: "",
        streakDays: 0,
      },
      updateStars: (levelId: string, stars: number, score: number) =>
        set((state) => {
          const prev = state.levelProgress[levelId] || {
            stars: 0,
            unlocked: true,
            bestScore: 0,
          };
          const newStars = Math.max(prev.stars, stars);
          const newProgress: Record<string, LevelProgress> = {
            ...state.levelProgress,
            [levelId]: {
              ...prev,
              stars: newStars,
              bestScore: Math.max(prev.bestScore, score),
              unlocked: true,
            },
          };

          const [type, rowIdxStr] = levelId.split("_");
          const rowIdx = parseInt(rowIdxStr, 10);
          if (newStars === 3 && rowIdx < kanaRows.length - 1) {
            const nextLevelId = getLevelId(type as KanaType, rowIdx + 1);
            if (newProgress[nextLevelId]) {
              newProgress[nextLevelId] = {
                ...newProgress[nextLevelId],
                unlocked: true,
              };
            }
          }

          const starDiff = newStars - prev.stars;
          const learnedDiff = prev.stars === 0 && newStars > 0 ? kanaRows[rowIdx].kana.length : 0;

          return {
            levelProgress: newProgress,
            userProgress: {
              ...state.userProgress,
              totalStars: state.userProgress.totalStars + Math.max(0, starDiff),
              learnedCount: state.userProgress.learnedCount + learnedDiff,
            },
          };
        }),
      getLevelProgress: (type: KanaType, rowIndex: number) => {
        const levelId = getLevelId(type, rowIndex);
        return (
          get().levelProgress[levelId] || {
            stars: 0,
            unlocked: false,
            bestScore: 0,
          }
        );
      },
      isLevelUnlocked: (type: KanaType, rowIndex: number) => {
        return get().getLevelProgress(type, rowIndex).unlocked;
      },
      updateStreak: () =>
        set((state) => {
          const today = getTodayString();
          const last = state.userProgress.lastStudyDate;
          if (last === today) return state;
          const newStreak =
            last && isYesterday(last)
              ? state.userProgress.streakDays + 1
              : 1;
          return {
            userProgress: {
              ...state.userProgress,
              lastStudyDate: today,
              streakDays: newStreak,
            },
          };
        }),
      resetProgress: () =>
        set(() => ({
          levelProgress: createInitialLevelProgress(),
          userProgress: {
            totalStars: 0,
            learnedCount: 0,
            lastStudyDate: "",
            streakDays: 0,
          },
        })),
    }),
    {
      name: "kana-game-progress",
    }
  )
);
