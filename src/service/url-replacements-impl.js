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

import {
  AsyncResolverDef,
  ResolverReturnDef,
  SyncResolverDef,
  VariableSource,
  getNavigationData,
  getTimingDataAsync,
  getTimingDataSync,
} from './variable-source';
import {Expander} from './url-expander/expander';
import {Services} from '../services';
import {WindowInterface} from '../window-interface';
import {
  addMissingParamsToUrl,
  addParamsToUrl,
  getSourceUrl,
  isProtocolValid,
  parseQueryString,
  parseUrlDeprecated,
  removeAmpJsParamsFromUrl,
  removeFragment,
} from '../url';
import {dev, devAssert, user, userAssert} from '../log';
import {getMode} from '../mode';
import {getTrackImpressionPromise} from '../impression.js';
import {hasOwn} from '../utils/object';
import {
  installServiceInEmbedScope,
  registerServiceBuilderForDoc,
} from '../service';
import {internalRuntimeVersion} from '../internal-version';
import {tryResolve} from '../utils/promise';

/** @private @const {string} */
const TAG = 'UrlReplacements';
const EXPERIMENT_DELIMITER = '!';
const VARIANT_DELIMITER = '.';
const GEO_DELIM = ',';
const ORIGINAL_HREF_PROPERTY = 'amp-original-href';
const ORIGINAL_VALUE_PROPERTY = 'amp-original-value';

/**
 * Returns a function that executes method on a new Date instance. This is a
 * byte saving hack.
 *
 * @param {string} method
 * @return {!SyncResolverDef}
 */
function dateMethod(method) {
  return () => new Date()[method]();
}

/**
 * Returns a function that returns property of screen. This is a byte saving
 * hack.
 *
 * @param {!Screen} screen
 * @param {string} property
 * @return {!SyncResolverDef}
 */
function screenProperty(screen, property) {
  return () => screen[property];
}

/**
 * Class to provide variables that pertain to top level AMP window.
 */
export class GlobalVariableSource extends VariableSource {
  /**
   * @param {!./ampdoc-impl.AmpDoc} ampdoc
   */
  constructor(ampdoc) {
    super(ampdoc);

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
    return this.setBoth(
      varName,
      () => {
        return getTimingDataSync(this.ampdoc.win, startEvent, endEvent);
      },
      () => {
        return getTimingDataAsync(this.ampdoc.win, startEvent, endEvent);
      }
    );
  }

