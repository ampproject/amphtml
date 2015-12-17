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

import {assert} from './asserts';
import {cidFor} from './cid';
import {documentInfoFor} from './document-info';
import {getService, getElementService} from './service';
import {log} from './log';
import {parseUrl, removeFragment} from './url';
import {viewportFor} from './viewport';
import {vsyncFor} from './vsync';

/** @private {string} */
const TAG_ = 'UrlReplacements';

/**
 * This class replaces substitution variables with their values.
 */
class UrlReplacements {
  /** @param {!Window} win */
  constructor(win) {
    /** @private @const {!Window} */
    this.win_ = win;

    /** @private {!RegExp|undefined} */
    this.replacementExpr_;

    /** @private @const {!Object<string, function(*):*>} */
    this.replacements_ = this.win_.Object.create(null);

    // Returns a random value for cache busters.
    this.set_('RANDOM', () => {
      return Math.random();
    });

    // Returns the canonical URL for this AMP document.
    this.set_('CANONICAL_URL', () => {
      return documentInfoFor(this.win_).canonicalUrl;
    });

    // Returns the host of the canonical URL for this AMP document.
    this.set_('CANONICAL_HOST', () => {
      const url = parseUrl(documentInfoFor(this.win_).canonicalUrl);
      return url && url.hostname;
    });

    // Returns the path of the canonical URL for this AMP document.
    this.set_('CANONICAL_PATH', () => {
      const url = parseUrl(documentInfoFor(this.win_).canonicalUrl);
      return url && url.pathname;
    });

    // Returns the referrer URL.
    this.set_('DOCUMENT_REFERRER', () => {
      return this.win_.document.referrer;
    });

    // Returns the title of this AMP document.
    this.set_('TITLE', () => {
      return this.win_.document.title;
    });

    // Returns the URL for this AMP document.
    this.set_('AMPDOC_URL', () => {
      return removeFragment(this.win_.location.href);
    });

    // Returns the host of the URL for this AMP document.
    this.set_('AMPDOC_HOST', () => {
      const url = parseUrl(this.win_.location.href);
      return url && url.hostname;
    });

    // Returns a random string that will be the constant for the duration of
    // single page view. It should have sufficient entropy to be unique for
    // all the page views a single user is making at a time.
    this.set_('PAGE_VIEW_ID', () => {
      return documentInfoFor(this.win_).pageViewId;
    });

    this.set_('CLIENT_ID', (data, name) => {
      return cidFor(this.win_).then(cid => {
        return cid.get(name,
            // TODO(@cramforce): Hook up mechanism to get consent to id
            // generation.
            Promise.resolve());
      });
    });

    // Returns the number of milliseconds since 1 Jan 1970 00:00:00 UTC.
    this.set_('TIMESTAMP', () => {
      return new Date().getTime();
    });

    // Returns the user's time-zone offset from UTC, in minutes.
    this.set_('TIMEZONE', () => {
      return new Date().getTimezoneOffset();
    });

    // Returns a promise resolving to viewport.getScrollTop.
    this.set_('SCROLL_TOP', () => {
      return vsyncFor(this.win_).measurePromise(
        () => viewportFor(this.win_).getScrollTop());
    });

    // Returns a promise resolving to viewport.getScrollLeft.
    this.set_('SCROLL_LEFT', () => {
      return vsyncFor(this.win_).measurePromise(
        () => viewportFor(this.win_).getScrollLeft());
    });

    // Returns a promise resolving to viewport.getScrollHeight.
    this.set_('SCROLL_HEIGHT', () => {
      return vsyncFor(this.win_).measurePromise(
        () => viewportFor(this.win_).getScrollHeight());
    });

    // Returns screen.width.
    this.set_('SCREEN_WIDTH', () => {
      return this.win_.screen.width;
    });

    // Returns screen.height.
    this.set_('SCREEN_HEIGHT', () => {
      return this.win_.screen.height;
    });
  }

  /**
   * Sets the value resolver for the variable with the specified name. The
   * value resolver may optionally take an extra parameter.
   * @param {string} varName
   * @param {function(*):*} resolver
   * @return {!UrlReplacements}
   * @private
   */
  set_(varName, resolver) {
    this.replacements_[varName] = resolver;
    this.replacementExpr_ = undefined;
    return this;
  }

  /**
   * Expands the provided URL by replacing all known variables with their
   * resolved values.
   * @param {string} url
   * @param {*} opt_data
   * @return {!Promise<string>}
   */
  expand(url, opt_data) {
    const expr = this.getExpr_();
    let replacementPromise;
    const encodeValue = val => {
      // Value 0 is specialcased because the numeric 0 is a valid substitution
      // value.
      if (!val && val !== 0) {
        val = '';
      }
      return encodeURIComponent(val);
    };
    url = url.replace(expr, (match, name, arg) => {
      const val = this.replacements_[name](opt_data, arg);
      // In case the produced value is a promise, we don't actually
      // replace anything here, but do it again when the promise resolves.
      if (val && val.then) {
        const p = val.then(v => {
          url = url.replace(match, encodeValue(v));
        }, err => {
          log.error(TAG_, 'Failed to expand: ' + name, err);
        });
        if (replacementPromise) {
          replacementPromise = replacementPromise.then(() => p);
        } else {
          replacementPromise = p;
        }
        return match;
      }
      return encodeValue(val);
    });

    if (replacementPromise) {
      replacementPromise = replacementPromise.then(() => url);
    }

    return replacementPromise || Promise.resolve(url);
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
      this.replacementExpr_ =
          // Match the given replacement patterns, as well as optionally
          // arguments to the replacement behind it in parantheses.
          // Example string that match
          // FOO_BAR
          // FOO_BAR(arg1)
          new RegExp('\\$?(' + all + ')(?:\\(([a-zA-Z-_]+)\\))?', 'g');
    }
    return this.replacementExpr_;
  }
}

/**
 * @param {!Window} window
 * @return {!UrlReplacements}
 */
export function urlReplacementsFor(window) {
  return getService(window, 'url-replace', () => {
    return new UrlReplacements(window);
  });
};
