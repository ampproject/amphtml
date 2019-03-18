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
import {user, userAssert} from '../../../src/log';


const WHITELISTED_VARIABLES = [
  'AMPDOC_HOST',
  'AMPDOC_HOSTNAME',
  'AMPDOC_URL',
  'AMP_VERSION',
  'AVAILABLE_SCREEN_HEIGHT',
  'AVAILABLE_SCREEN_WIDTH',
  'BACKGROUND_STATE',
  'BROWSER_LANGUAGE',
  'CANONICAL_HOST',
  'CANONICAL_HOSTNAME',
  'CANONICAL_PATH',
  'CANONICAL_URL',
  'COUNTER',
  'DOCUMENT_CHARSET',
  'DOCUMENT_REFERRER',
  'FIRST_CONTENTFUL_PAINT',
  'FIRST_VIEWPORT_READY',
  'MAKE_BODY_VISIBLE',
  'PAGE_VIEW_ID',
  'RANDOM',
  'SCREEN_COLOR_DEPTH',
  'SCREEN_HEIGHT',
  'SCREEN_WIDTH',
  'SCROLL_HEIGHT',
  'SCROLL_LEFT',
  'SCROLL_TOP',
  'SCROLL_WIDTH',
  'SHARE_TRACKING_INCOMING',
  'SHARE_TRACKING_OUTGOING',
  'SOURCE_HOST',
  'SOURCE_HOSTNAME',
  'SOURCE_PATH',
  'SOURCE_URL',
  'TIMESTAMP',
  'TIMEZONE',
  'TIMEZONE_CODE',
  'TITLE',
  'TOTAL_ENGAGED_TIME',
  'USER_AGENT',
  'VARIANT',
  'VARIANTS',
  'VIEWER',
  'VIEWPORT_HEIGHT',
  'VIEWPORT_WIDTH',
];

/** Provides A4A specific variable substitution. */
export class A4AVariableSource extends VariableSource {
  /**
   * @param  {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
   * @param  {!Window} embedWin
   */
  constructor(ampdoc, embedWin) {
    super(ampdoc);

    // Use parent URL replacements service for fallback.
    const headNode = ampdoc.getHeadNode();
    const urlReplacements = Services.urlReplacementsForDoc(headNode);

    /** @private {VariableSource} global variable source for fallback. */
    this.globalVariableSource_ = urlReplacements.getVariableSource();

    /** @private {!Window} */
    this.win_ = embedWin;
  }

  /** @override */
  initialize() {
    // Initiate whitelisted varaibles first in case the resolver function needs
    // to be overwritten.
    for (let v = 0; v < WHITELISTED_VARIABLES.length; v++) {
      const varName = WHITELISTED_VARIABLES[v];
      const resolvers = this.globalVariableSource_.get(varName);
      this.set(varName, resolvers.sync).setAsync(varName, resolvers.async);
    }

    this.set('NAV_TIMING', (startAttribute, endAttribute) => {
      userAssert(startAttribute, 'The first argument to NAV_TIMING, the' +
          ' start attribute name, is required');
      return getTimingDataSync(
          this.win_,
          /**@type {string}*/(startAttribute),
          /**@type {string}*/(endAttribute));
    }).setAsync('NAV_TIMING', (startAttribute, endAttribute) => {
      userAssert(startAttribute, 'The first argument to NAV_TIMING, the' +
          ' start attribute name, is required');
      return getTimingDataAsync(
          this.win_,
          /**@type {string}*/(startAttribute),
          /**@type {string}*/(endAttribute));
    });

    this.set('NAV_TYPE', () => {
      return getNavigationData(this.win_, 'type');
    });

    this.set('NAV_REDIRECT_COUNT', () => {
      return getNavigationData(this.win_, 'redirectCount');
    });

    this.set('HTML_ATTR',
        /** @type {function(...*)} */(this.htmlAttributeBinding_.bind(this)));

    this.set('CLIENT_ID', () => null);
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
   * @param {...string} var_args Additional params will be the names of
   *     attributes whose values will be returned. There should be at least 1.
   * @return {string} A stringified JSON array containing one member for each
   *     matching element. Each member will contain the names and values of the
   *     specified attributes, if the corresponding element has that attribute.
   *     Note that if an element matches the cssSelected but has none of the
   *     requested attributes, then nothing will be included in the array
   *     for that element.
   */
  htmlAttributeBinding_(cssSelector, var_args) {
    // Generate an error if cssSelector matches more than this many elements
    const HTML_ATTR_MAX_ELEMENTS_TO_TRAVERSE = 20;

    // Of the elements matched by cssSelector, see which contain one or more
    // of the specified attributes, and return an array of at most this many.
    const HTML_ATTR_MAX_ELEMENTS_TO_RETURN = 10;

    // Only allow at most this many attributeNames to be specified.
    const HTML_ATTR_MAX_ATTRS = 10;

    const TAG = 'A4AVariableSource';

    const attributeNames = Array.prototype.slice.call(arguments, 1);
    if (!cssSelector || !attributeNames.length) {
      return '[]';
    }
    if (attributeNames.length > HTML_ATTR_MAX_ATTRS) {
      user().error(TAG, `At most ${HTML_ATTR_MAX_ATTRS} may be requested.`);
      return '[]';
    }
    cssSelector = decodeURI(cssSelector);
    let elements;
    try {
      elements = this.win_.document.querySelectorAll(cssSelector);
    } catch (e) {
      user().error(TAG, `Invalid selector: ${cssSelector}`);
      return '[]';
    }
    if (elements.length > HTML_ATTR_MAX_ELEMENTS_TO_TRAVERSE) {
      user().error(TAG, 'CSS selector may match at most ' +
          `${HTML_ATTR_MAX_ELEMENTS_TO_TRAVERSE} elements.`);
      return '[]';
    }
    const result = [];
    for (let i = 0; i < elements.length &&
        result.length < HTML_ATTR_MAX_ELEMENTS_TO_RETURN; ++i) {
      const currentResult = {};
      let foundAtLeastOneAttr = false;
      for (let j = 0; j < attributeNames.length; ++j) {
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
