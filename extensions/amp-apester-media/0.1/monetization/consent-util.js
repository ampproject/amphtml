import {dict} from '#core/types/object';
import {
  getConsentPolicyInfo,
  getConsentPolicyState,
} from '../../../../src/consent';

import {dev} from '#utils/log';

import {ConsentPolicyState_Enum} from '#core/constants/consent-state';

const TAG = 'amp-apester-media';

const AWAIT_TIME_OUT_FOR_RESPONSE = 3000;

const awaitPromiseTimeout = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([ConsentPolicyState_Enum.UNKNOWN, undefined]);
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
      return ConsentPolicyState_Enum.UNKNOWN;
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
        case ConsentPolicyState_Enum.SUFFICIENT:
          return dict({'gdpr': 1, 'user_consent': 1, 'gdprString': gdprString});
        case ConsentPolicyState_Enum.INSUFFICIENT:
        case ConsentPolicyState_Enum.UNKNOWN:
          return dict({'gdpr': 1, 'user_consent': 0, 'gdprString': gdprString});
        case ConsentPolicyState_Enum.UNKNOWN_NOT_REQUIRED:
        default:
          return {};
      }
    }
  );
}
