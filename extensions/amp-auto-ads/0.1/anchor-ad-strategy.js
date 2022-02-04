import {createElementWithAttributes} from '#core/dom';

import {Services} from '#service';

import {user} from '#utils/log';

const TAG = 'amp-auto-ads';
const STICKY_AD_TAG = 'amp-sticky-ad';
const OPT_IN_STATUS_ANCHOR_ADS = 2;

export class AnchorAdStrategy {
  /**
   * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
   * @param {!JsonObject<string, string>} baseAttributes Any attributes that
   *     should be added to any inserted ads.
   * @param {!JsonObject} configObj
   */
  constructor(ampdoc, baseAttributes, configObj) {
    /** @const {!../../../src/service/ampdoc-impl.AmpDoc} */
    this.ampdoc = ampdoc;

    /** @const @private {!JsonObject<string, string>} */
    this.baseAttributes_ = baseAttributes;

    /** @const @private {!JsonObject} */
    this.configObj_ = configObj;
  }

  /**
   * @return {!Promise<boolean>} Resolves when the strategy is complete.
   */
  run() {
    if (this.hasExistingStickyAd_()) {
      user().warn(
        TAG,
        'Auto ads may not work because of already existing <amp-sticky-ad>.'
      );
      return Promise.resolve(false);
    }

    if (!this.isAnchorAdEnabled_()) {
      return Promise.resolve(false);
    }

    if (this.baseAttributes_.sticky === 'top') {
      Services.extensionsFor(this.ampdoc.win)./*OK*/ installExtensionForDoc(
        this.ampdoc,
        'amp-ad',
        '0.1'
      );
      this.placeAmpAdStickyAd_();
    } else {
      // TODO(powerivq@) once <amp-ad sticky=bottom> is stabilized, move this to use amp-ad sticky.
      Services.extensionsFor(this.ampdoc.win)./*OK*/ installExtensionForDoc(
        this.ampdoc,
        STICKY_AD_TAG,
        '1.0'
      );
      this.placeStickyAd_();
    }
    return Promise.resolve(true);
  }

  /**
   * @return {boolean}
   * @private
   */
  hasExistingStickyAd_() {
    return !!this.ampdoc
      .getRootNode()
      .querySelector('amp-sticky-ad, amp-ad[sticky]');
  }

  /**
   * @return {boolean}
   * @private
   */
  isAnchorAdEnabled_() {
    return user()
      .assertArray(this.configObj_['optInStatus'] || [])
      .includes(OPT_IN_STATUS_ANCHOR_ADS);
  }

  /**
   * @private
   */
  placeAmpAdStickyAd_() {
    const viewportWidth = Services.viewportForDoc(this.ampdoc).getWidth();
    const attributes = /** @type {!JsonObject} */ ({
      ...this.baseAttributes_,
      'width': String(viewportWidth),
      'height': this.baseAttributes_.height || '100',
    });
    const doc = this.ampdoc.win.document;
    const ampAd = createElementWithAttributes(doc, 'amp-ad', attributes);
    const body = this.ampdoc.getBody();
    body.insertBefore(ampAd, body.firstChild);
  }

  /**
   * @private
   */
  placeStickyAd_() {
    const baseAttributes = this.baseAttributes_;
    const viewportWidth = Services.viewportForDoc(this.ampdoc).getWidth();
    const attributes = /** @type {!JsonObject} */ ({
      ...baseAttributes,
      'width': String(viewportWidth),
      'height': baseAttributes.height || '100',
    });
    delete attributes.sticky; // To ensure that no sticky attribute will be wrapped inside an amp-sticky-ad element.
    const doc = this.ampdoc.win.document;
    const ampAd = createElementWithAttributes(doc, 'amp-ad', attributes);
    const stickyAd = createElementWithAttributes(doc, 'amp-sticky-ad', {
      'layout': 'nodisplay',
    });
    stickyAd.appendChild(ampAd);
    const body = this.ampdoc.getBody();
    body.insertBefore(stickyAd, body.firstChild);
  }
}
