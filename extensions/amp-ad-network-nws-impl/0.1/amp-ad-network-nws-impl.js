import {removeElement} from '#core/dom';
import {parseJson} from '#core/types/object/json';

import {dev, devAssert} from '#utils/log';

import {insertAnalyticsElement} from '../../../src/extension-analytics';
import {AmpA4A} from '../../amp-a4a/0.1/amp-a4a';

const URL = 'https://svr.nws.ai/a4a';

const NWS_HEADER = 'X-NWS';

/**
 *  Fast Fetch implementation for Newsroom AI
 */
export class AmpAdNetworkNwsImpl extends AmpA4A {
  /**
   * @param {!Element} element
   */
  constructor(element) {
    super(element);

    /**
     * Config to generate amp-analytics element for active view reporting.
     * @type {?JsonObject}
     * @private
     */
    this.ampAnalyticsConfig_ = null;

    /** @private {?Element} */
    this.ampAnalyticsElement_ = null;
  }

  /**
   * Extracts configuration used to build amp-analytics element for active view
   * and begin to render.
   *
   * @param {!Headers} responseHeaders
   *   XHR service FetchResponseHeaders object containing the response
   *   headers.
   * @return {?JsonObject} config or null if invalid/missing.
   */
  extractAmpAnalyticsConfig(responseHeaders) {
    if (!responseHeaders.has(NWS_HEADER)) {
      return null;
    }
    try {
      const responseConfig = parseJson(responseHeaders.get(NWS_HEADER));
      const analyticsConfig = responseConfig['ampAnalytics'];
      const config = {
        'transport': {'beacon': true, 'xhrpost': true, 'image': true},
        'requests': {},
        'triggers': {},
      };
      Object.assign(config, analyticsConfig);

      return config;
    } catch (err) {
      dev().error(
        'AMP-A4A',
        'Invalid analytics',
        err,
        responseHeaders.get(NWS_HEADER)
      );
    }
  }

  /** @override */
  getAdUrl(unusedConsentState, opt_rtcResponsesPromise) {
    const dataSlot = this.element.getAttribute('data-slot');
    const url = `${URL}?slot=${encodeURIComponent(dataSlot)}`;
    return url;
  }

  /** @override */
  extractSize(responseHeaders) {
    this.ampAnalyticsConfig_ = this.extractAmpAnalyticsConfig(responseHeaders);
    const size = super.extractSize(responseHeaders);
    return size;
  }

  /** @override */
  tearDownSlot() {
    super.tearDownSlot();
    if (this.ampAnalyticsElement_) {
      removeElement(this.ampAnalyticsElement_);
      this.ampAnalyticsElement_ = null;
    }
    this.ampAnalyticsConfig_ = null;
  }

  /** @override */
  onCreativeRender(creativeMetaData, opt_onLoadPromise) {
    super.onCreativeRender(creativeMetaData);
    devAssert(!this.ampAnalyticsElement_);
    if (this.ampAnalyticsConfig_) {
      this.ampAnalyticsElement_ = insertAnalyticsElement(
        this.element,
        this.ampAnalyticsConfig_,
        /*loadAnalytics*/ true,
        false
      );
    }
  }
}

AMP.extension('amp-ad-network-nws-impl', '0.1', (AMP) => {
  AMP.registerElement('amp-ad-network-nws-impl', AmpAdNetworkNwsImpl);
});
