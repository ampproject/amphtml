/**
 * @fileoverview Externs for possible fullscreen properties browsers may attach
 * to Elements.
 * @externs
 */
export {};

declare global {
  interface Element {
    requestFullScreen: any;
    exitFullscreen: any;
    cancelFullScreen: any;
    webkitRequestFullscreen: any;
    webkitExitFullscreen: any;
    webkitEnterFullscreen: any;
    webkitCancelFullScreen: any;
    webkitDisplayingFullscreen: any;
    mozRequestFullScreen: any;
    mozCancelFullScreen: any;
    msRequestFullscreen: any;
    msExitFullscreen: any;
  }

  interface Document {
    cancelFullScreen:any;
    webkitCancelFullScreen:any;
    webkitExitFullscreen:any;
    webkitFullscreenElement:any;
    webkitCurrentFullScreenElement:any;
    msExitFullscreen:any;
    mozFullScreenElement:any;
    mozCancelFullScreen:any;
  }
}
