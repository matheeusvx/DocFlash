const { GoogleGenAI } = require("@google/genai");

const ApiError = require("../utils/apiError");

const DEFAULT_MODEL = "gemini-2.5-flash";
const MAX_DOCUMENT_CHARS = 32000;
const MIN_KEY_POINTS = 3;
const MIN_NEXT_ACTIONS = 2;

const ANALYSIS_SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    summary: {
      type: "string",
      description: "Resumo executivo curto, claro e em portugues do Brasil."
    },
    keyPoints: {
      type: "array",
      description: "Lista com os pontos mais importantes do documento em portugues do Brasil.",
      items: { type: "string" }
    },
    nextActions: {
      type: "array",
      description: "Lista com proximas acoes praticas e coerentes com o documento em portugues do Brasil.",
      items: { type: "string" }
    }
  },
  required: ["summary", "keyPoints", "nextActions"]
};

async function analyzeDocumentText(text) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new ApiError(
      500,
      "A analise por IA ainda nao foi configurada no servidor. Defina a GEMINI_API_KEY no arquivo .env."
    );
  }

  const normalizedDocument = normalizeDocumentText(text);

  if (!normalizedDocument) {
    throw new ApiError(422, "Nao encontramos texto suficiente neste arquivo para gerar uma analise.");
  }

  const client = new GoogleGenAI({ apiKey });

  try {
    const response = await client.models.generateContent({
      model: process.env.GEMINI_MODEL || DEFAULT_MODEL,
      contents: buildPrompt(normalizedDocument),
      config: {
        responseMimeType: "application/json",
        responseJsonSchema: ANALYSIS_SCHEMA,
        systemInstruction:
          "Voce e um assistente especializado em resumir documentos de forma objetiva, clara e util. Responda sempre em portugues do Brasil. Devolva apenas JSON valido e nao inclua texto fora do JSON.",
        temperature: 0.2,
        maxOutputTokens: 700
      }
    });

    const parsedResult = extractAnalysisPayload(response);
    return normalizeAnalysisResult(parsedResult, normalizedDocument);
  } catch (error) {
    throw mapGeminiError(error);
  }
}

function buildPrompt(documentText) {
  return [
    "Analise o texto enviado e devolva apenas JSON valido com esta estrutura:",
    "{",
    '  "summary": "resumo executivo curto e claro",',
    '  "keyPoints": ["ponto 1", "ponto 2", "ponto 3"],',
    '  "nextActions": ["acao 1", "acao 2"]',
    "}",
    "Regras:",
    "- destaque apenas os pontos mais importantes",
    "- evite repetir trechos do documento sem necessidade",
    "- as proximas acoes devem ser praticas e coerentes com o conteudo",
    "- nao inclua texto fora do JSON",
    "",
    "Documento:",
    documentText
  ].join("\n");
}

function normalizeDocumentText(text) {
  const rawText = String(text || "")
    .replace(/\r\n?/g, "\n")
    .replace(/\t/g, " ")
    .trim();

  if (!rawText) {
    return "";
  }

  const paragraphs = rawText
    .split(/\n{2,}/)
    .map((paragraph) =>
      paragraph
        .split("\n")
        .map((line) => line.replace(/[^\S\n]+/g, " ").trim())
        .filter(Boolean)
        .join(" ")
    )
    .filter(Boolean);

  const normalized = paragraphs.join("\n\n").trim();

  if (normalized.length <= MAX_DOCUMENT_CHARS) {
    return normalized;
  }

  return truncatePreservingLegibility(normalized, MAX_DOCUMENT_CHARS);
}

function truncatePreservingLegibility(text, maxChars) {
  const slice = text.slice(0, maxChars);
  const safeWindowStart = Math.floor(maxChars * 0.6);
  const paragraphBreak = slice.lastIndexOf("\n\n");
  if (paragraphBreak >= safeWindowStart) {
    return slice.slice(0, paragraphBreak).trim();
  }

  const sentenceBreak = Math.max(slice.lastIndexOf(". "), slice.lastIndexOf("! "), slice.lastIndexOf("? "));
  if (sentenceBreak >= safeWindowStart) {
    return slice.slice(0, sentenceBreak + 1).trim();
  }

  const wordBreak = slice.lastIndexOf(" ");
  if (wordBreak >= safeWindowStart) {
    return slice.slice(0, wordBreak).trim();
  }

  return slice.trim();
}

function extractAnalysisPayload(response) {
  if (isPlainObject(response?.parsed)) {
    return response.parsed;
  }

  const textCandidates = collectTextCandidates(response);

  for (const candidate of textCandidates) {
    const parsed = tryParseAnalysisObject(candidate);
    if (parsed) {
      return parsed;
    }
  }

  return null;
}

