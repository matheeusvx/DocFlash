import multer from "multer";

const storage = multer.memoryStorage();

function fileFilter(_req, file, callback) {
  const allowedMimeTypes = ["application/pdf", "text/plain"];

  if (allowedMimeTypes.includes(file.mimetype)) {
    callback(null, true);
    return;
  }

  const error = new Error("Apenas arquivos PDF e TXT sao permitidos.");
  error.statusCode = 400;
  callback(error);
}

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
});

export const uploadSingleDocument = upload.single("document");