  /** @override */
  initialize() {
    const {win} = this.ampdoc;
    const element = this.ampdoc.getHeadNode();

    /** @const {!./viewport/viewport-impl.Viewport} */
    const viewport = Services.viewportForDoc(this.ampdoc);

    // Returns a random value for cache busters.
    this.set('RANDOM', () => Math.random());

    // Provides a counter starting at 1 per given scope.
    const counterStore = Object.create(null);
    this.set('COUNTER', scope => {
      return (counterStore[scope] = (counterStore[scope] | 0) + 1);
    });

    // Returns the canonical URL for this AMP document.
    this.set('CANONICAL_URL', () => this.getDocInfo_().canonicalUrl);

    // Returns the host of the canonical URL for this AMP document.
    this.set(
      'CANONICAL_HOST',
      () => parseUrlDeprecated(this.getDocInfo_().canonicalUrl).host
    );

    // Returns the hostname of the canonical URL for this AMP document.
    this.set(
      'CANONICAL_HOSTNAME',
      () => parseUrlDeprecated(this.getDocInfo_().canonicalUrl).hostname
    );

    // Returns the path of the canonical URL for this AMP document.
    this.set(
      'CANONICAL_PATH',
      () => parseUrlDeprecated(this.getDocInfo_().canonicalUrl).pathname
    );

    // Returns the referrer URL.
    this.setAsync(
      'DOCUMENT_REFERRER',
      /** @type {AsyncResolverDef} */ (() => {
        return Services.viewerForDoc(this.ampdoc).getReferrerUrl();
      })
    );

    // Like DOCUMENT_REFERRER, but returns null if the referrer is of
    // same domain or the corresponding CDN proxy.
    this.setAsync(
      'EXTERNAL_REFERRER',
      /** @type {AsyncResolverDef} */ (() => {
        return Services.viewerForDoc(this.ampdoc)
          .getReferrerUrl()
          .then(referrer => {
            if (!referrer) {
              return null;
            }
            const referrerHostname = parseUrlDeprecated(getSourceUrl(referrer))
              .hostname;
            const currentHostname = WindowInterface.getHostname(win);
            return referrerHostname === currentHostname ? null : referrer;
          });
      })
    );

    // Returns the title of this AMP document.
    this.set('TITLE', () => {
      // The environment may override the title and set originalTitle. Prefer
      // that if available.
      const doc = win.document;
      return doc['originalTitle'] || doc.title;
    });

    // Returns the URL for this AMP document.
    this.set('AMPDOC_URL', () => {
      return removeFragment(this.addReplaceParamsIfMissing_(win.location.href));
    });

    // Returns the host of the URL for this AMP document.
    this.set('AMPDOC_HOST', () => {
      const url = parseUrlDeprecated(win.location.href);
      return url && url.host;
    });

    // Returns the hostname of the URL for this AMP document.
    this.set('AMPDOC_HOSTNAME', () => {
      const url = parseUrlDeprecated(win.location.href);
      return url && url.hostname;
    });

    // Returns the Source URL for this AMP document.
    const expandSourceUrl = () => {
      const docInfo = this.getDocInfo_();
      return removeFragment(this.addReplaceParamsIfMissing_(docInfo.sourceUrl));
    };
    this.setBoth(
      'SOURCE_URL',
      () => expandSourceUrl(),
      () => getTrackImpressionPromise().then(() => expandSourceUrl())
    );

    // Returns the host of the Source URL for this AMP document.
    this.set(
      'SOURCE_HOST',
      () => parseUrlDeprecated(this.getDocInfo_().sourceUrl).host
    );

    // Returns the hostname of the Source URL for this AMP document.
    this.set(
      'SOURCE_HOSTNAME',
      () => parseUrlDeprecated(this.getDocInfo_().sourceUrl).hostname
    );

    // Returns the path of the Source URL for this AMP document.
    this.set(
      'SOURCE_PATH',
      () => parseUrlDeprecated(this.getDocInfo_().sourceUrl).pathname
    );

    // Returns a random string that will be the constant for the duration of
    // single page view. It should have sufficient entropy to be unique for
    // all the page views a single user is making at a time.
    this.set('PAGE_VIEW_ID', () => this.getDocInfo_().pageViewId);

    this.setBoth(
      'QUERY_PARAM',
      (param, defaultValue = '') => {
        return this.getQueryParamData_(param, defaultValue);
      },
      (param, defaultValue = '') => {
        return getTrackImpressionPromise().then(() => {
          return this.getQueryParamData_(param, defaultValue);
        });
      }
    );

    // Returns the value of the given field name in the fragment query string.
    // Second parameter is an optional default value.
    // For example, if location is 'pub.com/amp.html?x=1#y=2' then
    // FRAGMENT_PARAM(y) returns '2' and FRAGMENT_PARAM(z, 3) returns 3.
    this.setAsync(
      'FRAGMENT_PARAM',
      this.getViewerIntegrationValue_('fragmentParam', 'FRAGMENT_PARAM')
    );

    // Returns the first item in the ancestorOrigins array, if available.
    this.setAsync(
      'ANCESTOR_ORIGIN',
      this.getViewerIntegrationValue_('ancestorOrigin', 'ANCESTOR_ORIGIN')
    );

    /**
     * Stores client ids that were generated during this page view
     * indexed by scope.
     * @type {?Object<string, string>}
     */
    let clientIds = null;
    // Synchronous alternative. Only works for scopes that were previously
    // requested using the async method.
    this.setBoth(
      'CLIENT_ID',
      scope => {
        if (!clientIds) {
          return null;
        }
        return clientIds[dev().assertString(scope)];
      },
      (scope, opt_userNotificationId, opt_cookieName) => {
        user().assertString(
          scope,
          'The first argument to CLIENT_ID, the fallback' +
            /*OK*/ ' Cookie name, is required'
        );

        if (getMode().runtime == 'inabox') {
          return /** @type {!Promise<ResolverReturnDef>} */ (Promise.resolve(
            null
          ));
        }

        let consent = Promise.resolve();

        // If no `opt_userNotificationId` argument is provided then
        // assume consent is given by default.
        if (opt_userNotificationId) {
          consent = Services.userNotificationManagerForDoc(element).then(
            service => {
              return service.get(opt_userNotificationId);
            }
          );
        }
        return Services.cidForDoc(this.ampdoc)
          .then(cid => {
            return cid.get(
              {
                scope: dev().assertString(scope),
                createCookieIfNotPresent: true,
                cookieName: opt_cookieName,
              },
              consent
            );
          })
          .then(cid => {
            if (!clientIds) {
              clientIds = Object.create(null);
            }

            // A temporary work around to extract Client ID from _ga cookie. #5761
            // TODO: replace with "filter" when it's in place. #2198
            const cookieName = opt_cookieName || scope;
            if (cid && cookieName == '_ga') {
              if (typeof cid === 'string') {
                cid = extractClientIdFromGaCookie(cid);
              } else {
                // TODO(@jridgewell, #11120): remove once #11120 is figured out.
                // Do not log the CID directly, that's PII.
                dev().error(
                  TAG,
                  'non-string cid, what is it?',
                  Object.keys(cid)
                );
              }
            }

            clientIds[scope] = cid;
            return cid;
          });
      }
    );

    // Returns assigned variant name for the given experiment.
    this.setAsync(
      'VARIANT',
      /** @type {AsyncResolverDef} */ (experiment => {
        return this.getVariantsValue_(variants => {
          const variant = variants[/** @type {string} */ (experiment)];
          userAssert(
            variant !== undefined,
            'The value passed to VARIANT() is not a valid experiment name:' +
              experiment
          );
          // When no variant assigned, use reserved keyword 'none'.
          return variant === null ? 'none' : /** @type {string} */ (variant);
        }, 'VARIANT');
      })
    );

    // Returns all assigned experiment variants in a serialized form.
    this.setAsync(
      'VARIANTS',
      /** @type {AsyncResolverDef} */ (() => {
        return this.getVariantsValue_(variants => {
          const experiments = [];
          for (const experiment in variants) {
            const variant = variants[experiment];
            experiments.push(
              experiment + VARIANT_DELIMITER + (variant || 'none')
            );
          }
          return experiments.join(EXPERIMENT_DELIMITER);
        }, 'VARIANTS');
      })
    );

    // Returns assigned geo value for geoType or all groups.
    this.setAsync(
      'AMP_GEO',
      /** @type {AsyncResolverDef} */ (geoType => {
        return this.getGeo_(geos => {
          if (geoType) {
            userAssert(
              geoType === 'ISOCountry',
              'The value passed to AMP_GEO() is not valid name:' + geoType
            );
            return /** @type {string} */ (geos[geoType] || 'unknown');
          }
          return /** @type {string} */ (geos.matchedISOCountryGroups.join(
            GEO_DELIM
          ));
        }, 'AMP_GEO');
      })
    );

    // Returns incoming share tracking fragment.
    this.setAsync(
      'SHARE_TRACKING_INCOMING',
      /** @type {AsyncResolverDef} */ (() => {
        return this.getShareTrackingValue_(fragments => {
          return fragments.incomingFragment;
        }, 'SHARE_TRACKING_INCOMING');
      })
    );

    // Returns outgoing share tracking fragment.
    this.setAsync(
      'SHARE_TRACKING_OUTGOING',
      /** @type {AsyncResolverDef} */ (() => {
        return this.getShareTrackingValue_(fragments => {
          return fragments.outgoingFragment;
        }, 'SHARE_TRACKING_OUTGOING');
      })
    );

    // Returns the number of milliseconds since 1 Jan 1970 00:00:00 UTC.
    this.set('TIMESTAMP', dateMethod('getTime'));

    // Returns the human readable timestamp in format of
    // 2011-01-01T11:11:11.612Z.
    this.set('TIMESTAMP_ISO', dateMethod('toISOString'));

    // Returns the user's time-zone offset from UTC, in minutes.
    this.set('TIMEZONE', dateMethod('getTimezoneOffset'));

    // Returns the IANA timezone code
    this.set('TIMEZONE_CODE', () => {
      let tzCode;
      if ('Intl' in win && 'DateTimeFormat' in win.Intl) {
        // It could be undefined (i.e. IE11)
        tzCode = new Intl.DateTimeFormat().resolvedOptions().timeZone;
      }

      return tzCode || '';
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
    this.set('VIEWPORT_HEIGHT', () => viewport.getHeight());

    // Returns the viewport width.
    this.set('VIEWPORT_WIDTH', () => viewport.getWidth());

    const {screen} = win;
    // Returns screen.width.
    this.set('SCREEN_WIDTH', screenProperty(screen, 'width'));

    // Returns screen.height.
    this.set('SCREEN_HEIGHT', screenProperty(screen, 'height'));

    // Returns screen.availHeight.
    this.set('AVAILABLE_SCREEN_HEIGHT', screenProperty(screen, 'availHeight'));

    // Returns screen.availWidth.
    this.set('AVAILABLE_SCREEN_WIDTH', screenProperty(screen, 'availWidth'));

    // Returns screen.ColorDepth.
    this.set('SCREEN_COLOR_DEPTH', screenProperty(screen, 'colorDepth'));

    // Returns document characterset.
    this.set('DOCUMENT_CHARSET', () => {
      const doc = win.document;
      return doc.characterSet || doc.charset;
    });

    // Returns the browser language.
    this.set('BROWSER_LANGUAGE', () => {
      const nav = win.navigator;
      return (
        nav.language ||
        nav.userLanguage ||
        nav.browserLanguage ||
        ''
      ).toLowerCase();
    });

    // Returns the user agent.
    this.set('USER_AGENT', () => {
      return win.navigator.userAgent;
    });

    // Returns the time it took to load the whole page. (excludes amp-* elements
    // that are not rendered by the system yet.)
    this.setTimingResolver_(
      'PAGE_LOAD_TIME',
      'navigationStart',
      'loadEventStart'
    );

    // Returns the time it took to perform DNS lookup for the domain.
    this.setTimingResolver_(
      'DOMAIN_LOOKUP_TIME',
      'domainLookupStart',
      'domainLookupEnd'
    );

    // Returns the time it took to connect to the server.
    this.setTimingResolver_('TCP_CONNECT_TIME', 'connectStart', 'connectEnd');

    // Returns the time it took for server to start sending a response to the
    // request.
    this.setTimingResolver_(
      'SERVER_RESPONSE_TIME',
      'requestStart',
      'responseStart'
    );

    // Returns the time it took to download the page.
    this.setTimingResolver_(
      'PAGE_DOWNLOAD_TIME',
      'responseStart',
      'responseEnd'
    );

    // Returns the time it took for redirects to complete.
    this.setTimingResolver_('REDIRECT_TIME', 'navigationStart', 'fetchStart');

    // Returns the time it took for DOM to become interactive.
    this.setTimingResolver_(
      'DOM_INTERACTIVE_TIME',
      'navigationStart',
      'domInteractive'
    );

    // Returns the time it took for content to load.
    this.setTimingResolver_(
      'CONTENT_LOAD_TIME',
      'navigationStart',
      'domContentLoadedEventStart'
    );

    // Access: Reader ID.
    this.setAsync(
      'ACCESS_READER_ID',
      /** @type {AsyncResolverDef} */ (() => {
        return this.getAccessValue_(accessService => {
          return accessService.getAccessReaderId();
        }, 'ACCESS_READER_ID');
      })
    );

    // Access: data from the authorization response.
    this.setAsync(
      'AUTHDATA',
      /** @type {AsyncResolverDef} */ (field => {
        userAssert(
          field,
          'The first argument to AUTHDATA, the field, is required'
        );
        return this.getAccessValue_(accessService => {
          return accessService.getAuthdataField(field);
        }, 'AUTHDATA');
      })
    );

    // Returns an identifier for the viewer.
    this.setAsync('VIEWER', () => {
      return Services.viewerForDoc(this.ampdoc)
        .getViewerOrigin()
        .then(viewer => {
          return viewer == undefined ? '' : viewer;
        });
    });

    // Returns the total engaged time since the content became viewable.
    this.setAsync('TOTAL_ENGAGED_TIME', () => {
      return Services.activityForDoc(element).then(activity => {
        return activity.getTotalEngagedTime();
      });
    });

    // Returns the incremental engaged time since the last push under the
    // same name.
    this.setAsync('INCREMENTAL_ENGAGED_TIME', (name, reset) => {
      return Services.activityForDoc(element).then(activity => {
        return activity.getIncrementalEngagedTime(
          /** @type {string} */ (name),
          reset !== 'false'
        );
      });
    });

    this.set('NAV_TIMING', (startAttribute, endAttribute) => {
      userAssert(
        startAttribute,
        'The first argument to NAV_TIMING, the ' +
          'start attribute name, is required'
      );
      return getTimingDataSync(
        win,
        /**@type {string}*/ (startAttribute),
        /**@type {string}*/ (endAttribute)
      );
    });
    this.setAsync('NAV_TIMING', (startAttribute, endAttribute) => {
      userAssert(
        startAttribute,
        'The first argument to NAV_TIMING, the ' +
          'start attribute name, is required'
      );
      return getTimingDataAsync(
        win,
        /**@type {string}*/ (startAttribute),
        /**@type {string}*/ (endAttribute)
      );
    });

    this.set('NAV_TYPE', () => {
      return getNavigationData(win, 'type');
    });

    this.set('NAV_REDIRECT_COUNT', () => {
      return getNavigationData(win, 'redirectCount');
    });

    // returns the AMP version number
    this.set('AMP_VERSION', () => internalRuntimeVersion());

    this.set('BACKGROUND_STATE', () => {
      return Services.viewerForDoc(this.ampdoc).isVisible() ? '0' : '1';
    });

    this.setAsync('VIDEO_STATE', (id, property) => {
      const root = this.ampdoc.getRootNode();
      const video = user().assertElement(
        root.getElementById(/** @type {string} */ (id)),
        `Could not find an element with id="${id}" for VIDEO_STATE`
      );
      return Services.videoManagerForDoc(this.ampdoc)
        .getAnalyticsDetails(video)
        .then(details => (details ? details[property] : ''));
    });

    this.setAsync(
      'STORY_PAGE_INDEX',
      this.getStoryValue_('pageIndex', 'STORY_PAGE_INDEX')
    );

    this.setAsync(
      'STORY_PAGE_ID',
      this.getStoryValue_('pageId', 'STORY_PAGE_ID')
    );

    this.setAsync('FIRST_CONTENTFUL_PAINT', () => {
      return tryResolve(() =>
        Services.performanceFor(win).getFirstContentfulPaint()
      );
    });

    this.setAsync('FIRST_VIEWPORT_READY', () => {
      return tryResolve(() =>
        Services.performanceFor(win).getFirstViewportReady()
      );
    });

    this.setAsync('MAKE_BODY_VISIBLE', () => {
      return tryResolve(() =>
        Services.performanceFor(win).getMakeBodyVisible()
      );
    });

    this.setAsync('AMP_STATE', key => {
      // This is safe since AMP_STATE is not an A4A whitelisted variable.
      const root = this.ampdoc.getRootNode();
      const element =
        /** @type {!Element|!ShadowRoot} */ (root.documentElement || root);
      return Services.bindForDocOrNull(element).then(bind => {
        if (!bind) {
          return '';
        }
        return bind.getStateValue(/** @type {string} */ (key));
      });
    });
  }

  /**
   * Merges any replacement parameters into a given URL's query string,
   * preferring values set in the original query string.
   * @param {string} orig The original URL
   * @return {string} The resulting URL
   * @private
   */
  addReplaceParamsIfMissing_(orig) {
    const {replaceParams} = /** @type {!Object} */ (this.getDocInfo_());
    if (!replaceParams) {
      return orig;
    }
    return addMissingParamsToUrl(removeAmpJsParamsFromUrl(orig), replaceParams);
  }

  /**
   * Return the document info for the current ampdoc.
   * @return {./document-info-impl.DocumentInfoDef}
   */
  getDocInfo_() {
    return Services.documentInfoForDoc(this.ampdoc);
  }

  /**
   * Resolves the value via access service. If access service is not configured,
   * the resulting value is `null`.
   * @param {function(!../../extensions/amp-access/0.1/access-vars.AccessVars):(T|!Promise<T>)} getter
   * @param {string} expr
   * @return {T|null}
   * @template T
   * @private
   */
  getAccessValue_(getter, expr) {
    const element = this.ampdoc.getHeadNode();
    return Promise.all([
      Services.accessServiceForDocOrNull(element),
      Services.subscriptionsServiceForDocOrNull(element),
    ]).then(services => {
      const service =
        /** @type {?../../extensions/amp-access/0.1/access-vars.AccessVars} */ (services[0] ||
        services[1]);
      if (!service) {
        // Access/subscriptions service is not installed.
        user().error(
          TAG,
          'Access or subsciptions service is not installed to access: ',
          expr
        );
        return null;
      }
      return getter(service);
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
    userAssert(
      param,
      'The first argument to QUERY_PARAM, the query string ' +
        'param is required'
    );
    const url = parseUrlDeprecated(
      removeAmpJsParamsFromUrl(this.ampdoc.win.location.href)
    );
    const params = parseQueryString(url.search);
    const key = user().assertString(param);
    const {replaceParams} = this.getDocInfo_();
    if (typeof params[key] !== 'undefined') {
      return params[key];
    }
    if (replaceParams && typeof replaceParams[key] !== 'undefined') {
      return /** @type {string} */ (replaceParams[key]);
    }
    return defaultValue;
  }

  /**
   * Resolves the value via amp-experiment's variants service.
   * @param {function(!Object<string, string>):(?string)} getter
   * @param {string} expr
   * @return {!Promise<?string>}
   * @template T
   * @private
   */
  getVariantsValue_(getter, expr) {
    return Services.variantsForDocOrNull(this.ampdoc.getHeadNode())
      .then(variants => {
        userAssert(
          variants,
          'To use variable %s, amp-experiment should be configured',
          expr
        );
        return variants.getVariants();
      })
      .then(variantsMap => getter(variantsMap));
  }

  /**
   * Resolves the value via geo service.
   * @param {function(Object<string, string>)} getter
   * @param {string} expr
   * @return {!Promise<Object<string,(string|Array<string>)>>}
   * @template T
   * @private
   */
  getGeo_(getter, expr) {
    const element = this.ampdoc.getHeadNode();
    return Services.geoForDocOrNull(element).then(geo => {
      userAssert(geo, 'To use variable %s, amp-geo should be configured', expr);
      return getter(geo);
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
      this.shareTrackingFragments_ = Services.shareTrackingForOrNull(
        this.ampdoc.win
      );
    }
    return this.shareTrackingFragments_.then(fragments => {
      userAssert(
        fragments,
        'To use variable %s, amp-share-tracking should be configured',
        expr
      );
      return getter(/** @type {!ShareTrackingFragmentsDef} */ (fragments));
    });
  }

  /**
   * Resolves the value via amp-story's service.
   * @param {string} property
   * @param {string} name
   * @return {!AsyncResolverDef}
   * @private
   */
  getStoryValue_(property, name) {
    return () => {
      const service = Services.storyVariableServiceForOrNull(this.ampdoc.win);
      return service.then(storyVariables => {
        userAssert(
          storyVariables,
          'To use variable %s amp-story should be configured',
          name
        );
        return storyVariables[property];
      });
    };
  }

  /**
   * Resolves the value via amp-viewer-integration's service.
   * @param {string} property
   * @param {string} name
   * @return {!AsyncResolverDef}
   * @private
   */
  getViewerIntegrationValue_(property, name) {
    return /** @type {!AsyncResolverDef} */ ((param, defaultValue = '') => {
      const service = Services.viewerIntegrationVariableServiceForOrNull(
        this.ampdoc.win
      );
      return service.then(viewerIntegrationVariables => {
        userAssert(
          viewerIntegrationVariables,
          'To use variable %s amp-viewer-integration must be installed',
          name
        );
        return viewerIntegrationVariables[property](param, defaultValue);
      });
    });
  }
}

/**
 * This class replaces substitution variables with their values.
 * Document new values in ../spec/amp-var-substitutions.md
 * @package For export
 */
export class UrlReplacements {
  /**
   * @param {!./ampdoc-impl.AmpDoc} ampdoc
   * @param {!VariableSource} variableSource
   */
  constructor(ampdoc, variableSource) {
    /** @const {!./ampdoc-impl.AmpDoc} */
    this.ampdoc = ampdoc;

    /** @type {VariableSource} */
    this.variableSource_ = variableSource;
  }

  /**
   * Synchronously expands the provided source by replacing all known variables
   * with their resolved values. Optional `opt_bindings` can be used to add new
   * variables or override existing ones.  Any async bindings are ignored.
   * @param {string} source
   * @param {!Object<string, (ResolverReturnDef|!SyncResolverDef)>=} opt_bindings
   * @param {!Object<string, ResolverReturnDef>=} opt_collectVars
   * @param {!Object<string, boolean>=} opt_whiteList Optional white list of
   *     names that can be substituted.
   * @return {string}
   */
  expandStringSync(source, opt_bindings, opt_collectVars, opt_whiteList) {
    return /** @type {string} */ (new Expander(
      this.variableSource_,
      opt_bindings,
      opt_collectVars,
      /* opt_sync */ true,
      opt_whiteList,
      /* opt_noEncode */ true
    )./*OK*/ expand(source));
  }

  /**
   * Expands the provided source by replacing all known variables with their
   * resolved values. Optional `opt_bindings` can be used to add new variables
   * or override existing ones.
   * @param {string} source
   * @param {!Object<string, *>=} opt_bindings
   * @param {!Object<string, boolean>=} opt_whiteList
   * @return {!Promise<string>}
   */
  expandStringAsync(source, opt_bindings, opt_whiteList) {
    return /** @type {!Promise<string>} */ (new Expander(
      this.variableSource_,
      opt_bindings,
      /* opt_collectVars */ undefined,
      /* opt_sync */ undefined,
      opt_whiteList,
      /* opt_noEncode */ true
    )./*OK*/ expand(source));
  }

  /**
   * Synchronously expands the provided URL by replacing all known variables
   * with their resolved values. Optional `opt_bindings` can be used to add new
   * variables or override existing ones.  Any async bindings are ignored.
   * @param {string} url
   * @param {!Object<string, (ResolverReturnDef|!SyncResolverDef)>=} opt_bindings
   * @param {!Object<string, ResolverReturnDef>=} opt_collectVars
   * @param {!Object<string, boolean>=} opt_whiteList Optional white list of
   *     names that can be substituted.
   * @return {string}
   */
  expandUrlSync(url, opt_bindings, opt_collectVars, opt_whiteList) {
    return this.ensureProtocolMatches_(
      url,
      /** @type {string} */ (new Expander(
        this.variableSource_,
        opt_bindings,
        opt_collectVars,
        /* opt_sync */ true,
        opt_whiteList
      )./*OK*/ expand(url))
    );
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
    return /** @type {!Promise<string>} */ (new Expander(
      this.variableSource_,
      opt_bindings,
      /* opt_collectVars */ undefined,
      /* opt_sync */ undefined,
      opt_whiteList
    )
      ./*OK*/ expand(url)
      .then(replacement => this.ensureProtocolMatches_(url, replacement)));
  }

  /**
   * Expands an input element value attribute with variable substituted.
   * @param {!HTMLInputElement} element
   * @return {!Promise<string>}
   */
  expandInputValueAsync(element) {
    return /** @type {!Promise<string>} */ (this.expandInputValue_(
      element,
      /*opt_sync*/ false
    ));
  }

  /**
   * Expands an input element value attribute with variable substituted.
   * @param {!HTMLInputElement} element
   * @return {string} Replaced string for testing
   */
  expandInputValueSync(element) {
    return /** @type {string} */ (this.expandInputValue_(
      element,
      /*opt_sync*/ true
    ));
  }

  /**
   * Expands in input element value attribute with variable substituted.
   * @param {!HTMLInputElement} element
   * @param {boolean=} opt_sync
   * @return {string|!Promise<string>}
   */
  expandInputValue_(element, opt_sync) {
    devAssert(
      element.tagName == 'INPUT' &&
        (element.getAttribute('type') || '').toLowerCase() == 'hidden',
      'Input value expansion only works on hidden input fields: %s',
      element
    );

    const whitelist = this.getWhitelistForElement_(element);
    if (!whitelist) {
      return opt_sync ? element.value : Promise.resolve(element.value);
    }
    if (element[ORIGINAL_VALUE_PROPERTY] === undefined) {
      element[ORIGINAL_VALUE_PROPERTY] = element.value;
    }
    const result = new Expander(
      this.variableSource_,
      /* opt_bindings */ undefined,
      /* opt_collectVars */ undefined,
      /* opt_sync */ opt_sync,
      /* opt_whitelist */ whitelist
    )./*OK*/ expand(element[ORIGINAL_VALUE_PROPERTY] || element.value);

    if (opt_sync) {
      return (element.value = result);
    }
    return result.then(newValue => {
      element.value = newValue;
      return newValue;
    });
  }

  /**
   * Returns a replacement whitelist from elements' data-amp-replace attribute.
   * @param {!Element} element
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
    whitelist
      .trim()
      .split(/\s+/)
      .forEach(replacement => {
        if (
          !opt_supportedReplacement ||
          hasOwn(opt_supportedReplacement, replacement)
        ) {
          requestedReplacements[replacement] = true;
        } else {
          user().warn('URL', 'Ignoring unsupported replacement', replacement);
        }
      });
    return requestedReplacements;
  }

  /**
   * Returns whether variable substitution is allowed for given url.
   * @param {!Location} url
   * @return {boolean}
   */
  isAllowedOrigin_(url) {
    const docInfo = Services.documentInfoForDoc(this.ampdoc);
    if (
      url.origin == parseUrlDeprecated(docInfo.canonicalUrl).origin ||
      url.origin == parseUrlDeprecated(docInfo.sourceUrl).origin
    ) {
      return true;
    }

    const meta = this.ampdoc
      .getRootNode()
      .querySelector('meta[name=amp-link-variable-allowed-origin]');

    if (meta && meta.hasAttribute('content')) {
      const whitelist = meta
        .getAttribute('content')
        .trim()
        .split(/\s+/);
      for (let i = 0; i < whitelist.length; i++) {
        if (url.origin == parseUrlDeprecated(whitelist[i]).origin) {
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
   * @param {?string} defaultUrlParams to expand link if caller request.
   * @return {string|undefined} Replaced string for testing
   */
  maybeExpandLink(element, defaultUrlParams) {
    devAssert(element.tagName == 'A');
    const supportedReplacements = {
      'CLIENT_ID': true,
      'QUERY_PARAM': true,
      'PAGE_VIEW_ID': true,
      'NAV_TIMING': true,
    };
    const additionalUrlParameters =
      element.getAttribute('data-amp-addparams') || '';
    const whitelist = this.getWhitelistForElement_(
      element,
      supportedReplacements
    );

    if (!whitelist && !additionalUrlParameters && !defaultUrlParams) {
      return;
    }
    // ORIGINAL_HREF_PROPERTY has the value of the href "pre-replacement".
    // We set this to the original value before doing any work and use it
    // on subsequent replacements, so that each run gets a fresh value.
    let href = dev().assertString(
      element[ORIGINAL_HREF_PROPERTY] || element.getAttribute('href')
    );
    const url = parseUrlDeprecated(href);
    if (element[ORIGINAL_HREF_PROPERTY] == null) {
      element[ORIGINAL_HREF_PROPERTY] = href;
    }
    if (additionalUrlParameters) {
      href = addParamsToUrl(href, parseQueryString(additionalUrlParameters));
    }

    const isAllowedOrigin = this.isAllowedOrigin_(url);
    if (!isAllowedOrigin) {
      if (whitelist) {
        user().warn(
          'URL',
          'Ignoring link replacement',
          href,
          " because the link does not go to the document's" +
            ' source, canonical, or whitelisted origin.'
        );
      }
      return (element.href = href);
    }

    // Note that defaultUrlParams is treated differently than
    // additionalUrlParameters in two ways #1: If the outgoing url origin is not
    // whitelisted: additionalUrlParameters are always appended by not expanded,
    // defaultUrlParams will not be appended. #2: If the expansion function is
    // not whitelisted: additionalUrlParamters will not be expanded,
    // defaultUrlParams will by default support QUERY_PARAM, and will still be
    // expanded.
    if (defaultUrlParams) {
      if (!whitelist || !whitelist['QUERY_PARAM']) {
        // override whitelist and expand defaultUrlParams;
        const overrideWhitelist = {'QUERY_PARAM': true};
        defaultUrlParams = this.expandUrlSync(
          defaultUrlParams,
          /* opt_bindings */ undefined,
          /* opt_collectVars */ undefined,
          /* opt_whitelist */ overrideWhitelist
        );
      }
      href = addParamsToUrl(href, parseQueryString(defaultUrlParams));
    }

    if (whitelist) {
      href = this.expandUrlSync(
        href,
        /* opt_bindings */ undefined,
        /* opt_collectVars */ undefined,
        /* opt_whitelist */ whitelist
      );
    }

    return (element.href = href);
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
    return new Expander(this.variableSource_, opt_bindings, vars)
      ./*OK*/ expand(url)
      .then(() => vars);
  }

  /**
   * Collects substitutions in the `src` attribute of the given element
   * that are _not_ whitelisted via `data-amp-replace` opt-in attribute.
   * @param {!Element} element
   * @return {!Array<string>}
   */
  collectUnwhitelistedVarsSync(element) {
    const url = element.getAttribute('src');
    const macroNames = new Expander(this.variableSource_).getMacroNames(url);
    const whitelist = this.getWhitelistForElement_(element);
    if (whitelist) {
      return macroNames.filter(v => !whitelist[v]);
    } else {
      // All vars are unwhitelisted if the element has no whitelist.
      return macroNames;
    }
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
    const newProtocol = parseUrlDeprecated(replacement, /* opt_nocache */ true)
      .protocol;
    const oldProtocol = parseUrlDeprecated(url, /* opt_nocache */ true)
      .protocol;
    if (newProtocol != oldProtocol) {
      user().error(TAG, 'Illegal replacement of the protocol: ', url);
      return url;
    }
    userAssert(
      isProtocolValid(replacement),
      'The replacement url has invalid protocol: %s',
      replacement
    );

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
 * @return {string}
 */
export function extractClientIdFromGaCookie(gaCookie) {
  return gaCookie.replace(/^(GA1|1)\.[\d-]+\./, '');
}

/**
 * @param {!./ampdoc-impl.AmpDoc} ampdoc
 */
export function installUrlReplacementsServiceForDoc(ampdoc) {
  registerServiceBuilderForDoc(ampdoc, 'url-replace', function(doc) {
    return new UrlReplacements(doc, new GlobalVariableSource(doc));
  });
}

/**
 * @param {!./ampdoc-impl.AmpDoc} ampdoc
 * @param {!Window} embedWin
 * @param {!VariableSource} varSource
 */
export function installUrlReplacementsForEmbed(ampdoc, embedWin, varSource) {
  installServiceInEmbedScope(
    embedWin,
    'url-replace',
    new UrlReplacements(ampdoc, varSource)
  );
}

/**
 * @typedef {{incomingFragment: string, outgoingFragment: string}}
 */
let ShareTrackingFragmentsDef;
