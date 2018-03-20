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

import {Services} from '../../../src/services';
import {
  VariableSource,
  getNavigationData,
  getTimingDataAsync,
  getTimingDataSync,
} from '../../../src/service/variable-source';
import {user} from '../../../src/log';


const WHITELISTED_VARIABLES = [
  'RANDOM',
  'COUNTER',
  'CANONICAL_URL',
  'CANONICAL_HOST',
  'CANONICAL_HOSTNAME',
  'CANONICAL_PATH',
  'DOCUMENT_REFERRER',
  'TITLE',
  'AMPDOC_URL',
  'AMPDOC_HOST',
  'AMPDOC_HOSTNAME',
  'SOURCE_URL',
  'SOURCE_HOST',
  'SOURCE_HOSTNAME',
  'SOURCE_PATH',
  'PAGE_VIEW_ID',
  'CLIENT_ID',
  'VARIANT',
  'VARIANTS',
  'SHARE_TRACKING_INCOMING',
  'SHARE_TRACKING_OUTGOING',
  'TIMESTAMP',
  'TIMEZONE',
  'SCROLL_TOP',
  'SCROLL_LEFT',
  'SCROLL_HEIGHT',
  'SCROLL_WIDTH',
  'VIEWPORT_HEIGHT',
  'VIEWPORT_WIDTH',
  'SCREEN_WIDTH',
  'SCREEN_HEIGHT',
  'AVAILABLE_SCREEN_HEIGHT',
  'AVAILABLE_SCREEN_WIDTH',
  'SCREEN_COLOR_DEPTH',
  'DOCUMENT_CHARSET',
  'BROWSER_LANGUAGE',
  'VIEWER',
  'TOTAL_ENGAGED_TIME',
  'AMP_VERSION',
  'USER_AGENT',
  'FIRST_CONTENTFUL_PAINT',
  'FIRST_VIEWPORT_READY',
  'MAKE_BODY_VISIBLE',
];

/** Provides A4A specific variable substitution. */
export class A4AVariableSource extends VariableSource {
  /**
   * @param  {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
   * @param  {!Window} embedWin
   */
  constructor(ampdoc, embedWin) {
    super(ampdoc);
    /** @private {VariableSource} global variable source for fallback. */
    this.globalVariableSource_ = Services.urlReplacementsForDoc(ampdoc)
        .getVariableSource();

    /** @private {!Window} */
    this.win_ = embedWin;
  }

  /** @override */
  initialize() {
    this.set('AD_NAV_TIMING', (startAttribute, endAttribute) => {
      user().assert(startAttribute, 'The first argument to AD_NAV_TIMING, the' +
          ' start attribute name, is required');
      return getTimingDataSync(
          this.win_,
          /**@type {string}*/(startAttribute),
          /**@type {string}*/(endAttribute));
    }).setAsync('AD_NAV_TIMING', (startAttribute, endAttribute) => {
      user().assert(startAttribute, 'The first argument to AD_NAV_TIMING, the' +
          ' start attribute name, is required');
      return getTimingDataAsync(
          this.win_,
          /**@type {string}*/(startAttribute),
          /**@type {string}*/(endAttribute));
    });

    this.set('AD_NAV_TYPE', () => {
      return getNavigationData(this.win_, 'type');
    });

    this.set('AD_NAV_REDIRECT_COUNT', () => {
      return getNavigationData(this.win_, 'redirectCount');
    });

    this.set('HTML_ATTR',
        /** @type {function(...*)} */(this.htmlAttrBinding_.bind(this)));

    for (let v = 0; v < WHITELISTED_VARIABLES.length; v++) {
      const varName = WHITELISTED_VARIABLES[v];
      const resolvers = this.globalVariableSource_.get(varName);
      this.set(varName, resolvers.sync).setAsync(varName, resolvers.async);
    }
  }

  /**
   * Provides a binding for getting attributes from the DOM.
   * Most such bindings are provided in src/service/url-replacements-impl, but
   * this one needs access to this.win_.document, which if the amp-analytics
   * tag is contained within an amp-ad tag will NOT be the parent/publisher
   * page. Hence the need to put it here.
   * @param {string} cssSelector Elements matching this selector will be
   *     included, provided they have at least one of the attributeNames
   *     set, up to a max of 10. May be URI encoded.
   * Note: Additional params will be the names of the attributes whose
   *     values will be returned. There should be at least 1.
   * @returns {string} A stringified JSON array containing one member for each
   *     matching element. Each member will contain the names and values of the
   *     specified attributes, if the corresponding element has that attribute.
   *     Note that if an element matches the cssSelected but has none of the
   *     requested attributes, then nothing will be included in the array
   *     for that element.
   */
  htmlAttrBinding_(cssSelector) {
    const HTML_ATTR_MAX_ELEMENTS = 10;
    const HTML_ATTR_MAX_ATTRS = 10;
    const attributeNames = Array.prototype.slice.call(arguments, 1);
    if (!cssSelector || !attributeNames.length) {
      return '[]';
    }
    cssSelector = decodeURI(cssSelector);
    let elements;
    try {
      elements = this.win_.document.querySelectorAll(cssSelector);
    } catch (e) {
      const TAG = 'A4AVariableSource';
      user().error(TAG, `Invalid selector: ${cssSelector}`);
      return '[]';
    }
    const result = [];
    for (let i = 0; i < elements.length &&
        result.length < HTML_ATTR_MAX_ELEMENTS; ++i) {
      const currentResult = {};
      let foundAtLeastOneAttr = false;
      for (let j = 0; j < attributeNames.length &&
          j < HTML_ATTR_MAX_ATTRS; ++j) {
        const attributeName = attributeNames[j];
        if (elements[i].hasAttribute(attributeName)) {
          currentResult[attributeName] =
              elements[i].getAttribute(attributeName);
          foundAtLeastOneAttr = true;
        }
      }
      if (foundAtLeastOneAttr) {
        result.push(currentResult);
      }
    }
    return JSON.stringify(result);
  }
}
