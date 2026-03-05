export class Lazy<T> {
  declare private initializer_: () => T;
  declare private value_: T | undefined;

  constructor(initializer: () => T) {
    this.initializer_ = initializer;
  }

  public value(): T {
    if (this.value_ == undefined) {
      this.value_ = this.initializer_();
    }
    return this.value_;
  }
}
