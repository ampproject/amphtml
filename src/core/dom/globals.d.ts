export {};

declare global {
  interface HTMLElement {
    // Used by modal.js to keep track of the saved tab on an element.
    __AMP_MODAL_SAVED_TAB_INDEX?: string | null;

    // Used by extensions/amp-form/0.1 and src/core/form.js.
    // TODO(wg-performance): move to extensions/amp-form, as it is the only consumer.
    __AMP_FORM: AmpForm;

    nonce?: string;

    mozMatchesSelector?: (s: string) => boolean;
    msMatchesSelector?: (s: string) => boolean;
    oMatchesSelector?: (s: string) => boolean;
  }

  interface Element {
    createShadowRoot: () => ShadowRoot;
  }

  interface Event {
    // We assign an `Object` at times, though Typescript's dom lib supports
    // string or null, so here we allow all three (plus unedfined).
    data?: Object | string | null;
  }

  interface AmpForm {}

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
