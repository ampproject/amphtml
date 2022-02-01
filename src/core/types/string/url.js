import {map} from '#core/types/object';

// eslint-disable-next-line no-script-url
export const INVALID_PROTOCOLS = ['javascript:', 'data:', 'vbscript:'];

const QUERY_STRING_REGEX = /(?:^[#?]?|&)([^=&]+)(?:=([^&]*))?/g;

/**
 * Tries to decode a URI component, falling back to opt_fallback (or an empty
 * string)
 *
 * @param {string} component
 * @param {string=} fallback
 * @return {string}
 */
export function tryDecodeUriComponent(component, fallback = '') {
  try {
    return decodeURIComponent(component);
  } catch (e) {
    return fallback;
  }
}

/**
 * Parses the query string of an URL. This method returns a simple key/value
 * map. If there are duplicate keys the latest value is returned.
 *
 * @param {string} queryString
 * @return {JsonObject}
 */
export function parseQueryString(queryString) {
  const params = map();
  if (!queryString) {
    return params;
  }

  let match;
  while ((match = QUERY_STRING_REGEX.exec(queryString))) {
    const name = tryDecodeUriComponent(match[1], match[1]);
    const value = match[2]
      ? tryDecodeUriComponent(match[2].replace(/\+/g, ' '), match[2])
      : '';
    params[name] = value;
  }
  return params;
}

/**
 * Parses the query # params.
 * @param {Window=} opt_win
 * @return {JsonObject}
 */
export function getHashParams(opt_win) {
  const {location} = opt_win || self;
  // location.originalHash is set by the viewer when it removes the fragment
  // from the URL.
  return parseQueryString(location['originalHash'] || location.hash);
}
