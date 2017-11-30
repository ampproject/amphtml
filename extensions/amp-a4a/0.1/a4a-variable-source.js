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
  getTimingDataSync,
  getTimingDataAsync,
} from '../../../src/service/variable-source';
import {user} from '../../../src/log';


const WHITELISTED_VARIABLES = [
  'AMP_VERSION',
  'AMPDOC_HOST',
  'AMPDOC_HOSTNAME',
  'AMPDOC_URL',
  'AVAILABLE_SCREEN_HEIGHT',
  'AVAILABLE_SCREEN_WIDTH',
  'BROWSER_LANGUAGE',
  'CANONICAL_HOST',
  'CANONICAL_HOSTNAME',
  'CANONICAL_PATH',
  'CANONICAL_URL',
  'CLIENT_ID',
  'COUNTER',
  'DOCUMENT_CHARSET',
  'DOCUMENT_REFERRER',
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
  'SUM',
  'TIMESTAMP',
  'TIMEZONE',
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
    super();
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

    for (let v = 0; v < WHITELISTED_VARIABLES.length; v++) {
      const varName = WHITELISTED_VARIABLES[v];
      const resolvers = this.globalVariableSource_.get(varName);
      this.set(varName, resolvers.sync).setAsync(varName, resolvers.async);
    }
  }
}
