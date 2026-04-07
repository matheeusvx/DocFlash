const express = require("express");
const cors = require("cors");

const uploadRoutes = require("./routes/uploadRoutes");
const errorHandler = require("./middleware/errorHandler");

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173"
  })
);
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/upload", uploadRoutes);

app.use(errorHandler);

module.exports = app;
