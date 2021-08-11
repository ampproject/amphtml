import { resolvedPromise as _resolvedPromise } from "./../core/data-structures/promise";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _possibleConstructorReturn(self, call) { if (call && (typeof call === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

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
import { hasOwn } from "../core/types/object";
import { parseQueryString } from "../core/types/string/url";
import { WindowInterface } from "../core/window/interface";
import { Services } from "./";
import { Expander } from "./url-expander/expander";
import { AsyncResolverDef, ResolverReturnDef, SyncResolverDef, VariableSource, getNavigationData, getTimingDataAsync, getTimingDataSync } from "./variable-source";
import { getTrackImpressionPromise } from "../impression";
import { internalRuntimeVersion } from "../internal-version";
import { dev, devAssert, user, userAssert } from "../log";
import { installServiceInEmbedDoc, registerServiceBuilderForDoc } from "../service-helpers";
import { addMissingParamsToUrl, addParamsToUrl, getSourceUrl, isProtocolValid, parseUrlDeprecated, removeAmpJsParamsFromUrl, removeFragment } from "../url";

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
  return function () {
    return new Date()[method]();
  };
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
  return function () {
    return screen[property];
  };
}

/**
 * Class to provide variables that pertain to top level AMP window.
 */
export var GlobalVariableSource = /*#__PURE__*/function (_VariableSource) {
  _inherits(GlobalVariableSource, _VariableSource);

  var _super = _createSuper(GlobalVariableSource);

  function GlobalVariableSource() {
    _classCallCheck(this, GlobalVariableSource);

    return _super.apply(this, arguments);
  }

  _createClass(GlobalVariableSource, [{
    key: "setTimingResolver_",
    value:
    /**
     * Utility function for setting resolver for timing data that supports
     * sync and async.
     * @param {string} varName
     * @param {string} startEvent
     * @param {string=} endEvent
     * @return {!VariableSource}
     * @private
     */
    function setTimingResolver_(varName, startEvent, endEvent) {
      var _this = this;

      return this.setBoth(varName, function () {
        return getTimingDataSync(_this.ampdoc.win, startEvent, endEvent);
      }, function () {
        return getTimingDataAsync(_this.ampdoc.win, startEvent, endEvent);
      });
    }
    /** @override */

  }, {
    key: "initialize",
    value: function initialize() {
      var _this2 = this;

      var win = this.ampdoc.win;
      var element = this.ampdoc.getHeadNode();

      /** @const {!./viewport/viewport-interface.ViewportInterface} */
      var viewport = Services.viewportForDoc(this.ampdoc);
      // Returns a random value for cache busters.
      this.set('RANDOM', function () {
        return Math.random();
      });
      // Provides a counter starting at 1 per given scope.
      var counterStore = Object.create(null);
      this.set('COUNTER', function (scope) {
        return counterStore[scope] = (counterStore[scope] | 0) + 1;
      });
      // Returns the canonical URL for this AMP document.
      this.set('CANONICAL_URL', function () {
        return _this2.getDocInfo_().canonicalUrl;
      });
      // Returns the host of the canonical URL for this AMP document.
      this.set('CANONICAL_HOST', function () {
        return parseUrlDeprecated(_this2.getDocInfo_().canonicalUrl).host;
      });
      // Returns the hostname of the canonical URL for this AMP document.
      this.set('CANONICAL_HOSTNAME', function () {
        return parseUrlDeprecated(_this2.getDocInfo_().canonicalUrl).hostname;
      });
      // Returns the path of the canonical URL for this AMP document.
      this.set('CANONICAL_PATH', function () {
        return parseUrlDeprecated(_this2.getDocInfo_().canonicalUrl).pathname;
      });
      // Returns the referrer URL.
      this.setAsync('DOCUMENT_REFERRER',
      /** @type {AsyncResolverDef} */
      function () {
        return Services.viewerForDoc(_this2.ampdoc).getReferrerUrl();
      });
      // Like DOCUMENT_REFERRER, but returns null if the referrer is of
      // same domain or the corresponding CDN proxy.
      this.setAsync('EXTERNAL_REFERRER',
      /** @type {AsyncResolverDef} */
      function () {
        return Services.viewerForDoc(_this2.ampdoc).getReferrerUrl().then(function (referrer) {
          if (!referrer) {
            return null;
          }

          var referrerHostname = parseUrlDeprecated(getSourceUrl(referrer)).hostname;
          var currentHostname = WindowInterface.getHostname(win);
          return referrerHostname === currentHostname ? null : referrer;
        });
      });
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

      this.setBoth('SOURCE_URL', function () {
        return expandSourceUrl();
      }, function () {
        return getTrackImpressionPromise().then(function () {
          return expandSourceUrl();
        });
      });
      // Returns the host of the Source URL for this AMP document.
      this.set('SOURCE_HOST', function () {
        return parseUrlDeprecated(_this2.getDocInfo_().sourceUrl).host;
      });
      // Returns the hostname of the Source URL for this AMP document.
      this.set('SOURCE_HOSTNAME', function () {
        return parseUrlDeprecated(_this2.getDocInfo_().sourceUrl).hostname;
      });
      // Returns the path of the Source URL for this AMP document.
      this.set('SOURCE_PATH', function () {
        return parseUrlDeprecated(_this2.getDocInfo_().sourceUrl).pathname;
      });
      // Returns a random string that will be the constant for the duration of
      // single page view. It should have sufficient entropy to be unique for
      // all the page views a single user is making at a time.
      this.set('PAGE_VIEW_ID', function () {
        return _this2.getDocInfo_().pageViewId;
      });
      // Returns a random string that will be the constant for the duration of
      // single page view. It should have sufficient entropy to be unique for
      // all the page views a single user is making at a time.
      this.setAsync('PAGE_VIEW_ID_64', function () {
        return _this2.getDocInfo_().pageViewId64;
      });
      this.setBoth('QUERY_PARAM', function (param, defaultValue) {
        if (defaultValue === void 0) {
          defaultValue = '';
        }

        return _this2.getQueryParamData_(param, defaultValue);
      }, function (param, defaultValue) {
        if (defaultValue === void 0) {
          defaultValue = '';
        }

        return getTrackImpressionPromise().then(function () {
          return _this2.getQueryParamData_(param, defaultValue);
        });
      });
      // Returns the value of the given field name in the fragment query string.
      // Second parameter is an optional default value.
      // For example, if location is 'pub.com/amp.html?x=1#y=2' then
      // FRAGMENT_PARAM(y) returns '2' and FRAGMENT_PARAM(z, 3) returns 3.
      this.set('FRAGMENT_PARAM', function (param, defaultValue) {
        if (defaultValue === void 0) {
          defaultValue = '';
        }

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
      this.setBoth('CLIENT_ID', function (scope) {
        if (!clientIds) {
          return null;
        }

        return clientIds[scope];
      }, function (scope, opt_userNotificationId, opt_cookieName, opt_disableBackup) {
        userAssert(scope, 'The first argument to CLIENT_ID, the fallback' +
        /*OK*/
        ' Cookie name, is required');

        var consent = _resolvedPromise();

        // If no `opt_userNotificationId` argument is provided then
        // assume consent is given by default.
        if (opt_userNotificationId) {
          consent = Services.userNotificationManagerForDoc(element).then(function (service) {
            return service.get(opt_userNotificationId);
          });
        }

        return Services.cidForDoc(_this2.ampdoc).then(function (cid) {
          opt_disableBackup = opt_disableBackup == 'true' ? true : false;
          return cid.get({
            /** @type {string} */
            scope: scope,
            createCookieIfNotPresent: true,
            cookieName: opt_cookieName || undefined,
            disableBackup: opt_disableBackup
          }, consent);
        }).then(function (cid) {
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
              dev().error(TAG, 'non-string cid, what is it?', Object.keys(cid));
            }
          }

          clientIds[scope] = cid;
          return cid;
        });
      });
      // Returns assigned variant name for the given experiment.
      this.setAsync('VARIANT',
      /** @type {AsyncResolverDef} */
      function (experiment) {
        return _this2.getVariantsValue_(function (variants) {
          var variant = variants[
          /** @type {string} */
          experiment];
          userAssert(variant !== undefined, 'The value passed to VARIANT() is not a valid experiment in <amp-experiment>:' + experiment);
          // When no variant assigned, use reserved keyword 'none'.
          return variant === null ? 'none' :
          /** @type {string} */
          variant;
        }, 'VARIANT');
      });
      // Returns all assigned experiment variants in a serialized form.
      this.setAsync('VARIANTS',
      /** @type {AsyncResolverDef} */
      function () {
        return _this2.getVariantsValue_(function (variants) {
          var experiments = [];

          for (var experiment in variants) {
            var variant = variants[experiment];
            experiments.push(experiment + VARIANT_DELIMITER + (variant || 'none'));
          }

          return experiments.join(EXPERIMENT_DELIMITER);
        }, 'VARIANTS');
      });
      // Returns assigned geo value for geoType or all groups.
      this.setAsync('AMP_GEO',
      /** @type {AsyncResolverDef} */
      function (geoType) {
        return _this2.getGeo_(function (geos) {
          if (geoType) {
            userAssert(geoType === 'ISOCountry', 'The value passed to AMP_GEO() is not valid name:' + geoType);
            return (
              /** @type {string} */
              geos[geoType] || 'unknown'
            );
          }

          return (
            /** @type {string} */
            geos.matchedISOCountryGroups.join(GEO_DELIM)
          );
        }, 'AMP_GEO');
      });
      // Returns the number of milliseconds since 1 Jan 1970 00:00:00 UTC.
      this.set('TIMESTAMP', dateMethod('getTime'));
      // Returns the human readable timestamp in format of
      // 2011-01-01T11:11:11.612Z.
      this.set('TIMESTAMP_ISO', dateMethod('toISOString'));
      // Returns the user's time-zone offset from UTC, in minutes.
      this.set('TIMEZONE', dateMethod('getTimezoneOffset'));
      // Returns a promise resolving to viewport.getScrollHeight.
      this.set('SCROLL_HEIGHT', function () {
        return viewport.getScrollHeight();
      });
      // Returns a promise resolving to viewport.getScrollWidth.
      this.set('SCROLL_WIDTH', function () {
        return viewport.getScrollWidth();
      });
      // Returns the viewport height.
      this.set('VIEWPORT_HEIGHT', function () {
        return viewport.getHeight();
      });
      // Returns the viewport width.
      this.set('VIEWPORT_WIDTH', function () {
        return viewport.getWidth();
      });
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
        return (nav.language || // Only used on IE.
        nav['userLanguage'] || nav.browserLanguage || '').toLowerCase();
      });
      // Returns the user agent.
      this.set('USER_AGENT', function () {
        return win.navigator.userAgent;
      });
      // Returns the time it took to load the whole page. (excludes amp-* elements
      // that are not rendered by the system yet.)
      this.setTimingResolver_('PAGE_LOAD_TIME', 'navigationStart', 'loadEventStart');
      // Returns the time it took to perform DNS lookup for the domain.
      this.setTimingResolver_('DOMAIN_LOOKUP_TIME', 'domainLookupStart', 'domainLookupEnd');
      // Returns the time it took to connect to the server.
      this.setTimingResolver_('TCP_CONNECT_TIME', 'connectStart', 'connectEnd');
      // Returns the time it took for server to start sending a response to the
      // request.
      this.setTimingResolver_('SERVER_RESPONSE_TIME', 'requestStart', 'responseStart');
      // Returns the time it took to download the page.
      this.setTimingResolver_('PAGE_DOWNLOAD_TIME', 'responseStart', 'responseEnd');
      // Returns the time it took for redirects to complete.
      this.setTimingResolver_('REDIRECT_TIME', 'navigationStart', 'fetchStart');
      // Returns the time it took for DOM to become interactive.
      this.setTimingResolver_('DOM_INTERACTIVE_TIME', 'navigationStart', 'domInteractive');
      // Returns the time it took for content to load.
      this.setTimingResolver_('CONTENT_LOAD_TIME', 'navigationStart', 'domContentLoadedEventStart');
      // Access: Reader ID.
      this.setAsync('ACCESS_READER_ID',
      /** @type {AsyncResolverDef} */
      function () {
        return _this2.getAccessValue_(function (accessService) {
          return accessService.getAccessReaderId();
        }, 'ACCESS_READER_ID');
      });
      // Access: data from the authorization response.
      this.setAsync('AUTHDATA',
      /** @type {AsyncResolverDef} */
      function (field) {
        userAssert(field, 'The first argument to AUTHDATA, the field, is required');
        return _this2.getAccessValue_(function (accessService) {
          return accessService.getAuthdataField(field);
        }, 'AUTHDATA');
      });
      // Returns an identifier for the viewer.
      this.setAsync('VIEWER', function () {
        return Services.viewerForDoc(_this2.ampdoc).getViewerOrigin().then(function (viewer) {
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
          /** @type {string} */
          name, reset !== 'false');
        });
      });
      this.set('NAV_TIMING', function (startAttribute, endAttribute) {
        userAssert(startAttribute, 'The first argument to NAV_TIMING, the ' + 'start attribute name, is required');
        return getTimingDataSync(win,
        /**@type {string}*/
        startAttribute,
        /**@type {string}*/
        endAttribute);
      });
      this.setAsync('NAV_TIMING', function (startAttribute, endAttribute) {
        userAssert(startAttribute, 'The first argument to NAV_TIMING, the ' + 'start attribute name, is required');
        return getTimingDataAsync(win,
        /**@type {string}*/
        startAttribute,
        /**@type {string}*/
        endAttribute);
      });
      this.set('NAV_TYPE', function () {
        return getNavigationData(win, 'type');
      });
      this.set('NAV_REDIRECT_COUNT', function () {
        return getNavigationData(win, 'redirectCount');
      });
      // returns the AMP version number
      this.set('AMP_VERSION', function () {
        return internalRuntimeVersion();
      });
      this.set('BACKGROUND_STATE', function () {
        return _this2.ampdoc.isVisible() ? '0' : '1';
      });
      this.setAsync('VIDEO_STATE', function (id, property) {
        return Services.videoManagerForDoc(_this2.ampdoc).getVideoStateProperty(id, property);
      });
      this.setAsync('AMP_STATE', function (key) {
        // This is safe since AMP_STATE is not an A4A allowlisted variable.
        var root = _this2.ampdoc.getRootNode();

        var element =
        /** @type {!Element|!ShadowRoot} */
        root.documentElement || root;
        return Services.bindForDocOrNull(element).then(function (bind) {
          if (!bind) {
            return '';
          }

          return bind.getStateValue(
          /** @type {string} */
          key) || '';
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

  }, {
    key: "addReplaceParamsIfMissing_",
    value: function addReplaceParamsIfMissing_(orig) {
      var _this$getDocInfo_ = this.getDocInfo_(),
          replaceParams = _this$getDocInfo_.replaceParams;

      if (!replaceParams) {
        return orig;
      }

      return addMissingParamsToUrl(removeAmpJsParamsFromUrl(orig),
      /** @type {!JsonObject} */
      replaceParams);
    }
    /**
     * Return the document info for the current ampdoc.
     * @return {./document-info-impl.DocumentInfoDef}
     */

  }, {
    key: "getDocInfo_",
    value: function getDocInfo_() {
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

  }, {
    key: "getAccessValue_",
    value: function getAccessValue_(getter, expr) {
      var element = this.ampdoc.getHeadNode();
      return Promise.all([Services.accessServiceForDocOrNull(element), Services.subscriptionsServiceForDocOrNull(element)]).then(function (services) {
        var accessService =
        /** @type {?../../extensions/amp-access/0.1/access-vars.AccessVars} */
        services[0];
        var subscriptionService =
        /** @type {?../../extensions/amp-access/0.1/access-vars.AccessVars} */
        services[1];
        var service = accessService || subscriptionService;

        if (!service) {
          // Access/subscriptions service is not installed.
          user().error(TAG, 'Access or subsciptions service is not installed to access: ', expr);
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

  }, {
    key: "getQueryParamData_",
    value: function getQueryParamData_(param, defaultValue) {
      userAssert(param, 'The first argument to QUERY_PARAM, the query string ' + 'param is required');
      var url = parseUrlDeprecated(removeAmpJsParamsFromUrl(this.ampdoc.win.location.href));
      var params = parseQueryString(url.search);

      var _this$getDocInfo_2 = this.getDocInfo_(),
          replaceParams = _this$getDocInfo_2.replaceParams;

      if (typeof params[param] !== 'undefined') {
        return params[param];
      }

      if (replaceParams && typeof replaceParams[param] !== 'undefined') {
        return (
          /** @type {string} */
          replaceParams[param]
        );
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

  }, {
    key: "getFragmentParamData_",
    value: function getFragmentParamData_(param, defaultValue) {
      userAssert(param, 'The first argument to FRAGMENT_PARAM, the fragment string ' + 'param is required');
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
     */

  }, {
    key: "getVariantsValue_",
    value: function getVariantsValue_(getter, expr) {
      return Services.variantsForDocOrNull(this.ampdoc.getHeadNode()).then(function (variants) {
        userAssert(variants, 'To use variable %s, amp-experiment should be configured', expr);
        return variants.getVariants();
      }).then(function (variantsMap) {
        return getter(variantsMap);
      });
    }
    /**
     * Resolves the value via geo service.
     * @param {function(!../../extensions/amp-geo/0.1/amp-geo.GeoDef)} getter
     * @param {string} expr
     * @return {!Promise<Object<string,(string|Array<string>)>>}
     * @template T
     * @private
     */

  }, {
    key: "getGeo_",
    value: function getGeo_(getter, expr) {
      var element = this.ampdoc.getHeadNode();
      return Services.geoForDocOrNull(element).then(function (geo) {
        userAssert(geo, 'To use variable %s, amp-geo should be configured', expr);
        return getter(geo);
      });
    }
  }]);

  return GlobalVariableSource;
}(VariableSource);

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
  function UrlReplacements(ampdoc, variableSource) {
    _classCallCheck(this, UrlReplacements);

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
   */
  _createClass(UrlReplacements, [{
    key: "expandStringSync",
    value: function expandStringSync(source, opt_bindings, opt_allowlist) {
      return (
        /** @type {string} */
        new Expander(this.variableSource_, opt_bindings,
        /* opt_collectVars */
        undefined,
        /* opt_sync */
        true, opt_allowlist,
        /* opt_noEncode */
        true).
        /*OK*/
        expand(source)
      );
    }
    /**
     * Expands the provided source by replacing all known variables with their
     * resolved values. Optional `opt_bindings` can be used to add new variables
     * or override existing ones.
     * @param {string} source
     * @param {!Object<string, *>=} opt_bindings
     * @param {!Object<string, boolean>=} opt_allowlist
     * @return {!Promise<string>}
     */

  }, {
    key: "expandStringAsync",
    value: function expandStringAsync(source, opt_bindings, opt_allowlist) {
      return (
        /** @type {!Promise<string>} */
        new Expander(this.variableSource_, opt_bindings,
        /* opt_collectVars */
        undefined,
        /* opt_sync */
        undefined, opt_allowlist,
        /* opt_noEncode */
        true).
        /*OK*/
        expand(source)
      );
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
     */

  }, {
    key: "expandUrlSync",
    value: function expandUrlSync(url, opt_bindings, opt_allowlist) {
      return this.ensureProtocolMatches_(url,
      /** @type {string} */
      new Expander(this.variableSource_, opt_bindings,
      /* opt_collectVars */
      undefined,
      /* opt_sync */
      true, opt_allowlist).
      /*OK*/
      expand(url));
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
     */

  }, {
    key: "expandUrlAsync",
    value: function expandUrlAsync(url, opt_bindings, opt_allowlist, opt_noEncode) {
      var _this3 = this;

      return (
        /** @type {!Promise<string>} */
        new Expander(this.variableSource_, opt_bindings,
        /* opt_collectVars */
        undefined,
        /* opt_sync */
        undefined, opt_allowlist, opt_noEncode).
        /*OK*/
        expand(url).then(function (replacement) {
          return _this3.ensureProtocolMatches_(url, replacement);
        })
      );
    }
    /**
     * Expands an input element value attribute with variable substituted.
     * @param {!HTMLInputElement} element
     * @return {!Promise<string>}
     */

  }, {
    key: "expandInputValueAsync",
    value: function expandInputValueAsync(element) {
      return (
        /** @type {!Promise<string>} */
        this.expandInputValue_(element,
        /*opt_sync*/
        false)
      );
    }
    /**
     * Expands an input element value attribute with variable substituted.
     * @param {!HTMLInputElement} element
     * @return {string} Replaced string for testing
     */

  }, {
    key: "expandInputValueSync",
    value: function expandInputValueSync(element) {
      return (
        /** @type {string} */
        this.expandInputValue_(element,
        /*opt_sync*/
        true)
      );
    }
    /**
     * Expands in input element value attribute with variable substituted.
     * @param {!HTMLInputElement} element
     * @param {boolean=} opt_sync
     * @return {string|!Promise<string>}
     */

  }, {
    key: "expandInputValue_",
    value: function expandInputValue_(element, opt_sync) {
      devAssert(element.tagName == 'INPUT' && (element.getAttribute('type') || '').toLowerCase() == 'hidden', 'Input value expansion only works on hidden input fields: %s', element);
      var allowlist = this.getAllowlistForElement_(element);

      if (!allowlist) {
        return opt_sync ? element.value : Promise.resolve(element.value);
      }

      if (element[ORIGINAL_VALUE_PROPERTY] === undefined) {
        element[ORIGINAL_VALUE_PROPERTY] = element.value;
      }

      var result = new Expander(this.variableSource_,
      /* opt_bindings */
      undefined,
      /* opt_collectVars */
      undefined,
      /* opt_sync */
      opt_sync,
      /* opt_allowlist */
      allowlist).
      /*OK*/
      expand(element[ORIGINAL_VALUE_PROPERTY] || element.value);

      if (opt_sync) {
        return element.value = result;
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
     */

  }, {
    key: "getAllowlistForElement_",
    value: function getAllowlistForElement_(element, opt_supportedReplacement) {
      var allowlist = element.getAttribute('data-amp-replace');

      if (!allowlist) {
        return;
      }

      var requestedReplacements = {};
      allowlist.trim().split(/\s+/).forEach(function (replacement) {
        if (!opt_supportedReplacement || hasOwn(opt_supportedReplacement, replacement)) {
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

  }, {
    key: "isAllowedOrigin_",
    value: function isAllowedOrigin_(url) {
      var docInfo = Services.documentInfoForDoc(this.ampdoc);

      if (url.origin == parseUrlDeprecated(docInfo.canonicalUrl).origin || url.origin == parseUrlDeprecated(docInfo.sourceUrl).origin) {
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
     */

  }, {
    key: "maybeExpandLink",
    value: function maybeExpandLink(element, defaultUrlParams) {
      devAssert(element.tagName == 'A');
      var aElement =
      /** @type {!HTMLAnchorElement} */
      element;
      var supportedReplacements = {
        'CLIENT_ID': true,
        'QUERY_PARAM': true,
        'PAGE_VIEW_ID': true,
        'PAGE_VIEW_ID_64': true,
        'NAV_TIMING': true
      };
      var additionalUrlParameters = aElement.getAttribute('data-amp-addparams') || '';
      var allowlist = this.getAllowlistForElement_(aElement, supportedReplacements);

      if (!allowlist && !additionalUrlParameters && !defaultUrlParams) {
        return;
      }

      // ORIGINAL_HREF_PROPERTY has the value of the href "pre-replacement".
      // We set this to the original value before doing any work and use it
      // on subsequent replacements, so that each run gets a fresh value.
      var href = dev().assertString(aElement[ORIGINAL_HREF_PROPERTY] || aElement.getAttribute('href'));
      var url = parseUrlDeprecated(href);

      if (aElement[ORIGINAL_HREF_PROPERTY] == null) {
        aElement[ORIGINAL_HREF_PROPERTY] = href;
      }

      var isAllowedOrigin = this.isAllowedOrigin_(url);

      if (additionalUrlParameters) {
        additionalUrlParameters = isAllowedOrigin ? this.expandSyncIfAllowedList_(additionalUrlParameters, allowlist) : additionalUrlParameters;
        href = addParamsToUrl(href, parseQueryString(additionalUrlParameters));
      }

      if (!isAllowedOrigin) {
        if (allowlist) {
          user().warn('URL', 'Ignoring link replacement %s' + " because the link does not go to the document's" + ' source, canonical, or allowlisted origin.', href);
        }

        return aElement.href = href;
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
          var overrideAllowlist = {
            'QUERY_PARAM': true
          };
          defaultUrlParams = this.expandUrlSync(defaultUrlParams,
          /* opt_bindings */
          undefined,
          /* opt_allowlist */
          overrideAllowlist);
        }

        href = addParamsToUrl(href, parseQueryString(defaultUrlParams));
      }

      href = this.expandSyncIfAllowedList_(href, allowlist);
      return aElement.href = href;
    }
    /**
     * @param {string} href
     * @param {!Object<string, boolean>|undefined} allowlist
     * @return {string}
     */

  }, {
    key: "expandSyncIfAllowedList_",
    value: function expandSyncIfAllowedList_(href, allowlist) {
      return allowlist ? this.expandUrlSync(href,
      /* opt_bindings */
      undefined,
      /* opt_allowlist */
      allowlist) : href;
    }
    /**
     * Collects all substitutions in the provided URL and expands them to the
     * values for known variables. Optional `opt_bindings` can be used to add
     * new variables or override existing ones.
     * @param {string} url
     * @param {!Object<string, *>=} opt_bindings
     * @return {!Promise<!Object<string, *>>}
     */

  }, {
    key: "collectVars",
    value: function collectVars(url, opt_bindings) {
      var vars = Object.create(null);
      return new Expander(this.variableSource_, opt_bindings, vars).
      /*OK*/
      expand(url).then(function () {
        return vars;
      });
    }
    /**
     * Collects substitutions in the `src` attribute of the given element
     * that are _not_ allowlisted via `data-amp-replace` opt-in attribute.
     * @param {!Element} element
     * @return {!Array<string>}
     */

  }, {
    key: "collectDisallowedVarsSync",
    value: function collectDisallowedVarsSync(element) {
      var url = element.getAttribute('src');
      var macroNames = new Expander(this.variableSource_).getMacroNames(url);
      var allowlist = this.getAllowlistForElement_(element);

      if (allowlist) {
        return macroNames.filter(function (v) {
          return !allowlist[v];
        });
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

  }, {
    key: "ensureProtocolMatches_",
    value: function ensureProtocolMatches_(url, replacement) {
      var newProtocol = parseUrlDeprecated(replacement,
      /* opt_nocache */
      true).protocol;
      var oldProtocol = parseUrlDeprecated(url,
      /* opt_nocache */
      true).protocol;

      if (newProtocol != oldProtocol) {
        user().error(TAG, 'Illegal replacement of the protocol: ', url);
        return url;
      }

      userAssert(isProtocolValid(replacement), 'The replacement url has invalid protocol: %s', replacement);
      return replacement;
    }
    /**
     * @return {VariableSource}
     */

  }, {
    key: "getVariableSource",
    value: function getVariableSource() {
      return this.variableSource_;
    }
  }]);

  return UrlReplacements;
}();

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
  installServiceInEmbedDoc(ampdoc, 'url-replace', new UrlReplacements(ampdoc, varSource));
}

/**
 * @typedef {{incomingFragment: string, outgoingFragment: string}}
 */
var ShareTrackingFragmentsDef;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInVybC1yZXBsYWNlbWVudHMtaW1wbC5qcyJdLCJuYW1lcyI6WyJoYXNPd24iLCJwYXJzZVF1ZXJ5U3RyaW5nIiwiV2luZG93SW50ZXJmYWNlIiwiU2VydmljZXMiLCJFeHBhbmRlciIsIkFzeW5jUmVzb2x2ZXJEZWYiLCJSZXNvbHZlclJldHVybkRlZiIsIlN5bmNSZXNvbHZlckRlZiIsIlZhcmlhYmxlU291cmNlIiwiZ2V0TmF2aWdhdGlvbkRhdGEiLCJnZXRUaW1pbmdEYXRhQXN5bmMiLCJnZXRUaW1pbmdEYXRhU3luYyIsImdldFRyYWNrSW1wcmVzc2lvblByb21pc2UiLCJpbnRlcm5hbFJ1bnRpbWVWZXJzaW9uIiwiZGV2IiwiZGV2QXNzZXJ0IiwidXNlciIsInVzZXJBc3NlcnQiLCJpbnN0YWxsU2VydmljZUluRW1iZWREb2MiLCJyZWdpc3RlclNlcnZpY2VCdWlsZGVyRm9yRG9jIiwiYWRkTWlzc2luZ1BhcmFtc1RvVXJsIiwiYWRkUGFyYW1zVG9VcmwiLCJnZXRTb3VyY2VVcmwiLCJpc1Byb3RvY29sVmFsaWQiLCJwYXJzZVVybERlcHJlY2F0ZWQiLCJyZW1vdmVBbXBKc1BhcmFtc0Zyb21VcmwiLCJyZW1vdmVGcmFnbWVudCIsIlRBRyIsIkVYUEVSSU1FTlRfREVMSU1JVEVSIiwiVkFSSUFOVF9ERUxJTUlURVIiLCJHRU9fREVMSU0iLCJPUklHSU5BTF9IUkVGX1BST1BFUlRZIiwiT1JJR0lOQUxfVkFMVUVfUFJPUEVSVFkiLCJkYXRlTWV0aG9kIiwibWV0aG9kIiwiRGF0ZSIsInNjcmVlblByb3BlcnR5Iiwic2NyZWVuIiwicHJvcGVydHkiLCJHbG9iYWxWYXJpYWJsZVNvdXJjZSIsInZhck5hbWUiLCJzdGFydEV2ZW50IiwiZW5kRXZlbnQiLCJzZXRCb3RoIiwiYW1wZG9jIiwid2luIiwiZWxlbWVudCIsImdldEhlYWROb2RlIiwidmlld3BvcnQiLCJ2aWV3cG9ydEZvckRvYyIsInNldCIsIk1hdGgiLCJyYW5kb20iLCJjb3VudGVyU3RvcmUiLCJPYmplY3QiLCJjcmVhdGUiLCJzY29wZSIsImdldERvY0luZm9fIiwiY2Fub25pY2FsVXJsIiwiaG9zdCIsImhvc3RuYW1lIiwicGF0aG5hbWUiLCJzZXRBc3luYyIsInZpZXdlckZvckRvYyIsImdldFJlZmVycmVyVXJsIiwidGhlbiIsInJlZmVycmVyIiwicmVmZXJyZXJIb3N0bmFtZSIsImN1cnJlbnRIb3N0bmFtZSIsImdldEhvc3RuYW1lIiwiZG9jIiwiZG9jdW1lbnQiLCJ0aXRsZSIsImFkZFJlcGxhY2VQYXJhbXNJZk1pc3NpbmdfIiwibG9jYXRpb24iLCJocmVmIiwidXJsIiwiZXhwYW5kU291cmNlVXJsIiwiZG9jSW5mbyIsInNvdXJjZVVybCIsInBhZ2VWaWV3SWQiLCJwYWdlVmlld0lkNjQiLCJwYXJhbSIsImRlZmF1bHRWYWx1ZSIsImdldFF1ZXJ5UGFyYW1EYXRhXyIsImdldEZyYWdtZW50UGFyYW1EYXRhXyIsImNsaWVudElkcyIsIm9wdF91c2VyTm90aWZpY2F0aW9uSWQiLCJvcHRfY29va2llTmFtZSIsIm9wdF9kaXNhYmxlQmFja3VwIiwiY29uc2VudCIsInVzZXJOb3RpZmljYXRpb25NYW5hZ2VyRm9yRG9jIiwic2VydmljZSIsImdldCIsImNpZEZvckRvYyIsImNpZCIsImNyZWF0ZUNvb2tpZUlmTm90UHJlc2VudCIsImNvb2tpZU5hbWUiLCJ1bmRlZmluZWQiLCJkaXNhYmxlQmFja3VwIiwiZXh0cmFjdENsaWVudElkRnJvbUdhQ29va2llIiwiZXJyb3IiLCJrZXlzIiwiZXhwZXJpbWVudCIsImdldFZhcmlhbnRzVmFsdWVfIiwidmFyaWFudHMiLCJ2YXJpYW50IiwiZXhwZXJpbWVudHMiLCJwdXNoIiwiam9pbiIsImdlb1R5cGUiLCJnZXRHZW9fIiwiZ2VvcyIsIm1hdGNoZWRJU09Db3VudHJ5R3JvdXBzIiwiZ2V0U2Nyb2xsSGVpZ2h0IiwiZ2V0U2Nyb2xsV2lkdGgiLCJnZXRIZWlnaHQiLCJnZXRXaWR0aCIsImNoYXJhY3RlclNldCIsImNoYXJzZXQiLCJuYXYiLCJuYXZpZ2F0b3IiLCJsYW5ndWFnZSIsImJyb3dzZXJMYW5ndWFnZSIsInRvTG93ZXJDYXNlIiwidXNlckFnZW50Iiwic2V0VGltaW5nUmVzb2x2ZXJfIiwiZ2V0QWNjZXNzVmFsdWVfIiwiYWNjZXNzU2VydmljZSIsImdldEFjY2Vzc1JlYWRlcklkIiwiZmllbGQiLCJnZXRBdXRoZGF0YUZpZWxkIiwiZ2V0Vmlld2VyT3JpZ2luIiwidmlld2VyIiwiYWN0aXZpdHlGb3JEb2MiLCJhY3Rpdml0eSIsImdldFRvdGFsRW5nYWdlZFRpbWUiLCJuYW1lIiwicmVzZXQiLCJnZXRJbmNyZW1lbnRhbEVuZ2FnZWRUaW1lIiwic3RhcnRBdHRyaWJ1dGUiLCJlbmRBdHRyaWJ1dGUiLCJpc1Zpc2libGUiLCJpZCIsInZpZGVvTWFuYWdlckZvckRvYyIsImdldFZpZGVvU3RhdGVQcm9wZXJ0eSIsImtleSIsInJvb3QiLCJnZXRSb290Tm9kZSIsImRvY3VtZW50RWxlbWVudCIsImJpbmRGb3JEb2NPck51bGwiLCJiaW5kIiwiZ2V0U3RhdGVWYWx1ZSIsIm9yaWciLCJyZXBsYWNlUGFyYW1zIiwiZG9jdW1lbnRJbmZvRm9yRG9jIiwiZ2V0dGVyIiwiZXhwciIsIlByb21pc2UiLCJhbGwiLCJhY2Nlc3NTZXJ2aWNlRm9yRG9jT3JOdWxsIiwic3Vic2NyaXB0aW9uc1NlcnZpY2VGb3JEb2NPck51bGwiLCJzZXJ2aWNlcyIsInN1YnNjcmlwdGlvblNlcnZpY2UiLCJwYXJhbXMiLCJzZWFyY2giLCJoYXNoIiwidmFyaWFudHNGb3JEb2NPck51bGwiLCJnZXRWYXJpYW50cyIsInZhcmlhbnRzTWFwIiwiZ2VvRm9yRG9jT3JOdWxsIiwiZ2VvIiwiVXJsUmVwbGFjZW1lbnRzIiwidmFyaWFibGVTb3VyY2UiLCJ2YXJpYWJsZVNvdXJjZV8iLCJzb3VyY2UiLCJvcHRfYmluZGluZ3MiLCJvcHRfYWxsb3dsaXN0IiwiZXhwYW5kIiwiZW5zdXJlUHJvdG9jb2xNYXRjaGVzXyIsIm9wdF9ub0VuY29kZSIsInJlcGxhY2VtZW50IiwiZXhwYW5kSW5wdXRWYWx1ZV8iLCJvcHRfc3luYyIsInRhZ05hbWUiLCJnZXRBdHRyaWJ1dGUiLCJhbGxvd2xpc3QiLCJnZXRBbGxvd2xpc3RGb3JFbGVtZW50XyIsInZhbHVlIiwicmVzb2x2ZSIsInJlc3VsdCIsIm5ld1ZhbHVlIiwib3B0X3N1cHBvcnRlZFJlcGxhY2VtZW50IiwicmVxdWVzdGVkUmVwbGFjZW1lbnRzIiwidHJpbSIsInNwbGl0IiwiZm9yRWFjaCIsIndhcm4iLCJvcmlnaW4iLCJtZXRhIiwiZ2V0TWV0YUJ5TmFtZSIsImkiLCJsZW5ndGgiLCJkZWZhdWx0VXJsUGFyYW1zIiwiYUVsZW1lbnQiLCJzdXBwb3J0ZWRSZXBsYWNlbWVudHMiLCJhZGRpdGlvbmFsVXJsUGFyYW1ldGVycyIsImFzc2VydFN0cmluZyIsImlzQWxsb3dlZE9yaWdpbiIsImlzQWxsb3dlZE9yaWdpbl8iLCJleHBhbmRTeW5jSWZBbGxvd2VkTGlzdF8iLCJvdmVycmlkZUFsbG93bGlzdCIsImV4cGFuZFVybFN5bmMiLCJ2YXJzIiwibWFjcm9OYW1lcyIsImdldE1hY3JvTmFtZXMiLCJmaWx0ZXIiLCJ2IiwibmV3UHJvdG9jb2wiLCJwcm90b2NvbCIsIm9sZFByb3RvY29sIiwiZ2FDb29raWUiLCJyZXBsYWNlIiwiaW5zdGFsbFVybFJlcGxhY2VtZW50c1NlcnZpY2VGb3JEb2MiLCJpbnN0YWxsVXJsUmVwbGFjZW1lbnRzRm9yRW1iZWQiLCJ2YXJTb3VyY2UiLCJTaGFyZVRyYWNraW5nRnJhZ21lbnRzRGVmIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBRUEsU0FBUUEsTUFBUjtBQUNBLFNBQVFDLGdCQUFSO0FBQ0EsU0FBUUMsZUFBUjtBQUVBLFNBQVFDLFFBQVI7QUFFQSxTQUFRQyxRQUFSO0FBQ0EsU0FDRUMsZ0JBREYsRUFFRUMsaUJBRkYsRUFHRUMsZUFI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QixFQUEyRGlELEdBQTNEO0FBQ0EsZUFBT0EsR0FBUDtBQUNEOztBQUNEM0QsTUFBQUEsVUFBVSxDQUNSTSxlQUFlLENBQUM4SixXQUFELENBRFAsRUFFUiw4Q0FGUSxFQUdSQSxXQUhRLENBQVY7QUFNQSxhQUFPQSxXQUFQO0FBQ0Q7QUFFRDtBQUNGO0FBQ0E7O0FBdFlBO0FBQUE7QUFBQSxXQXVZRSw2QkFBb0I7QUFDbEIsYUFBTyxLQUFLUCxlQUFaO0FBQ0Q7QUF6WUg7O0FBQUE7QUFBQTs7QUE0WUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTyxTQUFTMUUsMkJBQVQsQ0FBcUN5SCxRQUFyQyxFQUErQztBQUNwRCxTQUFPQSxRQUFRLENBQUNDLE9BQVQsQ0FBaUIsb0JBQWpCLEVBQXVDLEVBQXZDLENBQVA7QUFDRDs7QUFFRDtBQUNBO0FBQ0E7QUFDQSxPQUFPLFNBQVNDLG1DQUFULENBQTZDbkwsTUFBN0MsRUFBcUQ7QUFDMUR6QixFQUFBQSw0QkFBNEIsQ0FBQ3lCLE1BQUQsRUFBUyxhQUFULEVBQXdCLFVBQVUwQixHQUFWLEVBQWU7QUFDakUsV0FBTyxJQUFJc0csZUFBSixDQUFvQnRHLEdBQXBCLEVBQXlCLElBQUkvQixvQkFBSixDQUF5QitCLEdBQXpCLENBQXpCLENBQVA7QUFDRCxHQUYyQixDQUE1QjtBQUdEOztBQUVEO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTyxTQUFTMEosOEJBQVQsQ0FBd0NwTCxNQUF4QyxFQUFnRHFMLFNBQWhELEVBQTJEO0FBQ2hFL00sRUFBQUEsd0JBQXdCLENBQ3RCMEIsTUFEc0IsRUFFdEIsYUFGc0IsRUFHdEIsSUFBSWdJLGVBQUosQ0FBb0JoSSxNQUFwQixFQUE0QnFMLFNBQTVCLENBSHNCLENBQXhCO0FBS0Q7O0FBRUQ7QUFDQTtBQUNBO0FBQ0EsSUFBSUMseUJBQUoiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENvcHlyaWdodCAyMDE1IFRoZSBBTVAgSFRNTCBBdXRob3JzLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG4gKiB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG4gKiBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcbiAqXG4gKiAgICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuICpcbiAqIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbiAqIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMtSVNcIiBCQVNJUyxcbiAqIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuICogU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxuICogbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4gKi9cblxuaW1wb3J0IHtoYXNPd259IGZyb20gJyNjb3JlL3R5cGVzL29iamVjdCc7XG5pbXBvcnQge3BhcnNlUXVlcnlTdHJpbmd9IGZyb20gJyNjb3JlL3R5cGVzL3N0cmluZy91cmwnO1xuaW1wb3J0IHtXaW5kb3dJbnRlcmZhY2V9IGZyb20gJyNjb3JlL3dpbmRvdy9pbnRlcmZhY2UnO1xuXG5pbXBvcnQge1NlcnZpY2VzfSBmcm9tICcjc2VydmljZSc7XG5cbmltcG9ydCB7RXhwYW5kZXJ9IGZyb20gJy4vdXJsLWV4cGFuZGVyL2V4cGFuZGVyJztcbmltcG9ydCB7XG4gIEFzeW5jUmVzb2x2ZXJEZWYsXG4gIFJlc29sdmVyUmV0dXJuRGVmLFxuICBTeW5jUmVzb2x2ZXJEZWYsXG4gIFZhcmlhYmxlU291cmNlLFxuICBnZXROYXZpZ2F0aW9uRGF0YSxcbiAgZ2V0VGltaW5nRGF0YUFzeW5jLFxuICBnZXRUaW1pbmdEYXRhU3luYyxcbn0gZnJvbSAnLi92YXJpYWJsZS1zb3VyY2UnO1xuXG5pbXBvcnQge2dldFRyYWNrSW1wcmVzc2lvblByb21pc2V9IGZyb20gJy4uL2ltcHJlc3Npb24nO1xuaW1wb3J0IHtpbnRlcm5hbFJ1bnRpbWVWZXJzaW9ufSBmcm9tICcuLi9pbnRlcm5hbC12ZXJzaW9uJztcbmltcG9ydCB7ZGV2LCBkZXZBc3NlcnQsIHVzZXIsIHVzZXJBc3NlcnR9IGZyb20gJy4uL2xvZyc7XG5pbXBvcnQge1xuICBpbnN0YWxsU2VydmljZUluRW1iZWREb2MsXG4gIHJlZ2lzdGVyU2VydmljZUJ1aWxkZXJGb3JEb2MsXG59IGZyb20gJy4uL3NlcnZpY2UtaGVscGVycyc7XG5pbXBvcnQge1xuICBhZGRNaXNzaW5nUGFyYW1zVG9VcmwsXG4gIGFkZFBhcmFtc1RvVXJsLFxuICBnZXRTb3VyY2VVcmwsXG4gIGlzUHJvdG9jb2xWYWxpZCxcbiAgcGFyc2VVcmxEZXByZWNhdGVkLFxuICByZW1vdmVBbXBKc1BhcmFtc0Zyb21VcmwsXG4gIHJlbW92ZUZyYWdtZW50LFxufSBmcm9tICcuLi91cmwnO1xuXG4vKiogQHByaXZhdGUgQGNvbnN0IHtzdHJpbmd9ICovXG5jb25zdCBUQUcgPSAnVXJsUmVwbGFjZW1lbnRzJztcbmNvbnN0IEVYUEVSSU1FTlRfREVMSU1JVEVSID0gJyEnO1xuY29uc3QgVkFSSUFOVF9ERUxJTUlURVIgPSAnLic7XG5jb25zdCBHRU9fREVMSU0gPSAnLCc7XG5jb25zdCBPUklHSU5BTF9IUkVGX1BST1BFUlRZID0gJ2FtcC1vcmlnaW5hbC1ocmVmJztcbmNvbnN0IE9SSUdJTkFMX1ZBTFVFX1BST1BFUlRZID0gJ2FtcC1vcmlnaW5hbC12YWx1ZSc7XG5cbi8qKlxuICogUmV0dXJucyBhIGZ1bmN0aW9uIHRoYXQgZXhlY3V0ZXMgbWV0aG9kIG9uIGEgbmV3IERhdGUgaW5zdGFuY2UuIFRoaXMgaXMgYVxuICogYnl0ZSBzYXZpbmcgaGFjay5cbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gbWV0aG9kXG4gKiBAcmV0dXJuIHshU3luY1Jlc29sdmVyRGVmfVxuICovXG5mdW5jdGlvbiBkYXRlTWV0aG9kKG1ldGhvZCkge1xuICByZXR1cm4gKCkgPT4gbmV3IERhdGUoKVttZXRob2RdKCk7XG59XG5cbi8qKlxuICogUmV0dXJucyBhIGZ1bmN0aW9uIHRoYXQgcmV0dXJucyBwcm9wZXJ0eSBvZiBzY3JlZW4uIFRoaXMgaXMgYSBieXRlIHNhdmluZ1xuICogaGFjay5cbiAqXG4gKiBAcGFyYW0geyFTY3JlZW59IHNjcmVlblxuICogQHBhcmFtIHtzdHJpbmd9IHByb3BlcnR5XG4gKiBAcmV0dXJuIHshU3luY1Jlc29sdmVyRGVmfVxuICovXG5mdW5jdGlvbiBzY3JlZW5Qcm9wZXJ0eShzY3JlZW4sIHByb3BlcnR5KSB7XG4gIHJldHVybiAoKSA9PiBzY3JlZW5bcHJvcGVydHldO1xufVxuXG4vKipcbiAqIENsYXNzIHRvIHByb3ZpZGUgdmFyaWFibGVzIHRoYXQgcGVydGFpbiB0byB0b3AgbGV2ZWwgQU1QIHdpbmRvdy5cbiAqL1xuZXhwb3J0IGNsYXNzIEdsb2JhbFZhcmlhYmxlU291cmNlIGV4dGVuZHMgVmFyaWFibGVTb3VyY2Uge1xuICAvKipcbiAgICogVXRpbGl0eSBmdW5jdGlvbiBmb3Igc2V0dGluZyByZXNvbHZlciBmb3IgdGltaW5nIGRhdGEgdGhhdCBzdXBwb3J0c1xuICAgKiBzeW5jIGFuZCBhc3luYy5cbiAgICogQHBhcmFtIHtzdHJpbmd9IHZhck5hbWVcbiAgICogQHBhcmFtIHtzdHJpbmd9IHN0YXJ0RXZlbnRcbiAgICogQHBhcmFtIHtzdHJpbmc9fSBlbmRFdmVudFxuICAgKiBAcmV0dXJuIHshVmFyaWFibGVTb3VyY2V9XG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBzZXRUaW1pbmdSZXNvbHZlcl8odmFyTmFtZSwgc3RhcnRFdmVudCwgZW5kRXZlbnQpIHtcbiAgICByZXR1cm4gdGhpcy5zZXRCb3RoKFxuICAgICAgdmFyTmFtZSxcbiAgICAgICgpID0+IHtcbiAgICAgICAgcmV0dXJuIGdldFRpbWluZ0RhdGFTeW5jKHRoaXMuYW1wZG9jLndpbiwgc3RhcnRFdmVudCwgZW5kRXZlbnQpO1xuICAgICAgfSxcbiAgICAgICgpID0+IHtcbiAgICAgICAgcmV0dXJuIGdldFRpbWluZ0RhdGFBc3luYyh0aGlzLmFtcGRvYy53aW4sIHN0YXJ0RXZlbnQsIGVuZEV2ZW50KTtcbiAgICAgIH1cbiAgICApO1xuICB9XG5cbiAgLyoqIEBvdmVycmlkZSAqL1xuICBpbml0aWFsaXplKCkge1xuICAgIGNvbnN0IHt3aW59ID0gdGhpcy5hbXBkb2M7XG4gICAgY29uc3QgZWxlbWVudCA9IHRoaXMuYW1wZG9jLmdldEhlYWROb2RlKCk7XG5cbiAgICAvKiogQGNvbnN0IHshLi92aWV3cG9ydC92aWV3cG9ydC1pbnRlcmZhY2UuVmlld3BvcnRJbnRlcmZhY2V9ICovXG4gICAgY29uc3Qgdmlld3BvcnQgPSBTZXJ2aWNlcy52aWV3cG9ydEZvckRvYyh0aGlzLmFtcGRvYyk7XG5cbiAgICAvLyBSZXR1cm5zIGEgcmFuZG9tIHZhbHVlIGZvciBjYWNoZSBidXN0ZXJzLlxuICAgIHRoaXMuc2V0KCdSQU5ET00nLCAoKSA9PiBNYXRoLnJhbmRvbSgpKTtcblxuICAgIC8vIFByb3ZpZGVzIGEgY291bnRlciBzdGFydGluZyBhdCAxIHBlciBnaXZlbiBzY29wZS5cbiAgICBjb25zdCBjb3VudGVyU3RvcmUgPSBPYmplY3QuY3JlYXRlKG51bGwpO1xuICAgIHRoaXMuc2V0KCdDT1VOVEVSJywgKHNjb3BlKSA9PiB7XG4gICAgICByZXR1cm4gKGNvdW50ZXJTdG9yZVtzY29wZV0gPSAoY291bnRlclN0b3JlW3Njb3BlXSB8IDApICsgMSk7XG4gICAgfSk7XG5cbiAgICAvLyBSZXR1cm5zIHRoZSBjYW5vbmljYWwgVVJMIGZvciB0aGlzIEFNUCBkb2N1bWVudC5cbiAgICB0aGlzLnNldCgnQ0FOT05JQ0FMX1VSTCcsICgpID0+IHRoaXMuZ2V0RG9jSW5mb18oKS5jYW5vbmljYWxVcmwpO1xuXG4gICAgLy8gUmV0dXJucyB0aGUgaG9zdCBvZiB0aGUgY2Fub25pY2FsIFVSTCBmb3IgdGhpcyBBTVAgZG9jdW1lbnQuXG4gICAgdGhpcy5zZXQoXG4gICAgICAnQ0FOT05JQ0FMX0hPU1QnLFxuICAgICAgKCkgPT4gcGFyc2VVcmxEZXByZWNhdGVkKHRoaXMuZ2V0RG9jSW5mb18oKS5jYW5vbmljYWxVcmwpLmhvc3RcbiAgICApO1xuXG4gICAgLy8gUmV0dXJucyB0aGUgaG9zdG5hbWUgb2YgdGhlIGNhbm9uaWNhbCBVUkwgZm9yIHRoaXMgQU1QIGRvY3VtZW50LlxuICAgIHRoaXMuc2V0KFxuICAgICAgJ0NBTk9OSUNBTF9IT1NUTkFNRScsXG4gICAgICAoKSA9PiBwYXJzZVVybERlcHJlY2F0ZWQodGhpcy5nZXREb2NJbmZvXygpLmNhbm9uaWNhbFVybCkuaG9zdG5hbWVcbiAgICApO1xuXG4gICAgLy8gUmV0dXJucyB0aGUgcGF0aCBvZiB0aGUgY2Fub25pY2FsIFVSTCBmb3IgdGhpcyBBTVAgZG9jdW1lbnQuXG4gICAgdGhpcy5zZXQoXG4gICAgICAnQ0FOT05JQ0FMX1BBVEgnLFxuICAgICAgKCkgPT4gcGFyc2VVcmxEZXByZWNhdGVkKHRoaXMuZ2V0RG9jSW5mb18oKS5jYW5vbmljYWxVcmwpLnBhdGhuYW1lXG4gICAgKTtcblxuICAgIC8vIFJldHVybnMgdGhlIHJlZmVycmVyIFVSTC5cbiAgICB0aGlzLnNldEFzeW5jKFxuICAgICAgJ0RPQ1VNRU5UX1JFRkVSUkVSJyxcbiAgICAgIC8qKiBAdHlwZSB7QXN5bmNSZXNvbHZlckRlZn0gKi8gKFxuICAgICAgICAoKSA9PiB7XG4gICAgICAgICAgcmV0dXJuIFNlcnZpY2VzLnZpZXdlckZvckRvYyh0aGlzLmFtcGRvYykuZ2V0UmVmZXJyZXJVcmwoKTtcbiAgICAgICAgfVxuICAgICAgKVxuICAgICk7XG5cbiAgICAvLyBMaWtlIERPQ1VNRU5UX1JFRkVSUkVSLCBidXQgcmV0dXJucyBudWxsIGlmIHRoZSByZWZlcnJlciBpcyBvZlxuICAgIC8vIHNhbWUgZG9tYWluIG9yIHRoZSBjb3JyZXNwb25kaW5nIENETiBwcm94eS5cbiAgICB0aGlzLnNldEFzeW5jKFxuICAgICAgJ0VYVEVSTkFMX1JFRkVSUkVSJyxcbiAgICAgIC8qKiBAdHlwZSB7QXN5bmNSZXNvbHZlckRlZn0gKi8gKFxuICAgICAgICAoKSA9PiB7XG4gICAgICAgICAgcmV0dXJuIFNlcnZpY2VzLnZpZXdlckZvckRvYyh0aGlzLmFtcGRvYylcbiAgICAgICAgICAgIC5nZXRSZWZlcnJlclVybCgpXG4gICAgICAgICAgICAudGhlbigocmVmZXJyZXIpID0+IHtcbiAgICAgICAgICAgICAgaWYgKCFyZWZlcnJlcikge1xuICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIGNvbnN0IHJlZmVycmVySG9zdG5hbWUgPSBwYXJzZVVybERlcHJlY2F0ZWQoXG4gICAgICAgICAgICAgICAgZ2V0U291cmNlVXJsKHJlZmVycmVyKVxuICAgICAgICAgICAgICApLmhvc3RuYW1lO1xuICAgICAgICAgICAgICBjb25zdCBjdXJyZW50SG9zdG5hbWUgPSBXaW5kb3dJbnRlcmZhY2UuZ2V0SG9zdG5hbWUod2luKTtcbiAgICAgICAgICAgICAgcmV0dXJuIHJlZmVycmVySG9zdG5hbWUgPT09IGN1cnJlbnRIb3N0bmFtZSA/IG51bGwgOiByZWZlcnJlcjtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICApXG4gICAgKTtcblxuICAgIC8vIFJldHVybnMgdGhlIHRpdGxlIG9mIHRoaXMgQU1QIGRvY3VtZW50LlxuICAgIHRoaXMuc2V0KCdUSVRMRScsICgpID0+IHtcbiAgICAgIC8vIFRoZSBlbnZpcm9ubWVudCBtYXkgb3ZlcnJpZGUgdGhlIHRpdGxlIGFuZCBzZXQgb3JpZ2luYWxUaXRsZS4gUHJlZmVyXG4gICAgICAvLyB0aGF0IGlmIGF2YWlsYWJsZS5cbiAgICAgIGNvbnN0IGRvYyA9IHdpbi5kb2N1bWVudDtcbiAgICAgIHJldHVybiBkb2NbJ29yaWdpbmFsVGl0bGUnXSB8fCBkb2MudGl0bGU7XG4gICAgfSk7XG5cbiAgICAvLyBSZXR1cm5zIHRoZSBVUkwgZm9yIHRoaXMgQU1QIGRvY3VtZW50LlxuICAgIHRoaXMuc2V0KCdBTVBET0NfVVJMJywgKCkgPT4ge1xuICAgICAgcmV0dXJuIHJlbW92ZUZyYWdtZW50KHRoaXMuYWRkUmVwbGFjZVBhcmFtc0lmTWlzc2luZ18od2luLmxvY2F0aW9uLmhyZWYpKTtcbiAgICB9KTtcblxuICAgIC8vIFJldHVybnMgdGhlIGhvc3Qgb2YgdGhlIFVSTCBmb3IgdGhpcyBBTVAgZG9jdW1lbnQuXG4gICAgdGhpcy5zZXQoJ0FNUERPQ19IT1NUJywgKCkgPT4ge1xuICAgICAgY29uc3QgdXJsID0gcGFyc2VVcmxEZXByZWNhdGVkKHdpbi5sb2NhdGlvbi5ocmVmKTtcbiAgICAgIHJldHVybiB1cmwgJiYgdXJsLmhvc3Q7XG4gICAgfSk7XG5cbiAgICAvLyBSZXR1cm5zIHRoZSBob3N0bmFtZSBvZiB0aGUgVVJMIGZvciB0aGlzIEFNUCBkb2N1bWVudC5cbiAgICB0aGlzLnNldCgnQU1QRE9DX0hPU1ROQU1FJywgKCkgPT4ge1xuICAgICAgY29uc3QgdXJsID0gcGFyc2VVcmxEZXByZWNhdGVkKHdpbi5sb2NhdGlvbi5ocmVmKTtcbiAgICAgIHJldHVybiB1cmwgJiYgdXJsLmhvc3RuYW1lO1xuICAgIH0pO1xuXG4gICAgLy8gUmV0dXJucyB0aGUgU291cmNlIFVSTCBmb3IgdGhpcyBBTVAgZG9jdW1lbnQuXG4gICAgY29uc3QgZXhwYW5kU291cmNlVXJsID0gKCkgPT4ge1xuICAgICAgY29uc3QgZG9jSW5mbyA9IHRoaXMuZ2V0RG9jSW5mb18oKTtcbiAgICAgIHJldHVybiByZW1vdmVGcmFnbWVudCh0aGlzLmFkZFJlcGxhY2VQYXJhbXNJZk1pc3NpbmdfKGRvY0luZm8uc291cmNlVXJsKSk7XG4gICAgfTtcbiAgICB0aGlzLnNldEJvdGgoXG4gICAgICAnU09VUkNFX1VSTCcsXG4gICAgICAoKSA9PiBleHBhbmRTb3VyY2VVcmwoKSxcbiAgICAgICgpID0+IGdldFRyYWNrSW1wcmVzc2lvblByb21pc2UoKS50aGVuKCgpID0+IGV4cGFuZFNvdXJjZVVybCgpKVxuICAgICk7XG5cbiAgICAvLyBSZXR1cm5zIHRoZSBob3N0IG9mIHRoZSBTb3VyY2UgVVJMIGZvciB0aGlzIEFNUCBkb2N1bWVudC5cbiAgICB0aGlzLnNldChcbiAgICAgICdTT1VSQ0VfSE9TVCcsXG4gICAgICAoKSA9PiBwYXJzZVVybERlcHJlY2F0ZWQodGhpcy5nZXREb2NJbmZvXygpLnNvdXJjZVVybCkuaG9zdFxuICAgICk7XG5cbiAgICAvLyBSZXR1cm5zIHRoZSBob3N0bmFtZSBvZiB0aGUgU291cmNlIFVSTCBmb3IgdGhpcyBBTVAgZG9jdW1lbnQuXG4gICAgdGhpcy5zZXQoXG4gICAgICAnU09VUkNFX0hPU1ROQU1FJyxcbiAgICAgICgpID0+IHBhcnNlVXJsRGVwcmVjYXRlZCh0aGlzLmdldERvY0luZm9fKCkuc291cmNlVXJsKS5ob3N0bmFtZVxuICAgICk7XG5cbiAgICAvLyBSZXR1cm5zIHRoZSBwYXRoIG9mIHRoZSBTb3VyY2UgVVJMIGZvciB0aGlzIEFNUCBkb2N1bWVudC5cbiAgICB0aGlzLnNldChcbiAgICAgICdTT1VSQ0VfUEFUSCcsXG4gICAgICAoKSA9PiBwYXJzZVVybERlcHJlY2F0ZWQodGhpcy5nZXREb2NJbmZvXygpLnNvdXJjZVVybCkucGF0aG5hbWVcbiAgICApO1xuXG4gICAgLy8gUmV0dXJucyBhIHJhbmRvbSBzdHJpbmcgdGhhdCB3aWxsIGJlIHRoZSBjb25zdGFudCBmb3IgdGhlIGR1cmF0aW9uIG9mXG4gICAgLy8gc2luZ2xlIHBhZ2Ugdmlldy4gSXQgc2hvdWxkIGhhdmUgc3VmZmljaWVudCBlbnRyb3B5IHRvIGJlIHVuaXF1ZSBmb3JcbiAgICAvLyBhbGwgdGhlIHBhZ2Ugdmlld3MgYSBzaW5nbGUgdXNlciBpcyBtYWtpbmcgYXQgYSB0aW1lLlxuICAgIHRoaXMuc2V0KCdQQUdFX1ZJRVdfSUQnLCAoKSA9PiB0aGlzLmdldERvY0luZm9fKCkucGFnZVZpZXdJZCk7XG5cbiAgICAvLyBSZXR1cm5zIGEgcmFuZG9tIHN0cmluZyB0aGF0IHdpbGwgYmUgdGhlIGNvbnN0YW50IGZvciB0aGUgZHVyYXRpb24gb2ZcbiAgICAvLyBzaW5nbGUgcGFnZSB2aWV3LiBJdCBzaG91bGQgaGF2ZSBzdWZmaWNpZW50IGVudHJvcHkgdG8gYmUgdW5pcXVlIGZvclxuICAgIC8vIGFsbCB0aGUgcGFnZSB2aWV3cyBhIHNpbmdsZSB1c2VyIGlzIG1ha2luZyBhdCBhIHRpbWUuXG4gICAgdGhpcy5zZXRBc3luYygnUEFHRV9WSUVXX0lEXzY0JywgKCkgPT4gdGhpcy5nZXREb2NJbmZvXygpLnBhZ2VWaWV3SWQ2NCk7XG5cbiAgICB0aGlzLnNldEJvdGgoXG4gICAgICAnUVVFUllfUEFSQU0nLFxuICAgICAgKHBhcmFtLCBkZWZhdWx0VmFsdWUgPSAnJykgPT4ge1xuICAgICAgICByZXR1cm4gdGhpcy5nZXRRdWVyeVBhcmFtRGF0YV8ocGFyYW0sIGRlZmF1bHRWYWx1ZSk7XG4gICAgICB9LFxuICAgICAgKHBhcmFtLCBkZWZhdWx0VmFsdWUgPSAnJykgPT4ge1xuICAgICAgICByZXR1cm4gZ2V0VHJhY2tJbXByZXNzaW9uUHJvbWlzZSgpLnRoZW4oKCkgPT4ge1xuICAgICAgICAgIHJldHVybiB0aGlzLmdldFF1ZXJ5UGFyYW1EYXRhXyhwYXJhbSwgZGVmYXVsdFZhbHVlKTtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgKTtcblxuICAgIC8vIFJldHVybnMgdGhlIHZhbHVlIG9mIHRoZSBnaXZlbiBmaWVsZCBuYW1lIGluIHRoZSBmcmFnbWVudCBxdWVyeSBzdHJpbmcuXG4gICAgLy8gU2Vjb25kIHBhcmFtZXRlciBpcyBhbiBvcHRpb25hbCBkZWZhdWx0IHZhbHVlLlxuICAgIC8vIEZvciBleGFtcGxlLCBpZiBsb2NhdGlvbiBpcyAncHViLmNvbS9hbXAuaHRtbD94PTEjeT0yJyB0aGVuXG4gICAgLy8gRlJBR01FTlRfUEFSQU0oeSkgcmV0dXJucyAnMicgYW5kIEZSQUdNRU5UX1BBUkFNKHosIDMpIHJldHVybnMgMy5cbiAgICB0aGlzLnNldCgnRlJBR01FTlRfUEFSQU0nLCAocGFyYW0sIGRlZmF1bHRWYWx1ZSA9ICcnKSA9PiB7XG4gICAgICByZXR1cm4gdGhpcy5nZXRGcmFnbWVudFBhcmFtRGF0YV8ocGFyYW0sIGRlZmF1bHRWYWx1ZSk7XG4gICAgfSk7XG5cbiAgICAvKipcbiAgICAgKiBTdG9yZXMgY2xpZW50IGlkcyB0aGF0IHdlcmUgZ2VuZXJhdGVkIGR1cmluZyB0aGlzIHBhZ2Ugdmlld1xuICAgICAqIGluZGV4ZWQgYnkgc2NvcGUuXG4gICAgICogQHR5cGUgez9PYmplY3Q8c3RyaW5nLCBzdHJpbmc+fVxuICAgICAqL1xuICAgIGxldCBjbGllbnRJZHMgPSBudWxsO1xuICAgIC8vIFN5bmNocm9ub3VzIGFsdGVybmF0aXZlLiBPbmx5IHdvcmtzIGZvciBzY29wZXMgdGhhdCB3ZXJlIHByZXZpb3VzbHlcbiAgICAvLyByZXF1ZXN0ZWQgdXNpbmcgdGhlIGFzeW5jIG1ldGhvZC5cbiAgICB0aGlzLnNldEJvdGgoXG4gICAgICAnQ0xJRU5UX0lEJyxcbiAgICAgIChzY29wZSkgPT4ge1xuICAgICAgICBpZiAoIWNsaWVudElkcykge1xuICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBjbGllbnRJZHNbc2NvcGVdO1xuICAgICAgfSxcbiAgICAgIChzY29wZSwgb3B0X3VzZXJOb3RpZmljYXRpb25JZCwgb3B0X2Nvb2tpZU5hbWUsIG9wdF9kaXNhYmxlQmFja3VwKSA9PiB7XG4gICAgICAgIHVzZXJBc3NlcnQoXG4gICAgICAgICAgc2NvcGUsXG4gICAgICAgICAgJ1RoZSBmaXJzdCBhcmd1bWVudCB0byBDTElFTlRfSUQsIHRoZSBmYWxsYmFjaycgK1xuICAgICAgICAgICAgLypPSyovICcgQ29va2llIG5hbWUsIGlzIHJlcXVpcmVkJ1xuICAgICAgICApO1xuXG4gICAgICAgIGxldCBjb25zZW50ID0gUHJvbWlzZS5yZXNvbHZlKCk7XG5cbiAgICAgICAgLy8gSWYgbm8gYG9wdF91c2VyTm90aWZpY2F0aW9uSWRgIGFyZ3VtZW50IGlzIHByb3ZpZGVkIHRoZW5cbiAgICAgICAgLy8gYXNzdW1lIGNvbnNlbnQgaXMgZ2l2ZW4gYnkgZGVmYXVsdC5cbiAgICAgICAgaWYgKG9wdF91c2VyTm90aWZpY2F0aW9uSWQpIHtcbiAgICAgICAgICBjb25zZW50ID0gU2VydmljZXMudXNlck5vdGlmaWNhdGlvbk1hbmFnZXJGb3JEb2MoZWxlbWVudCkudGhlbihcbiAgICAgICAgICAgIChzZXJ2aWNlKSA9PiB7XG4gICAgICAgICAgICAgIHJldHVybiBzZXJ2aWNlLmdldChvcHRfdXNlck5vdGlmaWNhdGlvbklkKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBTZXJ2aWNlcy5jaWRGb3JEb2ModGhpcy5hbXBkb2MpXG4gICAgICAgICAgLnRoZW4oKGNpZCkgPT4ge1xuICAgICAgICAgICAgb3B0X2Rpc2FibGVCYWNrdXAgPSBvcHRfZGlzYWJsZUJhY2t1cCA9PSAndHJ1ZScgPyB0cnVlIDogZmFsc2U7XG4gICAgICAgICAgICByZXR1cm4gY2lkLmdldChcbiAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIC8qKiBAdHlwZSB7c3RyaW5nfSAqLyBzY29wZSxcbiAgICAgICAgICAgICAgICBjcmVhdGVDb29raWVJZk5vdFByZXNlbnQ6IHRydWUsXG4gICAgICAgICAgICAgICAgY29va2llTmFtZTogb3B0X2Nvb2tpZU5hbWUgfHwgdW5kZWZpbmVkLFxuICAgICAgICAgICAgICAgIGRpc2FibGVCYWNrdXA6IG9wdF9kaXNhYmxlQmFja3VwLFxuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICBjb25zZW50XG4gICAgICAgICAgICApO1xuICAgICAgICAgIH0pXG4gICAgICAgICAgLnRoZW4oKGNpZCkgPT4ge1xuICAgICAgICAgICAgaWYgKCFjbGllbnRJZHMpIHtcbiAgICAgICAgICAgICAgY2xpZW50SWRzID0gT2JqZWN0LmNyZWF0ZShudWxsKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gQSB0ZW1wb3Jhcnkgd29yayBhcm91bmQgdG8gZXh0cmFjdCBDbGllbnQgSUQgZnJvbSBfZ2EgY29va2llLiAjNTc2MVxuICAgICAgICAgICAgLy8gVE9ETzogcmVwbGFjZSB3aXRoIFwiZmlsdGVyXCIgd2hlbiBpdCdzIGluIHBsYWNlLiAjMjE5OFxuICAgICAgICAgICAgY29uc3QgY29va2llTmFtZSA9IG9wdF9jb29raWVOYW1lIHx8IHNjb3BlO1xuICAgICAgICAgICAgaWYgKGNpZCAmJiBjb29raWVOYW1lID09ICdfZ2EnKSB7XG4gICAgICAgICAgICAgIGlmICh0eXBlb2YgY2lkID09PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgICAgIGNpZCA9IGV4dHJhY3RDbGllbnRJZEZyb21HYUNvb2tpZShjaWQpO1xuICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIC8vIFRPRE8oQGpyaWRnZXdlbGwsICMxMTEyMCk6IHJlbW92ZSBvbmNlICMxMTEyMCBpcyBmaWd1cmVkIG91dC5cbiAgICAgICAgICAgICAgICAvLyBEbyBub3QgbG9nIHRoZSBDSUQgZGlyZWN0bHksIHRoYXQncyBQSUkuXG4gICAgICAgICAgICAgICAgZGV2KCkuZXJyb3IoXG4gICAgICAgICAgICAgICAgICBUQUcsXG4gICAgICAgICAgICAgICAgICAnbm9uLXN0cmluZyBjaWQsIHdoYXQgaXMgaXQ/JyxcbiAgICAgICAgICAgICAgICAgIE9iamVjdC5rZXlzKGNpZClcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGNsaWVudElkc1tzY29wZV0gPSBjaWQ7XG4gICAgICAgICAgICByZXR1cm4gY2lkO1xuICAgICAgICAgIH0pO1xuICAgICAgfVxuICAgICk7XG5cbiAgICAvLyBSZXR1cm5zIGFzc2lnbmVkIHZhcmlhbnQgbmFtZSBmb3IgdGhlIGdpdmVuIGV4cGVyaW1lbnQuXG4gICAgdGhpcy5zZXRBc3luYyhcbiAgICAgICdWQVJJQU5UJyxcbiAgICAgIC8qKiBAdHlwZSB7QXN5bmNSZXNvbHZlckRlZn0gKi8gKFxuICAgICAgICAoZXhwZXJpbWVudCkgPT4ge1xuICAgICAgICAgIHJldHVybiB0aGlzLmdldFZhcmlhbnRzVmFsdWVfKCh2YXJpYW50cykgPT4ge1xuICAgICAgICAgICAgY29uc3QgdmFyaWFudCA9IHZhcmlhbnRzWy8qKiBAdHlwZSB7c3RyaW5nfSAqLyAoZXhwZXJpbWVudCldO1xuICAgICAgICAgICAgdXNlckFzc2VydChcbiAgICAgICAgICAgICAgdmFyaWFudCAhPT0gdW5kZWZpbmVkLFxuICAgICAgICAgICAgICAnVGhlIHZhbHVlIHBhc3NlZCB0byBWQVJJQU5UKCkgaXMgbm90IGEgdmFsaWQgZXhwZXJpbWVudCBpbiA8YW1wLWV4cGVyaW1lbnQ+OicgK1xuICAgICAgICAgICAgICAgIGV4cGVyaW1lbnRcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgICAvLyBXaGVuIG5vIHZhcmlhbnQgYXNzaWduZWQsIHVzZSByZXNlcnZlZCBrZXl3b3JkICdub25lJy5cbiAgICAgICAgICAgIHJldHVybiB2YXJpYW50ID09PSBudWxsID8gJ25vbmUnIDogLyoqIEB0eXBlIHtzdHJpbmd9ICovICh2YXJpYW50KTtcbiAgICAgICAgICB9LCAnVkFSSUFOVCcpO1xuICAgICAgICB9XG4gICAgICApXG4gICAgKTtcblxuICAgIC8vIFJldHVybnMgYWxsIGFzc2lnbmVkIGV4cGVyaW1lbnQgdmFyaWFudHMgaW4gYSBzZXJpYWxpemVkIGZvcm0uXG4gICAgdGhpcy5zZXRBc3luYyhcbiAgICAgICdWQVJJQU5UUycsXG4gICAgICAvKiogQHR5cGUge0FzeW5jUmVzb2x2ZXJEZWZ9ICovIChcbiAgICAgICAgKCkgPT4ge1xuICAgICAgICAgIHJldHVybiB0aGlzLmdldFZhcmlhbnRzVmFsdWVfKCh2YXJpYW50cykgPT4ge1xuICAgICAgICAgICAgY29uc3QgZXhwZXJpbWVudHMgPSBbXTtcbiAgICAgICAgICAgIGZvciAoY29uc3QgZXhwZXJpbWVudCBpbiB2YXJpYW50cykge1xuICAgICAgICAgICAgICBjb25zdCB2YXJpYW50ID0gdmFyaWFudHNbZXhwZXJpbWVudF07XG4gICAgICAgICAgICAgIGV4cGVyaW1lbnRzLnB1c2goXG4gICAgICAgICAgICAgICAgZXhwZXJpbWVudCArIFZBUklBTlRfREVMSU1JVEVSICsgKHZhcmlhbnQgfHwgJ25vbmUnKVxuICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGV4cGVyaW1lbnRzLmpvaW4oRVhQRVJJTUVOVF9ERUxJTUlURVIpO1xuICAgICAgICAgIH0sICdWQVJJQU5UUycpO1xuICAgICAgICB9XG4gICAgICApXG4gICAgKTtcblxuICAgIC8vIFJldHVybnMgYXNzaWduZWQgZ2VvIHZhbHVlIGZvciBnZW9UeXBlIG9yIGFsbCBncm91cHMuXG4gICAgdGhpcy5zZXRBc3luYyhcbiAgICAgICdBTVBfR0VPJyxcbiAgICAgIC8qKiBAdHlwZSB7QXN5bmNSZXNvbHZlckRlZn0gKi8gKFxuICAgICAgICAoZ2VvVHlwZSkgPT4ge1xuICAgICAgICAgIHJldHVybiB0aGlzLmdldEdlb18oKGdlb3MpID0+IHtcbiAgICAgICAgICAgIGlmIChnZW9UeXBlKSB7XG4gICAgICAgICAgICAgIHVzZXJBc3NlcnQoXG4gICAgICAgICAgICAgICAgZ2VvVHlwZSA9PT0gJ0lTT0NvdW50cnknLFxuICAgICAgICAgICAgICAgICdUaGUgdmFsdWUgcGFzc2VkIHRvIEFNUF9HRU8oKSBpcyBub3QgdmFsaWQgbmFtZTonICsgZ2VvVHlwZVxuICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICByZXR1cm4gLyoqIEB0eXBlIHtzdHJpbmd9ICovIChnZW9zW2dlb1R5cGVdIHx8ICd1bmtub3duJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gLyoqIEB0eXBlIHtzdHJpbmd9ICovIChcbiAgICAgICAgICAgICAgZ2Vvcy5tYXRjaGVkSVNPQ291bnRyeUdyb3Vwcy5qb2luKEdFT19ERUxJTSlcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgfSwgJ0FNUF9HRU8nKTtcbiAgICAgICAgfVxuICAgICAgKVxuICAgICk7XG5cbiAgICAvLyBSZXR1cm5zIHRoZSBudW1iZXIgb2YgbWlsbGlzZWNvbmRzIHNpbmNlIDEgSmFuIDE5NzAgMDA6MDA6MDAgVVRDLlxuICAgIHRoaXMuc2V0KCdUSU1FU1RBTVAnLCBkYXRlTWV0aG9kKCdnZXRUaW1lJykpO1xuXG4gICAgLy8gUmV0dXJucyB0aGUgaHVtYW4gcmVhZGFibGUgdGltZXN0YW1wIGluIGZvcm1hdCBvZlxuICAgIC8vIDIwMTEtMDEtMDFUMTE6MTE6MTEuNjEyWi5cbiAgICB0aGlzLnNldCgnVElNRVNUQU1QX0lTTycsIGRhdGVNZXRob2QoJ3RvSVNPU3RyaW5nJykpO1xuXG4gICAgLy8gUmV0dXJucyB0aGUgdXNlcidzIHRpbWUtem9uZSBvZmZzZXQgZnJvbSBVVEMsIGluIG1pbnV0ZXMuXG4gICAgdGhpcy5zZXQoJ1RJTUVaT05FJywgZGF0ZU1ldGhvZCgnZ2V0VGltZXpvbmVPZmZzZXQnKSk7XG5cbiAgICAvLyBSZXR1cm5zIGEgcHJvbWlzZSByZXNvbHZpbmcgdG8gdmlld3BvcnQuZ2V0U2Nyb2xsSGVpZ2h0LlxuICAgIHRoaXMuc2V0KCdTQ1JPTExfSEVJR0hUJywgKCkgPT4gdmlld3BvcnQuZ2V0U2Nyb2xsSGVpZ2h0KCkpO1xuXG4gICAgLy8gUmV0dXJucyBhIHByb21pc2UgcmVzb2x2aW5nIHRvIHZpZXdwb3J0LmdldFNjcm9sbFdpZHRoLlxuICAgIHRoaXMuc2V0KCdTQ1JPTExfV0lEVEgnLCAoKSA9PiB2aWV3cG9ydC5nZXRTY3JvbGxXaWR0aCgpKTtcblxuICAgIC8vIFJldHVybnMgdGhlIHZpZXdwb3J0IGhlaWdodC5cbiAgICB0aGlzLnNldCgnVklFV1BPUlRfSEVJR0hUJywgKCkgPT4gdmlld3BvcnQuZ2V0SGVpZ2h0KCkpO1xuXG4gICAgLy8gUmV0dXJucyB0aGUgdmlld3BvcnQgd2lkdGguXG4gICAgdGhpcy5zZXQoJ1ZJRVdQT1JUX1dJRFRIJywgKCkgPT4gdmlld3BvcnQuZ2V0V2lkdGgoKSk7XG5cbiAgICBjb25zdCB7c2NyZWVufSA9IHdpbjtcbiAgICAvLyBSZXR1cm5zIHNjcmVlbi53aWR0aC5cbiAgICB0aGlzLnNldCgnU0NSRUVOX1dJRFRIJywgc2NyZWVuUHJvcGVydHkoc2NyZWVuLCAnd2lkdGgnKSk7XG5cbiAgICAvLyBSZXR1cm5zIHNjcmVlbi5oZWlnaHQuXG4gICAgdGhpcy5zZXQoJ1NDUkVFTl9IRUlHSFQnLCBzY3JlZW5Qcm9wZXJ0eShzY3JlZW4sICdoZWlnaHQnKSk7XG5cbiAgICAvLyBSZXR1cm5zIHNjcmVlbi5hdmFpbEhlaWdodC5cbiAgICB0aGlzLnNldCgnQVZBSUxBQkxFX1NDUkVFTl9IRUlHSFQnLCBzY3JlZW5Qcm9wZXJ0eShzY3JlZW4sICdhdmFpbEhlaWdodCcpKTtcblxuICAgIC8vIFJldHVybnMgc2NyZWVuLmF2YWlsV2lkdGguXG4gICAgdGhpcy5zZXQoJ0FWQUlMQUJMRV9TQ1JFRU5fV0lEVEgnLCBzY3JlZW5Qcm9wZXJ0eShzY3JlZW4sICdhdmFpbFdpZHRoJykpO1xuXG4gICAgLy8gUmV0dXJucyBzY3JlZW4uQ29sb3JEZXB0aC5cbiAgICB0aGlzLnNldCgnU0NSRUVOX0NPTE9SX0RFUFRIJywgc2NyZWVuUHJvcGVydHkoc2NyZWVuLCAnY29sb3JEZXB0aCcpKTtcblxuICAgIC8vIFJldHVybnMgZG9jdW1lbnQgY2hhcmFjdGVyc2V0LlxuICAgIHRoaXMuc2V0KCdET0NVTUVOVF9DSEFSU0VUJywgKCkgPT4ge1xuICAgICAgY29uc3QgZG9jID0gd2luLmRvY3VtZW50O1xuICAgICAgcmV0dXJuIGRvYy5jaGFyYWN0ZXJTZXQgfHwgZG9jLmNoYXJzZXQ7XG4gICAgfSk7XG5cbiAgICAvLyBSZXR1cm5zIHRoZSBicm93c2VyIGxhbmd1YWdlLlxuICAgIHRoaXMuc2V0KCdCUk9XU0VSX0xBTkdVQUdFJywgKCkgPT4ge1xuICAgICAgY29uc3QgbmF2ID0gd2luLm5hdmlnYXRvcjtcbiAgICAgIHJldHVybiAoXG4gICAgICAgIG5hdi5sYW5ndWFnZSB8fFxuICAgICAgICAvLyBPbmx5IHVzZWQgb24gSUUuXG4gICAgICAgIG5hdlsndXNlckxhbmd1YWdlJ10gfHxcbiAgICAgICAgbmF2LmJyb3dzZXJMYW5ndWFnZSB8fFxuICAgICAgICAnJ1xuICAgICAgKS50b0xvd2VyQ2FzZSgpO1xuICAgIH0pO1xuXG4gICAgLy8gUmV0dXJucyB0aGUgdXNlciBhZ2VudC5cbiAgICB0aGlzLnNldCgnVVNFUl9BR0VOVCcsICgpID0+IHtcbiAgICAgIHJldHVybiB3aW4ubmF2aWdhdG9yLnVzZXJBZ2VudDtcbiAgICB9KTtcblxuICAgIC8vIFJldHVybnMgdGhlIHRpbWUgaXQgdG9vayB0byBsb2FkIHRoZSB3aG9sZSBwYWdlLiAoZXhjbHVkZXMgYW1wLSogZWxlbWVudHNcbiAgICAvLyB0aGF0IGFyZSBub3QgcmVuZGVyZWQgYnkgdGhlIHN5c3RlbSB5ZXQuKVxuICAgIHRoaXMuc2V0VGltaW5nUmVzb2x2ZXJfKFxuICAgICAgJ1BBR0VfTE9BRF9USU1FJyxcbiAgICAgICduYXZpZ2F0aW9uU3RhcnQnLFxuICAgICAgJ2xvYWRFdmVudFN0YXJ0J1xuICAgICk7XG5cbiAgICAvLyBSZXR1cm5zIHRoZSB0aW1lIGl0IHRvb2sgdG8gcGVyZm9ybSBETlMgbG9va3VwIGZvciB0aGUgZG9tYWluLlxuICAgIHRoaXMuc2V0VGltaW5nUmVzb2x2ZXJfKFxuICAgICAgJ0RPTUFJTl9MT09LVVBfVElNRScsXG4gICAgICAnZG9tYWluTG9va3VwU3RhcnQnLFxuICAgICAgJ2RvbWFpbkxvb2t1cEVuZCdcbiAgICApO1xuXG4gICAgLy8gUmV0dXJucyB0aGUgdGltZSBpdCB0b29rIHRvIGNvbm5lY3QgdG8gdGhlIHNlcnZlci5cbiAgICB0aGlzLnNldFRpbWluZ1Jlc29sdmVyXygnVENQX0NPTk5FQ1RfVElNRScsICdjb25uZWN0U3RhcnQnLCAnY29ubmVjdEVuZCcpO1xuXG4gICAgLy8gUmV0dXJucyB0aGUgdGltZSBpdCB0b29rIGZvciBzZXJ2ZXIgdG8gc3RhcnQgc2VuZGluZyBhIHJlc3BvbnNlIHRvIHRoZVxuICAgIC8vIHJlcXVlc3QuXG4gICAgdGhpcy5zZXRUaW1pbmdSZXNvbHZlcl8oXG4gICAgICAnU0VSVkVSX1JFU1BPTlNFX1RJTUUnLFxuICAgICAgJ3JlcXVlc3RTdGFydCcsXG4gICAgICAncmVzcG9uc2VTdGFydCdcbiAgICApO1xuXG4gICAgLy8gUmV0dXJucyB0aGUgdGltZSBpdCB0b29rIHRvIGRvd25sb2FkIHRoZSBwYWdlLlxuICAgIHRoaXMuc2V0VGltaW5nUmVzb2x2ZXJfKFxuICAgICAgJ1BBR0VfRE9XTkxPQURfVElNRScsXG4gICAgICAncmVzcG9uc2VTdGFydCcsXG4gICAgICAncmVzcG9uc2VFbmQnXG4gICAgKTtcblxuICAgIC8vIFJldHVybnMgdGhlIHRpbWUgaXQgdG9vayBmb3IgcmVkaXJlY3RzIHRvIGNvbXBsZXRlLlxuICAgIHRoaXMuc2V0VGltaW5nUmVzb2x2ZXJfKCdSRURJUkVDVF9USU1FJywgJ25hdmlnYXRpb25TdGFydCcsICdmZXRjaFN0YXJ0Jyk7XG5cbiAgICAvLyBSZXR1cm5zIHRoZSB0aW1lIGl0IHRvb2sgZm9yIERPTSB0byBiZWNvbWUgaW50ZXJhY3RpdmUuXG4gICAgdGhpcy5zZXRUaW1pbmdSZXNvbHZlcl8oXG4gICAgICAnRE9NX0lOVEVSQUNUSVZFX1RJTUUnLFxuICAgICAgJ25hdmlnYXRpb25TdGFydCcsXG4gICAgICAnZG9tSW50ZXJhY3RpdmUnXG4gICAgKTtcblxuICAgIC8vIFJldHVybnMgdGhlIHRpbWUgaXQgdG9vayBmb3IgY29udGVudCB0byBsb2FkLlxuICAgIHRoaXMuc2V0VGltaW5nUmVzb2x2ZXJfKFxuICAgICAgJ0NPTlRFTlRfTE9BRF9USU1FJyxcbiAgICAgICduYXZpZ2F0aW9uU3RhcnQnLFxuICAgICAgJ2RvbUNvbnRlbnRMb2FkZWRFdmVudFN0YXJ0J1xuICAgICk7XG5cbiAgICAvLyBBY2Nlc3M6IFJlYWRlciBJRC5cbiAgICB0aGlzLnNldEFzeW5jKFxuICAgICAgJ0FDQ0VTU19SRUFERVJfSUQnLFxuICAgICAgLyoqIEB0eXBlIHtBc3luY1Jlc29sdmVyRGVmfSAqLyAoXG4gICAgICAgICgpID0+IHtcbiAgICAgICAgICByZXR1cm4gdGhpcy5nZXRBY2Nlc3NWYWx1ZV8oKGFjY2Vzc1NlcnZpY2UpID0+IHtcbiAgICAgICAgICAgIHJldHVybiBhY2Nlc3NTZXJ2aWNlLmdldEFjY2Vzc1JlYWRlcklkKCk7XG4gICAgICAgICAgfSwgJ0FDQ0VTU19SRUFERVJfSUQnKTtcbiAgICAgICAgfVxuICAgICAgKVxuICAgICk7XG5cbiAgICAvLyBBY2Nlc3M6IGRhdGEgZnJvbSB0aGUgYXV0aG9yaXphdGlvbiByZXNwb25zZS5cbiAgICB0aGlzLnNldEFzeW5jKFxuICAgICAgJ0FVVEhEQVRBJyxcbiAgICAgIC8qKiBAdHlwZSB7QXN5bmNSZXNvbHZlckRlZn0gKi8gKFxuICAgICAgICAoZmllbGQpID0+IHtcbiAgICAgICAgICB1c2VyQXNzZXJ0KFxuICAgICAgICAgICAgZmllbGQsXG4gICAgICAgICAgICAnVGhlIGZpcnN0IGFyZ3VtZW50IHRvIEFVVEhEQVRBLCB0aGUgZmllbGQsIGlzIHJlcXVpcmVkJ1xuICAgICAgICAgICk7XG4gICAgICAgICAgcmV0dXJuIHRoaXMuZ2V0QWNjZXNzVmFsdWVfKChhY2Nlc3NTZXJ2aWNlKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gYWNjZXNzU2VydmljZS5nZXRBdXRoZGF0YUZpZWxkKGZpZWxkKTtcbiAgICAgICAgICB9LCAnQVVUSERBVEEnKTtcbiAgICAgICAgfVxuICAgICAgKVxuICAgICk7XG5cbiAgICAvLyBSZXR1cm5zIGFuIGlkZW50aWZpZXIgZm9yIHRoZSB2aWV3ZXIuXG4gICAgdGhpcy5zZXRBc3luYygnVklFV0VSJywgKCkgPT4ge1xuICAgICAgcmV0dXJuIFNlcnZpY2VzLnZpZXdlckZvckRvYyh0aGlzLmFtcGRvYylcbiAgICAgICAgLmdldFZpZXdlck9yaWdpbigpXG4gICAgICAgIC50aGVuKCh2aWV3ZXIpID0+IHtcbiAgICAgICAgICByZXR1cm4gdmlld2VyID09IHVuZGVmaW5lZCA/ICcnIDogdmlld2VyO1xuICAgICAgICB9KTtcbiAgICB9KTtcblxuICAgIC8vIFJldHVybnMgdGhlIHRvdGFsIGVuZ2FnZWQgdGltZSBzaW5jZSB0aGUgY29udGVudCBiZWNhbWUgdmlld2FibGUuXG4gICAgdGhpcy5zZXRBc3luYygnVE9UQUxfRU5HQUdFRF9USU1FJywgKCkgPT4ge1xuICAgICAgcmV0dXJuIFNlcnZpY2VzLmFjdGl2aXR5Rm9yRG9jKGVsZW1lbnQpLnRoZW4oKGFjdGl2aXR5KSA9PiB7XG4gICAgICAgIHJldHVybiBhY3Rpdml0eS5nZXRUb3RhbEVuZ2FnZWRUaW1lKCk7XG4gICAgICB9KTtcbiAgICB9KTtcblxuICAgIC8vIFJldHVybnMgdGhlIGluY3JlbWVudGFsIGVuZ2FnZWQgdGltZSBzaW5jZSB0aGUgbGFzdCBwdXNoIHVuZGVyIHRoZVxuICAgIC8vIHNhbWUgbmFtZS5cbiAgICB0aGlzLnNldEFzeW5jKCdJTkNSRU1FTlRBTF9FTkdBR0VEX1RJTUUnLCAobmFtZSwgcmVzZXQpID0+IHtcbiAgICAgIHJldHVybiBTZXJ2aWNlcy5hY3Rpdml0eUZvckRvYyhlbGVtZW50KS50aGVuKChhY3Rpdml0eSkgPT4ge1xuICAgICAgICByZXR1cm4gYWN0aXZpdHkuZ2V0SW5jcmVtZW50YWxFbmdhZ2VkVGltZShcbiAgICAgICAgICAvKiogQHR5cGUge3N0cmluZ30gKi8gKG5hbWUpLFxuICAgICAgICAgIHJlc2V0ICE9PSAnZmFsc2UnXG4gICAgICAgICk7XG4gICAgICB9KTtcbiAgICB9KTtcblxuICAgIHRoaXMuc2V0KCdOQVZfVElNSU5HJywgKHN0YXJ0QXR0cmlidXRlLCBlbmRBdHRyaWJ1dGUpID0+IHtcbiAgICAgIHVzZXJBc3NlcnQoXG4gICAgICAgIHN0YXJ0QXR0cmlidXRlLFxuICAgICAgICAnVGhlIGZpcnN0IGFyZ3VtZW50IHRvIE5BVl9USU1JTkcsIHRoZSAnICtcbiAgICAgICAgICAnc3RhcnQgYXR0cmlidXRlIG5hbWUsIGlzIHJlcXVpcmVkJ1xuICAgICAgKTtcbiAgICAgIHJldHVybiBnZXRUaW1pbmdEYXRhU3luYyhcbiAgICAgICAgd2luLFxuICAgICAgICAvKipAdHlwZSB7c3RyaW5nfSovIChzdGFydEF0dHJpYnV0ZSksXG4gICAgICAgIC8qKkB0eXBlIHtzdHJpbmd9Ki8gKGVuZEF0dHJpYnV0ZSlcbiAgICAgICk7XG4gICAgfSk7XG4gICAgdGhpcy5zZXRBc3luYygnTkFWX1RJTUlORycsIChzdGFydEF0dHJpYnV0ZSwgZW5kQXR0cmlidXRlKSA9PiB7XG4gICAgICB1c2VyQXNzZXJ0KFxuICAgICAgICBzdGFydEF0dHJpYnV0ZSxcbiAgICAgICAgJ1RoZSBmaXJzdCBhcmd1bWVudCB0byBOQVZfVElNSU5HLCB0aGUgJyArXG4gICAgICAgICAgJ3N0YXJ0IGF0dHJpYnV0ZSBuYW1lLCBpcyByZXF1aXJlZCdcbiAgICAgICk7XG4gICAgICByZXR1cm4gZ2V0VGltaW5nRGF0YUFzeW5jKFxuICAgICAgICB3aW4sXG4gICAgICAgIC8qKkB0eXBlIHtzdHJpbmd9Ki8gKHN0YXJ0QXR0cmlidXRlKSxcbiAgICAgICAgLyoqQHR5cGUge3N0cmluZ30qLyAoZW5kQXR0cmlidXRlKVxuICAgICAgKTtcbiAgICB9KTtcblxuICAgIHRoaXMuc2V0KCdOQVZfVFlQRScsICgpID0+IHtcbiAgICAgIHJldHVybiBnZXROYXZpZ2F0aW9uRGF0YSh3aW4sICd0eXBlJyk7XG4gICAgfSk7XG5cbiAgICB0aGlzLnNldCgnTkFWX1JFRElSRUNUX0NPVU5UJywgKCkgPT4ge1xuICAgICAgcmV0dXJuIGdldE5hdmlnYXRpb25EYXRhKHdpbiwgJ3JlZGlyZWN0Q291bnQnKTtcbiAgICB9KTtcblxuICAgIC8vIHJldHVybnMgdGhlIEFNUCB2ZXJzaW9uIG51bWJlclxuICAgIHRoaXMuc2V0KCdBTVBfVkVSU0lPTicsICgpID0+IGludGVybmFsUnVudGltZVZlcnNpb24oKSk7XG5cbiAgICB0aGlzLnNldCgnQkFDS0dST1VORF9TVEFURScsICgpID0+IHtcbiAgICAgIHJldHVybiB0aGlzLmFtcGRvYy5pc1Zpc2libGUoKSA/ICcwJyA6ICcxJztcbiAgICB9KTtcblxuICAgIHRoaXMuc2V0QXN5bmMoJ1ZJREVPX1NUQVRFJywgKGlkLCBwcm9wZXJ0eSkgPT4ge1xuICAgICAgcmV0dXJuIFNlcnZpY2VzLnZpZGVvTWFuYWdlckZvckRvYyh0aGlzLmFtcGRvYykuZ2V0VmlkZW9TdGF0ZVByb3BlcnR5KFxuICAgICAgICBpZCxcbiAgICAgICAgcHJvcGVydHlcbiAgICAgICk7XG4gICAgfSk7XG5cbiAgICB0aGlzLnNldEFzeW5jKCdBTVBfU1RBVEUnLCAoa2V5KSA9PiB7XG4gICAgICAvLyBUaGlzIGlzIHNhZmUgc2luY2UgQU1QX1NUQVRFIGlzIG5vdCBhbiBBNEEgYWxsb3dsaXN0ZWQgdmFyaWFibGUuXG4gICAgICBjb25zdCByb290ID0gdGhpcy5hbXBkb2MuZ2V0Um9vdE5vZGUoKTtcbiAgICAgIGNvbnN0IGVsZW1lbnQgPSAvKiogQHR5cGUgeyFFbGVtZW50fCFTaGFkb3dSb290fSAqLyAoXG4gICAgICAgIHJvb3QuZG9jdW1lbnRFbGVtZW50IHx8IHJvb3RcbiAgICAgICk7XG4gICAgICByZXR1cm4gU2VydmljZXMuYmluZEZvckRvY09yTnVsbChlbGVtZW50KS50aGVuKChiaW5kKSA9PiB7XG4gICAgICAgIGlmICghYmluZCkge1xuICAgICAgICAgIHJldHVybiAnJztcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gYmluZC5nZXRTdGF0ZVZhbHVlKC8qKiBAdHlwZSB7c3RyaW5nfSAqLyAoa2V5KSkgfHwgJyc7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBNZXJnZXMgYW55IHJlcGxhY2VtZW50IHBhcmFtZXRlcnMgaW50byBhIGdpdmVuIFVSTCdzIHF1ZXJ5IHN0cmluZyxcbiAgICogcHJlZmVycmluZyB2YWx1ZXMgc2V0IGluIHRoZSBvcmlnaW5hbCBxdWVyeSBzdHJpbmcuXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBvcmlnIFRoZSBvcmlnaW5hbCBVUkxcbiAgICogQHJldHVybiB7c3RyaW5nfSBUaGUgcmVzdWx0aW5nIFVSTFxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgYWRkUmVwbGFjZVBhcmFtc0lmTWlzc2luZ18ob3JpZykge1xuICAgIGNvbnN0IHtyZXBsYWNlUGFyYW1zfSA9IHRoaXMuZ2V0RG9jSW5mb18oKTtcbiAgICBpZiAoIXJlcGxhY2VQYXJhbXMpIHtcbiAgICAgIHJldHVybiBvcmlnO1xuICAgIH1cbiAgICByZXR1cm4gYWRkTWlzc2luZ1BhcmFtc1RvVXJsKFxuICAgICAgcmVtb3ZlQW1wSnNQYXJhbXNGcm9tVXJsKG9yaWcpLFxuICAgICAgLyoqIEB0eXBlIHshSnNvbk9iamVjdH0gKi8gKHJlcGxhY2VQYXJhbXMpXG4gICAgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm4gdGhlIGRvY3VtZW50IGluZm8gZm9yIHRoZSBjdXJyZW50IGFtcGRvYy5cbiAgICogQHJldHVybiB7Li9kb2N1bWVudC1pbmZvLWltcGwuRG9jdW1lbnRJbmZvRGVmfVxuICAgKi9cbiAgZ2V0RG9jSW5mb18oKSB7XG4gICAgcmV0dXJuIFNlcnZpY2VzLmRvY3VtZW50SW5mb0ZvckRvYyh0aGlzLmFtcGRvYyk7XG4gIH1cblxuICAvKipcbiAgICogUmVzb2x2ZXMgdGhlIHZhbHVlIHZpYSBhY2Nlc3Mgc2VydmljZS4gSWYgYWNjZXNzIHNlcnZpY2UgaXMgbm90IGNvbmZpZ3VyZWQsXG4gICAqIHRoZSByZXN1bHRpbmcgdmFsdWUgaXMgYG51bGxgLlxuICAgKiBAcGFyYW0ge2Z1bmN0aW9uKCEuLi8uLi9leHRlbnNpb25zL2FtcC1hY2Nlc3MvMC4xL2FjY2Vzcy12YXJzLkFjY2Vzc1ZhcnMpOihUfCFQcm9taXNlPFQ+KX0gZ2V0dGVyXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBleHByXG4gICAqIEByZXR1cm4gez9UfVxuICAgKiBAdGVtcGxhdGUgVFxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgZ2V0QWNjZXNzVmFsdWVfKGdldHRlciwgZXhwcikge1xuICAgIGNvbnN0IGVsZW1lbnQgPSB0aGlzLmFtcGRvYy5nZXRIZWFkTm9kZSgpO1xuICAgIHJldHVybiBQcm9taXNlLmFsbChbXG4gICAgICBTZXJ2aWNlcy5hY2Nlc3NTZXJ2aWNlRm9yRG9jT3JOdWxsKGVsZW1lbnQpLFxuICAgICAgU2VydmljZXMuc3Vic2NyaXB0aW9uc1NlcnZpY2VGb3JEb2NPck51bGwoZWxlbWVudCksXG4gICAgXSkudGhlbigoc2VydmljZXMpID0+IHtcbiAgICAgIGNvbnN0IGFjY2Vzc1NlcnZpY2UgPVxuICAgICAgICAvKiogQHR5cGUgez8uLi8uLi9leHRlbnNpb25zL2FtcC1hY2Nlc3MvMC4xL2FjY2Vzcy12YXJzLkFjY2Vzc1ZhcnN9ICovIChcbiAgICAgICAgICBzZXJ2aWNlc1swXVxuICAgICAgICApO1xuICAgICAgY29uc3Qgc3Vic2NyaXB0aW9uU2VydmljZSA9XG4gICAgICAgIC8qKiBAdHlwZSB7Py4uLy4uL2V4dGVuc2lvbnMvYW1wLWFjY2Vzcy8wLjEvYWNjZXNzLXZhcnMuQWNjZXNzVmFyc30gKi8gKFxuICAgICAgICAgIHNlcnZpY2VzWzFdXG4gICAgICAgICk7XG4gICAgICBjb25zdCBzZXJ2aWNlID0gYWNjZXNzU2VydmljZSB8fCBzdWJzY3JpcHRpb25TZXJ2aWNlO1xuICAgICAgaWYgKCFzZXJ2aWNlKSB7XG4gICAgICAgIC8vIEFjY2Vzcy9zdWJzY3JpcHRpb25zIHNlcnZpY2UgaXMgbm90IGluc3RhbGxlZC5cbiAgICAgICAgdXNlcigpLmVycm9yKFxuICAgICAgICAgIFRBRyxcbiAgICAgICAgICAnQWNjZXNzIG9yIHN1YnNjaXB0aW9ucyBzZXJ2aWNlIGlzIG5vdCBpbnN0YWxsZWQgdG8gYWNjZXNzOiAnLFxuICAgICAgICAgIGV4cHJcbiAgICAgICAgKTtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICB9XG5cbiAgICAgIC8vIElmIGJvdGggYW4gYWNjZXNzIGFuZCBzdWJzY3JpcHRpb24gc2VydmljZSBhcmUgcHJlc2VudCwgcHJlZmVyXG4gICAgICAvLyBzdWJzY3JpcHRpb24gdGhlbiBmYWxsIGJhY2sgdG8gYWNjZXNzIGJlY2F1c2UgYWNjZXNzIGNhbiBiZSBuYW1lc3BhY2VkLlxuICAgICAgaWYgKGFjY2Vzc1NlcnZpY2UgJiYgc3Vic2NyaXB0aW9uU2VydmljZSkge1xuICAgICAgICByZXR1cm4gZ2V0dGVyKHN1YnNjcmlwdGlvblNlcnZpY2UpIHx8IGdldHRlcihhY2Nlc3NTZXJ2aWNlKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIGdldHRlcihzZXJ2aWNlKTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm4gdGhlIFFVRVJZX1BBUkFNIGZyb20gdGhlIGN1cnJlbnQgbG9jYXRpb24gaHJlZlxuICAgKiBAcGFyYW0ge3N0cmluZ30gcGFyYW1cbiAgICogQHBhcmFtIHtzdHJpbmd9IGRlZmF1bHRWYWx1ZVxuICAgKiBAcmV0dXJuIHtzdHJpbmd9XG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBnZXRRdWVyeVBhcmFtRGF0YV8ocGFyYW0sIGRlZmF1bHRWYWx1ZSkge1xuICAgIHVzZXJBc3NlcnQoXG4gICAgICBwYXJhbSxcbiAgICAgICdUaGUgZmlyc3QgYXJndW1lbnQgdG8gUVVFUllfUEFSQU0sIHRoZSBxdWVyeSBzdHJpbmcgJyArXG4gICAgICAgICdwYXJhbSBpcyByZXF1aXJlZCdcbiAgICApO1xuICAgIGNvbnN0IHVybCA9IHBhcnNlVXJsRGVwcmVjYXRlZChcbiAgICAgIHJlbW92ZUFtcEpzUGFyYW1zRnJvbVVybCh0aGlzLmFtcGRvYy53aW4ubG9jYXRpb24uaHJlZilcbiAgICApO1xuICAgIGNvbnN0IHBhcmFtcyA9IHBhcnNlUXVlcnlTdHJpbmcodXJsLnNlYXJjaCk7XG4gICAgY29uc3Qge3JlcGxhY2VQYXJhbXN9ID0gdGhpcy5nZXREb2NJbmZvXygpO1xuICAgIGlmICh0eXBlb2YgcGFyYW1zW3BhcmFtXSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIHJldHVybiBwYXJhbXNbcGFyYW1dO1xuICAgIH1cbiAgICBpZiAocmVwbGFjZVBhcmFtcyAmJiB0eXBlb2YgcmVwbGFjZVBhcmFtc1twYXJhbV0gIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICByZXR1cm4gLyoqIEB0eXBlIHtzdHJpbmd9ICovIChyZXBsYWNlUGFyYW1zW3BhcmFtXSk7XG4gICAgfVxuICAgIHJldHVybiBkZWZhdWx0VmFsdWU7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJuIHRoZSBGUkFHTUVOVF9QQVJBTSBmcm9tIHRoZSBvcmlnaW5hbCBsb2NhdGlvbiBocmVmXG4gICAqIEBwYXJhbSB7Kn0gcGFyYW1cbiAgICogQHBhcmFtIHtzdHJpbmd9IGRlZmF1bHRWYWx1ZVxuICAgKiBAcmV0dXJuIHtzdHJpbmd9XG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBnZXRGcmFnbWVudFBhcmFtRGF0YV8ocGFyYW0sIGRlZmF1bHRWYWx1ZSkge1xuICAgIHVzZXJBc3NlcnQoXG4gICAgICBwYXJhbSxcbiAgICAgICdUaGUgZmlyc3QgYXJndW1lbnQgdG8gRlJBR01FTlRfUEFSQU0sIHRoZSBmcmFnbWVudCBzdHJpbmcgJyArXG4gICAgICAgICdwYXJhbSBpcyByZXF1aXJlZCdcbiAgICApO1xuICAgIHVzZXJBc3NlcnQodHlwZW9mIHBhcmFtID09ICdzdHJpbmcnLCAncGFyYW0gc2hvdWxkIGJlIGEgc3RyaW5nJyk7XG4gICAgY29uc3QgaGFzaCA9IHRoaXMuYW1wZG9jLndpbi5sb2NhdGlvblsnb3JpZ2luYWxIYXNoJ107XG4gICAgY29uc3QgcGFyYW1zID0gcGFyc2VRdWVyeVN0cmluZyhoYXNoKTtcbiAgICByZXR1cm4gcGFyYW1zW3BhcmFtXSA9PT0gdW5kZWZpbmVkID8gZGVmYXVsdFZhbHVlIDogcGFyYW1zW3BhcmFtXTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXNvbHZlcyB0aGUgdmFsdWUgdmlhIGFtcC1leHBlcmltZW50J3MgdmFyaWFudHMgc2VydmljZS5cbiAgICogQHBhcmFtIHtmdW5jdGlvbighT2JqZWN0PHN0cmluZywgc3RyaW5nPik6KD9zdHJpbmcpfSBnZXR0ZXJcbiAgICogQHBhcmFtIHtzdHJpbmd9IGV4cHJcbiAgICogQHJldHVybiB7IVByb21pc2U8P3N0cmluZz59XG4gICAqIEB0ZW1wbGF0ZSBUXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBnZXRWYXJpYW50c1ZhbHVlXyhnZXR0ZXIsIGV4cHIpIHtcbiAgICByZXR1cm4gU2VydmljZXMudmFyaWFudHNGb3JEb2NPck51bGwodGhpcy5hbXBkb2MuZ2V0SGVhZE5vZGUoKSlcbiAgICAgIC50aGVuKCh2YXJpYW50cykgPT4ge1xuICAgICAgICB1c2VyQXNzZXJ0KFxuICAgICAgICAgIHZhcmlhbnRzLFxuICAgICAgICAgICdUbyB1c2UgdmFyaWFibGUgJXMsIGFtcC1leHBlcmltZW50IHNob3VsZCBiZSBjb25maWd1cmVkJyxcbiAgICAgICAgICBleHByXG4gICAgICAgICk7XG4gICAgICAgIHJldHVybiB2YXJpYW50cy5nZXRWYXJpYW50cygpO1xuICAgICAgfSlcbiAgICAgIC50aGVuKCh2YXJpYW50c01hcCkgPT4gZ2V0dGVyKHZhcmlhbnRzTWFwKSk7XG4gIH1cblxuICAvKipcbiAgICogUmVzb2x2ZXMgdGhlIHZhbHVlIHZpYSBnZW8gc2VydmljZS5cbiAgICogQHBhcmFtIHtmdW5jdGlvbighLi4vLi4vZXh0ZW5zaW9ucy9hbXAtZ2VvLzAuMS9hbXAtZ2VvLkdlb0RlZil9IGdldHRlclxuICAgKiBAcGFyYW0ge3N0cmluZ30gZXhwclxuICAgKiBAcmV0dXJuIHshUHJvbWlzZTxPYmplY3Q8c3RyaW5nLChzdHJpbmd8QXJyYXk8c3RyaW5nPik+Pn1cbiAgICogQHRlbXBsYXRlIFRcbiAgICogQHByaXZhdGVcbiAgICovXG4gIGdldEdlb18oZ2V0dGVyLCBleHByKSB7XG4gICAgY29uc3QgZWxlbWVudCA9IHRoaXMuYW1wZG9jLmdldEhlYWROb2RlKCk7XG4gICAgcmV0dXJuIFNlcnZpY2VzLmdlb0ZvckRvY09yTnVsbChlbGVtZW50KS50aGVuKChnZW8pID0+IHtcbiAgICAgIHVzZXJBc3NlcnQoZ2VvLCAnVG8gdXNlIHZhcmlhYmxlICVzLCBhbXAtZ2VvIHNob3VsZCBiZSBjb25maWd1cmVkJywgZXhwcik7XG4gICAgICByZXR1cm4gZ2V0dGVyKGdlbyk7XG4gICAgfSk7XG4gIH1cbn1cblxuLyoqXG4gKiBUaGlzIGNsYXNzIHJlcGxhY2VzIHN1YnN0aXR1dGlvbiB2YXJpYWJsZXMgd2l0aCB0aGVpciB2YWx1ZXMuXG4gKiBEb2N1bWVudCBuZXcgdmFsdWVzIGluIC4uL2RvY3Mvc3BlYy9hbXAtdmFyLXN1YnN0aXR1dGlvbnMubWRcbiAqIEBwYWNrYWdlIEZvciBleHBvcnRcbiAqL1xuZXhwb3J0IGNsYXNzIFVybFJlcGxhY2VtZW50cyB7XG4gIC8qKlxuICAgKiBAcGFyYW0geyEuL2FtcGRvYy1pbXBsLkFtcERvY30gYW1wZG9jXG4gICAqIEBwYXJhbSB7IVZhcmlhYmxlU291cmNlfSB2YXJpYWJsZVNvdXJjZVxuICAgKi9cbiAgY29uc3RydWN0b3IoYW1wZG9jLCB2YXJpYWJsZVNvdXJjZSkge1xuICAgIC8qKiBAY29uc3QgeyEuL2FtcGRvYy1pbXBsLkFtcERvY30gKi9cbiAgICB0aGlzLmFtcGRvYyA9IGFtcGRvYztcblxuICAgIC8qKiBAdHlwZSB7VmFyaWFibGVTb3VyY2V9ICovXG4gICAgdGhpcy52YXJpYWJsZVNvdXJjZV8gPSB2YXJpYWJsZVNvdXJjZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTeW5jaHJvbm91c2x5IGV4cGFuZHMgdGhlIHByb3ZpZGVkIHNvdXJjZSBieSByZXBsYWNpbmcgYWxsIGtub3duIHZhcmlhYmxlc1xuICAgKiB3aXRoIHRoZWlyIHJlc29sdmVkIHZhbHVlcy4gT3B0aW9uYWwgYG9wdF9iaW5kaW5nc2AgY2FuIGJlIHVzZWQgdG8gYWRkIG5ld1xuICAgKiB2YXJpYWJsZXMgb3Igb3ZlcnJpZGUgZXhpc3Rpbmcgb25lcy4gIEFueSBhc3luYyBiaW5kaW5ncyBhcmUgaWdub3JlZC5cbiAgICogQHBhcmFtIHtzdHJpbmd9IHNvdXJjZVxuICAgKiBAcGFyYW0geyFPYmplY3Q8c3RyaW5nLCAoUmVzb2x2ZXJSZXR1cm5EZWZ8IVN5bmNSZXNvbHZlckRlZik+PX0gb3B0X2JpbmRpbmdzXG4gICAqIEBwYXJhbSB7IU9iamVjdDxzdHJpbmcsIGJvb2xlYW4+PX0gb3B0X2FsbG93bGlzdCBPcHRpb25hbCBhbGxvd2xpc3Qgb2ZcbiAgICogICAgIG5hbWVzIHRoYXQgY2FuIGJlIHN1YnN0aXR1dGVkLlxuICAgKiBAcmV0dXJuIHtzdHJpbmd9XG4gICAqL1xuICBleHBhbmRTdHJpbmdTeW5jKHNvdXJjZSwgb3B0X2JpbmRpbmdzLCBvcHRfYWxsb3dsaXN0KSB7XG4gICAgcmV0dXJuIC8qKiBAdHlwZSB7c3RyaW5nfSAqLyAoXG4gICAgICBuZXcgRXhwYW5kZXIoXG4gICAgICAgIHRoaXMudmFyaWFibGVTb3VyY2VfLFxuICAgICAgICBvcHRfYmluZGluZ3MsXG4gICAgICAgIC8qIG9wdF9jb2xsZWN0VmFycyAqLyB1bmRlZmluZWQsXG4gICAgICAgIC8qIG9wdF9zeW5jICovIHRydWUsXG4gICAgICAgIG9wdF9hbGxvd2xpc3QsXG4gICAgICAgIC8qIG9wdF9ub0VuY29kZSAqLyB0cnVlXG4gICAgICApLi8qT0sqLyBleHBhbmQoc291cmNlKVxuICAgICk7XG4gIH1cblxuICAvKipcbiAgICogRXhwYW5kcyB0aGUgcHJvdmlkZWQgc291cmNlIGJ5IHJlcGxhY2luZyBhbGwga25vd24gdmFyaWFibGVzIHdpdGggdGhlaXJcbiAgICogcmVzb2x2ZWQgdmFsdWVzLiBPcHRpb25hbCBgb3B0X2JpbmRpbmdzYCBjYW4gYmUgdXNlZCB0byBhZGQgbmV3IHZhcmlhYmxlc1xuICAgKiBvciBvdmVycmlkZSBleGlzdGluZyBvbmVzLlxuICAgKiBAcGFyYW0ge3N0cmluZ30gc291cmNlXG4gICAqIEBwYXJhbSB7IU9iamVjdDxzdHJpbmcsICo+PX0gb3B0X2JpbmRpbmdzXG4gICAqIEBwYXJhbSB7IU9iamVjdDxzdHJpbmcsIGJvb2xlYW4+PX0gb3B0X2FsbG93bGlzdFxuICAgKiBAcmV0dXJuIHshUHJvbWlzZTxzdHJpbmc+fVxuICAgKi9cbiAgZXhwYW5kU3RyaW5nQXN5bmMoc291cmNlLCBvcHRfYmluZGluZ3MsIG9wdF9hbGxvd2xpc3QpIHtcbiAgICByZXR1cm4gLyoqIEB0eXBlIHshUHJvbWlzZTxzdHJpbmc+fSAqLyAoXG4gICAgICBuZXcgRXhwYW5kZXIoXG4gICAgICAgIHRoaXMudmFyaWFibGVTb3VyY2VfLFxuICAgICAgICBvcHRfYmluZGluZ3MsXG4gICAgICAgIC8qIG9wdF9jb2xsZWN0VmFycyAqLyB1bmRlZmluZWQsXG4gICAgICAgIC8qIG9wdF9zeW5jICovIHVuZGVmaW5lZCxcbiAgICAgICAgb3B0X2FsbG93bGlzdCxcbiAgICAgICAgLyogb3B0X25vRW5jb2RlICovIHRydWVcbiAgICAgICkuLypPSyovIGV4cGFuZChzb3VyY2UpXG4gICAgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTeW5jaHJvbm91c2x5IGV4cGFuZHMgdGhlIHByb3ZpZGVkIFVSTCBieSByZXBsYWNpbmcgYWxsIGtub3duIHZhcmlhYmxlc1xuICAgKiB3aXRoIHRoZWlyIHJlc29sdmVkIHZhbHVlcy4gT3B0aW9uYWwgYG9wdF9iaW5kaW5nc2AgY2FuIGJlIHVzZWQgdG8gYWRkIG5ld1xuICAgKiB2YXJpYWJsZXMgb3Igb3ZlcnJpZGUgZXhpc3Rpbmcgb25lcy4gIEFueSBhc3luYyBiaW5kaW5ncyBhcmUgaWdub3JlZC5cbiAgICogQHBhcmFtIHtzdHJpbmd9IHVybFxuICAgKiBAcGFyYW0geyFPYmplY3Q8c3RyaW5nLCAoUmVzb2x2ZXJSZXR1cm5EZWZ8IVN5bmNSZXNvbHZlckRlZik+PX0gb3B0X2JpbmRpbmdzXG4gICAqIEBwYXJhbSB7IU9iamVjdDxzdHJpbmcsIGJvb2xlYW4+PX0gb3B0X2FsbG93bGlzdCBPcHRpb25hbCBhbGxvd2xpc3Qgb2ZcbiAgICogICAgIG5hbWVzIHRoYXQgY2FuIGJlIHN1YnN0aXR1dGVkLlxuICAgKiBAcmV0dXJuIHtzdHJpbmd9XG4gICAqL1xuICBleHBhbmRVcmxTeW5jKHVybCwgb3B0X2JpbmRpbmdzLCBvcHRfYWxsb3dsaXN0KSB7XG4gICAgcmV0dXJuIHRoaXMuZW5zdXJlUHJvdG9jb2xNYXRjaGVzXyhcbiAgICAgIHVybCxcbiAgICAgIC8qKiBAdHlwZSB7c3RyaW5nfSAqLyAoXG4gICAgICAgIG5ldyBFeHBhbmRlcihcbiAgICAgICAgICB0aGlzLnZhcmlhYmxlU291cmNlXyxcbiAgICAgICAgICBvcHRfYmluZGluZ3MsXG4gICAgICAgICAgLyogb3B0X2NvbGxlY3RWYXJzICovIHVuZGVmaW5lZCxcbiAgICAgICAgICAvKiBvcHRfc3luYyAqLyB0cnVlLFxuICAgICAgICAgIG9wdF9hbGxvd2xpc3RcbiAgICAgICAgKS4vKk9LKi8gZXhwYW5kKHVybClcbiAgICAgIClcbiAgICApO1xuICB9XG5cbiAgLyoqXG4gICAqIEV4cGFuZHMgdGhlIHByb3ZpZGVkIFVSTCBieSByZXBsYWNpbmcgYWxsIGtub3duIHZhcmlhYmxlcyB3aXRoIHRoZWlyXG4gICAqIHJlc29sdmVkIHZhbHVlcy4gT3B0aW9uYWwgYG9wdF9iaW5kaW5nc2AgY2FuIGJlIHVzZWQgdG8gYWRkIG5ldyB2YXJpYWJsZXNcbiAgICogb3Igb3ZlcnJpZGUgZXhpc3Rpbmcgb25lcy5cbiAgICogQHBhcmFtIHtzdHJpbmd9IHVybFxuICAgKiBAcGFyYW0geyFPYmplY3Q8c3RyaW5nLCAqPj19IG9wdF9iaW5kaW5nc1xuICAgKiBAcGFyYW0geyFPYmplY3Q8c3RyaW5nLCBib29sZWFuPj19IG9wdF9hbGxvd2xpc3QgT3B0aW9uYWwgYWxsb3dsaXN0IG9mIG5hbWVzXG4gICAqICAgICB0aGF0IGNhbiBiZSBzdWJzdGl0dXRlZC5cbiAgICogQHBhcmFtIHtib29sZWFuPX0gb3B0X25vRW5jb2RlIHNob3VsZCBub3QgZW5jb2RlIFVSTFxuICAgKiBAcmV0dXJuIHshUHJvbWlzZTxzdHJpbmc+fVxuICAgKi9cbiAgZXhwYW5kVXJsQXN5bmModXJsLCBvcHRfYmluZGluZ3MsIG9wdF9hbGxvd2xpc3QsIG9wdF9ub0VuY29kZSkge1xuICAgIHJldHVybiAvKiogQHR5cGUgeyFQcm9taXNlPHN0cmluZz59ICovIChcbiAgICAgIG5ldyBFeHBhbmRlcihcbiAgICAgICAgdGhpcy52YXJpYWJsZVNvdXJjZV8sXG4gICAgICAgIG9wdF9iaW5kaW5ncyxcbiAgICAgICAgLyogb3B0X2NvbGxlY3RWYXJzICovIHVuZGVmaW5lZCxcbiAgICAgICAgLyogb3B0X3N5bmMgKi8gdW5kZWZpbmVkLFxuICAgICAgICBvcHRfYWxsb3dsaXN0LFxuICAgICAgICBvcHRfbm9FbmNvZGVcbiAgICAgIClcbiAgICAgICAgLi8qT0sqLyBleHBhbmQodXJsKVxuICAgICAgICAudGhlbigocmVwbGFjZW1lbnQpID0+IHRoaXMuZW5zdXJlUHJvdG9jb2xNYXRjaGVzXyh1cmwsIHJlcGxhY2VtZW50KSlcbiAgICApO1xuICB9XG5cbiAgLyoqXG4gICAqIEV4cGFuZHMgYW4gaW5wdXQgZWxlbWVudCB2YWx1ZSBhdHRyaWJ1dGUgd2l0aCB2YXJpYWJsZSBzdWJzdGl0dXRlZC5cbiAgICogQHBhcmFtIHshSFRNTElucHV0RWxlbWVudH0gZWxlbWVudFxuICAgKiBAcmV0dXJuIHshUHJvbWlzZTxzdHJpbmc+fVxuICAgKi9cbiAgZXhwYW5kSW5wdXRWYWx1ZUFzeW5jKGVsZW1lbnQpIHtcbiAgICByZXR1cm4gLyoqIEB0eXBlIHshUHJvbWlzZTxzdHJpbmc+fSAqLyAoXG4gICAgICB0aGlzLmV4cGFuZElucHV0VmFsdWVfKGVsZW1lbnQsIC8qb3B0X3N5bmMqLyBmYWxzZSlcbiAgICApO1xuICB9XG5cbiAgLyoqXG4gICAqIEV4cGFuZHMgYW4gaW5wdXQgZWxlbWVudCB2YWx1ZSBhdHRyaWJ1dGUgd2l0aCB2YXJpYWJsZSBzdWJzdGl0dXRlZC5cbiAgICogQHBhcmFtIHshSFRNTElucHV0RWxlbWVudH0gZWxlbWVudFxuICAgKiBAcmV0dXJuIHtzdHJpbmd9IFJlcGxhY2VkIHN0cmluZyBmb3IgdGVzdGluZ1xuICAgKi9cbiAgZXhwYW5kSW5wdXRWYWx1ZVN5bmMoZWxlbWVudCkge1xuICAgIHJldHVybiAvKiogQHR5cGUge3N0cmluZ30gKi8gKFxuICAgICAgdGhpcy5leHBhbmRJbnB1dFZhbHVlXyhlbGVtZW50LCAvKm9wdF9zeW5jKi8gdHJ1ZSlcbiAgICApO1xuICB9XG5cbiAgLyoqXG4gICAqIEV4cGFuZHMgaW4gaW5wdXQgZWxlbWVudCB2YWx1ZSBhdHRyaWJ1dGUgd2l0aCB2YXJpYWJsZSBzdWJzdGl0dXRlZC5cbiAgICogQHBhcmFtIHshSFRNTElucHV0RWxlbWVudH0gZWxlbWVudFxuICAgKiBAcGFyYW0ge2Jvb2xlYW49fSBvcHRfc3luY1xuICAgKiBAcmV0dXJuIHtzdHJpbmd8IVByb21pc2U8c3RyaW5nPn1cbiAgICovXG4gIGV4cGFuZElucHV0VmFsdWVfKGVsZW1lbnQsIG9wdF9zeW5jKSB7XG4gICAgZGV2QXNzZXJ0KFxuICAgICAgZWxlbWVudC50YWdOYW1lID09ICdJTlBVVCcgJiZcbiAgICAgICAgKGVsZW1lbnQuZ2V0QXR0cmlidXRlKCd0eXBlJykgfHwgJycpLnRvTG93ZXJDYXNlKCkgPT0gJ2hpZGRlbicsXG4gICAgICAnSW5wdXQgdmFsdWUgZXhwYW5zaW9uIG9ubHkgd29ya3Mgb24gaGlkZGVuIGlucHV0IGZpZWxkczogJXMnLFxuICAgICAgZWxlbWVudFxuICAgICk7XG5cbiAgICBjb25zdCBhbGxvd2xpc3QgPSB0aGlzLmdldEFsbG93bGlzdEZvckVsZW1lbnRfKGVsZW1lbnQpO1xuICAgIGlmICghYWxsb3dsaXN0KSB7XG4gICAgICByZXR1cm4gb3B0X3N5bmMgPyBlbGVtZW50LnZhbHVlIDogUHJvbWlzZS5yZXNvbHZlKGVsZW1lbnQudmFsdWUpO1xuICAgIH1cbiAgICBpZiAoZWxlbWVudFtPUklHSU5BTF9WQUxVRV9QUk9QRVJUWV0gPT09IHVuZGVmaW5lZCkge1xuICAgICAgZWxlbWVudFtPUklHSU5BTF9WQUxVRV9QUk9QRVJUWV0gPSBlbGVtZW50LnZhbHVlO1xuICAgIH1cbiAgICBjb25zdCByZXN1bHQgPSBuZXcgRXhwYW5kZXIoXG4gICAgICB0aGlzLnZhcmlhYmxlU291cmNlXyxcbiAgICAgIC8qIG9wdF9iaW5kaW5ncyAqLyB1bmRlZmluZWQsXG4gICAgICAvKiBvcHRfY29sbGVjdFZhcnMgKi8gdW5kZWZpbmVkLFxuICAgICAgLyogb3B0X3N5bmMgKi8gb3B0X3N5bmMsXG4gICAgICAvKiBvcHRfYWxsb3dsaXN0ICovIGFsbG93bGlzdFxuICAgICkuLypPSyovIGV4cGFuZChlbGVtZW50W09SSUdJTkFMX1ZBTFVFX1BST1BFUlRZXSB8fCBlbGVtZW50LnZhbHVlKTtcblxuICAgIGlmIChvcHRfc3luYykge1xuICAgICAgcmV0dXJuIChlbGVtZW50LnZhbHVlID0gcmVzdWx0KTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdC50aGVuKChuZXdWYWx1ZSkgPT4ge1xuICAgICAgZWxlbWVudC52YWx1ZSA9IG5ld1ZhbHVlO1xuICAgICAgcmV0dXJuIG5ld1ZhbHVlO1xuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgYSByZXBsYWNlbWVudCBhbGxvd2xpc3QgZnJvbSBlbGVtZW50cycgZGF0YS1hbXAtcmVwbGFjZSBhdHRyaWJ1dGUuXG4gICAqIEBwYXJhbSB7IUVsZW1lbnR9IGVsZW1lbnRcbiAgICogQHBhcmFtIHshT2JqZWN0PHN0cmluZywgYm9vbGVhbj49fSBvcHRfc3VwcG9ydGVkUmVwbGFjZW1lbnQgT3B0aW9uYWwgc3VwcG9ydGVkXG4gICAqIHJlcGxhY2VtZW50IHRoYXQgZmlsdGVycyBhbGxvd2xpc3QgdG8gYSBzdWJzZXQuXG4gICAqIEByZXR1cm4geyFPYmplY3Q8c3RyaW5nLCBib29sZWFuPnx1bmRlZmluZWR9XG4gICAqL1xuICBnZXRBbGxvd2xpc3RGb3JFbGVtZW50XyhlbGVtZW50LCBvcHRfc3VwcG9ydGVkUmVwbGFjZW1lbnQpIHtcbiAgICBjb25zdCBhbGxvd2xpc3QgPSBlbGVtZW50LmdldEF0dHJpYnV0ZSgnZGF0YS1hbXAtcmVwbGFjZScpO1xuICAgIGlmICghYWxsb3dsaXN0KSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGNvbnN0IHJlcXVlc3RlZFJlcGxhY2VtZW50cyA9IHt9O1xuICAgIGFsbG93bGlzdFxuICAgICAgLnRyaW0oKVxuICAgICAgLnNwbGl0KC9cXHMrLylcbiAgICAgIC5mb3JFYWNoKChyZXBsYWNlbWVudCkgPT4ge1xuICAgICAgICBpZiAoXG4gICAgICAgICAgIW9wdF9zdXBwb3J0ZWRSZXBsYWNlbWVudCB8fFxuICAgICAgICAgIGhhc093bihvcHRfc3VwcG9ydGVkUmVwbGFjZW1lbnQsIHJlcGxhY2VtZW50KVxuICAgICAgICApIHtcbiAgICAgICAgICByZXF1ZXN0ZWRSZXBsYWNlbWVudHNbcmVwbGFjZW1lbnRdID0gdHJ1ZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB1c2VyKCkud2FybignVVJMJywgJ0lnbm9yaW5nIHVuc3VwcG9ydGVkIHJlcGxhY2VtZW50JywgcmVwbGFjZW1lbnQpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICByZXR1cm4gcmVxdWVzdGVkUmVwbGFjZW1lbnRzO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgd2hldGhlciB2YXJpYWJsZSBzdWJzdGl0dXRpb24gaXMgYWxsb3dlZCBmb3IgZ2l2ZW4gdXJsLlxuICAgKiBAcGFyYW0geyFMb2NhdGlvbn0gdXJsXG4gICAqIEByZXR1cm4ge2Jvb2xlYW59XG4gICAqL1xuICBpc0FsbG93ZWRPcmlnaW5fKHVybCkge1xuICAgIGNvbnN0IGRvY0luZm8gPSBTZXJ2aWNlcy5kb2N1bWVudEluZm9Gb3JEb2ModGhpcy5hbXBkb2MpO1xuICAgIGlmIChcbiAgICAgIHVybC5vcmlnaW4gPT0gcGFyc2VVcmxEZXByZWNhdGVkKGRvY0luZm8uY2Fub25pY2FsVXJsKS5vcmlnaW4gfHxcbiAgICAgIHVybC5vcmlnaW4gPT0gcGFyc2VVcmxEZXByZWNhdGVkKGRvY0luZm8uc291cmNlVXJsKS5vcmlnaW5cbiAgICApIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICAgIGNvbnN0IG1ldGEgPSB0aGlzLmFtcGRvYy5nZXRNZXRhQnlOYW1lKCdhbXAtbGluay12YXJpYWJsZS1hbGxvd2VkLW9yaWdpbicpO1xuICAgIGlmIChtZXRhKSB7XG4gICAgICBjb25zdCBhbGxvd2xpc3QgPSBtZXRhLnRyaW0oKS5zcGxpdCgvXFxzKy8pO1xuICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBhbGxvd2xpc3QubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgaWYgKHVybC5vcmlnaW4gPT0gcGFyc2VVcmxEZXByZWNhdGVkKGFsbG93bGlzdFtpXSkub3JpZ2luKSB7XG4gICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICAvKipcbiAgICogUmVwbGFjZXMgdmFsdWVzIGluIHRoZSBsaW5rIG9mIGFuIGFuY2hvciB0YWcgaWZcbiAgICogLSB0aGUgbGluayBvcHRzIGludG8gaXQgKHZpYSBkYXRhLWFtcC1yZXBsYWNlIGFyZ3VtZW50KVxuICAgKiAtIHRoZSBkZXN0aW5hdGlvbiBpcyB0aGUgc291cmNlIG9yIGNhbm9uaWNhbCBvcmlnaW4gb2YgdGhpcyBkb2MuXG4gICAqIEBwYXJhbSB7IUVsZW1lbnR9IGVsZW1lbnQgQW4gYW5jaG9yIGVsZW1lbnQuXG4gICAqIEBwYXJhbSB7P3N0cmluZ30gZGVmYXVsdFVybFBhcmFtcyB0byBleHBhbmQgbGluayBpZiBjYWxsZXIgcmVxdWVzdC5cbiAgICogQHJldHVybiB7c3RyaW5nfHVuZGVmaW5lZH0gUmVwbGFjZWQgc3RyaW5nIGZvciB0ZXN0aW5nXG4gICAqL1xuICBtYXliZUV4cGFuZExpbmsoZWxlbWVudCwgZGVmYXVsdFVybFBhcmFtcykge1xuICAgIGRldkFzc2VydChlbGVtZW50LnRhZ05hbWUgPT0gJ0EnKTtcbiAgICBjb25zdCBhRWxlbWVudCA9IC8qKiBAdHlwZSB7IUhUTUxBbmNob3JFbGVtZW50fSAqLyAoZWxlbWVudCk7XG4gICAgY29uc3Qgc3VwcG9ydGVkUmVwbGFjZW1lbnRzID0ge1xuICAgICAgJ0NMSUVOVF9JRCc6IHRydWUsXG4gICAgICAnUVVFUllfUEFSQU0nOiB0cnVlLFxuICAgICAgJ1BBR0VfVklFV19JRCc6IHRydWUsXG4gICAgICAnUEFHRV9WSUVXX0lEXzY0JzogdHJ1ZSxcbiAgICAgICdOQVZfVElNSU5HJzogdHJ1ZSxcbiAgICB9O1xuICAgIGxldCBhZGRpdGlvbmFsVXJsUGFyYW1ldGVycyA9XG4gICAgICBhRWxlbWVudC5nZXRBdHRyaWJ1dGUoJ2RhdGEtYW1wLWFkZHBhcmFtcycpIHx8ICcnO1xuICAgIGNvbnN0IGFsbG93bGlzdCA9IHRoaXMuZ2V0QWxsb3dsaXN0Rm9yRWxlbWVudF8oXG4gICAgICBhRWxlbWVudCxcbiAgICAgIHN1cHBvcnRlZFJlcGxhY2VtZW50c1xuICAgICk7XG5cbiAgICBpZiAoIWFsbG93bGlzdCAmJiAhYWRkaXRpb25hbFVybFBhcmFtZXRlcnMgJiYgIWRlZmF1bHRVcmxQYXJhbXMpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgLy8gT1JJR0lOQUxfSFJFRl9QUk9QRVJUWSBoYXMgdGhlIHZhbHVlIG9mIHRoZSBocmVmIFwicHJlLXJlcGxhY2VtZW50XCIuXG4gICAgLy8gV2Ugc2V0IHRoaXMgdG8gdGhlIG9yaWdpbmFsIHZhbHVlIGJlZm9yZSBkb2luZyBhbnkgd29yayBhbmQgdXNlIGl0XG4gICAgLy8gb24gc3Vic2VxdWVudCByZXBsYWNlbWVudHMsIHNvIHRoYXQgZWFjaCBydW4gZ2V0cyBhIGZyZXNoIHZhbHVlLlxuICAgIGxldCBocmVmID0gZGV2KCkuYXNzZXJ0U3RyaW5nKFxuICAgICAgYUVsZW1lbnRbT1JJR0lOQUxfSFJFRl9QUk9QRVJUWV0gfHwgYUVsZW1lbnQuZ2V0QXR0cmlidXRlKCdocmVmJylcbiAgICApO1xuICAgIGNvbnN0IHVybCA9IHBhcnNlVXJsRGVwcmVjYXRlZChocmVmKTtcbiAgICBpZiAoYUVsZW1lbnRbT1JJR0lOQUxfSFJFRl9QUk9QRVJUWV0gPT0gbnVsbCkge1xuICAgICAgYUVsZW1lbnRbT1JJR0lOQUxfSFJFRl9QUk9QRVJUWV0gPSBocmVmO1xuICAgIH1cblxuICAgIGNvbnN0IGlzQWxsb3dlZE9yaWdpbiA9IHRoaXMuaXNBbGxvd2VkT3JpZ2luXyh1cmwpO1xuICAgIGlmIChhZGRpdGlvbmFsVXJsUGFyYW1ldGVycykge1xuICAgICAgYWRkaXRpb25hbFVybFBhcmFtZXRlcnMgPSBpc0FsbG93ZWRPcmlnaW5cbiAgICAgICAgPyB0aGlzLmV4cGFuZFN5bmNJZkFsbG93ZWRMaXN0XyhhZGRpdGlvbmFsVXJsUGFyYW1ldGVycywgYWxsb3dsaXN0KVxuICAgICAgICA6IGFkZGl0aW9uYWxVcmxQYXJhbWV0ZXJzO1xuICAgICAgaHJlZiA9IGFkZFBhcmFtc1RvVXJsKGhyZWYsIHBhcnNlUXVlcnlTdHJpbmcoYWRkaXRpb25hbFVybFBhcmFtZXRlcnMpKTtcbiAgICB9XG5cbiAgICBpZiAoIWlzQWxsb3dlZE9yaWdpbikge1xuICAgICAgaWYgKGFsbG93bGlzdCkge1xuICAgICAgICB1c2VyKCkud2FybihcbiAgICAgICAgICAnVVJMJyxcbiAgICAgICAgICAnSWdub3JpbmcgbGluayByZXBsYWNlbWVudCAlcycgK1xuICAgICAgICAgICAgXCIgYmVjYXVzZSB0aGUgbGluayBkb2VzIG5vdCBnbyB0byB0aGUgZG9jdW1lbnQnc1wiICtcbiAgICAgICAgICAgICcgc291cmNlLCBjYW5vbmljYWwsIG9yIGFsbG93bGlzdGVkIG9yaWdpbi4nLFxuICAgICAgICAgIGhyZWZcbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiAoYUVsZW1lbnQuaHJlZiA9IGhyZWYpO1xuICAgIH1cblxuICAgIC8vIE5vdGUgdGhhdCBkZWZhdWx0VXJsUGFyYW1zIGlzIHRyZWF0ZWQgZGlmZmVyZW50bHkgdGhhblxuICAgIC8vIGFkZGl0aW9uYWxVcmxQYXJhbWV0ZXJzIGluIHR3byB3YXlzICMxOiBJZiB0aGUgb3V0Z29pbmcgdXJsIG9yaWdpbiBpcyBub3RcbiAgICAvLyBhbGxvd2xpc3RlZDogYWRkaXRpb25hbFVybFBhcmFtZXRlcnMgYXJlIGFsd2F5cyBhcHBlbmRlZCBieSBub3QgZXhwYW5kZWQsXG4gICAgLy8gZGVmYXVsdFVybFBhcmFtcyB3aWxsIG5vdCBiZSBhcHBlbmRlZC4gIzI6IElmIHRoZSBleHBhbnNpb24gZnVuY3Rpb24gaXNcbiAgICAvLyBub3QgYWxsb3dsaXN0ZWQ6IGFkZGl0aW9uYWxVcmxQYXJhbXRlcnMgd2lsbCBub3QgYmUgZXhwYW5kZWQsXG4gICAgLy8gZGVmYXVsdFVybFBhcmFtcyB3aWxsIGJ5IGRlZmF1bHQgc3VwcG9ydCBRVUVSWV9QQVJBTSwgYW5kIHdpbGwgc3RpbGwgYmVcbiAgICAvLyBleHBhbmRlZC5cbiAgICBpZiAoZGVmYXVsdFVybFBhcmFtcykge1xuICAgICAgaWYgKCFhbGxvd2xpc3QgfHwgIWFsbG93bGlzdFsnUVVFUllfUEFSQU0nXSkge1xuICAgICAgICAvLyBvdmVycmlkZSBhbGxvd2xpc3QgYW5kIGV4cGFuZCBkZWZhdWx0VXJsUGFyYW1zO1xuICAgICAgICBjb25zdCBvdmVycmlkZUFsbG93bGlzdCA9IHsnUVVFUllfUEFSQU0nOiB0cnVlfTtcbiAgICAgICAgZGVmYXVsdFVybFBhcmFtcyA9IHRoaXMuZXhwYW5kVXJsU3luYyhcbiAgICAgICAgICBkZWZhdWx0VXJsUGFyYW1zLFxuICAgICAgICAgIC8qIG9wdF9iaW5kaW5ncyAqLyB1bmRlZmluZWQsXG4gICAgICAgICAgLyogb3B0X2FsbG93bGlzdCAqLyBvdmVycmlkZUFsbG93bGlzdFxuICAgICAgICApO1xuICAgICAgfVxuICAgICAgaHJlZiA9IGFkZFBhcmFtc1RvVXJsKGhyZWYsIHBhcnNlUXVlcnlTdHJpbmcoZGVmYXVsdFVybFBhcmFtcykpO1xuICAgIH1cblxuICAgIGhyZWYgPSB0aGlzLmV4cGFuZFN5bmNJZkFsbG93ZWRMaXN0XyhocmVmLCBhbGxvd2xpc3QpO1xuXG4gICAgcmV0dXJuIChhRWxlbWVudC5ocmVmID0gaHJlZik7XG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHtzdHJpbmd9IGhyZWZcbiAgICogQHBhcmFtIHshT2JqZWN0PHN0cmluZywgYm9vbGVhbj58dW5kZWZpbmVkfSBhbGxvd2xpc3RcbiAgICogQHJldHVybiB7c3RyaW5nfVxuICAgKi9cbiAgZXhwYW5kU3luY0lmQWxsb3dlZExpc3RfKGhyZWYsIGFsbG93bGlzdCkge1xuICAgIHJldHVybiBhbGxvd2xpc3RcbiAgICAgID8gdGhpcy5leHBhbmRVcmxTeW5jKFxuICAgICAgICAgIGhyZWYsXG4gICAgICAgICAgLyogb3B0X2JpbmRpbmdzICovIHVuZGVmaW5lZCxcbiAgICAgICAgICAvKiBvcHRfYWxsb3dsaXN0ICovIGFsbG93bGlzdFxuICAgICAgICApXG4gICAgICA6IGhyZWY7XG4gIH1cblxuICAvKipcbiAgICogQ29sbGVjdHMgYWxsIHN1YnN0aXR1dGlvbnMgaW4gdGhlIHByb3ZpZGVkIFVSTCBhbmQgZXhwYW5kcyB0aGVtIHRvIHRoZVxuICAgKiB2YWx1ZXMgZm9yIGtub3duIHZhcmlhYmxlcy4gT3B0aW9uYWwgYG9wdF9iaW5kaW5nc2AgY2FuIGJlIHVzZWQgdG8gYWRkXG4gICAqIG5ldyB2YXJpYWJsZXMgb3Igb3ZlcnJpZGUgZXhpc3Rpbmcgb25lcy5cbiAgICogQHBhcmFtIHtzdHJpbmd9IHVybFxuICAgKiBAcGFyYW0geyFPYmplY3Q8c3RyaW5nLCAqPj19IG9wdF9iaW5kaW5nc1xuICAgKiBAcmV0dXJuIHshUHJvbWlzZTwhT2JqZWN0PHN0cmluZywgKj4+fVxuICAgKi9cbiAgY29sbGVjdFZhcnModXJsLCBvcHRfYmluZGluZ3MpIHtcbiAgICBjb25zdCB2YXJzID0gT2JqZWN0LmNyZWF0ZShudWxsKTtcbiAgICByZXR1cm4gbmV3IEV4cGFuZGVyKHRoaXMudmFyaWFibGVTb3VyY2VfLCBvcHRfYmluZGluZ3MsIHZhcnMpXG4gICAgICAuLypPSyovIGV4cGFuZCh1cmwpXG4gICAgICAudGhlbigoKSA9PiB2YXJzKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDb2xsZWN0cyBzdWJzdGl0dXRpb25zIGluIHRoZSBgc3JjYCBhdHRyaWJ1dGUgb2YgdGhlIGdpdmVuIGVsZW1lbnRcbiAgICogdGhhdCBhcmUgX25vdF8gYWxsb3dsaXN0ZWQgdmlhIGBkYXRhLWFtcC1yZXBsYWNlYCBvcHQtaW4gYXR0cmlidXRlLlxuICAgKiBAcGFyYW0geyFFbGVtZW50fSBlbGVtZW50XG4gICAqIEByZXR1cm4geyFBcnJheTxzdHJpbmc+fVxuICAgKi9cbiAgY29sbGVjdERpc2FsbG93ZWRWYXJzU3luYyhlbGVtZW50KSB7XG4gICAgY29uc3QgdXJsID0gZWxlbWVudC5nZXRBdHRyaWJ1dGUoJ3NyYycpO1xuICAgIGNvbnN0IG1hY3JvTmFtZXMgPSBuZXcgRXhwYW5kZXIodGhpcy52YXJpYWJsZVNvdXJjZV8pLmdldE1hY3JvTmFtZXModXJsKTtcbiAgICBjb25zdCBhbGxvd2xpc3QgPSB0aGlzLmdldEFsbG93bGlzdEZvckVsZW1lbnRfKGVsZW1lbnQpO1xuICAgIGlmIChhbGxvd2xpc3QpIHtcbiAgICAgIHJldHVybiBtYWNyb05hbWVzLmZpbHRlcigodikgPT4gIWFsbG93bGlzdFt2XSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIEFsbCB2YXJzIGFyZSB1bmFsbG93bGlzdGVkIGlmIHRoZSBlbGVtZW50IGhhcyBubyBhbGxvd2xpc3QuXG4gICAgICByZXR1cm4gbWFjcm9OYW1lcztcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogRW5zdXJlcyB0aGF0IHRoZSBwcm90b2NvbCBvZiB0aGUgb3JpZ2luYWwgdXJsIG1hdGNoZXMgdGhlIHByb3RvY29sIG9mIHRoZVxuICAgKiByZXBsYWNlbWVudCB1cmwuIFJldHVybnMgdGhlIHJlcGxhY2VtZW50IGlmIHRoZXkgZG8sIHRoZSBvcmlnaW5hbCBpZiB0aGV5XG4gICAqIGRvIG5vdC5cbiAgICogQHBhcmFtIHtzdHJpbmd9IHVybFxuICAgKiBAcGFyYW0ge3N0cmluZ30gcmVwbGFjZW1lbnRcbiAgICogQHJldHVybiB7c3RyaW5nfVxuICAgKi9cbiAgZW5zdXJlUHJvdG9jb2xNYXRjaGVzXyh1cmwsIHJlcGxhY2VtZW50KSB7XG4gICAgY29uc3QgbmV3UHJvdG9jb2wgPSBwYXJzZVVybERlcHJlY2F0ZWQoXG4gICAgICByZXBsYWNlbWVudCxcbiAgICAgIC8qIG9wdF9ub2NhY2hlICovIHRydWVcbiAgICApLnByb3RvY29sO1xuICAgIGNvbnN0IG9sZFByb3RvY29sID0gcGFyc2VVcmxEZXByZWNhdGVkKFxuICAgICAgdXJsLFxuICAgICAgLyogb3B0X25vY2FjaGUgKi8gdHJ1ZVxuICAgICkucHJvdG9jb2w7XG4gICAgaWYgKG5ld1Byb3RvY29sICE9IG9sZFByb3RvY29sKSB7XG4gICAgICB1c2VyKCkuZXJyb3IoVEFHLCAnSWxsZWdhbCByZXBsYWNlbWVudCBvZiB0aGUgcHJvdG9jb2w6ICcsIHVybCk7XG4gICAgICByZXR1cm4gdXJsO1xuICAgIH1cbiAgICB1c2VyQXNzZXJ0KFxuICAgICAgaXNQcm90b2NvbFZhbGlkKHJlcGxhY2VtZW50KSxcbiAgICAgICdUaGUgcmVwbGFjZW1lbnQgdXJsIGhhcyBpbnZhbGlkIHByb3RvY29sOiAlcycsXG4gICAgICByZXBsYWNlbWVudFxuICAgICk7XG5cbiAgICByZXR1cm4gcmVwbGFjZW1lbnQ7XG4gIH1cblxuICAvKipcbiAgICogQHJldHVybiB7VmFyaWFibGVTb3VyY2V9XG4gICAqL1xuICBnZXRWYXJpYWJsZVNvdXJjZSgpIHtcbiAgICByZXR1cm4gdGhpcy52YXJpYWJsZVNvdXJjZV87XG4gIH1cbn1cblxuLyoqXG4gKiBFeHRyYWN0cyBjbGllbnQgSUQgZnJvbSBhIF9nYSBjb29raWUuXG4gKiBodHRwczovL2RldmVsb3BlcnMuZ29vZ2xlLmNvbS9hbmFseXRpY3MvZGV2Z3VpZGVzL2NvbGxlY3Rpb24vYW5hbHl0aWNzanMvY29va2llcy11c2VyLWlkXG4gKiBAcGFyYW0ge3N0cmluZ30gZ2FDb29raWVcbiAqIEByZXR1cm4ge3N0cmluZ31cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGV4dHJhY3RDbGllbnRJZEZyb21HYUNvb2tpZShnYUNvb2tpZSkge1xuICByZXR1cm4gZ2FDb29raWUucmVwbGFjZSgvXihHQTF8MSlcXC5bXFxkLV0rXFwuLywgJycpO1xufVxuXG4vKipcbiAqIEBwYXJhbSB7IS4vYW1wZG9jLWltcGwuQW1wRG9jfSBhbXBkb2NcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGluc3RhbGxVcmxSZXBsYWNlbWVudHNTZXJ2aWNlRm9yRG9jKGFtcGRvYykge1xuICByZWdpc3RlclNlcnZpY2VCdWlsZGVyRm9yRG9jKGFtcGRvYywgJ3VybC1yZXBsYWNlJywgZnVuY3Rpb24gKGRvYykge1xuICAgIHJldHVybiBuZXcgVXJsUmVwbGFjZW1lbnRzKGRvYywgbmV3IEdsb2JhbFZhcmlhYmxlU291cmNlKGRvYykpO1xuICB9KTtcbn1cblxuLyoqXG4gKiBAcGFyYW0geyEuL2FtcGRvYy1pbXBsLkFtcERvY30gYW1wZG9jXG4gKiBAcGFyYW0geyFWYXJpYWJsZVNvdXJjZX0gdmFyU291cmNlXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpbnN0YWxsVXJsUmVwbGFjZW1lbnRzRm9yRW1iZWQoYW1wZG9jLCB2YXJTb3VyY2UpIHtcbiAgaW5zdGFsbFNlcnZpY2VJbkVtYmVkRG9jKFxuICAgIGFtcGRvYyxcbiAgICAndXJsLXJlcGxhY2UnLFxuICAgIG5ldyBVcmxSZXBsYWNlbWVudHMoYW1wZG9jLCB2YXJTb3VyY2UpXG4gICk7XG59XG5cbi8qKlxuICogQHR5cGVkZWYge3tpbmNvbWluZ0ZyYWdtZW50OiBzdHJpbmcsIG91dGdvaW5nRnJhZ21lbnQ6IHN0cmluZ319XG4gKi9cbmxldCBTaGFyZVRyYWNraW5nRnJhZ21lbnRzRGVmO1xuIl19
// /Users/mszylkowski/src/amphtml/src/service/url-replacements-impl.js