// File and folder names for captured content. Course folders are the snake_case course title
// with Roman numerals spelled as digits ("Python I: Fundamentals" -> "python_1_fundamentals").

const ROMAN_VALUES: Readonly<Record<string, number>> = { I: 1, V: 5, X: 10 };
const MAX_SLUG_LENGTH = 80;

/** Converts an uppercase Roman numeral made of I, V and X (1-39) to a number. */
export function romanToInt(token: string): number | null {
  if (!/^[IVX]+$/.test(token)) return null;
  let total = 0;
  for (let i = 0; i < token.length; i++) {
    const value = ROMAN_VALUES[token.charAt(i)] ?? 0;
    const next = ROMAN_VALUES[token.charAt(i + 1)] ?? 0;
    total += value < next ? -value : value;
  }
  // Reject non-canonical forms such as "IIII" or "VX" by round-tripping.
  return intToRoman(total) === token ? total : null;
}

function intToRoman(n: number): string {
  const table: readonly [number, string][] = [
    [10, "X"],
    [9, "IX"],
    [5, "V"],
    [4, "IV"],
    [1, "I"],
  ];
  let rest = n;
  let out = "";
  for (const [value, numeral] of table) {
    while (rest >= value) {
      out += numeral;
      rest -= value;
    }
  }
  return out;
}

/**
 * Whether an uppercase token is a Roman numeral in this position. Multi-letter numerals
 * ("II", "IV") always are; a lone "I", "V" or "X" only right before a colon or dash or at the
 * end ("Python I: Fundamentals", "Statistics I"), so the pronoun in "What Can I Do" stays.
 */
function numeralAt(token: string, after: string): number | null {
  const value = romanToInt(token);
  if (value === null) return null;
  return token.length > 1 || /^\s*(?:[:\-–—]|$)/.test(after) ? value : null;
}

/**
 * snake_case slug of a title. Roman numerals become digits (see numeralAt); accents are
 * dropped; anything that isn't a letter or digit separates words.
 */
export function snakeCase(title: string): string {
  const plain = title.normalize("NFKD").replace(/[̀-ͯ]/g, "");
  const words = [...plain.matchAll(/[A-Za-z0-9]+/g)].map((match) => {
    const token = match[0];
    const numeral = numeralAt(token, plain.slice(match.index + token.length));
    return numeral === null ? token.toLowerCase() : String(numeral);
  });
  const slug = words.join("_").slice(0, MAX_SLUG_LENGTH).replace(/_+$/, "");
  return slug.length > 0 ? slug : "untitled";
}

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

/** "01-03_scripts_and_variables.json": chapter and lesson numbers are 1-based. */
export function lessonFileName(chapterNumber: number, lessonNumber: number, title: string): string {
  return `${pad2(chapterNumber)}-${pad2(lessonNumber)}_${snakeCase(title)}.json`;
}
