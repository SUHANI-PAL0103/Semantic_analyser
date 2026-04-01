import type { 
  Program, 
  Statement, 
  Expression, 
  ClassDeclaration,
  FunctionDeclaration,
  VariableDeclaration
} from "../parser/AST.js";
import { NodeType } from "../parser/AST.js";
import { SymbolTable, SymbolType, SolidityType } from "./SymbolTable.js";
import { TypeChecker } from "./TypeChecker.js";

export interface SemanticError {
  message: string;
  line?: number;
  column?: number;
  severity: 'error' | 'warning';
}

export interface AnalysisResult {
  symbolTable: SymbolTable;
  errors: SemanticError[];
  warnings: SemanticError[];
}

export class SemanticAnalyzer {
  private symbolTable: SymbolTable;
  private typeChecker: TypeChecker;
  private errors: SemanticError[] = [];
  private warnings: SemanticError[] = [];
  private currentClass: string | null = null;

  constructor() {
    this.symbolTable = new SymbolTable();
    this.typeChecker = new TypeChecker(this.symbolTable);
  }

  analyze(ast: Program): AnalysisResult {
    this.errors = [];
    this.warnings = [];

    try {
      this.analyzeProgram(ast);
    } catch (error) {
      if (error instanceof Error) {
        this.errors.push({
          message: error.message,
          severity: 'error'
        });
      }
    }

    return {
      symbolTable: this.symbolTable,
      errors: this.errors,
      warnings: this.warnings
    };
  }

  private analyzeProgram(program: Program): void {
    for (const statement of program.body) {
      this.analyzeStatement(statement);
    }
  }

  private analyzeStatement(statement: Statement): void {
    switch (statement.type) {
      case NodeType.CLASS_DECLARATION:
        this.analyzeClassDeclaration(statement as unknown as ClassDeclaration);
        break;
      case NodeType.FUNCTION_DECLARATION:
        this.analyzeFunctionDeclaration(statement as unknown as FunctionDeclaration);
        break;
      case NodeType.VARIABLE_DECLARATION:
        this.analyzeVariableDeclaration(statement as VariableDeclaration);
        break;
      case NodeType.EXPRESSION_STATEMENT:
        this.analyzeExpression(statement.expression);
        break;
      case NodeType.RETURN_STATEMENT:
        if (statement.argument) {
          this.analyzeExpression(statement.argument);
        }
        break;
      case NodeType.IF_STATEMENT:
        this.analyzeExpression(statement.condition);
        this.analyzeStatement(statement.consequent);
        if (statement.alternate) {
          this.analyzeStatement(statement.alternate);
        }
        break;
      case NodeType.WHILE_STATEMENT:
        this.analyzeExpression(statement.condition);
        this.analyzeStatement(statement.body);
        break;
      case NodeType.FOR_STATEMENT:
        if (statement.init) {
          if ('identifier' in statement.init) {
            this.analyzeVariableDeclaration(statement.init as VariableDeclaration);
          } else {
            this.analyzeExpression(statement.init as Expression);
          }
        }
        if (statement.condition) {
          this.analyzeExpression(statement.condition);
        }
        if (statement.update) {
          this.analyzeExpression(statement.update);
        }
        this.analyzeStatement(statement.body);
        break;
      case NodeType.BLOCK_STATEMENT:
        for (const stmt of statement.body) {
          this.analyzeStatement(stmt);
        }
        break;
    }
  }

  private analyzeClassDeclaration(classDecl: ClassDeclaration): void {
    // Define class in symbol table
    this.symbolTable.define({
      name: classDecl.name,
      symbolType: SymbolType.CLASS,
      dataType: SolidityType.ADDRESS, // Contracts are deployed at addresses
      scope: this.symbolTable.getCurrentScope(),
      initialized: true,
      line: classDecl.line,
      column: classDecl.column,
      properties: new Map()
    });

    this.currentClass = classDecl.name;
    this.symbolTable.enterScope(classDecl.name);

    // Analyze properties
    for (const property of classDecl.properties) {
      this.analyzeVariableDeclaration(property);
    }

    // Analyze constructor
    if (classDecl.constructor) {
      this.analyzeFunctionDeclaration(classDecl.constructor);
    }

    // Analyze methods
    for (const method of classDecl.methods) {
      this.analyzeFunctionDeclaration(method);
    }

    this.symbolTable.exitScope();
    this.currentClass = null;
  }

  private analyzeFunctionDeclaration(funcDecl: FunctionDeclaration): void {
    // Define function in symbol table
    const params = funcDecl.parameters.map(p => ({
      name: p.name,
      type: p.typeAnnotation 
        ? this.typeChecker.mapJSTypeToSolidity(p.typeAnnotation)
        : SolidityType.UNKNOWN
    }));

    this.symbolTable.define({
      name: funcDecl.name,
      symbolType: SymbolType.FUNCTION,
      dataType: SolidityType.UNKNOWN, // Functions don't have a data type per se
      scope: this.symbolTable.getCurrentScope(),
      initialized: true,
      line: funcDecl.line,
      column: funcDecl.column,
      parameters: params,
      returnType: SolidityType.UNKNOWN // Will be inferred from return statements
    });

    // Enter function scope
    this.symbolTable.enterScope(`${funcDecl.name}_${funcDecl.line}`);

    // Define parameters in function scope
    for (const param of funcDecl.parameters) {
      this.symbolTable.define({
        name: param.name,
        symbolType: SymbolType.PARAMETER,
        dataType: param.typeAnnotation 
          ? this.typeChecker.mapJSTypeToSolidity(param.typeAnnotation)
          : SolidityType.UNKNOWN,
        scope: this.symbolTable.getCurrentScope(),
        initialized: true
      });
    }

    // Analyze function body
    this.analyzeStatement(funcDecl.body);

    this.symbolTable.exitScope();
  }

