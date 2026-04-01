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

### 3. Run the Demo
```bash
node dist/demo.js
```

This will show:
- ✅ Complete token list with line numbers
- ✅ Full Abstract Syntax Tree (AST) in JSON format

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

### Build
```bash
npm run build
```

### Run with TypeScript directly
```bash
npm run dev <file>
```

### Start compiled version
```bash
npm start <file>
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
