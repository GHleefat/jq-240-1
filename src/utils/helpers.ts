import type { Kana, KanaType, Stroke, StrokePoint } from "@/data/kana";
import { getAllKana, kanaRows, getStrokesForKana } from "@/data/kana";

export function shuffleArray<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export function pickRandom<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

export function generateWrongOptions(
  correct: Kana,
  type: KanaType,
  count: number = 3,
): string[] {
  const allKana = getAllKana();
  const others = allKana.filter((k) => k.romaji !== correct.romaji);
  const shuffled = shuffleArray(others);
  return shuffled.slice(0, count).map((k) => k.romaji);
}

export function generateWrongKanaOptions(
  correct: Kana,
  type: KanaType,
  count: number = 3,
): Kana[] {
  const allKana = getAllKana();
  const others = allKana.filter((k) => k.romaji !== correct.romaji);
  const shuffled = shuffleArray(others);
  return shuffled.slice(0, count);
}

export type QuizQuestionType = "read" | "listen" | "write" | "trace";

export interface QuizQuestion {
  id: string;
  type: QuizQuestionType;
  correctAnswer: string;
  options?: string[];
  kana: Kana;
  kanaType: KanaType;
}

export function generateQuizQuestions(
  rowKana: Kana[],
  kanaType: KanaType,
): QuizQuestion[] {
  const questions: QuizQuestion[] = [];

  rowKana.forEach((kana, idx) => {
    questions.push({
      id: `read-${idx}`,
      type: "read",
      correctAnswer: kana.romaji,
      options: shuffleArray([
        kana.romaji,
        ...generateWrongOptions(kana, kanaType),
      ]),
      kana,
      kanaType,
    });
  });

  rowKana.forEach((kana, idx) => {
    questions.push({
      id: `listen-${idx}`,
      type: "listen",
      correctAnswer: kanaType === "hiragana" ? kana.hiragana : kana.katakana,
      options: shuffleArray([
        kanaType === "hiragana" ? kana.hiragana : kana.katakana,
        ...generateWrongKanaOptions(kana, kanaType).map((k) =>
          kanaType === "hiragana" ? k.hiragana : k.katakana,
        ),
      ]),
      kana,
      kanaType,
    });
  });

  rowKana.forEach((kana, idx) => {
    questions.push({
      id: `write-${idx}`,
      type: "write",
      correctAnswer: kanaType === "hiragana" ? kana.hiragana : kana.katakana,
      kana,
      kanaType,
    });
  });

  return shuffleArray(questions);
}

export interface StrokeScore {
  strokeIndex: number;
  orderCorrect: boolean;
  startClose: boolean;
  endClose: boolean;
  pathSimilarity: number;
  score: number;
}

export interface TracingResult {
  strokeScores: StrokeScore[];
  totalScore: number;
  correctCount: number;
}

function dist(a: StrokePoint, b: StrokePoint): number {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

function pathLength(points: StrokePoint[]): number {
  let len = 0;
  for (let i = 1; i < points.length; i++) {
    len += dist(points[i - 1], points[i]);
  }
  return len;
}

function resample(points: StrokePoint[], targetCount: number): StrokePoint[] {
  if (points.length < 2) return points;
  const totalLen = pathLength(points);
  const step = totalLen / (targetCount - 1);
  const result: StrokePoint[] = [points[0]];
  let acc = 0;
  let prev = points[0];
  for (let i = 1; i < points.length; i++) {
    let cur = points[i];
    let d = dist(prev, cur);
    while (acc + d >= step && result.length < targetCount) {
      const t = (step - acc) / d;
      const newPt: StrokePoint = {
        x: prev.x + t * (cur.x - prev.x),
        y: prev.y + t * (cur.y - prev.y),
      };
      result.push(newPt);
      prev = newPt;
      d = dist(prev, cur);
      acc = 0;
    }
    acc += d;
    prev = cur;
  }
  while (result.length < targetCount) {
    result.push(points[points.length - 1]);
  }
  return result;
}

function averageDistance(a: StrokePoint[], b: StrokePoint[]): number {
  const n = Math.min(a.length, b.length);
  let sum = 0;
  for (let i = 0; i < n; i++) {
    sum += dist(a[i], b[i]);
  }
  return sum / n;
}

export function scoreStroke(
  drawnPoints: StrokePoint[],
  referenceStroke: Stroke,
  threshold: number = 35,
): StrokeScore {
  const refPoints = referenceStroke.points;
  if (drawnPoints.length === 0 || refPoints.length === 0) {
    return {
      strokeIndex: 0,
      orderCorrect: false,
      startClose: false,
      endClose: false,
      pathSimilarity: 0,
      score: 0,
    };
  }

  const refStart = refPoints[0];
  const refEnd = refPoints[refPoints.length - 1];
  const drawnStart = drawnPoints[0];
  const drawnEnd = drawnPoints[drawnPoints.length - 1];

  const startDist = dist(drawnStart, refStart);
  const endDist = dist(drawnEnd, refEnd);
  const startClose = startDist < threshold * 1.5;
  const endClose = endDist < threshold * 1.5;

  const resampledDrawn = resample(drawnPoints, 20);
  const resampledRef = resample(refPoints, 20);
  const avgDist = averageDistance(resampledDrawn, resampledRef);
  const pathSimilarity = Math.max(0, 1 - avgDist / threshold);

  let score = 0;
  if (startClose) score += 25;
  if (endClose) score += 25;
  score += Math.round(pathSimilarity * 50);

  return {
    strokeIndex: 0,
    orderCorrect: true,
    startClose,
    endClose,
    pathSimilarity: Math.round(pathSimilarity * 100),
    score,
  };
}

export function scoreTracing(
  userStrokes: StrokePoint[][],
  referenceStrokes: Stroke[],
): TracingResult {
  const strokeScores: StrokeScore[] = [];
  let totalScore = 0;
  let correctCount = 0;
  const correctOrderBonus = 20;

  for (let i = 0; i < referenceStrokes.length; i++) {
    if (i < userStrokes.length) {
      const strokeScore = scoreStroke(userStrokes[i], referenceStrokes[i]);
      strokeScore.strokeIndex = i;
      strokeScore.orderCorrect = true;
      strokeScores.push(strokeScore);
      totalScore += strokeScore.score;
      if (strokeScore.score >= 50) correctCount++;
    } else {
      strokeScores.push({
        strokeIndex: i,
        orderCorrect: false,
        startClose: false,
        endClose: false,
        pathSimilarity: 0,
        score: 0,
      });
    }
  }

  if (userStrokes.length >= referenceStrokes.length) {
    totalScore += correctOrderBonus;
  }

  if (referenceStrokes.length > 0) {
    totalScore = Math.round(totalScore / referenceStrokes.length);
  }

  totalScore = Math.max(0, Math.min(100, totalScore));

  return { strokeScores, totalScore, correctCount };
}

export function calculateStars(
  correctCount: number,
  totalCount: number,
  traceScore: number,
): number {
  const accuracy = correctCount / totalCount;
  if (accuracy >= 0.9 && traceScore >= 70) return 3;
  if (accuracy >= 0.7) return 2;
  if (accuracy >= 0.5) return 1;
  return 0;
}

export function getTodayString(): string {
  return new Date().toISOString().split("T")[0];
}

export function isYesterday(dateStr: string): boolean {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return dateStr === yesterday.toISOString().split("T")[0];
}
