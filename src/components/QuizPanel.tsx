import { useState, useEffect, useMemo } from "react";
import { Volume2, ArrowRight, Eye, PenTool } from "lucide-react";
import TracingCanvas from "./TracingCanvas";
import ProgressBar from "./ProgressBar";
import StarRating from "./StarRating";
import { speakJapanese } from "@/utils/speech";
import type { QuizQuestion, TracingResult } from "@/utils/helpers";
import { calculateStars } from "@/utils/helpers";
import { cn } from "@/lib/utils";

interface QuizPanelProps {
  questions: QuizQuestion[];
  onComplete: (stars: number, score: number, correctCount: number) => void;
  includeTrace?: boolean;
}

type FeedbackState = "correct" | "wrong" | null;

export default function QuizPanel({
  questions,
  onComplete,
  includeTrace = true,
}: QuizPanelProps) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<FeedbackState>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [traceScore, setTraceScore] = useState(0);
  const [showTrace, setShowTrace] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [finalStars, setFinalStars] = useState(0);
  const [finalScore, setFinalScore] = useState(0);
  const [lastTraceResult, setLastTraceResult] = useState<TracingResult | null>(
    null,
  );

  const displayQuestions = useMemo(() => {
    return questions;
  }, [questions]);

  const currentQuestion = displayQuestions[currentIdx];
  const hasWriteQuestions = displayQuestions.some((q) => q.type === "write");
  const writeQuestion = useMemo(() => {
    return displayQuestions.find((q) => q.type === "write");
  }, [displayQuestions]);

  const isLastQuestion = currentIdx >= displayQuestions.length - 1;
  const nonWriteQuestions = displayQuestions.filter((q) => q.type !== "write");
  const totalQuestions =
    nonWriteQuestions.length +
    (includeTrace && (hasWriteQuestions || writeQuestion) ? 1 : 0);

  const totalProgress = showTrace
    ? nonWriteQuestions.length
    : displayQuestions.filter((q, i) => i < currentIdx && q.type !== "write")
        .length + (currentQuestion?.type !== "write" ? 1 : 0);

  useEffect(() => {
    if (currentQuestion?.type === "listen") {
      const timer = setTimeout(() => {
        speakJapanese(
          currentQuestion.kanaType === "hiragana"
            ? currentQuestion.kana.hiragana
            : currentQuestion.kana.katakana,
        );
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [currentQuestion]);

  useEffect(() => {
    if (currentQuestion?.type === "write" && !showTrace) {
      setShowTrace(true);
    }
  }, [currentQuestion, showTrace]);

  const handleSelect = (option: string) => {
    if (feedback) return;
    setSelected(option);
    const isCorrect = option === currentQuestion.correctAnswer;
    setFeedback(isCorrect ? "correct" : "wrong");
    if (isCorrect) {
      setCorrectCount((c) => c + 1);
    }

    setTimeout(() => {
      if (isLastQuestion) {
        if (includeTrace && writeQuestion) {
          setShowTrace(true);
        } else {
          finishQuiz(0);
        }
      } else {
        const nextIdx = currentIdx + 1;
        const nextQ = displayQuestions[nextIdx];
        if (nextQ && nextQ.type === "write") {
          setShowTrace(true);
        } else {
          setCurrentIdx(nextIdx);
          setSelected(null);
          setFeedback(null);
        }
      }
    }, 1000);
  };

  const handleTraceComplete = (score: number, result?: TracingResult) => {
    setTraceScore(score);
    if (result) setLastTraceResult(result);
    setTimeout(() => finishQuiz(score), 500);
  };

  const finishQuiz = (trace: number) => {
    const finalCorrect = correctCount + (trace >= 60 ? 1 : 0);
    const finalTotal = totalQuestions;
    const stars = calculateStars(finalCorrect, finalTotal, trace);
    const score = Math.round(
      (correctCount / Math.max(1, nonWriteQuestions.length)) * 70 +
        (trace / 100) * 30,
    );
    setFinalStars(stars);
    setFinalScore(score);
    setShowResult(true);
    setTimeout(() => {
      onComplete(stars, score, finalCorrect);
    }, 200);
  };

  const replaySound = () => {
    if (currentQuestion?.type === "listen") {
      speakJapanese(
        currentQuestion.kanaType === "hiragana"
          ? currentQuestion.kana.hiragana
          : currentQuestion.kana.katakana,
      );
    }
  };

  if (showResult) {
    return (
      <div className="flex flex-col items-center justify-center py-10 animate-bounce-in">
        <div className="mb-6">
          <StarRating stars={finalStars} size="lg" animate />
        </div>
        <h2 className="text-2xl font-bold text-indigo-dark mb-2">
          {finalStars === 3
            ? "太棒了！完美通关！"
            : finalStars >= 2
              ? "做得不错！"
              : "继续努力！"}
        </h2>
        <p className="text-gray-500 mb-1">得分：{finalScore} 分</p>
        <p className="text-gray-400 text-sm mb-2">
          答对 {correctCount + (traceScore >= 60 ? 1 : 0)} / {totalQuestions} 题
        </p>
        {lastTraceResult && (
          <div className="text-sm text-gray-400">
            临摹得分：{traceScore} 分（{lastTraceResult.correctCount}/
            {lastTraceResult.strokeScores.length} 笔合格）
          </div>
        )}
      </div>
    );
  }

  if (showTrace && (currentQuestion || writeQuestion)) {
    const traceKana =
      currentQuestion?.type === "write" ? currentQuestion : writeQuestion;
    if (!traceKana) return null;
    const kanaChar =
      traceKana.kanaType === "hiragana"
        ? traceKana.kana.hiragana
        : traceKana.kana.katakana;
    const isWriteMode = traceKana.type === "write";

    return (
      <div className="flex flex-col items-center gap-6 animate-fade-in-up">
        <ProgressBar value={totalProgress + 1} max={totalQuestions} showLabel />
        <div className="text-center">
          <p className="text-sm text-sakura-500 font-medium mb-1">
            {isWriteMode ? "看罗马音写假名" : "临摹练习"} {totalProgress + 1}/
            {totalQuestions}
          </p>
          <h3 className="text-xl font-bold text-indigo-dark mb-2">
            {isWriteMode
              ? `请写出下面罗马音对应的假名`
              : "请在画布上描红下面的假名"}
          </h3>
          {isWriteMode && (
            <div className="inline-block px-6 py-3 rounded-2xl bg-gradient-to-r from-sakura-100 to-indigo-50 border-2 border-sakura-200">
              <span className="text-3xl font-bold text-indigo-dark tracking-wider uppercase">
                {traceKana.kana.romaji}
              </span>
            </div>
          )}
        </div>
        <TracingCanvas
          kana={kanaChar}
          kanaData={traceKana.kana}
          kanaType={traceKana.kanaType}
          onComplete={handleTraceComplete}
          size={280}
          mode={isWriteMode ? "write" : "trace"}
          showHint={true}
        />
      </div>
    );
  }

  if (!currentQuestion || currentQuestion.type === "write") return null;

  const typeLabels: Record<string, { label: string; icon: React.ReactNode }> = {
    read: {
      label: "看假名选读音",
      icon: <Eye className="w-4 h-4" />,
    },
    listen: {
      label: "听发音选假名",
      icon: <Volume2 className="w-4 h-4" />,
    },
    write: {
      label: "看罗马音写假名",
      icon: <PenTool className="w-4 h-4" />,
    },
  };

  return (
    <div className="flex flex-col gap-6 animate-fade-in-up">
      <ProgressBar value={totalProgress} max={totalQuestions} showLabel />

      <div className="flex items-center gap-2 text-sakura-500 font-medium text-sm">
        {typeLabels[currentQuestion.type]?.icon}
        <span>
          {typeLabels[currentQuestion.type]?.label}{" "}
          <span className="text-gray-400">
            ({totalProgress}/{nonWriteQuestions.length})
          </span>
        </span>
      </div>

      <div className="bg-white rounded-3xl p-8 shadow-card text-center border-2 border-sakura-50">
        {currentQuestion.type === "read" ? (
          <>
            <div className="text-8xl font-display text-indigo-dark mb-4 animate-fade-in-up">
              {currentQuestion.kanaType === "hiragana"
                ? currentQuestion.kana.hiragana
                : currentQuestion.kana.katakana}
            </div>
            <p className="text-gray-400 mb-2">请选择正确的读音</p>
          </>
        ) : (
          <>
            <button
              onClick={replaySound}
              className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-sakura-300 to-sakura-500 flex items-center justify-center text-white shadow-button hover:scale-105 transition-transform active:scale-95 animate-pulse-glow"
            >
              <Volume2 className="w-10 h-10" />
            </button>
            <p className="text-gray-500 mb-2">点击播放发音，选择对应的假名</p>
          </>
        )}
      </div>

      <div
        className={cn(
          "grid gap-3",
          currentQuestion.type === "read" ? "grid-cols-2" : "grid-cols-2",
        )}
      >
        {currentQuestion.options?.map((option, i) => {
          const isCorrect = option === currentQuestion.correctAnswer;
          const isSelected = selected === option;
          const showCorrect = feedback && isCorrect;
          const showWrong = feedback && isSelected && !isCorrect;

          return (
            <button
              key={i}
              onClick={() => handleSelect(option)}
              disabled={!!feedback}
              className={cn(
                "py-4 px-6 rounded-2xl font-medium transition-all border-2",
                "hover:-translate-y-0.5 active:scale-98",
                showCorrect
                  ? "bg-green-50 border-green-400 text-green-700 shadow-[0_0_20px_rgba(34,197,94,0.3)]"
                  : showWrong
                    ? "bg-red-50 border-red-400 text-red-600 animate-shake"
                    : isSelected
                      ? "bg-sakura-100 border-sakura-400 text-indigo-dark"
                      : "bg-white border-gray-100 text-indigo hover:border-sakura-200 hover:bg-sakura-50",
                feedback && !isCorrect && !isSelected ? "opacity-50" : "",
              )}
            >
              <span
                className={cn(
                  currentQuestion.type === "listen"
                    ? "font-display text-4xl"
                    : "text-lg uppercase tracking-wide",
                )}
              >
                {option}
              </span>
            </button>
          );
        })}
      </div>

      {feedback && (
        <div
          className={cn(
            "text-center py-2 px-4 rounded-xl font-medium",
            feedback === "correct"
              ? "text-green-600 bg-green-50"
              : "text-red-500 bg-red-50",
          )}
        >
          {feedback === "correct" ? (
            <span>✓ 回答正确！</span>
          ) : (
            <span>✗ 回答错误，正确答案是：{currentQuestion.correctAnswer}</span>
          )}
          {isLastQuestion && includeTrace && (
            <span className="ml-2 inline-flex items-center">
              <ArrowRight className="w-4 h-4 ml-1" />
              准备临摹...
            </span>
          )}
        </div>
      )}
    </div>
  );
}
