/**
 * Vendors who have IAB viewability certification may use iframe transport
 * (see ../amp-analytics.md and ../integrating-analytics.md). In this case,
 * put only the specification of the iframe location in the object below.
 *
 * This object is separated from vendors.js to be shared with extensions
 * other than amp-analytics, for instance amp-ad-exit.
 *
 * @const {!Object}
 */
const prodConfig = {
  'bg': 'https://tpc.googlesyndication.com/b4a/b4a-runner.html',
  'moat': 'https://z.moatads.com/ampanalytics093284/iframe.html',
};
/**
 * Canary config override
 *
 * @const {!Object}
 */
const canaryConfig = {
  ...prodConfig,
  'bg': 'https://tpc.googlesyndication.com/b4a/experimental/b4a-runner.html',
};

export const IFRAME_TRANSPORTS = /** @type {!JsonObject} */ (prodConfig);
export const IFRAME_TRANSPORTS_CANARY = /** @type {!JsonObject} */ (
  canaryConfig
);
