// Demo: Lexer and Parser Only
// This file demonstrates only lexical analysis and syntax analysis

import { Lexer } from "./lexer/Lexer.js";
import { Parser } from "./parser/Parser.js";
import * as fs from "fs";
import * as path from "path";

// Get file from command line or use default
const args = process.argv.slice(2);
const inputFile = args[0] || "examples/Calculator.js";

let sampleCode: string;
try {
  sampleCode = fs.readFileSync(inputFile, "utf-8");
  console.log(`📂 Reading: ${inputFile}\n`);
} catch (error) {
  console.error(`❌ Error: File '${inputFile}' not found`);
  process.exit(1);
}

console.log("═".repeat(70));
console.log("                LEXER AND PARSER DEMONSTRATION");
console.log("═".repeat(70));
console.log("\n📝 Sample Code:");
console.log("─".repeat(70));
console.log(sampleCode);

// Step 1: Lexical Analysis
console.log("\n🔍 STEP 1: LEXICAL ANALYSIS (Tokenization)");
console.log("─".repeat(70));
const lexer = new Lexer(sampleCode);
const tokens = lexer.tokenize();

console.log(`\n✅ Generated ${tokens.length} tokens\n`);
console.log("Token List:");
tokens.slice(0, 20).forEach((token, index) => {
  if (token.type !== 'EOF') {
    const valueDisplay = token.value ? `"${token.value}"` : '';
    console.log(`  ${String(index + 1).padStart(3)}. ${token.type.padEnd(20)} ${valueDisplay.padEnd(20)} [Ln ${token.line}:${token.column}]`);
  }
});
if (tokens.length > 20) {
  console.log(`  ... and ${tokens.length - 20} more tokens`);
}

// Step 2: Syntax Analysis
console.log("\n\n🔍 STEP 2: SYNTAX ANALYSIS (Parsing)");
console.log("─".repeat(70));
const parser = new Parser(tokens);
const ast = parser.parse();

console.log("\n✅ Abstract Syntax Tree (AST) generated\n");
console.log("AST Structure:");
console.log(JSON.stringify(ast, null, 2));

console.log("\n" + "═".repeat(70));
console.log("✨ Summary:");
console.log(`   • Tokens: ${tokens.length}`);
console.log(`   • AST Nodes: ${ast.body.length} top-level declaration(s)`);
console.log("═".repeat(70));
