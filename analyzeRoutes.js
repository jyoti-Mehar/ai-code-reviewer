const express = require("express");
const multer = require("multer");

const router = express.Router();

// multer config (memory storage)
const upload = multer({ storage: multer.memoryStorage() });

router.post("/upload", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  const content = req.file.buffer.toString("utf-8");
  const lines = content.split("\n");

  const consoleLogs = lines.filter(line =>
    line.includes("console.log")
  ).length;

  const longFunction = lines.length > 50;

  const score =
    100 -
    (longFunction ? 10 : 0) -
    (consoleLogs > 5 ? 10 : 0);

  res.json({
    filename: req.file.originalname,
    totalLines: lines.length,
    consoleLogCount: consoleLogs,
    securityLevel: consoleLogs > 0 ? "Medium" : "High",
    warnings: {
      longFunction,
      tooManyLogs: consoleLogs > 5
    },
    suggestions: [
      "Avoid console.log in production",
      "Break long functions",
      "Use meaningful variable names"
    ],
    score
  });
});

module.exports = router;
