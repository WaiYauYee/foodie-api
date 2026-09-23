import { Food, MealType, VoiceDetectionResult, DetectedKeyword, DetectedFoodItem } from '../types/types';
import { SEARCHABLE_FOODS } from '../data/foodDatabase';

const WORD_TO_NUMBER: Record<string, number> = {
  // English
  one: 1,
  two: 2,
  three: 3,
  four: 4,
  five: 5,
  six: 6,
  seven: 7,
  eight: 8,
  nine: 9,
  ten: 10,
  half: 0.5,
  couple: 2,
  double: 2,
  hundred: 100,

  // Malay
  satu: 1,
  dua: 2,
  tiga: 3,
  empat: 4,
  lima: 5,
  enam: 6,
  tujuh: 7,
  lapan: 8,
  sembilan: 9,
  sepuluh: 10,
  segelas: 1,
  secawan: 1,
  sepinggan: 1,
  sebotol: 1,
  sebiji: 1,
  sekeping: 1,
};

const CATEGORY_KEYWORDS: Record<MealType, string[]> = {
  breakfast: ['breakfast', 'sarapan', 'pagi', 'morning', 'brekkie', 'bfast'],
  lunch: ['lunch', 'tengah hari', 'tengahari', 'afternoon', 'noon'],
  dinner: ['dinner', 'makan malam', 'malam', 'evening', 'night', 'supper'],
  snack: ['snack', 'snacks', 'tea time', 'minum petang', 'kudapan', 'dessert'],
};

const WATER_KEYWORDS = ['water', 'air', 'h2o', 'hydrate', 'hydration', 'drink', 'drank', 'minum', 'glass', 'cup', 'bottle'];

const LOG_INTENT_KEYWORDS = ['eat', 'ate', 'had', 'have', 'makan', 'log', 'logged', 'record', 'add', 'added', 'consumed', 'input'];

/**
 * Common phonetic misrecognitions produced by Web Speech API when transcribing Malaysian foods.
 * Pre-substituting these before keyword parsing instantly solves "roti can I" and "nasty lemak"!
 */
const PHONETIC_PRE_REPLACEMENTS: Array<{ pattern: RegExp; replacement: string }> = [
  // Roti canai misrecognitions
  { pattern: /\b(roti\s+can\s+i|roti\s+can\s+eye|roti\s+chennai|roti\s+china|roti\s+channel|roadie\s+can\s+i|roadie\s+canai|roty\s+canai|roti\s+chanai|roti\s+kana|roti\s+kannai)\b/gi, replacement: 'roti canai' },
  { pattern: /\broti\s+can\b/gi, replacement: 'roti canai' },

  // Nasi lemak misrecognitions
  { pattern: /\b(nasty\s+lemak|nazi\s+lemak|nice\s+lemak|nurse\s+lemak|not\s+see\s+lemak|nas\s+lemak|nasi\s+lamak|nasi\s+lemon|nasi\s+mark|nasi\s+lame|nasi\s+lamek|nasy\s+lemak|nassi\s+lemak|nasi\s+le\s+ma)\b/gi, replacement: 'nasi lemak' },

  // Bak kut teh misrecognitions
  { pattern: /\b(bah\s+kut\s+teh|bakuteh|bar\s+kut\s+teh|buck\s+kut\s+teh|backuteh|bak\s+koot\s+teh|bark\s+kut\s+teh|but\s+kut\s+teh)\b/gi, replacement: 'bak kut teh' },

  // Teh tarik misrecognitions
  { pattern: /\b(tea\s+tarik|teh\s+tari|tehtarik|the\s+tarik|tay\s+tarik|day\s+tarik)\b/gi, replacement: 'teh tarik' },

  // Char kway teow misrecognitions
  { pattern: /\b(chocolate\s+towel|chalk\s+white\s+owl|char\s+kuey\s+teow|char\s+koay\s+teow|char\s+quay\s+teow|char\s+kway\s+teo)\b/gi, replacement: 'char kway teow' },

  // Roti telur misrecognitions
  { pattern: /\b(roti\s+telor|roti\s+taylor|roti\s+tailor|roti\s+trailer|roti\s+tailer)\b/gi, replacement: 'roti telur' },
];

/**
 * Standard Levenshtein distance for fuzzy string matching
 */
export function levenshteinDistance(s1: string, s2: string): number {
  const m = s1.length;
  const n = s2.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (s1[i - 1] === s2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
      }
    }
  }

  return dp[m][n];
}

