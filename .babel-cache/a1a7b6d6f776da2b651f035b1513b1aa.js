function _typeof(obj) {"@babel/helpers - typeof";if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {_typeof = function _typeof(obj) {return typeof obj;};} else {_typeof = function _typeof(obj) {return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;};}return _typeof(obj);}import { resolvedPromise as _resolvedPromise } from "./../core/data-structures/promise";function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError("Cannot call a class as a function");}}function _defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}function _createClass(Constructor, protoProps, staticProps) {if (protoProps) _defineProperties(Constructor.prototype, protoProps);if (staticProps) _defineProperties(Constructor, staticProps);return Constructor;}function _inherits(subClass, superClass) {if (typeof superClass !== "function" && superClass !== null) {throw new TypeError("Super expression must either be null or a function");}subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } });if (superClass) _setPrototypeOf(subClass, superClass);}function _setPrototypeOf(o, p) {_setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) {o.__proto__ = p;return o;};return _setPrototypeOf(o, p);}function _createSuper(Derived) {var hasNativeReflectConstruct = _isNativeReflectConstruct();return function _createSuperInternal() {var Super = _getPrototypeOf(Derived),result;if (hasNativeReflectConstruct) {var NewTarget = _getPrototypeOf(this).constructor;result = Reflect.construct(Super, arguments, NewTarget);} else {result = Super.apply(this, arguments);}return _possibleConstructorReturn(this, result);};}function _possibleConstructorReturn(self, call) {if (call && (_typeof(call) === "object" || typeof call === "function")) {return call;}return _assertThisInitialized(self);}function _assertThisInitialized(self) {if (self === void 0) {throw new ReferenceError("this hasn't been initialised - super() hasn't been called");}return self;}function _isNativeReflectConstruct() {if (typeof Reflect === "undefined" || !Reflect.construct) return false;if (Reflect.construct.sham) return false;if (typeof Proxy === "function") return true;try {Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {}));return true;} catch (e) {return false;}}function _getPrototypeOf(o) {_getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) {return o.__proto__ || Object.getPrototypeOf(o);};return _getPrototypeOf(o);} /**
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

import { hasOwn } from "../core/types/object";
import { parseQueryString } from "../core/types/string/url";
import { WindowInterface } from "../core/window/interface";

import { Services } from "./";

import { Expander } from "./url-expander/expander";
import {
AsyncResolverDef,
ResolverReturnDef,
SyncResolverDef,
VariableSource,
getNavigationData,
getTimingDataAsync,
getTimingDataSync } from "./variable-source";


import { getTrackImpressionPromise } from "../impression";
import { internalRuntimeVersion } from "../internal-version";
import { dev, devAssert, user, userAssert } from "../log";
import {
installServiceInEmbedDoc,
registerServiceBuilderForDoc } from "../service-helpers";

import {
addMissingParamsToUrl,
addParamsToUrl,
getSourceUrl,
isProtocolValid,
parseUrlDeprecated,
removeAmpJsParamsFromUrl,
removeFragment } from "../url";


/** @private @const {string} */
var TAG = 'UrlReplacements';
var EXPERIMENT_DELIMITER = '!';
var VARIANT_DELIMITER = '.';
var GEO_DELIM = ',';
var ORIGINAL_HREF_PROPERTY = 'amp-original-href';
var ORIGINAL_VALUE_PROPERTY = 'amp-original-value';

/**
 * Returns a function that executes method on a new Date instance. This is a
 * byte saving hack.
 *
 * @param {string} method
 * @return {!SyncResolverDef}
 */
function dateMethod(method) {
  return function () {return new Date()[method]();};
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
  return function () {return screen[property];};
}

/**
 * Class to provide variables that pertain to top level AMP window.
 */
