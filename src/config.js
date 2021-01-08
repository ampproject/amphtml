/**
 * Copyright 2016 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * Allows for runtime configuration. Internally, the runtime should
 * use the src/config.js module for various constants. We can use the
 * AMP_CONFIG global to translate user-defined configurations to this
 * module.
 * @type {!Object<string, string>}
 */
const env = self.AMP_CONFIG || {};

const thirdPartyFrameRegex =
  (typeof env['thirdPartyFrameRegex'] == 'string'
    ? new RegExp(env['thirdPartyFrameRegex'])
    : env['thirdPartyFrameRegex']) || /^d-\d+\.ampproject\.net$/;

const cdnProxyRegex =
  (typeof env['cdnProxyRegex'] == 'string'
    ? new RegExp(env['cdnProxyRegex'])
    : env['cdnProxyRegex']) ||
  /^https:\/\/([a-zA-Z0-9_-]+\.)?cdn\.ampproject\.org$/;

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

/** @type {!Object<string, string|boolean|RegExp|Array<RegExp>>} */
export const urls = {
  thirdParty: env['thirdPartyUrl'] || 'https://3p.ampproject.net',
  thirdPartyFrameHost: env['thirdPartyFrameHost'] || 'ampproject.net',
  thirdPartyFrameRegex,
  cdn:
    env['cdnUrl'] || getMetaUrl('runtime-host') || 'https://cdn.ampproject.org',
  /* Note that cdnProxyRegex is only ever checked against origins
   * (proto://host[:port]) so does not need to consider path
   */
  cdnProxyRegex,
  localhostRegex: /^https?:\/\/localhost(:\d+)?$/,
  errorReporting:
    env['errorReportingUrl'] ||
    'https://us-central1-amp-error-reporting.cloudfunctions.net/r',
  betaErrorReporting:
    env['betaErrorReportingUrl'] ||
    'https://us-central1-amp-error-reporting.cloudfunctions.net/r-beta',
  localDev: env['localDev'] || false,
  /**
   * These domains are trusted with more sensitive viewer operations such as
   * propagating the referrer. If you believe your domain should be here,
   * file the issue on GitHub to discuss. The process will be similar
   * (but somewhat more stringent) to the one described in the [3p/README.md](
   * https://github.com/ampproject/amphtml/blob/master/3p/README.md)
   *
   * {!Array<!RegExp>}
   */
  trustedViewerHosts: [
    /(^|\.)google\.(com?|[a-z]{2}|com?\.[a-z]{2}|cat)$/,
    /(^|\.)gmail\.(com|dev)$/,
  ],
  // Optional fallback API if amp-geo is left unpatched
  geoApi: env['geoApiUrl'] || getMetaUrl('amp-geo-api'),
};

export const config = {
  urls,
};
