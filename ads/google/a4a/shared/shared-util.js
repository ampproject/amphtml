/**
 * @fileoverview Functions that are shared with Google tag code.
 * This file must not depend on any AMP-specific libraries, e.g. log. If
 * there is a need to pass any things for logging/reporting - the values
 * must be returned from exported functions.
 */

/**
 * Validates parameters that publisher specified on the ad tag via
 * data-max-ad-content-rating.
 * @param {string|undefined} contentRating
 * @return {boolean}
 */
export function validateAdContentRating(contentRating) {
  // Verify that content rating is a valid rating
  return contentRating === 'e' || contentRating === 'pg' || contentRating === 't' || contentRating === 'ma';
  }
