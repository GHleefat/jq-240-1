import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, RotateCcw, ChevronRight, Home } from "lucide-react";
import SakuraBackground from "@/components/SakuraBackground";
import QuizPanel from "@/components/QuizPanel";
import { kanaRows, KanaType, getLevelId } from "@/data/kana";
import { generateQuizQuestions } from "@/utils/helpers";
import { useAppStore } from "@/store/useAppStore";

export default function Quiz() {
  const { type, row } = useParams<{ type: string; row: string }>();
  const navigate = useNavigate();
  const rowIndex = parseInt(row || "0", 10);
  const kanaType = (type as KanaType) || "hiragana";
  const currentRow = kanaRows[rowIndex];
  const { updateStars, isLevelUnlocked } = useAppStore();
  const [completed, setCompleted] = useState(false);
  const [resultStars, setResultStars] = useState(0);

  const questions = useMemo(() => {
    if (!currentRow) return [];
    return generateQuizQuestions(currentRow.kana, kanaType);
  }, [currentRow, kanaType]);

  if (!currentRow) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <p>关卡不存在</p>
      </div>
    );
  }

  const unlocked = isLevelUnlocked(kanaType, rowIndex);
  if (!unlocked) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-center">
          <p className="text-6xl mb-4">🔒</p>
          <button
            onClick={() => navigate("/levels")}
            className="px-6 py-2.5 rounded-xl bg-sakura-400 text-white"
          >
            返回关卡选择
          </button>
        </div>
      </div>
    );
  }

  const handleComplete = (stars: number, score: number) => {
    const levelId = getLevelId(kanaType, rowIndex);
    updateStars(levelId, stars, score);
    setResultStars(stars);
    setCompleted(true);
  };

  const hasNextLevel = rowIndex < kanaRows.length - 1;
  const nextUnlocked = hasNextLevel && isLevelUnlocked(kanaType, rowIndex + 1);

  return (
    <div className="min-h-screen bg-cream relative overflow-hidden">
      <SakuraBackground />

      <div className="relative z-10 container py-6 max-w-2xl">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate(`/learn/${kanaType}/${rowIndex}`)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white shadow-soft text-indigo hover:bg-sakura-50 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            返回学习
          </button>
          <div className="text-sm text-gray-500">
            {kanaType === "hiragana" ? "平假名" : "片假名"} · {currentRow.name}
          </div>
        </div>

        <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-6 md:p-8 shadow-card border-2 border-white min-h-[500px]">
          {!completed ? (
            <QuizPanel
              questions={questions}
              onComplete={handleComplete}
              includeTrace
            />
          ) : (
            <div className="flex flex-col items-center justify-center py-6 animate-fade-in-up">
              <h2 className="text-2xl font-bold text-indigo-dark mb-6">
                {resultStars === 3
                  ? "🎉 完美通关！"
                  : resultStars >= 2
                  ? "👍 不错的成绩！"
                  : "💪 继续加油！"}
              </h2>

              {resultStars === 3 && hasNextLevel && (
                <div className="mb-6 px-5 py-3 rounded-2xl bg-green-50 border-2 border-green-200 text-green-700 text-center animate-bounce-in">
                  ✨ 恭喜解锁下一关！
                </div>
              )}

              <div className="flex flex-wrap justify-center gap-3 mt-4">
                <button
                  onClick={() => {
                    setCompleted(false);
                  }}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white border-2 border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50 transition-all active:scale-95"
                >
                  <RotateCcw className="w-4 h-4" />
                  重新测验
                </button>

                {hasNextLevel && nextUnlocked && (
                  <button
                    onClick={() =>
                      navigate(`/learn/${kanaType}/${rowIndex + 1}`)
                    }
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-light to-indigo text-white font-medium shadow-button hover:from-indigo hover:to-indigo-dark transition-all active:scale-95"
                  >
                    下一关
                    <ChevronRight className="w-4 h-4" />
                  </button>
                )}

                <button
                  onClick={() => navigate("/levels")}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-sakura-400 to-sakura-500 text-white font-medium shadow-button hover:from-sakura-500 hover:to-sakura-600 transition-all active:scale-95"
                >
                  关卡列表
                </button>

                <button
                  onClick={() => navigate("/")}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white border-2 border-sakura-200 text-indigo hover:bg-sakura-50 transition-all active:scale-95"
                >
                  <Home className="w-4 h-4" />
                  首页
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
