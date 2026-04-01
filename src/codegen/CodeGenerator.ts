import type {
  Program,
  Statement,
  Expression,
  ClassDeclaration,
  FunctionDeclaration,
  VariableDeclaration,
  BlockStatement,
} from "../parser/AST.js";
import { NodeType } from "../parser/AST.js";
import type { SymbolTable } from "../analyzer/SymbolTable.js";
import { SolidityType } from "../analyzer/SymbolTable.js";

export interface GeneratorOptions {
  solidityVersion?: string;
  license?: string;
  indentSize?: number;
}

export class CodeGenerator {
  private symbolTable: SymbolTable;
  private options: Required<GeneratorOptions>;
  private indentLevel: number = 0;
  private output: string[] = [];

  constructor(symbolTable: SymbolTable, options: GeneratorOptions = {}) {
    this.symbolTable = symbolTable;
    this.options = {
      solidityVersion: options.solidityVersion || "^0.8.0",
      license: options.license || "MIT",
      indentSize: options.indentSize || 2,
    };
  }

  generate(ast: Program): string {
    this.output = [];
    this.indentLevel = 0;

    // Generate header
    this.generateHeader();
    this.emit("");

    // Generate program body
    for (const statement of ast.body) {
      this.generateStatement(statement);
      this.emit("");
    }

    return this.output.join("\n");
  }

  private generateHeader(): void {
    this.emit(`// SPDX-License-Identifier: ${this.options.license}`);
    this.emit(`pragma solidity ${this.options.solidityVersion};`);
  }

  private generateStatement(statement: Statement): void {
    switch (statement.type) {
      case NodeType.CLASS_DECLARATION:
        this.generateClassDeclaration(statement as unknown as ClassDeclaration);
        break;
      case NodeType.FUNCTION_DECLARATION:
        this.generateFunctionDeclaration(statement as unknown as FunctionDeclaration);
        break;
      case NodeType.VARIABLE_DECLARATION:
        this.generateVariableDeclaration(statement as VariableDeclaration);
        break;
      case NodeType.EXPRESSION_STATEMENT:
        this.emit(this.generateExpression(statement.expression) + ";");
        break;
      case NodeType.RETURN_STATEMENT:
        if (statement.argument) {
          this.emit(`return ${this.generateExpression(statement.argument)};`);
        } else {
          this.emit("return;");
        }
        break;
      case NodeType.IF_STATEMENT:
        this.emit(`if (${this.generateExpression(statement.condition)}) {`);
        this.indent();
        this.generateStatement(statement.consequent);
        this.dedent();
        if (statement.alternate) {
          this.emit("} else {");
          this.indent();
          this.generateStatement(statement.alternate);
          this.dedent();
        }
        this.emit("}");
        break;
      case NodeType.WHILE_STATEMENT:
        this.emit(`while (${this.generateExpression(statement.condition)}) {`);
        this.indent();
        this.generateStatement(statement.body);
        this.dedent();
        this.emit("}");
        break;
      case NodeType.FOR_STATEMENT:
        let init = "";
        let condition = "";
        let update = "";

        if (statement.init) {
          if ('identifier' in statement.init) {
            const varDecl = statement.init as VariableDeclaration;
            const type = this.inferSolidityType(varDecl.init);
            init = `${type} ${varDecl.identifier}`;
            if (varDecl.init) {
              init += ` = ${this.generateExpression(varDecl.init)}`;
            }
          } else {
            init = this.generateExpression(statement.init as Expression);
          }
        }

        if (statement.condition) {
          condition = this.generateExpression(statement.condition);
        }

        if (statement.update) {
          update = this.generateExpression(statement.update);
        }

        this.emit(`for (${init}; ${condition}; ${update}) {`);
        this.indent();
        this.generateStatement(statement.body);
        this.dedent();
        this.emit("}");
        break;
      case NodeType.BLOCK_STATEMENT:
        this.generateBlockStatement(statement as BlockStatement);
        break;
    }
  }

  private generateClassDeclaration(classDecl: ClassDeclaration): void {
    this.emit(`contract ${classDecl.name} {`);
    this.indent();

    // Generate state variables from properties
    if (classDecl.properties.length > 0) {
      this.emit("// State variables");
      for (const property of classDecl.properties) {
        const type = this.inferSolidityType(property.init);
        this.emit(`${type} public ${property.identifier};`);
      }
      this.emit("");
    }

    // Generate constructor
    if (classDecl.constructor) {
      this.generateConstructor(classDecl.constructor, classDecl.properties);
      this.emit("");
    }

    // Generate methods
    for (const method of classDecl.methods) {
      this.generateFunctionDeclaration(method);
      this.emit("");
    }

    this.dedent();
    this.emit("}");
  }

  private generateConstructor(
    constructor: FunctionDeclaration,
    properties: VariableDeclaration[]
  ): void {
    const params = constructor.parameters
      .map((p) => {
        const type = p.typeAnnotation || "uint256";
        return `${type} ${p.name}`;
      })
      .join(", ");

    this.emit(`constructor(${params}) {`);
    this.indent();

    // Generate constructor body
    for (const statement of constructor.body.body) {
      // Check if this is a property initialization (this.x = ...)
      if (
        statement.type === NodeType.EXPRESSION_STATEMENT &&
        statement.expression.type === NodeType.ASSIGNMENT_EXPRESSION
      ) {
        const assignment = statement.expression;
        if (
          assignment.left.type === NodeType.MEMBER_EXPRESSION &&
          assignment.left.object.type === NodeType.THIS_EXPRESSION
        ) {
          // This is a property assignment
          const propertyName =
            assignment.left.property.type === NodeType.IDENTIFIER
              ? assignment.left.property.name
              : "";
          this.emit(
            `${propertyName} = ${this.generateExpression(assignment.right)};`
          );
          continue;
        }
      }
      this.generateStatement(statement);
    }

    this.dedent();
    this.emit("}");
  }

