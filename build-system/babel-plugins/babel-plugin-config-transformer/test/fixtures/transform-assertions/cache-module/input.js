/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
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

const env = self.AMP_CONFIG || {};

const thirdPartyFrameRegex =
  typeof env['thirdPartyFrameRegex'] == 'string'
    ? new RegExp(env['thirdPartyFrameRegex'])
    : env['thirdPartyFrameRegex'];

const cdnProxyRegex =
  typeof env['cdnProxyRegex'] == 'string'
    ? new RegExp(env['cdnProxyRegex'])
    : env['cdnProxyRegex'];


/** @type {!Object<string, string|boolean|RegExp|Array<RegExp>>} */
export const urls = {
  thirdParty: env['thirdPartyUrl'] || 'https://3p.ampproject.net',
  thirdPartyFrameHost: env['thirdPartyFrameHost'] || 'ampproject.net',
  thirdPartyFrameRegex: thirdPartyFrameRegex || /^d-\d+\.ampproject\.net$/,
  cdn: env['cdnUrl'] || 'https://cdn.ampproject.org',
  cdnProxyRegex:
    cdnProxyRegex || /^https:\/\/([a-zA-Z0-9_-]+\.)?cdn\.ampproject\.org$/,
  localhostRegex: /^https?:\/\/localhost(:\d+)?$/,
  errorReporting:
    env['errorReportingUrl'] || 'https://amp-error-reporting.appspot.com/r',
  localDev: env['localDev'] || false,
  trustedViewerHosts: [
    /(^|\.)google\.(com?|[a-z]{2}|com?\.[a-z]{2}|cat)$/,
    /(^|\.)gmail\.(com|dev)$/,
  ],
  geoApi: env['geoApiUrl'],
};

export const config = {
  urls,
};