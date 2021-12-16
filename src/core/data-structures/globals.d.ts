import './amp-globals.d';

declare global {
  interface Window {
    WeakRef?: typeof WeakRef;
  }
}
