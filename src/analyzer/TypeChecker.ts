import type { Expression } from "../parser/AST.js";
import { NodeType } from "../parser/AST.js";
import { SolidityType } from "./SymbolTable.js";
import type { SymbolTable } from "./SymbolTable.js";

export class TypeChecker {
  private symbolTable: SymbolTable;

  constructor(symbolTable: SymbolTable) {
    this.symbolTable = symbolTable;
  }

  inferType(expr: Expression): SolidityType {
    switch (expr.type) {
      case NodeType.NUMBER_LITERAL:
        return SolidityType.UINT256;

      case NodeType.STRING_LITERAL:
        return SolidityType.STRING;

      case NodeType.BOOLEAN_LITERAL:
        return SolidityType.BOOL;

      case NodeType.NULL_LITERAL:
        return SolidityType.ADDRESS; // Default to address for null

      case NodeType.IDENTIFIER:
        const symbol = this.symbolTable.lookup(expr.name);
        if (symbol) {
          return symbol.dataType;
        }
        return SolidityType.UNKNOWN;

      case NodeType.BINARY_EXPRESSION:
        return this.inferBinaryExpressionType(expr);

      case NodeType.ASSIGNMENT_EXPRESSION:
        return this.inferType(expr.right);

      case NodeType.CALL_EXPRESSION:
        // Try to infer return type from function symbol
        if (expr.callee.type === NodeType.IDENTIFIER) {
          const funcSymbol = this.symbolTable.lookup(expr.callee.name);
          if (funcSymbol?.returnType) {
            return funcSymbol.returnType;
          }
        }
        return SolidityType.UNKNOWN;

      case NodeType.MEMBER_EXPRESSION:
        // Handle member access type inference
        return this.inferMemberExpressionType(expr);

      case NodeType.THIS_EXPRESSION:
        return SolidityType.ADDRESS;

      default:
        return SolidityType.UNKNOWN;
    }
  }

  private inferBinaryExpressionType(expr: Expression): SolidityType {
    if (expr.type !== NodeType.BINARY_EXPRESSION) {
      return SolidityType.UNKNOWN;
    }

    const operator = expr.operator;
    const leftType = this.inferType(expr.left);
    const rightType = this.inferType(expr.right);

    // Arithmetic operators
    if (['+', '-', '*', '/', '%'].includes(operator)) {
      // If either operand is string and operator is +, result is string
      if (operator === '+' && (leftType === SolidityType.STRING || rightType === SolidityType.STRING)) {
        return SolidityType.STRING;
      }
      // Otherwise arithmetic results in number
      return SolidityType.UINT256;
    }

    // Comparison operators
    if (['<', '>', '<=', '>=', '==', '!=', '===', '!=='].includes(operator)) {
      return SolidityType.BOOL;
    }

    // Logical operators
    if (['&&', '||'].includes(operator)) {
      return SolidityType.BOOL;
    }

    return SolidityType.UNKNOWN;
  }

  private inferMemberExpressionType(expr: Expression): SolidityType {
    if (expr.type !== NodeType.MEMBER_EXPRESSION) {
      return SolidityType.UNKNOWN;
    }

    // Try to resolve object type
    const objectType = this.inferType(expr.object);
    
    // If property is an identifier, try to look it up in class properties
    if (expr.property.type === NodeType.IDENTIFIER) {
      // For now, return unknown - in a more advanced implementation,
      // we would track class property types
      return SolidityType.UNKNOWN;
    }

    return SolidityType.UNKNOWN;
  }

  checkTypeCompatibility(expected: SolidityType, actual: SolidityType, line?: number): void {
    // Allow unknown types to pass (will be resolved later or flagged)
    if (actual === SolidityType.UNKNOWN || expected === SolidityType.UNKNOWN) {
      return;
    }

    // Exact match
    if (expected === actual) {
      return;
    }

    // Compatible types
    const compatibleTypes: Record<string, SolidityType[]> = {
      [SolidityType.UINT256]: [SolidityType.INT256],
      [SolidityType.INT256]: [SolidityType.UINT256],
      [SolidityType.ADDRESS]: [SolidityType.UINT256], // Address can be treated as uint in some contexts
    };

    if (compatibleTypes[expected]?.includes(actual)) {
      return;
    }

    throw new Error(
      `Type mismatch at line ${line || 'unknown'}: expected ${expected}, got ${actual}`
    );
  }

  mapJSTypeToSolidity(jsType: string): SolidityType {
    const typeMap: Record<string, SolidityType> = {
      'number': SolidityType.UINT256,
      'string': SolidityType.STRING,
      'boolean': SolidityType.BOOL,
      'address': SolidityType.ADDRESS,
      'object': SolidityType.UNKNOWN,
    };

    return typeMap[jsType.toLowerCase()] || SolidityType.UNKNOWN;
  }

  formatSolidityType(type: SolidityType, arrayDepth: number = 0): string {
    let result: string = type;
    for (let i = 0; i < arrayDepth; i++) {
      result += '[]';
    }
    return result;
  }
}
