import { useRef, useEffect, useState, useCallback } from "react";
import { Eraser, Check, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { speakJapanese } from "@/utils/speech";

interface TracingCanvasProps {
  kana: string;
  onComplete?: (score: number) => void;
  showSubmit?: boolean;
  size?: number;
}

export default function TracingCanvas({
  kana,
  onComplete,
  showSubmit = true,
  size = 300,
}: TracingCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const lastPos = useRef<{ x: number; y: number } | null>(null);

  const initCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#FFF8F0";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = "#FFC9D4";
    ctx.lineWidth = 2;
    ctx.setLineDash([8, 6]);
    const mid = canvas.width / 2;
    ctx.beginPath();
    ctx.moveTo(mid, 0);
    ctx.lineTo(mid, canvas.height);
    ctx.moveTo(0, mid);
    ctx.lineTo(canvas.width, mid);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.save();
    ctx.font = `${canvas.width * 0.7}px "Noto Serif JP", "Yu Mincho", serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "rgba(255, 183, 197, 0.25)";
    ctx.fillText(kana, canvas.width / 2, canvas.height / 2 + canvas.width * 0.05);
    ctx.restore();

    setHasDrawn(false);
  }, [kana]);

  useEffect(() => {
    initCanvas();
  }, [initCanvas]);

  const getPos = (e: React.MouseEvent | React.TouchEvent) => {
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
    lastPos.current = getPos(e);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx || !lastPos.current) return;

    const pos = getPos(e);
    ctx.strokeStyle = "#2B4C7E";
    ctx.lineWidth = size * 0.012;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    ctx.beginPath();
    ctx.moveTo(lastPos.current.x, lastPos.current.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();

    lastPos.current = pos;
    setHasDrawn(true);
  };

  const endDraw = () => {
    setIsDrawing(false);
    lastPos.current = null;
  };

  const calculateScore = useCallback((): number => {
    const canvas = canvasRef.current;
    if (!canvas) return 0;
    const ctx = canvas.getContext("2d");
    if (!ctx) return 0;

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    let drawnPixels = 0;
    let guidePixels = 0;

    const referenceCanvas = document.createElement("canvas");
    referenceCanvas.width = canvas.width;
    referenceCanvas.height = canvas.height;
    const refCtx = referenceCanvas.getContext("2d");
    if (!refCtx) return 0;

    refCtx.fillStyle = "#000";
    refCtx.font = `${canvas.width * 0.7}px "Noto Serif JP", "Yu Mincho", serif`;
    refCtx.textAlign = "center";
    refCtx.textBaseline = "middle";
    refCtx.fillText(kana, canvas.width / 2, canvas.height / 2 + canvas.width * 0.05);

    const refData = refCtx.getImageData(0, 0, canvas.width, canvas.height).data;

    for (let i = 0; i < data.length; i += 4) {
      if (refData[i] < 128 && refData[i + 3] > 128) {
        guidePixels++;
      }
      if (data[i + 2] < 128 && data[i + 3] > 50) {
        drawnPixels++;
      }
    }

    if (guidePixels === 0) return hasDrawn ? 60 : 0;
    const coverageRatio = Math.min(1, drawnPixels / (guidePixels * 0.5));
    const baseScore = Math.round(coverageRatio * 100);
    return hasDrawn ? Math.max(50, Math.min(100, baseScore + 10)) : 0;
  }, [kana, hasDrawn]);

  const handleSubmit = () => {
    const score = calculateScore();
    onComplete?.(score);
  };

  const handleClear = () => {
    initCanvas();
  };

  return (
    <div className="flex flex-col items-center gap-4">
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
            isDrawing ? "cursor-none" : "cursor-crosshair"
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

      <div className="flex gap-3">
        <button
          onClick={handleClear}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border-2 border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50 transition-all active:scale-95"
        >
          <Eraser className="w-4 h-4" />
          <RotateCcw className="w-4 h-4" />
          清除
        </button>
        {showSubmit && (
          <button
            onClick={handleSubmit}
            disabled={!hasDrawn}
            className={cn(
              "flex items-center gap-2 px-6 py-2.5 rounded-xl font-medium transition-all active:scale-95",
              hasDrawn
                ? "bg-gradient-to-r from-sakura-400 to-sakura-500 text-white shadow-button hover:from-sakura-500 hover:to-sakura-600"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            )}
          >
            <Check className="w-4 h-4" />
            提交笔画
          </button>
        )}
      </div>
    </div>
  );
}
