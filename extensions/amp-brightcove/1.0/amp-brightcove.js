import {BaseElement} from '#bento/components/bento-brightcove/1.0/base-element';
import {AmpVideoBaseElement} from '#bento/components/bento-video/1.0/video-base-element';

import {isExperimentOn} from '#experiments';

import {setSuperClass} from '#preact/amp-base-element';

import {Services} from '#service';

import {userAssert} from '#utils/log';

import {CSS} from '../../../build/amp-brightcove-1.0.css';
import {
  getConsentPolicyInfo,
  getConsentPolicySharedData,
  getConsentPolicyState,
} from '../../../src/consent';

/** @const {string} */
const TAG = 'amp-brightcove';

class AmpBrightcove extends setSuperClass(BaseElement, AmpVideoBaseElement) {
  /** @override  */
  static getPreconnects() {
    return ['https://players.brightcove.net'];
  }

  /** @override */
  init() {
    super.init();
    userAssert(
      this.element.getAttribute('data-account'),
      'The data-account attribute is required for <amp-brightcove> %s',
      this.element
    );

    const consentPolicy = this.getConsentPolicy();
    if (!consentPolicy) {
      return;
    }

    Promise.all([
      getConsentPolicyState(this.element, consentPolicy),
      getConsentPolicyInfo(this.element, consentPolicy),
      getConsentPolicySharedData(this.element, consentPolicy),
    ]).then((arr) => {
      const {0: consentState, 1: consentString, 2: consentSharedData} = arr;
      const urlParams = {
        ...this.getProp('urlParams'),
        'ampInitialConsentState': consentState,
        'ampInitialConsentValue': consentString,
        'ampConsentSharedData': JSON.stringify(consentSharedData),
      };
      this.mutateProps({'urlParams': urlParams});
    });
  }

  /** @override */
  isLayoutSupported(layout) {
    userAssert(
      isExperimentOn(this.win, 'bento') ||
        isExperimentOn(this.win, 'bento-brightcove'),
      'expected global "bento" or specific "bento-brightcove" experiment to be enabled'
    );
    return super.isLayoutSupported(layout);
  }
}

AMP.extension(TAG, '1.0', (AMP) => {
  AMP.registerElement(TAG, AmpBrightcove, CSS);
});

/**
 * @param {!Element} element
 * @return {string|undefined}
 */
function getReferrerFromElement(element) {
  return element.hasAttribute('data-referrer')
    ? Services.urlReplacementsForDoc(element).expandUrlSync(
        element.getAttribute('data-referrer')
      )
    : undefined;
}

AmpBrightcove['props'] = {
  ...BaseElement['props'],
  'referrer': {
    attrs: ['data-referrer'],
    parseAttrs: getReferrerFromElement,
  },
};
