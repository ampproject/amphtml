export {};

declare global {
  // This type signifies a callback that can be called to remove a listener.
  type UnlistenCallback = () => void;
}
