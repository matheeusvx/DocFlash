const STOP_WORDS = new Set([
  "a",
  "as",
  "o",
  "os",
  "de",
  "da",
  "do",
  "das",
  "dos",
  "e",
  "em",
  "para",
  "por",
  "com",
  "um",
  "uma",
  "na",
  "no",
  "nas",
  "nos",
  "que",
  "se",
  "ao",
  "aos",
  "ou",
  "the",
  "and",
  "of",
  "to",
  "for",
  "in",
  "on",
  "is",
  "are"
]);

function normalizeWhitespace(text) {
  return text.replace(/\s+/g, " ").trim();
}

function splitIntoSentences(text) {
  return text
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter((sentence) => sentence.length > 30);
}

function extractTopKeywords(text) {
  const counts = new Map();

  text
    .toLowerCase()
    .match(/[\p{L}0-9]{4,}/gu)
    ?.forEach((word) => {
      if (STOP_WORDS.has(word)) {
        return;
      }

      counts.set(word, (counts.get(word) || 0) + 1);
    });

  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([word]) => word);
}

function scoreSentences(sentences) {
  const joinedText = sentences.join(" ");
  const keywords = extractTopKeywords(joinedText);

  return sentences
    .map((sentence) => {
      const score = keywords.reduce((total, keyword) => {
        const regex = new RegExp(`\\b${keyword}\\b`, "gi");
        const matches = sentence.match(regex);
        return total + (matches ? matches.length : 0);
      }, 0);

      return {
        sentence,
        score
      };
    })
    .sort((a, b) => b.score - a.score || b.sentence.length - a.sentence.length)
    .map((item) => item.sentence);
}

function truncateText(text, maxLength) {
  if (text.length <= maxLength) {
    return text;
  }

  return `${text.slice(0, maxLength - 3).trim()}...`;
}

module.exports = {
  normalizeWhitespace,
  splitIntoSentences,
  extractTopKeywords,
  scoreSentences,
  truncateText
};