/**
 * Similarity score between two strings (0.0 to 1.0)
 */
export function stringSimilarity(str1: string, str2: string): number {
  const s1 = str1.trim().toLowerCase();
  const s2 = str2.trim().toLowerCase();
  if (s1 === s2) return 1.0;
  if (!s1 || !s2) return 0;
  const maxLen = Math.max(s1.length, s2.length);
  const dist = levenshteinDistance(s1, s2);
  return Math.max(0, 1 - dist / maxLen);
}

/**
 * Pre-processes transcript to fix phonetically mangled words
 */
export function preprocessPhonetics(transcript: string): string {
  let cleaned = transcript;
  for (const item of PHONETIC_PRE_REPLACEMENTS) {
    cleaned = cleaned.replace(item.pattern, item.replacement);
  }
  return cleaned;
}

/**
 * Infer default meal category based on current clock hour
 */
export function getDefaultMealCategoryByHour(date: Date = new Date()): MealType {
  const hour = date.getHours();
  if (hour >= 4 && hour < 11) return 'breakfast';
  if (hour >= 11 && hour < 15) return 'lunch';
  if (hour >= 15 && hour < 18) return 'snack';
  return 'dinner';
}

export interface FoodMatchSpan {
  food: Food;
  matchedTerm: string;
  startIndex: number;
  endIndex: number;
  score: number;
  similarity: number;
  reason: string;
}

/**
 * Parses numeric tokens (English and Malay words, or plain numbers)
 */
function parseNumeralToken(token: string): number | null {
  const clean = token.trim();
  if (WORD_TO_NUMBER[clean] !== undefined) {
    return WORD_TO_NUMBER[clean];
  }
  const parsed = parseFloat(clean);
  return !isNaN(parsed) && parsed > 0 ? parsed : null;
}

/**
 * Extracts portion and quantity from a surrounding text clause for each food
 */
function extractPortionFromClause(clause: string): {
  quantity: number;
  unit: string;
  detectedTokens: DetectedKeyword[];
} {
  let quantity = 1;
  let unit = 'serving';
  const detectedTokens: DetectedKeyword[] = [];
  const lower = clause.toLowerCase();

  // 1. Grams match (e.g. "200g", "150 gram")
  const gramMatch = lower.match(/(\d+(\.\d+)?)\s*(g|grams|gram)/i);
  if (gramMatch) {
    quantity = parseFloat(gramMatch[1]);
    unit = 'g';
    detectedTokens.push({ token: `${gramMatch[1]}g`, type: 'quantity', color: 'purple' });
    return { quantity, unit, detectedTokens };
  }

  // 2. Digit match, otherwise number words
  const digitMatch = lower.match(/\b(\d+(\.\d+)?)\b/);
  if (digitMatch && digitMatch[1]) {
    quantity = parseFloat(digitMatch[1]);
    detectedTokens.push({ token: `${digitMatch[1]}`, type: 'quantity', color: 'purple' });
  } else {
    const words = lower.split(/[\s,.]+/);
    for (const w of words) {
      const n = parseNumeralToken(w);
      if (n !== null && WORD_TO_NUMBER[w] !== undefined) {
        quantity = n;
        detectedTokens.push({ token: w, type: 'quantity', color: 'purple' });
        break;
      }
    }
  }

  // 3. Units in English or Malay words
  for (const u of [
    'serving', 'servings', 'plate', 'plates', 'bowl', 'bowls',
    'piece', 'pieces', 'slice', 'slices', 'cup', 'cups',
    'keping', 'biji', 'pinggan', 'mangkuk', 'cawan'
  ]) {
    if (new RegExp(`\\b${u}\\b`, 'i').test(lower)) {
      if (['cup', 'cups', 'cawan'].includes(u)) unit = 'cup';
      else if (['bowl', 'bowls', 'mangkuk'].includes(u)) unit = 'bowl';
      else if (['plate', 'plates', 'pinggan'].includes(u)) unit = 'plate';
      else if (['piece', 'pieces', 'slice', 'slices', 'keping', 'biji'].includes(u)) unit = 'piece';
      else unit = 'serving';
      detectedTokens.push({ token: u, type: 'unit', color: 'indigo' });
      break;
    }
  }

  return { quantity, unit, detectedTokens };
}

