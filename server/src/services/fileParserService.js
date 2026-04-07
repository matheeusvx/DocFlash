const path = require("path");
const pdfParse = require("pdf-parse");

const ApiError = require("../utils/apiError");
const { normalizeWhitespace } = require("../utils/textHelpers");

async function parseUploadedFile(file) {
  const extension = path.extname(file.originalname).toLowerCase();

  if (extension === ".pdf") {
    const data = await pdfParse(file.buffer);
    return validateExtractedText(normalizeWhitespace(data.text));
  }

  if (extension === ".txt") {
    return validateExtractedText(normalizeWhitespace(file.buffer.toString("utf-8")));
  }

  throw new ApiError(400, "Formato de arquivo nao suportado.");
}

function validateExtractedText(text) {
  if (!text || text.trim().length === 0) {
    throw new ApiError(422, "Nao foi possivel extrair texto util do arquivo enviado.");
  }

  return text;
}

module.exports = {
  parseUploadedFile
};
