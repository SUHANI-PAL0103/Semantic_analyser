// Simple Counter Contract

class Counter {
  constructor() {
    this.count = 0;
  }

  increment() {
    this.count = this.count + 1;
  }

  decrement() {
    this.count = this.count - 1;
  }

  getCount() {
    return this.count;
  }

  reset() {
    this.count = 0;
  }
}
