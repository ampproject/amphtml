/**
 * @fileoverview Externs for possible fullscreen properties browsers may attach
 * to Elements.
 * @externs
 */
export {};

declare global {
  interface Element {
    requestFullScreen;
    exitFullscreen;
    cancelFullScreen;
    webkitExitFullscreen;
    webkitEnterFullscreen;
    webkitCancelFullScreen;
    webkitDisplayingFullscreen;
    mozCancelFullScreen;
    msExitFullscreen;
  }

  interface Document {
    cancelFullScreen;
    webkitExitFullscreen;
  }
}