  private analyzeVariableDeclaration(varDecl: VariableDeclaration): void {
    let dataType = SolidityType.UNKNOWN;
    let initialized = false;

    // Infer type from initializer if present
    if (varDecl.init) {
      dataType = this.typeChecker.inferType(varDecl.init);
      initialized = true;
      this.analyzeExpression(varDecl.init);
    }

    // Check if variable already declared in current scope
    const existing = this.symbolTable.lookup(varDecl.identifier, true);
    if (existing) {
      this.errors.push({
        message: `Variable '${varDecl.identifier}' is already declared in this scope`,
        line: varDecl.line,
        column: varDecl.column,
        severity: 'error'
      });
      return;
    }

    // Define variable
    this.symbolTable.define({
      name: varDecl.identifier,
      symbolType: SymbolType.VARIABLE,
      dataType,
      scope: this.symbolTable.getCurrentScope(),
      initialized,
      line: varDecl.line,
      column: varDecl.column
    });

    // Warn if variable is not initialized (const should always be initialized)
    if (varDecl.kind === 'const' && !initialized) {
      this.warnings.push({
        message: `Constant '${varDecl.identifier}' should be initialized`,
        line: varDecl.line,
        column: varDecl.column,
        severity: 'warning'
      });
    }
  }

  private analyzeExpression(expr: Expression): SolidityType {
    switch (expr.type) {
      case NodeType.IDENTIFIER:
        // Check if identifier is declared
        const symbol = this.symbolTable.lookup(expr.name);
        if (!symbol) {
          this.errors.push({
            message: `Undefined variable '${expr.name}'`,
            line: expr.line,
            column: expr.column,
            severity: 'error'
          });
          return SolidityType.UNKNOWN;
        }
        return symbol.dataType;

      case NodeType.ASSIGNMENT_EXPRESSION:
        const leftType = this.analyzeExpression(expr.left);
        const rightType = this.analyzeExpression(expr.right);
        
        // Check type compatibility
        try {
          this.typeChecker.checkTypeCompatibility(leftType, rightType, expr.line);
        } catch (error) {
          if (error instanceof Error) {
            this.errors.push({
              message: error.message,
              line: expr.line,
              column: expr.column,
              severity: 'error'
            });
          }
        }

        // Mark variable as initialized if it's a simple identifier assignment
        if (expr.left.type === NodeType.IDENTIFIER) {
          try {
            this.symbolTable.update(expr.left.name, { initialized: true });
          } catch (e) {
            // Symbol not found - already reported above
          }
        }

        return rightType;

      case NodeType.BINARY_EXPRESSION:
        this.analyzeExpression(expr.left);
        this.analyzeExpression(expr.right);
        return this.typeChecker.inferType(expr);

      case NodeType.UNARY_EXPRESSION:
        return this.analyzeExpression(expr.argument);

      case NodeType.CALL_EXPRESSION:
        this.analyzeExpression(expr.callee);
        for (const arg of expr.arguments) {
          this.analyzeExpression(arg);
        }
        return this.typeChecker.inferType(expr);

      case NodeType.MEMBER_EXPRESSION:
        // Handle member expressions - don't check for undefined if it's this.property
        if (expr.object.type === NodeType.THIS_EXPRESSION) {
          // this.property access - don't error on undefined, assume it's a class property
          if (!expr.computed && expr.property.type === NodeType.IDENTIFIER) {
            // Optionally track class properties here
            return SolidityType.UNKNOWN;
          }
        } else {
          this.analyzeExpression(expr.object);
        }
        
        if (!expr.computed) {
          // For dot notation, property should be an identifier
          if (expr.property.type !== NodeType.THIS_EXPRESSION) {
            this.analyzeExpression(expr.property);
          }
        } else {
          // For bracket notation, analyze the computed property
          this.analyzeExpression(expr.property);
        }
        return this.typeChecker.inferType(expr);

      case NodeType.NEW_EXPRESSION:
        this.analyzeExpression(expr.callee);
        for (const arg of expr.arguments) {
          this.analyzeExpression(arg);
        }
        return SolidityType.ADDRESS;

      case NodeType.THIS_EXPRESSION:
        return SolidityType.ADDRESS;

      case NodeType.NUMBER_LITERAL:
      case NodeType.STRING_LITERAL:
      case NodeType.BOOLEAN_LITERAL:
      case NodeType.NULL_LITERAL:
        return this.typeChecker.inferType(expr);

      default:
        return SolidityType.UNKNOWN;
    }
  }

  getSymbolTable(): SymbolTable {
    return this.symbolTable;
  }

  getErrors(): SemanticError[] {
    return this.errors;
  }

  getWarnings(): SemanticError[] {
    return this.warnings;
  }
}
