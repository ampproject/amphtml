import {Services} from '#service';

/**
 * Returns a promise that resolve when all consent state the policy wait
 * for resolve. Or if consent service is not available.
 * @param {!Element|!ShadowRoot} element
 * @param {string=} policyId
 * @return {!Promise<import('#core/constants/consent-state').CONSENT_POLICY_STATE|null>}
 */
export function getConsentPolicyState(element, policyId = 'default') {
  return Services.consentPolicyServiceForDocOrNull(element).then(
    (consentPolicy) => {
      if (!consentPolicy) {
        return null;
      }
      return consentPolicy.whenPolicyResolved(/** @type {string} */ (policyId));
    }
  );
}

/**
 * Returns a promise that resolves to a sharedData retrieved from consent
 * remote endpoint.
 * @param {!Element|!ShadowRoot} element
 * @param {string} policyId
 * @return {!Promise<?Object>}
 */
export function getConsentPolicySharedData(element, policyId) {
  return Services.consentPolicyServiceForDocOrNull(element).then(
    (consentPolicy) => {
      if (!consentPolicy) {
        return null;
      }
      return consentPolicy.getMergedSharedData(
        /** @type {string} */ (policyId)
      );
    }
  );
}

/**
 * @param {!Element|!ShadowRoot} element
 * @param {string=} policyId
 * @return {!Promise<string>}
 */
export function getConsentPolicyInfo(element, policyId = 'default') {
  // Return the stored consent string.
  return Services.consentPolicyServiceForDocOrNull(element).then(
    (consentPolicy) => {
      if (!consentPolicy) {
        return null;
      }
      return consentPolicy.getConsentStringInfo(
        /** @type {string} */ (policyId)
      );
    }
  );
}

/**
 * @param {!Element|!ShadowRoot} element
 * @param {string=} policyId
 * @return {!Promise<?Object|undefined>}
 */
export function getConsentMetadata(element, policyId = 'default') {
  // Return the stored consent metadata.
  return Services.consentPolicyServiceForDocOrNull(element).then(
    (consentPolicy) => {
      if (!consentPolicy) {
        return null;
      }
      return consentPolicy.getConsentMetadataInfo(
        /** @type {string} */ (policyId)
      );
    }
  );
}

/**
 * Returns a set of consent values to forward to a 3rd party (like an iframe).
 * @param {!Element} element
 * @param {?string=} opt_policyId
 * @return {!Promise<!JsonObject>}
 *   See extensions/amp-consent/customizing-extension-behaviors-on-consent.md:
 *    - consentMetadata
 *    - consentString
 *    - consentPolicyState
 *    - consentPolicySharedData
 */
export function getConsentDataToForward(element, opt_policyId) {
  return Services.consentPolicyServiceForDocOrNull(element).then((policy) => {
    const gettersOrNull = {
      'consentMetadata': policy && policy.getConsentMetadataInfo,
      'consentString': policy && policy.getConsentStringInfo,
      'consentPolicyState': policy && policy.whenPolicyResolved,
      'consentPolicySharedData': policy && policy.getMergedSharedData,
    };
    if (!policy) {
      return gettersOrNull;
    }
    return /** @type {!JsonObject} */ (
      Promise.all(
        Object.keys(gettersOrNull).map((key) =>
          gettersOrNull[key]
            .call(policy, opt_policyId || 'default')
            .then((value) => ({[key]: value}))
        )
      ).then((objs) => Object.assign.apply({}, objs))
    );
  });
}

/**
 * Determine if an element needs to be blocked by consent based on meta tags.
 * @param {*} element
 * @return {boolean}
 */
export function shouldBlockOnConsentByMeta(element) {
  const ampdoc = element.getAmpDoc();
  let content = ampdoc.getMetaByName('amp-consent-blocking');
  if (!content) {
    return false;
  }

  // Handles whitespace
  content = content.toUpperCase().replace(/\s+/g, '');

  const contents = /** @type {Array<string>} */ (content.split(','));
  return contents.includes(element.tagName);
}
