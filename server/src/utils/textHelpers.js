const ACTION_HINTS = [
  "deve",
  "precisa",
  "proximo",
  "action",
  "follow-up",
  "follow up",
  "agendar",
  "enviar",
  "revisar",
  "aprovar",
  "implementar",
  "ajustar",
  "validar",
];

const STOPWORDS = new Set([
  "a",
  "as",
  "o",
  "os",
  "e",
  "de",
  "da",
  "do",
  "das",
  "dos",
  "em",
  "um",
  "uma",
  "para",
  "com",
  "na",
  "no",
  "nas",
  "nos",
  "por",
  "que",
  "se",
  "ao",
  "aos",
  "como",
  "mais",
  "menos",
  "muito",
  "muita",
  "muitas",
  "muitos",
  "the",
  "and",
  "for",
  "with",
  "this",
  "that",
  "from",
  "are",
  "was",
  "were",
  "will",
  "have",
  "has",
  "had",
  "uma",
  "sobre",
  "entre",
  "apos",
]);

export function normalizeText(text) {
  return text.replace(/\s+/g, " ").trim();
}

export function splitIntoSentences(text) {
  return text
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter((sentence) => sentence.length > 0);
}

function summarizeByFrequency(text, limit = 2) {
  const sentences = splitIntoSentences(text);
  const tokens = text
    .toLowerCase()
    .match(/[\p{L}\p{N}-]+/gu)
    ?.filter((token) => token.length > 3 && !STOPWORDS.has(token)) || [];

  const frequencies = tokens.reduce((accumulator, token) => {
    accumulator[token] = (accumulator[token] || 0) + 1;
    return accumulator;
  }, {});

  const rankedSentences = sentences
    .map((sentence) => {
      const score = (sentence.toLowerCase().match(/[\p{L}\p{N}-]+/gu) || []).reduce(
        (sum, token) => sum + (frequencies[token] || 0),
        0,
      );

      return { sentence, score };
    })
    .sort((left, right) => right.score - left.score)
    .slice(0, limit)
    .map((item) => item.sentence);

  return rankedSentences.join(" ");
}

export function buildSummary(sentences, text) {
  if (sentences.length === 0) {
    return "Nao foi possivel gerar resumo para o conteudo enviado.";
  }

  if (sentences.length <= 2) {
    return sentences.join(" ");
  }

  return summarizeByFrequency(text, 2);
}

export function extractKeyPoints(sentences) {
  if (sentences.length === 0) {
    return ["Nenhum ponto-chave identificado."];
  }

  return sentences
    .slice(0, 6)
    .sort((left, right) => right.length - left.length)
    .slice(0, 3);
}

export function buildActionItems(sentences) {
  const actions = sentences.filter((sentence) =>
    ACTION_HINTS.some((hint) => sentence.toLowerCase().includes(hint)),
  );

  if (actions.length > 0) {
    return actions.slice(0, 3);
  }

  return [
    "Revisar o conteudo extraido e validar se o resumo cobre os pontos principais.",
    "Confirmar com o responsavel quais itens exigem acompanhamento.",
    "Registrar as proximas etapas identificadas no documento.",
  ];
}
