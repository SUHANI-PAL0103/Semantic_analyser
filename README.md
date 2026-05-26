# Compiler Project - Lexer and Parser Implementation 🔍

A compiler frontend implementation focusing on **Lexical Analysis** and **Syntax Analysis** for JavaScript code.

## 🎯 What We've Implemented

### Phase 1: Compiler Frontend (Complete ✅)
- **Lexer (Lexical Analyzer)** → Tokenizes source code into tokens
- **Parser (Syntax Analyzer)** → Builds Abstract Syntax Tree (AST)

### Architecture Flow

```
JavaScript Source Code
        ↓
    📝 LEXER (Tokenization)
        ↓
    🌳 PARSER (AST Generation)
```

## 📁 Project Structure

```
src/
├── lexer/                    ← ✅ IMPLEMENTED
│   ├── Lexer.ts             # Tokenization logic
│   └── Token.ts             # Token type definitions
│
├── parser/                   ← ✅ IMPLEMENTED
│   ├── Parser.ts            # Syntax analysis & AST builder
│   └── AST.ts               # AST node type definitions
│
└── demo.ts                   # Demo showing Lexer + Parser output
```

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Build the Project
```bash
npm run build
```

### 3. Run the Web Interface
```bash
npm run web
```

Then open your browser at: **http://localhost:3001**

### 4. Run the Demo (CLI)
```bash
node dist/demo.js
```

This will show:
- ✅ Complete token list with line numbers
- ✅ Full Abstract Syntax Tree (AST) in JSON format

## 🌐 Web Interface

The project includes an interactive web compiler at `http://localhost:3001`:

- **Live Code Editor** - Write JavaScript and see errors in real-time
- **Template Examples** - Calculator, Counter, and Bank examples
- **Real-time Error Display** - Detailed error messages with line and column numbers
- **Solidity Output Panel** - View generated Solidity code
- **Statistics** - Token count, AST nodes, and error/warning counts

### Features
✅ Syntax highlighting with line numbers  
✅ Detailed error messages showing exact location  
✅ Copy to clipboard functionality  
✅ Save/Clear buttons for code management  
✅ Responsive VS Code-style interface

## 📊 What the Demo Shows

### Step 1: Lexical Analysis
The lexer breaks down source code into tokens:
```
CLASS                "class"              [Line 2:1]
IDENTIFIER           "Calculator"         [Line 2:7]
LBRACE               "{"                  [Line 2:18]
CONSTRUCTOR          "constructor"        [Line 3:3]
...
```

### Step 2: Syntax Analysis
The parser builds an Abstract Syntax Tree:
```json
{
  "type": "PROGRAM",
  "body": [
    {
      "type": "CLASS_DECLARATION",
      "name": "Calculator",
      "constructor": { ... },
      "methods": [ ... ]
    }
  ]
}
```

## 📘 Example

### Input (JavaScript)

```javascript
class Token {
  constructor() {
    this.totalSupply = 1000000;
    this.name = "MyToken";
  }

  transfer(to, amount) {
    this.balances = this.balances - amount;
    return true;
  }

  getBalance() {
    return this.balances;
  }
}
```

### Output (Solidity)

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Token {
  // State variables
  uint256 public totalSupply;
  string public name;

  constructor() {
    totalSupply = 1000000;
    name = "MyToken";
  }

  function transfer(uint256 to, uint256 amount) public {
    balances = balances - amount;
    return true;
  }

  function getBalance() public {
    return balances;
  }
}
```

## ✅ Supported Features

### JavaScript Constructs
- ✅ Classes
- ✅ Constructors
- ✅ Methods
- ✅ Properties
- ✅ Variables (let, const)
- ✅ Functions
- ✅ Expressions (binary, unary, assignment)
- ✅ Control flow (if/else, while, for)
- ✅ Member access (object.property)
- ✅ Function calls
- ✅ this keyword

### ⚠️ NOT Supported (Solidity Limitations)
- ❌ Array `.length` property (use fixed-size arrays)
- ❌ `Math` object functions (Math.floor, Math.max, etc.)
- ❌ Dynamic arrays (Solidity uses fixed-size)
- ❌ Array literals `[a, b, c]`
- ❌ Floating-point numbers (Solidity is integer-only)
- ❌ `console.log()` (no console in blockchain)
- ❌ `typeof` operator
- ❌ Spread operator `...`
- ❌ Destructuring
- ❌ Async/await
- ❌ Regular expressions

**Why?** Solidity is designed for blockchain smart contracts where every operation costs gas, security is critical, and resources are limited.

### Type Inference
- ✅ Number → `uint256`
- ✅ String → `string`
- ✅ Boolean → `bool`
- ✅ null → `address(0)`

### Semantic Checks
- ✅ Undefined variable detection
- ✅ Type compatibility checking
- ✅ Duplicate declaration detection
- ✅ Uninitialized const warnings
- ✅ Symbol table tracking
- ✅ Detailed error messages with line/column numbers

## 🧪 Testing

Run the example files to see the compiler in action:

```bash
# Test all examples
npm run dev examples/Token.js
npm run dev examples/Counter.js
npm run dev examples/SimpleBank.js
npm run dev examples/Calculator.js
```

## 🛠️ Development

### Available Commands
```bash
npm run build      # Build TypeScript to JavaScript
npm run web        # Start web server on http://localhost:3001
npm run dev        # Build and run compiler
npm run demo       # Run interactive demo
npm run compile    # Run compiler on input
npm start          # Start compiled version
npm test           # Run tests
npm run test:watch # Run tests in watch mode
```

## 📊 Phase 1 Status

| Component | Status | Description |
|-----------|--------|-------------|
| Lexer | ✅ Complete | Tokenizes JavaScript source code |
| Parser | ✅ Complete | Generates Abstract Syntax Tree |
| Semantic Analyzer | ✅ Complete | Type checking & symbol table |
| Code Generator | ✅ Complete | Outputs Solidity code |
| CLI Tool | ✅ Complete | Command-line interface |

## 🎓 Learning Outcomes

This project demonstrates:
- **Compiler Design**: Complete compilation pipeline
- **Data Structures**: Symbol tables, AST, token streams
- **Algorithms**: Recursive descent parsing, type inference
- **Pattern Matching**: Token recognition, AST traversal
- **Type Systems**: Static type checking, type inference

## 🚧 Known Limitations (Phase 1)

- No array/mapping support yet
- Limited type inference for complex expressions

## 📝 Recent Improvements

### Error Message Enhancements
- ✅ Real-time error display with line and column numbers
- ✅ Multiple errors shown simultaneously
- ✅ Clear error icons (❌ for errors, ⚠️ for warnings)
- ✅ Highlighted error messages with better contrast
- ✅ Error panel auto-scrolls to top for visibility
- ✅ Web UI shows all semantic errors from analysis phase
- No security vulnerability detection (coming in Phase 2)
- No optimization passes (coming in Phase 3)
- Single-file compilation only

## 📚 Next Steps (Phase 2 & 3)

### Phase 2: Security Analysis
- Reentrancy detection
- Integer overflow checks
- Access control validation
- Unchecked external call warnings
- Web-based IDE

### Phase 3: Integration
- Blockchain deployment (Hardhat)
- Gas optimization
- AST visualization
- Comprehensive testing
- Live demo

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

**Phase 1 Complete!** ✨ Basic JavaScript to Solidity compilation with semantic analysis.
