export {};

declare global {
  // Primary export
  var compile: typeof import('./compile').compile;

  // Needed for worker-dom
  var self: Window & typeof globalThis;
  var Node: typeof window.Node;
}
