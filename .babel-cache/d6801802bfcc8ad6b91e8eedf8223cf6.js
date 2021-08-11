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
import * as mode from "../core/mode";
import { hasOwn } from "../core/types/object";
import { parseQueryString } from "../core/types/string/url";
import { WindowInterface } from "../core/window/interface";
import { Services } from "./";
import { Expander } from "./url-expander/expander";
import { AsyncResolverDef, ResolverReturnDef, SyncResolverDef, VariableSource, getNavigationData, getTimingDataAsync, getTimingDataSync } from "./variable-source";
import { getTrackImpressionPromise } from "../impression";
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
        return mode.version();
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInVybC1yZXBsYWNlbWVudHMtaW1wbC5qcyJdLCJuYW1lcyI6WyJtb2RlIiwiaGFzT3duIiwicGFyc2VRdWVyeVN0cmluZyIsIldpbmRvd0ludGVyZmFjZSIsIlNlcnZpY2VzIiwiRXhwYW5kZXIiLCJBc3luY1Jlc29sdmVyRGVmIiwiUmVzb2x2ZXJSZXR1cm5EZWYiLCJTeW5jUmVzb2x2ZXJEZWYiLCJWYXJpYWJsZVNvdXJjZSIsImdldE5hdmlnYXRpb25EYXRhIiwiZ2V0VGltaW5nRGF0YUFzeW5jIiwiZ2V0VGltaW5nRGF0YVN5bmMiLCJnZXRUcmFja0ltcHJlc3Npb25Qcm9taXNlIiwiZGV2IiwiZGV2QXNzZXJ0IiwidXNlciIsInVzZXJBc3NlcnQiLCJpbnN0YWxsU2VydmljZUluRW1iZWREb2MiLCJyZWdpc3RlclNlcnZpY2VCdWlsZGVyRm9yRG9jIiwiYWRkTWlzc2luZ1BhcmFtc1RvVXJsIiwiYWRkUGFyYW1zVG9VcmwiLCJnZXRTb3VyY2VVcmwiLCJpc1Byb3RvY29sVmFsaWQiLCJwYXJzZVVybERlcHJlY2F0ZWQiLCJyZW1vdmVBbXBKc1BhcmFtc0Zyb21VcmwiLCJyZW1vdmVGcmFnbWVudCIsIlRBRyIsIkVYUEVSSU1FTlRfREVMSU1JVEVSIiwiVkFSSUFOVF9ERUxJTUlURVIiLCJHRU9fREVMSU0iLCJPUklHSU5BTF9IUkVGX1BST1BFUlRZIiwiT1JJR0lOQUxfVkFMVUVfUFJPUEVSVFkiLCJkYXRlTWV0aG9kIiwibWV0aG9kIiwiRGF0ZSIsInNjcmVlblByb3BlcnR5Iiwic2NyZWVuIiwicHJvcGVydHkiLCJHbG9iYWxWYXJpYWJsZVNvdXJjZSIsInZhck5hbWUiLCJzdGFydEV2ZW50IiwiZW5kRXZlbnQiLCJzZXRCb3RoIiwiYW1wZG9jIiwid2luIiwiZWxlbWVudCIsImdldEhlYWROb2RlIiwidmlld3BvcnQiLCJ2aWV3cG9ydEZvckRvYyIsInNldCIsIk1hdGgiLCJyYW5kb20iLCJjb3VudGVyU3RvcmUiLCJPYmplY3QiLCJjcmVhdGUiLCJzY29wZSIsImdldERvY0luZm9fIiwiY2Fub25pY2FsVXJsIiwiaG9zdCIsImhvc3RuYW1lIiwicGF0aG5hbWUiLCJzZXRBc3luYyIsInZpZXdlckZvckRvYyIsImdldFJlZmVycmVyVXJsIiwidGhlbiIsInJlZmVycmVyIiwicmVmZXJyZXJIb3N0bmFtZSIsImN1cnJlbnRIb3N0bmFtZSIsImdldEhvc3RuYW1lIiwiZG9jIiwiZG9jdW1lbnQiLCJ0aXRsZSIsImFkZFJlcGxhY2VQYXJhbXNJZk1pc3NpbmdfIiwibG9jYXRpb24iLCJocmVmIiwidXJsIiwiZXhwYW5kU291cmNlVXJsIiwiZG9jSW5mbyIsInNvdXJjZVVybCIsInBhZ2VWaWV3SWQiLCJwYWdlVmlld0lkNjQiLCJwYXJhbSIsImRlZmF1bHRWYWx1ZSIsImdldFF1ZXJ5UGFyYW1EYXRhXyIsImdldEZyYWdtZW50UGFyYW1EYXRhXyIsImNsaWVudElkcyIsIm9wdF91c2VyTm90aWZpY2F0aW9uSWQiLCJvcHRfY29va2llTmFtZSIsIm9wdF9kaXNhYmxlQmFja3VwIiwiY29uc2VudCIsInVzZXJOb3RpZmljYXRpb25NYW5hZ2VyRm9yRG9jIiwic2VydmljZSIsImdldCIsImNpZEZvckRvYyIsImNpZCIsImNyZWF0ZUNvb2tpZUlmTm90UHJlc2VudCIsImNvb2tpZU5hbWUiLCJ1bmRlZmluZWQiLCJkaXNhYmxlQmFja3VwIiwiZXh0cmFjdENsaWVudElkRnJvbUdhQ29va2llIiwiZXJyb3IiLCJrZXlzIiwiZXhwZXJpbWVudCIsImdldFZhcmlhbnRzVmFsdWVfIiwidmFyaWFudHMiLCJ2YXJpYW50IiwiZXhwZXJpbWVudHMiLCJwdXNoIiwiam9pbiIsImdlb1R5cGUiLCJnZXRHZW9fIiwiZ2VvcyIsIm1hdGNoZWRJU09Db3VudHJ5R3JvdXBzIiwiZ2V0U2Nyb2xsSGVpZ2h0IiwiZ2V0U2Nyb2xsV2lkdGgiLCJnZXRIZWlnaHQiLCJnZXRXaWR0aCIsImNoYXJhY3RlclNldCIsImNoYXJzZXQiLCJuYXYiLCJuYXZpZ2F0b3IiLCJsYW5ndWFnZSIsImJyb3dzZXJMYW5ndWFnZSIsInRvTG93ZXJDYXNlIiwidXNlckFnZW50Iiwic2V0VGltaW5nUmVzb2x2ZXJfIiwiZ2V0QWNjZXNzVmFsdWVfIiwiYWNjZXNzU2VydmljZSIsImdldEFjY2Vzc1JlYWRlcklkIiwiZmllbGQiLCJnZXRBdXRoZGF0YUZpZWxkIiwiZ2V0Vmlld2VyT3JpZ2luIiwidmlld2VyIiwiYWN0aXZpdHlGb3JEb2MiLCJhY3Rpdml0eSIsImdldFRvdGFsRW5nYWdlZFRpbWUiLCJuYW1lIiwicmVzZXQiLCJnZXRJbmNyZW1lbnRhbEVuZ2FnZWRUaW1lIiwic3RhcnRBdHRyaWJ1dGUiLCJlbmRBdHRyaWJ1dGUiLCJ2ZXJzaW9uIiwiaXNWaXNpYmxlIiwiaWQiLCJ2aWRlb01hbmFnZXJGb3JEb2MiLCJnZXRWaWRlb1N0YXRlUHJvcGVydHkiLCJrZXkiLCJyb290IiwiZ2V0Um9vdE5vZGUiLCJkb2N1bWVudEVsZW1lbnQiLCJiaW5kRm9yRG9jT3JOdWxsIiwiYmluZCIsImdldFN0YXRlVmFsdWUiLCJvcmlnIiwicmVwbGFjZVBhcmFtcyIsImRvY3VtZW50SW5mb0ZvckRvYyIsImdldHRlciIsImV4cHIiLCJQcm9taXNlIiwiYWxsIiwiYWNjZXNzU2VydmljZUZvckRvY09yTnVsbCIsInN1YnNjcmlwdGlvbnNTZXJ2aWNlRm9yRG9jT3JOdWxsIiwic2VydmljZXMiLCJzdWJzY3JpcHRpb25TZXJ2aWNlIiwicGFyYW1zIiwic2VhcmNoIiwiaGFzaCIsInZhcmlhbnRzRm9yRG9jT3JOdWxsIiwiZ2V0VmFyaWFudHMiLCJ2YXJpYW50c01hcCIsImdlb0ZvckRvY09yTnVsbCIsImdlbyIsIlVybFJlcGxhY2VtZW50cyIsInZhcmlhYmxlU291cmNlIiwidmFyaWFibGVTb3VyY2VfIiwic291cmNlIiwib3B0X2JpbmRpbmdzIiwib3B0X2FsbG93bGlzdCIsImV4cGFuZCIsImVuc3VyZVByb3RvY29sTWF0Y2hlc18iLCJvcHRfbm9FbmNvZGUiLCJyZXBsYWNlbWVudCIsImV4cGFuZElucHV0VmFsdWVfIiwib3B0X3N5bmMiLCJ0YWdOYW1lIiwiZ2V0QXR0cmlidXRlIiwiYWxsb3dsaXN0IiwiZ2V0QWxsb3dsaXN0Rm9yRWxlbWVudF8iLCJ2YWx1ZSIsInJlc29sdmUiLCJyZXN1bHQiLCJuZXdWYWx1ZSIsIm9wdF9zdXBwb3J0ZWRSZXBsYWNlbWVudCIsInJlcXVlc3RlZFJlcGxhY2VtZW50cyIsInRyaW0iLCJzcGxpdCIsImZvckVhY2giLCJ3YXJuIiwib3JpZ2luIiwibWV0YSIsImdldE1ldGFCeU5hbWUiLCJpIiwibGVuZ3RoIiwiZGVmYXVsdFVybFBhcmFtcyIsImFFbGVtZW50Iiwic3VwcG9ydGVkUmVwbGFjZW1lbnRzIiwiYWRkaXRpb25hbFVybFBhcmFtZXRlcnMiLCJhc3NlcnRTdHJpbmciLCJpc0FsbG93ZWRPcmlnaW4iLCJpc0FsbG93ZWRPcmlnaW5fIiwiZXhwYW5kU3luY0lmQWxsb3dlZExpc3RfIiwib3ZlcnJpZGVBbGxvd2xpc3QiLCJleHBhbmRVcmxTeW5jIiwidmFycyIsIm1hY3JvTmFtZXMiLCJnZXRNYWNyb05hbWVzIiwiZmlsdGVyIiwidiIsIm5ld1Byb3RvY29sIiwicHJvdG9jb2wiLCJvbGRQcm90b2NvbCIsImdhQ29va2llIiwicmVwbGFjZSIsImluc3RhbGxVcmxSZXBsYWNlbWVudHNTZXJ2aWNlRm9yRG9jIiwiaW5zdGFsbFVybFJlcGxhY2VtZW50c0ZvckVtYmVkIiwidmFyU291cmNlIiwiU2hhcmVUcmFja2luZ0ZyYWdtZW50c0RlZiJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUVBLE9BQU8sS0FBS0EsSUFBWjtBQUNBLFNBQVFDLE1BQVI7QUFDQSxTQUFRQyxnQkFBUjtBQUNBLFNBQVFDLGVBQVI7QUFFQSxTQUFRQyxRQUFSO0FBRUEsU0FBUUMsUUFBUjtBQUNBLFNBQ0VDLGdCQURGLEVBRUVDLGlC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dUNBQWxCLEVBQTJEaUQsR0FBM0Q7QUFDQSxlQUFPQSxHQUFQO0FBQ0Q7O0FBQ0QzRCxNQUFBQSxVQUFVLENBQ1JNLGVBQWUsQ0FBQytKLFdBQUQsQ0FEUCxFQUVSLDhDQUZRLEVBR1JBLFdBSFEsQ0FBVjtBQU1BLGFBQU9BLFdBQVA7QUFDRDtBQUVEO0FBQ0Y7QUFDQTs7QUF0WUE7QUFBQTtBQUFBLFdBdVlFLDZCQUFvQjtBQUNsQixhQUFPLEtBQUtQLGVBQVo7QUFDRDtBQXpZSDs7QUFBQTtBQUFBOztBQTRZQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPLFNBQVMzRSwyQkFBVCxDQUFxQzBILFFBQXJDLEVBQStDO0FBQ3BELFNBQU9BLFFBQVEsQ0FBQ0MsT0FBVCxDQUFpQixvQkFBakIsRUFBdUMsRUFBdkMsQ0FBUDtBQUNEOztBQUVEO0FBQ0E7QUFDQTtBQUNBLE9BQU8sU0FBU0MsbUNBQVQsQ0FBNkNwTCxNQUE3QyxFQUFxRDtBQUMxRHpCLEVBQUFBLDRCQUE0QixDQUFDeUIsTUFBRCxFQUFTLGFBQVQsRUFBd0IsVUFBVTBCLEdBQVYsRUFBZTtBQUNqRSxXQUFPLElBQUl1RyxlQUFKLENBQW9CdkcsR0FBcEIsRUFBeUIsSUFBSS9CLG9CQUFKLENBQXlCK0IsR0FBekIsQ0FBekIsQ0FBUDtBQUNELEdBRjJCLENBQTVCO0FBR0Q7O0FBRUQ7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPLFNBQVMySiw4QkFBVCxDQUF3Q3JMLE1BQXhDLEVBQWdEc0wsU0FBaEQsRUFBMkQ7QUFDaEVoTixFQUFBQSx3QkFBd0IsQ0FDdEIwQixNQURzQixFQUV0QixhQUZzQixFQUd0QixJQUFJaUksZUFBSixDQUFvQmpJLE1BQXBCLEVBQTRCc0wsU0FBNUIsQ0FIc0IsQ0FBeEI7QUFLRDs7QUFFRDtBQUNBO0FBQ0E7QUFDQSxJQUFJQyx5QkFBSiIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ29weXJpZ2h0IDIwMTUgVGhlIEFNUCBIVE1MIEF1dGhvcnMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbiAqIHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbiAqIFlvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuICpcbiAqICAgICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG4gKlxuICogVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuICogZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUy1JU1wiIEJBU0lTLFxuICogV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG4gKiBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG4gKiBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiAqL1xuXG5pbXBvcnQgKiBhcyBtb2RlIGZyb20gJyNjb3JlL21vZGUnO1xuaW1wb3J0IHtoYXNPd259IGZyb20gJyNjb3JlL3R5cGVzL29iamVjdCc7XG5pbXBvcnQge3BhcnNlUXVlcnlTdHJpbmd9IGZyb20gJyNjb3JlL3R5cGVzL3N0cmluZy91cmwnO1xuaW1wb3J0IHtXaW5kb3dJbnRlcmZhY2V9IGZyb20gJyNjb3JlL3dpbmRvdy9pbnRlcmZhY2UnO1xuXG5pbXBvcnQge1NlcnZpY2VzfSBmcm9tICcjc2VydmljZSc7XG5cbmltcG9ydCB7RXhwYW5kZXJ9IGZyb20gJy4vdXJsLWV4cGFuZGVyL2V4cGFuZGVyJztcbmltcG9ydCB7XG4gIEFzeW5jUmVzb2x2ZXJEZWYsXG4gIFJlc29sdmVyUmV0dXJuRGVmLFxuICBTeW5jUmVzb2x2ZXJEZWYsXG4gIFZhcmlhYmxlU291cmNlLFxuICBnZXROYXZpZ2F0aW9uRGF0YSxcbiAgZ2V0VGltaW5nRGF0YUFzeW5jLFxuICBnZXRUaW1pbmdEYXRhU3luYyxcbn0gZnJvbSAnLi92YXJpYWJsZS1zb3VyY2UnO1xuXG5pbXBvcnQge2dldFRyYWNrSW1wcmVzc2lvblByb21pc2V9IGZyb20gJy4uL2ltcHJlc3Npb24nO1xuaW1wb3J0IHtkZXYsIGRldkFzc2VydCwgdXNlciwgdXNlckFzc2VydH0gZnJvbSAnLi4vbG9nJztcbmltcG9ydCB7XG4gIGluc3RhbGxTZXJ2aWNlSW5FbWJlZERvYyxcbiAgcmVnaXN0ZXJTZXJ2aWNlQnVpbGRlckZvckRvYyxcbn0gZnJvbSAnLi4vc2VydmljZS1oZWxwZXJzJztcbmltcG9ydCB7XG4gIGFkZE1pc3NpbmdQYXJhbXNUb1VybCxcbiAgYWRkUGFyYW1zVG9VcmwsXG4gIGdldFNvdXJjZVVybCxcbiAgaXNQcm90b2NvbFZhbGlkLFxuICBwYXJzZVVybERlcHJlY2F0ZWQsXG4gIHJlbW92ZUFtcEpzUGFyYW1zRnJvbVVybCxcbiAgcmVtb3ZlRnJhZ21lbnQsXG59IGZyb20gJy4uL3VybCc7XG5cbi8qKiBAcHJpdmF0ZSBAY29uc3Qge3N0cmluZ30gKi9cbmNvbnN0IFRBRyA9ICdVcmxSZXBsYWNlbWVudHMnO1xuY29uc3QgRVhQRVJJTUVOVF9ERUxJTUlURVIgPSAnISc7XG5jb25zdCBWQVJJQU5UX0RFTElNSVRFUiA9ICcuJztcbmNvbnN0IEdFT19ERUxJTSA9ICcsJztcbmNvbnN0IE9SSUdJTkFMX0hSRUZfUFJPUEVSVFkgPSAnYW1wLW9yaWdpbmFsLWhyZWYnO1xuY29uc3QgT1JJR0lOQUxfVkFMVUVfUFJPUEVSVFkgPSAnYW1wLW9yaWdpbmFsLXZhbHVlJztcblxuLyoqXG4gKiBSZXR1cm5zIGEgZnVuY3Rpb24gdGhhdCBleGVjdXRlcyBtZXRob2Qgb24gYSBuZXcgRGF0ZSBpbnN0YW5jZS4gVGhpcyBpcyBhXG4gKiBieXRlIHNhdmluZyBoYWNrLlxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBtZXRob2RcbiAqIEByZXR1cm4geyFTeW5jUmVzb2x2ZXJEZWZ9XG4gKi9cbmZ1bmN0aW9uIGRhdGVNZXRob2QobWV0aG9kKSB7XG4gIHJldHVybiAoKSA9PiBuZXcgRGF0ZSgpW21ldGhvZF0oKTtcbn1cblxuLyoqXG4gKiBSZXR1cm5zIGEgZnVuY3Rpb24gdGhhdCByZXR1cm5zIHByb3BlcnR5IG9mIHNjcmVlbi4gVGhpcyBpcyBhIGJ5dGUgc2F2aW5nXG4gKiBoYWNrLlxuICpcbiAqIEBwYXJhbSB7IVNjcmVlbn0gc2NyZWVuXG4gKiBAcGFyYW0ge3N0cmluZ30gcHJvcGVydHlcbiAqIEByZXR1cm4geyFTeW5jUmVzb2x2ZXJEZWZ9XG4gKi9cbmZ1bmN0aW9uIHNjcmVlblByb3BlcnR5KHNjcmVlbiwgcHJvcGVydHkpIHtcbiAgcmV0dXJuICgpID0+IHNjcmVlbltwcm9wZXJ0eV07XG59XG5cbi8qKlxuICogQ2xhc3MgdG8gcHJvdmlkZSB2YXJpYWJsZXMgdGhhdCBwZXJ0YWluIHRvIHRvcCBsZXZlbCBBTVAgd2luZG93LlxuICovXG5leHBvcnQgY2xhc3MgR2xvYmFsVmFyaWFibGVTb3VyY2UgZXh0ZW5kcyBWYXJpYWJsZVNvdXJjZSB7XG4gIC8qKlxuICAgKiBVdGlsaXR5IGZ1bmN0aW9uIGZvciBzZXR0aW5nIHJlc29sdmVyIGZvciB0aW1pbmcgZGF0YSB0aGF0IHN1cHBvcnRzXG4gICAqIHN5bmMgYW5kIGFzeW5jLlxuICAgKiBAcGFyYW0ge3N0cmluZ30gdmFyTmFtZVxuICAgKiBAcGFyYW0ge3N0cmluZ30gc3RhcnRFdmVudFxuICAgKiBAcGFyYW0ge3N0cmluZz19IGVuZEV2ZW50XG4gICAqIEByZXR1cm4geyFWYXJpYWJsZVNvdXJjZX1cbiAgICogQHByaXZhdGVcbiAgICovXG4gIHNldFRpbWluZ1Jlc29sdmVyXyh2YXJOYW1lLCBzdGFydEV2ZW50LCBlbmRFdmVudCkge1xuICAgIHJldHVybiB0aGlzLnNldEJvdGgoXG4gICAgICB2YXJOYW1lLFxuICAgICAgKCkgPT4ge1xuICAgICAgICByZXR1cm4gZ2V0VGltaW5nRGF0YVN5bmModGhpcy5hbXBkb2Mud2luLCBzdGFydEV2ZW50LCBlbmRFdmVudCk7XG4gICAgICB9LFxuICAgICAgKCkgPT4ge1xuICAgICAgICByZXR1cm4gZ2V0VGltaW5nRGF0YUFzeW5jKHRoaXMuYW1wZG9jLndpbiwgc3RhcnRFdmVudCwgZW5kRXZlbnQpO1xuICAgICAgfVxuICAgICk7XG4gIH1cblxuICAvKiogQG92ZXJyaWRlICovXG4gIGluaXRpYWxpemUoKSB7XG4gICAgY29uc3Qge3dpbn0gPSB0aGlzLmFtcGRvYztcbiAgICBjb25zdCBlbGVtZW50ID0gdGhpcy5hbXBkb2MuZ2V0SGVhZE5vZGUoKTtcblxuICAgIC8qKiBAY29uc3QgeyEuL3ZpZXdwb3J0L3ZpZXdwb3J0LWludGVyZmFjZS5WaWV3cG9ydEludGVyZmFjZX0gKi9cbiAgICBjb25zdCB2aWV3cG9ydCA9IFNlcnZpY2VzLnZpZXdwb3J0Rm9yRG9jKHRoaXMuYW1wZG9jKTtcblxuICAgIC8vIFJldHVybnMgYSByYW5kb20gdmFsdWUgZm9yIGNhY2hlIGJ1c3RlcnMuXG4gICAgdGhpcy5zZXQoJ1JBTkRPTScsICgpID0+IE1hdGgucmFuZG9tKCkpO1xuXG4gICAgLy8gUHJvdmlkZXMgYSBjb3VudGVyIHN0YXJ0aW5nIGF0IDEgcGVyIGdpdmVuIHNjb3BlLlxuICAgIGNvbnN0IGNvdW50ZXJTdG9yZSA9IE9iamVjdC5jcmVhdGUobnVsbCk7XG4gICAgdGhpcy5zZXQoJ0NPVU5URVInLCAoc2NvcGUpID0+IHtcbiAgICAgIHJldHVybiAoY291bnRlclN0b3JlW3Njb3BlXSA9IChjb3VudGVyU3RvcmVbc2NvcGVdIHwgMCkgKyAxKTtcbiAgICB9KTtcblxuICAgIC8vIFJldHVybnMgdGhlIGNhbm9uaWNhbCBVUkwgZm9yIHRoaXMgQU1QIGRvY3VtZW50LlxuICAgIHRoaXMuc2V0KCdDQU5PTklDQUxfVVJMJywgKCkgPT4gdGhpcy5nZXREb2NJbmZvXygpLmNhbm9uaWNhbFVybCk7XG5cbiAgICAvLyBSZXR1cm5zIHRoZSBob3N0IG9mIHRoZSBjYW5vbmljYWwgVVJMIGZvciB0aGlzIEFNUCBkb2N1bWVudC5cbiAgICB0aGlzLnNldChcbiAgICAgICdDQU5PTklDQUxfSE9TVCcsXG4gICAgICAoKSA9PiBwYXJzZVVybERlcHJlY2F0ZWQodGhpcy5nZXREb2NJbmZvXygpLmNhbm9uaWNhbFVybCkuaG9zdFxuICAgICk7XG5cbiAgICAvLyBSZXR1cm5zIHRoZSBob3N0bmFtZSBvZiB0aGUgY2Fub25pY2FsIFVSTCBmb3IgdGhpcyBBTVAgZG9jdW1lbnQuXG4gICAgdGhpcy5zZXQoXG4gICAgICAnQ0FOT05JQ0FMX0hPU1ROQU1FJyxcbiAgICAgICgpID0+IHBhcnNlVXJsRGVwcmVjYXRlZCh0aGlzLmdldERvY0luZm9fKCkuY2Fub25pY2FsVXJsKS5ob3N0bmFtZVxuICAgICk7XG5cbiAgICAvLyBSZXR1cm5zIHRoZSBwYXRoIG9mIHRoZSBjYW5vbmljYWwgVVJMIGZvciB0aGlzIEFNUCBkb2N1bWVudC5cbiAgICB0aGlzLnNldChcbiAgICAgICdDQU5PTklDQUxfUEFUSCcsXG4gICAgICAoKSA9PiBwYXJzZVVybERlcHJlY2F0ZWQodGhpcy5nZXREb2NJbmZvXygpLmNhbm9uaWNhbFVybCkucGF0aG5hbWVcbiAgICApO1xuXG4gICAgLy8gUmV0dXJucyB0aGUgcmVmZXJyZXIgVVJMLlxuICAgIHRoaXMuc2V0QXN5bmMoXG4gICAgICAnRE9DVU1FTlRfUkVGRVJSRVInLFxuICAgICAgLyoqIEB0eXBlIHtBc3luY1Jlc29sdmVyRGVmfSAqLyAoXG4gICAgICAgICgpID0+IHtcbiAgICAgICAgICByZXR1cm4gU2VydmljZXMudmlld2VyRm9yRG9jKHRoaXMuYW1wZG9jKS5nZXRSZWZlcnJlclVybCgpO1xuICAgICAgICB9XG4gICAgICApXG4gICAgKTtcblxuICAgIC8vIExpa2UgRE9DVU1FTlRfUkVGRVJSRVIsIGJ1dCByZXR1cm5zIG51bGwgaWYgdGhlIHJlZmVycmVyIGlzIG9mXG4gICAgLy8gc2FtZSBkb21haW4gb3IgdGhlIGNvcnJlc3BvbmRpbmcgQ0ROIHByb3h5LlxuICAgIHRoaXMuc2V0QXN5bmMoXG4gICAgICAnRVhURVJOQUxfUkVGRVJSRVInLFxuICAgICAgLyoqIEB0eXBlIHtBc3luY1Jlc29sdmVyRGVmfSAqLyAoXG4gICAgICAgICgpID0+IHtcbiAgICAgICAgICByZXR1cm4gU2VydmljZXMudmlld2VyRm9yRG9jKHRoaXMuYW1wZG9jKVxuICAgICAgICAgICAgLmdldFJlZmVycmVyVXJsKClcbiAgICAgICAgICAgIC50aGVuKChyZWZlcnJlcikgPT4ge1xuICAgICAgICAgICAgICBpZiAoIXJlZmVycmVyKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgY29uc3QgcmVmZXJyZXJIb3N0bmFtZSA9IHBhcnNlVXJsRGVwcmVjYXRlZChcbiAgICAgICAgICAgICAgICBnZXRTb3VyY2VVcmwocmVmZXJyZXIpXG4gICAgICAgICAgICAgICkuaG9zdG5hbWU7XG4gICAgICAgICAgICAgIGNvbnN0IGN1cnJlbnRIb3N0bmFtZSA9IFdpbmRvd0ludGVyZmFjZS5nZXRIb3N0bmFtZSh3aW4pO1xuICAgICAgICAgICAgICByZXR1cm4gcmVmZXJyZXJIb3N0bmFtZSA9PT0gY3VycmVudEhvc3RuYW1lID8gbnVsbCA6IHJlZmVycmVyO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgIClcbiAgICApO1xuXG4gICAgLy8gUmV0dXJucyB0aGUgdGl0bGUgb2YgdGhpcyBBTVAgZG9jdW1lbnQuXG4gICAgdGhpcy5zZXQoJ1RJVExFJywgKCkgPT4ge1xuICAgICAgLy8gVGhlIGVudmlyb25tZW50IG1heSBvdmVycmlkZSB0aGUgdGl0bGUgYW5kIHNldCBvcmlnaW5hbFRpdGxlLiBQcmVmZXJcbiAgICAgIC8vIHRoYXQgaWYgYXZhaWxhYmxlLlxuICAgICAgY29uc3QgZG9jID0gd2luLmRvY3VtZW50O1xuICAgICAgcmV0dXJuIGRvY1snb3JpZ2luYWxUaXRsZSddIHx8IGRvYy50aXRsZTtcbiAgICB9KTtcblxuICAgIC8vIFJldHVybnMgdGhlIFVSTCBmb3IgdGhpcyBBTVAgZG9jdW1lbnQuXG4gICAgdGhpcy5zZXQoJ0FNUERPQ19VUkwnLCAoKSA9PiB7XG4gICAgICByZXR1cm4gcmVtb3ZlRnJhZ21lbnQodGhpcy5hZGRSZXBsYWNlUGFyYW1zSWZNaXNzaW5nXyh3aW4ubG9jYXRpb24uaHJlZikpO1xuICAgIH0pO1xuXG4gICAgLy8gUmV0dXJucyB0aGUgaG9zdCBvZiB0aGUgVVJMIGZvciB0aGlzIEFNUCBkb2N1bWVudC5cbiAgICB0aGlzLnNldCgnQU1QRE9DX0hPU1QnLCAoKSA9PiB7XG4gICAgICBjb25zdCB1cmwgPSBwYXJzZVVybERlcHJlY2F0ZWQod2luLmxvY2F0aW9uLmhyZWYpO1xuICAgICAgcmV0dXJuIHVybCAmJiB1cmwuaG9zdDtcbiAgICB9KTtcblxuICAgIC8vIFJldHVybnMgdGhlIGhvc3RuYW1lIG9mIHRoZSBVUkwgZm9yIHRoaXMgQU1QIGRvY3VtZW50LlxuICAgIHRoaXMuc2V0KCdBTVBET0NfSE9TVE5BTUUnLCAoKSA9PiB7XG4gICAgICBjb25zdCB1cmwgPSBwYXJzZVVybERlcHJlY2F0ZWQod2luLmxvY2F0aW9uLmhyZWYpO1xuICAgICAgcmV0dXJuIHVybCAmJiB1cmwuaG9zdG5hbWU7XG4gICAgfSk7XG5cbiAgICAvLyBSZXR1cm5zIHRoZSBTb3VyY2UgVVJMIGZvciB0aGlzIEFNUCBkb2N1bWVudC5cbiAgICBjb25zdCBleHBhbmRTb3VyY2VVcmwgPSAoKSA9PiB7XG4gICAgICBjb25zdCBkb2NJbmZvID0gdGhpcy5nZXREb2NJbmZvXygpO1xuICAgICAgcmV0dXJuIHJlbW92ZUZyYWdtZW50KHRoaXMuYWRkUmVwbGFjZVBhcmFtc0lmTWlzc2luZ18oZG9jSW5mby5zb3VyY2VVcmwpKTtcbiAgICB9O1xuICAgIHRoaXMuc2V0Qm90aChcbiAgICAgICdTT1VSQ0VfVVJMJyxcbiAgICAgICgpID0+IGV4cGFuZFNvdXJjZVVybCgpLFxuICAgICAgKCkgPT4gZ2V0VHJhY2tJbXByZXNzaW9uUHJvbWlzZSgpLnRoZW4oKCkgPT4gZXhwYW5kU291cmNlVXJsKCkpXG4gICAgKTtcblxuICAgIC8vIFJldHVybnMgdGhlIGhvc3Qgb2YgdGhlIFNvdXJjZSBVUkwgZm9yIHRoaXMgQU1QIGRvY3VtZW50LlxuICAgIHRoaXMuc2V0KFxuICAgICAgJ1NPVVJDRV9IT1NUJyxcbiAgICAgICgpID0+IHBhcnNlVXJsRGVwcmVjYXRlZCh0aGlzLmdldERvY0luZm9fKCkuc291cmNlVXJsKS5ob3N0XG4gICAgKTtcblxuICAgIC8vIFJldHVybnMgdGhlIGhvc3RuYW1lIG9mIHRoZSBTb3VyY2UgVVJMIGZvciB0aGlzIEFNUCBkb2N1bWVudC5cbiAgICB0aGlzLnNldChcbiAgICAgICdTT1VSQ0VfSE9TVE5BTUUnLFxuICAgICAgKCkgPT4gcGFyc2VVcmxEZXByZWNhdGVkKHRoaXMuZ2V0RG9jSW5mb18oKS5zb3VyY2VVcmwpLmhvc3RuYW1lXG4gICAgKTtcblxuICAgIC8vIFJldHVybnMgdGhlIHBhdGggb2YgdGhlIFNvdXJjZSBVUkwgZm9yIHRoaXMgQU1QIGRvY3VtZW50LlxuICAgIHRoaXMuc2V0KFxuICAgICAgJ1NPVVJDRV9QQVRIJyxcbiAgICAgICgpID0+IHBhcnNlVXJsRGVwcmVjYXRlZCh0aGlzLmdldERvY0luZm9fKCkuc291cmNlVXJsKS5wYXRobmFtZVxuICAgICk7XG5cbiAgICAvLyBSZXR1cm5zIGEgcmFuZG9tIHN0cmluZyB0aGF0IHdpbGwgYmUgdGhlIGNvbnN0YW50IGZvciB0aGUgZHVyYXRpb24gb2ZcbiAgICAvLyBzaW5nbGUgcGFnZSB2aWV3LiBJdCBzaG91bGQgaGF2ZSBzdWZmaWNpZW50IGVudHJvcHkgdG8gYmUgdW5pcXVlIGZvclxuICAgIC8vIGFsbCB0aGUgcGFnZSB2aWV3cyBhIHNpbmdsZSB1c2VyIGlzIG1ha2luZyBhdCBhIHRpbWUuXG4gICAgdGhpcy5zZXQoJ1BBR0VfVklFV19JRCcsICgpID0+IHRoaXMuZ2V0RG9jSW5mb18oKS5wYWdlVmlld0lkKTtcblxuICAgIC8vIFJldHVybnMgYSByYW5kb20gc3RyaW5nIHRoYXQgd2lsbCBiZSB0aGUgY29uc3RhbnQgZm9yIHRoZSBkdXJhdGlvbiBvZlxuICAgIC8vIHNpbmdsZSBwYWdlIHZpZXcuIEl0IHNob3VsZCBoYXZlIHN1ZmZpY2llbnQgZW50cm9weSB0byBiZSB1bmlxdWUgZm9yXG4gICAgLy8gYWxsIHRoZSBwYWdlIHZpZXdzIGEgc2luZ2xlIHVzZXIgaXMgbWFraW5nIGF0IGEgdGltZS5cbiAgICB0aGlzLnNldEFzeW5jKCdQQUdFX1ZJRVdfSURfNjQnLCAoKSA9PiB0aGlzLmdldERvY0luZm9fKCkucGFnZVZpZXdJZDY0KTtcblxuICAgIHRoaXMuc2V0Qm90aChcbiAgICAgICdRVUVSWV9QQVJBTScsXG4gICAgICAocGFyYW0sIGRlZmF1bHRWYWx1ZSA9ICcnKSA9PiB7XG4gICAgICAgIHJldHVybiB0aGlzLmdldFF1ZXJ5UGFyYW1EYXRhXyhwYXJhbSwgZGVmYXVsdFZhbHVlKTtcbiAgICAgIH0sXG4gICAgICAocGFyYW0sIGRlZmF1bHRWYWx1ZSA9ICcnKSA9PiB7XG4gICAgICAgIHJldHVybiBnZXRUcmFja0ltcHJlc3Npb25Qcm9taXNlKCkudGhlbigoKSA9PiB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMuZ2V0UXVlcnlQYXJhbURhdGFfKHBhcmFtLCBkZWZhdWx0VmFsdWUpO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICApO1xuXG4gICAgLy8gUmV0dXJucyB0aGUgdmFsdWUgb2YgdGhlIGdpdmVuIGZpZWxkIG5hbWUgaW4gdGhlIGZyYWdtZW50IHF1ZXJ5IHN0cmluZy5cbiAgICAvLyBTZWNvbmQgcGFyYW1ldGVyIGlzIGFuIG9wdGlvbmFsIGRlZmF1bHQgdmFsdWUuXG4gICAgLy8gRm9yIGV4YW1wbGUsIGlmIGxvY2F0aW9uIGlzICdwdWIuY29tL2FtcC5odG1sP3g9MSN5PTInIHRoZW5cbiAgICAvLyBGUkFHTUVOVF9QQVJBTSh5KSByZXR1cm5zICcyJyBhbmQgRlJBR01FTlRfUEFSQU0oeiwgMykgcmV0dXJucyAzLlxuICAgIHRoaXMuc2V0KCdGUkFHTUVOVF9QQVJBTScsIChwYXJhbSwgZGVmYXVsdFZhbHVlID0gJycpID0+IHtcbiAgICAgIHJldHVybiB0aGlzLmdldEZyYWdtZW50UGFyYW1EYXRhXyhwYXJhbSwgZGVmYXVsdFZhbHVlKTtcbiAgICB9KTtcblxuICAgIC8qKlxuICAgICAqIFN0b3JlcyBjbGllbnQgaWRzIHRoYXQgd2VyZSBnZW5lcmF0ZWQgZHVyaW5nIHRoaXMgcGFnZSB2aWV3XG4gICAgICogaW5kZXhlZCBieSBzY29wZS5cbiAgICAgKiBAdHlwZSB7P09iamVjdDxzdHJpbmcsIHN0cmluZz59XG4gICAgICovXG4gICAgbGV0IGNsaWVudElkcyA9IG51bGw7XG4gICAgLy8gU3luY2hyb25vdXMgYWx0ZXJuYXRpdmUuIE9ubHkgd29ya3MgZm9yIHNjb3BlcyB0aGF0IHdlcmUgcHJldmlvdXNseVxuICAgIC8vIHJlcXVlc3RlZCB1c2luZyB0aGUgYXN5bmMgbWV0aG9kLlxuICAgIHRoaXMuc2V0Qm90aChcbiAgICAgICdDTElFTlRfSUQnLFxuICAgICAgKHNjb3BlKSA9PiB7XG4gICAgICAgIGlmICghY2xpZW50SWRzKSB7XG4gICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGNsaWVudElkc1tzY29wZV07XG4gICAgICB9LFxuICAgICAgKHNjb3BlLCBvcHRfdXNlck5vdGlmaWNhdGlvbklkLCBvcHRfY29va2llTmFtZSwgb3B0X2Rpc2FibGVCYWNrdXApID0+IHtcbiAgICAgICAgdXNlckFzc2VydChcbiAgICAgICAgICBzY29wZSxcbiAgICAgICAgICAnVGhlIGZpcnN0IGFyZ3VtZW50IHRvIENMSUVOVF9JRCwgdGhlIGZhbGxiYWNrJyArXG4gICAgICAgICAgICAvKk9LKi8gJyBDb29raWUgbmFtZSwgaXMgcmVxdWlyZWQnXG4gICAgICAgICk7XG5cbiAgICAgICAgbGV0IGNvbnNlbnQgPSBQcm9taXNlLnJlc29sdmUoKTtcblxuICAgICAgICAvLyBJZiBubyBgb3B0X3VzZXJOb3RpZmljYXRpb25JZGAgYXJndW1lbnQgaXMgcHJvdmlkZWQgdGhlblxuICAgICAgICAvLyBhc3N1bWUgY29uc2VudCBpcyBnaXZlbiBieSBkZWZhdWx0LlxuICAgICAgICBpZiAob3B0X3VzZXJOb3RpZmljYXRpb25JZCkge1xuICAgICAgICAgIGNvbnNlbnQgPSBTZXJ2aWNlcy51c2VyTm90aWZpY2F0aW9uTWFuYWdlckZvckRvYyhlbGVtZW50KS50aGVuKFxuICAgICAgICAgICAgKHNlcnZpY2UpID0+IHtcbiAgICAgICAgICAgICAgcmV0dXJuIHNlcnZpY2UuZ2V0KG9wdF91c2VyTm90aWZpY2F0aW9uSWQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIFNlcnZpY2VzLmNpZEZvckRvYyh0aGlzLmFtcGRvYylcbiAgICAgICAgICAudGhlbigoY2lkKSA9PiB7XG4gICAgICAgICAgICBvcHRfZGlzYWJsZUJhY2t1cCA9IG9wdF9kaXNhYmxlQmFja3VwID09ICd0cnVlJyA/IHRydWUgOiBmYWxzZTtcbiAgICAgICAgICAgIHJldHVybiBjaWQuZ2V0KFxuICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgLyoqIEB0eXBlIHtzdHJpbmd9ICovIHNjb3BlLFxuICAgICAgICAgICAgICAgIGNyZWF0ZUNvb2tpZUlmTm90UHJlc2VudDogdHJ1ZSxcbiAgICAgICAgICAgICAgICBjb29raWVOYW1lOiBvcHRfY29va2llTmFtZSB8fCB1bmRlZmluZWQsXG4gICAgICAgICAgICAgICAgZGlzYWJsZUJhY2t1cDogb3B0X2Rpc2FibGVCYWNrdXAsXG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgIGNvbnNlbnRcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgfSlcbiAgICAgICAgICAudGhlbigoY2lkKSA9PiB7XG4gICAgICAgICAgICBpZiAoIWNsaWVudElkcykge1xuICAgICAgICAgICAgICBjbGllbnRJZHMgPSBPYmplY3QuY3JlYXRlKG51bGwpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBBIHRlbXBvcmFyeSB3b3JrIGFyb3VuZCB0byBleHRyYWN0IENsaWVudCBJRCBmcm9tIF9nYSBjb29raWUuICM1NzYxXG4gICAgICAgICAgICAvLyBUT0RPOiByZXBsYWNlIHdpdGggXCJmaWx0ZXJcIiB3aGVuIGl0J3MgaW4gcGxhY2UuICMyMTk4XG4gICAgICAgICAgICBjb25zdCBjb29raWVOYW1lID0gb3B0X2Nvb2tpZU5hbWUgfHwgc2NvcGU7XG4gICAgICAgICAgICBpZiAoY2lkICYmIGNvb2tpZU5hbWUgPT0gJ19nYScpIHtcbiAgICAgICAgICAgICAgaWYgKHR5cGVvZiBjaWQgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICAgICAgY2lkID0gZXh0cmFjdENsaWVudElkRnJvbUdhQ29va2llKGNpZCk7XG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgLy8gVE9ETyhAanJpZGdld2VsbCwgIzExMTIwKTogcmVtb3ZlIG9uY2UgIzExMTIwIGlzIGZpZ3VyZWQgb3V0LlxuICAgICAgICAgICAgICAgIC8vIERvIG5vdCBsb2cgdGhlIENJRCBkaXJlY3RseSwgdGhhdCdzIFBJSS5cbiAgICAgICAgICAgICAgICBkZXYoKS5lcnJvcihcbiAgICAgICAgICAgICAgICAgIFRBRyxcbiAgICAgICAgICAgICAgICAgICdub24tc3RyaW5nIGNpZCwgd2hhdCBpcyBpdD8nLFxuICAgICAgICAgICAgICAgICAgT2JqZWN0LmtleXMoY2lkKVxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgY2xpZW50SWRzW3Njb3BlXSA9IGNpZDtcbiAgICAgICAgICAgIHJldHVybiBjaWQ7XG4gICAgICAgICAgfSk7XG4gICAgICB9XG4gICAgKTtcblxuICAgIC8vIFJldHVybnMgYXNzaWduZWQgdmFyaWFudCBuYW1lIGZvciB0aGUgZ2l2ZW4gZXhwZXJpbWVudC5cbiAgICB0aGlzLnNldEFzeW5jKFxuICAgICAgJ1ZBUklBTlQnLFxuICAgICAgLyoqIEB0eXBlIHtBc3luY1Jlc29sdmVyRGVmfSAqLyAoXG4gICAgICAgIChleHBlcmltZW50KSA9PiB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMuZ2V0VmFyaWFudHNWYWx1ZV8oKHZhcmlhbnRzKSA9PiB7XG4gICAgICAgICAgICBjb25zdCB2YXJpYW50ID0gdmFyaWFudHNbLyoqIEB0eXBlIHtzdHJpbmd9ICovIChleHBlcmltZW50KV07XG4gICAgICAgICAgICB1c2VyQXNzZXJ0KFxuICAgICAgICAgICAgICB2YXJpYW50ICE9PSB1bmRlZmluZWQsXG4gICAgICAgICAgICAgICdUaGUgdmFsdWUgcGFzc2VkIHRvIFZBUklBTlQoKSBpcyBub3QgYSB2YWxpZCBleHBlcmltZW50IGluIDxhbXAtZXhwZXJpbWVudD46JyArXG4gICAgICAgICAgICAgICAgZXhwZXJpbWVudFxuICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIC8vIFdoZW4gbm8gdmFyaWFudCBhc3NpZ25lZCwgdXNlIHJlc2VydmVkIGtleXdvcmQgJ25vbmUnLlxuICAgICAgICAgICAgcmV0dXJuIHZhcmlhbnQgPT09IG51bGwgPyAnbm9uZScgOiAvKiogQHR5cGUge3N0cmluZ30gKi8gKHZhcmlhbnQpO1xuICAgICAgICAgIH0sICdWQVJJQU5UJyk7XG4gICAgICAgIH1cbiAgICAgIClcbiAgICApO1xuXG4gICAgLy8gUmV0dXJucyBhbGwgYXNzaWduZWQgZXhwZXJpbWVudCB2YXJpYW50cyBpbiBhIHNlcmlhbGl6ZWQgZm9ybS5cbiAgICB0aGlzLnNldEFzeW5jKFxuICAgICAgJ1ZBUklBTlRTJyxcbiAgICAgIC8qKiBAdHlwZSB7QXN5bmNSZXNvbHZlckRlZn0gKi8gKFxuICAgICAgICAoKSA9PiB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMuZ2V0VmFyaWFudHNWYWx1ZV8oKHZhcmlhbnRzKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBleHBlcmltZW50cyA9IFtdO1xuICAgICAgICAgICAgZm9yIChjb25zdCBleHBlcmltZW50IGluIHZhcmlhbnRzKSB7XG4gICAgICAgICAgICAgIGNvbnN0IHZhcmlhbnQgPSB2YXJpYW50c1tleHBlcmltZW50XTtcbiAgICAgICAgICAgICAgZXhwZXJpbWVudHMucHVzaChcbiAgICAgICAgICAgICAgICBleHBlcmltZW50ICsgVkFSSUFOVF9ERUxJTUlURVIgKyAodmFyaWFudCB8fCAnbm9uZScpXG4gICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gZXhwZXJpbWVudHMuam9pbihFWFBFUklNRU5UX0RFTElNSVRFUik7XG4gICAgICAgICAgfSwgJ1ZBUklBTlRTJyk7XG4gICAgICAgIH1cbiAgICAgIClcbiAgICApO1xuXG4gICAgLy8gUmV0dXJucyBhc3NpZ25lZCBnZW8gdmFsdWUgZm9yIGdlb1R5cGUgb3IgYWxsIGdyb3Vwcy5cbiAgICB0aGlzLnNldEFzeW5jKFxuICAgICAgJ0FNUF9HRU8nLFxuICAgICAgLyoqIEB0eXBlIHtBc3luY1Jlc29sdmVyRGVmfSAqLyAoXG4gICAgICAgIChnZW9UeXBlKSA9PiB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMuZ2V0R2VvXygoZ2VvcykgPT4ge1xuICAgICAgICAgICAgaWYgKGdlb1R5cGUpIHtcbiAgICAgICAgICAgICAgdXNlckFzc2VydChcbiAgICAgICAgICAgICAgICBnZW9UeXBlID09PSAnSVNPQ291bnRyeScsXG4gICAgICAgICAgICAgICAgJ1RoZSB2YWx1ZSBwYXNzZWQgdG8gQU1QX0dFTygpIGlzIG5vdCB2YWxpZCBuYW1lOicgKyBnZW9UeXBlXG4gICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgIHJldHVybiAvKiogQHR5cGUge3N0cmluZ30gKi8gKGdlb3NbZ2VvVHlwZV0gfHwgJ3Vua25vd24nKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiAvKiogQHR5cGUge3N0cmluZ30gKi8gKFxuICAgICAgICAgICAgICBnZW9zLm1hdGNoZWRJU09Db3VudHJ5R3JvdXBzLmpvaW4oR0VPX0RFTElNKVxuICAgICAgICAgICAgKTtcbiAgICAgICAgICB9LCAnQU1QX0dFTycpO1xuICAgICAgICB9XG4gICAgICApXG4gICAgKTtcblxuICAgIC8vIFJldHVybnMgdGhlIG51bWJlciBvZiBtaWxsaXNlY29uZHMgc2luY2UgMSBKYW4gMTk3MCAwMDowMDowMCBVVEMuXG4gICAgdGhpcy5zZXQoJ1RJTUVTVEFNUCcsIGRhdGVNZXRob2QoJ2dldFRpbWUnKSk7XG5cbiAgICAvLyBSZXR1cm5zIHRoZSBodW1hbiByZWFkYWJsZSB0aW1lc3RhbXAgaW4gZm9ybWF0IG9mXG4gICAgLy8gMjAxMS0wMS0wMVQxMToxMToxMS42MTJaLlxuICAgIHRoaXMuc2V0KCdUSU1FU1RBTVBfSVNPJywgZGF0ZU1ldGhvZCgndG9JU09TdHJpbmcnKSk7XG5cbiAgICAvLyBSZXR1cm5zIHRoZSB1c2VyJ3MgdGltZS16b25lIG9mZnNldCBmcm9tIFVUQywgaW4gbWludXRlcy5cbiAgICB0aGlzLnNldCgnVElNRVpPTkUnLCBkYXRlTWV0aG9kKCdnZXRUaW1lem9uZU9mZnNldCcpKTtcblxuICAgIC8vIFJldHVybnMgYSBwcm9taXNlIHJlc29sdmluZyB0byB2aWV3cG9ydC5nZXRTY3JvbGxIZWlnaHQuXG4gICAgdGhpcy5zZXQoJ1NDUk9MTF9IRUlHSFQnLCAoKSA9PiB2aWV3cG9ydC5nZXRTY3JvbGxIZWlnaHQoKSk7XG5cbiAgICAvLyBSZXR1cm5zIGEgcHJvbWlzZSByZXNvbHZpbmcgdG8gdmlld3BvcnQuZ2V0U2Nyb2xsV2lkdGguXG4gICAgdGhpcy5zZXQoJ1NDUk9MTF9XSURUSCcsICgpID0+IHZpZXdwb3J0LmdldFNjcm9sbFdpZHRoKCkpO1xuXG4gICAgLy8gUmV0dXJucyB0aGUgdmlld3BvcnQgaGVpZ2h0LlxuICAgIHRoaXMuc2V0KCdWSUVXUE9SVF9IRUlHSFQnLCAoKSA9PiB2aWV3cG9ydC5nZXRIZWlnaHQoKSk7XG5cbiAgICAvLyBSZXR1cm5zIHRoZSB2aWV3cG9ydCB3aWR0aC5cbiAgICB0aGlzLnNldCgnVklFV1BPUlRfV0lEVEgnLCAoKSA9PiB2aWV3cG9ydC5nZXRXaWR0aCgpKTtcblxuICAgIGNvbnN0IHtzY3JlZW59ID0gd2luO1xuICAgIC8vIFJldHVybnMgc2NyZWVuLndpZHRoLlxuICAgIHRoaXMuc2V0KCdTQ1JFRU5fV0lEVEgnLCBzY3JlZW5Qcm9wZXJ0eShzY3JlZW4sICd3aWR0aCcpKTtcblxuICAgIC8vIFJldHVybnMgc2NyZWVuLmhlaWdodC5cbiAgICB0aGlzLnNldCgnU0NSRUVOX0hFSUdIVCcsIHNjcmVlblByb3BlcnR5KHNjcmVlbiwgJ2hlaWdodCcpKTtcblxuICAgIC8vIFJldHVybnMgc2NyZWVuLmF2YWlsSGVpZ2h0LlxuICAgIHRoaXMuc2V0KCdBVkFJTEFCTEVfU0NSRUVOX0hFSUdIVCcsIHNjcmVlblByb3BlcnR5KHNjcmVlbiwgJ2F2YWlsSGVpZ2h0JykpO1xuXG4gICAgLy8gUmV0dXJucyBzY3JlZW4uYXZhaWxXaWR0aC5cbiAgICB0aGlzLnNldCgnQVZBSUxBQkxFX1NDUkVFTl9XSURUSCcsIHNjcmVlblByb3BlcnR5KHNjcmVlbiwgJ2F2YWlsV2lkdGgnKSk7XG5cbiAgICAvLyBSZXR1cm5zIHNjcmVlbi5Db2xvckRlcHRoLlxuICAgIHRoaXMuc2V0KCdTQ1JFRU5fQ09MT1JfREVQVEgnLCBzY3JlZW5Qcm9wZXJ0eShzY3JlZW4sICdjb2xvckRlcHRoJykpO1xuXG4gICAgLy8gUmV0dXJucyBkb2N1bWVudCBjaGFyYWN0ZXJzZXQuXG4gICAgdGhpcy5zZXQoJ0RPQ1VNRU5UX0NIQVJTRVQnLCAoKSA9PiB7XG4gICAgICBjb25zdCBkb2MgPSB3aW4uZG9jdW1lbnQ7XG4gICAgICByZXR1cm4gZG9jLmNoYXJhY3RlclNldCB8fCBkb2MuY2hhcnNldDtcbiAgICB9KTtcblxuICAgIC8vIFJldHVybnMgdGhlIGJyb3dzZXIgbGFuZ3VhZ2UuXG4gICAgdGhpcy5zZXQoJ0JST1dTRVJfTEFOR1VBR0UnLCAoKSA9PiB7XG4gICAgICBjb25zdCBuYXYgPSB3aW4ubmF2aWdhdG9yO1xuICAgICAgcmV0dXJuIChcbiAgICAgICAgbmF2Lmxhbmd1YWdlIHx8XG4gICAgICAgIC8vIE9ubHkgdXNlZCBvbiBJRS5cbiAgICAgICAgbmF2Wyd1c2VyTGFuZ3VhZ2UnXSB8fFxuICAgICAgICBuYXYuYnJvd3Nlckxhbmd1YWdlIHx8XG4gICAgICAgICcnXG4gICAgICApLnRvTG93ZXJDYXNlKCk7XG4gICAgfSk7XG5cbiAgICAvLyBSZXR1cm5zIHRoZSB1c2VyIGFnZW50LlxuICAgIHRoaXMuc2V0KCdVU0VSX0FHRU5UJywgKCkgPT4ge1xuICAgICAgcmV0dXJuIHdpbi5uYXZpZ2F0b3IudXNlckFnZW50O1xuICAgIH0pO1xuXG4gICAgLy8gUmV0dXJucyB0aGUgdGltZSBpdCB0b29rIHRvIGxvYWQgdGhlIHdob2xlIHBhZ2UuIChleGNsdWRlcyBhbXAtKiBlbGVtZW50c1xuICAgIC8vIHRoYXQgYXJlIG5vdCByZW5kZXJlZCBieSB0aGUgc3lzdGVtIHlldC4pXG4gICAgdGhpcy5zZXRUaW1pbmdSZXNvbHZlcl8oXG4gICAgICAnUEFHRV9MT0FEX1RJTUUnLFxuICAgICAgJ25hdmlnYXRpb25TdGFydCcsXG4gICAgICAnbG9hZEV2ZW50U3RhcnQnXG4gICAgKTtcblxuICAgIC8vIFJldHVybnMgdGhlIHRpbWUgaXQgdG9vayB0byBwZXJmb3JtIEROUyBsb29rdXAgZm9yIHRoZSBkb21haW4uXG4gICAgdGhpcy5zZXRUaW1pbmdSZXNvbHZlcl8oXG4gICAgICAnRE9NQUlOX0xPT0tVUF9USU1FJyxcbiAgICAgICdkb21haW5Mb29rdXBTdGFydCcsXG4gICAgICAnZG9tYWluTG9va3VwRW5kJ1xuICAgICk7XG5cbiAgICAvLyBSZXR1cm5zIHRoZSB0aW1lIGl0IHRvb2sgdG8gY29ubmVjdCB0byB0aGUgc2VydmVyLlxuICAgIHRoaXMuc2V0VGltaW5nUmVzb2x2ZXJfKCdUQ1BfQ09OTkVDVF9USU1FJywgJ2Nvbm5lY3RTdGFydCcsICdjb25uZWN0RW5kJyk7XG5cbiAgICAvLyBSZXR1cm5zIHRoZSB0aW1lIGl0IHRvb2sgZm9yIHNlcnZlciB0byBzdGFydCBzZW5kaW5nIGEgcmVzcG9uc2UgdG8gdGhlXG4gICAgLy8gcmVxdWVzdC5cbiAgICB0aGlzLnNldFRpbWluZ1Jlc29sdmVyXyhcbiAgICAgICdTRVJWRVJfUkVTUE9OU0VfVElNRScsXG4gICAgICAncmVxdWVzdFN0YXJ0JyxcbiAgICAgICdyZXNwb25zZVN0YXJ0J1xuICAgICk7XG5cbiAgICAvLyBSZXR1cm5zIHRoZSB0aW1lIGl0IHRvb2sgdG8gZG93bmxvYWQgdGhlIHBhZ2UuXG4gICAgdGhpcy5zZXRUaW1pbmdSZXNvbHZlcl8oXG4gICAgICAnUEFHRV9ET1dOTE9BRF9USU1FJyxcbiAgICAgICdyZXNwb25zZVN0YXJ0JyxcbiAgICAgICdyZXNwb25zZUVuZCdcbiAgICApO1xuXG4gICAgLy8gUmV0dXJucyB0aGUgdGltZSBpdCB0b29rIGZvciByZWRpcmVjdHMgdG8gY29tcGxldGUuXG4gICAgdGhpcy5zZXRUaW1pbmdSZXNvbHZlcl8oJ1JFRElSRUNUX1RJTUUnLCAnbmF2aWdhdGlvblN0YXJ0JywgJ2ZldGNoU3RhcnQnKTtcblxuICAgIC8vIFJldHVybnMgdGhlIHRpbWUgaXQgdG9vayBmb3IgRE9NIHRvIGJlY29tZSBpbnRlcmFjdGl2ZS5cbiAgICB0aGlzLnNldFRpbWluZ1Jlc29sdmVyXyhcbiAgICAgICdET01fSU5URVJBQ1RJVkVfVElNRScsXG4gICAgICAnbmF2aWdhdGlvblN0YXJ0JyxcbiAgICAgICdkb21JbnRlcmFjdGl2ZSdcbiAgICApO1xuXG4gICAgLy8gUmV0dXJucyB0aGUgdGltZSBpdCB0b29rIGZvciBjb250ZW50IHRvIGxvYWQuXG4gICAgdGhpcy5zZXRUaW1pbmdSZXNvbHZlcl8oXG4gICAgICAnQ09OVEVOVF9MT0FEX1RJTUUnLFxuICAgICAgJ25hdmlnYXRpb25TdGFydCcsXG4gICAgICAnZG9tQ29udGVudExvYWRlZEV2ZW50U3RhcnQnXG4gICAgKTtcblxuICAgIC8vIEFjY2VzczogUmVhZGVyIElELlxuICAgIHRoaXMuc2V0QXN5bmMoXG4gICAgICAnQUNDRVNTX1JFQURFUl9JRCcsXG4gICAgICAvKiogQHR5cGUge0FzeW5jUmVzb2x2ZXJEZWZ9ICovIChcbiAgICAgICAgKCkgPT4ge1xuICAgICAgICAgIHJldHVybiB0aGlzLmdldEFjY2Vzc1ZhbHVlXygoYWNjZXNzU2VydmljZSkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIGFjY2Vzc1NlcnZpY2UuZ2V0QWNjZXNzUmVhZGVySWQoKTtcbiAgICAgICAgICB9LCAnQUNDRVNTX1JFQURFUl9JRCcpO1xuICAgICAgICB9XG4gICAgICApXG4gICAgKTtcblxuICAgIC8vIEFjY2VzczogZGF0YSBmcm9tIHRoZSBhdXRob3JpemF0aW9uIHJlc3BvbnNlLlxuICAgIHRoaXMuc2V0QXN5bmMoXG4gICAgICAnQVVUSERBVEEnLFxuICAgICAgLyoqIEB0eXBlIHtBc3luY1Jlc29sdmVyRGVmfSAqLyAoXG4gICAgICAgIChmaWVsZCkgPT4ge1xuICAgICAgICAgIHVzZXJBc3NlcnQoXG4gICAgICAgICAgICBmaWVsZCxcbiAgICAgICAgICAgICdUaGUgZmlyc3QgYXJndW1lbnQgdG8gQVVUSERBVEEsIHRoZSBmaWVsZCwgaXMgcmVxdWlyZWQnXG4gICAgICAgICAgKTtcbiAgICAgICAgICByZXR1cm4gdGhpcy5nZXRBY2Nlc3NWYWx1ZV8oKGFjY2Vzc1NlcnZpY2UpID0+IHtcbiAgICAgICAgICAgIHJldHVybiBhY2Nlc3NTZXJ2aWNlLmdldEF1dGhkYXRhRmllbGQoZmllbGQpO1xuICAgICAgICAgIH0sICdBVVRIREFUQScpO1xuICAgICAgICB9XG4gICAgICApXG4gICAgKTtcblxuICAgIC8vIFJldHVybnMgYW4gaWRlbnRpZmllciBmb3IgdGhlIHZpZXdlci5cbiAgICB0aGlzLnNldEFzeW5jKCdWSUVXRVInLCAoKSA9PiB7XG4gICAgICByZXR1cm4gU2VydmljZXMudmlld2VyRm9yRG9jKHRoaXMuYW1wZG9jKVxuICAgICAgICAuZ2V0Vmlld2VyT3JpZ2luKClcbiAgICAgICAgLnRoZW4oKHZpZXdlcikgPT4ge1xuICAgICAgICAgIHJldHVybiB2aWV3ZXIgPT0gdW5kZWZpbmVkID8gJycgOiB2aWV3ZXI7XG4gICAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgLy8gUmV0dXJucyB0aGUgdG90YWwgZW5nYWdlZCB0aW1lIHNpbmNlIHRoZSBjb250ZW50IGJlY2FtZSB2aWV3YWJsZS5cbiAgICB0aGlzLnNldEFzeW5jKCdUT1RBTF9FTkdBR0VEX1RJTUUnLCAoKSA9PiB7XG4gICAgICByZXR1cm4gU2VydmljZXMuYWN0aXZpdHlGb3JEb2MoZWxlbWVudCkudGhlbigoYWN0aXZpdHkpID0+IHtcbiAgICAgICAgcmV0dXJuIGFjdGl2aXR5LmdldFRvdGFsRW5nYWdlZFRpbWUoKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgLy8gUmV0dXJucyB0aGUgaW5jcmVtZW50YWwgZW5nYWdlZCB0aW1lIHNpbmNlIHRoZSBsYXN0IHB1c2ggdW5kZXIgdGhlXG4gICAgLy8gc2FtZSBuYW1lLlxuICAgIHRoaXMuc2V0QXN5bmMoJ0lOQ1JFTUVOVEFMX0VOR0FHRURfVElNRScsIChuYW1lLCByZXNldCkgPT4ge1xuICAgICAgcmV0dXJuIFNlcnZpY2VzLmFjdGl2aXR5Rm9yRG9jKGVsZW1lbnQpLnRoZW4oKGFjdGl2aXR5KSA9PiB7XG4gICAgICAgIHJldHVybiBhY3Rpdml0eS5nZXRJbmNyZW1lbnRhbEVuZ2FnZWRUaW1lKFxuICAgICAgICAgIC8qKiBAdHlwZSB7c3RyaW5nfSAqLyAobmFtZSksXG4gICAgICAgICAgcmVzZXQgIT09ICdmYWxzZSdcbiAgICAgICAgKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgdGhpcy5zZXQoJ05BVl9USU1JTkcnLCAoc3RhcnRBdHRyaWJ1dGUsIGVuZEF0dHJpYnV0ZSkgPT4ge1xuICAgICAgdXNlckFzc2VydChcbiAgICAgICAgc3RhcnRBdHRyaWJ1dGUsXG4gICAgICAgICdUaGUgZmlyc3QgYXJndW1lbnQgdG8gTkFWX1RJTUlORywgdGhlICcgK1xuICAgICAgICAgICdzdGFydCBhdHRyaWJ1dGUgbmFtZSwgaXMgcmVxdWlyZWQnXG4gICAgICApO1xuICAgICAgcmV0dXJuIGdldFRpbWluZ0RhdGFTeW5jKFxuICAgICAgICB3aW4sXG4gICAgICAgIC8qKkB0eXBlIHtzdHJpbmd9Ki8gKHN0YXJ0QXR0cmlidXRlKSxcbiAgICAgICAgLyoqQHR5cGUge3N0cmluZ30qLyAoZW5kQXR0cmlidXRlKVxuICAgICAgKTtcbiAgICB9KTtcbiAgICB0aGlzLnNldEFzeW5jKCdOQVZfVElNSU5HJywgKHN0YXJ0QXR0cmlidXRlLCBlbmRBdHRyaWJ1dGUpID0+IHtcbiAgICAgIHVzZXJBc3NlcnQoXG4gICAgICAgIHN0YXJ0QXR0cmlidXRlLFxuICAgICAgICAnVGhlIGZpcnN0IGFyZ3VtZW50IHRvIE5BVl9USU1JTkcsIHRoZSAnICtcbiAgICAgICAgICAnc3RhcnQgYXR0cmlidXRlIG5hbWUsIGlzIHJlcXVpcmVkJ1xuICAgICAgKTtcbiAgICAgIHJldHVybiBnZXRUaW1pbmdEYXRhQXN5bmMoXG4gICAgICAgIHdpbixcbiAgICAgICAgLyoqQHR5cGUge3N0cmluZ30qLyAoc3RhcnRBdHRyaWJ1dGUpLFxuICAgICAgICAvKipAdHlwZSB7c3RyaW5nfSovIChlbmRBdHRyaWJ1dGUpXG4gICAgICApO1xuICAgIH0pO1xuXG4gICAgdGhpcy5zZXQoJ05BVl9UWVBFJywgKCkgPT4ge1xuICAgICAgcmV0dXJuIGdldE5hdmlnYXRpb25EYXRhKHdpbiwgJ3R5cGUnKTtcbiAgICB9KTtcblxuICAgIHRoaXMuc2V0KCdOQVZfUkVESVJFQ1RfQ09VTlQnLCAoKSA9PiB7XG4gICAgICByZXR1cm4gZ2V0TmF2aWdhdGlvbkRhdGEod2luLCAncmVkaXJlY3RDb3VudCcpO1xuICAgIH0pO1xuXG4gICAgLy8gcmV0dXJucyB0aGUgQU1QIHZlcnNpb24gbnVtYmVyXG4gICAgdGhpcy5zZXQoJ0FNUF9WRVJTSU9OJywgKCkgPT4gbW9kZS52ZXJzaW9uKCkpO1xuXG4gICAgdGhpcy5zZXQoJ0JBQ0tHUk9VTkRfU1RBVEUnLCAoKSA9PiB7XG4gICAgICByZXR1cm4gdGhpcy5hbXBkb2MuaXNWaXNpYmxlKCkgPyAnMCcgOiAnMSc7XG4gICAgfSk7XG5cbiAgICB0aGlzLnNldEFzeW5jKCdWSURFT19TVEFURScsIChpZCwgcHJvcGVydHkpID0+IHtcbiAgICAgIHJldHVybiBTZXJ2aWNlcy52aWRlb01hbmFnZXJGb3JEb2ModGhpcy5hbXBkb2MpLmdldFZpZGVvU3RhdGVQcm9wZXJ0eShcbiAgICAgICAgaWQsXG4gICAgICAgIHByb3BlcnR5XG4gICAgICApO1xuICAgIH0pO1xuXG4gICAgdGhpcy5zZXRBc3luYygnQU1QX1NUQVRFJywgKGtleSkgPT4ge1xuICAgICAgLy8gVGhpcyBpcyBzYWZlIHNpbmNlIEFNUF9TVEFURSBpcyBub3QgYW4gQTRBIGFsbG93bGlzdGVkIHZhcmlhYmxlLlxuICAgICAgY29uc3Qgcm9vdCA9IHRoaXMuYW1wZG9jLmdldFJvb3ROb2RlKCk7XG4gICAgICBjb25zdCBlbGVtZW50ID0gLyoqIEB0eXBlIHshRWxlbWVudHwhU2hhZG93Um9vdH0gKi8gKFxuICAgICAgICByb290LmRvY3VtZW50RWxlbWVudCB8fCByb290XG4gICAgICApO1xuICAgICAgcmV0dXJuIFNlcnZpY2VzLmJpbmRGb3JEb2NPck51bGwoZWxlbWVudCkudGhlbigoYmluZCkgPT4ge1xuICAgICAgICBpZiAoIWJpbmQpIHtcbiAgICAgICAgICByZXR1cm4gJyc7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGJpbmQuZ2V0U3RhdGVWYWx1ZSgvKiogQHR5cGUge3N0cmluZ30gKi8gKGtleSkpIHx8ICcnO1xuICAgICAgfSk7XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogTWVyZ2VzIGFueSByZXBsYWNlbWVudCBwYXJhbWV0ZXJzIGludG8gYSBnaXZlbiBVUkwncyBxdWVyeSBzdHJpbmcsXG4gICAqIHByZWZlcnJpbmcgdmFsdWVzIHNldCBpbiB0aGUgb3JpZ2luYWwgcXVlcnkgc3RyaW5nLlxuICAgKiBAcGFyYW0ge3N0cmluZ30gb3JpZyBUaGUgb3JpZ2luYWwgVVJMXG4gICAqIEByZXR1cm4ge3N0cmluZ30gVGhlIHJlc3VsdGluZyBVUkxcbiAgICogQHByaXZhdGVcbiAgICovXG4gIGFkZFJlcGxhY2VQYXJhbXNJZk1pc3NpbmdfKG9yaWcpIHtcbiAgICBjb25zdCB7cmVwbGFjZVBhcmFtc30gPSB0aGlzLmdldERvY0luZm9fKCk7XG4gICAgaWYgKCFyZXBsYWNlUGFyYW1zKSB7XG4gICAgICByZXR1cm4gb3JpZztcbiAgICB9XG4gICAgcmV0dXJuIGFkZE1pc3NpbmdQYXJhbXNUb1VybChcbiAgICAgIHJlbW92ZUFtcEpzUGFyYW1zRnJvbVVybChvcmlnKSxcbiAgICAgIC8qKiBAdHlwZSB7IUpzb25PYmplY3R9ICovIChyZXBsYWNlUGFyYW1zKVxuICAgICk7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJuIHRoZSBkb2N1bWVudCBpbmZvIGZvciB0aGUgY3VycmVudCBhbXBkb2MuXG4gICAqIEByZXR1cm4gey4vZG9jdW1lbnQtaW5mby1pbXBsLkRvY3VtZW50SW5mb0RlZn1cbiAgICovXG4gIGdldERvY0luZm9fKCkge1xuICAgIHJldHVybiBTZXJ2aWNlcy5kb2N1bWVudEluZm9Gb3JEb2ModGhpcy5hbXBkb2MpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlc29sdmVzIHRoZSB2YWx1ZSB2aWEgYWNjZXNzIHNlcnZpY2UuIElmIGFjY2VzcyBzZXJ2aWNlIGlzIG5vdCBjb25maWd1cmVkLFxuICAgKiB0aGUgcmVzdWx0aW5nIHZhbHVlIGlzIGBudWxsYC5cbiAgICogQHBhcmFtIHtmdW5jdGlvbighLi4vLi4vZXh0ZW5zaW9ucy9hbXAtYWNjZXNzLzAuMS9hY2Nlc3MtdmFycy5BY2Nlc3NWYXJzKTooVHwhUHJvbWlzZTxUPil9IGdldHRlclxuICAgKiBAcGFyYW0ge3N0cmluZ30gZXhwclxuICAgKiBAcmV0dXJuIHs/VH1cbiAgICogQHRlbXBsYXRlIFRcbiAgICogQHByaXZhdGVcbiAgICovXG4gIGdldEFjY2Vzc1ZhbHVlXyhnZXR0ZXIsIGV4cHIpIHtcbiAgICBjb25zdCBlbGVtZW50ID0gdGhpcy5hbXBkb2MuZ2V0SGVhZE5vZGUoKTtcbiAgICByZXR1cm4gUHJvbWlzZS5hbGwoW1xuICAgICAgU2VydmljZXMuYWNjZXNzU2VydmljZUZvckRvY09yTnVsbChlbGVtZW50KSxcbiAgICAgIFNlcnZpY2VzLnN1YnNjcmlwdGlvbnNTZXJ2aWNlRm9yRG9jT3JOdWxsKGVsZW1lbnQpLFxuICAgIF0pLnRoZW4oKHNlcnZpY2VzKSA9PiB7XG4gICAgICBjb25zdCBhY2Nlc3NTZXJ2aWNlID1cbiAgICAgICAgLyoqIEB0eXBlIHs/Li4vLi4vZXh0ZW5zaW9ucy9hbXAtYWNjZXNzLzAuMS9hY2Nlc3MtdmFycy5BY2Nlc3NWYXJzfSAqLyAoXG4gICAgICAgICAgc2VydmljZXNbMF1cbiAgICAgICAgKTtcbiAgICAgIGNvbnN0IHN1YnNjcmlwdGlvblNlcnZpY2UgPVxuICAgICAgICAvKiogQHR5cGUgez8uLi8uLi9leHRlbnNpb25zL2FtcC1hY2Nlc3MvMC4xL2FjY2Vzcy12YXJzLkFjY2Vzc1ZhcnN9ICovIChcbiAgICAgICAgICBzZXJ2aWNlc1sxXVxuICAgICAgICApO1xuICAgICAgY29uc3Qgc2VydmljZSA9IGFjY2Vzc1NlcnZpY2UgfHwgc3Vic2NyaXB0aW9uU2VydmljZTtcbiAgICAgIGlmICghc2VydmljZSkge1xuICAgICAgICAvLyBBY2Nlc3Mvc3Vic2NyaXB0aW9ucyBzZXJ2aWNlIGlzIG5vdCBpbnN0YWxsZWQuXG4gICAgICAgIHVzZXIoKS5lcnJvcihcbiAgICAgICAgICBUQUcsXG4gICAgICAgICAgJ0FjY2VzcyBvciBzdWJzY2lwdGlvbnMgc2VydmljZSBpcyBub3QgaW5zdGFsbGVkIHRvIGFjY2VzczogJyxcbiAgICAgICAgICBleHByXG4gICAgICAgICk7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgICAgfVxuXG4gICAgICAvLyBJZiBib3RoIGFuIGFjY2VzcyBhbmQgc3Vic2NyaXB0aW9uIHNlcnZpY2UgYXJlIHByZXNlbnQsIHByZWZlclxuICAgICAgLy8gc3Vic2NyaXB0aW9uIHRoZW4gZmFsbCBiYWNrIHRvIGFjY2VzcyBiZWNhdXNlIGFjY2VzcyBjYW4gYmUgbmFtZXNwYWNlZC5cbiAgICAgIGlmIChhY2Nlc3NTZXJ2aWNlICYmIHN1YnNjcmlwdGlvblNlcnZpY2UpIHtcbiAgICAgICAgcmV0dXJuIGdldHRlcihzdWJzY3JpcHRpb25TZXJ2aWNlKSB8fCBnZXR0ZXIoYWNjZXNzU2VydmljZSk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBnZXR0ZXIoc2VydmljZSk7XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJuIHRoZSBRVUVSWV9QQVJBTSBmcm9tIHRoZSBjdXJyZW50IGxvY2F0aW9uIGhyZWZcbiAgICogQHBhcmFtIHtzdHJpbmd9IHBhcmFtXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBkZWZhdWx0VmFsdWVcbiAgICogQHJldHVybiB7c3RyaW5nfVxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgZ2V0UXVlcnlQYXJhbURhdGFfKHBhcmFtLCBkZWZhdWx0VmFsdWUpIHtcbiAgICB1c2VyQXNzZXJ0KFxuICAgICAgcGFyYW0sXG4gICAgICAnVGhlIGZpcnN0IGFyZ3VtZW50IHRvIFFVRVJZX1BBUkFNLCB0aGUgcXVlcnkgc3RyaW5nICcgK1xuICAgICAgICAncGFyYW0gaXMgcmVxdWlyZWQnXG4gICAgKTtcbiAgICBjb25zdCB1cmwgPSBwYXJzZVVybERlcHJlY2F0ZWQoXG4gICAgICByZW1vdmVBbXBKc1BhcmFtc0Zyb21VcmwodGhpcy5hbXBkb2Mud2luLmxvY2F0aW9uLmhyZWYpXG4gICAgKTtcbiAgICBjb25zdCBwYXJhbXMgPSBwYXJzZVF1ZXJ5U3RyaW5nKHVybC5zZWFyY2gpO1xuICAgIGNvbnN0IHtyZXBsYWNlUGFyYW1zfSA9IHRoaXMuZ2V0RG9jSW5mb18oKTtcbiAgICBpZiAodHlwZW9mIHBhcmFtc1twYXJhbV0gIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICByZXR1cm4gcGFyYW1zW3BhcmFtXTtcbiAgICB9XG4gICAgaWYgKHJlcGxhY2VQYXJhbXMgJiYgdHlwZW9mIHJlcGxhY2VQYXJhbXNbcGFyYW1dICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgcmV0dXJuIC8qKiBAdHlwZSB7c3RyaW5nfSAqLyAocmVwbGFjZVBhcmFtc1twYXJhbV0pO1xuICAgIH1cbiAgICByZXR1cm4gZGVmYXVsdFZhbHVlO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybiB0aGUgRlJBR01FTlRfUEFSQU0gZnJvbSB0aGUgb3JpZ2luYWwgbG9jYXRpb24gaHJlZlxuICAgKiBAcGFyYW0geyp9IHBhcmFtXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBkZWZhdWx0VmFsdWVcbiAgICogQHJldHVybiB7c3RyaW5nfVxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgZ2V0RnJhZ21lbnRQYXJhbURhdGFfKHBhcmFtLCBkZWZhdWx0VmFsdWUpIHtcbiAgICB1c2VyQXNzZXJ0KFxuICAgICAgcGFyYW0sXG4gICAgICAnVGhlIGZpcnN0IGFyZ3VtZW50IHRvIEZSQUdNRU5UX1BBUkFNLCB0aGUgZnJhZ21lbnQgc3RyaW5nICcgK1xuICAgICAgICAncGFyYW0gaXMgcmVxdWlyZWQnXG4gICAgKTtcbiAgICB1c2VyQXNzZXJ0KHR5cGVvZiBwYXJhbSA9PSAnc3RyaW5nJywgJ3BhcmFtIHNob3VsZCBiZSBhIHN0cmluZycpO1xuICAgIGNvbnN0IGhhc2ggPSB0aGlzLmFtcGRvYy53aW4ubG9jYXRpb25bJ29yaWdpbmFsSGFzaCddO1xuICAgIGNvbnN0IHBhcmFtcyA9IHBhcnNlUXVlcnlTdHJpbmcoaGFzaCk7XG4gICAgcmV0dXJuIHBhcmFtc1twYXJhbV0gPT09IHVuZGVmaW5lZCA/IGRlZmF1bHRWYWx1ZSA6IHBhcmFtc1twYXJhbV07XG4gIH1cblxuICAvKipcbiAgICogUmVzb2x2ZXMgdGhlIHZhbHVlIHZpYSBhbXAtZXhwZXJpbWVudCdzIHZhcmlhbnRzIHNlcnZpY2UuXG4gICAqIEBwYXJhbSB7ZnVuY3Rpb24oIU9iamVjdDxzdHJpbmcsIHN0cmluZz4pOig/c3RyaW5nKX0gZ2V0dGVyXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBleHByXG4gICAqIEByZXR1cm4geyFQcm9taXNlPD9zdHJpbmc+fVxuICAgKiBAdGVtcGxhdGUgVFxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgZ2V0VmFyaWFudHNWYWx1ZV8oZ2V0dGVyLCBleHByKSB7XG4gICAgcmV0dXJuIFNlcnZpY2VzLnZhcmlhbnRzRm9yRG9jT3JOdWxsKHRoaXMuYW1wZG9jLmdldEhlYWROb2RlKCkpXG4gICAgICAudGhlbigodmFyaWFudHMpID0+IHtcbiAgICAgICAgdXNlckFzc2VydChcbiAgICAgICAgICB2YXJpYW50cyxcbiAgICAgICAgICAnVG8gdXNlIHZhcmlhYmxlICVzLCBhbXAtZXhwZXJpbWVudCBzaG91bGQgYmUgY29uZmlndXJlZCcsXG4gICAgICAgICAgZXhwclxuICAgICAgICApO1xuICAgICAgICByZXR1cm4gdmFyaWFudHMuZ2V0VmFyaWFudHMoKTtcbiAgICAgIH0pXG4gICAgICAudGhlbigodmFyaWFudHNNYXApID0+IGdldHRlcih2YXJpYW50c01hcCkpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlc29sdmVzIHRoZSB2YWx1ZSB2aWEgZ2VvIHNlcnZpY2UuXG4gICAqIEBwYXJhbSB7ZnVuY3Rpb24oIS4uLy4uL2V4dGVuc2lvbnMvYW1wLWdlby8wLjEvYW1wLWdlby5HZW9EZWYpfSBnZXR0ZXJcbiAgICogQHBhcmFtIHtzdHJpbmd9IGV4cHJcbiAgICogQHJldHVybiB7IVByb21pc2U8T2JqZWN0PHN0cmluZywoc3RyaW5nfEFycmF5PHN0cmluZz4pPj59XG4gICAqIEB0ZW1wbGF0ZSBUXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBnZXRHZW9fKGdldHRlciwgZXhwcikge1xuICAgIGNvbnN0IGVsZW1lbnQgPSB0aGlzLmFtcGRvYy5nZXRIZWFkTm9kZSgpO1xuICAgIHJldHVybiBTZXJ2aWNlcy5nZW9Gb3JEb2NPck51bGwoZWxlbWVudCkudGhlbigoZ2VvKSA9PiB7XG4gICAgICB1c2VyQXNzZXJ0KGdlbywgJ1RvIHVzZSB2YXJpYWJsZSAlcywgYW1wLWdlbyBzaG91bGQgYmUgY29uZmlndXJlZCcsIGV4cHIpO1xuICAgICAgcmV0dXJuIGdldHRlcihnZW8pO1xuICAgIH0pO1xuICB9XG59XG5cbi8qKlxuICogVGhpcyBjbGFzcyByZXBsYWNlcyBzdWJzdGl0dXRpb24gdmFyaWFibGVzIHdpdGggdGhlaXIgdmFsdWVzLlxuICogRG9jdW1lbnQgbmV3IHZhbHVlcyBpbiAuLi9kb2NzL3NwZWMvYW1wLXZhci1zdWJzdGl0dXRpb25zLm1kXG4gKiBAcGFja2FnZSBGb3IgZXhwb3J0XG4gKi9cbmV4cG9ydCBjbGFzcyBVcmxSZXBsYWNlbWVudHMge1xuICAvKipcbiAgICogQHBhcmFtIHshLi9hbXBkb2MtaW1wbC5BbXBEb2N9IGFtcGRvY1xuICAgKiBAcGFyYW0geyFWYXJpYWJsZVNvdXJjZX0gdmFyaWFibGVTb3VyY2VcbiAgICovXG4gIGNvbnN0cnVjdG9yKGFtcGRvYywgdmFyaWFibGVTb3VyY2UpIHtcbiAgICAvKiogQGNvbnN0IHshLi9hbXBkb2MtaW1wbC5BbXBEb2N9ICovXG4gICAgdGhpcy5hbXBkb2MgPSBhbXBkb2M7XG5cbiAgICAvKiogQHR5cGUge1ZhcmlhYmxlU291cmNlfSAqL1xuICAgIHRoaXMudmFyaWFibGVTb3VyY2VfID0gdmFyaWFibGVTb3VyY2U7XG4gIH1cblxuICAvKipcbiAgICogU3luY2hyb25vdXNseSBleHBhbmRzIHRoZSBwcm92aWRlZCBzb3VyY2UgYnkgcmVwbGFjaW5nIGFsbCBrbm93biB2YXJpYWJsZXNcbiAgICogd2l0aCB0aGVpciByZXNvbHZlZCB2YWx1ZXMuIE9wdGlvbmFsIGBvcHRfYmluZGluZ3NgIGNhbiBiZSB1c2VkIHRvIGFkZCBuZXdcbiAgICogdmFyaWFibGVzIG9yIG92ZXJyaWRlIGV4aXN0aW5nIG9uZXMuICBBbnkgYXN5bmMgYmluZGluZ3MgYXJlIGlnbm9yZWQuXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBzb3VyY2VcbiAgICogQHBhcmFtIHshT2JqZWN0PHN0cmluZywgKFJlc29sdmVyUmV0dXJuRGVmfCFTeW5jUmVzb2x2ZXJEZWYpPj19IG9wdF9iaW5kaW5nc1xuICAgKiBAcGFyYW0geyFPYmplY3Q8c3RyaW5nLCBib29sZWFuPj19IG9wdF9hbGxvd2xpc3QgT3B0aW9uYWwgYWxsb3dsaXN0IG9mXG4gICAqICAgICBuYW1lcyB0aGF0IGNhbiBiZSBzdWJzdGl0dXRlZC5cbiAgICogQHJldHVybiB7c3RyaW5nfVxuICAgKi9cbiAgZXhwYW5kU3RyaW5nU3luYyhzb3VyY2UsIG9wdF9iaW5kaW5ncywgb3B0X2FsbG93bGlzdCkge1xuICAgIHJldHVybiAvKiogQHR5cGUge3N0cmluZ30gKi8gKFxuICAgICAgbmV3IEV4cGFuZGVyKFxuICAgICAgICB0aGlzLnZhcmlhYmxlU291cmNlXyxcbiAgICAgICAgb3B0X2JpbmRpbmdzLFxuICAgICAgICAvKiBvcHRfY29sbGVjdFZhcnMgKi8gdW5kZWZpbmVkLFxuICAgICAgICAvKiBvcHRfc3luYyAqLyB0cnVlLFxuICAgICAgICBvcHRfYWxsb3dsaXN0LFxuICAgICAgICAvKiBvcHRfbm9FbmNvZGUgKi8gdHJ1ZVxuICAgICAgKS4vKk9LKi8gZXhwYW5kKHNvdXJjZSlcbiAgICApO1xuICB9XG5cbiAgLyoqXG4gICAqIEV4cGFuZHMgdGhlIHByb3ZpZGVkIHNvdXJjZSBieSByZXBsYWNpbmcgYWxsIGtub3duIHZhcmlhYmxlcyB3aXRoIHRoZWlyXG4gICAqIHJlc29sdmVkIHZhbHVlcy4gT3B0aW9uYWwgYG9wdF9iaW5kaW5nc2AgY2FuIGJlIHVzZWQgdG8gYWRkIG5ldyB2YXJpYWJsZXNcbiAgICogb3Igb3ZlcnJpZGUgZXhpc3Rpbmcgb25lcy5cbiAgICogQHBhcmFtIHtzdHJpbmd9IHNvdXJjZVxuICAgKiBAcGFyYW0geyFPYmplY3Q8c3RyaW5nLCAqPj19IG9wdF9iaW5kaW5nc1xuICAgKiBAcGFyYW0geyFPYmplY3Q8c3RyaW5nLCBib29sZWFuPj19IG9wdF9hbGxvd2xpc3RcbiAgICogQHJldHVybiB7IVByb21pc2U8c3RyaW5nPn1cbiAgICovXG4gIGV4cGFuZFN0cmluZ0FzeW5jKHNvdXJjZSwgb3B0X2JpbmRpbmdzLCBvcHRfYWxsb3dsaXN0KSB7XG4gICAgcmV0dXJuIC8qKiBAdHlwZSB7IVByb21pc2U8c3RyaW5nPn0gKi8gKFxuICAgICAgbmV3IEV4cGFuZGVyKFxuICAgICAgICB0aGlzLnZhcmlhYmxlU291cmNlXyxcbiAgICAgICAgb3B0X2JpbmRpbmdzLFxuICAgICAgICAvKiBvcHRfY29sbGVjdFZhcnMgKi8gdW5kZWZpbmVkLFxuICAgICAgICAvKiBvcHRfc3luYyAqLyB1bmRlZmluZWQsXG4gICAgICAgIG9wdF9hbGxvd2xpc3QsXG4gICAgICAgIC8qIG9wdF9ub0VuY29kZSAqLyB0cnVlXG4gICAgICApLi8qT0sqLyBleHBhbmQoc291cmNlKVxuICAgICk7XG4gIH1cblxuICAvKipcbiAgICogU3luY2hyb25vdXNseSBleHBhbmRzIHRoZSBwcm92aWRlZCBVUkwgYnkgcmVwbGFjaW5nIGFsbCBrbm93biB2YXJpYWJsZXNcbiAgICogd2l0aCB0aGVpciByZXNvbHZlZCB2YWx1ZXMuIE9wdGlvbmFsIGBvcHRfYmluZGluZ3NgIGNhbiBiZSB1c2VkIHRvIGFkZCBuZXdcbiAgICogdmFyaWFibGVzIG9yIG92ZXJyaWRlIGV4aXN0aW5nIG9uZXMuICBBbnkgYXN5bmMgYmluZGluZ3MgYXJlIGlnbm9yZWQuXG4gICAqIEBwYXJhbSB7c3RyaW5nfSB1cmxcbiAgICogQHBhcmFtIHshT2JqZWN0PHN0cmluZywgKFJlc29sdmVyUmV0dXJuRGVmfCFTeW5jUmVzb2x2ZXJEZWYpPj19IG9wdF9iaW5kaW5nc1xuICAgKiBAcGFyYW0geyFPYmplY3Q8c3RyaW5nLCBib29sZWFuPj19IG9wdF9hbGxvd2xpc3QgT3B0aW9uYWwgYWxsb3dsaXN0IG9mXG4gICAqICAgICBuYW1lcyB0aGF0IGNhbiBiZSBzdWJzdGl0dXRlZC5cbiAgICogQHJldHVybiB7c3RyaW5nfVxuICAgKi9cbiAgZXhwYW5kVXJsU3luYyh1cmwsIG9wdF9iaW5kaW5ncywgb3B0X2FsbG93bGlzdCkge1xuICAgIHJldHVybiB0aGlzLmVuc3VyZVByb3RvY29sTWF0Y2hlc18oXG4gICAgICB1cmwsXG4gICAgICAvKiogQHR5cGUge3N0cmluZ30gKi8gKFxuICAgICAgICBuZXcgRXhwYW5kZXIoXG4gICAgICAgICAgdGhpcy52YXJpYWJsZVNvdXJjZV8sXG4gICAgICAgICAgb3B0X2JpbmRpbmdzLFxuICAgICAgICAgIC8qIG9wdF9jb2xsZWN0VmFycyAqLyB1bmRlZmluZWQsXG4gICAgICAgICAgLyogb3B0X3N5bmMgKi8gdHJ1ZSxcbiAgICAgICAgICBvcHRfYWxsb3dsaXN0XG4gICAgICAgICkuLypPSyovIGV4cGFuZCh1cmwpXG4gICAgICApXG4gICAgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBFeHBhbmRzIHRoZSBwcm92aWRlZCBVUkwgYnkgcmVwbGFjaW5nIGFsbCBrbm93biB2YXJpYWJsZXMgd2l0aCB0aGVpclxuICAgKiByZXNvbHZlZCB2YWx1ZXMuIE9wdGlvbmFsIGBvcHRfYmluZGluZ3NgIGNhbiBiZSB1c2VkIHRvIGFkZCBuZXcgdmFyaWFibGVzXG4gICAqIG9yIG92ZXJyaWRlIGV4aXN0aW5nIG9uZXMuXG4gICAqIEBwYXJhbSB7c3RyaW5nfSB1cmxcbiAgICogQHBhcmFtIHshT2JqZWN0PHN0cmluZywgKj49fSBvcHRfYmluZGluZ3NcbiAgICogQHBhcmFtIHshT2JqZWN0PHN0cmluZywgYm9vbGVhbj49fSBvcHRfYWxsb3dsaXN0IE9wdGlvbmFsIGFsbG93bGlzdCBvZiBuYW1lc1xuICAgKiAgICAgdGhhdCBjYW4gYmUgc3Vic3RpdHV0ZWQuXG4gICAqIEBwYXJhbSB7Ym9vbGVhbj19IG9wdF9ub0VuY29kZSBzaG91bGQgbm90IGVuY29kZSBVUkxcbiAgICogQHJldHVybiB7IVByb21pc2U8c3RyaW5nPn1cbiAgICovXG4gIGV4cGFuZFVybEFzeW5jKHVybCwgb3B0X2JpbmRpbmdzLCBvcHRfYWxsb3dsaXN0LCBvcHRfbm9FbmNvZGUpIHtcbiAgICByZXR1cm4gLyoqIEB0eXBlIHshUHJvbWlzZTxzdHJpbmc+fSAqLyAoXG4gICAgICBuZXcgRXhwYW5kZXIoXG4gICAgICAgIHRoaXMudmFyaWFibGVTb3VyY2VfLFxuICAgICAgICBvcHRfYmluZGluZ3MsXG4gICAgICAgIC8qIG9wdF9jb2xsZWN0VmFycyAqLyB1bmRlZmluZWQsXG4gICAgICAgIC8qIG9wdF9zeW5jICovIHVuZGVmaW5lZCxcbiAgICAgICAgb3B0X2FsbG93bGlzdCxcbiAgICAgICAgb3B0X25vRW5jb2RlXG4gICAgICApXG4gICAgICAgIC4vKk9LKi8gZXhwYW5kKHVybClcbiAgICAgICAgLnRoZW4oKHJlcGxhY2VtZW50KSA9PiB0aGlzLmVuc3VyZVByb3RvY29sTWF0Y2hlc18odXJsLCByZXBsYWNlbWVudCkpXG4gICAgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBFeHBhbmRzIGFuIGlucHV0IGVsZW1lbnQgdmFsdWUgYXR0cmlidXRlIHdpdGggdmFyaWFibGUgc3Vic3RpdHV0ZWQuXG4gICAqIEBwYXJhbSB7IUhUTUxJbnB1dEVsZW1lbnR9IGVsZW1lbnRcbiAgICogQHJldHVybiB7IVByb21pc2U8c3RyaW5nPn1cbiAgICovXG4gIGV4cGFuZElucHV0VmFsdWVBc3luYyhlbGVtZW50KSB7XG4gICAgcmV0dXJuIC8qKiBAdHlwZSB7IVByb21pc2U8c3RyaW5nPn0gKi8gKFxuICAgICAgdGhpcy5leHBhbmRJbnB1dFZhbHVlXyhlbGVtZW50LCAvKm9wdF9zeW5jKi8gZmFsc2UpXG4gICAgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBFeHBhbmRzIGFuIGlucHV0IGVsZW1lbnQgdmFsdWUgYXR0cmlidXRlIHdpdGggdmFyaWFibGUgc3Vic3RpdHV0ZWQuXG4gICAqIEBwYXJhbSB7IUhUTUxJbnB1dEVsZW1lbnR9IGVsZW1lbnRcbiAgICogQHJldHVybiB7c3RyaW5nfSBSZXBsYWNlZCBzdHJpbmcgZm9yIHRlc3RpbmdcbiAgICovXG4gIGV4cGFuZElucHV0VmFsdWVTeW5jKGVsZW1lbnQpIHtcbiAgICByZXR1cm4gLyoqIEB0eXBlIHtzdHJpbmd9ICovIChcbiAgICAgIHRoaXMuZXhwYW5kSW5wdXRWYWx1ZV8oZWxlbWVudCwgLypvcHRfc3luYyovIHRydWUpXG4gICAgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBFeHBhbmRzIGluIGlucHV0IGVsZW1lbnQgdmFsdWUgYXR0cmlidXRlIHdpdGggdmFyaWFibGUgc3Vic3RpdHV0ZWQuXG4gICAqIEBwYXJhbSB7IUhUTUxJbnB1dEVsZW1lbnR9IGVsZW1lbnRcbiAgICogQHBhcmFtIHtib29sZWFuPX0gb3B0X3N5bmNcbiAgICogQHJldHVybiB7c3RyaW5nfCFQcm9taXNlPHN0cmluZz59XG4gICAqL1xuICBleHBhbmRJbnB1dFZhbHVlXyhlbGVtZW50LCBvcHRfc3luYykge1xuICAgIGRldkFzc2VydChcbiAgICAgIGVsZW1lbnQudGFnTmFtZSA9PSAnSU5QVVQnICYmXG4gICAgICAgIChlbGVtZW50LmdldEF0dHJpYnV0ZSgndHlwZScpIHx8ICcnKS50b0xvd2VyQ2FzZSgpID09ICdoaWRkZW4nLFxuICAgICAgJ0lucHV0IHZhbHVlIGV4cGFuc2lvbiBvbmx5IHdvcmtzIG9uIGhpZGRlbiBpbnB1dCBmaWVsZHM6ICVzJyxcbiAgICAgIGVsZW1lbnRcbiAgICApO1xuXG4gICAgY29uc3QgYWxsb3dsaXN0ID0gdGhpcy5nZXRBbGxvd2xpc3RGb3JFbGVtZW50XyhlbGVtZW50KTtcbiAgICBpZiAoIWFsbG93bGlzdCkge1xuICAgICAgcmV0dXJuIG9wdF9zeW5jID8gZWxlbWVudC52YWx1ZSA6IFByb21pc2UucmVzb2x2ZShlbGVtZW50LnZhbHVlKTtcbiAgICB9XG4gICAgaWYgKGVsZW1lbnRbT1JJR0lOQUxfVkFMVUVfUFJPUEVSVFldID09PSB1bmRlZmluZWQpIHtcbiAgICAgIGVsZW1lbnRbT1JJR0lOQUxfVkFMVUVfUFJPUEVSVFldID0gZWxlbWVudC52YWx1ZTtcbiAgICB9XG4gICAgY29uc3QgcmVzdWx0ID0gbmV3IEV4cGFuZGVyKFxuICAgICAgdGhpcy52YXJpYWJsZVNvdXJjZV8sXG4gICAgICAvKiBvcHRfYmluZGluZ3MgKi8gdW5kZWZpbmVkLFxuICAgICAgLyogb3B0X2NvbGxlY3RWYXJzICovIHVuZGVmaW5lZCxcbiAgICAgIC8qIG9wdF9zeW5jICovIG9wdF9zeW5jLFxuICAgICAgLyogb3B0X2FsbG93bGlzdCAqLyBhbGxvd2xpc3RcbiAgICApLi8qT0sqLyBleHBhbmQoZWxlbWVudFtPUklHSU5BTF9WQUxVRV9QUk9QRVJUWV0gfHwgZWxlbWVudC52YWx1ZSk7XG5cbiAgICBpZiAob3B0X3N5bmMpIHtcbiAgICAgIHJldHVybiAoZWxlbWVudC52YWx1ZSA9IHJlc3VsdCk7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQudGhlbigobmV3VmFsdWUpID0+IHtcbiAgICAgIGVsZW1lbnQudmFsdWUgPSBuZXdWYWx1ZTtcbiAgICAgIHJldHVybiBuZXdWYWx1ZTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGEgcmVwbGFjZW1lbnQgYWxsb3dsaXN0IGZyb20gZWxlbWVudHMnIGRhdGEtYW1wLXJlcGxhY2UgYXR0cmlidXRlLlxuICAgKiBAcGFyYW0geyFFbGVtZW50fSBlbGVtZW50XG4gICAqIEBwYXJhbSB7IU9iamVjdDxzdHJpbmcsIGJvb2xlYW4+PX0gb3B0X3N1cHBvcnRlZFJlcGxhY2VtZW50IE9wdGlvbmFsIHN1cHBvcnRlZFxuICAgKiByZXBsYWNlbWVudCB0aGF0IGZpbHRlcnMgYWxsb3dsaXN0IHRvIGEgc3Vic2V0LlxuICAgKiBAcmV0dXJuIHshT2JqZWN0PHN0cmluZywgYm9vbGVhbj58dW5kZWZpbmVkfVxuICAgKi9cbiAgZ2V0QWxsb3dsaXN0Rm9yRWxlbWVudF8oZWxlbWVudCwgb3B0X3N1cHBvcnRlZFJlcGxhY2VtZW50KSB7XG4gICAgY29uc3QgYWxsb3dsaXN0ID0gZWxlbWVudC5nZXRBdHRyaWJ1dGUoJ2RhdGEtYW1wLXJlcGxhY2UnKTtcbiAgICBpZiAoIWFsbG93bGlzdCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBjb25zdCByZXF1ZXN0ZWRSZXBsYWNlbWVudHMgPSB7fTtcbiAgICBhbGxvd2xpc3RcbiAgICAgIC50cmltKClcbiAgICAgIC5zcGxpdCgvXFxzKy8pXG4gICAgICAuZm9yRWFjaCgocmVwbGFjZW1lbnQpID0+IHtcbiAgICAgICAgaWYgKFxuICAgICAgICAgICFvcHRfc3VwcG9ydGVkUmVwbGFjZW1lbnQgfHxcbiAgICAgICAgICBoYXNPd24ob3B0X3N1cHBvcnRlZFJlcGxhY2VtZW50LCByZXBsYWNlbWVudClcbiAgICAgICAgKSB7XG4gICAgICAgICAgcmVxdWVzdGVkUmVwbGFjZW1lbnRzW3JlcGxhY2VtZW50XSA9IHRydWU7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdXNlcigpLndhcm4oJ1VSTCcsICdJZ25vcmluZyB1bnN1cHBvcnRlZCByZXBsYWNlbWVudCcsIHJlcGxhY2VtZW50KTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgcmV0dXJuIHJlcXVlc3RlZFJlcGxhY2VtZW50cztcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHdoZXRoZXIgdmFyaWFibGUgc3Vic3RpdHV0aW9uIGlzIGFsbG93ZWQgZm9yIGdpdmVuIHVybC5cbiAgICogQHBhcmFtIHshTG9jYXRpb259IHVybFxuICAgKiBAcmV0dXJuIHtib29sZWFufVxuICAgKi9cbiAgaXNBbGxvd2VkT3JpZ2luXyh1cmwpIHtcbiAgICBjb25zdCBkb2NJbmZvID0gU2VydmljZXMuZG9jdW1lbnRJbmZvRm9yRG9jKHRoaXMuYW1wZG9jKTtcbiAgICBpZiAoXG4gICAgICB1cmwub3JpZ2luID09IHBhcnNlVXJsRGVwcmVjYXRlZChkb2NJbmZvLmNhbm9uaWNhbFVybCkub3JpZ2luIHx8XG4gICAgICB1cmwub3JpZ2luID09IHBhcnNlVXJsRGVwcmVjYXRlZChkb2NJbmZvLnNvdXJjZVVybCkub3JpZ2luXG4gICAgKSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICBjb25zdCBtZXRhID0gdGhpcy5hbXBkb2MuZ2V0TWV0YUJ5TmFtZSgnYW1wLWxpbmstdmFyaWFibGUtYWxsb3dlZC1vcmlnaW4nKTtcbiAgICBpZiAobWV0YSkge1xuICAgICAgY29uc3QgYWxsb3dsaXN0ID0gbWV0YS50cmltKCkuc3BsaXQoL1xccysvKTtcbiAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgYWxsb3dsaXN0Lmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGlmICh1cmwub3JpZ2luID09IHBhcnNlVXJsRGVwcmVjYXRlZChhbGxvd2xpc3RbaV0pLm9yaWdpbikge1xuICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlcGxhY2VzIHZhbHVlcyBpbiB0aGUgbGluayBvZiBhbiBhbmNob3IgdGFnIGlmXG4gICAqIC0gdGhlIGxpbmsgb3B0cyBpbnRvIGl0ICh2aWEgZGF0YS1hbXAtcmVwbGFjZSBhcmd1bWVudClcbiAgICogLSB0aGUgZGVzdGluYXRpb24gaXMgdGhlIHNvdXJjZSBvciBjYW5vbmljYWwgb3JpZ2luIG9mIHRoaXMgZG9jLlxuICAgKiBAcGFyYW0geyFFbGVtZW50fSBlbGVtZW50IEFuIGFuY2hvciBlbGVtZW50LlxuICAgKiBAcGFyYW0gez9zdHJpbmd9IGRlZmF1bHRVcmxQYXJhbXMgdG8gZXhwYW5kIGxpbmsgaWYgY2FsbGVyIHJlcXVlc3QuXG4gICAqIEByZXR1cm4ge3N0cmluZ3x1bmRlZmluZWR9IFJlcGxhY2VkIHN0cmluZyBmb3IgdGVzdGluZ1xuICAgKi9cbiAgbWF5YmVFeHBhbmRMaW5rKGVsZW1lbnQsIGRlZmF1bHRVcmxQYXJhbXMpIHtcbiAgICBkZXZBc3NlcnQoZWxlbWVudC50YWdOYW1lID09ICdBJyk7XG4gICAgY29uc3QgYUVsZW1lbnQgPSAvKiogQHR5cGUgeyFIVE1MQW5jaG9yRWxlbWVudH0gKi8gKGVsZW1lbnQpO1xuICAgIGNvbnN0IHN1cHBvcnRlZFJlcGxhY2VtZW50cyA9IHtcbiAgICAgICdDTElFTlRfSUQnOiB0cnVlLFxuICAgICAgJ1FVRVJZX1BBUkFNJzogdHJ1ZSxcbiAgICAgICdQQUdFX1ZJRVdfSUQnOiB0cnVlLFxuICAgICAgJ1BBR0VfVklFV19JRF82NCc6IHRydWUsXG4gICAgICAnTkFWX1RJTUlORyc6IHRydWUsXG4gICAgfTtcbiAgICBsZXQgYWRkaXRpb25hbFVybFBhcmFtZXRlcnMgPVxuICAgICAgYUVsZW1lbnQuZ2V0QXR0cmlidXRlKCdkYXRhLWFtcC1hZGRwYXJhbXMnKSB8fCAnJztcbiAgICBjb25zdCBhbGxvd2xpc3QgPSB0aGlzLmdldEFsbG93bGlzdEZvckVsZW1lbnRfKFxuICAgICAgYUVsZW1lbnQsXG4gICAgICBzdXBwb3J0ZWRSZXBsYWNlbWVudHNcbiAgICApO1xuXG4gICAgaWYgKCFhbGxvd2xpc3QgJiYgIWFkZGl0aW9uYWxVcmxQYXJhbWV0ZXJzICYmICFkZWZhdWx0VXJsUGFyYW1zKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIC8vIE9SSUdJTkFMX0hSRUZfUFJPUEVSVFkgaGFzIHRoZSB2YWx1ZSBvZiB0aGUgaHJlZiBcInByZS1yZXBsYWNlbWVudFwiLlxuICAgIC8vIFdlIHNldCB0aGlzIHRvIHRoZSBvcmlnaW5hbCB2YWx1ZSBiZWZvcmUgZG9pbmcgYW55IHdvcmsgYW5kIHVzZSBpdFxuICAgIC8vIG9uIHN1YnNlcXVlbnQgcmVwbGFjZW1lbnRzLCBzbyB0aGF0IGVhY2ggcnVuIGdldHMgYSBmcmVzaCB2YWx1ZS5cbiAgICBsZXQgaHJlZiA9IGRldigpLmFzc2VydFN0cmluZyhcbiAgICAgIGFFbGVtZW50W09SSUdJTkFMX0hSRUZfUFJPUEVSVFldIHx8IGFFbGVtZW50LmdldEF0dHJpYnV0ZSgnaHJlZicpXG4gICAgKTtcbiAgICBjb25zdCB1cmwgPSBwYXJzZVVybERlcHJlY2F0ZWQoaHJlZik7XG4gICAgaWYgKGFFbGVtZW50W09SSUdJTkFMX0hSRUZfUFJPUEVSVFldID09IG51bGwpIHtcbiAgICAgIGFFbGVtZW50W09SSUdJTkFMX0hSRUZfUFJPUEVSVFldID0gaHJlZjtcbiAgICB9XG5cbiAgICBjb25zdCBpc0FsbG93ZWRPcmlnaW4gPSB0aGlzLmlzQWxsb3dlZE9yaWdpbl8odXJsKTtcbiAgICBpZiAoYWRkaXRpb25hbFVybFBhcmFtZXRlcnMpIHtcbiAgICAgIGFkZGl0aW9uYWxVcmxQYXJhbWV0ZXJzID0gaXNBbGxvd2VkT3JpZ2luXG4gICAgICAgID8gdGhpcy5leHBhbmRTeW5jSWZBbGxvd2VkTGlzdF8oYWRkaXRpb25hbFVybFBhcmFtZXRlcnMsIGFsbG93bGlzdClcbiAgICAgICAgOiBhZGRpdGlvbmFsVXJsUGFyYW1ldGVycztcbiAgICAgIGhyZWYgPSBhZGRQYXJhbXNUb1VybChocmVmLCBwYXJzZVF1ZXJ5U3RyaW5nKGFkZGl0aW9uYWxVcmxQYXJhbWV0ZXJzKSk7XG4gICAgfVxuXG4gICAgaWYgKCFpc0FsbG93ZWRPcmlnaW4pIHtcbiAgICAgIGlmIChhbGxvd2xpc3QpIHtcbiAgICAgICAgdXNlcigpLndhcm4oXG4gICAgICAgICAgJ1VSTCcsXG4gICAgICAgICAgJ0lnbm9yaW5nIGxpbmsgcmVwbGFjZW1lbnQgJXMnICtcbiAgICAgICAgICAgIFwiIGJlY2F1c2UgdGhlIGxpbmsgZG9lcyBub3QgZ28gdG8gdGhlIGRvY3VtZW50J3NcIiArXG4gICAgICAgICAgICAnIHNvdXJjZSwgY2Fub25pY2FsLCBvciBhbGxvd2xpc3RlZCBvcmlnaW4uJyxcbiAgICAgICAgICBocmVmXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgICByZXR1cm4gKGFFbGVtZW50LmhyZWYgPSBocmVmKTtcbiAgICB9XG5cbiAgICAvLyBOb3RlIHRoYXQgZGVmYXVsdFVybFBhcmFtcyBpcyB0cmVhdGVkIGRpZmZlcmVudGx5IHRoYW5cbiAgICAvLyBhZGRpdGlvbmFsVXJsUGFyYW1ldGVycyBpbiB0d28gd2F5cyAjMTogSWYgdGhlIG91dGdvaW5nIHVybCBvcmlnaW4gaXMgbm90XG4gICAgLy8gYWxsb3dsaXN0ZWQ6IGFkZGl0aW9uYWxVcmxQYXJhbWV0ZXJzIGFyZSBhbHdheXMgYXBwZW5kZWQgYnkgbm90IGV4cGFuZGVkLFxuICAgIC8vIGRlZmF1bHRVcmxQYXJhbXMgd2lsbCBub3QgYmUgYXBwZW5kZWQuICMyOiBJZiB0aGUgZXhwYW5zaW9uIGZ1bmN0aW9uIGlzXG4gICAgLy8gbm90IGFsbG93bGlzdGVkOiBhZGRpdGlvbmFsVXJsUGFyYW10ZXJzIHdpbGwgbm90IGJlIGV4cGFuZGVkLFxuICAgIC8vIGRlZmF1bHRVcmxQYXJhbXMgd2lsbCBieSBkZWZhdWx0IHN1cHBvcnQgUVVFUllfUEFSQU0sIGFuZCB3aWxsIHN0aWxsIGJlXG4gICAgLy8gZXhwYW5kZWQuXG4gICAgaWYgKGRlZmF1bHRVcmxQYXJhbXMpIHtcbiAgICAgIGlmICghYWxsb3dsaXN0IHx8ICFhbGxvd2xpc3RbJ1FVRVJZX1BBUkFNJ10pIHtcbiAgICAgICAgLy8gb3ZlcnJpZGUgYWxsb3dsaXN0IGFuZCBleHBhbmQgZGVmYXVsdFVybFBhcmFtcztcbiAgICAgICAgY29uc3Qgb3ZlcnJpZGVBbGxvd2xpc3QgPSB7J1FVRVJZX1BBUkFNJzogdHJ1ZX07XG4gICAgICAgIGRlZmF1bHRVcmxQYXJhbXMgPSB0aGlzLmV4cGFuZFVybFN5bmMoXG4gICAgICAgICAgZGVmYXVsdFVybFBhcmFtcyxcbiAgICAgICAgICAvKiBvcHRfYmluZGluZ3MgKi8gdW5kZWZpbmVkLFxuICAgICAgICAgIC8qIG9wdF9hbGxvd2xpc3QgKi8gb3ZlcnJpZGVBbGxvd2xpc3RcbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICAgIGhyZWYgPSBhZGRQYXJhbXNUb1VybChocmVmLCBwYXJzZVF1ZXJ5U3RyaW5nKGRlZmF1bHRVcmxQYXJhbXMpKTtcbiAgICB9XG5cbiAgICBocmVmID0gdGhpcy5leHBhbmRTeW5jSWZBbGxvd2VkTGlzdF8oaHJlZiwgYWxsb3dsaXN0KTtcblxuICAgIHJldHVybiAoYUVsZW1lbnQuaHJlZiA9IGhyZWYpO1xuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBocmVmXG4gICAqIEBwYXJhbSB7IU9iamVjdDxzdHJpbmcsIGJvb2xlYW4+fHVuZGVmaW5lZH0gYWxsb3dsaXN0XG4gICAqIEByZXR1cm4ge3N0cmluZ31cbiAgICovXG4gIGV4cGFuZFN5bmNJZkFsbG93ZWRMaXN0XyhocmVmLCBhbGxvd2xpc3QpIHtcbiAgICByZXR1cm4gYWxsb3dsaXN0XG4gICAgICA/IHRoaXMuZXhwYW5kVXJsU3luYyhcbiAgICAgICAgICBocmVmLFxuICAgICAgICAgIC8qIG9wdF9iaW5kaW5ncyAqLyB1bmRlZmluZWQsXG4gICAgICAgICAgLyogb3B0X2FsbG93bGlzdCAqLyBhbGxvd2xpc3RcbiAgICAgICAgKVxuICAgICAgOiBocmVmO1xuICB9XG5cbiAgLyoqXG4gICAqIENvbGxlY3RzIGFsbCBzdWJzdGl0dXRpb25zIGluIHRoZSBwcm92aWRlZCBVUkwgYW5kIGV4cGFuZHMgdGhlbSB0byB0aGVcbiAgICogdmFsdWVzIGZvciBrbm93biB2YXJpYWJsZXMuIE9wdGlvbmFsIGBvcHRfYmluZGluZ3NgIGNhbiBiZSB1c2VkIHRvIGFkZFxuICAgKiBuZXcgdmFyaWFibGVzIG9yIG92ZXJyaWRlIGV4aXN0aW5nIG9uZXMuXG4gICAqIEBwYXJhbSB7c3RyaW5nfSB1cmxcbiAgICogQHBhcmFtIHshT2JqZWN0PHN0cmluZywgKj49fSBvcHRfYmluZGluZ3NcbiAgICogQHJldHVybiB7IVByb21pc2U8IU9iamVjdDxzdHJpbmcsICo+Pn1cbiAgICovXG4gIGNvbGxlY3RWYXJzKHVybCwgb3B0X2JpbmRpbmdzKSB7XG4gICAgY29uc3QgdmFycyA9IE9iamVjdC5jcmVhdGUobnVsbCk7XG4gICAgcmV0dXJuIG5ldyBFeHBhbmRlcih0aGlzLnZhcmlhYmxlU291cmNlXywgb3B0X2JpbmRpbmdzLCB2YXJzKVxuICAgICAgLi8qT0sqLyBleHBhbmQodXJsKVxuICAgICAgLnRoZW4oKCkgPT4gdmFycyk7XG4gIH1cblxuICAvKipcbiAgICogQ29sbGVjdHMgc3Vic3RpdHV0aW9ucyBpbiB0aGUgYHNyY2AgYXR0cmlidXRlIG9mIHRoZSBnaXZlbiBlbGVtZW50XG4gICAqIHRoYXQgYXJlIF9ub3RfIGFsbG93bGlzdGVkIHZpYSBgZGF0YS1hbXAtcmVwbGFjZWAgb3B0LWluIGF0dHJpYnV0ZS5cbiAgICogQHBhcmFtIHshRWxlbWVudH0gZWxlbWVudFxuICAgKiBAcmV0dXJuIHshQXJyYXk8c3RyaW5nPn1cbiAgICovXG4gIGNvbGxlY3REaXNhbGxvd2VkVmFyc1N5bmMoZWxlbWVudCkge1xuICAgIGNvbnN0IHVybCA9IGVsZW1lbnQuZ2V0QXR0cmlidXRlKCdzcmMnKTtcbiAgICBjb25zdCBtYWNyb05hbWVzID0gbmV3IEV4cGFuZGVyKHRoaXMudmFyaWFibGVTb3VyY2VfKS5nZXRNYWNyb05hbWVzKHVybCk7XG4gICAgY29uc3QgYWxsb3dsaXN0ID0gdGhpcy5nZXRBbGxvd2xpc3RGb3JFbGVtZW50XyhlbGVtZW50KTtcbiAgICBpZiAoYWxsb3dsaXN0KSB7XG4gICAgICByZXR1cm4gbWFjcm9OYW1lcy5maWx0ZXIoKHYpID0+ICFhbGxvd2xpc3Rbdl0pO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBBbGwgdmFycyBhcmUgdW5hbGxvd2xpc3RlZCBpZiB0aGUgZWxlbWVudCBoYXMgbm8gYWxsb3dsaXN0LlxuICAgICAgcmV0dXJuIG1hY3JvTmFtZXM7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEVuc3VyZXMgdGhhdCB0aGUgcHJvdG9jb2wgb2YgdGhlIG9yaWdpbmFsIHVybCBtYXRjaGVzIHRoZSBwcm90b2NvbCBvZiB0aGVcbiAgICogcmVwbGFjZW1lbnQgdXJsLiBSZXR1cm5zIHRoZSByZXBsYWNlbWVudCBpZiB0aGV5IGRvLCB0aGUgb3JpZ2luYWwgaWYgdGhleVxuICAgKiBkbyBub3QuXG4gICAqIEBwYXJhbSB7c3RyaW5nfSB1cmxcbiAgICogQHBhcmFtIHtzdHJpbmd9IHJlcGxhY2VtZW50XG4gICAqIEByZXR1cm4ge3N0cmluZ31cbiAgICovXG4gIGVuc3VyZVByb3RvY29sTWF0Y2hlc18odXJsLCByZXBsYWNlbWVudCkge1xuICAgIGNvbnN0IG5ld1Byb3RvY29sID0gcGFyc2VVcmxEZXByZWNhdGVkKFxuICAgICAgcmVwbGFjZW1lbnQsXG4gICAgICAvKiBvcHRfbm9jYWNoZSAqLyB0cnVlXG4gICAgKS5wcm90b2NvbDtcbiAgICBjb25zdCBvbGRQcm90b2NvbCA9IHBhcnNlVXJsRGVwcmVjYXRlZChcbiAgICAgIHVybCxcbiAgICAgIC8qIG9wdF9ub2NhY2hlICovIHRydWVcbiAgICApLnByb3RvY29sO1xuICAgIGlmIChuZXdQcm90b2NvbCAhPSBvbGRQcm90b2NvbCkge1xuICAgICAgdXNlcigpLmVycm9yKFRBRywgJ0lsbGVnYWwgcmVwbGFjZW1lbnQgb2YgdGhlIHByb3RvY29sOiAnLCB1cmwpO1xuICAgICAgcmV0dXJuIHVybDtcbiAgICB9XG4gICAgdXNlckFzc2VydChcbiAgICAgIGlzUHJvdG9jb2xWYWxpZChyZXBsYWNlbWVudCksXG4gICAgICAnVGhlIHJlcGxhY2VtZW50IHVybCBoYXMgaW52YWxpZCBwcm90b2NvbDogJXMnLFxuICAgICAgcmVwbGFjZW1lbnRcbiAgICApO1xuXG4gICAgcmV0dXJuIHJlcGxhY2VtZW50O1xuICB9XG5cbiAgLyoqXG4gICAqIEByZXR1cm4ge1ZhcmlhYmxlU291cmNlfVxuICAgKi9cbiAgZ2V0VmFyaWFibGVTb3VyY2UoKSB7XG4gICAgcmV0dXJuIHRoaXMudmFyaWFibGVTb3VyY2VfO1xuICB9XG59XG5cbi8qKlxuICogRXh0cmFjdHMgY2xpZW50IElEIGZyb20gYSBfZ2EgY29va2llLlxuICogaHR0cHM6Ly9kZXZlbG9wZXJzLmdvb2dsZS5jb20vYW5hbHl0aWNzL2Rldmd1aWRlcy9jb2xsZWN0aW9uL2FuYWx5dGljc2pzL2Nvb2tpZXMtdXNlci1pZFxuICogQHBhcmFtIHtzdHJpbmd9IGdhQ29va2llXG4gKiBAcmV0dXJuIHtzdHJpbmd9XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBleHRyYWN0Q2xpZW50SWRGcm9tR2FDb29raWUoZ2FDb29raWUpIHtcbiAgcmV0dXJuIGdhQ29va2llLnJlcGxhY2UoL14oR0ExfDEpXFwuW1xcZC1dK1xcLi8sICcnKTtcbn1cblxuLyoqXG4gKiBAcGFyYW0geyEuL2FtcGRvYy1pbXBsLkFtcERvY30gYW1wZG9jXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpbnN0YWxsVXJsUmVwbGFjZW1lbnRzU2VydmljZUZvckRvYyhhbXBkb2MpIHtcbiAgcmVnaXN0ZXJTZXJ2aWNlQnVpbGRlckZvckRvYyhhbXBkb2MsICd1cmwtcmVwbGFjZScsIGZ1bmN0aW9uIChkb2MpIHtcbiAgICByZXR1cm4gbmV3IFVybFJlcGxhY2VtZW50cyhkb2MsIG5ldyBHbG9iYWxWYXJpYWJsZVNvdXJjZShkb2MpKTtcbiAgfSk7XG59XG5cbi8qKlxuICogQHBhcmFtIHshLi9hbXBkb2MtaW1wbC5BbXBEb2N9IGFtcGRvY1xuICogQHBhcmFtIHshVmFyaWFibGVTb3VyY2V9IHZhclNvdXJjZVxuICovXG5leHBvcnQgZnVuY3Rpb24gaW5zdGFsbFVybFJlcGxhY2VtZW50c0ZvckVtYmVkKGFtcGRvYywgdmFyU291cmNlKSB7XG4gIGluc3RhbGxTZXJ2aWNlSW5FbWJlZERvYyhcbiAgICBhbXBkb2MsXG4gICAgJ3VybC1yZXBsYWNlJyxcbiAgICBuZXcgVXJsUmVwbGFjZW1lbnRzKGFtcGRvYywgdmFyU291cmNlKVxuICApO1xufVxuXG4vKipcbiAqIEB0eXBlZGVmIHt7aW5jb21pbmdGcmFnbWVudDogc3RyaW5nLCBvdXRnb2luZ0ZyYWdtZW50OiBzdHJpbmd9fVxuICovXG5sZXQgU2hhcmVUcmFja2luZ0ZyYWdtZW50c0RlZjtcbiJdfQ==
// /Users/mszylkowski/src/amphtml/src/service/url-replacements-impl.js