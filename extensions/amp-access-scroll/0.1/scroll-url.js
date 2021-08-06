/**
 * Copyright 2020 The AMP HTML Authors. All Rights Reserved.
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

import {PROTOCOL_VERSION} from './scroll-protocol';
import {getMode} from '../../../src/mode';

/**
 * The eTLD for scroll URLs in development mode.
 *
 * Enables amp-access-scroll to work with dev/staging environments.
 *
 * @param {!JsonObject} config
 * @return {string}
 */
const devEtld = (config) => {
  return getMode().development && config['etld'] ? config['etld'] : '';
};

/**
 * The connect server hostname.
 *
 * @param {!JsonObject} config
 * @return {string}
 */
export const connectHostname = (config) => {
  return `https://connect${devEtld(config) || '.scroll.com'}`;
};

/**
 * Get the url for iframe source or redirect, including necessary query params.
 *
 * @param {!../../amp-access/0.1/amp-access-source.AccessSource} accessSource
 * @param {string} base
 * @return {Promise<string>}
 */
export function buildUrl(accessSource, base) {
  return accessSource.buildUrl(
    `${base}` +
      '?rid=READER_ID' +
      '&cid=CLIENT_ID(scroll1)' +
      '&c=CANONICAL_URL' +
      '&o=AMPDOC_URL' +
      `&p=${PROTOCOL_VERSION}` +
      '&x=QUERY_PARAM(scrollx)',
    false
  );
}
