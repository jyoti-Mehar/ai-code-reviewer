// src/services/codeAnalyzer.js

function analyzeCode(code) {
  const lines = code.split("\n");

  let consoleCount = 0;
  let longFunction = false;
  let suggestions = [];
  let securityLevel = "High";

  lines.forEach((line, index) => {
    if (line.includes("console.log")) {
      consoleCount++;
      suggestions.push({
        line: index + 1,
        message: "Avoid console.log in production"
      });
    }

    if (line.length > 120) {
      longFunction = true;
      suggestions.push({
        line: index + 1,
        message: "Line is too long, consider breaking it"
      });
    }

    if (line.includes("eval(")) {
      securityLevel = "Low";
      suggestions.push({
        line: index + 1,
        message: "Avoid using eval(), security risk"
      });
    }
  });

  if (securityLevel !== "Low" && consoleCount > 3) {
    securityLevel = "Medium";
  }

  // ✅ Stable Score Logic
  let score = 100;
  score -= consoleCount * 5;
  if (longFunction) score -= 10;
  if (securityLevel === "Medium") score -= 10;
  if (securityLevel === "Low") score -= 30;
  if (score < 0) score = 0;

  return {
    totalLines: lines.length,
    consoleLogs: consoleCount,
    qualityScore: score,
    securityLevel,
    warnings: {
      longFunction: longFunction,
      tooManyLogs: consoleCount > 3
    },
    suggestions,
    preview: lines.slice(0, 200) // code preview
  };
}

module.exports = analyzeCode;
