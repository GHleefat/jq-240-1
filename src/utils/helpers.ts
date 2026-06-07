import type { Kana, KanaType } from "@/data/kana";
import { getAllKana, kanaRows } from "@/data/kana";

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
  count: number = 3
): string[] {
  const allKana = getAllKana();
  const others = allKana.filter((k) => k.romaji !== correct.romaji);
  const shuffled = shuffleArray(others);
  return shuffled.slice(0, count).map((k) => k.romaji);
}

export function generateWrongKanaOptions(
  correct: Kana,
  type: KanaType,
  count: number = 3
): Kana[] {
  const allKana = getAllKana();
  const others = allKana.filter((k) => k.romaji !== correct.romaji);
  const shuffled = shuffleArray(others);
  return shuffled.slice(0, count);
}

export interface QuizQuestion {
  id: string;
  type: "read" | "listen" | "trace";
  correctAnswer: string;
  options: string[];
  kana: Kana;
  kanaType: KanaType;
}

export function generateQuizQuestions(
  rowKana: Kana[],
  kanaType: KanaType
): QuizQuestion[] {
  const questions: QuizQuestion[] = [];

  rowKana.forEach((kana, idx) => {
    questions.push({
      id: `read-${idx}`,
      type: "read",
      correctAnswer: kana.romaji,
      options: shuffleArray([kana.romaji, ...generateWrongOptions(kana, kanaType)]),
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
          kanaType === "hiragana" ? k.hiragana : k.katakana
        ),
      ]),
      kana,
      kanaType,
    });
  });

  return shuffleArray(questions);
}

export function calculateStars(
  correctCount: number,
  totalCount: number,
  traceScore: number
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
