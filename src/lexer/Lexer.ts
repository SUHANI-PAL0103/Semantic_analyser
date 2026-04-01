import type { Token } from "./Token.js";
import { TokenType, KEYWORDS } from "./Token.js";

export class Lexer {
  private input: string;
  private position: number = 0;
  private line: number = 1;
  private column: number = 1;

  constructor(input: string) {
    this.input = input;
  }

  private peek(offset: number = 0): string {
    return this.input[this.position + offset] || '';
  }

  private advance(): string {
    const char = this.peek();
    this.position++;
    if (char === '\n') {
      this.line++;
      this.column = 1;
    } else {
      this.column++;
    }
    return char;
  }

  private isLetter(char: string): boolean {
    return /[a-zA-Z_$]/.test(char);
  }

  private isDigit(char: string): boolean {
    return /[0-9]/.test(char);
  }

  private isAlphaNumeric(char: string): boolean {
    return this.isLetter(char) || this.isDigit(char);
  }

  private skipWhitespace(): void {
    while (/\s/.test(this.peek()) && this.position < this.input.length) {
      this.advance();
    }
  }

  private skipComment(): void {
    if (this.peek() === '/' && this.peek(1) === '/') {
      // Single-line comment
      while (this.peek() !== '\n' && this.position < this.input.length) {
        this.advance();
      }
    } else if (this.peek() === '/' && this.peek(1) === '*') {
      // Multi-line comment
      this.advance(); // /
      this.advance(); // *
      while (!(this.peek() === '*' && this.peek(1) === '/') && this.position < this.input.length) {
        this.advance();
      }
      this.advance(); // *
      this.advance(); // /
    }
  }

  private readIdentifier(): Token {
    const startLine = this.line;
    const startColumn = this.column;
    let value = '';
    
    while (this.isAlphaNumeric(this.peek())) {
      value += this.advance();
    }

    const type = KEYWORDS[value] || TokenType.IDENTIFIER;
    return { type, value, line: startLine, column: startColumn };
  }

  private readNumber(): Token {
    const startLine = this.line;
    const startColumn = this.column;
    let value = '';
    
    while (this.isDigit(this.peek()) || this.peek() === '.') {
      value += this.advance();
    }

    return { type: TokenType.NUMBER, value, line: startLine, column: startColumn };
  }

  private readString(quote: string): Token {
    const startLine = this.line;
    const startColumn = this.column;
    this.advance(); // Skip opening quote
    let value = '';
    
    while (this.peek() !== quote && this.position < this.input.length) {
      if (this.peek() === '\\') {
        this.advance(); // Skip escape character
        const nextChar = this.advance();
        // Handle escape sequences
        switch (nextChar) {
          case 'n': value += '\n'; break;
          case 't': value += '\t'; break;
          case 'r': value += '\r'; break;
          case '\\': value += '\\'; break;
          case quote: value += quote; break;
          default: value += nextChar;
        }
      } else {
        value += this.advance();
      }
    }
    
    this.advance(); // Skip closing quote
    return { type: TokenType.STRING, value, line: startLine, column: startColumn };
  }

  tokenize(): Token[] {
    const tokens: Token[] = [];

    while (this.position < this.input.length) {
      this.skipWhitespace();
      
      if (this.position >= this.input.length) break;

      const current = this.peek();
      const startLine = this.line;
      const startColumn = this.column;

      // Comments
      if (current === '/' && (this.peek(1) === '/' || this.peek(1) === '*')) {
        this.skipComment();
        continue;
      }

      // Identifiers and Keywords
      if (this.isLetter(current)) {
        tokens.push(this.readIdentifier());
        continue;
      }

      // Numbers
      if (this.isDigit(current)) {
        tokens.push(this.readNumber());
        continue;
      }

      // Strings
      if (current === '"' || current === '\'' || current === '`') {
        tokens.push(this.readString(current));
        continue;
      }

      // Two-character operators
      if (current === '=' && this.peek(1) === '=') {
        if (this.peek(2) === '=') {
          tokens.push({ type: TokenType.STRICT_EQUALS, value: '===', line: startLine, column: startColumn });
          this.advance(); this.advance(); this.advance();
          continue;
        } else {
          tokens.push({ type: TokenType.EQUALS, value: '==', line: startLine, column: startColumn });
          this.advance(); this.advance();
          continue;
        }
      }

      if (current === '!' && this.peek(1) === '=') {
        if (this.peek(2) === '=') {
          tokens.push({ type: TokenType.STRICT_NOT_EQUALS, value: '!==', line: startLine, column: startColumn });
          this.advance(); this.advance(); this.advance();
          continue;
        } else {
          tokens.push({ type: TokenType.NOT_EQUALS, value: '!=', line: startLine, column: startColumn });
          this.advance(); this.advance();
          continue;
        }
      }

      if (current === '<' && this.peek(1) === '=') {
        tokens.push({ type: TokenType.LESS_THAN_EQUALS, value: '<=', line: startLine, column: startColumn });
        this.advance(); this.advance();
        continue;
      }

      if (current === '>' && this.peek(1) === '=') {
        tokens.push({ type: TokenType.GREATER_THAN_EQUALS, value: '>=', line: startLine, column: startColumn });
        this.advance(); this.advance();
        continue;
      }

      if (current === '&' && this.peek(1) === '&') {
        tokens.push({ type: TokenType.AND, value: '&&', line: startLine, column: startColumn });
        this.advance(); this.advance();
        continue;
      }

      if (current === '|' && this.peek(1) === '|') {
        tokens.push({ type: TokenType.OR, value: '||', line: startLine, column: startColumn });
        this.advance(); this.advance();
        continue;
      }

      if (current === '+' && this.peek(1) === '=') {
        tokens.push({ type: TokenType.PLUS_EQUALS, value: '+=', line: startLine, column: startColumn });
        this.advance(); this.advance();
        continue;
      }

      if (current === '-' && this.peek(1) === '=') {
        tokens.push({ type: TokenType.MINUS_EQUALS, value: '-=', line: startLine, column: startColumn });
        this.advance(); this.advance();
        continue;
      }

      if (current === '=' && this.peek(1) === '>') {
        tokens.push({ type: TokenType.ARROW, value: '=>', line: startLine, column: startColumn });
        this.advance(); this.advance();
        continue;
      }

      // Single-character tokens
      const singleCharMap: Record<string, TokenType> = {
        '+': TokenType.PLUS,
        '-': TokenType.MINUS,
        '*': TokenType.MULTIPLY,
        '/': TokenType.DIVIDE,
        '%': TokenType.MODULO,
        '=': TokenType.ASSIGN,
        '<': TokenType.LESS_THAN,
        '>': TokenType.GREATER_THAN,
        '!': TokenType.NOT,
        '(': TokenType.LPAREN,
        ')': TokenType.RPAREN,
        '{': TokenType.LBRACE,
        '}': TokenType.RBRACE,
        '[': TokenType.LBRACKET,
        ']': TokenType.RBRACKET,
        ';': TokenType.SEMICOLON,
        ',': TokenType.COMMA,
        '.': TokenType.DOT,
        ':': TokenType.COLON,
      };

      if (singleCharMap[current]) {
        tokens.push({ 
          type: singleCharMap[current], 
          value: current, 
          line: startLine, 
          column: startColumn 
        });
        this.advance();
        continue;
      }

      throw new Error(`Unexpected character '${current}' at line ${this.line}, column ${this.column}`);
    }

    tokens.push({ type: TokenType.EOF, value: '', line: this.line, column: this.column });
    return tokens;
  }
}
