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
import {shareTrackingForOrNull} from '../share-tracking-service';
import {dev, user, rethrowAsync} from '../log';
import {documentInfoForDoc} from '../document-info';
import {whenDocumentComplete} from '../document-ready';
import {fromClassForDoc, installServiceInEmbedScope} from '../service';
import {isFiniteNumber} from '../types';
import {parseUrl, removeFragment, parseQueryString} from '../url';
import {viewerForDoc} from '../viewer';
import {viewportForDoc} from '../viewport';
import {userNotificationManagerFor} from '../user-notification';
import {activityFor} from '../activity';
import {isExperimentOn} from '../experiments';
import {getTrackImpressionPromise} from '../impression.js';


/** @private @const {string} */
const TAG = 'UrlReplacements';
const EXPERIMENT_DELIMITER = '!';
const VARIANT_DELIMITER = '.';
const ORIGINAL_HREF_PROPERTY = 'amp-original-href';

/** @typedef {string|number|boolean|undefined|null} */
let ResolverReturnDef;

/** @typedef {function(...*):ResolverReturnDef} */
let SyncResolverDef;

/** @typedef {function(...*):!Promise<ResolverReturnDef>} */
let AsyncResolverDef;

/** @typedef {{sync: SyncResolverDef, async: AsyncResolverDef}} */
let ReplacementDef;

/**
 * Returns a encoded URI Component, or an empty string if the value is nullish.
 * @param {*} val
 * @return {string}
 */
function encodeValue(val) {
  if (val == null) {
    return '';
  }
  return encodeURIComponent(/** @type {string} */(val));
};

/**
 * This class replaces substitution variables with their values.
 * Document new values in ../spec/amp-var-substitutions.md
 * @package For export.
 */
export class UrlReplacements {
  /** @param {!./ampdoc-impl.AmpDoc} ampdoc */
  constructor(ampdoc) {
    /** @const {!./ampdoc-impl.AmpDoc} */
    this.ampdoc = ampdoc;

    /** @private {!RegExp|undefined} */
    this.replacementExpr_ = undefined;

    /** @private @const {!Object<string, !ReplacementDef>} */
    this.replacements_ = this.ampdoc.win.Object.create(null);

    /** @private @const {function(!Window):!Promise<?AccessService>} */
    this.getAccessService_ = accessServiceForOrNull;

    /** @private @const {!Promise<?Object<string, string>>} */
    this.variants_ = variantForOrNull(this.ampdoc.win);

    /**
     * @private @const {
     *   !Promise<(?{incomingFragment: string, outgoingFragment: string})>}
     */
    this.shareTrackingFragments_ = shareTrackingForOrNull(this.ampdoc.win);

    /** @private {boolean} */
    this.initialized_ = false;
  }

