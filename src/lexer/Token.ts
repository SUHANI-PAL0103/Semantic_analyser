export enum TokenType {
  // Keywords
  CLASS = "CLASS",
  FUNCTION = "FUNCTION",
  CONSTRUCTOR = "CONSTRUCTOR",
  THIS = "THIS",
  RETURN = "RETURN",
  IF = "IF",
  ELSE = "ELSE",
  WHILE = "WHILE",
  FOR = "FOR",
  LET = "LET",
  CONST = "CONST",
  NEW = "NEW",
  ASYNC = "ASYNC",
  AWAIT = "AWAIT",
  IMPORT = "IMPORT",
  EXPORT = "EXPORT",
  
  // Literals
  IDENTIFIER = "IDENTIFIER",
  NUMBER = "NUMBER",
  STRING = "STRING",
  BOOLEAN = "BOOLEAN",
  NULL = "NULL",
  UNDEFINED = "UNDEFINED",
  
  // Operators
  PLUS = "PLUS",
  MINUS = "MINUS",
  MULTIPLY = "MULTIPLY",
  DIVIDE = "DIVIDE",
  MODULO = "MODULO",
  ASSIGN = "ASSIGN",
  PLUS_EQUALS = "PLUS_EQUALS",
  MINUS_EQUALS = "MINUS_EQUALS",
  EQUALS = "EQUALS",
  NOT_EQUALS = "NOT_EQUALS",
  STRICT_EQUALS = "STRICT_EQUALS",
  STRICT_NOT_EQUALS = "STRICT_NOT_EQUALS",
  LESS_THAN = "LESS_THAN",
  GREATER_THAN = "GREATER_THAN",
  LESS_THAN_EQUALS = "LESS_THAN_EQUALS",
  GREATER_THAN_EQUALS = "GREATER_THAN_EQUALS",
  AND = "AND",
  OR = "OR",
  NOT = "NOT",
  
  // Punctuation
  LPAREN = "LPAREN",
  RPAREN = "RPAREN",
  LBRACE = "LBRACE",
  RBRACE = "RBRACE",
  LBRACKET = "LBRACKET",
  RBRACKET = "RBRACKET",
  SEMICOLON = "SEMICOLON",
  COMMA = "COMMA",
  DOT = "DOT",
  COLON = "COLON",
  ARROW = "ARROW",
  
  // Special
  EOF = "EOF",
  NEWLINE = "NEWLINE",
  COMMENT = "COMMENT"
}

export interface Token {
  type: TokenType;
  value: string;
  line?: number;
  column?: number;
}

export const KEYWORDS: Record<string, TokenType> = {
  'class': TokenType.CLASS,
  'function': TokenType.FUNCTION,
  'constructor': TokenType.CONSTRUCTOR,
  'this': TokenType.THIS,
  'return': TokenType.RETURN,
  'if': TokenType.IF,
  'else': TokenType.ELSE,
  'while': TokenType.WHILE,
  'for': TokenType.FOR,
  'let': TokenType.LET,
  'const': TokenType.CONST,
  'new': TokenType.NEW,
  'true': TokenType.BOOLEAN,
  'false': TokenType.BOOLEAN,
  'null': TokenType.NULL,
  'undefined': TokenType.UNDEFINED,
  'async': TokenType.ASYNC,
  'await': TokenType.AWAIT,
  'import': TokenType.IMPORT,
  'export': TokenType.EXPORT
};
