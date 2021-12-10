import {getDataParamsFromAttributes} from '#core/dom';
import {dict} from '#core/types/object';

import {createParseAttrsWithPrefix} from '#preact/parse-props';
export {BentoJwplayer as Component} from './component';

export const props = {
  'playerId': {attr: 'data-player-id'},
  'mediaId': {attr: 'data-media-id'},
  'playlistId': {attr: 'data-playlist-id'},
  'contentRecency': {attr: 'data-content-recency'},
  'contentBackfill': {attr: 'data-content-backfill', type: 'boolean'},
  'adCustParams': {attr: 'data-ad-cust-params'},
  'adMacros': createParseAttrsWithPrefix('data-ad-macro-'),
  'config': createParseAttrsWithPrefix('data-config-'),
  'autoplay': {attr: 'autoplay', type: 'boolean'},
  // TODO(wg-components): Current behavior defaults to loading="auto".
  // Refactor to make loading="lazy" as the default.
  'loading': {attr: 'data-loading'},
  // TODO(wg-bento): These props have no internal implementation yet.
  'dock': {attr: 'dock', media: true},
};

export const layoutSizeDefined = true;

export const usesShadowDom = true;

export const loadable = true;

/**
 * @param {Element} element
 * @return {JsonObject}
 */
export function getJwplayerProps(element) {
  return dict({
    'queryParams': mergeQueryParams(element),
    'contentSearch': getContextualSearch(element),
  });
}

/**
 * Gets contextual search value
 * @param {Element} element
 * @return {string} contextual search value
 */
function getContextualSearch(element) {
  const searchVal = element.getAttribute('data-content-search');
  if (searchVal !== '__CONTEXTUAL__') {
    return searchVal;
  }

  const {head, title} = element.ownerDocument;
  const ogTitleElement = head.querySelector('meta[property="og:title"]');
  const ogTitle = ogTitleElement
    ? ogTitleElement.getAttribute('content')
    : null;
  return ogTitle || title || '';
}

/**
 * Merges query params from multiple sources into 1 string
 * @param {Element} element
 * @return {string}
 */
function mergeQueryParams(element) {
  const playerParams = getDataParamsFromAttributes(
    element,
    null,
    /^playerParam(.+)/
  );
  const playerQueryString = element.getAttribute('data-player-querystring');
  return mergeQueryParams_(playerParams, playerQueryString);
}

/**
 * Merges query params from multiple sources into 1 string
 * @param {Object} playerParams
 * @param {string} playerQueryString
 * @return {string}
 */
function mergeQueryParams_(playerParams, playerQueryString) {
  const addEntries = (acc, entries) => {
    for (const entry of entries) {
      acc[entry[0]] = entry[1];
    }
  };
  const p1 = new URLSearchParams(playerParams || '');
  const p2 = new URLSearchParams(playerQueryString || '');
  const params = {};
  addEntries(params, p1.entries());
  addEntries(params, p2.entries());
  return params;
}
