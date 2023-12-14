/**
 * Determine if `attribution-reporting` API is available in browser.
 * @param {!Document} doc
 * @return {boolean}
 */
export function isAttributionReportingAvailable(doc) {
  return doc.featurePolicy?.features().includes('attribution-reporting');
}

/**
 * Determine if `attribution-reporting` API is allowed in current context.
 * @param {!Document} doc
 * @return {boolean}
 */
export function isAttributionReportingAllowed(doc) {
  return doc.featurePolicy?.allowedFeatures().includes('attribution-reporting');
}

/**
 * Indicates the status of the `attribution-reporting` API.
 * @enum
 */
export const AttributionReportingStatus = {
  ATTRIBUTION_DATA_UNSPECIFIED: 0,
  ATTRIBUTION_MACRO_PRESENT: 4,
  ATTRIBUTION_DATA_PRESENT: 5,
  ATTRIBUTION_DATA_PRESENT_AND_POLICY_ENABLED: 6,
};
