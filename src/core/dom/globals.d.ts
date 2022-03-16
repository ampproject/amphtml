import './amp-globals.d';

declare global {
  interface Window {
    CSSStyleSheet: typeof CSSStyleSheet;
  }

  interface HTMLElement {
    nonce?: string;

    mozMatchesSelector?: (s: string) => boolean;
    msMatchesSelector?: (s: string) => boolean;
    oMatchesSelector?: (s: string) => boolean;
  }

  interface Element {
    createShadowRoot: () => ShadowRoot;
  }

  interface ShadowRoot {
    adoptedStyleSheets?: CSSStyleSheet[];
  }

  interface CSSStyleSheet {
    replaceSync?: (text: string) => void;
  }

  interface Event {
    // We assign an `Object` at times, though Typescript's dom lib supports
    // string or null, so here we allow all three (plus unedfined).
    data?: Object | string | null;
  }

  // Fullscreen proprties
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
    cancelFullScreen: any;
    webkitCancelFullScreen: any;
    webkitExitFullscreen: any;
    webkitFullscreenElement: any;
    webkitCurrentFullScreenElement: any;
    msExitFullscreen: any;
    mozFullScreenElement: any;
    mozCancelFullScreen: any;
  }
}
