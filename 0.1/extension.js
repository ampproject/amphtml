import {BrowserState} from './engagement-tracking';

/**
 * Handles communication between the AMP ad and the extension iframe
 */
export class ExtensionCommunication {
  /** @private {?ExtensionCommunication} */
  static instance_ = null;

  /** @type {Object<string, function()>} */
  adUnitHandlerMap_ = {};

  /** @type {Array<object>} */
  queue_ = [];

  // constructor() {}

  /**
   * Returns the singleton instance of ExtensionCommunication.
   * @param {string} adUnitId
   * @param {function()} handler message handler
   * @return {!ExtensionCommunication}
   * @public
   */
  static start(adUnitId, handler = {}) {
    if (!ExtensionCommunication.instance_) {
      ExtensionCommunication.instance_ = new ExtensionCommunication();
    }

    ExtensionCommunication.instance_.adUnitHandlerMap_[adUnitId] = handler;

    return ExtensionCommunication.instance_;
  }

  /**
   * Create Extension Communication Channel
   */
  initExtensionCommunication_() {
    if (!this.listener) {
      !this.listenerAttacher &&
        (this.listenerAttacher = setInterval(
          () => this.initExtensionCommunication_(),
          2000
        ));
      this.listener = window.frames['TG-listener'];
    }
    if (this.listener) {
      this.listener.addEventListener('message', this.handlerExtensionMessages_);
      // this.listener./*OK*/ postMessage('extensionReady', '*');
      while (this.queue_.length !== 0) {
        this.listener./*OK*/ postMessage(this.queue_.shift(), '*');
      }
      if (this.listenerAttacher) {
        clearInterval(this.listenerAttacher);
      }
    }
  }

  /**
   * Send message back to adUnit handler
   * @param {object} message - The message to send
   * @private
   */
  handlerExtensionMessages_(message) {
    this.adUnitHandlerMap_[message.data.adUnitId] &&
      this.adUnitHandlerMap_[message.data.adUnitId](message);
  }

  /**
   * Send a message to the extension iframe
   * @param {string} type - The message type
   * @param {object} data - The message data
   * @private
   */
  sendIframeMessage_(type, data) {
    const msg = {
      type,
      data,
    };

    this.queue_.push(msg);
    this.initExtensionCommunication_();
  }

  /**
   * Cleanup event listeners and intervals
   */
  destroy() {
    if (this.listener) {
      this.listener.removeEventListener(
        'message',
        this.handlerExtensionMessages_
      );
    }

    if (this.listenerAttacher) {
      clearInterval(this.listenerAttacher);
      this.listenerAttacher = null;
    }

    this.listener = null;
    this.queue = [];
  }

  /**
   *  Setup the extension communication channel
   *  @param {{
   *    applicationId: number,
   *    country: string,
   *    section: number,
   *    sessionId: string,
   *    ivm: boolean,
   *    state: BrowserState
   *  }} params
   */
  setup(params) {
    const conf = {
      sessionId: params.sessionId,
      appId: params.applicationId,
      section: params.section,
      // eslint-disable-next-line local/camelcase
      g_country: params.country,
      ivm: params.ivm,
    };

    // Send configuration
    this.sendIframeMessage_('cfg', conf);
    // Send browser current status
    this.engagementStatus(params.state);
  }

  /**
   * Send a message when an ad unit is added
   * @param {string} unitId
   * */
  adUnitRemoved(unitId) {
    this.sendIframeMessage_('adUnitRemoved', {id: unitId});
  }

  /**
   * Send a message when a banner is changed.
   * @param {{
   *   unitId: (string),
   *   shortId: (string),
   *   impressionId: (string),
   *   provider: (string),
   *   width: number,
   *   height: number
   * }} params
   */
  bannerChanged(params) {
    const msg = {
      id: params.unitId,
      shortId: params.shortId,
      creative: null,
      order: null,
      orderLine: null,
      impressionId: params.impressionId,
      market: params.provider || '',
      creativeWidth: params.width,
      creativeHeight: params.height,
    };
    this.sendIframeMessage_('bannerChanged', msg);
  }

  /**
   * Send a message when an ad unit is created.
   * @param {{
   *   unitId: (string),
   *   shortId: (string),
   *   sizes: (!Array<!Array<number>>),
   *   rotation: (string|boolean),
   *   visible: (boolean),
   *   width: (number),
   *   height: (number),
   * }} params
   */
  adUnitCreated(params) {
    const msg = {
      id: params.unitId,
      shortId: params.shortId,
      sizes: params.sizes,
      configuration: null,
      customTargeting: null,
      rotation: params.rotation,
      isFirstPrint: false,
      isTracking: false,
      visible: params.visible,
      width: params.width,
      height: params.height,
    };
    this.sendIframeMessage_('adUnitChanged', msg);
  }

  /**
   *  Send a message to change the banner
   *  @param {BrowserState} state
   */
  engagementStatus(state) {
    this.sendIframeMessage('engagementStatusChanged', {
      index: state,
      name: BrowserState[state],
    });
  }
}
