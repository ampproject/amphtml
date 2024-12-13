import {CONSENT_POLICY_STATE} from '#core/constants/consent-state';
import {isJsonScriptTag, removeElement} from '#core/dom';
import {Layout_Enum} from '#core/dom/layout';
import {
  childElementsByAttr,
  childElementsByTag,
  elementByTag,
} from '#core/dom/query';
import {parseJson, tryParseJson} from '#core/types/object/json';

import {isExperimentOn} from '#experiments';

import {Services} from '#service';

import {dev, user, userAssert} from '#utils/log';

import {assertConfig} from './config';
import {NextPageService} from './next-page-service';

import {CSS} from '../../../build/amp-next-page-0.1.css';
import {
  UrlReplacementPolicy_Enum,
  batchFetchJsonFor,
} from '../../../src/batched-json';
import {getConsentPolicyState} from '../../../src/consent';
import {fetchDocument} from '../../../src/document-fetcher';
import {getServicePromiseForDoc} from '../../../src/service-helpers';

const TAG = 'amp-next-page';

const SERVICE_ID = 'next-page';

const ADSENSE_BASE_URL = 'https://googleads.g.doubleclick.net/pagead/ads';

export class AmpNextPage extends AMP.BaseElement {
  /** @override */
  isLayoutSupported(layout) {
    return layout == Layout_Enum.CONTAINER;
  }

  /** @override */
  buildCallback() {
    userAssert(
      isExperimentOn(this.win, 'amp-next-page'),
      'Experiment amp-next-page disabled'
    );

    const separatorElements = childElementsByAttr(this.element, 'separator');
    userAssert(
      separatorElements.length <= 1,
      '%s should contain at most one <div separator> child',
      TAG
    );

    let separator = null;
    if (separatorElements.length === 1) {
      separator = separatorElements[0];
      removeElement(separator);
    }

    return nextPageServiceForDoc(this.getAmpDoc()).then((service) => {
      if (service.isActive()) {
        return;
      }

      const {element} = this;
      element.classList.add('i-amphtml-next-page');

      // Warning for validation conflicts between 1.0 and 0.1
      const prohibitedAttribute = element.hasAttribute('deep-parsing')
        ? 'deep-parsing'
        : element.hasAttribute('xssi-prefix')
          ? 'xssi-prefix'
          : element.hasAttribute('max-pages')
            ? 'max-pages'
            : null;
      if (prohibitedAttribute) {
        this.unsupportedFeatureWarn_(prohibitedAttribute);
      }

      const src = element.getAttribute('src');
      let configPromise;
      let pagesPromise = Promise.resolve([]);

      const type = element.getAttribute('type');
      if (type) {
        userAssert(type === 'adsense', `${TAG} only supports type=adsense`);
        const client = element.getAttribute('data-client');
        const slot = element.getAttribute('data-slot');

        userAssert(
          /^ca-pub-\d+$/.test(client),
          `${TAG} AdSense client should be of the format 'ca-pub-123456'`
        );
        userAssert(
          /^\d+$/.test(slot),
          `${TAG} AdSense slot should be a number`
        );

        const consentPolicyId = this.getConsentPolicy();
        const consent = consentPolicyId
          ? getConsentPolicyState(element, consentPolicyId).catch((err) => {
              user().error(TAG, 'Error determining consent state', err);
              return CONSENT_POLICY_STATE.UNKNOWN;
            })
          : Promise.resolve(CONSENT_POLICY_STATE.SUFFICIENT);

        pagesPromise = consent
          .then((state) =>
            this.fetchAdSensePages_(
              client,
              slot,
              state === CONSENT_POLICY_STATE.SUFFICIENT ||
                state === CONSENT_POLICY_STATE.UNKNOWN_NOT_REQUIRED
            )
          )
          .catch((error) => {
            user().warn(
              TAG,
              'error fetching recommendations from AdSense',
              error
            );
            // Resolve this promise with an empty array anyway so we can use
            // the inline/src config as a fallback.
            return [];
          });
      }

      const inlineConfig = this.getInlineConfig_();

      if (src) {
        configPromise = this.fetchConfig_().catch((error) =>
          user().error(TAG, 'error fetching config', error)
        );
      } else {
        configPromise = Promise.resolve(inlineConfig);
      }

      if (inlineConfig && (src || type)) {
        this.unsupportedFeatureWarn_('mixing configuration types');
      }

      userAssert(
        inlineConfig || src || type,
        '%s should contain a <script> child, a URL specified in [src], or a ' +
          '[type]',
        TAG
      );

      return Promise.all([configPromise, pagesPromise]).then((values) => {
        const config = values[0] || {};
        const pages = values[1] || [];
        config.pages = pages.concat(config.pages || []);
        this.register_(service, config, separator);
      });
    });
  }

