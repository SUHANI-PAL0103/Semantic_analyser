// Elements
const codeInput = document.getElementById("code-input");
const codeOutput = document.getElementById("code-output");
const solidityCode = document.getElementById("solidity-code");
const errorsContainer = document.getElementById("errors-container");
const outputContainer = document.getElementById("output-container");
const outputPlaceholder = outputContainer.querySelector(".output-placeholder");
const lineNumbers = document.getElementById("line-numbers");
const compileStatus = document.getElementById("compile-status");
const statTokens = document.getElementById("stat-tokens");
const statNodes = document.getElementById("stat-nodes");
const statErrors = document.getElementById("stat-errors");

// Sample templates
const templates = {
  calculator: `class Calculator {
  constructor() {
    this.result = 0;
  }

  add(a, b) {
    this.result = a + b;
    return this.result;
  }

  subtract(a, b) {
    this.result = a - b;
    return this.result;
  }

  multiply(a, b) {
    this.result = a * b;
    return this.result;
  }

  getResult() {
    return this.result;
  }
}`,

  counter: `class Counter {
  constructor() {
    this.count = 0;
  }

  increment() {
    this.count = this.count + 1;
  }

  decrement() {
    this.count = this.count - 1;
  }

  getCount() {
    return this.count;
  }

  reset() {
    this.count = 0;
  }
}`,

  bank: `class SimpleBank {
  constructor() {
    this.balance = 0;
    this.transactions = [];
  }

  deposit(amount) {
    this.balance = this.balance + amount;
    this.transactions.push(amount);
    return this.balance;
  }

  withdraw(amount) {
    if (amount <= this.balance) {
      this.balance = this.balance - amount;
      this.transactions.push(-amount);
      return this.balance;
    }
    return this.balance;
  }

  getBalance() {
    return this.balance;
  }

  getTransactions() {
    return this.transactions;
  }
}`,
};

// Initialize
document.addEventListener("DOMContentLoaded", () => {
  updateLineNumbers();
  codeInput.addEventListener("input", updateLineNumbers);
  codeInput.addEventListener("scroll", syncLineNumbersScroll);
});

// Update line numbers
function updateLineNumbers() {
  const lines = codeInput.value.split("\n").length;
  let lineNumbersText = "";
  for (let i = 1; i <= lines; i++) {
    lineNumbersText += i + "\n";
  }
  lineNumbers.textContent = lineNumbersText;
}

// Sync scroll between textarea and line numbers
function syncLineNumbersScroll() {
  lineNumbers.scrollTop = codeInput.scrollTop;
}

// Load template
function loadTemplate(name) {
  codeInput.value = templates[name] || "";
  updateLineNumbers();
  codeInput.focus();
}

// Clear code
function clearCode() {
  if (confirm("Are you sure you want to clear all code?")) {
    codeInput.value = "";
    updateLineNumbers();
    codeInput.focus();
  }
}

// Compile code
async function compileCode() {
  const code = codeInput.value.trim();

  if (!code) {
    showError("Please write some JavaScript code first");
    return;
  }

  try {
    updateStatus("Compiling...", true);

    const response = await fetch("/api/compile", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ code }),
    });

    const result = await response.json();

    if (result.success) {
      displayOutput(result.solidityCode, result.errors, result.warnings);
      updateStatus("Compilation Successful ✓", false);
      updateStats(result.errors.length, result.warnings.length, result.tokenCount, result.astNodeCount);
    } else {
      showError(result.error || "Compilation failed");
      updateStatus("Compilation Failed", false);
    }
  } catch (error) {
    showError("Error: " + error.message);
    updateStatus("Error", false);
  }
}

// Display output
function displayOutput(solidity, errors, warnings) {
  // Hide placeholder
  outputPlaceholder.style.display = "none";

  // Clear previous content
  codeOutput.style.display = "none";
  errorsContainer.style.display = "none";

  // Update stats
  updateStats(errors.length, warnings.length);

  // Display Solidity code
  if (solidity) {
    solidityCode.textContent = solidity;
    codeOutput.style.display = "block";
  }

  // Display errors and warnings
  if (errors.length > 0 || warnings.length > 0) {
    errorsContainer.innerHTML = "";

    errors.forEach((error) => {
      const errorDiv = document.createElement("div");
      errorDiv.className = "error-item";
      errorDiv.innerHTML = `
        <div class="error-type">Error</div>
        <div class="error-message">${escapeHtml(error.message)}</div>
        ${error.line ? `<div class="error-location">Line ${error.line}</div>` : ""}
      `;
      errorsContainer.appendChild(errorDiv);
    });

    warnings.forEach((warning) => {
      const warningDiv = document.createElement("div");
      warningDiv.className = "warning-item";
      warningDiv.innerHTML = `
        <div class="warning-type">Warning</div>
        <div class="warning-message">${escapeHtml(warning.message)}</div>
        ${warning.line ? `<div class="error-location">Line ${warning.line}</div>` : ""}
      `;
      errorsContainer.appendChild(warningDiv);
    });

    errorsContainer.style.display = "block";
  }
}

// Show error
function showError(message) {
  outputPlaceholder.style.display = "flex";
  codeOutput.style.display = "none";
  errorsContainer.innerHTML = "";
  errorsContainer.style.display = "block";

  const errorDiv = document.createElement("div");
  errorDiv.className = "error-item";
  errorDiv.style.width = "100%";
  errorDiv.innerHTML = `
    <div class="error-type">Compilation Error</div>
    <div class="error-message">${escapeHtml(message)}</div>
  `;
  errorsContainer.appendChild(errorDiv);

  statErrors.textContent = "Errors: 1";
}

// Update status
function updateStatus(text, isLoading) {
  compileStatus.textContent = text;
  if (isLoading) {
    compileStatus.classList.add("loading");
  } else {
    compileStatus.classList.remove("loading");
  }
}

// Update stats
function updateStats(errorCount, warningCount, tokenCount = 0, astNodeCount = 0) {
  statTokens.textContent = `Tokens: ${tokenCount}`;
  statNodes.textContent = `AST Nodes: ${astNodeCount}`;
  statErrors.textContent = `Errors: ${errorCount}`;
}

// Copy output to clipboard
function copyOutput() {
  const text = solidityCode.textContent;
  if (!text) {
    alert("Nothing to copy");
    return;
  }

  navigator.clipboard.writeText(text).then(() => {
    const btn = event.target.closest(".header-btn");
    const originalText = btn.title;
    btn.title = "Copied!";
    setTimeout(() => {
      btn.title = originalText;
    }, 2000);
  });
}

// Save JavaScript file locally
function saveJavaScriptFile() {
  const text = codeInput.value;
  if (!text) {
    alert("Nothing to save. Please write some code first.");
    return;
  }

  const filename = prompt("Enter filename (without .js):", "contract") || "contract";
  const finalName = filename.endsWith(".js") ? filename : filename + ".js";

  const element = document.createElement("a");
  element.setAttribute(
    "href",
    "data:text/plain;charset=utf-8," + encodeURIComponent(text)
  );
  element.setAttribute("download", finalName);
  element.style.display = "none";
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
}

// Escape HTML
function escapeHtml(text) {
  const map = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

// Keyboard shortcuts
document.addEventListener("keydown", (e) => {
  // Ctrl+Enter or Cmd+Enter to compile
  if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
    compileCode();
  }
});
