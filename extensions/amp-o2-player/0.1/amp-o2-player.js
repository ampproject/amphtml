import {MessageType_Enum} from '#core/3p-frame-messaging';
import {CONSENT_POLICY_STATE} from '#core/constants/consent-state';
import {applyFillContent, isLayoutSizeDefined} from '#core/dom/layout';
import {PauseHelper} from '#core/dom/video/pause-helper';

import {Services} from '#service';

import {userAssert} from '#utils/log';

import {
  getConsentPolicyInfo,
  getConsentPolicyState,
} from '../../../src/consent';
import {listenFor} from '../../../src/iframe-helper';
import {setIsMediaComponent} from '../../../src/video-interface';

class AmpO2Player extends AMP.BaseElement {
  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {?HTMLIFrameElement} */
    this.iframe_ = null;

    /** @private {string} */
    this.pid_ = '';

    /** @private {string} */
    this.bcid_ = '';

    /** @private {string} */
    this.domain_ = '';

    /** @private {string} */
    this.src_ = '';

    /** @private @const */
    this.pauseHelper_ = new PauseHelper(this.element);
  }

  /**
   * @param {boolean=} onLayout
   * @override
   */
  preconnectCallback(onLayout) {
    Services.preconnectFor(this.win).url(
      this.getAmpDoc(),
      this.domain_,
      onLayout
    );
  }

  /** @override */
  isLayoutSupported(layout) {
    return isLayoutSizeDefined(layout);
  }

  /** @override */
  buildCallback() {
    setIsMediaComponent(this.element);

    this.pid_ = userAssert(
      this.element.getAttribute('data-pid'),
      'data-pid attribute is required for <amp-o2-player> %s',
      this.element
    );

    this.bcid_ = userAssert(
      this.element.getAttribute('data-bcid'),
      'data-bcid attribute is required for <amp-o2-player> %s',
      this.element
    );

    const bid = this.element.getAttribute('data-bid');
    const vid = this.element.getAttribute('data-vid');
    const macros = this.element.getAttribute('data-macros');
    const env = this.element.getAttribute('data-env');

    this.domain_ =
      'https://delivery.' + (env != 'stage' ? '' : 'dev.') + 'vidible.tv';
    let src = `${this.domain_}/htmlembed/`;
    const queryParams = [];
    src +=
      'pid=' +
      encodeURIComponent(this.pid_) +
      '/' +
      encodeURIComponent(this.bcid_) +
      '.html';
    if (bid) {
      queryParams.push('bid=' + encodeURIComponent(bid));
    }
    if (vid) {
      queryParams.push('vid=' + encodeURIComponent(vid));
    }
    if (macros) {
      queryParams.push(macros);
    }
    if (queryParams.length > 0) {
      src += '?' + queryParams.join('&');
    }
    this.src_ = src;
  }

  /** @override */
  layoutCallback() {
    userAssert(
      this.pid_,
      'data-pid attribute is required for <amp-o2-player> %s',
      this.element
    );
    userAssert(
      this.bcid_,
      'data-bcid attribute is required for <amp-o2-player> %s',
      this.element
    );

    const iframe = this.element.ownerDocument.createElement('iframe');
    iframe.setAttribute('frameborder', '0');
    iframe.setAttribute('allowfullscreen', 'true');
    iframe.src = this.src_;
    this.iframe_ = /** @type {HTMLIFrameElement} */ (iframe);
    applyFillContent(iframe);

    listenFor(
      iframe,
      MessageType_Enum.SEND_CONSENT_DATA,
      (data, source, origin) => {
        this.sendConsentData_(source, origin);
      }
    );

    this.pauseHelper_.updatePlaying(true);

    this.element.appendChild(iframe);
    return this.loadPromise(iframe);
  }

  /** @override */
  unlayoutCallback() {
    const iframe = this.iframe_;
    if (iframe) {
      this.element.removeChild(iframe);
      this.iframe_ = null;
    }
    this.pauseHelper_.updatePlaying(false);
    return true;
  }

  /**
   * Requests consent data from consent module
   * and forwards information to iframe
   * @param {Window} source
   * @param {string} origin
   * @private
   */
  sendConsentData_(source, origin) {
    const consentPolicyId = super.getConsentPolicy() || 'default';
    const consentStringPromise = this.getConsentString_(consentPolicyId);
    const consentPolicyStatePromise =
      this.getConsentPolicyState_(consentPolicyId);

    Promise.all([consentPolicyStatePromise, consentStringPromise]).then(
      (consents) => {
        let consentData;
        switch (consents[0]) {
          case CONSENT_POLICY_STATE.SUFFICIENT:
            consentData = {
              'gdprApplies': true,
              'user_consent': 1,
              'gdprString': consents[1],
            };
            break;
          case CONSENT_POLICY_STATE.INSUFFICIENT:
          case CONSENT_POLICY_STATE.UNKNOWN:
            consentData = {
              'gdprApplies': true,
              'user_consent': 0,
              'gdprString': consents[1],
            };
            break;
          case CONSENT_POLICY_STATE.UNKNOWN_NOT_REQUIRED:
          default:
            consentData = {
              'gdprApplies': false,
            };
        }

        this.sendConsentDataToIframe_(source, origin, {
          'sentinel': 'amp',
          'type': MessageType_Enum.CONSENT_DATA,
          'consentData': consentData,
        });
      }
    );
  }

  /**
   * Send consent data to iframe
   * @param {Window} source
   * @param {string} origin
   * @param {JsonObject} data
   * @private
   */
  sendConsentDataToIframe_(source, origin, data) {
    source./*OK*/ postMessage(data, origin);
  }

  /**
   * Get the consent string
   * @param {string} consentPolicyId
   * @private
   * @return {Promise}
   */
  getConsentString_(consentPolicyId = 'default') {
    return getConsentPolicyInfo(this.element, consentPolicyId);
  }

  /**
   * Get the consent policy state
   * @param {string} consentPolicyId
   * @private
   * @return {Promise}
   */
  getConsentPolicyState_(consentPolicyId = 'default') {
    return getConsentPolicyState(this.element, consentPolicyId);
  }

  /** @override */
  pauseCallback() {
    if (this.iframe_ && this.iframe_.contentWindow) {
      this.iframe_.contentWindow./*OK*/ postMessage(
        JSON.stringify({
          'method': 'pause',
          'value': this.domain_,
        }),
        '*'
      );
    }
  }
}

AMP.extension('amp-o2-player', '0.1', (AMP) => {
  AMP.registerElement('amp-o2-player', AmpO2Player);
});
