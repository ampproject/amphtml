export class Lazy<T> {
  private declare initializer_: () => T;
  private declare value_: T | undefined;

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
