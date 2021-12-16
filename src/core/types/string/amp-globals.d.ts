export {};

declare global {
  interface Location {
    // Set by a viewer when it removes the fragment.
    originalHash?: string;
  }
}
