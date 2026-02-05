let analysisHistory = [];

async function uploadFile() {
  const fileInput = document.getElementById("fileInput");
  const resultDiv = document.getElementById("result");
  const previewDiv = document.getElementById("codePreview");
  const historyDiv = document.getElementById("history");

  if (fileInput.files.length === 0) {
    alert("Please select a file");
    return;
  }

  const file = fileInput.files[0];

  // 🔒 File size validation (500KB)
  if (file.size > 500 * 1024) {
    alert("File too large (max 500KB)");
    return;
  }

  const formData = new FormData();
  formData.append("file", file);

  resultDiv.innerHTML = "Analyzing file...";

  try {
    const response = await fetch("http://localhost:5000/api/analyze/upload", {
      method: "POST",
      body: formData
    });

    const data = await response.json();

    // ---------- SCORE LOGIC ----------
    let score = 100;
    if (data.consoleLogCount > 0) score -= 5;
    if (data.totalLines > 100) score -= 10;

    // ---------- SECURITY LEVEL ----------
    let security = "High";
    if (data.consoleLogCount > 0) security = "Medium";
    if (data.totalLines > 200) security = "Low";

    // ---------- LINE BASED SUGGESTIONS ----------
    const suggestions = [];
    if (data.consoleLogCount > 0) {
      suggestions.push("Line based: Avoid console.log in production");
    }
    if (data.totalLines > 100) {
      suggestions.push("Line based: Split long files into modules");
    }

    // ---------- RESULT UI ----------
    resultDiv.innerHTML = `
      <div class="result-card">
        <h3>📊 Analysis Result</h3>
        <p><b>File:</b> ${data.filename}</p>
        <p><b>Quality Score:</b> ${score}/100</p>
        <p><b>Total Lines:</b> ${data.totalLines}</p>
        <p><b>Security Level:</b> ${security}</p>

        <h4>⚠️ Warnings</h4>
        <ul>
          <li>Long Function: ${data.warnings?.longFunction ? "Yes ❌" : "No ✅"}</li>
          <li>Too Many Logs: ${data.warnings?.tooManyConsoleLogs ? "Yes ❌" : "No ✅"}</li>
        </ul>

        <h4>💡 Suggestions</h4>
        <ul>
          ${suggestions.map(s => `<li>${s}</li>`).join("")}
        </ul>
      </div>
    `;

    // ---------- CODE PREVIEW ----------
    const text = await file.text();
    const lines = text.split("\n");
    previewDiv.innerHTML = `
      <h3>🧾 Code Preview</h3>
      <pre style="background:#111;color:#0f0;padding:10px;">
${lines.map((l, i) => `${i + 1}: ${l}`).join("\n")}
      </pre>
    `;

    // ---------- HISTORY ----------
    analysisHistory.push({ file: data.filename, score });
    if (analysisHistory.length > 2) analysisHistory.shift();

    historyDiv.innerHTML = `
      <h3>🕒 History (Last 2)</h3>
      <ul>
        ${analysisHistory.map(h => `<li>${h.file} → ${h.score}/100</li>`).join("")}
      </ul>
    `;

  } catch (error) {
    console.error(error);
    resultDiv.innerHTML = "Error connecting to backend";
  }
}

function clearResult() {
  document.getElementById("result").innerHTML = "";
  document.getElementById("codePreview").innerHTML = "";
  document.getElementById("history").innerHTML = "";
}

function toggleDarkMode() {
  document.body.classList.toggle("dark");
}