function collectTextCandidates(response) {
  const candidates = [];
  const rawText = typeof response?.text === "string" ? response.text : "";
  const rawParsedText = typeof response?.parsed === "string" ? response.parsed : "";

  if (rawText.trim()) {
    candidates.push(rawText.trim());
  }

  if (rawParsedText.trim()) {
    candidates.push(rawParsedText.trim());
  }

  if (Array.isArray(response?.candidates)) {
    response.candidates.forEach((candidate) => {
      const parts = candidate?.content?.parts;
      if (!Array.isArray(parts)) {
        return;
      }

      parts.forEach((part) => {
        if (typeof part?.text === "string" && part.text.trim()) {
          candidates.push(part.text.trim());
        }
      });
    });
  }

  return [...new Set(candidates)];
}

function tryParseAnalysisObject(rawText) {
  if (!rawText || typeof rawText !== "string") {
    return null;
  }

  const directJson = safeJsonParse(rawText);
  if (isPlainObject(directJson)) {
    return directJson;
  }

  const fencedMatch = rawText.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fencedMatch) {
    const fencedJson = safeJsonParse(fencedMatch[1]);
    if (isPlainObject(fencedJson)) {
      return fencedJson;
    }
  }

  const objectSlice = extractObjectSlice(rawText);
  if (objectSlice) {
    const slicedJson = safeJsonParse(objectSlice);
    if (isPlainObject(slicedJson)) {
      return slicedJson;
    }
  }

  return parseLabeledFallback(rawText);
}

function extractObjectSlice(rawText) {
  const firstBrace = rawText.indexOf("{");
  const lastBrace = rawText.lastIndexOf("}");

  if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
    return "";
  }

  return rawText.slice(firstBrace, lastBrace + 1);
}

function safeJsonParse(value) {
  try {
    return JSON.parse(value);
  } catch (_error) {
    return null;
  }
}

function parseLabeledFallback(rawText) {
  const lines = rawText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length === 0) {
    return null;
  }

  const summary = findLabeledValue(lines, /^(summary|resumo)\s*[:\-]/i);
  const keyPoints = findSectionBullets(lines, /^(key ?points|pontos[- ]?chave)\s*[:\-]?/i);
  const nextActions = findSectionBullets(lines, /^(next ?actions|proximas? acoes)\s*[:\-]?/i);

  if (!summary && keyPoints.length === 0 && nextActions.length === 0) {
    return null;
  }

  return {
    summary,
    keyPoints,
    nextActions
  };
}

function findLabeledValue(lines, matcher) {
  const line = lines.find((entry) => matcher.test(normalizeForMatching(entry)));
  if (!line) {
    return "";
  }

  return line.replace(/^[^:\-]+[:\-]\s*/, "").trim();
}

function findSectionBullets(lines, matcher) {
  const sectionIndex = lines.findIndex((entry) => matcher.test(normalizeForMatching(entry)));
  if (sectionIndex === -1) {
    return [];
  }

  const items = [];

  for (let index = sectionIndex + 1; index < lines.length; index += 1) {
    const currentLine = lines[index];
    const normalizedLine = normalizeForMatching(currentLine);

    if (/^(summary|resumo|key ?points|pontos[- ]?chave|next ?actions|proximas? acoes)\s*[:\-]?/i.test(normalizedLine)) {
      break;
    }

    if (/^(?:[-*]|\d+[.)])\s*/.test(currentLine)) {
      items.push(currentLine.replace(/^(?:[-*]|\d+[.)])\s*/, "").trim());
    }
  }

  return items;
}

