import type { Item } from './supabase';

export interface MatchResult {
  foundItem: Item;
  score: number;
  reasons: string[];
}

function normalizeText(text: string): string {
  return text.toLowerCase().trim().replace(/\s+/g, ' ');
}

function textSimilarity(a: string, b: string): number {
  const na = normalizeText(a);
  const nb = normalizeText(b);
  if (na === nb) return 1;
  if (na.includes(nb) || nb.includes(na)) return 0.85;
  const wordsA = new Set(na.split(' ').filter((w) => w.length > 2));
  const wordsB = new Set(nb.split(' ').filter((w) => w.length > 2));
  if (wordsA.size === 0 || wordsB.size === 0) return 0;
  let common = 0;
  for (const w of wordsA) {
    if (wordsB.has(w)) common++;
  }
  return common / Math.max(wordsA.size, wordsB.size);
}

function featureMatchScore(lostFeatures: string, foundFeatures: string): { score: number; matched: string[] } {
  const lostList = lostFeatures.split(/[;,]/).map((f) => f.trim().toLowerCase()).filter((f) => f.length > 0);
  const foundList = foundFeatures.split(/[;,]/).map((f) => f.trim().toLowerCase()).filter((f) => f.length > 0);
  if (lostList.length === 0 || foundList.length === 0) return { score: 0, matched: [] };
  let matched = 0;
  const matchedFeatures: string[] = [];
  for (const lf of lostList) {
    for (const ff of foundList) {
      if (lf.includes(ff) || ff.includes(lf) || textSimilarity(lf, ff) > 0.5) {
        matched++;
        matchedFeatures.push(lf);
        break;
      }
    }
  }
  return { score: matched / lostList.length, matched: matchedFeatures };
}

function timeProximityScore(lostTime: string | null, foundTime: string | null): number {
  if (!lostTime || !foundTime) return 0.5;
  const lostDate = new Date(lostTime).getTime();
  const foundDate = new Date(foundTime).getTime();
  const diffHours = Math.abs(lostDate - foundDate) / (1000 * 60 * 60);
  if (diffHours < 24) return 1;
  if (diffHours < 72) return 0.8;
  if (diffHours < 168) return 0.6;
  if (diffHours < 336) return 0.4;
  return 0.2;
}

export function calculateMatchScore(lostItem: Item, foundItem: Item): MatchResult {
  const reasons: string[] = [];
  let totalScore = 0;
  let maxScore = 0;

  const weights = {
    category: 30,
    color: 20,
    features: 25,
    location: 15,
    time: 10,
  };

  maxScore = weights.category + weights.color + weights.features + weights.location + weights.time;

  // Category
  const lostCat = (lostItem.ai_category || lostItem.category || '').toLowerCase();
  const foundCat = (foundItem.ai_category || foundItem.category || '').toLowerCase();
  if (lostCat && foundCat) {
    if (lostCat === foundCat) {
      totalScore += weights.category;
      reasons.push('Exact category match');
    } else if (textSimilarity(lostCat, foundCat) > 0.5) {
      totalScore += weights.category * 0.7;
      reasons.push('Similar category');
    }
  }

  // Color
  const lostColor = (lostItem.color || '').toLowerCase();
  const foundColor = (foundItem.ai_color || foundItem.color || '').toLowerCase();
  if (lostColor && foundColor) {
    if (lostColor === foundColor) {
      totalScore += weights.color;
      reasons.push('Color matches');
    } else if (textSimilarity(lostColor, foundColor) > 0.5) {
      totalScore += weights.color * 0.5;
      reasons.push('Similar color');
    }
  }

  // Features
  const lostFeatures = lostItem.distinguishing_features || '';
  const foundFeatures = foundItem.distinguishing_features || (foundItem.ai_features || []).join('; ');
  const { score: featScore, matched } = featureMatchScore(lostFeatures, foundFeatures);
  totalScore += weights.features * featScore;
  if (matched.length > 0) {
    reasons.push(`${matched.length} distinguishing feature${matched.length > 1 ? 's' : ''} matched`);
  }

  // Location
  const locScore = textSimilarity(lostItem.location, foundItem.location);
  totalScore += weights.location * locScore;
  if (locScore > 0.5) {
    reasons.push('Same or nearby location');
  }

  // Time
  const timeScore = timeProximityScore(lostItem.reported_at, foundItem.reported_at);
  totalScore += weights.time * timeScore;
  if (timeScore > 0.7) {
    reasons.push('Reported around the same time');
  }

  const percentage = Math.round((totalScore / maxScore) * 100);
  return {
    foundItem,
    score: Math.min(percentage, 100),
    reasons,
  };
}

export function findMatchesForLost(lostItem: Item, foundItems: Item[]): MatchResult[] {
  return foundItems
    .map((f) => calculateMatchScore(lostItem, f))
    .filter((m) => m.score > 20)
    .sort((a, b) => b.score - a.score);
}

export function findMatchesForFound(foundItem: Item, lostItems: Item[]): MatchResult[] {
  return lostItems
    .map((l) => {
      const result = calculateMatchScore(l, foundItem);
      return { ...result, foundItem: foundItem, lostItem: l };
    })
    .filter((m) => m.score > 20)
    .sort((a, b) => b.score - a.score);
}

export function generateToken(): string {
  const num = Math.floor(10000 + Math.random() * 90000);
  return `RCM-${num}`;
}

export function formatDate(dateStr: string | null): string {
  if (!dateStr) return 'Unknown';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function timeAgo(dateStr: string | null): string {
  if (!dateStr) return 'Unknown';
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  if (diffHours > 0) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  const diffMin = Math.floor(diffMs / (1000 * 60));
  if (diffMin > 0) return `${diffMin} minute${diffMin > 1 ? 's' : ''} ago`;
  return 'Just now';
}
