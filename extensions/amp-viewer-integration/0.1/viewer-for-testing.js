import {parseUrlDeprecated, serializeQueryString} from '../../../src/url';

const APP = '__AMPHTML__';

/**
 * @fileoverview This is a Viewer file that communicates with ampdocs. It is
 * used for testing of the ampdoc-viewer messaging protocol for the
 * amp-viewer-integration extension.
 */
export class ViewerForTesting {
  /**
   * @param {Element} containerEl
   * @param {string} id
   * @param {string} ampdocUrl
   * @param {boolean} visible
   */
  constructor(containerEl, id, ampdocUrl, visible) {
    /** @type {string} */
    this.ampdocUrl = ampdocUrl;

    /** @visibleForTesting @private {boolean} */
    this.hasDocumentLoaded_ = false;

    /** @private {string} */
    this.visibilityState_ = visible ? 'visible' : 'hidden';

    /** @type {Element} */
    this.containerEl = containerEl;

    /** @type {Element} */
    this.iframe = document.createElement('iframe');
    this.iframe.setAttribute('id', 'AMP_DOC_' + id);
    this.iframe.setAttribute('scrolling', 'yes');

    /** @private @const {!Promise} */
    this.handshakeReceivedPromise_ = new Promise((resolve) => {
      /** @private {?function()} */
      this.handshakeReceivedResolve_ = resolve;
    });

    /** @private @const {!Promise} */
    this.documentLoadedPromise_ = new Promise((resolve) => {
      /** @private {?function()} */
      this.documentLoadedResolve_ = resolve;
      this.hasDocumentLoaded_ = true;
    });
  }

  /**
   * I'm waiting for the ampdoc to request for us to shake hands.
   * @return {!Promise}
   */
  waitForHandshakeRequest() {
    const params = {
      history: 1,
      width: this.containerEl./*OK*/ offsetWidth,
      height: this.containerEl./*OK*/ offsetHeight,
      visibilityState: this.visibilityState_,
      prerenderSize: 1,
      origin: parseUrlDeprecated(window.location.href).origin,
      csi: 1,
      cap: 'foo,a2a,iframeScroll',
    };

    let ampdocUrl = this.ampdocUrl + '#' + serializeQueryString(params);

    if (window.location.hash && window.location.hash.length > 1) {
      ampdocUrl += '&' + window.location.hash.substring(1);
    }
    const parsedUrl = parseUrlDeprecated(ampdocUrl);
    const url = parsedUrl.href;
    this.iframe.setAttribute('src', url);
    this.frameOrigin_ = parsedUrl.origin;
    this.iframe.style.display = 'none';

    // Listening for messages, hoping that I get a request for a handshake and
    // a notification that a document was loaded.
    window.addEventListener(
      'message',
      (e) => {
        this.log('message received', e, e.data);
        const target = this.iframe.contentWindow;
        const targetOrigin = this.frameOrigin_;
        // IMPORTANT: There could be many windows with the same origin!
        // IMPORTANT: Event.source might not be available in all browsers!?
        if (
          e.origin != targetOrigin ||
          e.source != target ||
          e.data.app != APP
        ) {
          this.log('This message is not for us: ', e);
          return;
        }
        if (e.data.name == 'channelOpen' && this.handshakeReceivedResolve_) {
          // Send handshake confirmation.
          const message = {
            app: APP,
            requestid: e.data.requestid,
            data: {},
            type: 's',
          };
          target./*OK*/ postMessage(message, targetOrigin);

          this.log('handshake request received!');
          this.handshakeReceivedResolve_();
          this.handshakeReceivedResolve_ = null;
        }
        if (e.data.name == 'documentLoaded') {
          this.log('documentLoaded!');
          this.documentLoadedResolve_();
        }
      },
      false
    );

    this.containerEl.appendChild(this.iframe);

    return this.handshakeReceivedPromise_;
  }

  /**
   * Letting the ampdoc know that I received the handshake request and all is
   * well.
   */
  confirmHandshake() {
    this.iframe.contentWindow./*OK*/ postMessage(
      'amp-handshake-response',
      this.frameOrigin_
    );
  }

  /**
   * This is used in test-amp-viewer-integration to test the handshake and make
   * sure the test waits for everything to get executed.
   * @return {*} TODO(#23582): Specify return type
   */
  waitForDocumentLoaded() {
    return this.documentLoadedPromise_;
  }

  /**
   * This is only used for a unit test.
   * @return {*} TODO(#23582): Specify return type
   */
  hasCapability() {
    return false;
  }

  /**
   * This is only used for a unit test.
   */
  setMessageDeliverer() {}

  /**
   * Fake docs for testing
   */
  log() {
    const var_args = Array.prototype.slice.call(arguments, 0);
    var_args.unshift('[VIEWER]');
    console /*OK*/.log
      .apply(console, var_args);
  }
}
