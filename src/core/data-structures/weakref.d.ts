export {};

declare global {
interface Window {
  WeakRef?: typeof WeakRef;
}
}
