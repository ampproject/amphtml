export {};

declare global {
  interface Event {
    // We assign an `Object` at times, though Typescript's dom lib supports
    // string or null, so here we allow all three (plus unedfined).
    data?: Object | string | null;
  }
}
