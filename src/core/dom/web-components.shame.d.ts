export {};

declare global {
  interface Element {
    createShadowRoot: () => ShadowRoot;
  }
}
