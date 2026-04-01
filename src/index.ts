#!/usr/bin/env node
import { Lexer } from "./lexer/Lexer.js";
import { Parser } from "./parser/Parser.js";
import { Compiler } from "./Compiler.js";
import * as fs from "fs";
import * as path from "path";

const sampleCode = `
class Calculator {
  constructor() {
    this.result = 0;
  }

  add(a, b) {
    return a + b;
  }

  subtract(a, b) {
    return a - b;
  }
}
`;

interface CompileCliOptions {
  outputFile: string | null;
  debug: boolean;
  solidityVersion: string;
}

function printHeader(title: string): void {
  console.log("═".repeat(70));
  console.log(title);
  console.log("═".repeat(70));
}

function runLexerParserDemo(): void {
  printHeader("                LEXER AND PARSER DEMONSTRATION");
  console.log("\n📝 Sample Code:");
  console.log("─".repeat(70));
  console.log(sampleCode);

  console.log("\n🔍 STEP 1: LEXICAL ANALYSIS (Tokenization)");
  console.log("─".repeat(70));
  const lexer = new Lexer(sampleCode);
  const tokens = lexer.tokenize();

  console.log(`\n✅ Generated ${tokens.length} tokens\n`);
  console.log("Token List:");
  tokens.slice(0, 20).forEach((token, index) => {
    if (token.type !== "EOF") {
      const valueDisplay = token.value ? `"${token.value}"` : "";
      console.log(
        `  ${String(index + 1).padStart(3)}. ${token.type.padEnd(20)} ${valueDisplay.padEnd(20)} [Ln ${token.line}:${token.column}]`
      );
    }
  });
  if (tokens.length > 20) {
    console.log(`  ... and ${tokens.length - 20} more tokens`);
  }

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
}

function printUsage(): void {
  console.log(`
Usage:
  npm run app                    # Run Lexer + Parser demo (exam mode)
  npm run app -- demo            # Same as above
  npm run app -- compile <file> [options]

Options for compile:
  --output, -o <file>    Write Solidity output to file
  --debug, -d            Enable debug mode
  --version <version>    Set Solidity version (default: ^0.8.0)

Examples:
  npm run app -- compile examples/Calculator.js
  npm run app -- compile examples/Token.js -o output/Token.sol
`);
}

function parseCompileOptions(args: string[]): { inputFile: string | null; options: CompileCliOptions } {
  let inputFile: string | null = null;
  const options: CompileCliOptions = {
    outputFile: null,
    debug: false,
    solidityVersion: "^0.8.0",
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    const nextArg = args[i + 1];

    if (!arg) continue;

    if (!arg.startsWith("-") && inputFile === null) {
      inputFile = arg;
      continue;
    }

    switch (arg) {
      case "--output":
      case "-o":
        if (nextArg) {
          options.outputFile = nextArg;
          i++;
        }
        break;
      case "--debug":
      case "-d":
        options.debug = true;
        break;
      case "--version":
        if (nextArg) {
          options.solidityVersion = nextArg;
          i++;
        }
        break;
    }
  }

  return { inputFile, options };
}

function runAdvancedCompile(rawArgs: string[]): void {
  const { inputFile, options } = parseCompileOptions(rawArgs);

  if (!inputFile) {
    console.error("❌ Missing input file. Example: npm run app -- compile examples/Calculator.js");
    process.exit(1);
  }

  if (!fs.existsSync(inputFile)) {
    console.error(`❌ Error: File '${inputFile}' not found`);
    process.exit(1);
  }

  const sourceCode = fs.readFileSync(inputFile, "utf-8");
  console.log(`\n📄 Compiling: ${inputFile}`);
  console.log("═".repeat(60));

  const compiler = new Compiler({
    debug: options.debug,
    solidityVersion: options.solidityVersion,
  });

  const result = compiler.compile(sourceCode);

  if (result.success) {
    console.log("\n✅ Compilation successful!\n");

    if (result.warnings.length > 0) {
      console.log("⚠️  Warnings:");
      result.warnings.forEach((warning) => {
        console.log(`  Line ${warning.line || "?"}:${warning.column || "?"} - ${warning.message}`);
      });
      console.log();
    }

    console.log("📝 Generated Solidity Code:");
    console.log("─".repeat(60));
    console.log(result.solidityCode);
    console.log("─".repeat(60));

    if (options.outputFile && result.solidityCode) {
      const outputDir = path.dirname(options.outputFile);
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }
      fs.writeFileSync(options.outputFile, result.solidityCode);
      console.log(`\n💾 Output written to: ${options.outputFile}`);
    }
    return;
  }

  console.log("\n❌ Compilation failed!\n");
  if (result.errors.length > 0) {
    console.log("🚨 Errors:");
    result.errors.forEach((error) => {
      console.log(`  Line ${error.line || "?"}:${error.column || "?"} - ${error.message}`);
    });
  }

  if (result.warnings.length > 0) {
    console.log("\n⚠️  Warnings:");
    result.warnings.forEach((warning) => {
      console.log(`  Line ${warning.line || "?"}:${warning.column || "?"} - ${warning.message}`);
    });
  }

  process.exit(1);
}

function main(): void {
  const args = process.argv.slice(2);
  const mode = args[0];

  if (!mode || mode === "demo") {
    runLexerParserDemo();
    return;
  }

  if (mode === "compile") {
    runAdvancedCompile(args.slice(1));
    return;
  }

  // Convenience: if user passes a filename directly, treat it as compile mode
  if (fs.existsSync(mode)) {
    runAdvancedCompile(args);
    return;
  }

  if (mode === "--help" || mode === "-h" || mode === "help") {
    printUsage();
    return;
  }

  console.error(`❌ Unknown mode '${mode}'`);
  printUsage();
  process.exit(1);
}

main();
