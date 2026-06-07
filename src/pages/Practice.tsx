import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Shuffle, Volume2, Eye, EyeOff } from "lucide-react";
import SakuraBackground from "@/components/SakuraBackground";
import KanaCard from "@/components/KanaCard";
import { kanaRows, KanaType, Kana } from "@/data/kana";
import { shuffleArray } from "@/utils/helpers";
import { speakJapanese } from "@/utils/speech";

export default function Practice() {
  const navigate = useNavigate();
  const [selectedRows, setSelectedRows] = useState<number[]>([0]);
  const [activeType, setActiveType] = useState<KanaType>("hiragana");
  const [showRomaji, setShowRomaji] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const selectedKana = useMemo<Kana[]>(() => {
    return selectedRows.flatMap((idx) => kanaRows[idx]?.kana || []);
  }, [selectedRows]);

  const shuffledKana = useMemo(() => {
    return shuffleArray(selectedKana);
  }, [selectedKana, activeType]);

  const currentKana = shuffledKana[currentIndex];

  const toggleRow = (idx: number) => {
    setSelectedRows((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
    );
    setCurrentIndex(0);
  };

  const selectAll = () => {
    setSelectedRows(kanaRows.map((_, i) => i));
    setCurrentIndex(0);
  };

  const clearAll = () => {
    setSelectedRows([]);
    setCurrentIndex(0);
  };

  const shuffle = () => {
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  const nextCard = () => {
    if (shuffledKana.length === 0) return;
    setCurrentIndex((i) => (i + 1) % shuffledKana.length);
    setIsFlipped(false);
  };

  const prevCard = () => {
    if (shuffledKana.length === 0) return;
    setCurrentIndex(
      (i) => (i - 1 + shuffledKana.length) % shuffledKana.length
    );
    setIsFlipped(false);
  };

  const speakCurrent = () => {
    if (!currentKana) return;
    speakJapanese(
      activeType === "hiragana" ? currentKana.hiragana : currentKana.katakana
    );
  };

  return (
    <div className="min-h-screen bg-cream relative overflow-hidden">
      <SakuraBackground />

      <div className="relative z-10 container py-6 max-w-4xl">
        <button
          onClick={() => navigate("/")}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white shadow-soft text-indigo hover:bg-sakura-50 transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          返回首页
        </button>

        <div className="text-center mb-8 animate-fade-in-up">
          <h1 className="text-3xl font-bold text-indigo-dark font-display mb-2">
            自由练习
          </h1>
          <p className="text-gray-500">选择要练习的行，自由复习假名</p>
        </div>

        <div className="flex justify-center mb-6 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
          <div className="inline-flex bg-white rounded-2xl p-1.5 shadow-soft">
            <button
              onClick={() => {
                setActiveType("hiragana");
                setCurrentIndex(0);
              }}
              className={`px-5 py-2 rounded-xl font-medium transition-all text-sm ${
                activeType === "hiragana"
                  ? "bg-gradient-to-r from-sakura-400 to-sakura-500 text-white shadow-button"
                  : "text-gray-500 hover:text-indigo"
              }`}
            >
              平假名
            </button>
            <button
              onClick={() => {
                setActiveType("katakana");
                setCurrentIndex(0);
              }}
              className={`px-5 py-2 rounded-xl font-medium transition-all text-sm ${
                activeType === "katakana"
                  ? "bg-gradient-to-r from-indigo-light to-indigo text-white shadow-button"
                  : "text-gray-500 hover:text-indigo"
              }`}
            >
              片假名
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-soft mb-6 animate-fade-in-up" style={{ animationDelay: "0.15s" }}>
          <div className="flex items-center justify-between mb-3">
            <span className="font-medium text-indigo text-sm">选择练习行</span>
            <div className="flex gap-2">
              <button
                onClick={selectAll}
                className="text-xs px-3 py-1 rounded-lg bg-sakura-50 text-sakura-600 hover:bg-sakura-100"
              >
                全选
              </button>
              <button
                onClick={clearAll}
                className="text-xs px-3 py-1 rounded-lg bg-gray-50 text-gray-500 hover:bg-gray-100"
              >
                清空
              </button>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {kanaRows.map((row, idx) => (
              <button
                key={row.id}
                onClick={() => toggleRow(idx)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  selectedRows.includes(idx)
                    ? "bg-gradient-to-r from-sakura-300 to-sakura-400 text-white shadow-sm"
                    : "bg-gray-50 text-gray-500 hover:bg-gray-100"
                }`}
              >
                {row.name}
              </button>
            ))}
          </div>
        </div>

        {selectedKana.length === 0 ? (
          <div className="text-center py-20 text-gray-400 animate-fade-in-up">
            <p className="text-5xl mb-4">📚</p>
            <p>请选择至少一行假名开始练习</p>
          </div>
        ) : (
          <div className="animate-fade-in-up">
            <div className="flex justify-center mb-4 gap-3">
              <button
                onClick={() => setShowRomaji(!showRomaji)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white shadow-soft text-indigo hover:bg-sakura-50 text-sm"
              >
                {showRomaji ? (
                  <><EyeOff className="w-4 h-4" /> 隐藏读音</>
                ) : (
                  <><Eye className="w-4 h-4" /> 显示读音</>
                )}
              </button>
              <button
                onClick={shuffle}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white shadow-soft text-indigo hover:bg-sakura-50 text-sm"
              >
                <Shuffle className="w-4 h-4" /> 打乱顺序
              </button>
            </div>

            <div className="flex justify-center mb-4 text-sm text-gray-400">
              {currentIndex + 1} / {shuffledKana.length}
            </div>

            <div className="flex flex-col items-center gap-6">
              {currentKana && (
                <div
                  className="cursor-pointer"
                  onClick={() => setIsFlipped(!isFlipped)}
                >
                  <KanaCard
                    kana={currentKana}
                    type={activeType}
                    size="lg"
                    showRomaji={showRomaji || isFlipped}
                    showHint
                  />
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={prevCard}
                  className="px-6 py-3 rounded-2xl bg-white border-2 border-gray-200 text-indigo shadow-soft hover:bg-gray-50 active:scale-95 transition-all"
                >
                  上一个
                </button>
                <button
                  onClick={speakCurrent}
                  className="px-6 py-3 rounded-2xl bg-gradient-to-r from-indigo-light to-indigo text-white shadow-button hover:from-indigo hover:to-indigo-dark active:scale-95 transition-all inline-flex items-center gap-2"
                >
                  <Volume2 className="w-5 h-5" />
                  发音
                </button>
                <button
                  onClick={nextCard}
                  className="px-6 py-3 rounded-2xl bg-gradient-to-r from-sakura-400 to-sakura-500 text-white font-medium shadow-button hover:from-sakura-500 hover:to-sakura-600 active:scale-95 transition-all"
                >
                  下一个
                </button>
              </div>
            </div>

            <div className="mt-10 grid grid-cols-3 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-2">
              {shuffledKana.map((kana, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setCurrentIndex(idx);
                    setIsFlipped(false);
                  }}
                  className={`py-3 rounded-xl text-xl font-display transition-all ${
                    idx === currentIndex
                      ? "bg-sakura-200 text-indigo-dark shadow-sm"
                      : "bg-white text-gray-500 hover:bg-sakura-50"
                  }`}
                >
                  {activeType === "hiragana" ? kana.hiragana : kana.katakana}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
