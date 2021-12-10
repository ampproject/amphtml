import {dict} from '#core/types/object';

import {isExperimentOn} from '#experiments';

import {userAssert} from '#utils/log';

import {BaseElement} from './base-element';

import {
  getConsentMetadata,
  getConsentPolicyInfo,
  getConsentPolicyState,
} from '../../../src/consent';

/** @const {string} */
const TAG = 'amp-jwplayer';

/** @implements {../../../src/video-interface.VideoInterface} */
class AmpJwplayer extends BaseElement {
  /** @override */
  init() {
    const consentPolicy = this.getConsentPolicy();
    if (consentPolicy) {
      this.getConsentInfo().then((consentInfo) => {
        const policyState = consentInfo[0];
        const policyInfo = consentInfo[1];
        const policyMetadata = consentInfo[2];
        this.mutateProps(
          dict({
            'consentParams': {
              'policyState': policyState,
              'policyInfo': policyInfo,
              'policyMetadata': policyMetadata,
            },
          })
        );
      });
    }

    return super.init();
  }

  /**
   * @param {string} policy
   * @return {Promise}
   */
  getConsentInfo(policy) {
    return Promise.all([
      getConsentPolicyState(this.element, policy),
      getConsentPolicyInfo(this.element, policy),
      getConsentMetadata(this.element, policy),
    ]);
  }

  /** @override */
  isLayoutSupported(layout) {
    userAssert(
      isExperimentOn(this.win, 'bento') ||
        isExperimentOn(this.win, 'bento-jwplayer'),
      'expected global "bento" or specific "bento-jwplayer" experiment to be enabled'
    );
    return super.isLayoutSupported(layout);
  }
}

AMP.extension(TAG, '1.0', (AMP) => {
  AMP.registerElement(TAG, AmpJwplayer);
});
