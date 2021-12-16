export {};

declare global {
  interface Error {
    messageArray?: any[];
  }
}
