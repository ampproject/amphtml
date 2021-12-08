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
    webkitRequestFullscreen;
    webkitExitFullscreen;
    webkitEnterFullscreen;
    webkitCancelFullScreen;
    webkitDisplayingFullscreen;
    mozRequestFullScreen;
    mozCancelFullScreen;
    msRequestFullscreen;
    msExitFullscreen;
  }

  interface Document {
    cancelFullScreen;
    webkitCancelFullScreen;
    webkitExitFullscreen;
    webkitFullscreenElement;
    webkitCurrentFullScreenElement;
    msExitFullscreen;
    mozFullScreenElement;
    mozCancelFullScreen;
  }
}
