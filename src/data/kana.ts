export interface Kana {
  hiragana: string;
  katakana: string;
  romaji: string;
}

export interface KanaRow {
  id: string;
  name: string;
  kana: Kana[];
}

export const kanaRows: KanaRow[] = [
  {
    id: "a",
    name: "あ行",
    kana: [
      { hiragana: "あ", katakana: "ア", romaji: "a" },
      { hiragana: "い", katakana: "イ", romaji: "i" },
      { hiragana: "う", katakana: "ウ", romaji: "u" },
      { hiragana: "え", katakana: "エ", romaji: "e" },
      { hiragana: "お", katakana: "オ", romaji: "o" },
    ],
  },
  {
    id: "ka",
    name: "か行",
    kana: [
      { hiragana: "か", katakana: "カ", romaji: "ka" },
      { hiragana: "き", katakana: "キ", romaji: "ki" },
      { hiragana: "く", katakana: "ク", romaji: "ku" },
      { hiragana: "け", katakana: "ケ", romaji: "ke" },
      { hiragana: "こ", katakana: "コ", romaji: "ko" },
    ],
  },
  {
    id: "sa",
    name: "さ行",
    kana: [
      { hiragana: "さ", katakana: "サ", romaji: "sa" },
      { hiragana: "し", katakana: "シ", romaji: "shi" },
      { hiragana: "す", katakana: "ス", romaji: "su" },
      { hiragana: "せ", katakana: "セ", romaji: "se" },
      { hiragana: "そ", katakana: "ソ", romaji: "so" },
    ],
  },
  {
    id: "ta",
    name: "た行",
    kana: [
      { hiragana: "た", katakana: "タ", romaji: "ta" },
      { hiragana: "ち", katakana: "チ", romaji: "chi" },
      { hiragana: "つ", katakana: "ツ", romaji: "tsu" },
      { hiragana: "て", katakana: "テ", romaji: "te" },
      { hiragana: "と", katakana: "ト", romaji: "to" },
    ],
  },
  {
    id: "na",
    name: "な行",
    kana: [
      { hiragana: "な", katakana: "ナ", romaji: "na" },
      { hiragana: "に", katakana: "ニ", romaji: "ni" },
      { hiragana: "ぬ", katakana: "ヌ", romaji: "nu" },
      { hiragana: "ね", katakana: "ネ", romaji: "ne" },
      { hiragana: "の", katakana: "ノ", romaji: "no" },
    ],
  },
  {
    id: "ha",
    name: "は行",
    kana: [
      { hiragana: "は", katakana: "ハ", romaji: "ha" },
      { hiragana: "ひ", katakana: "ヒ", romaji: "hi" },
      { hiragana: "ふ", katakana: "フ", romaji: "fu" },
      { hiragana: "へ", katakana: "ヘ", romaji: "he" },
      { hiragana: "ほ", katakana: "ホ", romaji: "ho" },
    ],
  },
  {
    id: "ma",
    name: "ま行",
    kana: [
      { hiragana: "ま", katakana: "マ", romaji: "ma" },
      { hiragana: "み", katakana: "ミ", romaji: "mi" },
      { hiragana: "む", katakana: "ム", romaji: "mu" },
      { hiragana: "め", katakana: "メ", romaji: "me" },
      { hiragana: "も", katakana: "モ", romaji: "mo" },
    ],
  },
  {
    id: "ya",
    name: "や行",
    kana: [
      { hiragana: "や", katakana: "ヤ", romaji: "ya" },
      { hiragana: "ゆ", katakana: "ユ", romaji: "yu" },
      { hiragana: "よ", katakana: "ヨ", romaji: "yo" },
    ],
  },
  {
    id: "ra",
    name: "ら行",
    kana: [
      { hiragana: "ら", katakana: "ラ", romaji: "ra" },
      { hiragana: "り", katakana: "リ", romaji: "ri" },
      { hiragana: "る", katakana: "ル", romaji: "ru" },
      { hiragana: "れ", katakana: "レ", romaji: "re" },
      { hiragana: "ろ", katakana: "ロ", romaji: "ro" },
    ],
  },
  {
    id: "wa",
    name: "わ行",
    kana: [
      { hiragana: "わ", katakana: "ワ", romaji: "wa" },
      { hiragana: "を", katakana: "ヲ", romaji: "wo" },
      { hiragana: "ん", katakana: "ン", romaji: "n" },
    ],
  },
];

export type KanaType = "hiragana" | "katakana";

export function getAllKana(): Kana[] {
  return kanaRows.flatMap((row) => row.kana);
}

export function getRowByIndex(index: number): KanaRow | undefined {
  return kanaRows[index];
}

export function getLevelId(type: KanaType, rowIndex: number): string {
  return `${type}_${rowIndex}`;
}
