import {pure} from '#core/types/pure';

/**
 * Allows for runtime configuration. Internally, the runtime should import this
 * module for various constants. We can use the AMP_CONFIG global to translate
 * user-defined configurations to this module.
 * @param {string} key
 * @return {any}
 */
const env = (key) => (self.AMP_CONFIG ? self.AMP_CONFIG[key] : null);

// Important: Make sure that every exported symbol has the same name as in
// `global.AMP.config.urls` (see runtime.js for reference)

// Important: Make sure to wrap every exported symbol with `pure()`. This allows
// this module to be dead-code-eliminated.

/* Note that cdnProxyRegex is only ever checked against origins
 * (proto://host[:port]) so does not need to consider path
 */
export const cdnProxyRegex = pure(
  (typeof env('cdnProxyRegex') == 'string'
    ? new RegExp(env('cdnProxyRegex'))
    : env('cdnProxyRegex')) ||
    /^https:\/\/([a-zA-Z0-9_-]+\.)?cdn\.ampproject\.org$/
);

/**
 * Check for a custom URL definition in special <meta> tags. Note that this does
 * not allow for distinct custom URLs in AmpDocShadow instances. The shell is
 * allowed to define one set of custom URLs via AMP_CONFIG (recommended) or by
 * including <meta> tags in the shell <head>. Those custom URLs then apply to
 * all AMP documents loaded in the shell.
 * @param {string} name
 * @return {?string}
 * @private
 */
function getMetaUrl(name) {
  // Avoid exceptions in unit tests
  if (!self.document || !self.document.head) {
    return null;
  }

  // Disallow on proxy origins
  if (self.location && cdnProxyRegex.test(self.location.origin)) {
    return null;
  }

  const metaEl = self.document.head./*OK*/ querySelector(
    `meta[name="${name}"]`
  );
  return (metaEl && metaEl.getAttribute('content')) || null;
}

export const thirdParty = pure(
  env('thirdPartyUrl') || 'https://3p.ampproject.net'
);

export const thirdPartyFrameHost = pure(
  env('thirdPartyFrameHost') || 'ampproject.net'
);

export const thirdPartyFrameRegex = pure(
  (typeof env('thirdPartyFrameRegex') == 'string'
    ? new RegExp(env('thirdPartyFrameRegex'))
    : env('thirdPartyFrameRegex')) || /^d-\d+\.ampproject\.net$/
);

export const cdn = pure(
  env('cdnUrl') || getMetaUrl('runtime-host') || 'https://cdn.ampproject.org'
);

export const localhostRegex = pure(/^https?:\/\/localhost(:\d+)?$/);

export const errorReporting = pure(
  env('errorReportingUrl') ||
    'https://us-central1-amp-error-reporting.cloudfunctions.net/r'
);

export const betaErrorReporting = pure(
  env('betaErrorReportingUrl') ||
    'https://us-central1-amp-error-reporting.cloudfunctions.net/r-beta'
);

export const localDev = pure(env('localDev') || false);

/**
 * These domains are trusted with more sensitive viewer operations such as
 * propagating the referrer. If you believe your domain should be here,
 * file the issue on GitHub to discuss. The process will be similar
 * (but somewhat more stringent) to the one described in the [3p/README.md](
 * https://github.com/ampproject/amphtml/blob/main/3p/README.md)
 *
 * @type {!Array<!RegExp>}
 */
export const trustedViewerHosts = pure([
  /(^|\.)google\.(com?|[a-z]{2}|com?\.[a-z]{2}|cat)$/,
  /(^|\.)gmail\.(com|dev)$/,
]);

// Optional fallback API if amp-geo is left unpatched
export const geoApi = pure(env('geoApiUrl') || getMetaUrl('amp-geo-api'));
