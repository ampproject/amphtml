export {};

declare global {
  interface Window {
    // These observers exists globally, but TS doesn't know they are available
    // through the `Window` object (which we may rely on for polyfilling).
    IntersectionObserver: typeof IntersectionObserver;
    MutationObserver: typeof MutationObserver;
    ResizeObserver: typeof ResizeObserver;
  }
}
