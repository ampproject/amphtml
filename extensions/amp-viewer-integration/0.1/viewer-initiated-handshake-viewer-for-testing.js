import {parseUrlDeprecated, serializeQueryString} from '../../../src/url';

const APP = '__AMPHTML__';
/** @enum {string} */
const MessageType_Enum = {
  REQUEST: 'q',
  RESPONSE: 's',
};

/**
 * @fileoverview This is a Viewer file that communicates with ampdocs. It is
 * used for testing of the ampdoc-viewer messaging protocol for the
 * amp-viewer-integration extension.
 */
export class WebviewViewerForTesting {
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
    this.alreadyLoaded_ = false;

    /** @private {string} */
    this.visibilityState_ = visible ? 'visible' : 'hidden';

    /** @type {Element} */
    this.containerEl = containerEl;

    /** @type {Window} */
    this.win = window;

    /** @type {Element} */
    this.iframe = document.createElement('iframe');
    this.iframe.setAttribute('id', 'AMP_DOC_' + id);
    this.iframe.setAttribute('scrolling', 'yes');

    this.pollingIntervalIds_ = [];
    this.intervalCtr = 0;

    /** @private @const {!Promise} */
    this.handshakeReceivedPromise_ = new Promise((resolve) => {
      /** @private {?function()} */
      this.handshakeResponseResolve_ = resolve;
    });
  }

  /**
   * I'm waiting for the ampdoc to respond to my offer to shake hands.
   * @return {!Promise}
   */
  waitForHandshakeResponse() {
    const params = {
      history: 1,
      width: this.containerEl./*OK*/ offsetWidth,
      height: this.containerEl./*OK*/ offsetHeight,
      visibilityState: this.visibilityState_,
      origin: parseUrlDeprecated(window.location.href).origin,
      csi: 1,
      cap: 'foo,a2a,handshakepoll,iframeScroll',
    };

    let ampdocUrl = this.ampdocUrl + '#' + serializeQueryString(params);

    if (window.location.hash && window.location.hash.length > 1) {
      ampdocUrl += '&' + window.location.hash.substring(1);
    }
    const parsedUrl = parseUrlDeprecated(ampdocUrl);
    const url = parsedUrl.href;
    this.iframe.setAttribute('src', url);
    this.frameOrigin_ = parsedUrl.origin;

    this.pollingIntervalIds_[this.intervalCtr] = setInterval(
      this.pollAMPDoc_.bind(this, this.intervalCtr),
      1000
    );

    this.intervalCtr++;

    this.containerEl.appendChild(this.iframe);

    return this.handshakeReceivedPromise_;
  }

  /**
   * Fake docs for testing
   * @param {*} intervalCtr
   */
  pollAMPDoc_(intervalCtr) {
    this.log('pollAMPDoc_');
    if (!this.iframe) {
      return;
    }
    const listener = (e) => {
      if (this.isChannelOpen_(e)) {
        //stop polling
        window.clearInterval(this.pollingIntervalIds_[intervalCtr]);
        window.removeEventListener('message', listener, false);
        this.completeHandshake_(e.data.requestid);
      }
    };
    window.addEventListener('message', listener);

    const message = {
      app: APP,
      name: 'handshake-poll',
    };
    this.iframe.contentWindow./*OK*/ postMessage(message, this.frameOrigin_);
  }

  /**
   * Fake docs for testing
   * @param {*} e
   * @return {*} TODO(#23582): Specify return type
   */
  isChannelOpen_(e) {
    return (
      e.type == 'message' && e.data.app == APP && e.data.name == 'channelOpen'
    );
  }

  /**
   * Fake docs for testing
   * @param {*} requestId
   */
  completeHandshake_(requestId) {
    this.log('Viewer ' + this.id + ' messaging established!');
    const message = {
      app: APP,
      requestid: requestId,
      type: MessageType_Enum.RESPONSE,
    };

    this.log('############## viewer posting1 Message', message);

    this.iframe.contentWindow./*OK*/ postMessage(message, this.frameOrigin_);

    this.sendRequest_('visibilitychange', {
      state: this.visibilityState_,
    });

    this.handshakeResponseResolve_();
  }

  /**
   * Fake docs for testing
   * @param {*} eventType
   * @param {*} payload
   */
  sendRequest_(eventType, payload) {
    const requestId = ++this.requestIdCounter_;
    const message = {
      app: APP,
      requestid: requestId,
      rsvp: true,
      name: eventType,
      data: payload,
      type: MessageType_Enum.REQUEST,
    };
    this.iframe.contentWindow./*OK*/ postMessage(message, this.frameOrigin_);
  }

  /**
   * Fake docs for testing
   * @param {*} eventData
   * @return {*} TODO(#23582): Specify return type
   * @visibleForTesting
   */
  processRequest_(eventData) {
    const data = eventData;
    switch (data.name) {
      case 'documentLoaded':
      case 'requestFullOverlay':
      case 'cancelFullOverlay':
      case 'pushHistory':
      case 'popHistory':
      case 'broadcast':
      case 'setFlushParams':
      case 'prerenderComplete':
      case 'documentHeight':
      case 'tick':
      case 'sendCsi':
      case 'scroll':
      case 'a2aNavigate':
      case 'unloaded':
      case 'visibilitychange':
        return;
      default:
        return Promise.reject('request not supported: ' + data.name);
    }
  }

  /**
   * Fake docs for testing
   */
  log() {
    const var_args = Array.prototype.slice.call(arguments, 0);
    console /*OK*/.log
      .apply(console, var_args);
  }
}
