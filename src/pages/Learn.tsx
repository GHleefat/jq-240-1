import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Play, Volume2 } from "lucide-react";
import SakuraBackground from "@/components/SakuraBackground";
import KanaCard from "@/components/KanaCard";
import { kanaRows, KanaType } from "@/data/kana";
import { speakJapanese } from "@/utils/speech";
import { useAppStore } from "@/store/useAppStore";
import StarRating from "@/components/StarRating";

export default function Learn() {
  const { type, row } = useParams<{ type: string; row: string }>();
  const navigate = useNavigate();
  const rowIndex = parseInt(row || "0", 10);
  const kanaType = (type as KanaType) || "hiragana";
  const currentRow = kanaRows[rowIndex];
  const { getLevelProgress, isLevelUnlocked } = useAppStore();

  if (!currentRow) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <p>关卡不存在</p>
      </div>
    );
  }

  const unlocked = isLevelUnlocked(kanaType, rowIndex);
  const progress = getLevelProgress(kanaType, rowIndex);

  if (!unlocked) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-center">
          <p className="text-6xl mb-4">🔒</p>
          <h2 className="text-xl font-bold text-indigo-dark mb-2">关卡未解锁</h2>
          <p className="text-gray-500 mb-4">请先完成上一关并获得3星</p>
          <button
            onClick={() => navigate("/levels")}
            className="px-6 py-2.5 rounded-xl bg-sakura-400 text-white font-medium hover:bg-sakura-500 transition-colors"
          >
            返回关卡选择
          </button>
        </div>
      </div>
    );
  }

  const speakAll = () => {
    currentRow.kana.forEach((k, i) => {
      setTimeout(() => {
        speakJapanese(kanaType === "hiragana" ? k.hiragana : k.katakana);
      }, i * 600);
    });
  };

  return (
    <div className="min-h-screen bg-cream relative overflow-hidden">
      <SakuraBackground />

      <div className="relative z-10 container py-6">
        <button
          onClick={() => navigate("/levels")}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white shadow-soft text-indigo hover:bg-sakura-50 transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          返回关卡
        </button>

        <div className="text-center mb-8 animate-fade-in-up">
          <div className="inline-flex items-center gap-3 mb-3">
            <h1 className="text-3xl font-bold text-indigo-dark font-display">
              {currentRow.name}
            </h1>
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-white shadow-soft text-sakura-500">
              {kanaType === "hiragana" ? "平假名" : "片假名"}
            </span>
          </div>
          <div className="flex justify-center mb-2">
            <StarRating stars={progress.stars} size="md" />
          </div>
          <p className="text-gray-500">点击卡片听发音，熟悉后开始测验</p>
        </div>

        <div className="flex flex-wrap justify-center gap-5 mb-10">
          {currentRow.kana.map((kana, i) => (
            <div
              key={kana.romaji}
              className="animate-fade-in-up"
              style={{ animationDelay: `${0.1 + i * 0.1}s` }}
            >
              <KanaCard
                kana={kana}
                type={kanaType}
                size="lg"
                showHint
              />
            </div>
          ))}
        </div>

        <div className="flex justify-center gap-4 animate-fade-in-up" style={{ animationDelay: "0.6s" }}>
          <button
            onClick={speakAll}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-white border-2 border-sakura-200 text-indigo shadow-soft hover:bg-sakura-50 hover:border-sakura-300 transition-all active:scale-95"
          >
            <Volume2 className="w-5 h-5" />
            顺序播放全部
          </button>
          <button
            onClick={() => navigate(`/quiz/${kanaType}/${rowIndex}`)}
            className="inline-flex items-center gap-2 px-8 py-3 rounded-2xl bg-gradient-to-r from-sakura-400 to-sakura-500 text-white font-bold shadow-button hover:from-sakura-500 hover:to-sakura-600 transition-all active:scale-95"
          >
            <Play className="w-5 h-5" />
            开始测验
          </button>
        </div>

        <div className="mt-12 max-w-md mx-auto text-center animate-fade-in-up" style={{ animationDelay: "0.7s" }}>
          <div className="bg-white rounded-2xl p-5 shadow-soft">
            <p className="text-sm text-gray-500">
              测验包含三种题型：
            </p>
            <div className="flex justify-center gap-4 mt-3 text-sm">
              <span className="px-3 py-1 rounded-lg bg-sakura-50 text-sakura-600">👀 看假名选读音</span>
              <span className="px-3 py-1 rounded-lg bg-indigo-50 text-indigo">👂 听发音选假名</span>
              <span className="px-3 py-1 rounded-lg bg-amber-50 text-amber-600">✍️ 临摹笔画</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