/**
 * Searches the catalog using exact, substring, phonetic alias, and Levenshtein sliding-window matching.
 * Locates start and end indices so multiple distinct foods can be extracted!
 */
export function findMatchingFoodsFuzzy(
  lowerTranscript: string,
  catalog: Food[]
): FoodMatchSpan[] {
  const matches: FoodMatchSpan[] = [];
  const words = lowerTranscript.split(/[\s,.]+/);

  for (const food of catalog) {
    const terms = [food.name.toLowerCase(), ...(food.aliases || []).map((a) => a.toLowerCase())];

    for (const term of terms) {
      // 1. Direct Substring Check (highest confidence)
      let searchPos = 0;
      while (searchPos < lowerTranscript.length) {
        const foundIdx = lowerTranscript.indexOf(term, searchPos);
        if (foundIdx === -1) break;

        const isMainName = food.name.toLowerCase() === term;
        const score = term.length * 2 + (isMainName ? 10 : 6);
        matches.push({
          food,
          matchedTerm: food.name,
          startIndex: foundIdx,
          endIndex: foundIdx + term.length,
          score: score + 50,
          similarity: 1.0,
          reason: isMainName ? 'Exact Match' : 'Alias Match',
        });

        searchPos = foundIdx + term.length;
      }

      // 2. Sliding window n-gram fuzzy matching (Levenshtein)
      const termWords = term.split(/\s+/);
      const windowSize = termWords.length;

      if (windowSize <= words.length) {
        for (let i = 0; i <= words.length - windowSize; i++) {
          const windowText = words.slice(i, i + windowSize).join(' ');
          const sim = stringSimilarity(windowText, term);

          if (sim >= 0.72) {
            const startCharIdx = lowerTranscript.indexOf(windowText);
            if (startCharIdx !== -1) {
              matches.push({
                food,
                matchedTerm: food.name,
                startIndex: startCharIdx,
                endIndex: startCharIdx + windowText.length,
                score: sim * 40 + term.length,
                similarity: sim,
                reason: `Phonetic Fuzzy (${Math.round(sim * 100)}%)`,
              });
            }
            break;
          }
        }
      }
    }
  }

  // Sort by score descending and length descending
  matches.sort((a, b) => b.score - a.score || (b.endIndex - b.startIndex) - (a.endIndex - a.startIndex));

  // Deduplicate overlapping spans to avoid colliding substring matches (e.g. "Nasi Lemak Ayam Goreng" vs "Nasi Lemak")
  const nonOverlapping: FoodMatchSpan[] = [];
  for (const candidate of matches) {
    const overlaps = nonOverlapping.some(
      (existing) =>
        candidate.startIndex < existing.endIndex && candidate.endIndex > existing.startIndex
    );
    const duplicateFood = nonOverlapping.some((existing) => existing.food.id === candidate.food.id);

    if (!overlaps && !duplicateFood) {
      nonOverlapping.push(candidate);
    }
  }

  // Sort chronologically by order of appearance in speech
  return nonOverlapping.sort((a, b) => a.startIndex - b.startIndex);
}

/**
 * Pure client-side keyword extraction, multi-food fuzzy matching, and intent parsing.
 * NO API CALLS, NO SERVER, 100% IN-BROWSER.
 */
