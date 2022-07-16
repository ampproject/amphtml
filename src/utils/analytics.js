import {Services} from '#service';

/**
 * Helper method to trigger analytics event if amp-analytics is available.
 * TODO: Do not expose this function
 * @param {!Element} target
 * @param {string} eventType
 * @param {!JsonObject} vars A map of vars and their values.
 * @param {boolean} enableDataVars A boolean to indicate if data-vars-*
 * attribute value from target element should be included.
 */
export function triggerAnalyticsEvent(
  target,
  eventType,
  vars = {},
  enableDataVars = true
) {
  Services.analyticsForDocOrNull(target).then((analytics) => {
    if (!analytics) {
      return;
    }
    analytics.triggerEventForTarget(target, eventType, vars, enableDataVars);
  });
}
