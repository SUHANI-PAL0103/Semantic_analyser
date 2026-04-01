// Simple Bank Contract

class SimpleBank {
  constructor() {
    this.owner = true;
    this.totalDeposits = 0;
  }

  deposit(amount) {
    this.totalDeposits = this.totalDeposits + amount;
  }

  withdraw(amount) {
    if (this.totalDeposits >= amount) {
      this.totalDeposits = this.totalDeposits - amount;
      return true;
    }
    return false;
  }

  getBalance() {
    return this.totalDeposits;
  }
}
