import {getDataParamsFromAttributes} from '#core/dom';
import {dict} from '#core/types/object';

import {BentoJwplayer} from './component';

import {
  getConsentMetadata,
  getConsentPolicyInfo,
  getConsentPolicyState,
} from '../../../src/consent';
import {VideoBaseElement} from '../../amp-video/1.0/video-base-element';

export class BaseElement extends VideoBaseElement {
  /** @override */
  init() {
    super.init();

    const consentPolicy = this.getConsentPolicy();
    if (consentPolicy) {
      this.getConsentInfo().then((consentInfo) => {
        const policyState = consentInfo[0];
        const policyInfo = consentInfo[1];
        const policyMetadata = consentInfo[2];
        this.mutateProps(
          dict({
            'consentParams': {
              'policyState': policyState,
              'policyInfo': policyInfo,
              'policyMetadata': policyMetadata,
            },
          })
        );
      });
    }

    return dict({
      'queryParams': this.mergeQueryParams(
        getDataParamsFromAttributes(this.element, null, /^playerParam(.+)/),
        this.element.getAttribute('data-player-querystring')
      ),
      'contentSearch': this.getContextualSearch(
        this.element.getAttribute('data-content-search')
      ),
    });
  }

  /**
   * @param {string} policy
   * @return {Promise}
   */
  getConsentInfo(policy) {
    return Promise.all([
      getConsentPolicyState(this.element, policy),
      getConsentPolicyInfo(this.element, policy),
      getConsentMetadata(this.element, policy),
    ]);
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
   * @param {Object} playerParams
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
  'adMacros': {attrPrefix: 'data-ad-macro-'},
  'config': {attrPrefix: 'data-config-'},
  'autoplay': {attr: 'autoplay', type: 'boolean'},
  // TODO(wg-bento): These props have no internal implementation yet.
  'dock': {attr: 'dock', media: true},
};

/** @override */
BaseElement['layoutSizeDefined'] = true;

/** @override */
BaseElement['usesShadowDom'] = true;
