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