export var GlobalVariableSource = /*#__PURE__*/function (_VariableSource) {_inherits(GlobalVariableSource, _VariableSource);var _super = _createSuper(GlobalVariableSource);function GlobalVariableSource() {_classCallCheck(this, GlobalVariableSource);return _super.apply(this, arguments);}_createClass(GlobalVariableSource, [{ key: "setTimingResolver_", value:
    /**
     * Utility function for setting resolver for timing data that supports
     * sync and async.
     * @param {string} varName
     * @param {string} startEvent
     * @param {string=} endEvent
     * @return {!VariableSource}
     * @private
     */
    function setTimingResolver_(varName, startEvent, endEvent) {var _this = this;
      return this.setBoth(
      varName,
      function () {
        return getTimingDataSync(_this.ampdoc.win, startEvent, endEvent);
      },
      function () {
        return getTimingDataAsync(_this.ampdoc.win, startEvent, endEvent);
      });

    }

    /** @override */ }, { key: "initialize", value:
    function initialize() {var _this2 = this;
      var win = this.ampdoc.win;
      var element = this.ampdoc.getHeadNode();

      /** @const {!./viewport/viewport-interface.ViewportInterface} */
      var viewport = Services.viewportForDoc(this.ampdoc);

      // Returns a random value for cache busters.
      this.set('RANDOM', function () {return Math.random();});

      // Provides a counter starting at 1 per given scope.
      var counterStore = Object.create(null);
      this.set('COUNTER', function (scope) {
        return (counterStore[scope] = (counterStore[scope] | 0) + 1);
      });

      // Returns the canonical URL for this AMP document.
      this.set('CANONICAL_URL', function () {return _this2.getDocInfo_().canonicalUrl;});

      // Returns the host of the canonical URL for this AMP document.
      this.set(
      'CANONICAL_HOST',
      function () {return parseUrlDeprecated(_this2.getDocInfo_().canonicalUrl).host;});


      // Returns the hostname of the canonical URL for this AMP document.
      this.set(
      'CANONICAL_HOSTNAME',
      function () {return parseUrlDeprecated(_this2.getDocInfo_().canonicalUrl).hostname;});


      // Returns the path of the canonical URL for this AMP document.
      this.set(
      'CANONICAL_PATH',
      function () {return parseUrlDeprecated(_this2.getDocInfo_().canonicalUrl).pathname;});


      // Returns the referrer URL.
      this.setAsync(
      'DOCUMENT_REFERRER',
      /** @type {AsyncResolverDef} */(
      function () {
        return Services.viewerForDoc(_this2.ampdoc).getReferrerUrl();
      }));



      // Like DOCUMENT_REFERRER, but returns null if the referrer is of
      // same domain or the corresponding CDN proxy.
      this.setAsync(
      'EXTERNAL_REFERRER',
      /** @type {AsyncResolverDef} */(
      function () {
        return Services.viewerForDoc(_this2.ampdoc).
        getReferrerUrl().
        then(function (referrer) {
          if (!referrer) {
            return null;
          }
          var referrerHostname = parseUrlDeprecated(
          getSourceUrl(referrer)).
          hostname;
          var currentHostname = WindowInterface.getHostname(win);
          return referrerHostname === currentHostname ? null : referrer;
        });
      }));



      // Returns the title of this AMP document.
      this.set('TITLE', function () {
        // The environment may override the title and set originalTitle. Prefer
        // that if available.
        var doc = win.document;
        return doc['originalTitle'] || doc.title;
      });

      // Returns the URL for this AMP document.
      this.set('AMPDOC_URL', function () {
        return removeFragment(_this2.addReplaceParamsIfMissing_(win.location.href));
      });

      // Returns the host of the URL for this AMP document.
      this.set('AMPDOC_HOST', function () {
        var url = parseUrlDeprecated(win.location.href);
        return url && url.host;
      });

      // Returns the hostname of the URL for this AMP document.
      this.set('AMPDOC_HOSTNAME', function () {
        var url = parseUrlDeprecated(win.location.href);
        return url && url.hostname;
      });

      // Returns the Source URL for this AMP document.
      var expandSourceUrl = function expandSourceUrl() {
        var docInfo = _this2.getDocInfo_();
        return removeFragment(_this2.addReplaceParamsIfMissing_(docInfo.sourceUrl));
      };
      this.setBoth(
      'SOURCE_URL',
      function () {return expandSourceUrl();},
      function () {return getTrackImpressionPromise().then(function () {return expandSourceUrl();});});


      // Returns the host of the Source URL for this AMP document.
      this.set(
      'SOURCE_HOST',
      function () {return parseUrlDeprecated(_this2.getDocInfo_().sourceUrl).host;});


      // Returns the hostname of the Source URL for this AMP document.
      this.set(
      'SOURCE_HOSTNAME',
      function () {return parseUrlDeprecated(_this2.getDocInfo_().sourceUrl).hostname;});


      // Returns the path of the Source URL for this AMP document.
      this.set(
      'SOURCE_PATH',
      function () {return parseUrlDeprecated(_this2.getDocInfo_().sourceUrl).pathname;});


      // Returns a random string that will be the constant for the duration of
      // single page view. It should have sufficient entropy to be unique for
      // all the page views a single user is making at a time.
      this.set('PAGE_VIEW_ID', function () {return _this2.getDocInfo_().pageViewId;});

      // Returns a random string that will be the constant for the duration of
      // single page view. It should have sufficient entropy to be unique for
      // all the page views a single user is making at a time.
      this.setAsync('PAGE_VIEW_ID_64', function () {return _this2.getDocInfo_().pageViewId64;});

      this.setBoth(
      'QUERY_PARAM',
      function (param) {var defaultValue = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';
        return _this2.getQueryParamData_(param, defaultValue);
      },
      function (param) {var defaultValue = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';
        return getTrackImpressionPromise().then(function () {
          return _this2.getQueryParamData_(param, defaultValue);
        });
      });


      // Returns the value of the given field name in the fragment query string.
      // Second parameter is an optional default value.
      // For example, if location is 'pub.com/amp.html?x=1#y=2' then
      // FRAGMENT_PARAM(y) returns '2' and FRAGMENT_PARAM(z, 3) returns 3.
      this.set('FRAGMENT_PARAM', function (param) {var defaultValue = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';
        return _this2.getFragmentParamData_(param, defaultValue);
      });

      /**
       * Stores client ids that were generated during this page view
       * indexed by scope.
       * @type {?Object<string, string>}
       */
      var clientIds = null;
      // Synchronous alternative. Only works for scopes that were previously
      // requested using the async method.
      this.setBoth(
      'CLIENT_ID',
      function (scope) {
        if (!clientIds) {
          return null;
        }
        return clientIds[scope];
      },
      function (scope, opt_userNotificationId, opt_cookieName, opt_disableBackup) {
        userAssert(
        scope,
        'The first argument to CLIENT_ID, the fallback' +
        /*OK*/' Cookie name, is required');


        var consent = _resolvedPromise();

        // If no `opt_userNotificationId` argument is provided then
        // assume consent is given by default.
        if (opt_userNotificationId) {
          consent = Services.userNotificationManagerForDoc(element).then(
          function (service) {
            return service.get(opt_userNotificationId);
          });

        }
        return Services.cidForDoc(_this2.ampdoc).
        then(function (cid) {
          opt_disableBackup = opt_disableBackup == 'true' ? true : false;
          return cid.get(
          {
            /** @type {string} */scope: scope,
            createCookieIfNotPresent: true,
            cookieName: opt_cookieName || undefined,
            disableBackup: opt_disableBackup },

          consent);

        }).
        then(function (cid) {
          if (!clientIds) {
            clientIds = Object.create(null);
          }

          // A temporary work around to extract Client ID from _ga cookie. #5761
          // TODO: replace with "filter" when it's in place. #2198
          var cookieName = opt_cookieName || scope;
          if (cid && cookieName == '_ga') {
            if (typeof cid === 'string') {
              cid = extractClientIdFromGaCookie(cid);
            } else {
              // TODO(@jridgewell, #11120): remove once #11120 is figured out.
              // Do not log the CID directly, that's PII.
              dev().error(
              TAG,
              'non-string cid, what is it?',
              Object.keys(cid));

            }
          }

          clientIds[scope] = cid;
          return cid;
        });
      });


      // Returns assigned variant name for the given experiment.
      this.setAsync(
      'VARIANT',
      /** @type {AsyncResolverDef} */(
      function (experiment) {
        return _this2.getVariantsValue_(function (variants) {
          var variant = variants[/** @type {string} */(experiment)];
          userAssert(
          variant !== undefined,
          'The value passed to VARIANT() is not a valid experiment in <amp-experiment>:' +
          experiment);

          // When no variant assigned, use reserved keyword 'none'.
          return variant === null ? 'none' : /** @type {string} */(variant);
        }, 'VARIANT');
      }));



      // Returns all assigned experiment variants in a serialized form.
      this.setAsync(
      'VARIANTS',
      /** @type {AsyncResolverDef} */(
      function () {
        return _this2.getVariantsValue_(function (variants) {
          var experiments = [];
          for (var experiment in variants) {
            var variant = variants[experiment];
            experiments.push(
            experiment + VARIANT_DELIMITER + (variant || 'none'));

          }
          return experiments.join(EXPERIMENT_DELIMITER);
        }, 'VARIANTS');
      }));



      // Returns assigned geo value for geoType or all groups.
      this.setAsync(
      'AMP_GEO',
      /** @type {AsyncResolverDef} */(
      function (geoType) {
        return _this2.getGeo_(function (geos) {
          if (geoType) {
            userAssert(
            geoType === 'ISOCountry',
            'The value passed to AMP_GEO() is not valid name:' + geoType);

            return (/** @type {string} */(geos[geoType] || 'unknown'));
          }
          return (/** @type {string} */(
            geos.matchedISOCountryGroups.join(GEO_DELIM)));

        }, 'AMP_GEO');
      }));



      // Returns the number of milliseconds since 1 Jan 1970 00:00:00 UTC.
      this.set('TIMESTAMP', dateMethod('getTime'));

      // Returns the human readable timestamp in format of
      // 2011-01-01T11:11:11.612Z.
      this.set('TIMESTAMP_ISO', dateMethod('toISOString'));

      // Returns the user's time-zone offset from UTC, in minutes.
      this.set('TIMEZONE', dateMethod('getTimezoneOffset'));

      // Returns a promise resolving to viewport.getScrollHeight.
      this.set('SCROLL_HEIGHT', function () {return viewport.getScrollHeight();});

      // Returns a promise resolving to viewport.getScrollWidth.
      this.set('SCROLL_WIDTH', function () {return viewport.getScrollWidth();});

      // Returns the viewport height.
      this.set('VIEWPORT_HEIGHT', function () {return viewport.getHeight();});

      // Returns the viewport width.
      this.set('VIEWPORT_WIDTH', function () {return viewport.getWidth();});

      var screen = win.screen;
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
      this.set('DOCUMENT_CHARSET', function () {
        var doc = win.document;
        return doc.characterSet || doc.charset;
      });

      // Returns the browser language.
      this.set('BROWSER_LANGUAGE', function () {
        var nav = win.navigator;
        return (
        nav.language ||
        // Only used on IE.
        nav['userLanguage'] ||
        nav.browserLanguage ||
        '').
        toLowerCase();
      });

      // Returns the user agent.
      this.set('USER_AGENT', function () {
        return win.navigator.userAgent;
      });

      // Returns the time it took to load the whole page. (excludes amp-* elements
      // that are not rendered by the system yet.)
      this.setTimingResolver_(
      'PAGE_LOAD_TIME',
      'navigationStart',
      'loadEventStart');


      // Returns the time it took to perform DNS lookup for the domain.
      this.setTimingResolver_(
      'DOMAIN_LOOKUP_TIME',
      'domainLookupStart',
      'domainLookupEnd');


      // Returns the time it took to connect to the server.
      this.setTimingResolver_('TCP_CONNECT_TIME', 'connectStart', 'connectEnd');

      // Returns the time it took for server to start sending a response to the
      // request.
      this.setTimingResolver_(
      'SERVER_RESPONSE_TIME',
      'requestStart',
      'responseStart');


      // Returns the time it took to download the page.
      this.setTimingResolver_(
      'PAGE_DOWNLOAD_TIME',
      'responseStart',
      'responseEnd');


      // Returns the time it took for redirects to complete.
      this.setTimingResolver_('REDIRECT_TIME', 'navigationStart', 'fetchStart');

      // Returns the time it took for DOM to become interactive.
      this.setTimingResolver_(
      'DOM_INTERACTIVE_TIME',
      'navigationStart',
      'domInteractive');


      // Returns the time it took for content to load.
      this.setTimingResolver_(
      'CONTENT_LOAD_TIME',
      'navigationStart',
      'domContentLoadedEventStart');


      // Access: Reader ID.
      this.setAsync(
      'ACCESS_READER_ID',
      /** @type {AsyncResolverDef} */(
      function () {
        return _this2.getAccessValue_(function (accessService) {
          return accessService.getAccessReaderId();
        }, 'ACCESS_READER_ID');
      }));



      // Access: data from the authorization response.
      this.setAsync(
      'AUTHDATA',
      /** @type {AsyncResolverDef} */(
      function (field) {
        userAssert(
        field,
        'The first argument to AUTHDATA, the field, is required');

        return _this2.getAccessValue_(function (accessService) {
          return accessService.getAuthdataField(field);
        }, 'AUTHDATA');
      }));



      // Returns an identifier for the viewer.
      this.setAsync('VIEWER', function () {
        return Services.viewerForDoc(_this2.ampdoc).
        getViewerOrigin().
        then(function (viewer) {
          return viewer == undefined ? '' : viewer;
        });
      });

      // Returns the total engaged time since the content became viewable.
      this.setAsync('TOTAL_ENGAGED_TIME', function () {
        return Services.activityForDoc(element).then(function (activity) {
          return activity.getTotalEngagedTime();
        });
      });

      // Returns the incremental engaged time since the last push under the
      // same name.
      this.setAsync('INCREMENTAL_ENGAGED_TIME', function (name, reset) {
        return Services.activityForDoc(element).then(function (activity) {
          return activity.getIncrementalEngagedTime(
          /** @type {string} */(name),
          reset !== 'false');

        });
      });

      this.set('NAV_TIMING', function (startAttribute, endAttribute) {
        userAssert(
        startAttribute,
        'The first argument to NAV_TIMING, the ' +
        'start attribute name, is required');

        return getTimingDataSync(
        win,
        /**@type {string}*/(startAttribute),
        /**@type {string}*/(endAttribute));

      });
      this.setAsync('NAV_TIMING', function (startAttribute, endAttribute) {
        userAssert(
        startAttribute,
        'The first argument to NAV_TIMING, the ' +
        'start attribute name, is required');

        return getTimingDataAsync(
        win,
        /**@type {string}*/(startAttribute),
        /**@type {string}*/(endAttribute));

      });

      this.set('NAV_TYPE', function () {
        return getNavigationData(win, 'type');
      });

      this.set('NAV_REDIRECT_COUNT', function () {
        return getNavigationData(win, 'redirectCount');
      });

      // returns the AMP version number
      this.set('AMP_VERSION', function () {return internalRuntimeVersion();});

      this.set('BACKGROUND_STATE', function () {
        return _this2.ampdoc.isVisible() ? '0' : '1';
      });

      this.setAsync('VIDEO_STATE', function (id, property) {
        return Services.videoManagerForDoc(_this2.ampdoc).getVideoStateProperty(
        id,
        property);

      });

      this.setAsync('AMP_STATE', function (key) {
        // This is safe since AMP_STATE is not an A4A allowlisted variable.
        var root = _this2.ampdoc.getRootNode();
        var element = /** @type {!Element|!ShadowRoot} */(
        root.documentElement || root);

        return Services.bindForDocOrNull(element).then(function (bind) {
          if (!bind) {
            return '';
          }
          return bind.getStateValue( /** @type {string} */(key)) || '';
        });
      });
    }

    /**
     * Merges any replacement parameters into a given URL's query string,
     * preferring values set in the original query string.
     * @param {string} orig The original URL
     * @return {string} The resulting URL
     * @private
     */ }, { key: "addReplaceParamsIfMissing_", value:
    function addReplaceParamsIfMissing_(orig) {
      var _this$getDocInfo_ = this.getDocInfo_(),replaceParams = _this$getDocInfo_.replaceParams;
      if (!replaceParams) {
        return orig;
      }
      return addMissingParamsToUrl(
      removeAmpJsParamsFromUrl(orig),
      /** @type {!JsonObject} */(replaceParams));

    }

    /**
     * Return the document info for the current ampdoc.
     * @return {./document-info-impl.DocumentInfoDef}
     */ }, { key: "getDocInfo_", value:
    function getDocInfo_() {
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
     */ }, { key: "getAccessValue_", value:
    function getAccessValue_(getter, expr) {
      var element = this.ampdoc.getHeadNode();
      return Promise.all([
      Services.accessServiceForDocOrNull(element),
      Services.subscriptionsServiceForDocOrNull(element)]).
      then(function (services) {
        var accessService =
        /** @type {?../../extensions/amp-access/0.1/access-vars.AccessVars} */(
        services[0]);

        var subscriptionService =
        /** @type {?../../extensions/amp-access/0.1/access-vars.AccessVars} */(
        services[1]);

        var service = accessService || subscriptionService;
        if (!service) {
          // Access/subscriptions service is not installed.
          user().error(
          TAG,
          'Access or subsciptions service is not installed to access: ',
          expr);

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
     */ }, { key: "getQueryParamData_", value:
    function getQueryParamData_(param, defaultValue) {
      userAssert(
      param,
      'The first argument to QUERY_PARAM, the query string ' +
      'param is required');

      var url = parseUrlDeprecated(
      removeAmpJsParamsFromUrl(this.ampdoc.win.location.href));

      var params = parseQueryString(url.search);
      var _this$getDocInfo_2 = this.getDocInfo_(),replaceParams = _this$getDocInfo_2.replaceParams;
      if (typeof params[param] !== 'undefined') {
        return params[param];
      }
      if (replaceParams && typeof replaceParams[param] !== 'undefined') {
        return (/** @type {string} */(replaceParams[param]));
      }
      return defaultValue;
    }

    /**
     * Return the FRAGMENT_PARAM from the original location href
     * @param {*} param
     * @param {string} defaultValue
     * @return {string}
     * @private
     */ }, { key: "getFragmentParamData_", value:
    function getFragmentParamData_(param, defaultValue) {
      userAssert(
      param,
      'The first argument to FRAGMENT_PARAM, the fragment string ' +
      'param is required');

      userAssert(typeof param == 'string', 'param should be a string');
      var hash = this.ampdoc.win.location['originalHash'];
      var params = parseQueryString(hash);
      return params[param] === undefined ? defaultValue : params[param];
    }

    /**
     * Resolves the value via amp-experiment's variants service.
     * @param {function(!Object<string, string>):(?string)} getter
     * @param {string} expr
     * @return {!Promise<?string>}
     * @template T
     * @private
     */ }, { key: "getVariantsValue_", value:
    function getVariantsValue_(getter, expr) {
      return Services.variantsForDocOrNull(this.ampdoc.getHeadNode()).
      then(function (variants) {
        userAssert(
        variants,
        'To use variable %s, amp-experiment should be configured',
        expr);

        return variants.getVariants();
      }).
      then(function (variantsMap) {return getter(variantsMap);});
    }

    /**
     * Resolves the value via geo service.
     * @param {function(!../../extensions/amp-geo/0.1/amp-geo.GeoDef)} getter
     * @param {string} expr
     * @return {!Promise<Object<string,(string|Array<string>)>>}
     * @template T
     * @private
     */ }, { key: "getGeo_", value:
    function getGeo_(getter, expr) {
      var element = this.ampdoc.getHeadNode();
      return Services.geoForDocOrNull(element).then(function (geo) {
        userAssert(geo, 'To use variable %s, amp-geo should be configured', expr);
        return getter(geo);
      });
    } }]);return GlobalVariableSource;}(VariableSource);


/**
 * This class replaces substitution variables with their values.
 * Document new values in ../docs/spec/amp-var-substitutions.md
 * @package For export
 */
export var UrlReplacements = /*#__PURE__*/function () {
  /**
   * @param {!./ampdoc-impl.AmpDoc} ampdoc
   * @param {!VariableSource} variableSource
   */
  function UrlReplacements(ampdoc, variableSource) {_classCallCheck(this, UrlReplacements);
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
   * @param {!Object<string, boolean>=} opt_allowlist Optional allowlist of
   *     names that can be substituted.
   * @return {string}
   */_createClass(UrlReplacements, [{ key: "expandStringSync", value:
    function expandStringSync(source, opt_bindings, opt_allowlist) {
      return (/** @type {string} */(
        new Expander(
        this.variableSource_,
        opt_bindings,
        /* opt_collectVars */undefined,
        /* opt_sync */true,
        opt_allowlist,
        /* opt_noEncode */true).
        /*OK*/expand(source)));

    }

    /**
     * Expands the provided source by replacing all known variables with their
     * resolved values. Optional `opt_bindings` can be used to add new variables
     * or override existing ones.
     * @param {string} source
     * @param {!Object<string, *>=} opt_bindings
     * @param {!Object<string, boolean>=} opt_allowlist
     * @return {!Promise<string>}
     */ }, { key: "expandStringAsync", value:
    function expandStringAsync(source, opt_bindings, opt_allowlist) {
      return (/** @type {!Promise<string>} */(
        new Expander(
        this.variableSource_,
        opt_bindings,
        /* opt_collectVars */undefined,
        /* opt_sync */undefined,
        opt_allowlist,
        /* opt_noEncode */true).
        /*OK*/expand(source)));

    }

    /**
     * Synchronously expands the provided URL by replacing all known variables
     * with their resolved values. Optional `opt_bindings` can be used to add new
     * variables or override existing ones.  Any async bindings are ignored.
     * @param {string} url
     * @param {!Object<string, (ResolverReturnDef|!SyncResolverDef)>=} opt_bindings
     * @param {!Object<string, boolean>=} opt_allowlist Optional allowlist of
     *     names that can be substituted.
     * @return {string}
     */ }, { key: "expandUrlSync", value:
    function expandUrlSync(url, opt_bindings, opt_allowlist) {
      return this.ensureProtocolMatches_(
      url,
      /** @type {string} */(
      new Expander(
      this.variableSource_,
      opt_bindings,
      /* opt_collectVars */undefined,
      /* opt_sync */true,
      opt_allowlist).
      /*OK*/expand(url)));


    }

    /**
     * Expands the provided URL by replacing all known variables with their
     * resolved values. Optional `opt_bindings` can be used to add new variables
     * or override existing ones.
     * @param {string} url
     * @param {!Object<string, *>=} opt_bindings
     * @param {!Object<string, boolean>=} opt_allowlist Optional allowlist of names
     *     that can be substituted.
     * @param {boolean=} opt_noEncode should not encode URL
     * @return {!Promise<string>}
     */ }, { key: "expandUrlAsync", value:
    function expandUrlAsync(url, opt_bindings, opt_allowlist, opt_noEncode) {var _this3 = this;
      return (/** @type {!Promise<string>} */(
        new Expander(
        this.variableSource_,
        opt_bindings,
        /* opt_collectVars */undefined,
        /* opt_sync */undefined,
        opt_allowlist,
        opt_noEncode).

        /*OK*/expand(url).
        then(function (replacement) {return _this3.ensureProtocolMatches_(url, replacement);})));

    }

    /**
     * Expands an input element value attribute with variable substituted.
     * @param {!HTMLInputElement} element
     * @return {!Promise<string>}
     */ }, { key: "expandInputValueAsync", value:
    function expandInputValueAsync(element) {
      return (/** @type {!Promise<string>} */(
        this.expandInputValue_(element, /*opt_sync*/false)));

    }

    /**
     * Expands an input element value attribute with variable substituted.
     * @param {!HTMLInputElement} element
     * @return {string} Replaced string for testing
     */ }, { key: "expandInputValueSync", value:
    function expandInputValueSync(element) {
      return (/** @type {string} */(
        this.expandInputValue_(element, /*opt_sync*/true)));

    }

    /**
     * Expands in input element value attribute with variable substituted.
     * @param {!HTMLInputElement} element
     * @param {boolean=} opt_sync
     * @return {string|!Promise<string>}
     */ }, { key: "expandInputValue_", value:
    function expandInputValue_(element, opt_sync) {
      devAssert(
      element.tagName == 'INPUT' &&
      (element.getAttribute('type') || '').toLowerCase() == 'hidden');




      var allowlist = this.getAllowlistForElement_(element);
      if (!allowlist) {
        return opt_sync ? element.value : Promise.resolve(element.value);
      }
      if (element[ORIGINAL_VALUE_PROPERTY] === undefined) {
        element[ORIGINAL_VALUE_PROPERTY] = element.value;
      }
      var result = new Expander(
      this.variableSource_,
      /* opt_bindings */undefined,
      /* opt_collectVars */undefined,
      /* opt_sync */opt_sync,
      /* opt_allowlist */allowlist).
      /*OK*/expand(element[ORIGINAL_VALUE_PROPERTY] || element.value);

      if (opt_sync) {
        return (element.value = result);
      }
      return result.then(function (newValue) {
        element.value = newValue;
        return newValue;
      });
    }

    /**
     * Returns a replacement allowlist from elements' data-amp-replace attribute.
     * @param {!Element} element
     * @param {!Object<string, boolean>=} opt_supportedReplacement Optional supported
     * replacement that filters allowlist to a subset.
     * @return {!Object<string, boolean>|undefined}
     */ }, { key: "getAllowlistForElement_", value:
    function getAllowlistForElement_(element, opt_supportedReplacement) {
      var allowlist = element.getAttribute('data-amp-replace');
      if (!allowlist) {
        return;
      }
      var requestedReplacements = {};
      allowlist.
      trim().
      split(/\s+/).
      forEach(function (replacement) {
        if (
        !opt_supportedReplacement ||
        hasOwn(opt_supportedReplacement, replacement))
        {
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
     */ }, { key: "isAllowedOrigin_", value:
    function isAllowedOrigin_(url) {
      var docInfo = Services.documentInfoForDoc(this.ampdoc);
      if (
      url.origin == parseUrlDeprecated(docInfo.canonicalUrl).origin ||
      url.origin == parseUrlDeprecated(docInfo.sourceUrl).origin)
      {
        return true;
      }

      var meta = this.ampdoc.getMetaByName('amp-link-variable-allowed-origin');
      if (meta) {
        var allowlist = meta.trim().split(/\s+/);
        for (var i = 0; i < allowlist.length; i++) {
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
     */ }, { key: "maybeExpandLink", value:
    function maybeExpandLink(element, defaultUrlParams) {
      devAssert(element.tagName == 'A');
      var aElement = /** @type {!HTMLAnchorElement} */(element);
      var supportedReplacements = {
        'CLIENT_ID': true,
        'QUERY_PARAM': true,
        'PAGE_VIEW_ID': true,
        'PAGE_VIEW_ID_64': true,
        'NAV_TIMING': true };

      var additionalUrlParameters =
      aElement.getAttribute('data-amp-addparams') || '';
      var allowlist = this.getAllowlistForElement_(
      aElement,
      supportedReplacements);


      if (!allowlist && !additionalUrlParameters && !defaultUrlParams) {
        return;
      }
      // ORIGINAL_HREF_PROPERTY has the value of the href "pre-replacement".
      // We set this to the original value before doing any work and use it
      // on subsequent replacements, so that each run gets a fresh value.
      var href = /** @type {string} */(
      aElement[ORIGINAL_HREF_PROPERTY] || aElement.getAttribute('href'));

      var url = parseUrlDeprecated(href);
      if (aElement[ORIGINAL_HREF_PROPERTY] == null) {
        aElement[ORIGINAL_HREF_PROPERTY] = href;
      }

      var isAllowedOrigin = this.isAllowedOrigin_(url);
      if (additionalUrlParameters) {
        additionalUrlParameters = isAllowedOrigin ?
        this.expandSyncIfAllowedList_(additionalUrlParameters, allowlist) :
        additionalUrlParameters;
        href = addParamsToUrl(href, parseQueryString(additionalUrlParameters));
      }

      if (!isAllowedOrigin) {
        if (allowlist) {
          user().warn(
          'URL',
          'Ignoring link replacement %s' +
          " because the link does not go to the document's" +
          ' source, canonical, or allowlisted origin.',
          href);

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
          var overrideAllowlist = { 'QUERY_PARAM': true };
          defaultUrlParams = this.expandUrlSync(
          defaultUrlParams,
          /* opt_bindings */undefined,
          /* opt_allowlist */overrideAllowlist);

        }
        href = addParamsToUrl(href, parseQueryString(defaultUrlParams));
      }

      href = this.expandSyncIfAllowedList_(href, allowlist);

      return (aElement.href = href);
    }

    /**
     * @param {string} href
     * @param {!Object<string, boolean>|undefined} allowlist
     * @return {string}
     */ }, { key: "expandSyncIfAllowedList_", value:
    function expandSyncIfAllowedList_(href, allowlist) {
      return allowlist ?
      this.expandUrlSync(
      href,
      /* opt_bindings */undefined,
      /* opt_allowlist */allowlist) :

      href;
    }

    /**
     * Collects all substitutions in the provided URL and expands them to the
     * values for known variables. Optional `opt_bindings` can be used to add
     * new variables or override existing ones.
     * @param {string} url
     * @param {!Object<string, *>=} opt_bindings
     * @return {!Promise<!Object<string, *>>}
     */ }, { key: "collectVars", value:
    function collectVars(url, opt_bindings) {
      var vars = Object.create(null);
      return new Expander(this.variableSource_, opt_bindings, vars).
      /*OK*/expand(url).
      then(function () {return vars;});
    }

    /**
     * Collects substitutions in the `src` attribute of the given element
     * that are _not_ allowlisted via `data-amp-replace` opt-in attribute.
     * @param {!Element} element
     * @return {!Array<string>}
     */ }, { key: "collectDisallowedVarsSync", value:
    function collectDisallowedVarsSync(element) {
      var url = element.getAttribute('src');
      var macroNames = new Expander(this.variableSource_).getMacroNames(url);
      var allowlist = this.getAllowlistForElement_(element);
      if (allowlist) {
        return macroNames.filter(function (v) {return !allowlist[v];});
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
     */ }, { key: "ensureProtocolMatches_", value:
    function ensureProtocolMatches_(url, replacement) {
      var newProtocol = parseUrlDeprecated(
      replacement,
      /* opt_nocache */true).
      protocol;
      var oldProtocol = parseUrlDeprecated(
      url,
      /* opt_nocache */true).
      protocol;
      if (newProtocol != oldProtocol) {
        user().error(TAG, 'Illegal replacement of the protocol: ', url);
        return url;
      }
      userAssert(
      isProtocolValid(replacement),
      'The replacement url has invalid protocol: %s',
      replacement);


      return replacement;
    }

    /**
     * @return {VariableSource}
     */ }, { key: "getVariableSource", value:
    function getVariableSource() {
      return this.variableSource_;
    } }]);return UrlReplacements;}();


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
  new UrlReplacements(ampdoc, varSource));

}

/**
 * @typedef {{incomingFragment: string, outgoingFragment: string}}
 */
var ShareTrackingFragmentsDef;
// /Users/mszylkowski/src/amphtml/src/service/url-replacements-impl.js