import type { Token } from "../lexer/Token.js";
import { TokenType } from "../lexer/Token.js";
import type {
  Program,
  Statement,
  Expression,
  ClassDeclaration,
  FunctionDeclaration,
  VariableDeclaration,
  BlockStatement,
  ExpressionStatement,
  ReturnStatement,
  IfStatement,
  WhileStatement,
  BinaryExpression,
  AssignmentExpression,
  CallExpression,
  MemberExpression,
  Identifier,
  Parameter,
} from "./AST.js";
import { NodeType } from "./AST.js";

export class Parser {
  private tokens: Token[];
  private position: number = 0;

  constructor(tokens: Token[]) {
    this.tokens = tokens;
  }

  private peek(offset: number = 0): Token {
    const token = this.tokens[this.position + offset];
    if (!token) {
      return this.tokens[this.tokens.length - 1] || { type: TokenType.EOF, value: '' };
    }
    return token;
  }

  private advance(): Token {
    const token = this.peek();
    this.position++;
    return token;
  }

  private expect(type: TokenType, errorMessage?: string): Token {
    const token = this.peek();
    if (token.type !== type) {
      throw new Error(
        errorMessage || 
        `Expected token type ${type}, but got ${token.type} at line ${token.line}:${token.column}`
      );
    }
    return this.advance();
  }

  private match(...types: TokenType[]): boolean {
    return types.includes(this.peek().type);
  }

  parse(): Program {
    const body: Statement[] = [];

    while (!this.match(TokenType.EOF)) {
      body.push(this.parseDeclaration());
    }

    return {
      type: NodeType.PROGRAM,
      body
    };
  }

  private parseDeclaration(): Statement {
    if (this.match(TokenType.CLASS)) {
      return this.parseClassDeclaration();
    }
    if (this.match(TokenType.FUNCTION)) {
      return this.parseFunctionDeclaration();
    }
    if (this.match(TokenType.LET, TokenType.CONST)) {
      return this.parseVariableDeclaration();
    }
    return this.parseStatement();
  }

  private parseClassDeclaration(): ClassDeclaration {
    const classToken = this.expect(TokenType.CLASS);
    const name = this.expect(TokenType.IDENTIFIER).value;
    
    this.expect(TokenType.LBRACE);

    let constructor: FunctionDeclaration | undefined;
    const methods: FunctionDeclaration[] = [];
    const properties: VariableDeclaration[] = [];

    while (!this.match(TokenType.RBRACE) && !this.match(TokenType.EOF)) {
      if (this.match(TokenType.CONSTRUCTOR)) {
        constructor = this.parseConstructor();
      } else if (this.match(TokenType.IDENTIFIER)) {
        // Could be a method or property
        const ahead = this.peek(1);
        if (ahead.type === TokenType.LPAREN) {
          methods.push(this.parseMethodDeclaration());
        } else {
          // Treat as property initialization in constructor
          const propName = this.advance().value;
          this.expect(TokenType.ASSIGN);
          const init = this.parseExpression();
          this.match(TokenType.SEMICOLON) && this.advance();
          properties.push({
            type: NodeType.VARIABLE_DECLARATION,
            identifier: propName,
            init,
            kind: 'let'
          });
        }
      } else {
        this.advance(); // Skip unexpected token
      }
    }

    this.expect(TokenType.RBRACE);

    return {
      type: NodeType.CLASS_DECLARATION,
      name,
      constructor,
      methods,
      properties,
      line: classToken.line,
      column: classToken.column
    };
  }

  private parseConstructor(): FunctionDeclaration {
    const constructorToken = this.expect(TokenType.CONSTRUCTOR);
    this.expect(TokenType.LPAREN);
    
    const parameters: Parameter[] = [];
    while (!this.match(TokenType.RPAREN)) {
      const paramName = this.expect(TokenType.IDENTIFIER).value;
      parameters.push({ name: paramName });
      
      if (this.match(TokenType.COMMA)) {
        this.advance();
      }
    }
    
    this.expect(TokenType.RPAREN);
    const body = this.parseBlockStatement();

    return {
      type: NodeType.FUNCTION_DECLARATION,
      name: 'constructor',
      parameters,
      body,
      isConstructor: true,
      line: constructorToken.line,
      column: constructorToken.column
    };
  }

