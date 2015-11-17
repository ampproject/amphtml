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

import {assert} from '../src/asserts';
import {documentInfoFor} from '../src/document-info';
import {parseUrl, removeFragment} from '../src/url';


/**
 * This class replaces substitution variables with their values.
 */
export class UrlReplacements {
  /** @param {!Window} win */
  constructor(win) {
    /** @private @const {!Window} */
    this.win_ = win;

    /** @private {!RegExp|undefined} */
    this.replacementExpr_;

    /** @private @const {!Object<string, function(*):*>} */
    this.replacements_ = this.win_.Object.create(null);

    // Returns a random value for cache busters.
    this.set('RANDOM', () => {
      return Math.random();
    });

    // Returns the canonical URL for this AMP document.
    this.set('CANONICAL_URL', () => {
      return documentInfoFor(this.win_).canonicalUrl;
    });

    // Returns the host of the canonical URL for this AMP document.
    this.set('CANONICAL_HOST', () => {
      const url = parseUrl(documentInfoFor(this.win_).canonicalUrl);
      return url && url.hostname;
    });

    // Returns the path of the canonical URL for this AMP document.
    this.set('CANONICAL_PATH', () => {
      const url = parseUrl(documentInfoFor(this.win_).canonicalUrl);
      return url && url.pathname;
    });

    // Returns the referrer URL.
    this.set('DOCUMENT_REFERRER', () => {
      return this.win_.document.referrer;
    });

    // Returns the title of this AMP document.
    this.set('TITLE', () => {
      return this.win_.document.title;
    });

    // Returns the URL for this AMP document.
    this.set('AMPDOC_URL', () => {
      return removeFragment(this.win_.location.href);
    });

    // Returns the host of the URL for this AMP document.
    this.set('AMPDOC_HOST', () => {
      const url = parseUrl(this.win_.location.href);
      return url && url.hostname;
    });
  }

  /**
   * Sets the value resolver for the variable with the specified name. The
   * value resolver may optionally take an extra parameter.
   * @param {string} varName
   * @param {function(*):*} resolver
   * @return {!UrlReplacements}
   */
  set(varName, resolver) {
    assert(varName == varName.toUpperCase(),
        'Variable name must be in upper case: %s', varName);
    this.replacements_[varName] = resolver;
    this.replacementExpr_ = undefined;
    return this;
  }

  /**
   * Expands the provided URL by replacing all known variables with their
   * resolved values.
   * @param {string} url
   * @param {*} opt_data
   * @return {string}
   */
  expand(url, opt_data) {
    const expr = this.getExpr_();
    return url.replace(expr, (match, name) => {
      let val = this.replacements_[name](opt_data);
      // Value 0 is specialcased because the numeric 0 is a valid substitution
      // value.
      if (!val && val !== 0) {
        val = '';
      }
      return encodeURIComponent(val);
    });
  }

  /**
   * @return {!RegExp}
   * @private
   */
  getExpr_() {
    if (!this.replacementExpr_) {
      let all = '';
      for (const k in this.replacements_) {
        all += (all.length > 0 ? '|' : '') + k;
      }
      this.replacementExpr_ = new RegExp('\\$?(' + all + ')', 'g');
    }
    return this.replacementExpr_;
  }
}
