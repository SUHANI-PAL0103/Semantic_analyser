# JS to Solidity Compiler 🔗

A complete compiler that converts JavaScript code into Solidity smart contracts with semantic analysis, error detection, and real-time feedback.

**Transform JavaScript classes into production-ready Solidity contracts instantly.**

---

## 📋 Table of Contents

- [Features](#features)
- [Getting Started](#getting-started)
- [Web Interface](#web-interface)
- [Compilation Pipeline](#compilation-pipeline)
- [Supported Features](#supported-features)
- [Limitations](#limitations)
- [Examples](#examples)
- [Architecture](#architecture)
- [Commands](#commands)
- [Recent Improvements](#recent-improvements)

---

## ✨ Features

### Core Capabilities
- ✅ **Live Web Compiler** - Interactive UI at `http://localhost:3001`
- ✅ **Complete Compilation Pipeline** - Lexer → Parser → Semantic Analyzer → Code Generator
- ✅ **Real-time Error Detection** - Detailed error messages with line/column numbers
- ✅ **Type Inference** - Automatic JavaScript to Solidity type conversion
- ✅ **Semantic Analysis** - Variable scope checking, type compatibility, duplicate detection
- ✅ **Template Examples** - Pre-built Calculator, Counter, and Bank examples

### Web Interface Features
- 📝 Live code editor with syntax highlighting and line numbers
- ❌ Detailed error messages with exact location
- ⚠️ Warning notifications
- 📊 Compilation statistics (tokens, AST nodes, errors)
- 📋 Copy-to-clipboard functionality
- 🎨 VS Code-style dark theme

---

## 🚀 Getting Started

### Installation

```bash
# Clone the repository
git clone https://github.com/SUHANI-PAL0103/Semantic_analyser.git
cd Semantic_analyser

# Install dependencies
npm install
```

### Running the Compiler

#### Option 1: Web Interface (Recommended)

```bash
npm run web
```

Then open **http://localhost:3001** in your browser.

#### Option 2: CLI Demo

```bash
npm run demo
```

Shows the complete compilation process with tokens and AST.

#### Option 3: Compile Files Directly

```bash
npm run compile examples/Counter.js
npm run compile examples/Calculator.js
npm run compile examples/SimpleBank.js
```

---

## 🌐 Web Interface

The interactive compiler available at `http://localhost:3001`:

### Features
- **Code Editor** - Left panel with syntax highlighting and line numbers
- **Error Panel** - Real-time error/warning display with exact locations
- **Solidity Output** - Right panel showing generated Solidity code
- **Templates** - Quick-load examples (Calculator, Counter, Bank)
- **Statistics** - Token count, AST node count, error count
- **Actions** - Save, Clear, Copy to clipboard, Convert buttons

### How to Use

1. Write JavaScript code in the left panel (or click a template)
2. Click "Convert to Solidity" button
3. View:
   - ✅ Solidity output in the right panel (if successful)
   - ❌ Error messages (if there are issues)
4. Fix errors based on detailed error messages with line numbers

---

## 🔄 Compilation Pipeline

```
JavaScript Source Code
        ↓
   📝 LEXER (Tokenization)
        ↓ Tokens
   🌳 PARSER (AST Generation)
        ↓ AST
   🔍 SEMANTIC ANALYZER (Type Checking & Validation)
        ↓ Symbol Table
   ⚙️ CODE GENERATOR (Solidity Output)
        ↓
   ✅ Solidity Contract
```

### Stage Details

**1. Lexer** - Tokenizes source code
- Breaks code into meaningful tokens (keywords, identifiers, operators, etc.)
- Tracks line and column information

**2. Parser** - Builds Abstract Syntax Tree (AST)
- Creates hierarchical representation of code structure
- Validates syntax rules

**3. Semantic Analyzer** - Type checking and validation
- Checks for undefined variables
- Validates type compatibility
- Detects duplicate declarations
- Builds symbol table

**4. Code Generator** - Produces Solidity code
- Converts JavaScript constructs to Solidity equivalents
- Handles type conversions (JavaScript types → Solidity types)
- Generates valid smart contract code

---

## ✅ Supported Features

## ✅ Supported Features

### JavaScript Constructs That Compile

| Feature | Example |
|---------|---------|
| Classes | `class Counter { ... }` |
| Constructors | `constructor() { this.count = 0; }` |
| Methods | `increment() { this.count++; }` |
| Properties | `this.balance = 100` |
| Variables | `let x = 5; const y = 10;` |
| Functions | `function add(a, b) { return a + b; }` |
| Operators | `+`, `-`, `*`, `/`, `%`, `==`, `<`, `>`, `&&`, `\|\|` |
| Control Flow | `if/else`, `while`, `for` |
| Member Access | `obj.property` |
| Function Calls | `this.method()`, `function()` |
| Return Statements | `return value` |
| The `this` Keyword | Reference to current contract |

### Type Conversion

| JavaScript | Solidity |
|-----------|----------|
| Number | `uint256` |
| String | `string` |
| Boolean | `bool` |
| null | `address(0)` |

### Semantic Checks

- ✅ Undefined variable detection
- ✅ Type compatibility validation
- ✅ Duplicate declaration prevention
- ✅ Symbol table tracking
- ✅ Detailed error messages with line/column numbers

---

## ⚠️ Limitations (Why Some JavaScript Features Aren't Supported)

### Not Supported Features

| Feature | Reason |
|---------|--------|
| Array `.length` | Solidity arrays are fixed-size, no length property |
| `Math` functions | No Math library in Solidity (use manual calculations) |
| Dynamic arrays | Must declare fixed size: `uint256[10]` |
| Array literals | `[a, b, c]` not supported, use fixed arrays |
| Floating-point | Only integers (no decimals), use fixed-point math |
| `console.log()` | Blockchain has no console output |
| `typeof` operator | Not available in Solidity |
| Spread operator | `...` not supported |
| Destructuring | `{a, b} = obj` not supported |
| Async/await | Blockchain operations aren't async |
| Regular expressions | No regex support in Solidity |
| String manipulation | Limited string operations |

### Why These Limitations Exist

Solidity is designed for **blockchain smart contracts** where:
- 💰 Every operation costs **gas** (real money)
- 🔒 **Security** is critical (immutable code)
- ⛓️ **Resources** are severely limited
- ⏱️ **Deterministic execution** is required
- 📦 **State persistence** has high costs

---

## 📘 Examples

### Example 1: Counter Contract

**JavaScript Input:**
```javascript
class Counter {
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
}
```

**Solidity Output:**
```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Counter {
  uint256 count;

  constructor() {
    count = 0;
  }

  function increment() public {
    count = count + 1;
  }

  function decrement() public {
    count = count - 1;
  }

  function getCount() public returns (uint256) {
    return count;
  }
}
```

### Example 2: Bank Contract

**JavaScript Input:**
```javascript
class SimpleBank {
  constructor() {
    this.balance = 0;
  }

  deposit(amount) {
    this.balance = this.balance + amount;
    return this.balance;
  }

  withdraw(amount) {
    if (amount <= this.balance) {
      this.balance = this.balance - amount;
      return this.balance;
    }
    return this.balance;
  }
}
```

**Solidity Output:**
```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract SimpleBank {
  uint256 balance;

  constructor() {
    balance = 0;
  }

  function deposit(uint256 amount) public returns (uint256) {
    balance = balance + amount;
    return balance;
  }

  function withdraw(uint256 amount) public returns (uint256) {
    if (amount <= balance) {
      balance = balance - amount;
      return balance;
    }
    return balance;
  }
}
```

---

## 🏗️ Architecture

### Project Structure

```
src/
├── lexer/
│   ├── Lexer.ts          # Tokenization logic
│   └── Token.ts          # Token type definitions
│
├── parser/
│   ├── Parser.ts         # Syntax analysis & AST builder
│   └── AST.ts            # AST node type definitions
│
├── analyzer/
│   ├── SemanticAnalyzer.ts   # Type checking & validation
│   ├── SymbolTable.ts        # Symbol management
│   └── TypeChecker.ts        # Type validation
│
├── codegen/
│   └── CodeGenerator.ts   # Solidity code generation
│
├── Compiler.ts           # Main compilation orchestrator
├── server.ts            # Express web server
├── index.ts             # CLI entry point
└── demo.ts              # Interactive demo

public/
├── index.html           # Web UI
├── app.js               # Frontend logic
└── styles.css           # Styling

examples/
├── Calculator.js
├── Counter.js
├── SimpleBank.js
└── Token.js

tests/
├── compiler.test.ts
└── lexer.test.ts
```

### Data Flow

```
Source Code (JavaScript)
    ↓
Lexer → Token Stream
    ↓
Parser → AST
    ↓
Semantic Analyzer → Annotated AST + Symbol Table
    ↓
Code Generator → Solidity Contract
    ↓
Output (Solidity Code)
```

---

## 🛠️ Available Commands

## 🛠️ Available Commands

```bash
# Development
npm run build                    # Compile TypeScript → JavaScript
npm run web                      # Start web server (http://localhost:3001)
npm run demo                     # Run interactive CLI demo
npm run compile                  # Compile JavaScript file

# Testing
npm test                         # Run unit tests
npm test:watch                   # Run tests in watch mode

# Utilities
npm run dev                      # Build and run
npm start                        # Run compiled version
npm run clean                    # Remove build artifacts
```

---

## 📝 Recent Improvements

### Error Message Enhancements (v1.1)
- ✅ **Real-time error display** - Errors shown immediately on compilation attempt
- ✅ **Line and column numbers** - Exact location of each error
- ✅ **Multiple errors** - Shows all errors at once, not just first one
- ✅ **Error icons** - Clear visual distinction (❌ error, ⚠️ warning)
- ✅ **Better formatting** - Larger font, better contrast, improved layout
- ✅ **Auto-scroll** - Error panel scrolls to top for visibility
- ✅ **Semantic errors** - Full analysis results from semantic phase

### Web Interface (v1.0)
- Interactive code editor with syntax highlighting
- Real-time compilation feedback
- Template examples for quick start
- Statistics panel with token/AST/error counts
- Copy to clipboard and file save features

---

## 📊 Compilation Statistics

The compiler tracks and displays:

| Metric | What It Means |
|--------|---------------|
| **Tokens** | Number of lexical units identified |
| **AST Nodes** | Number of syntax tree nodes created |
| **Errors** | Number of compilation errors |
| **Warnings** | Number of non-critical issues |

---

## 🧪 Testing

Run the built-in test suites:

```bash
# Run all tests
npm test

# Run with watch mode
npm test:watch
```

Test example files:

```bash
npm run compile examples/Calculator.js
npm run compile examples/Counter.js
npm run compile examples/SimpleBank.js
npm run compile examples/Token.js
```

---

## 🎓 Educational Value

This project demonstrates:

| Concept | Implementation |
|---------|-----------------|
| **Compiler Design** | Complete 4-stage pipeline |
| **Lexical Analysis** | Token recognition and classification |
| **Syntax Analysis** | Recursive descent parser building AST |
| **Semantic Analysis** | Type checking, symbol tables, scope |
| **Code Generation** | AST to Solidity conversion |
| **Type Systems** | Static type inference and validation |
| **Error Handling** | Detailed error reporting with locations |
| **Language Design** | JavaScript to Solidity mapping |

---

## 📄 License

MIT License - See LICENSE file for details

---

## 🤝 Contributing

Contributions welcome! Areas for improvement:

- [ ] Array and mapping support
- [ ] Advanced type inference
- [ ] More Solidity features
- [ ] Additional examples
- [ ] Performance optimizations
- [ ] UI/UX improvements

---

## 👨‍💻 Author

**SUHANI-PAL0103**

Built as an educational compiler project demonstrating complete compiler construction principles with practical JavaScript to Solidity conversion.

---

## 🔗 Links

- **GitHub**: https://github.com/SUHANI-PAL0103/Semantic_analyser
- **Web Interface**: http://localhost:3001 (after running `npm run web`)

---

✨ **Built with ❤️ for JavaScript to Solidity compilation with comprehensive semantic analysis**

Transform your JavaScript logic into blockchain-ready smart contracts!

## 🤝 Contributing

This is an academic project. Feel free to:
- Report bugs
- Suggest features
- Add test cases
- Improve documentation

## 📄 License

MIT

## 👨‍💻 Author

Built as part of a semantic analysis compiler project demonstrating compiler construction principles.

---

✨ Built with ❤️ for JavaScript to Solidity compilation with semantic analysis.
