
import {createElementWithAttributes} from '#core/dom';
import {dict} from '#core/types/object';

import {Services} from '#service';

import {user} from '../../../src/log';

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

    Services.extensionsFor(this.ampdoc.win)./*OK*/ installExtensionForDoc(
      this.ampdoc,
      STICKY_AD_TAG,
      '1.0'
    );
    this.placeStickyAd_();
    return Promise.resolve(true);
  }

  /**
   * @return {boolean}
   * @private
   */
  hasExistingStickyAd_() {
    return !!this.ampdoc.getRootNode().querySelector('AMP-STICKY-AD');
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
  placeStickyAd_() {
    const baseAttributes = this.baseAttributes_;
    const viewportWidth = Services.viewportForDoc(this.ampdoc).getWidth();
    const attributes = /** @type {!JsonObject} */ (
      Object.assign(
        dict(),
        baseAttributes,
        dict({
          'width': String(viewportWidth),
          'height': baseAttributes.height || '100',
        })
      )
    );
    const doc = this.ampdoc.win.document;
    const ampAd = createElementWithAttributes(doc, 'amp-ad', attributes);
    const stickyAd = createElementWithAttributes(
      doc,
      'amp-sticky-ad',
      dict({
        'layout': 'nodisplay',
      })
    );
    stickyAd.appendChild(ampAd);
    const body = this.ampdoc.getBody();
    body.insertBefore(stickyAd, body.firstChild);
  }
}