function normalizeForMatching(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function normalizeAnalysisResult(result, documentText) {
  const fallbackAnalysis = buildFallbackAnalysis(documentText);
  const source = isPlainObject(result) ? result : fallbackAnalysis;

  const summary = normalizeString(source.summary, 1400) || fallbackAnalysis.summary;
  const keyPoints = ensureMinimumItems(normalizeStringList(source.keyPoints, 5), MIN_KEY_POINTS, () =>
    fallbackAnalysis.keyPoints
  );
  const nextActions = ensureMinimumItems(normalizeStringList(source.nextActions, 4), MIN_NEXT_ACTIONS, () =>
    fallbackAnalysis.nextActions
  );

  return {
    summary,
    keyPoints,
    nextActions
  };
}

function normalizeString(value, maxLength) {
  return String(value || "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
}

function normalizeStringList(value, maxItems) {
  if (!Array.isArray(value)) {
    return [];
  }

  return [...new Set(value.map((item) => normalizeString(item, 240)).filter(Boolean))].slice(0, maxItems);
}

function ensureMinimumItems(items, minimum, fallbackFactory) {
  const normalizedItems = Array.isArray(items) ? [...items] : [];
  const fallbacks = fallbackFactory();

  for (const fallbackItem of fallbacks) {
    if (normalizedItems.length >= minimum) {
      break;
    }

    if (fallbackItem && !normalizedItems.includes(fallbackItem)) {
      normalizedItems.push(fallbackItem);
    }
  }

  return normalizedItems.slice(0, Math.max(minimum, normalizedItems.length));
}

function buildFallbackAnalysis(documentText) {
  return {
    summary: buildFallbackSummary(documentText),
    keyPoints: buildFallbackKeyPoints(documentText),
    nextActions: buildFallbackNextActions(documentText)
  };
}

function buildFallbackSummary(documentText) {
  const sentences = splitIntoSentences(documentText);

  if (sentences.length > 0) {
    return normalizeString(sentences.slice(0, 2).join(" "), 500);
  }

  const compact = normalizeDocumentText(documentText);
  if (!compact) {
    return "Nao foi possivel montar um resumo detalhado, mas o documento foi processado com sucesso.";
  }

  return compact.length > 320 ? `${compact.slice(0, 317).trim()}...` : compact;
}

function buildFallbackKeyPoints(documentText) {
  const sentences = splitIntoSentences(documentText);

  if (sentences.length >= 3) {
    return sentences.slice(0, 3).map((sentence) => normalizeString(sentence, 220));
  }

  const keywords = extractKeywords(documentText);
  if (keywords.length > 0) {
    return [
      `O documento destaca temas relacionados a "${keywords[0]}".`,
      `Ha pontos importantes conectados a "${keywords[1] || keywords[0]}".`,
      `Vale revisar os detalhes ligados a "${keywords[2] || keywords[0]}".`
    ];
  }

  return [
    "O documento foi processado com sucesso.",
    "Os principais pontos exigem revisao humana complementar.",
    "Alguns detalhes podem precisar de validacao adicional."
  ];
}

function buildFallbackNextActions(documentText) {
  const actionSentences = splitIntoSentences(documentText).filter((sentence) =>
    /(deve|precisa|recomenda|proximo passo|acao|revisar|validar|aprovar|definir|ajustar|implementar)/i.test(
      normalizeForMatching(sentence)
    )
  );

  if (actionSentences.length >= 2) {
    return actionSentences.slice(0, 2).map((sentence) => normalizeString(sentence, 220));
  }

  const keywords = extractKeywords(documentText);

  if (keywords.length >= 2) {
    return [
      `Revisar os pontos relacionados a "${keywords[0]}".`,
      `Definir os proximos encaminhamentos sobre "${keywords[1]}".`
    ];
  }

  return [
    "Revisar o resumo gerado e validar se ele representa o documento.",
    "Definir as proximas acoes com base nos pontos identificados."
  ];
}

function splitIntoSentences(text) {
  return String(text || "")
    .replace(/\n+/g, " ")
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter((sentence) => sentence.length > 20);
}

function extractKeywords(text) {
  const counts = new Map();
  const stopWords = new Set([
    "para",
    "com",
    "uma",
    "sobre",
    "entre",
    "pelos",
    "pelas",
    "documento",
    "arquivo",
    "texto",
    "resumo",
    "este",
    "essa",
    "isso",
    "mais",
    "menos"
  ]);

  String(text || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .match(/[\p{L}0-9]{4,}/gu)
    ?.forEach((word) => {
      if (stopWords.has(word)) {
        return;
      }

      counts.set(word, (counts.get(word) || 0) + 1);
    });

  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([word]) => word);
}

function mapGeminiError(error) {
  if (error instanceof ApiError) {
    return error;
  }

  const status = error?.status;

  if (status === 400) {
    return new ApiError(502, "Nao conseguimos interpretar este documento para analise agora. Tente novamente com outro arquivo ou em alguns instantes.");
  }

  if (status === 401 || status === 403) {
    return new ApiError(502, "A integracao com o Gemini nao esta configurada corretamente no servidor.");
  }

  if (status === 429) {
    return new ApiError(503, "O servico de analise esta ocupado no momento. Tente novamente em instantes.");
  }

  if (status >= 500) {
    return new ApiError(502, "Nao foi possivel analisar o documento agora. Tente novamente em instantes.");
  }

  return new ApiError(502, "Nao foi possivel concluir a analise deste documento no momento.");
}

function isPlainObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

module.exports = {
  analyzeDocumentText
};