  private parseMethodDeclaration(): FunctionDeclaration {
    const nameToken = this.expect(TokenType.IDENTIFIER);
    const name = nameToken.value;
    
    this.expect(TokenType.LPAREN);
    
    const parameters: Parameter[] = [];
    while (!this.match(TokenType.RPAREN)) {
      const paramName = this.expect(TokenType.IDENTIFIER).value;
      parameters.push({ name: paramName });
      
      if (this.match(TokenType.COMMA)) {
        this.advance();
      }
    }
    
    this.expect(TokenType.RPAREN);
    const body = this.parseBlockStatement();

    return {
      type: NodeType.FUNCTION_DECLARATION,
      name,
      parameters,
      body,
      line: nameToken.line,
      column: nameToken.column
    };
  }

  private parseFunctionDeclaration(): FunctionDeclaration {
    const funcToken = this.expect(TokenType.FUNCTION);
    const name = this.expect(TokenType.IDENTIFIER).value;
    
    this.expect(TokenType.LPAREN);
    
    const parameters: Parameter[] = [];
    while (!this.match(TokenType.RPAREN)) {
      const paramName = this.expect(TokenType.IDENTIFIER).value;
      parameters.push({ name: paramName });
      
      if (this.match(TokenType.COMMA)) {
        this.advance();
      }
    }
    
    this.expect(TokenType.RPAREN);
    const body = this.parseBlockStatement();

    return {
      type: NodeType.FUNCTION_DECLARATION,
      name,
      parameters,
      body,
      line: funcToken.line,
      column: funcToken.column
    };
  }

  private parseVariableDeclaration(): VariableDeclaration {
    const kindToken = this.advance();
    const kind = kindToken.value as 'let' | 'const';
    const identifier = this.expect(TokenType.IDENTIFIER).value;
    
    let init: Expression | undefined;
    if (this.match(TokenType.ASSIGN)) {
      this.advance();
      init = this.parseExpression();
    }
    
    this.match(TokenType.SEMICOLON) && this.advance();

    return {
      type: NodeType.VARIABLE_DECLARATION,
      identifier,
      init,
      kind,
      line: kindToken.line,
      column: kindToken.column
    };
  }

  private parseStatement(): Statement {
    if (this.match(TokenType.RETURN)) {
      return this.parseReturnStatement();
    }
    if (this.match(TokenType.IF)) {
      return this.parseIfStatement();
    }
    if (this.match(TokenType.WHILE)) {
      return this.parseWhileStatement();
    }
    if (this.match(TokenType.LBRACE)) {
      return this.parseBlockStatement();
    }
    return this.parseExpressionStatement();
  }

  private parseReturnStatement(): ReturnStatement {
    const returnToken = this.expect(TokenType.RETURN);
    
    let argument: Expression | null = null;
    if (!this.match(TokenType.SEMICOLON) && !this.match(TokenType.RBRACE)) {
      argument = this.parseExpression();
    }
    
    this.match(TokenType.SEMICOLON) && this.advance();

    return {
      type: NodeType.RETURN_STATEMENT,
      argument,
      line: returnToken.line,
      column: returnToken.column
    };
  }

  private parseIfStatement(): IfStatement {
    const ifToken = this.expect(TokenType.IF);
    this.expect(TokenType.LPAREN);
    const condition = this.parseExpression();
    this.expect(TokenType.RPAREN);
    
    const consequent = this.parseStatement();
    
    let alternate: Statement | undefined;
    if (this.match(TokenType.ELSE)) {
      this.advance();
      alternate = this.parseStatement();
    }

    return {
      type: NodeType.IF_STATEMENT,
      condition,
      consequent,
      alternate,
      line: ifToken.line,
      column: ifToken.column
    };
  }

