export {};

declare global {
  interface Error {
    messageArray?: Array<any>;
  }
}
