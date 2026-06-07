import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, RotateCcw, Home } from "lucide-react";
import SakuraBackground from "@/components/SakuraBackground";
import QuizPanel from "@/components/QuizPanel";
import StarRating from "@/components/StarRating";
import { kanaRows, KanaType, Kana } from "@/data/kana";
import { useAppStore } from "@/store/useAppStore";
import { generateQuizQuestions, QuizQuestion, shuffleArray } from "@/utils/helpers";

function generateRandomQuestions(count: number, kanaType: KanaType, unlockedKana: Kana[]): QuizQuestion[] {
  if (unlockedKana.length === 0) return [];
  const selected = shuffleArray(unlockedKana).slice(0, Math.min(count, unlockedKana.length));
  return generateQuizQuestions(selected, kanaType).slice(0, count * 2);
}

export default function RandomQuiz() {
  const navigate = useNavigate();
  const { isLevelUnlocked } = useAppStore();
  const [started, setStarted] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [activeType, setActiveType] = useState<KanaType>("hiragana");
  const [questionCount, setQuestionCount] = useState(10);
  const [resultStars, setResultStars] = useState(0);
  const [resultScore, setResultScore] = useState(0);

  const unlockedKana = useMemo<Kana[]>(() => {
    const result: Kana[] = [];
    kanaRows.forEach((row, idx) => {
      if (isLevelUnlocked(activeType, idx)) {
        result.push(...row.kana);
      }
    });
    return result;
  }, [activeType, isLevelUnlocked]);

  const questions = useMemo(() => {
    if (!started) return [];
    return generateRandomQuestions(questionCount, activeType, unlockedKana);
  }, [started, questionCount, activeType, unlockedKana]);

  const handleComplete = (stars: number, score: number) => {
    setResultStars(stars);
    setResultScore(score);
    setCompleted(true);
  };

  const restart = () => {
    setStarted(false);
    setCompleted(false);
  };

  if (unlockedKana.length === 0) {
    return (
      <div className="min-h-screen bg-cream relative overflow-hidden flex items-center justify-center">
        <SakuraBackground />
        <div className="relative z-10 text-center">
          <p className="text-6xl mb-4">📖</p>
          <h2 className="text-xl font-bold text-indigo-dark mb-2">还没有解锁的假名</h2>
          <p className="text-gray-500 mb-6">请先在闯关模式中学习并解锁假名</p>
          <button
            onClick={() => navigate("/levels")}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-sakura-400 to-sakura-500 text-white font-medium shadow-button"
          >
            前往闯关模式
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream relative overflow-hidden">
      <SakuraBackground />

      <div className="relative z-10 container py-6 max-w-2xl">
        <button
          onClick={() => navigate("/")}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white shadow-soft text-indigo hover:bg-sakura-50 transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          返回首页
        </button>

        <div className="text-center mb-8 animate-fade-in-up">
          <h1 className="text-3xl font-bold text-indigo-dark font-display mb-2">
            随机测验
          </h1>
          <p className="text-gray-500">
            已解锁 {unlockedKana.length} 个假名，来检验一下吧！
          </p>
        </div>

        <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-6 md:p-8 shadow-card border-2 border-white min-h-[400px]">
          {!started && !completed && (
            <div className="flex flex-col items-center gap-6 animate-fade-in-up py-6">
              <div>
                <p className="text-sm text-gray-500 mb-3 text-center">选择假名类型</p>
                <div className="inline-flex bg-white rounded-2xl p-1.5 shadow-soft">
                  <button
                    onClick={() => setActiveType("hiragana")}
                    className={`px-6 py-2 rounded-xl font-medium transition-all ${
                      activeType === "hiragana"
                        ? "bg-gradient-to-r from-sakura-400 to-sakura-500 text-white shadow-button"
                        : "text-gray-500 hover:text-indigo"
                    }`}
                  >
                    平假名
                  </button>
                  <button
                    onClick={() => setActiveType("katakana")}
                    className={`px-6 py-2 rounded-xl font-medium transition-all ${
                      activeType === "katakana"
                        ? "bg-gradient-to-r from-indigo-light to-indigo text-white shadow-button"
                        : "text-gray-500 hover:text-indigo"
                    }`}
                  >
                    片假名
                  </button>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-500 mb-3 text-center">题目数量</p>
                <div className="flex gap-2">
                  {[5, 10, 15, 20].map((n) => (
                    <button
                      key={n}
                      onClick={() => setQuestionCount(n)}
                      className={`px-5 py-2.5 rounded-xl font-medium transition-all ${
                        questionCount === n
                          ? "bg-gradient-to-r from-sakura-400 to-sakura-500 text-white shadow-button"
                          : "bg-white text-gray-500 hover:text-indigo shadow-soft"
                      }`}
                    >
                      {n} 题
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={() => setStarted(true)}
                className="mt-4 px-10 py-3.5 rounded-2xl bg-gradient-to-r from-sakura-400 to-sakura-500 text-white font-bold text-lg shadow-button hover:from-sakura-500 hover:to-sakura-600 transition-all active:scale-95"
              >
                开始测验
              </button>
            </div>
          )}

          {started && !completed && (
            <QuizPanel
              questions={questions}
              onComplete={handleComplete}
              includeTrace={false}
            />
          )}

          {completed && (
            <div className="flex flex-col items-center justify-center py-10 animate-fade-in-up">
              <div className="mb-4">
                <StarRating stars={resultStars} size="lg" animate />
              </div>
              <h2 className="text-2xl font-bold text-indigo-dark mb-2">
                {resultStars === 3
                  ? "🎉 太棒了！"
                  : resultStars >= 2
                  ? "👍 很不错！"
                  : "💪 继续努力！"}
              </h2>
              <p className="text-gray-500 mb-1">得分：{resultScore} 分</p>
              <p className="text-gray-400 text-sm mb-8">
                {activeType === "hiragana" ? "平假名" : "片假名"} · {questionCount} 题
              </p>

              <div className="flex flex-wrap justify-center gap-3">
                <button
                  onClick={restart}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white border-2 border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50 transition-all active:scale-95"
                >
                  <RotateCcw className="w-4 h-4" />
                  再来一次
                </button>
                <button
                  onClick={() => navigate("/")}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-sakura-400 to-sakura-500 text-white font-medium shadow-button hover:from-sakura-500 hover:to-sakura-600 transition-all active:scale-95"
                >
                  <Home className="w-4 h-4" />
                  返回首页
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
