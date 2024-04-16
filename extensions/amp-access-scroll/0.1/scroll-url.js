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
