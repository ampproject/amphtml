export class Lazy<T> {
  #value: T | undefined;
  #initializer: () => T;

  constructor(initializer: () => T) {
    this.#initializer = initializer;
  }

  public get value(): T {
    if (!this.#value) {
      this.#value = this.#initializer();
    }
    return this.#value;
  }
}