  private parseWhileStatement(): WhileStatement {
    const whileToken = this.expect(TokenType.WHILE);
    this.expect(TokenType.LPAREN);
    const condition = this.parseExpression();
    this.expect(TokenType.RPAREN);
    const body = this.parseStatement();

    return {
      type: NodeType.WHILE_STATEMENT,
      condition,
      body,
      line: whileToken.line,
      column: whileToken.column
    };
  }

  private parseBlockStatement(): BlockStatement {
    const lbrace = this.expect(TokenType.LBRACE);
    const body: Statement[] = [];

    while (!this.match(TokenType.RBRACE) && !this.match(TokenType.EOF)) {
      body.push(this.parseDeclaration());
    }

    this.expect(TokenType.RBRACE);

    return {
      type: NodeType.BLOCK_STATEMENT,
      body,
      line: lbrace.line,
      column: lbrace.column
    };
  }

  private parseExpressionStatement(): ExpressionStatement {
    const expression = this.parseExpression();
    this.match(TokenType.SEMICOLON) && this.advance();

    return {
      type: NodeType.EXPRESSION_STATEMENT,
      expression,
      line: expression.line,
      column: expression.column
    };
  }

  private parseExpression(): Expression {
    return this.parseAssignment();
  }

  private parseAssignment(): Expression {
    let left = this.parseLogicalOr();

    if (this.match(TokenType.ASSIGN, TokenType.PLUS_EQUALS, TokenType.MINUS_EQUALS)) {
      const operator = this.advance().value;
      const right = this.parseAssignment();
      
      return {
        type: NodeType.ASSIGNMENT_EXPRESSION,
        operator,
        left,
        right,
        line: left.line,
        column: left.column
      } as AssignmentExpression;
    }

    return left;
  }

  private parseLogicalOr(): Expression {
    let left = this.parseLogicalAnd();

    while (this.match(TokenType.OR)) {
      const operator = this.advance().value;
      const right = this.parseLogicalAnd();
      left = {
        type: NodeType.BINARY_EXPRESSION,
        operator,
        left,
        right,
        line: left.line,
        column: left.column
      } as BinaryExpression;
    }

    return left;
  }

  private parseLogicalAnd(): Expression {
    let left = this.parseEquality();

    while (this.match(TokenType.AND)) {
      const operator = this.advance().value;
      const right = this.parseEquality();
      left = {
        type: NodeType.BINARY_EXPRESSION,
        operator,
        left,
        right,
        line: left.line,
        column: left.column
      } as BinaryExpression;
    }

    return left;
  }

  private parseEquality(): Expression {
    let left = this.parseComparison();

    while (this.match(TokenType.EQUALS, TokenType.NOT_EQUALS, TokenType.STRICT_EQUALS, TokenType.STRICT_NOT_EQUALS)) {
      const operator = this.advance().value;
      const right = this.parseComparison();
      left = {
        type: NodeType.BINARY_EXPRESSION,
        operator,
        left,
        right,
        line: left.line,
        column: left.column
      } as BinaryExpression;
    }

    return left;
  }

  private parseComparison(): Expression {
    let left = this.parseAdditive();

    while (this.match(TokenType.LESS_THAN, TokenType.GREATER_THAN, TokenType.LESS_THAN_EQUALS, TokenType.GREATER_THAN_EQUALS)) {
      const operator = this.advance().value;
      const right = this.parseAdditive();
      left = {
        type: NodeType.BINARY_EXPRESSION,
        operator,
        left,
        right,
        line: left.line,
        column: left.column
      } as BinaryExpression;
    }

    return left;
  }

  private parseAdditive(): Expression {
    let left = this.parseMultiplicative();

    while (this.match(TokenType.PLUS, TokenType.MINUS)) {
      const operator = this.advance().value;
      const right = this.parseMultiplicative();
      left = {
        type: NodeType.BINARY_EXPRESSION,
        operator,
        left,
        right,
        line: left.line,
        column: left.column
      } as BinaryExpression;
    }

    return left;
  }

  private parseMultiplicative(): Expression {
    let left = this.parseUnary();

    while (this.match(TokenType.MULTIPLY, TokenType.DIVIDE, TokenType.MODULO)) {
      const operator = this.advance().value;
      const right = this.parseUnary();
      left = {
        type: NodeType.BINARY_EXPRESSION,
        operator,
        left,
        right,
        line: left.line,
        column: left.column
      } as BinaryExpression;
    }

    return left;
  }

