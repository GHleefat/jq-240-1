import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import SakuraBackground from "@/components/SakuraBackground";
import LevelCard from "@/components/LevelCard";
import { kanaRows, KanaType } from "@/data/kana";
import { useAppStore } from "@/store/useAppStore";

export default function Levels() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<KanaType>("hiragana");
  const { getLevelProgress } = useAppStore();

  const handleLevelClick = (rowIndex: number) => {
    const progress = getLevelProgress(activeTab, rowIndex);
    if (!progress.unlocked) return;
    navigate(`/learn/${activeTab}/${rowIndex}`);
  };

  return (
    <div className="min-h-screen bg-cream relative overflow-hidden">
      <SakuraBackground />

      <div className="relative z-10 container py-6">
        <button
          onClick={() => navigate("/")}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white shadow-soft text-indigo hover:bg-sakura-50 transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          返回首页
        </button>

        <div className="text-center mb-8 animate-fade-in-up">
          <h1 className="text-3xl font-bold text-indigo-dark font-display mb-2">
            选择关卡
          </h1>
          <p className="text-gray-500">按行循序渐进，三星通关解锁下一关</p>
        </div>

        <div className="flex justify-center mb-8 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
          <div className="inline-flex bg-white rounded-2xl p-1.5 shadow-soft">
            <button
              onClick={() => setActiveTab("hiragana")}
              className={`px-6 py-2.5 rounded-xl font-medium transition-all ${
                activeTab === "hiragana"
                  ? "bg-gradient-to-r from-sakura-400 to-sakura-500 text-white shadow-button"
                  : "text-gray-500 hover:text-indigo"
              }`}
            >
              平假名
            </button>
            <button
              onClick={() => setActiveTab("katakana")}
              className={`px-6 py-2.5 rounded-xl font-medium transition-all ${
                activeTab === "katakana"
                  ? "bg-gradient-to-r from-indigo-light to-indigo text-white shadow-button"
                  : "text-gray-500 hover:text-indigo"
              }`}
            >
              片假名
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 max-w-5xl mx-auto">
          {kanaRows.map((row, idx) => {
            const progress = getLevelProgress(activeTab, idx);
            return (
              <div
                key={`${activeTab}-${row.id}`}
                className="animate-fade-in-up"
                style={{ animationDelay: `${0.15 + idx * 0.05}s` }}
              >
                <LevelCard
                  name={row.name}
                  levelNumber={idx}
                  stars={progress.stars}
                  unlocked={progress.unlocked}
                  onClick={() => handleLevelClick(idx)}
                  type={activeTab}
                />
              </div>
            );
          })}
        </div>

        <div className="mt-10 max-w-md mx-auto bg-white rounded-2xl p-5 shadow-soft text-center animate-fade-in-up">
          <p className="text-sm text-gray-500">
            💡 小贴士：三星通关（正确率≥90%且临摹≥70分）即可解锁下一关
          </p>
        </div>
      </div>
    </div>
  );
}