  /**
   * Reads the inline config from the element.
   * @return {?*} Config JSON object, or null if no inline config specified.
   * @private
   */
  getInlineConfig_() {
    const scriptElements = childElementsByTag(this.element, 'SCRIPT');
    if (!scriptElements.length) {
      return null;
    }
    userAssert(
      scriptElements.length === 1,
      `${TAG} should contain at most one <script> child`
    );
    const scriptElement = scriptElements[0];
    userAssert(
      isJsonScriptTag(scriptElement),
      `${TAG} config should ` +
        'be inside a <script> tag with type="application/json"'
    );
    return tryParseJson(scriptElement.textContent, (error) => {
      user().error(TAG, 'failed to parse config', error);
    });
  }

  /**
   * Fetches content recommendations from AdSense and returns a list of {@link
   * AmpNextPageItem}.
   * @param {string} client AdSense publisher code.
   * @param {string} slot AdSense Matched Content ad slotname.
   * @param {boolean} personalized {@code true} if the request should be
   *     personalized (with cookies).
   * @return {!Promise<Array<./config.AmpNextPageItem>>} List of recommended
   *     pages.
   * @private
   */
  fetchAdSensePages_(client, slot, personalized) {
    const adUrl =
      `${ADSENSE_BASE_URL}?client=${client}&slotname=${slot}` +
      `&url=${encodeURIComponent(this.getAmpDoc().getUrl())}` +
      '&ecr=1&crui=title&is_amp=3&output=xml';
    return fetchDocument(this.win, adUrl, {
      credentials: personalized ? 'include' : 'omit',
    }).then((doc) => {
      const urlService = Services.urlForDoc(dev().assertElement(this.element));
      const {origin} = urlService.parse(this.getAmpDoc().getUrl());

      const recs = [];
      const ads = doc.getElementsByTagName('AD');
      for (let i = 0; i < ads.length; i++) {
        const ad = ads[i];
        const titleEl = elementByTag(ad, 'LINE1');
        const mediaEl = elementByTag(ad, 'MEDIA_TEMPLATE_DATA');

        const visibleUrl = ad.getAttribute('visible_url');
        const url = ad.getAttribute('url');
        const title = extractAdSenseTextContent(titleEl);
        const image = extractAdSenseImageUrl(mediaEl);

        const isValidOrigin = urlService.parse(visibleUrl).origin === origin;
        if (isValidOrigin && url && title && image) {
          recs.push({
            title,
            image,
            ampUrl: url,
          });
        }
      }
      return recs;
    });
  }

  /**
   * Verifies the specified config as a valid {@code NextPageConfig} and
   * registers the {@link NextPageService} for this document.
   * @param {!NextPageService} service Service to register with.
   * @param {*} configJson Config JSON object.
   * @param {?Element} separator Optional custom separator element.
   * @private
   */
  register_(service, configJson, separator) {
    const {element} = this;
    const config = assertConfig(element, configJson, this.getAmpDoc().getUrl());
    service.register(element, config, separator);
    service.setAppendPageHandler((element) => this.appendPage_(element));
  }

  /**
   * Appends the element too page
   * @param {!Element} element
   * @return {!Promise}
   */
  appendPage_(element) {
    return this.mutateElement(() => this.element.appendChild(element));
  }

  /**
   * Fetches the element config from the URL specified in [src].
   * @private
   * @return {*} TODO(#23582): Specify return type
   */
  fetchConfig_() {
    const ampdoc = this.getAmpDoc();
    const policy = UrlReplacementPolicy_Enum.ALL;
    return batchFetchJsonFor(ampdoc, this.element, {urlReplacement: policy});
  }

  /**
   * @param {string} feature unsupported feature
   * @private
   */
  unsupportedFeatureWarn_(feature) {
    user().warn(
      TAG,
      `${feature} is a feature of ${TAG} 1.0, please update your version to use it`
    );
  }
}

/**
 * @param {!Element|!../../../src/service/ampdoc-impl.AmpDoc} elementOrAmpDoc
 * @return {!Promise<!NextPageService>}
 */
function nextPageServiceForDoc(elementOrAmpDoc) {
  return /** @type {!Promise<!NextPageService>} */ (
    getServicePromiseForDoc(elementOrAmpDoc, SERVICE_ID)
  );
}

/**
 * Extracts the core_image_url string from the JSON text content of the
 * MEDIA_TEMPLATE_DATA tag.
 * @param {Element} el The element containing the media JSON text.
 * @return {string} The image URL, or empty string if it could not be
 *     extracted.
 */
function extractAdSenseImageUrl(el) {
  try {
    // Media payload is a JSON string terminated with a semicolon. Remove it
    // before parsing.
    const media = parseJson(el.textContent.trim().slice(0, -1))[0];
    return media['core_image_url'];
  } catch (e) {
    return '';
  }
}

/**
 * Returns the text content of an element, with leading/trailing whitespace
 * trimmed.
 * @param {Element} el
 * @return {*} TODO(#23582): Specify return type
 */
function extractAdSenseTextContent(el) {
  const content = (el && el.textContent) || '';
  return content.trim();
}

AMP.extension(TAG, '0.1', (AMP) => {
  const service = new NextPageService();
  AMP.registerServiceForDoc(SERVICE_ID, function () {
    return service;
  });
  AMP.registerElement(TAG, AmpNextPage, CSS);
});
