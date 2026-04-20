import express from "express";
import { Compiler } from "./Compiler.js";
import * as path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(express.static(path.join(__dirname, "../public")));

// Compiler instance
const compiler = new Compiler({
  solidityVersion: "^0.8.0",
  license: "MIT",
  debug: false,
});

// API endpoint for compilation
app.post("/api/compile", (req, res) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({
        success: false,
        error: "No code provided",
      });
    }

    const result = compiler.compile(code);

    res.json({
      success: result.success,
      solidityCode: result.solidityCode || "",
      errors: result.errors || [],
      warnings: result.warnings || [],
      tokenCount: result.tokenCount || 0,
      astNodeCount: result.astNodeCount || 0,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || "Compilation failed",
    });
  }
});

// API endpoint to save file
app.post("/api/save", (req, res) => {
  try {
    const { filename, code } = req.body;

    if (!filename || !code) {
      return res.status(400).json({
        success: false,
        error: "Filename and code required",
      });
    }

    // Sanitize filename
    const sanitized = filename.replace(/\\/g, "/").split("/").pop() || "output.sol";
    const finalName = sanitized.endsWith(".sol") ? sanitized : sanitized + ".sol";

    res.json({
      success: true,
      message: `Ready to download: ${finalName}`,
      filename: finalName,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || "Save failed",
    });
  }
});

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// Serve main page
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

app.listen(PORT, () => {
  console.log(`\n${"═".repeat(70)}`);
  console.log(`🚀 Web Server Started`);
  console.log(`${"═".repeat(70)}`);
  console.log(`📱 Open your browser at: http://localhost:${PORT}`);
  console.log(`${"═".repeat(70)}\n`);
});