export function detectVoiceKeywords(
  transcript: string,
  currentMealCategory?: MealType,
  foodCatalog: Food[] = SEARCHABLE_FOODS
): VoiceDetectionResult {
  const raw = transcript.trim();
  if (!raw) {
    return {
      rawTranscript: '',
      intent: 'UNKNOWN',
      confidence: 0,
      items: [],
      detectedKeywords: [],
      summary: 'Listening for meal or water keywords...',
      canExecute: false,
    };
  }

  // Pre-process phonetics to catch "roti can I", "nasty lemak", etc.
  const normalizedTranscript = preprocessPhonetics(raw);
  const lower = normalizedTranscript.toLowerCase();
  const detectedKeywords: DetectedKeyword[] = [];

  // 1. Detect Intent words
  for (const kw of LOG_INTENT_KEYWORDS) {
    if (lower.includes(kw)) {
      detectedKeywords.push({ token: kw, type: 'intent', color: 'emerald' });
      break;
    }
  }

  // 2. Detect Meal Category
  let category: MealType | undefined = undefined;
  for (const [catKey, keywords] of Object.entries(CATEGORY_KEYWORDS) as [MealType, string[]][]) {
    for (const kw of keywords) {
      if (new RegExp(`\\b${kw}\\b`, 'i').test(lower)) {
        category = catKey;
        detectedKeywords.push({ token: kw, type: 'category', color: 'amber' });
        break;
      }
    }
    if (category) break;
  }

  if (!category) {
    category = currentMealCategory || getDefaultMealCategoryByHour();
  }

  // 3. Check for Water / Hydration intent in speech
  let waterAmountMl: number | undefined = undefined;
  const containsWaterWord = WATER_KEYWORDS.some(k => lower.includes(k));
  if (containsWaterWord) {
    const waterCheck = parseWaterVoiceCommand(raw, lower, []);
    if (waterCheck.waterAmountMl && waterCheck.waterAmountMl > 0) {
      waterAmountMl = waterCheck.waterAmountMl;
      detectedKeywords.push({ token: `${waterAmountMl} ml water`, type: 'water', color: 'sky' });
    }
  }

  // 4. Find all matching food items in transcript (Supports MULTIPLE FOODS!)
  const foodMatches = findMatchingFoodsFuzzy(lower, foodCatalog);

  // If only water was mentioned (no foods)
  if (foodMatches.length === 0 && containsWaterWord) {
    return parseWaterVoiceCommand(raw, lower, detectedKeywords);
  }

  // 5. Parse food voice command with Multiple Food Items support
  return parseFoodVoiceCommand(raw, lower, category, detectedKeywords, foodMatches, waterAmountMl);
}

function parseWaterVoiceCommand(
  raw: string,
  lower: string,
  detectedKeywords: DetectedKeyword[]
): VoiceDetectionResult {
  let waterAmountMl = 250;
  let quantity = 1;
  let unit = 'glass';

  for (const kw of ['drink', 'drank', 'add', 'logged', 'log', 'minum']) {
    if (lower.includes(kw)) {
      detectedKeywords.push({ token: kw, type: 'intent', color: 'emerald' });
      break;
    }
  }

  for (const w of ['water', 'air', 'hydration', 'h2o']) {
    if (lower.includes(w)) {
      detectedKeywords.push({ token: w, type: 'water', color: 'sky' });
      break;
    }
  }

  const mlMatch = lower.match(/(\d+(\.\d+)?)\s*(ml|milliliter|millilitre|milliliters|millilitres)/i);
  const literMatch = lower.match(/(\d+(\.\d+)?)\s*(l|liter|litre|liters|litres)/i);

  if (mlMatch) {
    waterAmountMl = Math.round(parseFloat(mlMatch[1]));
    quantity = waterAmountMl;
    unit = 'ml';
    detectedKeywords.push({ token: `${mlMatch[1]} ml`, type: 'quantity', color: 'blue' });
  } else if (literMatch) {
    const lVal = parseFloat(literMatch[1]);
    waterAmountMl = Math.round(lVal * 1000);
    quantity = lVal;
    unit = 'L';
    detectedKeywords.push({ token: `${literMatch[1]} L`, type: 'quantity', color: 'blue' });
  } else {
    let foundNum: number | null = null;
    const digitMatch = lower.match(/(\d+(\.\d+)?)\s*(glass|glasses|cup|cups|bottle|bottles|mug|mugs)?/i);
    if (digitMatch && digitMatch[1]) {
      foundNum = parseFloat(digitMatch[1]);
    } else {
      const words = lower.split(/[\s,.]+/);
      for (const w of words) {
        if (WORD_TO_NUMBER[w] !== undefined) {
          foundNum = WORD_TO_NUMBER[w];
          break;
        }
      }
    }

    if (foundNum !== null && !isNaN(foundNum) && foundNum > 0) {
      quantity = foundNum;
      detectedKeywords.push({ token: `${quantity}`, type: 'quantity', color: 'blue' });
    }

    if (lower.includes('bottle') || lower.includes('botol')) {
      unit = 'bottle';
      waterAmountMl = Math.round(quantity * 500);
      detectedKeywords.push({ token: 'bottle', type: 'unit', color: 'indigo' });
    } else if (lower.includes('cup') || lower.includes('cawan')) {
      unit = 'cup';
      waterAmountMl = Math.round(quantity * 200);
      detectedKeywords.push({ token: 'cup', type: 'unit', color: 'indigo' });
    } else {
      unit = 'glass';
      waterAmountMl = Math.round(quantity * 250);
      if (lower.includes('glass') || lower.includes('gelas')) {
        detectedKeywords.push({ token: 'glass', type: 'unit', color: 'indigo' });
      }
    }
  }

  const confidence = 0.95;
  const summary = `Add +${waterAmountMl} ml water (${quantity} ${unit}${quantity > 1 && !['ml', 'L'].includes(unit) ? 's' : ''})`;

  return {
    rawTranscript: raw,
    intent: 'LOG_WATER',
    confidence,
    items: [],
    waterAmountMl,
    quantity,
    unit,
    detectedKeywords,
    summary,
    canExecute: waterAmountMl > 0,
  };
}

