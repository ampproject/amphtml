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

import {accessServiceForOrNull} from '../access-service';
import {cidFor} from '../cid';
import {variantForOrNull} from '../variant-service';
import {dev, user, rethrowAsync} from '../log';
import {documentInfoFor} from '../document-info';
import {getService} from '../service';
import {loadPromise, listen} from '../event-helper';
import {getSourceUrl, parseUrl, removeFragment, parseQueryString} from '../url';
import {viewerFor} from '../viewer';
import {viewportFor} from '../viewport';
import {vsyncFor} from '../vsync';
import {userNotificationManagerFor} from '../user-notification';
import {activityFor} from '../activity';
import {timer} from '../timer';


/** @private @const {string} */
const TAG = 'UrlReplacements';

/** @private @const {string} */
const ORIGINAL_HREF_ATTRIBUTE = 'data-orig-href';

/** @typedef {string|undefined} */
let ResolverReturnDef;

/** @typedef {function(...*):ResolverReturnDef} */
let SyncResolverDef;

/** @typedef {function(...*):!Promise<ResolverReturnDef>} */
let AsyncResolverDef;

/** @typedef {{sync: SyncResolverDef, async: AsyncResolverDef}} */
let ReplacementDef;

/**
 * This class replaces substitution variables with their values.
 * Document new values in ../spec/amp-var-substitutions.md
 * @package For export.
 */
export class UrlReplacements {
  /** @param {!Window} win */
  constructor(win) {
    /** @private @const {!Window} */
    this.win_ = win;

    /** @private {!RegExp|undefined} */
    this.replacementExpr_ = undefined;

    /** @private @const {!Object<string, !ReplacementDef>} */
    this.replacements_ = this.win_.Object.create(null);

    /** @private @const {function(Window):Promise<(AccessService|null)>} */
    this.getAccessService_ = accessServiceForOrNull;

    /** @private @const {!Promise<?Object<string, string>>} */
    this.variants_ = variantForOrNull(win);

    /** @private {boolean} */
    this.initialized_ = false;

    // NOTE: getService prevents multiple instances of same service across
    // binaries (e.g. extensions) therefore ensures only one click listener.
    this.registerClickListener_();
  }

