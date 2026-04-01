import { Lexer } from "./lexer/Lexer.js";
import { Parser } from "./parser/Parser.js";
import { SemanticAnalyzer } from "./analyzer/SemanticAnalyzer.js";
import type { SemanticError } from "./analyzer/SemanticAnalyzer.js";
import { CodeGenerator } from "./codegen/CodeGenerator.js";
import type { GeneratorOptions } from "./codegen/CodeGenerator.js";

export interface CompilationResult {
  success: boolean;
  solidityCode?: string;
  errors: SemanticError[];
  warnings: SemanticError[];
  ast?: any;
  tokens?: any;
}

export interface CompilerOptions extends GeneratorOptions {
  debug?: boolean;
}

export class Compiler {
  private options: CompilerOptions;

  constructor(options: CompilerOptions = {}) {
    this.options = {
      solidityVersion: options.solidityVersion || "^0.8.0",
      license: options.license || "MIT",
      indentSize: options.indentSize || 2,
      debug: options.debug || false,
    };
  }

  compile(sourceCode: string): CompilationResult {
    const errors: SemanticError[] = [];
    const warnings: SemanticError[] = [];

    try {
      // Step 1: Lexical Analysis
      console.log("🔍 Step 1: Lexical Analysis (Tokenization)");
      const lexer = new Lexer(sourceCode);
      const tokens = lexer.tokenize();
      
      if (this.options.debug) {
        console.log(` Generated ${tokens.length} tokens`);
        console.log(tokens.slice(0, 10)); // Show first 10 tokens
      }

      // Step 2: Syntax Analysis (Parsing)
      console.log("🔍 Step 2: Syntax Analysis (Parsing)");
      const parser = new Parser(tokens);
      const ast = parser.parse();
      
      if (this.options.debug) {
        console.log("✅ Abstract Syntax Tree generated");
        console.log(JSON.stringify(ast, null, 2).substring(0, 500) + "...");
      }

      // Step 3: Semantic Analysis
      console.log("🔍 Step 3: Semantic Analysis");
      const analyzer = new SemanticAnalyzer();
      const analysisResult = analyzer.analyze(ast);
      
      errors.push(...analysisResult.errors);
      warnings.push(...analysisResult.warnings);

      if (this.options.debug) {
        console.log(`✅ Found ${errors.length} errors, ${warnings.length} warnings`);
      }

      // If there are errors, stop compilation
      if (errors.length > 0) {
        return {
          success: false,
          errors,
          warnings,
          ast: this.options.debug ? ast : undefined,
          tokens: this.options.debug ? tokens : undefined,
        };
      }

      // Step 4: Code Generation
      console.log("🔍 Step 4: Code Generation");
      const generator = new CodeGenerator(analysisResult.symbolTable, {
        solidityVersion: this.options.solidityVersion,
        license: this.options.license,
        indentSize: this.options.indentSize,
      });

      const solidityCode = generator.generate(ast);
      
      if (this.options.debug) {
        console.log("✅ Solidity code generated");
      }

      return {
        success: true,
        solidityCode,
        errors,
        warnings,
        ast: this.options.debug ? ast : undefined,
        tokens: this.options.debug ? tokens : undefined,
      };
    } catch (error) {
      errors.push({
        message: error instanceof Error ? error.message : String(error),
        severity: "error",
      });

      return {
        success: false,
        errors,
        warnings,
      };
    }
  }

  compileFile(filePath: string): CompilationResult {
    try {
      const fs = require("fs");
      const sourceCode = fs.readFileSync(filePath, "utf-8");
      return this.compile(sourceCode);
    } catch (error) {
      return {
        success: false,
        errors: [
          {
            message: `Failed to read file: ${error instanceof Error ? error.message : String(error)}`,
            severity: "error",
          },
        ],
        warnings: [],
      };
    }
  }
}
