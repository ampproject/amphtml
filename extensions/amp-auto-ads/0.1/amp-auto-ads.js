import {isExperimentOn} from '#experiments';

import {Services} from '#service';

import {userAssert} from '#utils/log';

import {getAdNetworkConfig} from './ad-network-config';
import {AdStrategy} from './ad-strategy';
import {
  AdTracker,
  getAdConstraintsFromConfigObj,
  getExistingAds,
} from './ad-tracker';
import {AnchorAdStrategy} from './anchor-ad-strategy';
import {Attributes, getAttributesFromConfigObj} from './attributes';
import {getPlacementsFromConfigObj} from './placement';

/** @const */
const TAG = 'amp-auto-ads';

/** @const */
const AD_TAG = 'amp-ad';

export class AmpAutoAds extends AMP.BaseElement {
  /** @override */
  buildCallback() {
    const type = this.element.getAttribute('type');
    userAssert(type, 'Missing type attribute');

    /** @private {?./ad-network-config.AdNetworkConfigDef} */
    this.adNetwork_ = getAdNetworkConfig(type, this.element);
    userAssert(this.adNetwork_, 'No AdNetworkConfig for type: ' + type);

    if (!this.adNetwork_.isEnabled(this.win)) {
      return;
    }

    const ampdoc = this.getAmpDoc();
    Services.extensionsFor(this.win)./*OK*/ installExtensionForDoc(
      ampdoc,
      AD_TAG
    );

    /** @private {!Promise<!JsonObject>} */
    this.configPromise_ = this.getAmpDoc()
      .whenFirstVisible()
      .then(() => {
        return this.adNetwork_.filterConfig(
          this.getConfig_(this.adNetwork_.getConfigUrl())
        );
      });

    if (!this.isAutoAdsLayoutCallbackExperimentOn_()) {
      this.placeAds_();
    }
  }

  /** @override */
  isLayoutSupported() {
    return true;
  }

  /** @override */
  layoutCallback() {
    if (this.isAutoAdsLayoutCallbackExperimentOn_()) {
      return this.placeAds_();
    }
    return Promise.resolve();
  }

  /**
   * Tries to load an auto-ads configuration from the given URL. This uses a
   * non-credentialed request.
   * @param {string} configUrl
   * @return {!Promise<!JsonObject>}
   * @private
   */
  getConfig_(configUrl) {
    // Non-credentialed request
    const xhrInit = {
      mode: 'cors',
      method: 'GET',
      credentials: 'omit',
    };
    return Services.xhrFor(this.win)
      .fetchJson(configUrl, xhrInit)
      .then((res) => res.json())
      .catch((reason) => {
        this.user().error(TAG, 'amp-auto-ads config xhr failed: ' + reason);
        return null;
      });
  }

  /**
   * @return {boolean}
   * @private
   */
  isAutoAdsLayoutCallbackExperimentOn_() {
    return isExperimentOn(this.win, 'auto-ads-layout-callback');
  }

  /**
   * @return {!Promise}
   * @private
   */
  placeAds_() {
    const ampdoc = this.getAmpDoc();
    return this.configPromise_.then((configObj) => {
      if (!configObj) {
        return;
      }
      const noConfigReason = configObj['noConfigReason'];
      if (noConfigReason) {
        this.user().warn(TAG, noConfigReason);
      }

      const placements = getPlacementsFromConfigObj(ampdoc, configObj);
      const attributes = /** @type {!JsonObject} */ ({
        ...this.adNetwork_.getAttributes(),
        ...getAttributesFromConfigObj(configObj, Attributes.BASE_ATTRIBUTES),
      });
      const sizing = this.adNetwork_.getSizing();
      const adConstraints =
        getAdConstraintsFromConfigObj(ampdoc, configObj) ||
        this.adNetwork_.getDefaultAdConstraints();
      const adTracker = new AdTracker(getExistingAds(ampdoc), adConstraints);
      new AdStrategy(
        placements,
        attributes,
        sizing,
        adTracker,
        this.adNetwork_.isResponsiveEnabled()
      ).run();
      const stickyAdAttributes = /** @type {!JsonObject} */ ({
        ...attributes,
        ...getAttributesFromConfigObj(
          configObj,
          Attributes.STICKY_AD_ATTRIBUTES
        ),
      });
      new AnchorAdStrategy(ampdoc, stickyAdAttributes, configObj).run();
    });
  }
}

AMP.extension(TAG, '0.1', (AMP) => {
  AMP.registerElement(TAG, AmpAutoAds);
});
