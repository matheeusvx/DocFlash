const { parseUploadedFile } = require("../services/fileParserService");
const { analyzeDocumentText } = require("../services/analysisService");
const ApiError = require("../utils/apiError");

async function handleUpload(req, res, next) {
  try {
    if (!req.file) {
      throw new ApiError(400, "Selecione um arquivo PDF ou TXT.");
    }

    const extractedText = await parseUploadedFile(req.file);
    const insights = await analyzeDocumentText(extractedText);

    res.json({
      fileName: req.file.originalname,
      mimeType: req.file.mimetype,
      extractedTextLength: extractedText.length,
      ...insights
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  handleUpload
};
