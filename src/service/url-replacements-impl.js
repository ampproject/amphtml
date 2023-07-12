import * as mode from '#core/mode';
import {hasOwn} from '#core/types/object';
import {getHashParams, parseQueryString} from '#core/types/string/url';
import {WindowInterface} from '#core/window/interface';

import {Services} from '#service';

import {dev, devAssert, user, userAssert} from '#utils/log';

import {Expander} from './url-expander/expander';
import {
  AsyncResolverDef,
  ResolverReturnDef,
  SyncResolverDef,
  VariableSource,
  getNavigationData,
  getTimingDataAsync,
  getTimingDataSync,
} from './variable-source';

import {getTrackImpressionPromise} from '../impression';
import {
  installServiceInEmbedDoc,
  registerServiceBuilderForDoc,
} from '../service-helpers';
import {
  addMissingParamsToUrl,
  addParamsToUrl,
  getSourceUrl,
  isProtocolValid,
  parseUrlDeprecated,
  removeAmpJsParamsFromUrl,
  removeFragment,
} from '../url';

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
 *
 * @param {{[key: string]: (string|Array<string})>|null} geo
 * @param {string} geoType
 * @return {string}
 */
function geoData(geo, geoType) {
  if (geoType) {
    userAssert(
      geoType === 'ISOCountry',
      'The value passed to AMP_GEO() is not valid name:' + geoType
    );
    return /** @type {string} */ ((geo && geo[geoType]) || 'unknown');
  }
  return /** @type {string} */ (
    geo?.matchedISOCountryGroups.join(GEO_DELIM) || 'unknown'
  );
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

    /** @private {{[key: string]: (string|Array<string})>|null} */
    this.cachedGeo_ = null;

    /** @private {{[key: string]: string}}*/
    this.cachedUach_ = {};
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

    /** @const {!./viewport/viewport-interface.ViewportInterface} */
    const viewport = Services.viewportForDoc(this.ampdoc);

    // Greedily cache the geo location if available for synchronous replacements.
    Services.geoForDocOrNull(this.ampdoc).then((geo) => {
      this.cachedGeo_ = geo;
    });

    // Returns a random value for cache busters.
    this.set('RANDOM', () => Math.random());

    // Provides a counter starting at 1 per given scope.
    const counterStore = Object.create(null);
    this.set('COUNTER', (scope) => {
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
      /** @type {AsyncResolverDef} */ (
        () => {
          return Services.viewerForDoc(this.ampdoc).getReferrerUrl();
        }
      )
    );

    // Like DOCUMENT_REFERRER, but returns null if the referrer is of
    // same domain or the corresponding CDN proxy.
    this.setAsync(
      'EXTERNAL_REFERRER',
      /** @type {AsyncResolverDef} */ (
        () => {
          return Services.viewerForDoc(this.ampdoc)
            .getReferrerUrl()
            .then((referrer) => {
              if (!referrer) {
                return null;
              }
              const referrerHostname = parseUrlDeprecated(
                getSourceUrl(referrer)
              ).hostname;
              const currentHostname = WindowInterface.getHostname(win);
              return referrerHostname === currentHostname ? null : referrer;
            });
        }
      )
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

    // Returns a random string that will be the constant for the duration of
    // single page view. It should have sufficient entropy to be unique for
    // all the page views a single user is making at a time.
    this.setAsync('PAGE_VIEW_ID_64', () => this.getDocInfo_().pageViewId64);

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
    this.set('FRAGMENT_PARAM', (param, defaultValue = '') => {
      return this.getFragmentParamData_(param, defaultValue);
    });

    /**
     * Stores client ids that were generated during this page view
     * indexed by scope.
     * @type {?{[key: string]: string}}
     */
    let clientIds = null;
    // Synchronous alternative. Only works for scopes that were previously
    // requested using the async method.
    this.setBoth(
      'CLIENT_ID',
      (scope) => {
        if (!clientIds) {
          return null;
        }
        return clientIds[scope];
      },
      (scope, opt_userNotificationId, opt_cookieName, opt_disableBackup) => {
        userAssert(
          scope,
          'The first argument to CLIENT_ID, the fallback' +
            /*OK*/ ' Cookie name, is required'
        );

        let consent = Promise.resolve();

        // If no `opt_userNotificationId` argument is provided then
        // assume consent is given by default.
        if (opt_userNotificationId) {
          consent = Services.userNotificationManagerForDoc(element).then(
            (service) => {
              return service.get(opt_userNotificationId);
            }
          );
        }
        return Services.cidForDoc(this.ampdoc)
          .then((cid) => {
            opt_disableBackup = opt_disableBackup == 'true' ? true : false;
            return cid.get(
              {
                /** @type {string} */ scope,
                createCookieIfNotPresent: true,
                cookieName: opt_cookieName || undefined,
                disableBackup: opt_disableBackup,
              },
              consent
            );
          })
          .then((cid) => {
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
      /** @type {AsyncResolverDef} */ (
        (experiment) => {
          return this.getVariantsValue_((variants) => {
            const variant = variants[/** @type {string} */ (experiment)];
            userAssert(
              variant !== undefined,
              'The value passed to VARIANT() is not a valid experiment in <amp-experiment>:' +
                experiment
            );
            // When no variant assigned, use reserved keyword 'none'.
            return variant === null ? 'none' : /** @type {string} */ (variant);
          }, 'VARIANT');
        }
      )
    );

    // Returns all assigned experiment variants in a serialized form.
    this.setAsync(
      'VARIANTS',
      /** @type {AsyncResolverDef} */ (
        () => {
          return this.getVariantsValue_((variants) => {
            const experiments = [];
            for (const experiment in variants) {
              const variant = variants[experiment];
              experiments.push(
                experiment + VARIANT_DELIMITER + (variant || 'none')
              );
            }
            return experiments.join(EXPERIMENT_DELIMITER);
          }, 'VARIANTS');
        }
      )
    );

    // Returns assigned geo value for geoType or all groups.
    this.setBoth(
      'AMP_GEO',
      (geoType) => geoData(this.cachedGeo_, geoType),
      (geoType) => this.getGeo_((geo) => geoData(geo, geoType), 'AMP_GEO')
    );

    // Returns the number of milliseconds since 1 Jan 1970 00:00:00 UTC.
    this.set('TIMESTAMP', dateMethod('getTime'));

    // Returns the human readable timestamp in format of
    // 2011-01-01T11:11:11.612Z.
    this.set('TIMESTAMP_ISO', dateMethod('toISOString'));

    // Returns the user's time-zone offset from UTC, in minutes.
    this.set('TIMEZONE', dateMethod('getTimezoneOffset'));

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
        // Only used on IE.
        nav['userLanguage'] ||
        nav.browserLanguage ||
        ''
      ).toLowerCase();
    });

    // Returns the user agent.
    this.set('USER_AGENT', () => {
      return win.navigator.userAgent;
    });

    // Returns the user agent client hint.
    this.setBoth(
      'UACH',
      // Synchronous alternative, will only work if the requested values were
      // previously requested using the async method.
      (variable) => this.cachedUach_[variable] ?? '',
      (variable) => this.getUach_(variable, win)
    );

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
      /** @type {AsyncResolverDef} */ (
        () => {
          return this.getAccessValue_((accessService) => {
            return accessService.getAccessReaderId();
          }, 'ACCESS_READER_ID');
        }
      )
    );

    // Access: data from the authorization response.
    this.setAsync(
      'AUTHDATA',
      /** @type {AsyncResolverDef} */ (
        (field) => {
          userAssert(
            field,
            'The first argument to AUTHDATA, the field, is required'
          );
          return this.getAccessValue_((accessService) => {
            return accessService.getAuthdataField(field);
          }, 'AUTHDATA');
        }
      )
    );

    // Returns an identifier for the viewer.
    this.setAsync('VIEWER', () => {
      return Services.viewerForDoc(this.ampdoc)
        .getViewerOrigin()
        .then((viewer) => {
          return viewer == undefined ? '' : viewer;
        });
    });

    // Returns the total engaged time since the content became viewable.
    this.setAsync('TOTAL_ENGAGED_TIME', () => {
      return Services.activityForDoc(element).then((activity) => {
        return activity.getTotalEngagedTime();
      });
    });

    // Returns the incremental engaged time since the last push under the
    // same name.
    this.setAsync('INCREMENTAL_ENGAGED_TIME', (name, reset) => {
      return Services.activityForDoc(element).then((activity) => {
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
    this.set('AMP_VERSION', () => mode.version());

    this.set('BACKGROUND_STATE', () => {
      return this.ampdoc.isVisible() ? '0' : '1';
    });

    this.setAsync('VIDEO_STATE', (id, property) => {
      return Services.videoManagerForDoc(this.ampdoc).getVideoStateProperty(
        id,
        property
      );
    });

    this.setAsync('AMP_STATE', (key) => {
      // This is safe since AMP_STATE is not an A4A allowlisted variable.
      const root = this.ampdoc.getRootNode();
      const element = /** @type {!Element|!ShadowRoot} */ (
        root.documentElement || root
      );
      return Services.bindForDocOrNull(element).then((bind) => {
        if (!bind) {
          return '';
        }
        return bind.getStateValue(/** @type {string} */ (key)) || '';
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
    const {replaceParams} = this.getDocInfo_();
    if (!replaceParams) {
      return orig;
    }
    return addMissingParamsToUrl(
      removeAmpJsParamsFromUrl(orig),
      /** @type {!JsonObject} */ (replaceParams)
    );
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
   * @return {?T}
   * @template T
   * @private
   */
  getAccessValue_(getter, expr) {
    const element = this.ampdoc.getHeadNode();
    return Promise.all([
      Services.accessServiceForDocOrNull(element),
      Services.subscriptionsServiceForDocOrNull(element),
    ]).then((services) => {
      const accessService =
        /** @type {?../../extensions/amp-access/0.1/access-vars.AccessVars} */ (
          services[0]
        );
      const subscriptionService =
        /** @type {?../../extensions/amp-access/0.1/access-vars.AccessVars} */ (
          services[1]
        );
      const service = accessService || subscriptionService;
      if (!service) {
        // Access/subscriptions service is not installed.
        user().error(
          TAG,
          'Access or subsciptions service is not installed to access: ',
          expr
        );
        return null;
      }

      // If both an access and subscription service are present, prefer
      // subscription then fall back to access because access can be namespaced.
      if (accessService && subscriptionService) {
        return getter(subscriptionService) || getter(accessService);
      }

      return getter(service);
    });
  }

  /**
   * Return the QUERY_PARAM from the current location href
   * @param {string} param
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
    const {replaceParams} = this.getDocInfo_();
    if (typeof params[param] !== 'undefined') {
      return params[param];
    }
    if (replaceParams && typeof replaceParams[param] !== 'undefined') {
      return /** @type {string} */ (replaceParams[param]);
    }
    return defaultValue;
  }

  /**
   * Return the FRAGMENT_PARAM from the original location href
   * @param {*} param
   * @param {string} defaultValue
   * @return {string}
   * @private
   */
  getFragmentParamData_(param, defaultValue) {
    userAssert(
      param,
      'The first argument to FRAGMENT_PARAM, the fragment string ' +
        'param is required'
    );
    userAssert(typeof param == 'string', 'param should be a string');
    const params = getHashParams(this.ampdoc.win);
    return params[param] === undefined ? defaultValue : params[param];
  }

  /**
   * Resolves the value via amp-experiment's variants service.
   * @param {function(!{[key: string]: string}):(?string)} getter
   * @param {string} expr
   * @return {!Promise<?string>}
   * @template T
   * @private
   */
  getVariantsValue_(getter, expr) {
    return Services.variantsForDocOrNull(this.ampdoc.getHeadNode())
      .then((variants) => {
        userAssert(
          variants,
          'To use variable %s, amp-experiment should be configured',
          expr
        );
        return variants.getVariants();
      })
      .then((variantsMap) => getter(variantsMap));
  }

  /**
   * Resolves the value via geo service.
   * @param {function(!../../extensions/amp-geo/0.1/amp-geo.GeoDef)} getter
   * @param {string} expr
   * @return {!Promise<{[key: string]: (string|Array<string})>>}
   * @template T
   * @private
   */
  getGeo_(getter, expr) {
    if (this.cachedGeo_ !== null) {
      return getter(this.cachedGeo_);
    }

    return Services.geoForDocOrNull(this.ampdoc.getHeadNode()).then((geo) => {
      userAssert(geo, 'To use variable %s, amp-geo should be configured', expr);
      this.cachedGeo_ = geo;
      return getter(geo);
    });
  }

  /**
   * Returns cached uach signal if available, calculate it if not.
   * @param {string} variable
   * @param {!Window} win
   * @return {!Promise<string>}
   */
  getUach_(variable, win) {
    if (variable in this.cachedUach_) {
      return Promise.resolve(this.cachedUach_[variable]);
    } else {
      return (
        win.navigator?.userAgentData
          ?.getHighEntropyValues([variable])
          ?.then((values) => {
            const value =
              typeof values[variable] !== 'object'
                ? values[variable]
                : JSON.stringify(values[variable]);
            this.cachedUach_[variable] = value;
            return value;
          }) || Promise.resolve('')
      );
    }
  }
}

/**
 * This class replaces substitution variables with their values.
 * Document new values in ../docs/spec/amp-var-substitutions.md
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
   * @param {!{[key: string]: (ResolverReturnDef|!SyncResolverDef)}=} opt_bindings
   * @param {!{[key: string]: boolean}=} opt_allowlist Optional allowlist of
   *     names that can be substituted.
   * @return {string}
   */
  expandStringSync(source, opt_bindings, opt_allowlist) {
    return /** @type {string} */ (
      new Expander(
        this.variableSource_,
        opt_bindings,
        /* opt_collectVars */ undefined,
        /* opt_sync */ true,
        opt_allowlist,
        /* opt_noEncode */ true
      )./*OK*/ expand(source)
    );
  }

  /**
   * Expands the provided source by replacing all known variables with their
   * resolved values. Optional `opt_bindings` can be used to add new variables
   * or override existing ones.
   * @param {string} source
   * @param {!{[key: string]: *}=} opt_bindings
   * @param {!{[key: string]: boolean}=} opt_allowlist
   * @return {!Promise<string>}
   */
  expandStringAsync(source, opt_bindings, opt_allowlist) {
    return /** @type {!Promise<string>} */ (
      new Expander(
        this.variableSource_,
        opt_bindings,
        /* opt_collectVars */ undefined,
        /* opt_sync */ undefined,
        opt_allowlist,
        /* opt_noEncode */ true
      )./*OK*/ expand(source)
    );
  }

  /**
   * Synchronously expands the provided URL by replacing all known variables
   * with their resolved values. Optional `opt_bindings` can be used to add new
   * variables or override existing ones.  Any async bindings are ignored.
   * @param {string} url
   * @param {!{[key: string]: (ResolverReturnDef|!SyncResolverDef)}=} opt_bindings
   * @param {!{[key: string]: boolean}=} opt_allowlist Optional allowlist of
   *     names that can be substituted.
   * @return {string}
   */
  expandUrlSync(url, opt_bindings, opt_allowlist) {
    return this.ensureProtocolMatches_(
      url,
      /** @type {string} */ (
        new Expander(
          this.variableSource_,
          opt_bindings,
          /* opt_collectVars */ undefined,
          /* opt_sync */ true,
          opt_allowlist
        )./*OK*/ expand(url)
      )
    );
  }

  /**
   * Expands the provided URL by replacing all known variables with their
   * resolved values. Optional `opt_bindings` can be used to add new variables
   * or override existing ones.
   * @param {string} url
   * @param {!{[key: string]: *}=} opt_bindings
   * @param {!{[key: string]: boolean}=} opt_allowlist Optional allowlist of names
   *     that can be substituted.
   * @param {boolean=} opt_noEncode should not encode URL
   * @return {!Promise<string>}
   */
  expandUrlAsync(url, opt_bindings, opt_allowlist, opt_noEncode) {
    return /** @type {!Promise<string>} */ (
      new Expander(
        this.variableSource_,
        opt_bindings,
        /* opt_collectVars */ undefined,
        /* opt_sync */ undefined,
        opt_allowlist,
        opt_noEncode
      )
        ./*OK*/ expand(url)
        .then((replacement) => this.ensureProtocolMatches_(url, replacement))
    );
  }

  /**
   * Expands an input element value attribute with variable substituted.
   * @param {!HTMLInputElement} element
   * @return {!Promise<string>}
   */
  expandInputValueAsync(element) {
    return /** @type {!Promise<string>} */ (
      this.expandInputValue_(element, /*opt_sync*/ false)
    );
  }

  /**
   * Expands an input element value attribute with variable substituted.
   * @param {!HTMLInputElement} element
   * @return {string} Replaced string for testing
   */
  expandInputValueSync(element) {
    return /** @type {string} */ (
      this.expandInputValue_(element, /*opt_sync*/ true)
    );
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

    const allowlist = this.getAllowlistForElement_(element);
    if (!allowlist) {
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
      /* opt_allowlist */ allowlist
    )./*OK*/ expand(element[ORIGINAL_VALUE_PROPERTY] || element.value);

    if (opt_sync) {
      return (element.value = result);
    }
    return result.then((newValue) => {
      element.value = newValue;
      return newValue;
    });
  }

  /**
   * Returns a replacement allowlist from elements' data-amp-replace attribute.
   * @param {!Element} element
   * @param {!{[key: string]: boolean}=} opt_supportedReplacement Optional supported
   * replacement that filters allowlist to a subset.
   * @return {!{[key: string]: boolean}|undefined}
   */
  getAllowlistForElement_(element, opt_supportedReplacement) {
    const allowlist = element.getAttribute('data-amp-replace');
    if (!allowlist) {
      return;
    }
    const requestedReplacements = {};
    allowlist
      .trim()
      .split(/\s+/)
      .forEach((replacement) => {
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

    const meta = this.ampdoc.getMetaByName('amp-link-variable-allowed-origin');
    if (meta) {
      const allowlist = meta.trim().split(/\s+/);
      for (let i = 0; i < allowlist.length; i++) {
        if (url.origin == parseUrlDeprecated(allowlist[i]).origin) {
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
    const aElement = /** @type {!HTMLAnchorElement} */ (element);
    const supportedReplacements = {
      'CLIENT_ID': true,
      'QUERY_PARAM': true,
      'PAGE_VIEW_ID': true,
      'PAGE_VIEW_ID_64': true,
      'NAV_TIMING': true,
    };
    let additionalUrlParameters =
      aElement.getAttribute('data-amp-addparams') || '';
    const allowlist = this.getAllowlistForElement_(
      aElement,
      supportedReplacements
    );

    if (!allowlist && !additionalUrlParameters && !defaultUrlParams) {
      return;
    }
    // ORIGINAL_HREF_PROPERTY has the value of the href "pre-replacement".
    // We set this to the original value before doing any work and use it
    // on subsequent replacements, so that each run gets a fresh value.
    let href = dev().assertString(
      aElement[ORIGINAL_HREF_PROPERTY] || aElement.getAttribute('href')
    );
    const url = parseUrlDeprecated(href);
    if (aElement[ORIGINAL_HREF_PROPERTY] == null) {
      aElement[ORIGINAL_HREF_PROPERTY] = href;
    }

    const isAllowedOrigin = this.isAllowedOrigin_(url);
    if (additionalUrlParameters) {
      additionalUrlParameters = isAllowedOrigin
        ? this.expandSyncIfAllowedList_(additionalUrlParameters, allowlist)
        : additionalUrlParameters;
      href = addParamsToUrl(href, parseQueryString(additionalUrlParameters));
    }

    if (!isAllowedOrigin) {
      if (allowlist) {
        user().warn(
          'URL',
          'Ignoring link replacement %s' +
            " because the link does not go to the document's" +
            ' source, canonical, or allowlisted origin.',
          href
        );
      }
      return (aElement.href = href);
    }

    // Note that defaultUrlParams is treated differently than
    // additionalUrlParameters in two ways #1: If the outgoing url origin is not
    // allowlisted: additionalUrlParameters are always appended by not expanded,
    // defaultUrlParams will not be appended. #2: If the expansion function is
    // not allowlisted: additionalUrlParamters will not be expanded,
    // defaultUrlParams will by default support QUERY_PARAM, and will still be
    // expanded.
    if (defaultUrlParams) {
      if (!allowlist || !allowlist['QUERY_PARAM']) {
        // override allowlist and expand defaultUrlParams;
        const overrideAllowlist = {'QUERY_PARAM': true};
        defaultUrlParams = this.expandUrlSync(
          defaultUrlParams,
          /* opt_bindings */ undefined,
          /* opt_allowlist */ overrideAllowlist
        );
      }
      href = addParamsToUrl(href, parseQueryString(defaultUrlParams));
    }

    href = this.expandSyncIfAllowedList_(href, allowlist);

    return (aElement.href = href);
  }

  /**
   * @param {string} href
   * @param {!{[key: string]: boolean}|undefined} allowlist
   * @return {string}
   */
  expandSyncIfAllowedList_(href, allowlist) {
    return allowlist
      ? this.expandUrlSync(
          href,
          /* opt_bindings */ undefined,
          /* opt_allowlist */ allowlist
        )
      : href;
  }

  /**
   * Collects all substitutions in the provided URL and expands them to the
   * values for known variables. Optional `opt_bindings` can be used to add
   * new variables or override existing ones.
   * @param {string} url
   * @param {!{[key: string]: *}=} opt_bindings
   * @return {!Promise<!{[key: string]: *}>}
   */
  collectVars(url, opt_bindings) {
    const vars = Object.create(null);
    return new Expander(this.variableSource_, opt_bindings, vars)
      ./*OK*/ expand(url)
      .then(() => vars);
  }

  /**
   * Collects substitutions in the `src` attribute of the given element
   * that are _not_ allowlisted via `data-amp-replace` opt-in attribute.
   * @param {!Element} element
   * @return {!Array<string>}
   */
  collectDisallowedVarsSync(element) {
    const url = element.getAttribute('src');
    const macroNames = new Expander(this.variableSource_).getMacroNames(url);
    const allowlist = this.getAllowlistForElement_(element);
    if (allowlist) {
      return macroNames.filter((v) => !allowlist[v]);
    } else {
      // All vars are unallowlisted if the element has no allowlist.
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
    const newProtocol = parseUrlDeprecated(
      replacement,
      /* opt_nocache */ true
    ).protocol;
    const oldProtocol = parseUrlDeprecated(
      url,
      /* opt_nocache */ true
    ).protocol;
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
  registerServiceBuilderForDoc(ampdoc, 'url-replace', function (doc) {
    return new UrlReplacements(doc, new GlobalVariableSource(doc));
  });
}

/**
 * @param {!./ampdoc-impl.AmpDoc} ampdoc
 * @param {!VariableSource} varSource
 */
export function installUrlReplacementsForEmbed(ampdoc, varSource) {
  installServiceInEmbedDoc(
    ampdoc,
    'url-replace',
    new UrlReplacements(ampdoc, varSource)
  );
}

/**
 * @typedef {{incomingFragment: string, outgoingFragment: string}}
 */
let ShareTrackingFragmentsDef;
