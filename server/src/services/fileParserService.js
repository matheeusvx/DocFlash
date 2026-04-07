import pdf from "pdf-parse";

export async function extractTextFromFile(file) {
  const mimeType = file.mimetype;

  if (mimeType === "application/pdf") {
    const parsedPdf = await pdf(file.buffer);
    const text = parsedPdf.text?.trim();

    if (!text) {
      const error = new Error("Nao foi possivel extrair texto deste PDF.");
      error.statusCode = 422;
      throw error;
    }

    return text;
  }

  if (mimeType === "text/plain") {
    const text = file.buffer.toString("utf-8").trim();

    if (!text) {
      const error = new Error("O arquivo TXT esta vazio.");
      error.statusCode = 422;
      throw error;
    }

    return text;
  }

  const error = new Error("Formato de arquivo nao suportado. Envie PDF ou TXT.");
  error.statusCode = 400;
  throw error;
}
