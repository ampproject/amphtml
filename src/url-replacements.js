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
import {getService} from './service';
import {loadPromise} from './event-helper';
import {log} from './log';
import {parseUrl, removeFragment} from './url';
import {viewportFor} from './viewport';
import {vsyncFor} from './vsync';
import {userNotificationManagerFor} from './user-notification';

/** @private {string} */
const TAG_ = 'UrlReplacements';

/**
 * This class replaces substitution variables with their values.
 * Document new values in ../spec/amp-var-substitutions.md
 */
class UrlReplacements {
  /** @param {!Window} win */
  constructor(win) {
    /** @private @const {!Window} */
    this.win_ = win;

    /** @private {!RegExp|undefined} */
    this.replacementExpr_ = undefined;

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

    this.set_('CLIENT_ID', (scope, opt_userNotificationId) => {
      assert(scope, 'The first argument to CLIENT_ID, the fallback c' +
          /*OK*/'ookie name, is required');
      let consent = Promise.resolve();

      // If no `opt_userNotificationId` argument is provided then
      // assume consent is given by default.
      if (opt_userNotificationId) {
        consent = userNotificationManagerFor(this.win_).then(service => {
          return service.get(opt_userNotificationId);
        });
      }
      return cidFor(win).then(cid => {
        return cid.get({
          scope: scope,
          createCookieIfNotPresent: true
        }, consent);
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

    // Returns screen.availHeight.
    this.set_('AVAILABLE_SCREEN_HEIGHT', () => {
      return this.win_.screen.availHeight;
    });

    // Returns screen.availWidth.
    this.set_('AVAILABLE_SCREEN_WIDTH', () => {
      return this.win_.screen.availWidth;
    });

    // Returns screen.ColorDepth.
    this.set_('SCREEN_COLOR_DEPTH', () => {
      return this.win_.screen.colorDepth;
    });

    // Returns document characterset.
    this.set_('DOCUMENT_CHARSET', () => {
      const doc = this.win_.document;
      return doc.characterSet || doc.charset;
    });

    // Returns the browser language.
    this.set_('BROWSER_LANGUAGE', () => {
      const nav = this.win_.navigator;
      return (nav.language || nav.userLanguage || nav.browserLanguage || '')
          .toLowerCase();
    });

    // Returns the time it took to load the whole page. (excludes amp-* elements
    // that are not rendered by the system yet.)
    this.set_('PAGE_LOAD_TIME', () => {
      return this.getTimingData_('navigationStart', 'loadEventStart');
    });

    // Returns the time it took to perform DNS lookup for the domain.
    this.set_('DOMAIN_LOOKUP_TIME', () => {
      return this.getTimingData_('domainLookupStart', 'domainLookupEnd');
    });

    // Returns the time it took to connet to the server.
    this.set_('TCP_CONNECT_TIME', () => {
      return this.getTimingData_('connectStart', 'connectEnd');
    });

    // Returns the time it took for server to start sending a response to the
    // request.
    this.set_('SERVER_RESPONSE_TIME', () => {
      return this.getTimingData_('requestStart', 'responseStart');
    });

    // Returns the time it took to download the page.
    this.set_('PAGE_DOWNLOAD_TIME', () => {
      return this.getTimingData_('responseStart', 'responseEnd');
    });

    // Returns the time it took for redirects to complete.
    this.set_('REDIRECT_TIME', () => {
      return this.getTimingData_('navigationStart', 'fetchStart');
    });

    // Returns the time it took for DOM to become interactive.
    this.set_('DOM_INTERACTIVE_TIME', () => {
      return this.getTimingData_('navigationStart', 'domInteractive');
    });

    // Returns the time it took for content to load.
    this.set_('CONTENT_LOAD_TIME', () => {
      return this.getTimingData_('navigationStart',
          'domContentLoadedEventStart');
    });
  }

  /**
   * Returns navigation timing information based on the start and end events.
   * The data for the timing events is retrieved from performance.timing API.
   * @param {string} startEvent
   * @param {string} endEvent
   * @return {!Promise<string|undefined>}
   * @private
   */
  getTimingData_(startEvent, endEvent) {
    const timingInfo = this.win_['performance']
        && this.win_['performance']['timing'];
    if (!timingInfo || timingInfo['navigationStart'] == 0) {
      // Navigation timing API is not supported.
      return Promise.resolve();
    }

    let metric = timingInfo[endEvent] - timingInfo[startEvent];
    if (isNaN(metric) || metric == Infinity) {
      // The metric is not supported.
      return Promise.resolve();
    } else if (metric < 0) {
      // Metric is not yet available. Retry after a delay.
      return loadPromise(this.win_).then(() => {
        metric = timingInfo[endEvent] - timingInfo[startEvent];
        return (isNaN(metric) || metric == Infinity || metric < 0)
            ? Promise.resolve()
            : Promise.resolve(String(metric));
      });
    } else {
      return Promise.resolve(String(metric));
    }
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
    assert(varName.indexOf('RETURN') == -1);
    this.replacements_[varName] = resolver;
    this.replacementExpr_ = undefined;
    return this;
  }

  /**
   * Expands the provided URL by replacing all known variables with their
   * resolved values. Optional `opt_bindings` can be used to add new variables
   * or override existing ones.
   * @param {string} url
   * @param {!Object<string, *>=} opt_bindings
   * @return {!Promise<string>}
   */
  expand(url, opt_bindings) {
    const expr = this.getExpr_(opt_bindings);
    let replacementPromise;
    const encodeValue = val => {
      if (val == null) {
        val = '';
      }
      return encodeURIComponent(val);
    };
    url = url.replace(expr, (match, name, opt_strargs) => {
      let args = [];
      if (typeof opt_strargs == 'string') {
        args = opt_strargs.split(',');
      }
      const binding = (opt_bindings && (name in opt_bindings)) ?
          opt_bindings[name] : this.replacements_[name];
      const val = (typeof binding == 'function') ?
          binding.apply(null, args) : binding;
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
   * @param {!Object<string, *>=} opt_bindings
   * @return {!RegExp}
   * @private
   */
  getExpr_(opt_bindings) {
    const additionalKeys = opt_bindings ? Object.keys(opt_bindings) : null;
    if (additionalKeys && additionalKeys.length > 0) {
      const allKeys = Object.keys(this.replacements_);
      additionalKeys.forEach(key => {
        if (allKeys[key] === undefined) {
          allKeys.push(key);
        }
      });
      return this.buildExpr_(allKeys);
    }
    if (!this.replacementExpr_) {
      this.replacementExpr_ = this.buildExpr_(Object.keys(this.replacements_));
    }
    return this.replacementExpr_;
  }

  /**
   * @param {!Array<string>} keys
   * @return {!RegExp}
   * @private
   */
  buildExpr_(keys) {
    const all = keys.join('|');
    // Match the given replacement patterns, as well as optionally
    // arguments to the replacement behind it in parantheses.
    // Example string that match
    // FOO_BAR
    // FOO_BAR(arg1)
    // FOO_BAR(arg1,arg2)
    return new RegExp('\\$?(' + all + ')(?:\\(([0-9a-zA-Z-_,]+)\\))?', 'g');
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
