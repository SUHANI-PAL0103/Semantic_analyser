import { Lexer } from "../src/lexer/Lexer";
import { TokenType } from "../src/lexer/Token";

describe("Lexer", () => {
  test("tokenizes variable declaration", () => {
    const code = "let x = 10;";
    const lexer = new Lexer(code);
    const tokens = lexer.tokenize();

    expect(tokens[0].type).toBe(TokenType.LET);
    expect(tokens[1].type).toBe(TokenType.IDENTIFIER);
    expect(tokens[1].value).toBe("x");
    expect(tokens[2].type).toBe(TokenType.ASSIGN);
    expect(tokens[3].type).toBe(TokenType.NUMBER);
    expect(tokens[3].value).toBe("10");
    expect(tokens[4].type).toBe(TokenType.SEMICOLON);
    expect(tokens[5].type).toBe(TokenType.EOF);
  });

  test("tokenizes class declaration", () => {
    const code = "class Token { }";
    const lexer = new Lexer(code);
    const tokens = lexer.tokenize();

    expect(tokens[0].type).toBe(TokenType.CLASS);
    expect(tokens[1].type).toBe(TokenType.IDENTIFIER);
    expect(tokens[1].value).toBe("Token");
    expect(tokens[2].type).toBe(TokenType.LBRACE);
    expect(tokens[3].type).toBe(TokenType.RBRACE);
  });

  test("tokenizes string literals", () => {
    const code = 'let name = "Alice";';
    const lexer = new Lexer(code);
    const tokens = lexer.tokenize();

    expect(tokens[3].type).toBe(TokenType.STRING);
    expect(tokens[3].value).toBe("Alice");
  });

  test("tokenizes boolean literals", () => {
    const code = "let isActive = true;";
    const lexer = new Lexer(code);
    const tokens = lexer.tokenize();

    expect(tokens[3].type).toBe(TokenType.BOOLEAN);
    expect(tokens[3].value).toBe("true");
  });

  test("tokenizes operators", () => {
    const code = "x = a + b - c * d / e;";
    const lexer = new Lexer(code);
    const tokens = lexer.tokenize();

    expect(tokens[2].type).toBe(TokenType.PLUS);
    expect(tokens[4].type).toBe(TokenType.MINUS);
    expect(tokens[6].type).toBe(TokenType.MULTIPLY);
    expect(tokens[8].type).toBe(TokenType.DIVIDE);
  });

  test("skips single-line comments", () => {
    const code = "let x = 10; // This is a comment\nlet y = 20;";
    const lexer = new Lexer(code);
    const tokens = lexer.tokenize();

    // Should not include comment tokens
    const hasCommentToken = tokens.some(t => t.type === TokenType.COMMENT);
    expect(hasCommentToken).toBe(false);
    
    // Should have both variable declarations
    const identifiers = tokens.filter(t => t.type === TokenType.IDENTIFIER);
    expect(identifiers.length).toBe(2);
  });

  test("tracks line and column numbers", () => {
    const code = "let x = 10;\nlet y = 20;";
    const lexer = new Lexer(code);
    const tokens = lexer.tokenize();

    // First line
    expect(tokens[0].line).toBe(1);
    
    // Second line (after newline)
    const secondLet = tokens.find((t, i) => i > 5 && t.type === TokenType.LET);
    expect(secondLet?.line).toBe(2);
  });
});
