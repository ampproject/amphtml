/**
 * Copyright 2015 The AMP HTML Authors. All Rights Reserved.
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

import {getService} from '../../../src/service';
import {urlReplacementsFor} from '../../../src/url-replacements';
import {viewportFor} from '../../../src/viewport';

export class AnalyticsPlatformVars {

  /**
   * @param {!Window} win
   * @param {!UrlReplacements} urlReplacements
   * @param {!Viewport} viewport
   */
  constructor(win, urlReplacements, viewport) {

    /** @private {!Map} */
    this.resolvers_ = new Map();

    /**
     * @param {!string} name
     * @param {!Function} resolver
     */
    const set = (name, fn) => {this.resolvers_.set(name, fn);};

    /**
     * @param {string} name
     * @returns {Function}
     */
    const delegateToUrlReplacements = name => {
      return urlReplacements.get.bind(urlReplacements, name);
    };

    // Document
    set('canonicalUrl', delegateToUrlReplacements('CANONICAL_URL'));
    set('canonicalHost', delegateToUrlReplacements('CANONICAL_HOST'));
    set('canonicalPath', delegateToUrlReplacements('CANONICAL_PATH'));
    set('referrer', delegateToUrlReplacements('DOCUMENT_REFERRER'));
    set('title', delegateToUrlReplacements('TITLE'));
    set('ampUrl', delegateToUrlReplacements('AMPDOC_URL'));
    set('ampHost', delegateToUrlReplacements('AMPDOC_HOST'));

    // Time
    set('timestamp', () => new Date().getTime());
    set('timezone', () => new Date().getTimezoneOffset());

    // Metrics
    set('scrollTop', viewport.getScrollTop.bind(viewport));
    set('scrollLeft', viewport.getScrollLeft.bind(viewport));
    set('scrollWidth', viewport.getScrollWidth.bind(viewport));
    set('scrollHeight', viewport.getScrollHeight.bind(viewport));
    set('screenWidth', () => win.screen.width);
    set('screenHeight', () => win.screen.height);

    // Misc.
    set('pageViewId', delegateToUrlReplacements('PAGE_VIEW_ID'));
    set('random', delegateToUrlReplacements('RANDOM'));
  }

  /**
   * @param {string} name
   * @return {*} value for the given var, or null if no matching var exists.
   */
  get(name) {
    return this.resolvers_.has(name) ? this.resolvers_.get(name)() : null;
  }
}

/**
 * @param {!Window} window
 * @return {!AnalyticsPlatformVars}
 */
export function analyticsPlatformVarsFor(win) {
  return getService(win, 'analytics-platform-vars',
      () => new AnalyticsPlatformVars(
          win, urlReplacementsFor(win), viewportFor(win)));
}

