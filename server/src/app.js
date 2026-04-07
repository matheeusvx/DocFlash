import cors from "cors";
import express from "express";
import uploadRoutes from "./routes/uploadRoutes.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { notFound } from "./middleware/notFound.js";

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
  }),
);
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/upload", uploadRoutes);
app.use(notFound);
app.use(errorHandler);

export default app;
