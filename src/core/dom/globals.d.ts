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
    adoptedStyleSheets: CSSStyleSheet[];
  }

  interface CSSStyleSheet {
    replaceSync: (text: string) => void;
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
