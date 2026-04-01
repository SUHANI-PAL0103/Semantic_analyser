// Abstract Syntax Tree Node Types

export enum NodeType {
  // Program
  PROGRAM = "PROGRAM",
  
  // Declarations
  CLASS_DECLARATION = "CLASS_DECLARATION",
  FUNCTION_DECLARATION = "FUNCTION_DECLARATION",
  VARIABLE_DECLARATION = "VARIABLE_DECLARATION",
  
  // Statements
  EXPRESSION_STATEMENT = "EXPRESSION_STATEMENT",
  RETURN_STATEMENT = "RETURN_STATEMENT",
  IF_STATEMENT = "IF_STATEMENT",
  WHILE_STATEMENT = "WHILE_STATEMENT",
  FOR_STATEMENT = "FOR_STATEMENT",
  BLOCK_STATEMENT = "BLOCK_STATEMENT",

  // Expressions
  BINARY_EXPRESSION = "BINARY_EXPRESSION",
  UNARY_EXPRESSION = "UNARY_EXPRESSION",
  ASSIGNMENT_EXPRESSION = "ASSIGNMENT_EXPRESSION",
  CALL_EXPRESSION = "CALL_EXPRESSION",
  MEMBER_EXPRESSION = "MEMBER_EXPRESSION",
  NEW_EXPRESSION = "NEW_EXPRESSION",
  THIS_EXPRESSION = "THIS_EXPRESSION",
  
  // Literals
  IDENTIFIER = "IDENTIFIER",
  NUMBER_LITERAL = "NUMBER_LITERAL",
  STRING_LITERAL = "STRING_LITERAL",
  BOOLEAN_LITERAL = "BOOLEAN_LITERAL",
  NULL_LITERAL = "NULL_LITERAL",
}

export interface ASTNode {
  type: NodeType;
  line?: number;
  column?: number;
}

export interface Program extends ASTNode {
  type: NodeType.PROGRAM;
  body: Statement[];
}

// Declarations

export interface ClassDeclaration extends ASTNode {
  type: NodeType.CLASS_DECLARATION;
  name: string;
  constructor?: FunctionDeclaration;
  methods: FunctionDeclaration[];
  properties: VariableDeclaration[];
}

export interface FunctionDeclaration extends ASTNode {
  type: NodeType.FUNCTION_DECLARATION;
  name: string;
  parameters: Parameter[];
  body: BlockStatement;
  isConstructor?: boolean;
}

export interface Parameter {
  name: string;
  typeAnnotation?: string;
}

export interface VariableDeclaration extends ASTNode {
  type: NodeType.VARIABLE_DECLARATION;
  identifier: string;
  init?: Expression;
  kind: 'let' | 'const';
}

// Statements

export type Statement = 
  | ClassDeclaration
  | FunctionDeclaration
  | ExpressionStatement
  | ReturnStatement
  | IfStatement
  | WhileStatement
  | ForStatement
  | BlockStatement
  | VariableDeclaration;

export interface ExpressionStatement extends ASTNode {
  type: NodeType.EXPRESSION_STATEMENT;
  expression: Expression;
}

export interface ReturnStatement extends ASTNode {
  type: NodeType.RETURN_STATEMENT;
  argument: Expression | null;
}

export interface IfStatement extends ASTNode {
  type: NodeType.IF_STATEMENT;
  condition: Expression;
  consequent: Statement;
  alternate?: Statement;
}

export interface WhileStatement extends ASTNode {
  type: NodeType.WHILE_STATEMENT;
  condition: Expression;
  body: Statement;
}

export interface ForStatement extends ASTNode {
  type: NodeType.FOR_STATEMENT;
  init: VariableDeclaration | Expression | null;
  condition: Expression | null;
  update: Expression | null;
  body: Statement;
}

export interface BlockStatement extends ASTNode {
  type: NodeType.BLOCK_STATEMENT;
  body: Statement[];
}

// Expressions

export type Expression =
  | BinaryExpression
  | UnaryExpression
  | AssignmentExpression
  | CallExpression
  | MemberExpression
  | NewExpression
  | ThisExpression
  | Identifier
  | NumberLiteral
  | StringLiteral
  | BooleanLiteral
  | NullLiteral;

export interface BinaryExpression extends ASTNode {
  type: NodeType.BINARY_EXPRESSION;
  operator: string;
  left: Expression;
  right: Expression;
}

export interface UnaryExpression extends ASTNode {
  type: NodeType.UNARY_EXPRESSION;
  operator: string;
  argument: Expression;
}

export interface AssignmentExpression extends ASTNode {
  type: NodeType.ASSIGNMENT_EXPRESSION;
  operator: string;
  left: Expression;
  right: Expression;
}

export interface CallExpression extends ASTNode {
  type: NodeType.CALL_EXPRESSION;
  callee: Expression;
  arguments: Expression[];
}

export interface MemberExpression extends ASTNode {
  type: NodeType.MEMBER_EXPRESSION;
  object: Expression;
  property: Expression;
  computed: boolean; // true for a[b], false for a.b
}

export interface NewExpression extends ASTNode {
  type: NodeType.NEW_EXPRESSION;
  callee: Expression;
  arguments: Expression[];
}

export interface ThisExpression extends ASTNode {
  type: NodeType.THIS_EXPRESSION;
}

// Literals

export interface Identifier extends ASTNode {
  type: NodeType.IDENTIFIER;
  name: string;
}

export interface NumberLiteral extends ASTNode {
  type: NodeType.NUMBER_LITERAL;
  value: number;
}

export interface StringLiteral extends ASTNode {
  type: NodeType.STRING_LITERAL;
  value: string;
}

export interface BooleanLiteral extends ASTNode {
  type: NodeType.BOOLEAN_LITERAL;
  value: boolean;
}

export interface NullLiteral extends ASTNode {
  type: NodeType.NULL_LITERAL;
}
