import { Router } from "express";
import { uploadDocument } from "../controllers/uploadController.js";
import { uploadSingleDocument } from "../middleware/uploadMiddleware.js";

const router = Router();

router.post("/", uploadSingleDocument, uploadDocument);

export default router;