  private generateFunctionDeclaration(funcDecl: FunctionDeclaration): void {
    if (funcDecl.isConstructor) return; // Handled separately

    const params = funcDecl.parameters
      .map((p) => {
        const type = p.typeAnnotation || "uint256";
        return `${type} ${p.name}`;
      })
      .join(", ");

    // Determine visibility and other modifiers
    const visibility = "public";
    
    this.emit(`function ${funcDecl.name}(${params}) ${visibility} {`);
    this.indent();

    this.generateBlockStatement(funcDecl.body);

    this.dedent();
    this.emit("}");
  }

  private generateVariableDeclaration(varDecl: VariableDeclaration): void {
    const type = this.inferSolidityType(varDecl.init);
    let declaration = `${type} ${varDecl.identifier}`;

    if (varDecl.init) {
      declaration += ` = ${this.generateExpression(varDecl.init)}`;
    }

    this.emit(declaration + ";");
  }

  private generateBlockStatement(block: BlockStatement): void {
    for (const statement of block.body) {
      this.generateStatement(statement);
    }
  }

  private generateExpression(expr: Expression): string {
    switch (expr.type) {
      case NodeType.NUMBER_LITERAL:
        return expr.value.toString();

      case NodeType.STRING_LITERAL:
        return `"${expr.value}"`;

      case NodeType.BOOLEAN_LITERAL:
        return expr.value ? "true" : "false";

      case NodeType.NULL_LITERAL:
        return "address(0)";

      case NodeType.IDENTIFIER:
        return expr.name;

      case NodeType.THIS_EXPRESSION:
        return "address(this)";

      case NodeType.BINARY_EXPRESSION:
        const left = this.generateExpression(expr.left);
        const right = this.generateExpression(expr.right);
        // Map JavaScript operators to Solidity
        const operator = this.mapOperator(expr.operator);
        return `${left} ${operator} ${right}`;

      case NodeType.UNARY_EXPRESSION:
        const arg = this.generateExpression(expr.argument);
        return `${expr.operator}${arg}`;

      case NodeType.ASSIGNMENT_EXPRESSION:
        const assignLeft = this.generateExpression(expr.left);
        const assignRight = this.generateExpression(expr.right);
        
        // Handle compound assignments
        if (expr.operator === '+=') {
          return `${assignLeft} += ${assignRight}`;
        } else if (expr.operator === '-=') {
          return `${assignLeft} -= ${assignRight}`;
        }
        
        return `${assignLeft} = ${assignRight}`;

      case NodeType.CALL_EXPRESSION:
        const callee = this.generateExpression(expr.callee);
        const args = expr.arguments.map((arg) => this.generateExpression(arg));
        return `${callee}(${args.join(", ")})`;

      case NodeType.MEMBER_EXPRESSION:
        const object = this.generateExpression(expr.object);
        
        // Skip 'this.' prefix in Solidity
        if (expr.object.type === NodeType.THIS_EXPRESSION) {
          return this.generateExpression(expr.property);
        }
        
        if (expr.computed) {
          const property = this.generateExpression(expr.property);
          return `${object}[${property}]`;
        } else {
          const property =
            expr.property.type === NodeType.IDENTIFIER
              ? expr.property.name
              : this.generateExpression(expr.property);
          return `${object}.${property}`;
        }

      case NodeType.NEW_EXPRESSION:
        const newCallee = this.generateExpression(expr.callee);
        const newArgs = expr.arguments.map((arg) => this.generateExpression(arg));
        return `new ${newCallee}(${newArgs.join(", ")})`;

      default:
        return "/* unsupported expression */";
    }
  }

  private inferSolidityType(expr?: Expression): string {
    if (!expr) return SolidityType.UINT256;

    switch (expr.type) {
      case NodeType.NUMBER_LITERAL:
        // Check if it's a decimal number
        if (expr.value % 1 !== 0) {
          return SolidityType.UINT256; // Solidity doesn't have native floats, use fixed-point or uint
        }
        return SolidityType.UINT256;

      case NodeType.STRING_LITERAL:
        return SolidityType.STRING;

      case NodeType.BOOLEAN_LITERAL:
        return SolidityType.BOOL;

      case NodeType.NULL_LITERAL:
        return SolidityType.ADDRESS;

      case NodeType.IDENTIFIER:
        const symbol = this.symbolTable.lookup(expr.name);
        if (symbol) {
          return symbol.dataType;
        }
        return SolidityType.UINT256;

      default:
        return SolidityType.UINT256;
    }
  }

  private mapOperator(operator: string): string {
    // Map JavaScript operators to Solidity equivalents
    const operatorMap: Record<string, string> = {
      '===': '==',  // Solidity doesn't distinguish between == and ===
      '!==': '!=',
    };

    return operatorMap[operator] || operator;
  }

  private emit(code: string): void {
    const indent = " ".repeat(this.indentLevel * this.options.indentSize);
    this.output.push(indent + code);
  }

  private indent(): void {
    this.indentLevel++;
  }

  private dedent(): void {
    this.indentLevel = Math.max(0, this.indentLevel - 1);
  }
}
