import {
  buildActionItems,
  buildSummary,
  extractKeyPoints,
  normalizeText,
  splitIntoSentences,
} from "../utils/textHelpers.js";

export function buildInsightsFromText(text) {
  const normalizedText = normalizeText(text);
  const sentences = splitIntoSentences(normalizedText);

  return {
    summary: buildSummary(sentences, normalizedText),
    keyPoints: extractKeyPoints(sentences),
    nextActions: buildActionItems(sentences),
  };
}
