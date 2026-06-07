import { useState, useEffect } from "react";
import { Volume2, Eye, PenTool, Check, X } from "lucide-react";
import TracingCanvas from "./TracingCanvas";
import ProgressBar from "./ProgressBar";
import StarRating from "./StarRating";
import { speakJapanese } from "@/utils/speech";
import type { QuizQuestion } from "@/utils/helpers";
import { calculateStars } from "@/utils/helpers";
import { cn } from "@/lib/utils";

interface QuizPanelProps {
  questions: QuizQuestion[];
  onComplete: (stars: number, score: number, correctCount: number) => void;
  includeTrace?: boolean;
}

type FeedbackState = "correct" | "wrong" | null;
type ScreenState = "question" | "write" | "result";

export default function QuizPanel({ questions, onComplete }: QuizPanelProps) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [screen, setScreen] = useState<ScreenState>("question");
  const [selected, setSelected] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<FeedbackState>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [totalScore, setTotalScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [finalStars, setFinalStars] = useState(0);
  const [finalScore, setFinalScore] = useState(0);

  const currentQuestion = questions[currentIdx];
  const totalQuestions = questions.length;
  const isLast = currentIdx >= totalQuestions - 1;

  useEffect(() => {
    if (showResult) return;
    if (!currentQuestion) return;

    if (currentQuestion.type === "write") {
      setScreen("write");
    } else {
      setScreen("question");
    }

    if (currentQuestion.type === "listen") {
      const timer = setTimeout(() => {
        speakJapanese(
          currentQuestion.kanaType === "hiragana"
            ? currentQuestion.kana.hiragana
            : currentQuestion.kana.katakana,
        );
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [currentQuestion, showResult]);

  const goNext = () => {
    if (isLast) {
      finishQuiz();
    } else {
      setCurrentIdx((i) => i + 1);
      setSelected(null);
      setFeedback(null);
    }
  };

  const handleSelect = (option: string) => {
    if (feedback) return;
    setSelected(option);
    const isCorrect = option === currentQuestion.correctAnswer;
    setFeedback(isCorrect ? "correct" : "wrong");
    if (isCorrect) {
      setCorrectCount((c) => c + 1);
      setTotalScore((s) => s + 1);
    }
    setTimeout(goNext, 1200);
  };

  const handleWriteComplete = (score: number) => {
    const passed = score >= 60;
    if (passed) {
      setCorrectCount((c) => c + 1);
    }
    setTotalScore((s) => s + score / 100);
    setFeedback(passed ? "correct" : "wrong");
    setTimeout(goNext, 1500);
  };

  const finishQuiz = () => {
    const avgTraceScore =
      totalQuestions > 0 ? Math.round((totalScore / totalQuestions) * 100) : 0;
    const stars = calculateStars(correctCount, totalQuestions, avgTraceScore);
    const score = Math.round(
      (correctCount / Math.max(1, totalQuestions)) * 100,
    );
    setFinalStars(stars);
    setFinalScore(score);
    setShowResult(true);
    setTimeout(() => {
      onComplete(stars, score, correctCount);
    }, 300);
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
        <p className="text-gray-400 text-sm">
          答对 {correctCount} / {totalQuestions} 题
        </p>
      </div>
    );
  }

  if (!currentQuestion) return null;

  if (screen === "write") {
    const kanaChar =
      currentQuestion.kanaType === "hiragana"
        ? currentQuestion.kana.hiragana
        : currentQuestion.kana.katakana;

    return (
      <div className="flex flex-col items-center gap-6 animate-fade-in-up">
        <ProgressBar value={currentIdx + 1} max={totalQuestions} showLabel />
        <div className="text-center">
          <p className="text-sm text-sakura-500 font-medium mb-1">
            看罗马音写假名 {currentIdx + 1}/{totalQuestions}
          </p>
          <h3 className="text-xl font-bold text-indigo-dark mb-3">
            请写出下面罗马音对应的假名
          </h3>
          <div className="inline-block px-6 py-3 rounded-2xl bg-gradient-to-r from-sakura-100 to-indigo-50 border-2 border-sakura-200">
            <span className="text-3xl font-bold text-indigo-dark tracking-wider uppercase">
              {currentQuestion.kana.romaji}
            </span>
          </div>
        </div>

        {feedback && (
          <div
            className={cn(
              "flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-base",
              feedback === "correct"
                ? "text-green-600 bg-green-50 border border-green-200"
                : "text-red-500 bg-red-50 border border-red-200",
            )}
          >
            {feedback === "correct" ? (
              <>
                <Check className="w-5 h-5" />
                写得很棒！
              </>
            ) : (
              <>
                <X className="w-5 h-5" />
                继续加油，正确答案是：
                <span className="font-display text-2xl text-indigo-dark ml-1">
                  {kanaChar}
                </span>
              </>
            )}
          </div>
        )}

        {!feedback && (
          <TracingCanvas
            kana={kanaChar}
            kanaData={currentQuestion.kana}
            kanaType={currentQuestion.kanaType}
            onComplete={handleWriteComplete}
            size={280}
            mode="write"
            showHint={true}
          />
        )}
      </div>
    );
  }

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
      <ProgressBar value={currentIdx + 1} max={totalQuestions} showLabel />

      <div className="flex items-center gap-2 text-sakura-500 font-medium text-sm">
        {typeLabels[currentQuestion.type]?.icon}
        <span>
          {typeLabels[currentQuestion.type]?.label}{" "}
          <span className="text-gray-400">
            ({currentIdx + 1}/{totalQuestions})
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
            "flex items-center justify-center gap-2 py-2 px-4 rounded-xl font-medium",
            feedback === "correct"
              ? "text-green-600 bg-green-50"
              : "text-red-500 bg-red-50",
          )}
        >
          {feedback === "correct" ? (
            <>
              <Check className="w-5 h-5" />
              回答正确！
            </>
          ) : (
            <>
              <X className="w-5 h-5" />
              回答错误，正确答案是：{currentQuestion.correctAnswer}
            </>
          )}
        </div>
      )}
    </div>
  );
}
