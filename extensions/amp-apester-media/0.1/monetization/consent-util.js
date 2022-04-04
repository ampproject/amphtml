import {CONSENT_POLICY_STATE} from '#core/constants/consent-state';

import {dev} from '#utils/log';

import {
  getConsentPolicyInfo,
  getConsentPolicyState,
} from '../../../../src/consent';

const TAG = 'amp-apester-media';

const AWAIT_TIME_OUT_FOR_RESPONSE = 3000;

const awaitPromiseTimeout = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([CONSENT_POLICY_STATE.UNKNOWN, undefined]);
    }, AWAIT_TIME_OUT_FOR_RESPONSE);
  });
};
/**
 * @param {AmpElement} apesterElement
 * @return {Promise<!JsonObject>}
 * */
export function getConsentData(apesterElement) {
  const consentStatePromise = getConsentPolicyState(apesterElement).catch(
    (err) => {
      dev().error(TAG, 'Error determining consent state', err);
      return CONSENT_POLICY_STATE.UNKNOWN;
    }
  );
  const consentStringPromise = getConsentPolicyInfo(
    apesterElement,
    'default'
  ).catch((err) => {
    dev().error(TAG, 'Error determining consent string', err);
    return undefined;
  });
  const consentDataPromise = Promise.all([
    consentStatePromise,
    consentStringPromise,
  ]);
  return Promise.race([consentDataPromise, awaitPromiseTimeout()]).then(
    (consentDataResponse) => {
      const consentStatus = consentDataResponse[0];
      const gdprString = consentDataResponse[1];
      switch (consentStatus) {
        case CONSENT_POLICY_STATE.SUFFICIENT:
          return {'gdpr': 1, 'user_consent': 1, 'gdprString': gdprString};
        case CONSENT_POLICY_STATE.INSUFFICIENT:
        case CONSENT_POLICY_STATE.UNKNOWN:
          return {'gdpr': 1, 'user_consent': 0, 'gdprString': gdprString};
        case CONSENT_POLICY_STATE.UNKNOWN_NOT_REQUIRED:
        default:
          return {};
      }
    }
  );
}
