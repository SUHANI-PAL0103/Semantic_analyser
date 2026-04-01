import { Compiler } from "../src/_advanced/Compiler";

describe("Compiler", () => {
  test("compiles simple class", () => {
    const code = `
      class Counter {
        constructor() {
          this.count = 0;
        }
        
        increment() {
          this.count = this.count + 1;
        }
      }
    `;

    const compiler = new Compiler();
    const result = compiler.compile(code);

    expect(result.success).toBe(true);
    expect(result.solidityCode).toContain("contract Counter");
    expect(result.solidityCode).toContain("constructor()");
    expect(result.solidityCode).toContain("function increment()");
  });

  test("detects undefined variables", () => {
    const code = `
      class Test {
        doSomething() {
          let x = undefinedVar;
        }
      }
    `;

    const compiler = new Compiler();
    const result = compiler.compile(code);

    expect(result.success).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.errors[0].message).toContain("Undefined");
  });

  test("handles type inference", () => {
    const code = `
      class Calculator {
        add(a, b) {
          let result = a + b;
          return result;
        }
      }
    `;

    const compiler = new Compiler();
    const result = compiler.compile(code);

    expect(result.success).toBe(true);
    expect(result.solidityCode).toContain("uint256 result");
  });

  test("generates proper Solidity structure", () => {
    const code = `
      class Token {
        constructor() {
          this.totalSupply = 1000;
        }
      }
    `;

    const compiler = new Compiler();
    const result = compiler.compile(code);

    expect(result.success).toBe(true);
    expect(result.solidityCode).toContain("// SPDX-License-Identifier: MIT");
    expect(result.solidityCode).toContain("pragma solidity");
    expect(result.solidityCode).toContain("contract Token");
    expect(result.solidityCode).toContain("uint256 public totalSupply");
  });

  test("warns on uninitialized const", () => {
    const code = `
      class Test {
        doSomething() {
          const x;
        }
      }
    `;

    const compiler = new Compiler();
    const result = compiler.compile(code);

    expect(result.warnings.length).toBeGreaterThan(0);
  });
});
