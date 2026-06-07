import { useRef, useEffect, useState, useCallback } from "react";
import { Eraser, Check, RotateCcw, Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { speakJapanese } from "@/utils/speech";
import type { Stroke, StrokePoint, Kana, KanaType } from "@/data/kana";
import { getStrokesForKana } from "@/data/kana";
import { scoreTracing, type TracingResult } from "@/utils/helpers";

interface TracingCanvasProps {
  kana: string;
  kanaData?: Kana;
  kanaType?: KanaType;
  onComplete?: (score: number, result?: TracingResult) => void;
  showSubmit?: boolean;
  size?: number;
  showHint?: boolean;
  mode?: "trace" | "write";
}

const CANVAS_SIZE = 300;
const SCALE = 1.07;
const OFFSET_X = 10;
const OFFSET_Y = 10;

function transformPoint(pt: StrokePoint): StrokePoint {
  return {
    x: pt.x * SCALE + OFFSET_X,
    y: pt.y * SCALE + OFFSET_Y,
  };
}

export default function TracingCanvas({
  kana,
  kanaData,
  kanaType = "hiragana",
  onComplete,
  showSubmit = true,
  size = 300,
  showHint = true,
  mode = "trace",
}: TracingCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [showGuide, setShowGuide] = useState(showHint);
  const [currentStrokeIdx, setCurrentStrokeIdx] = useState(0);
  const [completedStrokes, setCompletedStrokes] = useState<StrokePoint[][]>([]);
  const currentStrokePoints = useRef<StrokePoint[]>([]);
  const lastPos = useRef<{ x: number; y: number } | null>(null);

  const scale = size / CANVAS_SIZE;

  const referenceStrokes: Stroke[] = useCallback(() => {
    if (kanaData) {
      return getStrokesForKana(kanaData, kanaType);
    }
    return [];
  }, [kanaData, kanaType])();

  const drawBackground = useCallback(
    (ctx: CanvasRenderingContext2D) => {
      ctx.fillStyle = "#FFF8F0";
      ctx.fillRect(0, 0, size, size);

      ctx.strokeStyle = "#FFC9D4";
      ctx.lineWidth = 2 * scale;
      ctx.setLineDash([8 * scale, 6 * scale]);
      const mid = size / 2;
      ctx.beginPath();
      ctx.moveTo(mid, 0);
      ctx.lineTo(mid, size);
      ctx.moveTo(0, mid);
      ctx.lineTo(size, mid);
      ctx.stroke();
      ctx.setLineDash([]);
    },
    [size, scale],
  );

  const drawReferenceGuide = useCallback(
    (ctx: CanvasRenderingContext2D) => {
      if (!showGuide) return;

      if (mode === "trace") {
        ctx.save();
        ctx.font = `${size * 0.7}px "Noto Serif JP", "Yu Mincho", serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = "rgba(255, 183, 197, 0.25)";
        ctx.fillText(kana, size / 2, size / 2 + size * 0.05);
        ctx.restore();
      }

      referenceStrokes.forEach((stroke, idx) => {
        const pts = stroke.points.map(transformPoint);
        if (pts.length < 2) return;

        ctx.beginPath();
        ctx.lineCap = "round";
        ctx.lineJoin = "round";

        if (idx < currentStrokeIdx) {
          ctx.strokeStyle = "rgba(43, 76, 126, 0.3)";
          ctx.lineWidth = 8 * scale;
        } else if (idx === currentStrokeIdx) {
          ctx.strokeStyle = "rgba(255, 120, 150, 0.6)";
          ctx.lineWidth = 10 * scale;
        } else {
          ctx.strokeStyle = "rgba(200, 200, 200, 0.25)";
          ctx.lineWidth = 6 * scale;
        }

        const first = pts[0];
        ctx.moveTo(first.x * scale, first.y * scale);
        for (let i = 1; i < pts.length; i++) {
          ctx.lineTo(pts[i].x * scale, pts[i].y * scale);
        }
        ctx.stroke();

        if (idx === currentStrokeIdx) {
          const start = pts[0];
          ctx.beginPath();
          ctx.arc(start.x * scale, start.y * scale, 6 * scale, 0, Math.PI * 2);
          ctx.fillStyle = "rgba(255, 100, 130, 0.8)";
          ctx.fill();

          const end = pts[pts.length - 1];
          ctx.beginPath();
          ctx.arc(end.x * scale, end.y * scale, 5 * scale, 0, Math.PI * 2);
          ctx.fillStyle = "rgba(43, 76, 126, 0.7)";
          ctx.fill();
        }

        if (idx === currentStrokeIdx) {
          const start = pts[0];
          ctx.beginPath();
          ctx.arc(start.x * scale, start.y * scale, 14 * scale, 0, Math.PI * 2);
          ctx.strokeStyle = "rgba(255, 100, 130, 0.5)";
          ctx.lineWidth = 2 * scale;
          ctx.setLineDash([4 * scale, 3 * scale]);
          ctx.stroke();
          ctx.setLineDash([]);
        }
      });
    },
    [showGuide, mode, kana, size, scale, currentStrokeIdx, referenceStrokes],
  );

  const drawCompletedStrokes = useCallback(
    (ctx: CanvasRenderingContext2D) => {
      completedStrokes.forEach((strokePts) => {
        if (strokePts.length < 2) return;
        ctx.beginPath();
        ctx.strokeStyle = "#2B4C7E";
        ctx.lineWidth = size * 0.012;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.moveTo(strokePts[0].x, strokePts[0].y);
        for (let i = 1; i < strokePts.length; i++) {
          ctx.lineTo(strokePts[i].x, strokePts[i].y);
        }
        ctx.stroke();
      });
    },
    [completedStrokes, size],
  );

  const drawCurrentStroke = useCallback(
    (ctx: CanvasRenderingContext2D) => {
      const pts = currentStrokePoints.current;
      if (pts.length < 2) return;
      ctx.beginPath();
      ctx.strokeStyle = "#2B4C7E";
      ctx.lineWidth = size * 0.012;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.moveTo(pts[0].x, pts[0].y);
      for (let i = 1; i < pts.length; i++) {
        ctx.lineTo(pts[i].x, pts[i].y);
      }
      ctx.stroke();
    },
    [size],
  );

  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    drawBackground(ctx);
    drawReferenceGuide(ctx);
    drawCompletedStrokes(ctx);
    drawCurrentStroke(ctx);
  }, [
    drawBackground,
    drawReferenceGuide,
    drawCompletedStrokes,
    drawCurrentStroke,
  ]);

  useEffect(() => {
    redraw();
  }, [redraw]);

  useEffect(() => {
    setCurrentStrokeIdx(0);
    setCompletedStrokes([]);
    currentStrokePoints.current = [];
    setHasDrawn(false);
  }, [kana, kanaData, kanaType]);

  const getPos = (e: React.MouseEvent | React.TouchEvent): StrokePoint => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    if ("touches" in e) {
      return {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top) * scaleY,
      };
    }
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const startDraw = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    setIsDrawing(true);
    const pos = getPos(e);
    currentStrokePoints.current = [pos];
    lastPos.current = pos;
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    e.preventDefault();
    const pos = getPos(e);
    currentStrokePoints.current.push(pos);
    lastPos.current = pos;
    setHasDrawn(true);
    redraw();
  };

  const endDraw = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    lastPos.current = null;

    if (currentStrokePoints.current.length > 1) {
      setCompletedStrokes((prev) => [...prev, currentStrokePoints.current]);
      setCurrentStrokeIdx((prev) =>
        Math.min(prev + 1, referenceStrokes.length),
      );
    }
    currentStrokePoints.current = [];
  };

  const canvasToRefSpace = (strokePts: StrokePoint[]): StrokePoint[] => {
    return strokePts.map((pt) => ({
      x: (pt.x / scale - OFFSET_X) / SCALE,
      y: (pt.y / scale - OFFSET_Y) / SCALE,
    }));
  };

  const calculateScore = useCallback((): {
    score: number;
    result: TracingResult;
  } => {
    const allStrokes = [...completedStrokes];
    if (currentStrokePoints.current.length > 1) {
      allStrokes.push(currentStrokePoints.current);
    }
    const strokesInRefSpace = allStrokes.map(canvasToRefSpace);
    const result = scoreTracing(strokesInRefSpace, referenceStrokes);
    return { score: result.totalScore, result };
  }, [completedStrokes, referenceStrokes, scale]);

  const handleSubmit = () => {
    const { score, result } = calculateScore();
    onComplete?.(score, result);
  };

  const handleClear = () => {
    setCurrentStrokeIdx(0);
    setCompletedStrokes([]);
    currentStrokePoints.current = [];
    setHasDrawn(false);
    setTimeout(redraw, 0);
  };

  const handleUndoStroke = () => {
    if (completedStrokes.length > 0) {
      setCompletedStrokes((prev) => prev.slice(0, -1));
      setCurrentStrokeIdx((prev) => Math.max(0, prev - 1));
      setTimeout(redraw, 0);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex items-center gap-4 text-sm text-gray-500">
        <span className="font-medium text-indigo-dark">
          笔画:{" "}
          {Math.min(
            currentStrokeIdx + (isDrawing ? 1 : 0),
            referenceStrokes.length,
          )}{" "}
          / {referenceStrokes.length}
        </span>
        <button
          onClick={() => setShowGuide((g) => !g)}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 transition-colors"
        >
          {showGuide ? (
            <EyeOff className="w-3.5 h-3.5" />
          ) : (
            <Eye className="w-3.5 h-3.5" />
          )}
          {showGuide ? "隐藏引导" : "显示引导"}
        </button>
      </div>

      <div
        className="relative rounded-2xl overflow-hidden shadow-card border-4 border-sakura-100 cursor-crosshair"
        style={{ width: size, height: size }}
      >
        <canvas
          ref={canvasRef}
          width={size}
          height={size}
          className={cn(
            "block w-full h-full",
            isDrawing ? "cursor-none" : "cursor-crosshair",
          )}
          onMouseDown={startDraw}
          onMouseMove={draw}
          onMouseUp={endDraw}
          onMouseLeave={endDraw}
          onTouchStart={startDraw}
          onTouchMove={draw}
          onTouchEnd={endDraw}
        />
        <button
          onClick={() => speakJapanese(kana)}
          className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center text-indigo hover:bg-white shadow-sm transition-all hover:scale-110"
        >
          <span className="text-lg font-display">{kana}</span>
        </button>
      </div>

      <div className="flex flex-wrap gap-2 justify-center">
        <button
          onClick={handleUndoStroke}
          disabled={completedStrokes.length === 0}
          className={cn(
            "flex items-center gap-1.5 px-3 py-2 rounded-xl border-2 text-sm transition-all active:scale-95",
            completedStrokes.length > 0
              ? "bg-white border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50"
              : "bg-gray-100 border-gray-100 text-gray-300 cursor-not-allowed",
          )}
        >
          <RotateCcw className="w-4 h-4" />
          撤销上一笔
        </button>
        <button
          onClick={handleClear}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border-2 border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50 transition-all active:scale-95 text-sm"
        >
          <Eraser className="w-4 h-4" />
          全部清除
        </button>
        {showSubmit && (
          <button
            onClick={handleSubmit}
            disabled={!hasDrawn}
            className={cn(
              "flex items-center gap-1.5 px-5 py-2 rounded-xl font-medium transition-all active:scale-95 text-sm",
              hasDrawn
                ? "bg-gradient-to-r from-sakura-400 to-sakura-500 text-white shadow-button hover:from-sakura-500 hover:to-sakura-600"
                : "bg-gray-200 text-gray-400 cursor-not-allowed",
            )}
          >
            <Check className="w-4 h-4" />
            提交笔画
          </button>
        )}
      </div>

      {referenceStrokes.length > 0 && (
        <div className="flex gap-1.5">
          {referenceStrokes.map((_, idx) => (
            <div
              key={idx}
              className={cn(
                "w-2.5 h-2.5 rounded-full transition-all",
                idx < currentStrokeIdx
                  ? "bg-green-400"
                  : idx === currentStrokeIdx
                    ? "bg-sakura-400 scale-125 shadow-[0_0_8px_rgba(255,120,150,0.6)]"
                    : "bg-gray-200",
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
}
