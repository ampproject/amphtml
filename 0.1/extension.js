import {BrowserState} from './engagement-tracking';

/**
 * Handles communication between the AMP ad and the extension iframe
 */
export class ExtensionCommunication {
  /** @private {?ExtensionCommunication} */
  static instance_ = null;

  adUnitHandlerMap = {};

  queue = [];

  // constructor() {}

  /**
   * Returns the singleton instance of ExtensionCommunication.
   * @param {string} adUnitCode
   * @param {function()} handler message handler
   * @return {!ExtensionCommunication}
   * @public
   */
  static start(adUnitCode, handler = {}) {
    if (!ExtensionCommunication.instance_) {
      ExtensionCommunication.instance_ = new ExtensionCommunication();
    }

    ExtensionCommunication.instance_.adUnitHandlerMap[adUnitCode] = handler;

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
      this.listener.addEventListener('message', this.handler);
      // this.listener./*OK*/ postMessage('extensionReady', '*');
      while (this.queue.length !== 0) {
        this.listener./*OK*/ postMessage(this.queue.shift(), '*');
      }
      if (this.listenerAttacher) {
        clearInterval(this.listenerAttacher);
      }
    }
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

    this.queue.push(msg);
    this.initExtensionCommunication_();
  }

  /**
   * Cleanup event listeners and intervals
   */
  destroy() {
    if (this.listener) {
      this.listener.removeEventListener('message', this.handler);
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
   * @param {number} applicationId - The application ID
   * @param {string} country - The country code
   * @param {number} section - The section ID
   * @param {string} sessionId - The session ID
   * @param {boolean} ivm - IntelliSense Viewability Mode
   * @param {BrowserState} state - The current browser state
   *
   * */
  setup(applicationId, country, section, sessionId, ivm, state) {
    const conf = {
      sessionId,
      appId: applicationId,
      section,
      // eslint-disable-next-line local/camelcase
      g_country: country,
      ivm,
    };

    // Send configuration
    this.sendIframeMessage_('cfg', conf);
    // Send browser current status
    this.engagementStatus(state);
  }

  /**
   * Send a message when an ad unit is added
   * @param {AdUnit} adUnit
   * */
  adUnitRemoved(adUnit) {
    this.sendIframeMessage_('adUnitRemoved', {id: adUnit.id});
  }

  /**
   * Send a message when a banner is changed
   * @param {AdUnit} adUnit
   * */
  bannerChanged(adUnit) {
    // const entry = adUnit.getCurrentEntry();
    // if (!entry) {
    //   return;
    // }
    // this.sendIframeMessage_('bannerChanged', {
    //   id: adUnit.id,
    //   index: entry.index,
    //   creative: entry.iatCId,
    //   order: entry.iatOid,
    //   orderLine: entry.iatOlId,
    //   impressionId: entry.iid,
    //   market: entry.m || ' ',
    //   creativeWidth: entry.iatCw,
    //   creativeHeight: entry.iatCh,
    //   rotation: adUnit.doNotRotate ? 'Disabled' : 'Enabled',
    //   dfpMapping: this.getGamMapping(adUnit),
    // });
  }

  /**
   *  Send a message when an ad unit is updated
   *  @param {AdUnit} adUnit
   */
  adUnitChanged(adUnit) {
    this.sendIframeMessage_('adUnitChanged', {
      id: adUnit.id,
      shortId: adUnit.adUnitId,
      sizes: adUnit.sizes,
      instance: adUnit.id.split('.')[1],
      configuration: adUnit.config,
      customTargeting: adUnit.ct,
      rotation: adUnit.doNotRotate ? 'Disabled' : 'Enabled',
      isFirstPrint: adUnit.isFirstPrint,
      isTracking: adUnit.isTrackingUnit,
      visible: adUnit.isInView(),
      width: adUnit.position.width,
      height: adUnit.position.height,
      dfpMapping: this.getGamMapping(adUnit),
    });
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

  /**
   *  Get mapping
   *  @param {AdUnit} adUnit
   * @return {object|undefined} - Returns the GAM mapping if available, otherwise undefined
   */
  getGamMapping(adUnit) {
    if (!adUnit.gamMapping) {
      return undefined;
    }

    return {
      creativeWidth: adUnit.gamMapping.cw,
      creativeHeight: adUnit.gamMapping.ch,
      slot: adUnit.currentEntryIndex,
      impDur: adUnit.gamMapping.impDur,
      dnr: adUnit.gamMapping.dnr,
      dnrReason: adUnit.gamMapping.dnrReason,
    };
  }
}
