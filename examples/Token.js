// Simple Token Smart Contract Example
// This will be compiled to Solidity

class Token {
  constructor() {
    this.totalSupply = 1000000;
    this.name = "MyToken";
    this.symbol = "MTK";
  }

  transfer(to, amount) {
    this.balances = this.balances - amount;
    return true;
  }

  getBalance(account) {
    return this.balances;
  }

  mint(amount) {
    this.totalSupply = this.totalSupply + amount;
  }
}
