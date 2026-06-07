import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Gamepad2, Shuffle, BookOpen, Flame, Star, BookMarked } from "lucide-react";
import SakuraBackground from "@/components/SakuraBackground";
import ProgressBar from "@/components/ProgressBar";
import { useAppStore } from "@/store/useAppStore";
import { kanaRows } from "@/data/kana";

export default function Home() {
  const navigate = useNavigate();
  const { userProgress, updateStreak } = useAppStore();

  useEffect(() => {
    updateStreak();
  }, [updateStreak]);

  const totalLevels = kanaRows.length * 2;
  const totalKana = kanaRows.reduce((sum, r) => sum + r.kana.length, 0) * 2;
  const maxStars = totalLevels * 3;

  const modes = [
    {
      icon: <Gamepad2 className="w-8 h-8" />,
      title: "闯关模式",
      desc: "按行循序渐进学习，三星通关解锁下一关",
      color: "from-sakura-400 to-sakura-600",
      bgColor: "bg-sakura-50",
      onClick: () => navigate("/levels"),
    },
    {
      icon: <BookOpen className="w-8 h-8" />,
      title: "自由练习",
      desc: "选择任意行假名，无压力自由复习",
      color: "from-indigo-light to-indigo",
      bgColor: "bg-indigo-50",
      onClick: () => navigate("/practice"),
    },
    {
      icon: <Shuffle className="w-8 h-8" />,
      title: "随机测验",
      desc: "综合测试已学习的假名，检验掌握程度",
      color: "from-amber-400 to-orange-500",
      bgColor: "bg-amber-50",
      onClick: () => navigate("/random-quiz"),
    },
  ];

  return (
    <div className="min-h-screen bg-cream relative overflow-hidden">
      <SakuraBackground />

      <div className="relative z-10 container py-8 md:py-16">
        <div className="text-center mb-12 animate-fade-in-up">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white shadow-soft mb-6">
            <span className="text-2xl">🌸</span>
            <span className="text-sakura-500 font-medium text-sm">
              日语五十音学习
            </span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-indigo-dark font-display mb-4">
            五十音闯关
          </h1>
          <p className="text-gray-500 text-lg max-w-md mx-auto">
            看、听、写多感官训练，让假名记忆更有趣
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10 max-w-3xl mx-auto">
          <div className="bg-white rounded-2xl p-4 shadow-soft text-center animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-sakura-100 text-sakura-500 mb-2">
              <Star className="w-5 h-5" />
            </div>
            <div className="text-2xl font-bold text-indigo-dark">
              {userProgress.totalStars}
              <span className="text-gray-400 text-sm font-normal">/{maxStars}</span>
            </div>
            <div className="text-xs text-gray-400 mt-0.5">总星数</div>
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-soft text-center animate-fade-in-up" style={{ animationDelay: "0.15s" }}>
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-indigo-50 text-indigo mb-2">
              <BookMarked className="w-5 h-5" />
            </div>
            <div className="text-2xl font-bold text-indigo-dark">
              {userProgress.learnedCount}
              <span className="text-gray-400 text-sm font-normal">/{totalKana}</span>
            </div>
            <div className="text-xs text-gray-400 mt-0.5">已学习</div>
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-soft text-center animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-orange-50 text-orange-500 mb-2">
              <Flame className="w-5 h-5" />
            </div>
            <div className="text-2xl font-bold text-indigo-dark">
              {userProgress.streakDays}
              <span className="text-gray-400 text-sm font-normal">天</span>
            </div>
            <div className="text-xs text-gray-400 mt-0.5">连续学习</div>
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-soft text-center animate-fade-in-up" style={{ animationDelay: "0.25s" }}>
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-green-50 text-green-500 mb-2">
              <span className="text-lg">🎯</span>
            </div>
            <div className="text-2xl font-bold text-indigo-dark">
              {totalLevels}
            </div>
            <div className="text-xs text-gray-400 mt-0.5">总关卡</div>
          </div>
        </div>

        <div className="max-w-3xl mx-auto mb-12 animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
          <div className="bg-white rounded-2xl p-5 shadow-soft">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-indigo">整体进度</span>
              <span className="text-sm text-gray-400">
                {Math.round((userProgress.learnedCount / totalKana) * 100)}%
              </span>
            </div>
            <ProgressBar
              value={userProgress.learnedCount}
              max={totalKana}
              color="indigo"
              size="sm"
            />
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-5 max-w-4xl mx-auto">
          {modes.map((mode, i) => (
            <button
              key={i}
              onClick={mode.onClick}
              className={`group text-left ${mode.bgColor} rounded-3xl p-6 shadow-soft border-2 border-white hover:shadow-card hover:-translate-y-2 transition-all duration-300 animate-fade-in-up`}
              style={{ animationDelay: `${0.4 + i * 0.1}s` }}
            >
              <div
                className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br ${mode.color} text-white mb-4 shadow-md group-hover:scale-110 transition-transform`}
              >
                {mode.icon}
              </div>
              <h3 className="text-xl font-bold text-indigo-dark mb-2">
                {mode.title}
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                {mode.desc}
              </p>
            </button>
          ))}
        </div>

        <footer className="mt-16 text-center text-sm text-gray-400">
          がんばって！ 一起学好日语吧 ✨
        </footer>
      </div>
    </div>
  );
}