  /**
   * Lazily initialize the default replacements.
   */
  initialize_() {
    this.initialized_ = true;

    /** @const {!./viewport-impl.Viewport} */
    const viewport = viewportForDoc(this.ampdoc);

    // Returns a random value for cache busters.
    this.set_('RANDOM', () => {
      return Math.random();
    });

    // Returns the canonical URL for this AMP document.
    this.set_('CANONICAL_URL', this.getDocInfoValue_.bind(this, info => {
      return info.canonicalUrl;
    }));

    // Returns the host of the canonical URL for this AMP document.
    this.set_('CANONICAL_HOST', this.getDocInfoValue_.bind(this, info => {
      const url = parseUrl(info.canonicalUrl);
      return url && url.host;
    }));

    // Returns the hostname of the canonical URL for this AMP document.
    this.set_('CANONICAL_HOSTNAME', this.getDocInfoValue_.bind(this, info => {
      const url = parseUrl(info.canonicalUrl);
      return url && url.hostname;
    }));

    // Returns the path of the canonical URL for this AMP document.
    this.set_('CANONICAL_PATH', this.getDocInfoValue_.bind(this, info => {
      const url = parseUrl(info.canonicalUrl);
      return url && url.pathname;
    }));

    // Returns the referrer URL.
    this.setAsync_('DOCUMENT_REFERRER', /** @type {AsyncResolverDef} */(() => {
      return viewerForDoc(this.ampdoc).getReferrerUrl();
    }));

    // Returns the title of this AMP document.
    this.set_('TITLE', () => {
      return this.ampdoc.win.document.title;
    });

    // Returns the URL for this AMP document.
    this.set_('AMPDOC_URL', () => {
      return removeFragment(this.ampdoc.win.location.href);
    });

    // Returns the host of the URL for this AMP document.
    this.set_('AMPDOC_HOST', () => {
      const url = parseUrl(this.ampdoc.win.location.href);
      return url && url.host;
    });

    // Returns the hostname of the URL for this AMP document.
    this.set_('AMPDOC_HOSTNAME', () => {
      const url = parseUrl(this.ampdoc.win.location.href);
      return url && url.hostname;
    });

    // Returns the Source URL for this AMP document.
    this.set_('SOURCE_URL', this.getDocInfoValue_.bind(this, info => {
      return removeFragment(info.sourceUrl);
    }));

    this.setAsync_('SOURCE_URL', () => {
      return getTrackImpressionPromise().then(() => {
        return this.getDocInfoValue_(info => {
          return removeFragment(info.sourceUrl);
        });
      });
    });

    // Returns the host of the Source URL for this AMP document.
    this.set_('SOURCE_HOST', this.getDocInfoValue_.bind(this, info => {
      return parseUrl(info.sourceUrl).host;
    }));

    // Returns the hostname of the Source URL for this AMP document.
    this.set_('SOURCE_HOSTNAME', this.getDocInfoValue_.bind(this, info => {
      return parseUrl(info.sourceUrl).hostname;
    }));

    // Returns the path of the Source URL for this AMP document.
    this.set_('SOURCE_PATH', this.getDocInfoValue_.bind(this, info => {
      return parseUrl(info.sourceUrl).pathname;
    }));

    // Returns a random string that will be the constant for the duration of
    // single page view. It should have sufficient entropy to be unique for
    // all the page views a single user is making at a time.
    this.set_('PAGE_VIEW_ID', this.getDocInfoValue_.bind(this, info => {
      return info.pageViewId;
    }));

    this.set_('QUERY_PARAM', (param, defaultValue = '') => {
      return this.getQueryParamData_(param, defaultValue);
    });

    this.setAsync_('QUERY_PARAM', (param, defaultValue = '') => {
      return getTrackImpressionPromise().then(() => {
        return this.getQueryParamData_(param, defaultValue);
      });
    });

    /**
     * Stores client ids that were generated during this page view
     * indexed by scope.
     * @type {?Object<string, string>}
     */
    let clientIds = null;
    this.setAsync_('CLIENT_ID', (scope, opt_userNotificationId) => {
      user().assertString(scope,
          'The first argument to CLIENT_ID, the fallback c' +
          /*OK*/'ookie name, is required');
      let consent = Promise.resolve();

      // If no `opt_userNotificationId` argument is provided then
      // assume consent is given by default.
      if (opt_userNotificationId) {
        consent = userNotificationManagerFor(this.ampdoc.win).then(service => {
          return service.get(opt_userNotificationId);
        });
      }
      return cidFor(this.ampdoc.win).then(cid => {
        return cid.get({
          scope: dev().assertString(scope),
          createCookieIfNotPresent: true,
        }, consent);
      }).then(cid => {
        if (!clientIds) {
          clientIds = Object.create(null);
        }
        clientIds[scope] = cid;
        return cid;
      });
    });
    // Synchronous alternative. Only works for scopes that were previously
    // requested using the async method.
    this.set_('CLIENT_ID', scope => {
      if (!clientIds) {
        return null;
      }
      return clientIds[dev().assertString(scope)];
    });

    // Returns assigned variant name for the given experiment.
    this.setAsync_('VARIANT', experiment => {
      return this.variants_.then(variants => {
        user().assert(variants,
            'To use variable VARIANT, amp-experiment should be configured');
        const variant = variants[/** @type {string} */(experiment)];
        user().assert(variant !== undefined,
            'The value passed to VARIANT() is not a valid experiment name:' +
                experiment);
        // When no variant assigned, use reserved keyword 'none'.
        return variant === null ? 'none' : /** @type {string} */(variant);
      });
    });

    // Returns all assigned experiment variants in a serialized form.
    this.setAsync_('VARIANTS', () => {
      return this.variants_.then(variants => {
        user().assert(variants,
            'To use variable VARIANTS, amp-experiment should be configured');

        const experiments = [];
        for (const experiment in variants) {
          const variant = variants[experiment];
          experiments.push(
              experiment + VARIANT_DELIMITER + (variant || 'none'));
        }

        return experiments.join(EXPERIMENT_DELIMITER);
      });
    });

    // Returns incoming share tracking fragment.
    this.setAsync_('SHARE_TRACKING_INCOMING', () => {
      return this.shareTrackingFragments_.then(fragments => {
        user().assert(fragments, 'To use variable SHARE_TRACKING_INCOMING, ' +
            'amp-share-tracking should be configured');
        return fragments.incomingFragment;
      });
    });

    // Returns outgoing share tracking fragment.
    this.setAsync_('SHARE_TRACKING_OUTGOING', () => {
      return this.shareTrackingFragments_.then(fragments => {
        user().assert(fragments, 'To use variable SHARE_TRACKING_OUTGOING, ' +
            'amp-share-tracking should be configured');
        return fragments.outgoingFragment;
      });
    });

    // Returns the number of milliseconds since 1 Jan 1970 00:00:00 UTC.
    this.set_('TIMESTAMP', () => {
      return Date.now();
    });

    // Returns the user's time-zone offset from UTC, in minutes.
    this.set_('TIMEZONE', () => {
      return new Date().getTimezoneOffset();
    });

    // Returns a promise resolving to viewport.getScrollTop.
    this.set_('SCROLL_TOP', () => viewport.getScrollTop());

    // Returns a promise resolving to viewport.getScrollLeft.
    this.set_('SCROLL_LEFT', () => viewport.getScrollLeft());

    // Returns a promise resolving to viewport.getScrollHeight.
    this.set_('SCROLL_HEIGHT', () => viewport.getScrollHeight());

    // Returns a promise resolving to viewport.getScrollWidth.
    this.set_('SCROLL_WIDTH', () => viewport.getScrollWidth());

    // Returns the viewport height.
    this.set_('VIEWPORT_HEIGHT', () => viewport.getSize().height);

    // Returns the viewport width.
    this.set_('VIEWPORT_WIDTH', () => viewport.getSize().width);

    // Returns screen.width.
    this.set_('SCREEN_WIDTH', () => this.ampdoc.win.screen.width);

    // Returns screen.height.
    this.set_('SCREEN_HEIGHT', () => this.ampdoc.win.screen.height);

    // Returns screen.availHeight.
    this.set_('AVAILABLE_SCREEN_HEIGHT',
        () => this.ampdoc.win.screen.availHeight);

    // Returns screen.availWidth.
    this.set_('AVAILABLE_SCREEN_WIDTH',
        () => this.ampdoc.win.screen.availWidth);

    // Returns screen.ColorDepth.
    this.set_('SCREEN_COLOR_DEPTH',
        () => this.ampdoc.win.screen.colorDepth);

    // Returns document characterset.
    this.set_('DOCUMENT_CHARSET', () => {
      const doc = this.ampdoc.win.document;
      return doc.characterSet || doc.charset;
    });

    // Returns the browser language.
    this.set_('BROWSER_LANGUAGE', () => {
      const nav = this.ampdoc.win.navigator;
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
    this.setTimingResolver_(
      'TCP_CONNECT_TIME', 'connectStart', 'connectEnd');

    // Returns the time it took for server to start sending a response to the
    // request.
    this.setTimingResolver_(
      'SERVER_RESPONSE_TIME', 'requestStart', 'responseStart');

    // Returns the time it took to download the page.
    this.setTimingResolver_(
      'PAGE_DOWNLOAD_TIME', 'responseStart', 'responseEnd');

    // Returns the time it took for redirects to complete.
    this.setTimingResolver_(
      'REDIRECT_TIME', 'navigationStart', 'fetchStart');

    // Returns the time it took for DOM to become interactive.
    this.setTimingResolver_(
      'DOM_INTERACTIVE_TIME', 'navigationStart', 'domInteractive');

    // Returns the time it took for content to load.
    this.setTimingResolver_(
      'CONTENT_LOAD_TIME', 'navigationStart', 'domContentLoadedEventStart');

    // Access: Reader ID.
    this.setAsync_('ACCESS_READER_ID', /** @type {AsyncResolverDef} */(() => {
      return this.getAccessValue_(accessService => {
        return accessService.getAccessReaderId();
      }, 'ACCESS_READER_ID');
    }));

    // Access: data from the authorization response.
    this.setAsync_('AUTHDATA', /** @type {AsyncResolverDef} */(field => {
      user().assert(field,
          'The first argument to AUTHDATA, the field, is required');
      return this.getAccessValue_(accessService => {
        return accessService.getAuthdataField(field);
      }, 'AUTHDATA');
    }));

    // Returns an identifier for the viewer.
    this.setAsync_('VIEWER', () => {
      return viewerForDoc(this.ampdoc).getViewerOrigin().then(viewer => {
        return viewer == undefined ? '' : viewer;
      });
    });

    // Returns the total engaged time since the content became viewable.
    this.setAsync_('TOTAL_ENGAGED_TIME', () => {
      return activityFor(this.ampdoc.win).then(activity => {
        return activity.getTotalEngagedTime();
      });
    });

    this.set_('NAV_TIMING', (startAttribute, endAttribute) => {
      user().assert(startAttribute, 'The first argument to NAV_TIMING, the ' +
          'start attribute name, is required');
      return this.getTimingDataSync_(/**@type {string}*/(startAttribute),
          /**@type {string}*/(endAttribute));
    });
    this.setAsync_('NAV_TIMING', (startAttribute, endAttribute) => {
      user().assert(startAttribute, 'The first argument to NAV_TIMING, the ' +
          'start attribute name, is required');
      return this.getTimingDataAsync_(/**@type {string}*/(startAttribute),
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

    this.set_('BACKGROUND_STATE', () => {
      return viewerForDoc(this.ampdoc.win.document).isVisible() ? '0' : '1';
    });
  }

  /**
   * Resolves the value via document info.
   * @param {function(!./document-info-impl.DocumentInfoDef):T} getter
   * @return {T}
   * @template T
   */
  getDocInfoValue_(getter) {
    return getter(documentInfoForDoc(this.ampdoc));
  }

  /**
   * Resolves the value via access service. If access service is not configured,
   * the resulting value is `null`.
   * @param {function(!AccessService):(T|!Promise<T>)} getter
   * @param {string} expr
   * @return {T|null}
   * @template T
   */
  getAccessValue_(getter, expr) {
    return this.getAccessService_(this.ampdoc.win).then(accessService => {
      if (!accessService) {
        // Access service is not installed.
        user().error(TAG, 'Access service is not installed to access: ', expr);
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
   * @return {!Promise<ResolverReturnDef>}
   * @private
   */
  getTimingDataAsync_(startEvent, endEvent) {
    const metric = this.getTimingDataSync_(startEvent, endEvent);
    if (metric === '') {
      // Metric is not yet available. Retry after a delay.
      return whenDocumentComplete(this.ampdoc.win.document).then(() => {
        return this.getTimingDataSync_(startEvent, endEvent);
      });
    }
    return Promise.resolve(metric);
  }

  /**
   * Returns navigation timing information based on the start and end events.
   * The data for the timing events is retrieved from performance.timing API.
   * If start and end events are both given, the result is the difference between the two.
   * If only start event is given, the result is the timing value at start event.
   * Enforces synchronous evaluation.
   * @param {string} startEvent
   * @param {string=} endEvent
   * @return {ResolverReturnDef} undefined if API is not available, empty string
   *    if it is not yet available, or value as string
   */
  getTimingDataSync_(startEvent, endEvent) {
    const win = this.ampdoc.win;
    const timingInfo = win['performance'] && win['performance']['timing'];
    if (!timingInfo || timingInfo['navigationStart'] == 0) {
      // Navigation timing API is not supported.
      return;
    }

    const metric = (endEvent === undefined)
        ? timingInfo[startEvent]
        : timingInfo[endEvent] - timingInfo[startEvent];

    if (!isFiniteNumber(metric)) {
      // The metric is not supported.
      return;
    } else if (metric < 0) {;
      return '';
    } else {
      return metric;
    }
  }

  /**
   * Returns navigation information from the current browsing context.
   * @param {string} attribute
   * @return {ResolverReturnDef}
   * @private
   */
  getNavigationData_(attribute) {
    const win = this.ampdoc.win;
    const navigationInfo = win['performance']
        && win['performance']['navigation'];
    if (!navigationInfo || navigationInfo[attribute] === undefined) {
      // PerformanceNavigation interface is not supported or attribute is not implemented.
      return;
    }

    return navigationInfo[attribute];
  }

  /**
   * Return the QUERY_PARAM from the current location href
   * @param {*} param
   * @param {string} defaultValue
   * @return {string}
   */
  getQueryParamData_(param, defaultValue) {
    user().assert(param,
        'The first argument to QUERY_PARAM, the query string ' +
        'param is required');
    user().assert(typeof param == 'string', 'param should be a string');
    const url = parseUrl(this.ampdoc.win.location.href);
    const params = parseQueryString(url.search);
    return (typeof params[param] !== 'undefined')
        ? params[param] : defaultValue;
  }

  /**
   *
   * Sets a synchronous value resolver for the variable with the specified name.
   * The value resolver may optionally take an extra parameter.
   * Can be called in conjuction with setAsync to allow for additional
   * asynchronous resolver where expand will use async and expandSync the sync
   * version.
   * @param {string} varName
   * @param {!SyncResolverDef} syncResolver
   * @return {!UrlReplacements}
   * @private
   */
  set_(varName, syncResolver) {
    dev().assert(varName.indexOf('RETURN') == -1);
    this.replacements_[varName] =
        this.replacements_[varName] || {sync: undefined, async: undefined};
    this.replacements_[varName].sync = syncResolver;
    this.replacementExpr_ = undefined;
    return this;
  }

  /**
   * Sets an async value resolver for the variable with the specified name.
   * The value resolver may optionally take an extra parameter.
   * Can be called in conjuction with setAsync to allow for additional
   * asynchronous resolver where expand will use async and expandSync the sync
   * version.
   * @param {string} varName
   * @param {!AsyncResolverDef} asyncResolver
   * @return {!UrlReplacements}
   * @private
   */
  setAsync_(varName, asyncResolver) {
    dev().assert(varName.indexOf('RETURN') == -1);
    this.replacements_[varName] =
        this.replacements_[varName] || {sync: undefined, async: undefined};
    this.replacements_[varName].async = asyncResolver;
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
    }).setAsync_(varName, () => {
      return this.getTimingDataAsync_(startEvent, endEvent);
    });
  }

  /**
   * Synchronously expands the provided URL by replacing all known variables with
   * their resolved values. Optional `opt_bindings` can be used to add new
   * variables or override existing ones.  Any async bindings are ignored.
   * @param {string} url
   * @param {!Object<string, (ResolverReturnDef|!SyncResolverDef)>=} opt_bindings
   * @param {!Object<string, ResolverReturnDef>=} opt_collectVars
   * @param {!Object<string, boolean>=} opt_whiteList Optional white list of names
   *     that can be substituted.
   * @return {string}
   */
  expandSync(url, opt_bindings, opt_collectVars, opt_whiteList) {
    return /** @type {string} */(
        this.expand_(url, opt_bindings, opt_collectVars, /* opt_sync */ true,
            opt_whiteList));
  }

  /**
   * Expands the provided URL by replacing all known variables with their
   * resolved values. Optional `opt_bindings` can be used to add new variables
   * or override existing ones.
   * @param {string} url
   * @param {!Object<string, *>=} opt_bindings
   * @return {!Promise<string>}
   */
  expandAsync(url, opt_bindings) {
    return /** @type {!Promise<string>} */(this.expand_(url, opt_bindings));
  }

  /**
   * Replaces values in the link of an anchor tag if
   * - the link opts into it (via data-amp-replace argument)
   * - the destination is the source or canonical origin of this doc.
   * @param {!Element} element An anchor element.
   * @return {string|undefined} Replaced string for testing
   */
  maybeExpandLink(element) {
    if (!isExperimentOn(this.ampdoc.win, 'link-url-replace')) {
      return;
    }
    dev().assert(element.tagName == 'A');
    const whitelist = element.getAttribute('data-amp-replace');
    if (!whitelist) {
      return;
    }
    const docInfo = documentInfoForDoc(this.ampdoc);
    // ORIGINAL_HREF_PROPERTY has the value of the href "pre-replacement".
    // We set this to the original value before doing any work and use it
    // on subsequent replacements, so that each run gets a fresh value.
    const href = dev().assertString(
        element[ORIGINAL_HREF_PROPERTY] || element.getAttribute('href'));
    const url = parseUrl(href);
    if (url.origin != parseUrl(docInfo.canonicalUrl).origin &&
        url.origin != parseUrl(docInfo.sourceUrl).origin) {
      user().warn('URL', 'Ignoring link replacement', href,
          ' because the link does not go to the document\'s' +
          ' source or canonical origin.');
      return;
    }
    if (element[ORIGINAL_HREF_PROPERTY] == null) {
      element[ORIGINAL_HREF_PROPERTY] = href;
    }
    const supportedReplacements = {
      'CLIENT_ID': true,
      'QUERY_PARAM': true,
    };
    const requestedReplacements = {};
    whitelist.trim().split(/\s*,\s*/).forEach(replacement => {
      if (supportedReplacements.hasOwnProperty(replacement)) {
        requestedReplacements[replacement] = true;
      } else {
        user().warn('URL', 'Ignoring unsupported link replacement',
            replacement);
      }
    });
    return element.href = this.expandSync(
        href,
        /* opt_bindings */ undefined,
        /* opt_collectVars */ undefined,
        requestedReplacements);
  }

  /**
   * @param {string} url
   * @param {!Object<string, *>=} opt_bindings
   * @param {!Object<string, *>=} opt_collectVars
   * @param {boolean=} opt_sync
   * @param {!Object<string, boolean>=} opt_whiteList Optional white list of names
   *     that can be substituted.
   * @return {!Promise<string>|string}
   * @private
   */
  expand_(url, opt_bindings, opt_collectVars, opt_sync, opt_whiteList) {
    if (!this.initialized_) {
      this.initialize_();
    }
    const expr = this.getExpr_(opt_bindings);
    let replacementPromise;
    let replacement = url.replace(expr, (match, name, opt_strargs) => {
      let args = [];
      if (typeof opt_strargs == 'string') {
        args = opt_strargs.split(',');
      }
      if (opt_whiteList && !opt_whiteList[name]) {
        // Do not perform substitution and just return back the original
        // match, so that the string doesn't change.
        return match;
      }
      let binding;
      if (opt_bindings && (name in opt_bindings)) {
        binding = opt_bindings[name];
      } else if ((binding = this.getReplacement_(name))) {
        if (opt_sync) {
          binding = binding.sync;
          if (!binding) {
            user().error(TAG, 'ignoring async replacement key: ', name);
            return '';
          }
        } else {
          binding = binding.async || binding.sync;
        }
      }
      let val;
      try {
        val = (typeof binding == 'function') ?
            binding.apply(null, args) : binding;
      } catch (e) {
        // Report error, but do not disrupt URL replacement. This will
        // interpolate as the empty string.
        if (opt_sync) {
          val = '';
        }
        rethrowAsync(e);
      }
      // In case the produced value is a promise, we don't actually
      // replace anything here, but do it again when the promise resolves.
      if (val && val.then) {
        if (opt_sync) {
          user().error(TAG, 'ignoring promise value for key: ', name);
          return '';
        }
        /** @const {Promise<string>} */
        const p = val.catch(err => {
          // Report error, but do not disrupt URL replacement. This will
          // interpolate as the empty string.
          rethrowAsync(err);
        }).then(v => {
          replacement = replacement.replace(match, encodeValue(v));
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
      return encodeValue(val);
    });

    if (replacementPromise) {
      replacementPromise = replacementPromise.then(() => replacement);
    }

    if (opt_sync) {
      return this.ensureProtocolMatches_(url, replacement);
    }
    return (replacementPromise || Promise.resolve(replacement))
        .then(replacement => this.ensureProtocolMatches_(url, replacement));
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
   * @return {!ReplacementDef}
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
        if (this.replacements_[key] === undefined) {
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
   * Ensures that the protocol of the original url matches the protocol of the
   * replacement url. Returns the replacement if they do, the original if they
   * do not.
   * @param {string} url
   * @param {string} replacement
   * @return {string}
   */
  ensureProtocolMatches_(url, replacement) {
    const newProtocol = parseUrl(replacement, /* opt_nocache */ true).protocol;
    const oldProtocol = parseUrl(url, /* opt_nocache */ true).protocol;
    if (newProtocol != oldProtocol) {
      user().error(TAG, 'Illegal replacement of the protocol: ', url);
      return url;
    }
    user().assert(newProtocol !== `javascript:`, 'Illegal javascript link ' +
        'protocol: %s', url);

    return replacement;
  }
}


/**
 * @param {!./ampdoc-impl.AmpDoc} ampdoc
 * @return {!UrlReplacements}
 */
export function installUrlReplacementsServiceForDoc(ampdoc) {
  return fromClassForDoc(ampdoc, 'url-replace', UrlReplacements);
}


/**
 * @param {!Window} embedWin
 * @param {*} varSource
 */
export function installUrlReplacementsForEmbed(embedWin, varSource) {
  // TODO(avimehta): Implement.
  installServiceInEmbedScope(embedWin, 'url-replace', {varSource});
}
