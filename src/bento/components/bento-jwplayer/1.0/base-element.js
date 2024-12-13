import {BentoVideoBaseElement} from '#bento/components/bento-video/1.0/base-element';

import {getDataParamsFromAttributes} from '#core/dom';

import {createParseAttrsWithPrefix} from '#preact/parse-props';

import {BentoJwplayer} from './component';

export class BaseElement extends BentoVideoBaseElement {
  /** @override */
  init() {
    super.init();

    return {
      'queryParams': this.mergeQueryParams(
        getDataParamsFromAttributes(this.element, null, /^playerParam(.+)/),
        this.element.getAttribute('data-player-querystring')
      ),
      'contentSearch': this.getContextualSearch(
        this.element.getAttribute('data-content-search')
      ),
    };
  }

  /**
   * Gets contextual search value
   * @param {string} searchVal
   * @return {string} contextual search value
   */
  getContextualSearch(searchVal) {
    if (searchVal !== '__CONTEXTUAL__') {
      return searchVal;
    }

    const {head, title} = this.element.ownerDocument;
    const ogTitleElement = head.querySelector('meta[property="og:title"]');
    const ogTitle = ogTitleElement
      ? ogTitleElement.getAttribute('content')
      : null;
    return ogTitle || title || '';
  }

  /**
   * Merges query params from multiple sources into 1 string
   * @param {object} playerParams
   * @param {string} playerQueryString
   * @return {string}
   */
  mergeQueryParams(playerParams, playerQueryString) {
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
}

/** @override */
BaseElement['Component'] = BentoJwplayer;

/** @override */
BaseElement['props'] = {
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

/** @override */
BaseElement['layoutSizeDefined'] = true;

/** @override */
BaseElement['usesShadowDom'] = true;

/** @override */
BaseElement['loadable'] = true;