  private parseUnary(): Expression {
    if (this.match(TokenType.NOT, TokenType.MINUS)) {
      const operator = this.advance();
      const argument = this.parseUnary();
      return {
        type: NodeType.UNARY_EXPRESSION,
        operator: operator.value,
        argument,
        line: operator.line,
        column: operator.column
      };
    }

    return this.parsePostfix();
  }

  private parsePostfix(): Expression {
    let expr = this.parsePrimary();

    while (true) {
      if (this.match(TokenType.DOT)) {
        this.advance();
        const property = this.expect(TokenType.IDENTIFIER);
        expr = {
          type: NodeType.MEMBER_EXPRESSION,
          object: expr,
          property: {
            type: NodeType.IDENTIFIER,
            name: property.value,
            line: property.line,
            column: property.column
          } as Identifier,
          computed: false,
          line: expr.line,
          column: expr.column
        } as MemberExpression;
      } else if (this.match(TokenType.LBRACKET)) {
        this.advance();
        const property = this.parseExpression();
        this.expect(TokenType.RBRACKET);
        expr = {
          type: NodeType.MEMBER_EXPRESSION,
          object: expr,
          property,
          computed: true,
          line: expr.line,
          column: expr.column
        } as MemberExpression;
      } else if (this.match(TokenType.LPAREN)) {
        this.advance();
        const args: Expression[] = [];
        
        while (!this.match(TokenType.RPAREN)) {
          args.push(this.parseExpression());
          if (this.match(TokenType.COMMA)) {
            this.advance();
          }
        }
        
        this.expect(TokenType.RPAREN);
        expr = {
          type: NodeType.CALL_EXPRESSION,
          callee: expr,
          arguments: args,
          line: expr.line,
          column: expr.column
        } as CallExpression;
      } else {
        break;
      }
    }

    return expr;
  }

  private parsePrimary(): Expression {
    const token = this.peek();

    if (this.match(TokenType.NUMBER)) {
      this.advance();
      return {
        type: NodeType.NUMBER_LITERAL,
        value: parseFloat(token.value),
        line: token.line,
        column: token.column
      };
    }

    if (this.match(TokenType.STRING)) {
      this.advance();
      return {
        type: NodeType.STRING_LITERAL,
        value: token.value,
        line: token.line,
        column: token.column
      };
    }

    if (this.match(TokenType.BOOLEAN)) {
      this.advance();
      return {
        type: NodeType.BOOLEAN_LITERAL,
        value: token.value === 'true',
        line: token.line,
        column: token.column
      };
    }

    if (this.match(TokenType.NULL)) {
      this.advance();
      return {
        type: NodeType.NULL_LITERAL,
        line: token.line,
        column: token.column
      };
    }

    if (this.match(TokenType.THIS)) {
      this.advance();
      return {
        type: NodeType.THIS_EXPRESSION,
        line: token.line,
        column: token.column
      };
    }

    if (this.match(TokenType.NEW)) {
      this.advance();
      const callee = this.parsePrimary();
      this.expect(TokenType.LPAREN);
      
      const args: Expression[] = [];
      while (!this.match(TokenType.RPAREN)) {
        args.push(this.parseExpression());
        if (this.match(TokenType.COMMA)) {
          this.advance();
        }
      }
      
      this.expect(TokenType.RPAREN);
      return {
        type: NodeType.NEW_EXPRESSION,
        callee,
        arguments: args,
        line: token.line,
        column: token.column
      };
    }

    if (this.match(TokenType.IDENTIFIER)) {
      this.advance();
      return {
        type: NodeType.IDENTIFIER,
        name: token.value,
        line: token.line,
        column: token.column
      } as Identifier;
    }

    if (this.match(TokenType.LPAREN)) {
      this.advance();
      const expr = this.parseExpression();
      this.expect(TokenType.RPAREN);
      return expr;
    }

    throw new Error(`Unexpected token: ${token.type} at line ${token.line}:${token.column}`);
  }
}
