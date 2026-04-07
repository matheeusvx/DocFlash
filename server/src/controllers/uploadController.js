import { extractTextFromFile } from "../services/fileParserService.js";
import { buildInsightsFromText } from "../services/textInsightsService.js";

export async function uploadDocument(req, res, next) {
  try {
    if (!req.file) {
      const error = new Error("Selecione um arquivo PDF ou TXT para enviar.");
      error.statusCode = 400;
      throw error;
    }

    const extractedText = await extractTextFromFile(req.file);
    const insights = buildInsightsFromText(extractedText);

    res.json({
      fileName: req.file.originalname,
      mimeType: req.file.mimetype,
      extractedText,
      ...insights,
    });
  } catch (error) {
    next(error);
  }
}
