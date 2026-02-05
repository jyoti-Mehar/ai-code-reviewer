// src/controllers/analyzeController.js

const analyzeCode = require("../services/codeAnalyzer");

let history = []; // last results store karega

exports.uploadAndAnalyze = (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  const code = req.file.buffer.toString("utf-8");
  const analysis = analyzeCode(code);

  const result = {
    filename: req.file.originalname,
    ...analysis
  };

  // 🔁 History maintain (last 5)
  history.unshift({
    file: result.filename,
    score: result.qualityScore
  });

  if (history.length > 5) history.pop();

  result.history = history;

  res.json(result);
};
