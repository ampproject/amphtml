import {BaseElement} from '#bento/components/bento-social-share/1.0/base-element';
import {getSocialConfig} from '#bento/components/bento-social-share/1.0/social-share-config';

import {getDataParamsFromAttributes} from '#core/dom';
import {Layout_Enum} from '#core/dom/layout';
import {toggle} from '#core/dom/style';
import {parseQueryString} from '#core/types/string/url';
import {getWin} from '#core/window';

import {isExperimentOn} from '#experiments';

import {AmpPreactBaseElement, setSuperClass} from '#preact/amp-base-element';

import {Services} from '#service';

import {userAssert} from '#utils/log';

import {CSS} from '../../../build/amp-social-share-1.0.css';
import {addParamsToUrl} from '../../../src/url';

/** @const {string} */
const TAG = 'amp-social-share';

/** @const {!JsonObject<string, string>} */
const DEFAULT_RESPONSIVE_DIMENSIONS = {
  'width': '100%',
  'height': '100%',
};

/**
 * @private
 * @param {!Element} element
 * @return {!JsonObject|undefined}
 */
const getTypeConfigOrUndefined = (element) => {
  const viewer = Services.viewerForDoc(element);
  const platform = Services.platformFor(getWin(element));
  const type = userAssert(
    element.getAttribute('type'),
    'The type attribute is required. %s',
    element
  );
  if (type === 'system') {
    // navigator.share unavailable
    if (!systemShareSupported(viewer, platform)) {
      return;
    }
  } else {
    // system share wants to be unique
    const systemOnly =
      systemShareSupported(viewer, platform) &&
      !!window.document.querySelector(
        'amp-social-share[type=system][data-mode=replace]'
      );
    if (systemOnly) {
      return;
    }
  }
  return /** @type {!JsonObject} */ (getSocialConfig(type)) || {};
};

/**
 * @private
 * @param {!../../../src/service/viewer-interface.ViewerInterface} viewer
 * @param {!../../../src/service/platform-impl.Platform} platform
 * @return {boolean}
 */
const systemShareSupported = (viewer, platform) => {
  // Chrome exports navigator.share in WebView but does not implement it.
  // See https://bugs.chromium.org/p/chromium/issues/detail?id=765923
  const isChromeWebview = viewer.isWebviewEmbedded() && platform.isChrome();

  return 'share' in navigator && !isChromeWebview;
};

/**
 * @private
 * @param {!Element} element
 * @param {!Array<MutationRecord>} mutations
 * @param {string} prevTypeValue
 * @return {!JsonObject|undefined}
 */
const updateTypeConfig = (element, mutations, prevTypeValue) => {
  let typeUpdated;
  let mutatedEligibleAttribute;

  // Check all mutations since we want to catch any 'data-param-*' attributes
  mutations.forEach((mutation) => {
    if (
      mutation.attributeName === 'type' ||
      mutation.attributeName === 'data-target' ||
      mutation.attributeName === 'data-share-endpoint' ||
      (mutation.attributeName && mutation.attributeName.includes('data-param-'))
    ) {
      mutatedEligibleAttribute = true;
      typeUpdated = typeUpdated || mutation.attributeName === 'type';
    }
  });

  // If no matching attribute changes exit and do nothing
  if (!mutatedEligibleAttribute) {
    return;
  }

  // If 'type' attribute was changed, remove the class of the old 'type'
  if (typeUpdated) {
    element.classList.remove(`amp-social-share-${prevTypeValue}`);
  }

  const typeConfig = getTypeConfigOrUndefined(element);
  if (!typeConfig) {
    toggle(element, false);
    return;
  }
  element.classList.add(`amp-social-share-${element.getAttribute('type')}`);
  return typeConfig;
};

class AmpSocialShare extends setSuperClass(BaseElement, AmpPreactBaseElement) {
  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {?string} */
    this.ampSocialShareType_ = null;
  }

  /** @override */
  init() {
    const typeConfig = getTypeConfigOrUndefined(this.element);
    // Hide/ignore component if typeConfig is undefined
    if (!typeConfig) {
      toggle(this.element, false);
      return;
    }
    this.ampSocialShareType_ = this.element.getAttribute('type');
    this.element.classList.add(`amp-social-share-${this.ampSocialShareType_}`);

    this.renderWithHrefAndTarget_(typeConfig);
    if (this.element.getAttribute('layout') === Layout_Enum.RESPONSIVE) {
      return DEFAULT_RESPONSIVE_DIMENSIONS;
    }
  }

  /** @override */
  mutationObserverCallback(mutations) {
    const typeConfig = updateTypeConfig(
      this.element,
      mutations,
      this.ampSocialShareType_
    );
    if (typeConfig) {
      this.ampSocialShareType_ = this.element.getAttribute('type');
      this.renderWithHrefAndTarget_(typeConfig);
    }
  }

  /** @override */
  isLayoutSupported() {
    userAssert(
      isExperimentOn(this.win, 'bento') ||
        isExperimentOn(this.win, 'bento-social-share'),
      'expected global "bento" or specific "bento-social-share" experiment to be enabled'
    );
    return true;
  }

  /**
   * Resolves 'href' and 'target' from data-param attributes using AMP URL services.
   * Then triggers render on the Component with updated props.
   * @private
   * @param {!JsonObject} typeConfig
   */
  renderWithHrefAndTarget_(typeConfig) {
    const customEndpoint = this.element.getAttribute('data-share-endpoint');
    const shareEndpoint = customEndpoint || typeConfig['shareEndpoint'] || '';
    const urlParams = typeConfig['defaultParams'] || {};
    Object.assign(urlParams, getDataParamsFromAttributes(this.element));
    const hrefWithVars = addParamsToUrl(shareEndpoint, urlParams);
    const urlReplacements = Services.urlReplacementsForDoc(this.element);
    const bindingVars = /** @type {?Array<string>} */ (typeConfig['bindings']);
    const bindings = {};
    if (bindingVars) {
      bindingVars.forEach((name) => {
        const bindingName = name.toUpperCase();
        bindings[bindingName] = urlParams[name];
      });
    }
    urlReplacements
      .expandUrlAsync(hrefWithVars, bindings)
      .then((expandedUrl) => {
        const {search} = Services.urlForDoc(this.element).parse(expandedUrl);
        const target = this.element.getAttribute('data-target') || '_blank';

        if (customEndpoint) {
          this.mutateProps({
            'endpoint': expandedUrl,
            'params': null,
            'target': target,
          });
        } else {
          this.mutateProps({
            'endpoint': null,
            'params': parseQueryString(search),
            'target': target,
          });
        }
      });
  }
}

AMP.extension(TAG, '1.0', (AMP) => {
  AMP.registerElement(TAG, AmpSocialShare, CSS);
});
