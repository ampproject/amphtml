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

import {accessServiceForDocOrNull} from '../services';
import {cidForDoc} from '../services';
import {variantForOrNull} from '../services';
import {shareTrackingForOrNull} from '../services';
import {dev, user, rethrowAsync} from '../log';
import {documentInfoForDoc} from '../services';
import {
  installServiceInEmbedScope,
  registerServiceBuilderForDoc,
} from '../service';
import {isSecureUrl, parseUrl, removeFragment, parseQueryString} from '../url';
import {viewerForDoc} from '../services';
import {viewportForDoc} from '../services';
import {userNotificationManagerFor} from '../services';
import {activityForDoc} from '../services';
import {getTrackImpressionPromise} from '../impression.js';
import {
  VariableSource,
  AsyncResolverDef,
  ResolverReturnDef,
  SyncResolverDef,
  getNavigationData,
  getTimingDataSync,
  getTimingDataAsync,
} from './variable-source';


/** @private @const {string} */
const TAG = 'UrlReplacements';
const EXPERIMENT_DELIMITER = '!';
const VARIANT_DELIMITER = '.';
const ORIGINAL_HREF_PROPERTY = 'amp-original-href';
const ORIGINAL_VALUE_PROPERTY = 'amp-original-value';

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
 * Class to provide variables that pertain to top level AMP window.
 */
export class GlobalVariableSource extends VariableSource {

  constructor(ampdoc) {
    super();

    /** @const {!./ampdoc-impl.AmpDoc} */
    this.ampdoc = ampdoc;

    /**
     * @private
     * @const {function(!./ampdoc-impl.AmpDoc):!Promise<?AccessService>}
     */
    this.getAccessService_ = accessServiceForDocOrNull;

    /** @private {?Promise<?Object<string, string>>} */
    this.variants_ = null;

    /** @private {?Promise<?ShareTrackingFragmentsDef>} */
    this.shareTrackingFragments_ = null;
  }

  /**
   * Utility function for setting resolver for timing data that supports
   * sync and async.
   * @param {string} varName
   * @param {string} startEvent
   * @param {string=} endEvent
   * @return {!VariableSource}
   * @private
   */
  setTimingResolver_(varName, startEvent, endEvent) {
    return this.setBoth(varName, () => {
      return getTimingDataSync(this.ampdoc.win, startEvent, endEvent);
    }, () => {
      return getTimingDataAsync(this.ampdoc.win, startEvent, endEvent);
    });
  }

