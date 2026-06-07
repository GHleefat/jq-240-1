import { useRef, useEffect, useState, useCallback } from "react";
import { Eraser, Check, RotateCcw, Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { speakJapanese } from "@/utils/speech";
import type { StrokePoint, Kana, KanaType } from "@/data/kana";
import { getStrokesForKana } from "@/data/kana";

interface TracingCanvasProps {
  kana: string;
  kanaData?: Kana;
  kanaType?: KanaType;
  onComplete?: (score: number) => void;
  showSubmit?: boolean;
  size?: number;
  showHint?: boolean;
  mode?: "trace" | "write";
}

const CANVAS_SIZE = 300;

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

  const expectedStrokeCount = kanaData
    ? getStrokesForKana(kanaData, kanaType).length
    : 3;

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

  const drawReferenceKana = useCallback(
    (ctx: CanvasRenderingContext2D) => {
      if (!showGuide) return;
      ctx.save();
      ctx.font = `${size * 0.7}px "Noto Serif JP", "Yu Mincho", serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = "rgba(255, 183, 197, 0.3)";
      ctx.fillText(kana, size / 2, size / 2 + size * 0.05);
      ctx.restore();
    },
    [showGuide, kana, size],
  );

  const drawCompletedStrokes = useCallback(
    (ctx: CanvasRenderingContext2D) => {
      completedStrokes.forEach((strokePts) => {
        if (strokePts.length < 2) return;
        ctx.beginPath();
        ctx.strokeStyle = "#2B4C7E";
        ctx.lineWidth = size * 0.018;
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
      ctx.lineWidth = size * 0.018;
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
    drawReferenceKana(ctx);
    drawCompletedStrokes(ctx);
    drawCurrentStroke(ctx);
  }, [
    drawBackground,
    drawReferenceKana,
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
      setCurrentStrokeIdx((prev) => prev + 1);
    }
    currentStrokePoints.current = [];
  };

  const calculateScore = useCallback((): number => {
    const canvas = canvasRef.current;
    if (!canvas) return 0;
    const ctx = canvas.getContext("2d");
    if (!ctx) return 0;

    const drawnCanvas = document.createElement("canvas");
    drawnCanvas.width = size;
    drawnCanvas.height = size;
    const dCtx = drawnCanvas.getContext("2d");
    if (!dCtx) return 0;

    dCtx.fillStyle = "#000";
    completedStrokes.forEach((strokePts) => {
      if (strokePts.length < 2) return;
      dCtx.beginPath();
      dCtx.strokeStyle = "#000";
      dCtx.lineWidth = size * 0.025;
      dCtx.lineCap = "round";
      dCtx.lineJoin = "round";
      dCtx.moveTo(strokePts[0].x, strokePts[0].y);
      for (let i = 1; i < strokePts.length; i++) {
        dCtx.lineTo(strokePts[i].x, strokePts[i].y);
      }
      dCtx.stroke();
    });

    const refCanvas = document.createElement("canvas");
    refCanvas.width = size;
    refCanvas.height = size;
    const rCtx = refCanvas.getContext("2d");
    if (!rCtx) return 0;

    rCtx.fillStyle = "#000";
    rCtx.font = `${size * 0.7}px "Noto Serif JP", "Yu Mincho", serif`;
    rCtx.textAlign = "center";
    rCtx.textBaseline = "middle";
    rCtx.fillText(kana, size / 2, size / 2 + size * 0.05);

    const drawnData = dCtx.getImageData(0, 0, size, size).data;
    const refData = rCtx.getImageData(0, 0, size, size).data;

    let refPixels = 0;
    let drawnPixels = 0;
    let overlapPixels = 0;
    let wrongPixels = 0;

    for (let i = 0; i < drawnData.length; i += 4) {
      const isRef = refData[i + 3] > 128;
      const isDrawn = drawnData[i + 3] > 50;
      if (isRef) refPixels++;
      if (isDrawn) drawnPixels++;
      if (isRef && isDrawn) overlapPixels++;
      if (!isRef && isDrawn) wrongPixels++;
    }

    if (refPixels === 0) return hasDrawn ? 50 : 0;

    const coverage = overlapPixels / refPixels;
    const accuracy = drawnPixels > 0 ? overlapPixels / drawnPixels : 0;
    const strokeCountDiff = Math.abs(
      completedStrokes.length - expectedStrokeCount,
    );
    const strokeCountScore = Math.max(
      0,
      1 - strokeCountDiff / Math.max(1, expectedStrokeCount),
    );

    let score = coverage * 55 + accuracy * 25 + strokeCountScore * 20;
    score = Math.round(score * 100);

    if (!hasDrawn) score = 0;
    score = Math.max(0, Math.min(100, score));

    return score;
  }, [kana, size, completedStrokes, expectedStrokeCount, hasDrawn]);

  const handleSubmit = () => {
    const score = calculateScore();
    onComplete?.(score);
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
          笔画: {currentStrokeIdx} / {expectedStrokeCount}
        </span>
        {mode === "write" && (
          <button
            onClick={() => setShowGuide((g) => !g)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            {showGuide ? (
              <EyeOff className="w-3.5 h-3.5" />
            ) : (
              <Eye className="w-3.5 h-3.5" />
            )}
            {showGuide ? "隐藏提示" : "显示提示"}
          </button>
        )}
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

      {expectedStrokeCount > 0 && (
        <div className="flex gap-1.5">
          {Array.from({ length: expectedStrokeCount }).map((_, idx) => (
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
