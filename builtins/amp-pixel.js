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

import {BaseElement} from '../src/base-element';
import {Layout} from '../src/layout';
import {assert} from '../src/asserts';
import {documentInfoFor} from '../src/document-info';
import {registerElement} from '../src/custom-element';
import {parseUrl, removeFragment} from '../src/url';


/**
 * @param {!Window} win Destination window for the new element.
 * @this {undefined}  // Make linter happy
 * @return {undefined}
 */
export function installPixel(win) {

  /**
   * @private {!Object<string, function():*>}
   */
  const REPLACEMENTS = {
    /**
     * Returns a random value for cache busters.
     */
    'RANDOM': () => {
      return Math.random();
    },

    /**
     * Returns the canonical URL for this AMP document.
     */
    'CANONICAL_URL': () => {
      return documentInfoFor(win).canonicalUrl;
    },

    /**
     * Returns the host of the canonical URL for this AMP document.
     */
    'CANONICAL_HOST': () => {
      const url = parseUrl(documentInfoFor(win).canonicalUrl);
      return url && url.hostname;
    },

    /**
     * Returns the path of the canonical URL for this AMP document.
     */
    'CANONICAL_PATH': () => {
      const url = parseUrl(documentInfoFor(win).canonicalUrl);
      return url && url.pathname;
    },

    /**
     * Returns the referrer URL.
     */
    'DOCUMENT_REFERRER': () => {
      return win.document.referrer;
    },

    /**
     * Returns the title of this AMP document.
     */
    'TITLE': () => {
      return win.document.title;
    },

    /**
     * Returns the URL for this AMP document.
     */
    'AMPDOC_URL': () => {
      return removeFragment(win.location.href);
    },

    /**
     * Returns the host of the URL for this AMP document.
     */
    'AMPDOC_HOST': () => {
      const url = parseUrl(win.location.href);
      return url && url.hostname;
    }
  };

  /**
   * @private {!RegExp}
   */
  const REPLACEMENT_EXPR = (() => {
    let all = '';
    for (const k in REPLACEMENTS) {
      all += (all.length > 0 ? '|' : '') + k;
    }
    return new RegExp('\\$?(' + all + ')', 'g');
  })();


  class AmpPixel extends BaseElement {
    /** @override */
    isLayoutSupported(layout) {
      return layout == Layout.FIXED;
    }

    /** @override */
    buildCallback() {
      // Remove user defined size. Pixels should always be the default size.
      this.element.style.width = '';
      this.element.style.height = '';
      // Consider the element invisible.
      this.element.setAttribute('aria-hidden', 'true');
    }

    /** @override */
    layoutCallback() {
      let src = this.element.getAttribute('src');
      src = this.assertSource(src);
      src = src.replace(REPLACEMENT_EXPR, function(match, name) {
        let val = REPLACEMENTS[name]();
        if (!val && val !== 0) {
          val = '';
        }
        return encodeURIComponent(val);
      });
      const image = new Image();
      image.src = src;
      image.width = 1;
      image.height = 1;
      // Make it take zero space
      this.element.style.width = 0;
      this.element.appendChild(image);
      return Promise.resolve();
    }

    assertSource(src) {
      assert(
          /^(https\:\/\/|\/\/)/i.test(src),
          'The <amp-pixel> src attribute must start with ' +
          '"https://" or "//". Invalid value: ' + src);
      return src;
    }
  };

  registerElement(win, 'amp-pixel', AmpPixel);
}