function parseFoodVoiceCommand(
  raw: string,
  lower: string,
  category: MealType,
  detectedKeywords: DetectedKeyword[],
  foodMatches: FoodMatchSpan[],
  waterAmountMl?: number
): VoiceDetectionResult {
  const items: DetectedFoodItem[] = [];
  const suggestions: Array<{ food: Food; similarity: number; matchedReason: string }> = [];

  // Extract each matched food along with its specific quantity and unit from adjacent speech clauses
  if (foodMatches.length > 0) {
    for (let i = 0; i < foodMatches.length; i++) {
      const match = foodMatches[i];
      detectedKeywords.push({
        token: match.matchedTerm,
        type: 'food',
        color: 'emerald',
      });

      // Bounding clause before this food
      const prevBoundary = i === 0 ? 0 : foodMatches[i - 1].endIndex;
      const clauseBefore = lower.substring(prevBoundary, match.startIndex);

      // Bounding clause after this food
      const nextBoundary = i === foodMatches.length - 1 ? lower.length : foodMatches[i + 1].startIndex;
      const clauseAfter = lower.substring(match.endIndex, nextBoundary);

      // Extract individual portion for this food
      const portion = extractPortionFromClause(`${clauseBefore} ${clauseAfter}`);
      detectedKeywords.push(...portion.detectedTokens);

      items.push({
        food: match.food,
        quantity: portion.quantity,
        unit: portion.unit,
        category,
      });

      suggestions.push({
        food: match.food,
        similarity: match.similarity,
        matchedReason: match.reason,
      });
    }
  }

  const hasFood = items.length > 0;
  const hasWater = waterAmountMl !== undefined && waterAmountMl > 0;
  const isMulti = items.length > 1 || (items.length >= 1 && hasWater);
  const intent = isMulti ? 'LOG_MULTI' : hasFood ? 'LOG_FOOD' : 'UNKNOWN';

  const confidence = hasFood ? Math.min(0.98, (foodMatches[0]?.similarity || 0.8) + 0.1) : 0.35;
  const canExecute = hasFood || hasWater;

  let summary = '';
  if (items.length > 1) {
    const listStr = items.map((it) => `${it.quantity} ${it.unit} ${it.food.name}`).join(' + ');
    const totalCals = items.reduce((acc, it) => {
      const factor = it.quantity || 1;
      return (
        acc +
        (it.unit === 'g'
          ? Math.round((it.food.nutrients.calories * factor) / (it.food.servingSize || 100))
          : Math.round(it.food.nutrients.calories * factor))
      );
    }, 0);
    summary = `Log ${items.length} foods: ${listStr}${hasWater ? ` & +${waterAmountMl}ml Water` : ''} to ${category.toUpperCase()} (~${totalCals} kcal)`;
  } else if (items.length === 1) {
    const single = items[0];
    const singleCals =
      single.unit === 'g'
        ? Math.round((single.food.nutrients.calories * single.quantity) / (single.food.servingSize || 100))
        : Math.round(single.food.nutrients.calories * single.quantity);

    summary = `Log ${single.quantity} ${single.unit} of "${single.food.name}"${hasWater ? ` & +${waterAmountMl}ml Water` : ''} to ${category.toUpperCase()} (~${singleCals} kcal)`;
  } else {
    summary = `Detected category ${category.toUpperCase()}. Say a food like "Nasi Lemak and Teh Tarik" to match.`;
  }

  return {
    rawTranscript: raw,
    intent,
    confidence,
    items,
    matchedFood: items[0]?.food,
    suggestions,
    category,
    quantity: items[0]?.quantity || 1,
    unit: items[0]?.unit || 'serving',
    waterAmountMl,
    detectedKeywords,
    summary,
    canExecute,
  };
}