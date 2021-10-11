export interface AsyncInput {
  // Called to get the asynchronous value of an AsyncInput field.
  getValue: () => Promise<string>;
}
