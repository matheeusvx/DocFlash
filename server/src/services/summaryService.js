const {
  splitIntoSentences,
  extractTopKeywords,
  scoreSentences,
  truncateText
} = require("../utils/textHelpers");

function buildInsights(text) {
  const sentences = splitIntoSentences(text);
  const rankedSentences = scoreSentences(sentences);
  const summarySource = rankedSentences.slice(0, 3);
  const summary =
    summarySource.length > 0
      ? truncateText(summarySource.join(" "), 420)
      : truncateText(text, 420);

  const keyPoints = buildKeyPoints(rankedSentences, text);
  const nextActions = buildNextActions(sentences, text);

  return {
    summary,
    keyPoints,
    nextActions
  };
}

function buildKeyPoints(rankedSentences, text) {
  if (rankedSentences.length > 0) {
    return rankedSentences.slice(0, 4).map((sentence) => truncateText(sentence, 140));
  }

  return extractTopKeywords(text).map((keyword) => `Foco em: ${keyword}`);
}

function buildNextActions(sentences, text) {
  const actionHints =
    /(deve|precisa|proximo passo|next step|acao|action|follow up|follow-up|revisar|enviar|aprovar|definir|implementar|ajustar|validar)/i;
  const candidates = sentences
    .filter((sentence) => actionHints.test(sentence))
    .slice(0, 3)
    .map((sentence) => truncateText(sentence, 140));

  if (candidates.length > 0) {
    return candidates;
  }

  const keywords = extractTopKeywords(text).slice(0, 3);
  return keywords.map((keyword, index) => {
    if (index === 0) return `Revisar o conteudo relacionado a "${keyword}".`;
    if (index === 1) return `Organizar os pontos principais envolvendo "${keyword}".`;
    return `Definir uma proxima acao pratica com base em "${keyword}".`;
  });
}

module.exports = {
  buildInsights
};