  /** @override */
  initialize() {

    /** @const {!./viewport-impl.Viewport} */
    const viewport = viewportForDoc(this.ampdoc);

    // Returns a random value for cache busters.
    this.set('RANDOM', () => {
      return Math.random();
    });

    // Provides a counter starting at 1 per given scope.
    let counterStore = null;
    this.set('COUNTER', scope => {
      if (!counterStore) {
        counterStore = Object.create(null);
      }
      if (!counterStore[scope]) {
        counterStore[scope] = 0;
      }
      return ++counterStore[scope];
    });

    // Returns the canonical URL for this AMP document.
    this.set('CANONICAL_URL', this.getDocInfoValue_.bind(this, info => {
      return info.canonicalUrl;
    }));

    // Returns the host of the canonical URL for this AMP document.
    this.set('CANONICAL_HOST', this.getDocInfoValue_.bind(this, info => {
      const url = parseUrl(info.canonicalUrl);
      return url && url.host;
    }));

    // Returns the hostname of the canonical URL for this AMP document.
    this.set('CANONICAL_HOSTNAME', this.getDocInfoValue_.bind(this, info => {
      const url = parseUrl(info.canonicalUrl);
      return url && url.hostname;
    }));

    // Returns the path of the canonical URL for this AMP document.
    this.set('CANONICAL_PATH', this.getDocInfoValue_.bind(this, info => {
      const url = parseUrl(info.canonicalUrl);
      return url && url.pathname;
    }));

    // Returns the referrer URL.
    this.setAsync('DOCUMENT_REFERRER', /** @type {AsyncResolverDef} */(() => {
      return viewerForDoc(this.ampdoc).getReferrerUrl();
    }));

    // Returns the title of this AMP document.
    this.set('TITLE', () => {
      return this.ampdoc.win.document.title;
    });

    // Returns the URL for this AMP document.
    this.set('AMPDOC_URL', () => {
      return removeFragment(this.ampdoc.win.location.href);
    });

    // Returns the host of the URL for this AMP document.
    this.set('AMPDOC_HOST', () => {
      const url = parseUrl(this.ampdoc.win.location.href);
      return url && url.host;
    });

    // Returns the hostname of the URL for this AMP document.
    this.set('AMPDOC_HOSTNAME', () => {
      const url = parseUrl(this.ampdoc.win.location.href);
      return url && url.hostname;
    });

    // Returns the Source URL for this AMP document.
    this.setBoth('SOURCE_URL', this.getDocInfoValue_.bind(this, info => {
      return removeFragment(info.sourceUrl);
    }), () => {
      return getTrackImpressionPromise().then(() => {
        return this.getDocInfoValue_(info => {
          return removeFragment(info.sourceUrl);
        });
      });
    });

    // Returns the host of the Source URL for this AMP document.
    this.set('SOURCE_HOST', this.getDocInfoValue_.bind(this, info => {
      return parseUrl(info.sourceUrl).host;
    }));

    // Returns the hostname of the Source URL for this AMP document.
    this.set('SOURCE_HOSTNAME', this.getDocInfoValue_.bind(this, info => {
      return parseUrl(info.sourceUrl).hostname;
    }));

    // Returns the path of the Source URL for this AMP document.
    this.set('SOURCE_PATH', this.getDocInfoValue_.bind(this, info => {
      return parseUrl(info.sourceUrl).pathname;
    }));

    // Returns a random string that will be the constant for the duration of
    // single page view. It should have sufficient entropy to be unique for
    // all the page views a single user is making at a time.
    this.set('PAGE_VIEW_ID', this.getDocInfoValue_.bind(this, info => {
      return info.pageViewId;
    }));

    this.setBoth('QUERY_PARAM', (param, defaultValue = '') => {
      return this.getQueryParamData_(param, defaultValue);
    }, (param, defaultValue = '') => {
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
    // Synchronous alternative. Only works for scopes that were previously
    // requested using the async method.
    this.setBoth('CLIENT_ID', scope => {
      if (!clientIds) {
        return null;
      }
      return clientIds[dev().assertString(scope)];
    }, (scope, opt_userNotificationId) => {
      user().assertString(scope,
            'The first argument to CLIENT_ID, the fallback c' +
            /*OK*/'ookie name, is required');
      let consent = Promise.resolve();

        // If no `opt_userNotificationId` argument is provided then
        // assume consent is given by default.
      if (opt_userNotificationId) {
        consent = userNotificationManagerFor(this.ampdoc.win)
              .then(service => {
                return service.get(opt_userNotificationId);
              });
      }
      return cidForDoc(this.ampdoc).then(cid => {
        return cid.get({
          scope: dev().assertString(scope),
          createCookieIfNotPresent: true,
        }, consent);
      }).then(cid => {
        if (!clientIds) {
          clientIds = Object.create(null);
        }

        // A temporary work around to extract Client ID from _ga cookie. #5761
        // TODO: replace with "filter" when it's in place. #2198
        if (scope == '_ga') {
          cid = extractClientIdFromGaCookie(cid);
        }

        clientIds[scope] = cid;
        return cid;
      });
    });

    // Returns assigned variant name for the given experiment.
    this.setAsync('VARIANT', /** @type {AsyncResolverDef} */(experiment => {
      return this.getVairiantsValue_(variants => {
        const variant = variants[/** @type {string} */(experiment)];
        user().assert(variant !== undefined,
            'The value passed to VARIANT() is not a valid experiment name:' +
                experiment);
        // When no variant assigned, use reserved keyword 'none'.
        return variant === null ? 'none' : /** @type {string} */(variant);
      }, 'VARIANT');
    }));

    // Returns all assigned experiment variants in a serialized form.
    this.setAsync('VARIANTS', /** @type {AsyncResolverDef} */(() => {
      return this.getVairiantsValue_(variants => {
        const experiments = [];
        for (const experiment in variants) {
          const variant = variants[experiment];
          experiments.push(
              experiment + VARIANT_DELIMITER + (variant || 'none'));
        }
        return experiments.join(EXPERIMENT_DELIMITER);
      }, 'VARIANTS');
    }));

    // Returns incoming share tracking fragment.
    this.setAsync('SHARE_TRACKING_INCOMING', /** @type {AsyncResolverDef} */(
        () => {
          return this.getShareTrackingValue_(fragments => {
            return fragments.incomingFragment;
          }, 'SHARE_TRACKING_INCOMING');
        }));

    // Returns outgoing share tracking fragment.
    this.setAsync('SHARE_TRACKING_OUTGOING', /** @type {AsyncResolverDef} */(
        () => {
          return this.getShareTrackingValue_(fragments => {
            return fragments.outgoingFragment;
          }, 'SHARE_TRACKING_OUTGOING');
        }));

    // Returns the number of milliseconds since 1 Jan 1970 00:00:00 UTC.
    this.set('TIMESTAMP', () => {
      return Date.now();
    });

    // Returns the user's time-zone offset from UTC, in minutes.
    this.set('TIMEZONE', () => {
      return new Date().getTimezoneOffset();
    });

    // Returns a promise resolving to viewport.getScrollTop.
    this.set('SCROLL_TOP', () => viewport.getScrollTop());

    // Returns a promise resolving to viewport.getScrollLeft.
    this.set('SCROLL_LEFT', () => viewport.getScrollLeft());

    // Returns a promise resolving to viewport.getScrollHeight.
    this.set('SCROLL_HEIGHT', () => viewport.getScrollHeight());

    // Returns a promise resolving to viewport.getScrollWidth.
    this.set('SCROLL_WIDTH', () => viewport.getScrollWidth());

    // Returns the viewport height.
    this.set('VIEWPORT_HEIGHT', () => viewport.getSize().height);

    // Returns the viewport width.
    this.set('VIEWPORT_WIDTH', () => viewport.getSize().width);

    // Returns screen.width.
    this.set('SCREEN_WIDTH', () => this.ampdoc.win.screen.width);

    // Returns screen.height.
    this.set('SCREEN_HEIGHT', () => this.ampdoc.win.screen.height);

    // Returns screen.availHeight.
    this.set('AVAILABLE_SCREEN_HEIGHT',
        () => this.ampdoc.win.screen.availHeight);

    // Returns screen.availWidth.
    this.set('AVAILABLE_SCREEN_WIDTH',
        () => this.ampdoc.win.screen.availWidth);

    // Returns screen.ColorDepth.
    this.set('SCREEN_COLOR_DEPTH',
        () => this.ampdoc.win.screen.colorDepth);

    // Returns document characterset.
    this.set('DOCUMENT_CHARSET', () => {
      const doc = this.ampdoc.win.document;
      return doc.characterSet || doc.charset;
    });

    // Returns the browser language.
    this.set('BROWSER_LANGUAGE', () => {
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

    // Returns the time it took to connect to the server.
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
    this.setAsync('ACCESS_READER_ID', /** @type {AsyncResolverDef} */(() => {
      return this.getAccessValue_(accessService => {
        return accessService.getAccessReaderId();
      }, 'ACCESS_READER_ID');
    }));

    // Access: data from the authorization response.
    this.setAsync('AUTHDATA', /** @type {AsyncResolverDef} */(field => {
      user().assert(field,
          'The first argument to AUTHDATA, the field, is required');
      return this.getAccessValue_(accessService => {
        return accessService.getAuthdataField(field);
      }, 'AUTHDATA');
    }));

    // Returns an identifier for the viewer.
    this.setAsync('VIEWER', () => {
      return viewerForDoc(this.ampdoc).getViewerOrigin().then(viewer => {
        return viewer == undefined ? '' : viewer;
      });
    });

    // Returns the total engaged time since the content became viewable.
    this.setAsync('TOTAL_ENGAGED_TIME', () => {
      return activityForDoc(this.ampdoc).then(activity => {
        return activity.getTotalEngagedTime();
      });
    });

    this.set('NAV_TIMING', (startAttribute, endAttribute) => {
      user().assert(startAttribute, 'The first argument to NAV_TIMING, the ' +
          'start attribute name, is required');
      return getTimingDataSync(
          this.ampdoc.win,
          /**@type {string}*/(startAttribute),
          /**@type {string}*/(endAttribute));
    });
    this.setAsync('NAV_TIMING', (startAttribute, endAttribute) => {
      user().assert(startAttribute, 'The first argument to NAV_TIMING, the ' +
          'start attribute name, is required');
      return getTimingDataAsync(
          this.ampdoc.win,
          /**@type {string}*/(startAttribute),
          /**@type {string}*/(endAttribute));
    });

    this.set('NAV_TYPE', () => {
      return getNavigationData(this.ampdoc.win, 'type');
    });

    this.set('NAV_REDIRECT_COUNT', () => {
      return getNavigationData(this.ampdoc.win, 'redirectCount');
    });

    // returns the AMP version number
    this.set('AMP_VERSION', () => '$internalRuntimeVersion$');

    this.set('BACKGROUND_STATE', () => {
      return viewerForDoc(this.ampdoc).isVisible() ? '0' : '1';
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
   * @private
   */
  getAccessValue_(getter, expr) {
    return this.getAccessService_(this.ampdoc).then(accessService => {
      if (!accessService) {
        // Access service is not installed.
        user().error(TAG, 'Access service is not installed to access: ', expr);
        return null;
      }
      return getter(accessService);
    });
  }

  /**
   * Return the QUERY_PARAM from the current location href
   * @param {*} param
   * @param {string} defaultValue
   * @return {string}
   * @private
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
   * Resolves the value via amp-experiment's variants service.
   * @param {function(!Object<string, string>):(?string)} getter
   * @param {string} expr
   * @return {!Promise<?string>}
   * @template T
   * @private
   */
  getVairiantsValue_(getter, expr) {
    if (!this.variants_) {
      this.variants_ = variantForOrNull(this.ampdoc.win);
    }
    return this.variants_.then(variants => {
      user().assert(variants,
          'To use variable %s, amp-experiment should be configured',
          expr);
      return getter(variants);
    });
  }

  /**
   * Resolves the value via amp-share-tracking's service.
   * @param {function(!ShareTrackingFragmentsDef):T} getter
   * @param {string} expr
   * @return {!Promise<T>}
   * @template T
   * @private
   */
  getShareTrackingValue_(getter, expr) {
    if (!this.shareTrackingFragments_) {
      this.shareTrackingFragments_ = shareTrackingForOrNull(this.ampdoc.win);
    }
    return this.shareTrackingFragments_.then(fragments => {
      user().assert(fragments, 'To use variable %s, ' +
          'amp-share-tracking should be configured',
          expr);
      return getter(/** @type {!ShareTrackingFragmentsDef} */ (fragments));
    });
  }
}

/**
 * This class replaces substitution variables with their values.
 * Document new values in ../spec/amp-var-substitutions.md
 * @package For export
 */
export class UrlReplacements {
  /** @param {!./ampdoc-impl.AmpDoc} ampdoc */
  constructor(ampdoc, variableSource) {
    /** @const {!./ampdoc-impl.AmpDoc} */
    this.ampdoc = ampdoc;

    /** @type {VariableSource} */
    this.variableSource_ = variableSource;
  }

  /**
   * Synchronously expands the provided URL by replacing all known variables with
   * their resolved values. Optional `opt_bindings` can be used to add new
   * variables or override existing ones.  Any async bindings are ignored.
   *
   * TODO(mkhatib, #6322): Deprecate and please use expandUrlSync or expandStringSync.
   * @param {string} url
   * @param {!Object<string, (ResolverReturnDef|!SyncResolverDef)>=} opt_bindings
   * @param {!Object<string, ResolverReturnDef>=} opt_collectVars
   * @param {!Object<string, boolean>=} opt_whiteList Optional white list of names
   *     that can be substituted.
   * @return {string}
   */
  expandSync(url, opt_bindings, opt_collectVars, opt_whiteList) {
    return this.expandUrlSync(
        url, opt_bindings, opt_collectVars, opt_whiteList);
  }

  /**
   * Expands the provided URL by replacing all known variables with their
   * resolved values. Optional `opt_bindings` can be used to add new variables
   * or override existing ones.
   *
   * TODO(mkhatib, #6322): Deprecate and please use expandUrlAsync or expandStringAsync.
   * @param {string} url
   * @param {!Object<string, *>=} opt_bindings
   * @param {!Object<string, boolean>=} opt_whiteList Optional white list of names
   *     that can be substituted.
   * @return {!Promise<string>}
   */
  expandAsync(url, opt_bindings, opt_whiteList) {
    return this.expandUrlAsync(url, opt_bindings, opt_whiteList);
  }


  /**
   * Synchronously expands the provided source by replacing all known variables with
   * their resolved values. Optional `opt_bindings` can be used to add new
   * variables or override existing ones.  Any async bindings are ignored.
   * @param {string} source
   * @param {!Object<string, (ResolverReturnDef|!SyncResolverDef)>=} opt_bindings
   * @param {!Object<string, ResolverReturnDef>=} opt_collectVars
   * @param {!Object<string, boolean>=} opt_whiteList Optional white list of names
   *     that can be substituted.
   * @return {string}
   */
  expandStringSync(source, opt_bindings, opt_collectVars, opt_whiteList) {
    return /** @type {string} */ (
        this.expand_(source, opt_bindings, opt_collectVars, /* opt_sync */ true,
            opt_whiteList));
  }

  /**
   * Expands the provided source by replacing all known variables with their
   * resolved values. Optional `opt_bindings` can be used to add new variables
   * or override existing ones.
   * @param {string} source
   * @param {!Object<string, *>=} opt_bindings
   * @return {!Promise<string>}
   */
  expandStringAsync(source, opt_bindings) {
    return /** @type {!Promise<string>} */ (this.expand_(source, opt_bindings));
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
  expandUrlSync(url, opt_bindings, opt_collectVars, opt_whiteList) {
    return this.ensureProtocolMatches_(url, /** @type {string} */ (this.expand_(
            url, opt_bindings, opt_collectVars, /* opt_sync */ true,
            opt_whiteList)));
  }

  /**
   * Expands the provided URL by replacing all known variables with their
   * resolved values. Optional `opt_bindings` can be used to add new variables
   * or override existing ones.
   * @param {string} url
   * @param {!Object<string, *>=} opt_bindings
   * @param {!Object<string, boolean>=} opt_whiteList Optional white list of names
   *     that can be substituted.
   * @return {!Promise<string>}
   */
  expandUrlAsync(url, opt_bindings, opt_whiteList) {
    return /** @type {!Promise<string>} */ (
        this.expand_(url, opt_bindings, undefined, undefined,
            opt_whiteList).then(
              replacement => this.ensureProtocolMatches_(url, replacement)));
  }

  /**
   * Expands an input element value attribute with variable substituted.
   * @param {!HTMLInputElement} element
   * @return {!Promise<string>}
   */
  expandInputValueAsync(element) {
    return /** @type {!Promise<string>} */ (
        this.expandInputValue_(element, /*opt_sync*/ false));
  }

  /**
   * Expands an input element value attribute with variable substituted.
   * @param {!HTMLInputElement} element
   * @return {string} Replaced string for testing
   */
  expandInputValueSync(element) {
    return /** @type {string} */ (
        this.expandInputValue_(element, /*opt_sync*/ true));
  }

  /**
   * Expands in input element value attribute with variable substituted.
   * @param {!HTMLInputElement} element
   * @param {boolean=} opt_sync
   * @return {string|!Promise<string>}
   */
  expandInputValue_(element, opt_sync) {
    dev().assert(element.tagName == 'INPUT' &&
        (element.getAttribute('type') || '').toLowerCase() == 'hidden',
        'Input value expansion only works on hidden input fields: %s', element);

    const whitelist = this.getWhitelistForElement_(element);
    if (!whitelist) {
      return opt_sync ? element.value : Promise.resolve(element.value);
    }
    if (element[ORIGINAL_VALUE_PROPERTY] === undefined) {
      element[ORIGINAL_VALUE_PROPERTY] = element.value;
    }
    const result = this.expand_(
        element[ORIGINAL_VALUE_PROPERTY] || element.value,
        /* opt_bindings */ undefined,
        /* opt_collectVars */ undefined,
        /* opt_sync */ opt_sync,
        /* opt_whitelist */ whitelist);

    if (opt_sync) {
      return element.value = result;
    }
    return result.then(newValue => {
      element.value = newValue;
      return newValue;
    });
  }

  /**
   * Returns a replacement whitelist from elements' data-amp-replace attribute.
   * @param {!Element} element.
   * @param {!Object<string, boolean>=} opt_supportedReplacement Optional supported
   * replacement that filters whitelist to a subset.
   * @return {!Object<string, boolean>|undefined}
   */
  getWhitelistForElement_(element, opt_supportedReplacement) {
    const whitelist = element.getAttribute('data-amp-replace');
    if (!whitelist) {
      return;
    }
    const requestedReplacements = {};
    whitelist.trim().split(/\s+/).forEach(replacement => {
      if (!opt_supportedReplacement ||
          (opt_supportedReplacement &&
           opt_supportedReplacement.hasOwnProperty(replacement))) {
        requestedReplacements[replacement] = true;
      } else if (opt_supportedReplacement) {
        user().warn('URL', 'Ignoring unsupported replacement', replacement);
      }
    });
    return requestedReplacements;
  }

  /**
    * Returns whether variable substitution is allowed for given url.
    * @param {!Location} url.
    * @return {boolean}
    */
  isAllowedOrigin_(url) {
    const docInfo = documentInfoForDoc(this.ampdoc);

    if (url.origin == parseUrl(docInfo.canonicalUrl).origin ||
        url.origin == parseUrl(docInfo.sourceUrl).origin) {
      return true;
    }

    const meta = this.ampdoc.getRootNode().querySelector(
      'meta[name=amp-link-variable-allowed-origin]');

    if (meta && meta.hasAttribute('content')) {
      const whitelist = meta.getAttribute('content').trim().split(/\s+/);
      for (let i = 0; i < whitelist.length; i++) {
        if (url.origin == parseUrl(whitelist[i]).origin) {
          return true;
        }
      }
    }

    return false;
  }

  /**
   * Replaces values in the link of an anchor tag if
   * - the link opts into it (via data-amp-replace argument)
   * - the destination is the source or canonical origin of this doc.
   * @param {!Element} element An anchor element.
   * @return {string|undefined} Replaced string for testing
   */
  maybeExpandLink(element) {
    dev().assert(element.tagName == 'A');
    const supportedReplacements = {
      'CLIENT_ID': true,
      'QUERY_PARAM': true,
    };
    const whitelist = this.getWhitelistForElement_(
        element, supportedReplacements);
    if (!whitelist) {
      return;
    }
    // ORIGINAL_HREF_PROPERTY has the value of the href "pre-replacement".
    // We set this to the original value before doing any work and use it
    // on subsequent replacements, so that each run gets a fresh value.
    const href = dev().assertString(
        element[ORIGINAL_HREF_PROPERTY] || element.getAttribute('href'));
    const url = parseUrl(href);
    if (!this.isAllowedOrigin_(url)) {
      user().warn('URL', 'Ignoring link replacement', href,
          ' because the link does not go to the document\'s' +
          ' source, canonical, or whitelisted origin.');
      return;
    }
    if (!isSecureUrl(href)) {
      user().warn('URL', 'Ignoring link replacement', href,
          ' because it is only supported for secure links.');
      return;
    }
    if (element[ORIGINAL_HREF_PROPERTY] == null) {
      element[ORIGINAL_HREF_PROPERTY] = href;
    }
    return element.href = this.expandSync(
        href,
        /* opt_bindings */ undefined,
        /* opt_collectVars */ undefined,
        /* opt_whitelist */ whitelist);
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
    const expr = this.variableSource_.getExpr(opt_bindings);
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
      } else if ((binding = this.variableSource_.get(name))) {
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
      return replacement;
    }
    return replacementPromise || Promise.resolve(replacement);
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

  /**
   * @return {VariableSource}
   */
  getVariableSource() {
    return this.variableSource_;
  }
}

/**
 * Extracts client ID from a _ga cookie.
 * https://developers.google.com/analytics/devguides/collection/analyticsjs/cookies-user-id
 * @param {string} gaCookie
 * @returns {string}
 */
export function extractClientIdFromGaCookie(gaCookie) {
  return gaCookie.replace(/^(GA1|1)\.[\d-]+\./, '');
}

/**
 * @param {!./ampdoc-impl.AmpDoc} ampdoc
 */
export function installUrlReplacementsServiceForDoc(ampdoc) {
  registerServiceBuilderForDoc(
      ampdoc,
      'url-replace',
      ampdoc => new UrlReplacements(ampdoc, new GlobalVariableSource(ampdoc)));
}

/**
 * @param {!./ampdoc-impl.AmpDoc} ampdoc
 * @param {!Window} embedWin
 * @param {*} varSource
 */
export function installUrlReplacementsForEmbed(ampdoc, embedWin, varSource) {
  installServiceInEmbedScope(embedWin, 'url-replace',
      new UrlReplacements(ampdoc, varSource));
}


/**
 * @typedef {{
 *   incomingFragment: string,
 *   outgoingFragment: string,
 * }}
 */
let ShareTrackingFragmentsDef;