  /**
   * Lazily initialize the default replacements.
   */
  initialize_() {
    this.initialized_ = true;

    // Returns a random value for cache busters.
    this.set_('RANDOM', () => {
      return String(Math.random());
    });

    // Returns the canonical URL for this AMP document.
    this.set_('CANONICAL_URL', () => {
      return documentInfoFor(this.win_).canonicalUrl;
    });

    // Returns the host of the canonical URL for this AMP document.
    this.set_('CANONICAL_HOST', () => {
      const url = parseUrl(documentInfoFor(this.win_).canonicalUrl);
      return url && url.host;
    });

    // Returns the hostname of the canonical URL for this AMP document.
    this.set_('CANONICAL_HOSTNAME', () => {
      const url = parseUrl(documentInfoFor(this.win_).canonicalUrl);
      return url && url.hostname;
    });

    // Returns the path of the canonical URL for this AMP document.
    this.set_('CANONICAL_PATH', () => {
      const url = parseUrl(documentInfoFor(this.win_).canonicalUrl);
      return url && url.pathname;
    });

    // Returns the referrer URL.
    this.set_('DOCUMENT_REFERRER', null, () => {
      return viewerFor(this.win_).getReferrerUrl();
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
      return url && url.host;
    });

    // Returns the hostname of the URL for this AMP document.
    this.set_('AMPDOC_HOSTNAME', () => {
      const url = parseUrl(this.win_.location.href);
      return url && url.hostname;
    });

    // Returns the Source URL for this AMP document.
    this.set_('SOURCE_URL', () => {
      return removeFragment(getSourceUrl(this.win_.location.href));
    });

    // Returns the host of the Source URL for this AMP document.
    this.set_('SOURCE_HOST', () => {
      return parseUrl(getSourceUrl(this.win_.location.href)).host;
    });

    // Returns the hostname of the Source URL for this AMP document.
    this.set_('SOURCE_HOSTNAME', () => {
      return parseUrl(getSourceUrl(this.win_.location.href)).hostname;
    });

    // Returns the path of the Source URL for this AMP document.
    this.set_('SOURCE_PATH', () => {
      return parseUrl(getSourceUrl(this.win_.location.href)).pathname;
    });

    // Returns a random string that will be the constant for the duration of
    // single page view. It should have sufficient entropy to be unique for
    // all the page views a single user is making at a time.
    this.set_('PAGE_VIEW_ID', () => {
      return documentInfoFor(this.win_).pageViewId;
    });

    this.set_('QUERY_PARAM', (param, defaultValue = '') => {
      user.assert(param,
          'The first argument to QUERY_PARAM, the query string ' +
          'param is required');
      const url = parseUrl(this.win_.location.href);
      const params = parseQueryString(url.search);
      const val = params[/** @type {string} */ (param)];

      return (typeof val !== 'undefined') ? val : defaultValue;
    });

    this.set_('CLIENT_ID', null, (scope, opt_userNotificationId) => {
      user.assert(scope, 'The first argument to CLIENT_ID, the fallback c' +
          /*OK*/'ookie name, is required');
      let consent = Promise.resolve();

      // If no `opt_userNotificationId` argument is provided then
      // assume consent is given by default.
      if (opt_userNotificationId) {
        consent = userNotificationManagerFor(this.win_).then(service => {
          return service.get(opt_userNotificationId);
        });
      }
      return cidFor(this.win_).then(cid => {
        return cid.get({
          scope,
          createCookieIfNotPresent: true,
        }, consent);
      });
    });

    // Returns assigned variant name for the given experiment.
    this.set_('VARIANT', null, experiment => {
      return this.variants_.then(variants => {
        user.assert(variants,
            'To use variable VARIANT, amp-experiment should be configured');
        user.assert(variants[experiment] !== undefined,
            'The value passed to VARIANT() is not a valid experiment name:' +
                experiment);
        const variant = variants[experiment];
        // When no variant assigned, use reserved keyword 'none'.
        return variant === null ? 'none' : variant;
      });
    });

    // Returns the number of milliseconds since 1 Jan 1970 00:00:00 UTC.
    this.set_('TIMESTAMP', () => {
      return String(new Date().getTime());
    });

    // Returns the user's time-zone offset from UTC, in minutes.
    this.set_('TIMEZONE', () => {
      return String(new Date().getTimezoneOffset());
    });

    // Returns a promise resolving to viewport.getScrollTop.
    this.set_('SCROLL_TOP', null, () => {
      return vsyncFor(this.win_).measurePromise(
        () => viewportFor(this.win_).getScrollTop());
    });

    // Returns a promise resolving to viewport.getScrollLeft.
    this.set_('SCROLL_LEFT', null, () => {
      return vsyncFor(this.win_).measurePromise(
        () => viewportFor(this.win_).getScrollLeft());
    });

    // Returns a promise resolving to viewport.getScrollHeight.
    this.set_('SCROLL_HEIGHT', null, () => {
      return vsyncFor(this.win_).measurePromise(
        () => viewportFor(this.win_).getScrollHeight());
    });

    // Returns a promise resolving to viewport.getScrollWidth.
    this.set_('SCROLL_WIDTH', null, () => {
      return vsyncFor(this.win_).measurePromise(
        () => viewportFor(this.win_).getScrollWidth());
    });

    // Returns screen.width.
    this.set_('SCREEN_WIDTH', () => {
      return String(this.win_.screen.width);
    });

    // Returns screen.height.
    this.set_('SCREEN_HEIGHT', () => {
      return String(this.win_.screen.height);
    });

    // Returns screen.availHeight.
    this.set_('AVAILABLE_SCREEN_HEIGHT', () => {
      return String(this.win_.screen.availHeight);
    });

    // Returns screen.availWidth.
    this.set_('AVAILABLE_SCREEN_WIDTH', () => {
      return String(this.win_.screen.availWidth);
    });

    // Returns screen.ColorDepth.
    this.set_('SCREEN_COLOR_DEPTH', () => {
      return String(this.win_.screen.colorDepth);
    });

    // Returns the viewport height.
    this.set_('VIEWPORT_HEIGHT', null, () => {
      return vsyncFor(this.win_).measurePromise(
        () => viewportFor(this.win_).getSize().height);
    });

    // Returns the viewport width.
    this.set_('VIEWPORT_WIDTH', null, () => {
      return vsyncFor(this.win_).measurePromise(
        () => viewportFor(this.win_).getSize().width);
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
    this.setTimingResolver_(
      'PAGE_LOAD_TIME', 'navigationStart', 'loadEventStart');

    // Returns the time it took to perform DNS lookup for the domain.
    this.setTimingResolver_(
      'DOMAIN_LOOKUP_TIME', 'domainLookupStart', 'domainLookupEnd');

    // Returns the time it took to connet to the server.
    this.setTimingResolver_('TCP_CONNECT_TIME', 'connectStart', 'connectEnd');

    // Returns the time it took for server to start sending a response to the
    // request.
    this.setTimingResolver_(
      'SERVER_RESPONSE_TIME', 'requestStart', 'responseStart');

    // Returns the time it took to download the page.
    this.setTimingResolver_(
      'PAGE_DOWNLOAD_TIME', 'responseStart', 'responseEnd');

    // Returns the time it took for redirects to complete.
    this.setTimingResolver_('REDIRECT_TIME', 'navigationStart', 'fetchStart');

    // Returns the time it took for DOM to become interactive.
    this.setTimingResolver_(
      'DOM_INTERACTIVE_TIME', 'navigationStart', 'domInteractive');

    // Returns the time it took for content to load.
    this.setTimingResolver_(
      'CONTENT_LOAD_TIME', 'navigationStart', 'domContentLoadedEventStart');

    // Access: Reader ID.
    this.set_('ACCESS_READER_ID', null, () => {
      return this.getAccessValue_(accessService => {
        return accessService.getAccessReaderId();
      }, 'ACCESS_READER_ID');
    });

    // Access: data from the authorization response.
    this.set_('AUTHDATA', null, field => {
      user.assert(field,
          'The first argument to AUTHDATA, the field, is required');
      return this.getAccessValue_(accessService => {
        return accessService.getAuthdataField(field);
      }, 'AUTHDATA');
    });

    // Returns an identifier for the viewer.
    this.set_('VIEWER', null, () => {
      return viewerFor(this.win_).getViewerOrigin();
    });

    // Returns the total engaged time since the content became viewable.
    this.set_('TOTAL_ENGAGED_TIME', null, () => {
      return activityFor(this.win_).then(activity => {
        return activity.getTotalEngagedTime();
      });
    });

    this.set_('NAV_TIMING',
      (startAttribute, endAttribute) => {
        user.assert(startAttribute, 'The first argument to NAV_TIMING, the ' +
            'start attribute name, is required');
        return this.getTimingDataSync_(/**@type {string}*/(startAttribute),
            /**@type {string}*/(endAttribute));
      },
      (startAttribute, endAttribute) => {
        user.assert(startAttribute, 'The first argument to NAV_TIMING, the ' +
            'start attribute name, is required');
        return this.getTimingData_(/**@type {string}*/(startAttribute),
            /**@type {string}*/(endAttribute));
      });

    this.set_('NAV_TYPE', () => {
      return this.getNavigationData_('type');
    });

    this.set_('NAV_REDIRECT_COUNT', () => {
      return this.getNavigationData_('redirectCount');
    });

    // returns the AMP version number
    this.set_('AMP_VERSION', () => '$internalRuntimeVersion$');
  }

  /**
   * Registers click listener on documentElement that will expand the href of
   * clicked anchors that will cause navigation (preventDefault has not been
   * called) with additional support for CLICK_X & CLICK_Y based on clientX &
   * clientY. If the target is within a shadowRoot, the x/y location is offset
   * by the shadowRoot host's offset.
   * @private
   */
  registerClickListener_() {
    if (!this.win_.document) {
      dev.warn('no win.document?!  testing?');
      return;
    }
    listen(this.win_.document, 'click', evt => {
      const href = this.getExpandAnchorHref_(evt);
      if (href) {
        const originalHref = evt.target.getAttribute('href');
        if (originalHref != href) {
          // Store original href to handle case where navigation is prevented
          // by later executing click listener.  We want to ensure that later
          // click stores freshest value.
          evt.target.setAttribute('href', href);
          evt.target.setAttribute(ORIGINAL_HREF_ATTRIBUTE, originalHref);
        }
      }
    });
  }

  /**
   * Resolves the value via access service. If access service is not configured,
   * the resulting value is `null`.
   * @param {function(!AccessService):*} getter
   * @param {string} expr
   * @return {Promise<?AccessService>}
   */
  getAccessValue_(getter, expr) {
    return this.getAccessService_(this.win_).then(accessService => {
      if (!accessService) {
        // Access service is not installed.
        user.error(TAG, 'Access service is not installed to access: ', expr);
        return null;
      }
      return getter(accessService);
    });
  }

  /**
   * Returns navigation timing information based on the start and end events.
   * The data for the timing events is retrieved from performance.timing API.
   * If start and end events are both given, the result is the difference between the two.
   * If only start event is given, the result is the timing value at start event.
   * @param {string} startEvent
   * @param {string=} endEvent
   * @return {!Promise<string|undefined>}
   * @private
   */
  getTimingData_(startEvent, endEvent) {
    const syncMetric = this.getTimingDataSync_(startEvent, endEvent);
    if (syncMetric === '') {
      // Metric is not yet available. Retry after a delay.
      return loadPromise(this.win_).then(() => {
        const timingInfo = this.win_['performance']
            && this.win_['performance']['timing'];
        const metric = (endEvent === undefined)
            ? timingInfo[startEvent]
            : timingInfo[endEvent] - timingInfo[startEvent];
        return (isNaN(metric) || metric == Infinity || metric < 0)
            ? undefined
            : String(metric);
      });
    }
    return Promise.resolve(syncMetric);
  }

  /**
   * Returns navigation timing information based on the start and end events.
   * The data for the timing events is retrieved from performance.timing API.
   * If start and end events are both given, the result is the difference between the two.
   * If only start event is given, the result is the timing value at start event.
   * Enforces synchronous evaluation.
   * @param {string} startEvent
   * @param {string=} endEvent
   * @return {string|undefined} undefined if API is not available, empty string
   *    if it is not yet available, or value as string
   */
  getTimingDataSync_(startEvent, endEvent) {
    const timingInfo = this.win_['performance']
        && this.win_['performance']['timing'];
    if (!timingInfo || timingInfo['navigationStart'] == 0) {
      // Navigation timing API is not supported.
      return;
    }

    let metric = (endEvent === undefined)
        ? timingInfo[startEvent]
        : timingInfo[endEvent] - timingInfo[startEvent];

    if (isNaN(metric) || metric == Infinity) {
      // The metric is not supported.
      return;
    } else if (metric < 0) {
      return '';
    } else {
      return String(metric);
    }
  }

  /**
   * Returns navigation information from the current browsing context.
   * @param {string} attribute
   * @return {string|undefined}
   * @private
   */
  getNavigationData_(attribute) {
    const navigationInfo = this.win_['performance']
        && this.win_['performance']['navigation'];
    if (!navigationInfo || navigationInfo[attribute] === undefined) {
      // PerformanceNavigation interface is not supported or attribute is not implemented.
      return;
    }

    return String(navigationInfo[attribute]);
  }

  /**
   * Sets the value resolver for the variable with the specified name. The
   * value resolver may optionally take an extra parameter.
   * Allows for sync or async resolver depending on usage of expandSync.
   * @param {string} varName
   * @param {?SyncResolverDef} syncResolver
   * @param {AsyncResolverDef=} opt_asyncResolver
   * @return {!UrlReplacements}
   * @private
   */
  set_(varName, syncResolver, opt_asyncResolver) {
    dev.assert(varName.indexOf('RETURN') == -1);
    this.replacements_[varName] =
        {sync: syncResolver, async: opt_asyncResolver};
    this.replacementExpr_ = undefined;
    return this;
  }

  /**
   * Utility function for setting resolver for timing data that supports
   * sync and async.
   * @param {string} varName
   * @param {string} startEvent
   * @param {string=} endEvent
   * @return {!UrlReplacements}
   * @private
   */
  setTimingResolver_(varName, startEvent, endEvent) {
    return this.set_(varName, () => {
      return this.getTimingDataSync_(startEvent, endEvent);
    }, () => {
      return this.getTimingData_(startEvent, endEvent);
    });
  }

  /**
   * @param {*} val
   * @return {!string}
   * @private
   */
  encodeValue_(val) {
    switch (typeof val) {
      case 'string': return encodeURIComponent(val);
      case 'number':
      case 'boolean':
        return String(val);
      default:  // null evaluates as object
        return '';
    }
  }

/**
 * @param {string} url
 * @param {!Object<string, (ResolverReturnDef|!SyncResolverDef)>=} opt_bindings
 * @param {!Object<string, ResolverReturnDef>=} opt_collectVars
 * @return {string}
 * @private
 */
expandSync(url, opt_bindings, opt_collectVars) {
  if (!this.initialized_) {
    this.initialize_();
  }
  const expr = this.getExpr_(opt_bindings);
  url = url.replace(expr, (match, name, opt_strargs) => {
    let args = [];
    if (typeof opt_strargs == 'string') {
      args = opt_strargs.split(',');
    }
    const replacement = this.getReplacement_(name);
    let binding;
    if (opt_bindings && (name in opt_bindings)) {
      binding = opt_bindings[name];
    } else if (replacement) {
      binding = replacement.sync;
      if (!binding) {
        user.error('ignoring async replacement key: ' + name);
        return '';
      }
    }
    let val;
    try {
      val = (typeof binding == 'function' ?
        binding.apply(null, args) : binding);
    } catch (e) {
      user.error('Error evaluating replacement: ' + name, e);
      val = '';
    }
    if (opt_collectVars) {
      opt_collectVars[name] = val;
    }
    return this.encodeValue_(val);
  });
  return url;
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
    return this.expand_(url, opt_bindings);
  }

  /**
   * @param {string} url
   * @param {!Object<string, *>=} opt_bindings
   * @param {!Object<string, *>=} opt_collectVars
   * @return {!Promise<string>}
   * @private
   */
  expand_(url, opt_bindings, opt_collectVars) {
    if (!this.initialized_) {
      this.initialize_();
    }
    const expr = this.getExpr_(opt_bindings);
    let replacementPromise;
    url = url.replace(expr, (match, name, opt_strargs) => {
      let args = [];
      if (typeof opt_strargs == 'string') {
        args = opt_strargs.split(',');
      }
      let binding;
      if (opt_bindings && (name in opt_bindings)) {
        binding = opt_bindings[name];
      } else if ((binding = this.getReplacement_(name))) {
        binding = binding.async || binding.sync;
      }
      let val;
      try {
        val = (typeof binding == 'function') ?
            binding.apply(null, args) : binding;
      } catch (e) {
        // Report error, but do not disrupt URL replacement. This will
        // interpolate as the empty string.
        rethrowAsync(e);
      }
      // In case the produced value is a promise, we don't actually
      // replace anything here, but do it again when the promise resolves.
      if (val && val.then) {
        const p = val.catch(err => {
          // Report error, but do not disrupt URL replacement. This will
          // interpolate as the empty string.
          rethrowAsync(err);
        }).then(v => {
          url = url.replace(match, this.encodeValue_(v));
          if (opt_collectVars) {
            opt_collectVars[match] = v;
          }
        });
        if (replacementPromise) {
          replacementPromise = replacementPromise.then(() => p);
        } else {
          replacementPromise = p;
        }
        return match;
      }
      if (opt_collectVars) {
        opt_collectVars[match] = val;
      }
      return this.encodeValue_(val);
    });

    if (replacementPromise) {
      replacementPromise = replacementPromise.then(() => url);
    }

    return replacementPromise || Promise.resolve(url);
  }

  /**
   * Collects all substitutions in the provided URL and expands them to the
   * values for known variables. Optional `opt_bindings` can be used to add
   * new variables or override existing ones.
   * @param {string} url
   * @param {!Object<string, *>=} opt_bindings
   * @return {!Promise<!Object<string, *>>}
   */
  collectVars(url, opt_bindings) {
    const vars = Object.create(null);
    return this.expand_(url, opt_bindings, vars).then(() => vars);
  }

  /**
   * Method exists to assist stubbing in tests.
   * @param {string} name
   * @return {ReplacementDef}
   */
  getReplacement_(name) {
    return this.replacements_[name];
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
    // The keys must be sorted to ensure that the longest keys are considered
    // first. This avoids a problem where a RANDOM conflicts with RANDOM_ONE.
    keys.sort((s1, s2) => s2.length - s1.length);
    const all = keys.join('|');
    // Match the given replacement patterns, as well as optionally
    // arguments to the replacement behind it in parantheses.
    // Example string that match
    // FOO_BAR
    // FOO_BAR(arg1)
    // FOO_BAR(arg1,arg2)
    return new RegExp('\\$?(' + all + ')(?:\\(([0-9a-zA-Z-_.,]+)\\))?', 'g');
  }

  /**
   * Determines the offset of an element's shadowRoot host if it has one.
   * @param {EventTarget} element
   * @return {!{top: number, left: number}}
   * @private
   */
  getShadowHostOffset_(element) {
    if (element) {
      var currElement = element;
      while (currElement && currElement.nodeType != 11) {
        currElement = currElement.parentElement; // 11 = DOC FRAGMENT NODE
      }
      if (currElement && currElement.host) {
        return {top: currElement.host./*REVIEW*/offsetTop,
          left: currElement.host./*REVIEW*/offsetLeft};
      }
    }
    return {top: 0, left: 0};
  }

  /**
   * @param {Event} evt click event
   * @return {string} expanded url from event target href
   * @private
   */
  getExpandAnchorHref_(evt) {
    if (!evt || !evt.target || evt.target.tagName !== 'A') {
      return '';
    }
    const href = evt.target.getAttribute(ORIGINAL_HREF_ATTRIBUTE) ||
        evt.target.getAttribute('href');
    // Ensure href is present and not hash
    if (!href) {
      return '';
    }
    let shadowHostOffset;
    const vars = {
      'CLICK_X': (function() {
        if (evt.clientX === undefined) {
          return '';
        }
        shadowHostOffset =
          shadowHostOffset || this.getShadowHostOffset_(evt.target);
        return evt.clientX - shadowHostOffset.left;
      }).bind(this),
      'CLICK_Y': (function() {
        if (evt.clientY === undefined) {
          return '';
        }
        shadowHostOffset =
          shadowHostOffset || this.getShadowHostOffset_(evt.target);
        return evt.clientY - shadowHostOffset.top;
      }).bind(this),
    };
    return this.expandSync(href, vars);
  }
}

/**
 * @param {!Window} window
 * @return {!UrlReplacements}
 */
export function installUrlReplacementsService(window) {
  return getService(window, 'url-replace', () => {
    return new UrlReplacements(window);
  });
};
