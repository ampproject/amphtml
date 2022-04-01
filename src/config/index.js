/**
 * Allows for runtime configuration. Internally, the runtime should
 * use the src/config.js module for various constants. We can use the
 * AMP_CONFIG global to translate user-defined configurations to this
 * module.
 * @type {!Object<string, string>}
 */
import {
  betaErrorReporting,
  cdn,
  cdnProxyRegex,
  errorReporting,
  geoApi,
  localDev,
  localhostRegex,
  thirdParty,
  thirdPartyFrameHost,
  thirdPartyFrameRegex,
  trustedViewerHosts,
} from './urls';

/**
 * @typedef {{
 *   thirdParty: string,
 *   thirdPartyFrameHost: string,
 *   thirdPartyFrameRegex: !RegExp,
 *   cdn: string,
 *   cdnProxyRegex: !RegExp,
 *   localhostRegex: !RegExp,
 *   errorReporting: string,
 *   betaErrorReporting: string,
 *   localDev: boolean,
 *   trustedViewerHosts: !Array<!RegExp>,
 *   geoApi: ?string,
 * }}
 */
export const urls = {
  thirdParty,
  thirdPartyFrameHost,
  thirdPartyFrameRegex,
  cdn,
  /* Note that cdnProxyRegex is only ever checked against origins
   * (proto://host[:port]) so does not need to consider path
   */
  cdnProxyRegex,
  localhostRegex,
  errorReporting,
  betaErrorReporting,
  localDev,
  /**
   * These domains are trusted with more sensitive viewer operations such as
   * propagating the referrer. If you believe your domain should be here,
   * file the issue on GitHub to discuss. The process will be similar
   * (but somewhat more stringent) to the one described in the [3p/README.md](
   * https://github.com/ampproject/amphtml/blob/main/3p/README.md)
   *
   * {!Array<!RegExp>}
   */
  trustedViewerHosts,
  // Optional fallback API if amp-geo is left unpatched
  geoApi,
};

export const config = {
  urls,
};
