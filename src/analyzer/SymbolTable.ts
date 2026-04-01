// Symbol Table for tracking variables, functions, and classes

export enum SymbolType {
  VARIABLE = "VARIABLE",
  FUNCTION = "FUNCTION",
  CLASS = "CLASS",
  PARAMETER = "PARAMETER",
}

export enum SolidityType {
  UINT256 = "uint256",
  INT256 = "int256",
  BOOL = "bool",
  STRING = "string",
  ADDRESS = "address",
  BYTES = "bytes",
  MAPPING = "mapping",
  ARRAY = "array",
  UNKNOWN = "unknown",
}

export interface Symbol {
  name: string;
  symbolType: SymbolType;
  dataType: SolidityType;
  scope: string;
  line?: number;
  column?: number;
  initialized: boolean;
  parameters?: { name: string; type: SolidityType }[];
  returnType?: SolidityType;
  properties?: Map<string, Symbol>;
}

export class SymbolTable {
  private scopes: Map<string, Map<string, Symbol>> = new Map();
  private currentScope: string = "global";
  private scopeStack: string[] = ["global"];

  constructor() {
    this.scopes.set("global", new Map());
  }

  enterScope(scopeName: string): void {
    this.currentScope = scopeName;
    this.scopeStack.push(scopeName);
    if (!this.scopes.has(scopeName)) {
      this.scopes.set(scopeName, new Map());
    }
  }

  exitScope(): void {
    this.scopeStack.pop();
    const newScope = this.scopeStack[this.scopeStack.length - 1];
    this.currentScope = newScope !== undefined ? newScope : "global";
  }

  getCurrentScope(): string {
    return this.currentScope;
  }

  define(symbol: Symbol): void {
    const scope = this.scopes.get(this.currentScope);
    if (!scope) {
      throw new Error(`Scope ${this.currentScope} not found`);
    }

    if (scope.has(symbol.name)) {
      throw new Error(
        `Symbol '${symbol.name}' already defined in scope '${this.currentScope}' at line ${symbol.line}`
      );
    }

    scope.set(symbol.name, symbol);
  }

  lookup(name: string, currentScopeOnly: boolean = false): Symbol | undefined {
    if (currentScopeOnly) {
      return this.scopes.get(this.currentScope)?.get(name);
    }

    // Search from current scope up to global scope
    for (let i = this.scopeStack.length - 1; i >= 0; i--) {
      const scopeName = this.scopeStack[i];
      if (scopeName) {
        const scope = this.scopes.get(scopeName);
        if (scope?.has(name)) {
          return scope.get(name);
        }
      }
    }

    return undefined;
  }

  update(name: string, updates: Partial<Symbol>): void {
    for (let i = this.scopeStack.length - 1; i >= 0; i--) {
      const scopeName = this.scopeStack[i];
      if (scopeName) {
        const scope = this.scopes.get(scopeName);
        const symbol = scope?.get(name);
        if (symbol) {
          Object.assign(symbol, updates);
          return;
        }
      }
    }
    throw new Error(`Symbol '${name}' not found in any scope`);
  }

  getAllSymbols(): Map<string, Map<string, Symbol>> {
    return this.scopes;
  }

  getScopeSymbols(scopeName: string): Map<string, Symbol> | undefined {
    return this.scopes.get(scopeName);
  }
}
