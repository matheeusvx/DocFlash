const multer = require("multer");

function errorHandler(error, _req, res, _next) {
  if (error instanceof multer.MulterError) {
    return res.status(400).json({
      message: "Falha no upload do arquivo.",
      details: error.message
    });
  }

  const statusCode = error.statusCode || 500;

  return res.status(statusCode).json({
    message: error.message || "Erro interno do servidor."
  });
}

module.exports = errorHandler;
