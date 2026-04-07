const path = require("path");
const multer = require("multer");

const ApiError = require("../utils/apiError");

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024
  },
  fileFilter: (_req, file, cb) => {
    const extension = path.extname(file.originalname).toLowerCase();
    const allowedExtensions = new Set([".pdf", ".txt"]);
    const allowedMimeTypes = new Set(["application/pdf", "text/plain", ""]);

    if (allowedExtensions.has(extension) && allowedMimeTypes.has(file.mimetype)) {
      cb(null, true);
      return;
    }

    cb(new ApiError(400, "Envie apenas arquivos PDF ou TXT."));
  }
});

module.exports = upload;
