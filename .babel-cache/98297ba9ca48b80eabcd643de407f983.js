function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

/**
 * Copyright 2016 The AMP HTML Authors. All Rights Reserved.
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
import { triggerAnalyticsEvent } from "./analytics";
import { CommonSignals } from "./core/constants/common-signals";
import { createElementWithAttributes, removeElement } from "./core/dom";
import { isArray } from "./core/types";
import { dict } from "./core/types/object";
import { toWin } from "./core/window";
import { devAssert } from "./log";
import { Services } from "./service";

/**
 * Method to create scoped analytics element for any element.
 * TODO: Make this function private
 * @param {!Element} parentElement
 * @param {!JsonObject} config
 * @param {boolean=} loadAnalytics
 * @param {boolean=} disableImmediate
 * @return {!Element} created analytics element
 */
export function insertAnalyticsElement(parentElement, config, loadAnalytics, disableImmediate) {
  if (loadAnalytics === void 0) {
    loadAnalytics = false;
  }

  if (disableImmediate === void 0) {
    disableImmediate = false;
  }

  var doc =
  /** @type {!Document} */
  parentElement.ownerDocument;
  var analyticsElem = createElementWithAttributes(doc, 'amp-analytics', dict({
    'sandbox': 'true',
    'trigger': disableImmediate ? '' : 'immediate'
  }));
  var scriptElem = createElementWithAttributes(doc, 'script', dict({
    'type': 'application/json'
  }));
  scriptElem.textContent = JSON.stringify(config);
  analyticsElem.appendChild(scriptElem);
  analyticsElem.CONFIG = config;

  // Force load analytics extension if script not included in page.
  if (loadAnalytics) {
    // Get Extensions service and force load analytics extension.
    var extensions = Services.extensionsFor(toWin(parentElement.ownerDocument.defaultView));
    var ampdoc = Services.ampdoc(parentElement);
    extensions.
    /*OK*/
    installExtensionForDoc(ampdoc, 'amp-analytics');
  } else {
    Services.analyticsForDocOrNull(parentElement).then(function (analytics) {
      devAssert(analytics);
    });
  }

  parentElement.appendChild(analyticsElem);
  return analyticsElem;
}

/**
 * A class that handles customEvent reporting of extension element through
 * amp-analytics. This class is not exposed to extension element directly to
 * restrict the genration of the config Please use CustomEventReporterBuilder to
 * build a CustomEventReporter instance.
 */
var CustomEventReporter = /*#__PURE__*/function () {
  /**
   * @param {!Element} parent
   * @param {!JsonObject} config
   */
  function CustomEventReporter(parent, config) {
    var _this = this;

    _classCallCheck(this, CustomEventReporter);

    devAssert(config['triggers'], 'Config must have triggers defined');

    /** @private {string} */
    this.id_ = parent.getResourceId();

    /** @private {!AmpElement} */
    this.parent_ = parent;

    /** @private {JsonObject} */
    this.config_ = config;

    for (var event in config['triggers']) {
      var eventType = config['triggers'][event]['on'];
      devAssert(eventType, 'CustomEventReporter config must specify trigger eventType');
      var newEventType = this.getEventTypeInSandbox_(eventType);
      config['triggers'][event]['on'] = newEventType;
    }

    this.parent_.signals().whenSignal(CommonSignals.LOAD_START).then(function () {
      insertAnalyticsElement(_this.parent_, config, true);
    });
  }

  /**
   * @param {string} eventType
   * @param {!JsonObject=} opt_vars A map of vars and their values.
   */
  _createClass(CustomEventReporter, [{
    key: "trigger",
    value: function trigger(eventType, opt_vars) {
      devAssert(this.config_['triggers'][eventType], 'Cannot trigger non initiated eventType');
      triggerAnalyticsEvent(this.parent_, this.getEventTypeInSandbox_(eventType), opt_vars,
      /** enableDataVars */
      false);
    }
    /**
     * @param {string} eventType
     * @return {string}
     */

  }, {
    key: "getEventTypeInSandbox_",
    value: function getEventTypeInSandbox_(eventType) {
      return "sandbox-" + this.id_ + "-" + eventType;
    }
  }]);

  return CustomEventReporter;
}();

/**
 * A builder class that enable extension elements to easily build and get a
 * CustomEventReporter instance. Its constructor requires the parent AMP
 * element. It provides two methods #track() and #build() to build the
 * CustomEventReporter instance.
 */
export var CustomEventReporterBuilder = /*#__PURE__*/function () {
  /** @param {!AmpElement} parent */
  function CustomEventReporterBuilder(parent) {
    _classCallCheck(this, CustomEventReporterBuilder);

    /** @private {!AmpElement} */
    this.parent_ = parent;

    /** @private {?JsonObject} */
    this.config_ =
    /** @type {JsonObject} */
    {
      'requests': {},
      'triggers': {}
    };
  }

  /**
   * @param {!JsonObject} transportConfig
   */
  _createClass(CustomEventReporterBuilder, [{
    key: "setTransportConfig",
    value: function setTransportConfig(transportConfig) {
      this.config_['transport'] = transportConfig;
    }
    /**
     * @param {!JsonObject} extraUrlParamsConfig
     */

  }, {
    key: "setExtraUrlParams",
    value: function setExtraUrlParams(extraUrlParamsConfig) {
      this.config_['extraUrlParams'] = extraUrlParamsConfig;
    }
    /**
     * The #track() method takes in a unique custom-event name, and the
     * corresponding request url (or an array of request urls). One can call
     * #track() multiple times with different eventType name (order doesn't
     * matter) before #build() is called.
     * @param {string} eventType
     * @param {string|!Array<string>} request
     * @return {!CustomEventReporterBuilder}
     */

  }, {
    key: "track",
    value: function track(eventType, request) {
      request = isArray(request) ? request : [request];
      devAssert(!this.config_['triggers'][eventType], 'customEventReporterBuilder should not track same eventType twice');
      var requestList = [];

      for (var i = 0; i < request.length; i++) {
        var requestName = eventType + "-request-" + i;
        this.config_['requests'][requestName] = request[i];
        requestList.push(requestName);
      }

      this.config_['triggers'][eventType] = {
        'on': eventType,
        'request': requestList
      };
      return this;
    }
    /**
     * Call the #build() method to build and get the CustomEventReporter instance.
     * One CustomEventReporterBuilder instance can only build one reporter, which
     * means #build() should only be called once after all eventType are added.
     * @return {!CustomEventReporter}
     */

  }, {
    key: "build",
    value: function build() {
      devAssert(this.config_, 'CustomEventReporter already built');
      var report = new CustomEventReporter(this.parent_,
      /** @type {!JsonObject} */
      this.config_);
      this.config_ = null;
      return report;
    }
  }]);

  return CustomEventReporterBuilder;
}();

/**
 * A helper method that should be used by all extension elements to add their
 * sandbox analytics tracking. This method takes care of insert and remove the
 * analytics tracker at the right time of the element lifecycle.
 * @param {!AmpElement} element
 * @param {!Promise<!JsonObject>} promise
 */
export function useAnalyticsInSandbox(element, promise) {
  var analyticsElement = null;
  var configPromise = promise;
  // Listener to LOAD_START signal. Insert analytics element on LOAD_START
  element.signals().whenSignal(CommonSignals.LOAD_START).then(function () {
    if (analyticsElement || !configPromise) {
      return;
    }

    configPromise.then(function (config) {
      if (!configPromise) {
        // If config promise resolve after unload, do nothing.
        return;
      }

      configPromise = null;
      analyticsElement = insertAnalyticsElement(element, config, false);
    });
  });
  // Listener to UNLOAD signal. Destroy remove element on UNLOAD
  element.signals().whenSignal(CommonSignals.UNLOAD).then(function () {
    configPromise = null;

    if (analyticsElement) {
      removeElement(analyticsElement);
      analyticsElement = null;
    }
  });
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImV4dGVuc2lvbi1hbmFseXRpY3MuanMiXSwibmFtZXMiOlsidHJpZ2dlckFuYWx5dGljc0V2ZW50IiwiQ29tbW9uU2lnbmFscyIsImNyZWF0ZUVsZW1lbnRXaXRoQXR0cmlidXRlcyIsInJlbW92ZUVsZW1lbnQiLCJpc0FycmF5IiwiZGljdCIsInRvV2luIiwiZGV2QXNzZXJ0IiwiU2VydmljZXMiLCJpbnNlcnRBbmFseXRpY3NFbGVtZW50IiwicGFyZW50RWxlbWVudCIsImNvbmZpZyIsImxvYWRBbmFseXRpY3MiLCJkaXNhYmxlSW1tZWRpYXRlIiwiZG9jIiwib3duZXJEb2N1bWVudCIsImFuYWx5dGljc0VsZW0iLCJzY3JpcHRFbGVtIiwidGV4dENvbnRlbnQiLCJKU09OIiwic3RyaW5naWZ5IiwiYXBwZW5kQ2hpbGQiLCJDT05GSUciLCJleHRlbnNpb25zIiwiZXh0ZW5zaW9uc0ZvciIsImRlZmF1bHRWaWV3IiwiYW1wZG9jIiwiaW5zdGFsbEV4dGVuc2lvbkZvckRvYyIsImFuYWx5dGljc0ZvckRvY09yTnVsbCIsInRoZW4iLCJhbmFseXRpY3MiLCJDdXN0b21FdmVudFJlcG9ydGVyIiwicGFyZW50IiwiaWRfIiwiZ2V0UmVzb3VyY2VJZCIsInBhcmVudF8iLCJjb25maWdfIiwiZXZlbnQiLCJldmVudFR5cGUiLCJuZXdFdmVudFR5cGUiLCJnZXRFdmVudFR5cGVJblNhbmRib3hfIiwic2lnbmFscyIsIndoZW5TaWduYWwiLCJMT0FEX1NUQVJUIiwib3B0X3ZhcnMiLCJDdXN0b21FdmVudFJlcG9ydGVyQnVpbGRlciIsInRyYW5zcG9ydENvbmZpZyIsImV4dHJhVXJsUGFyYW1zQ29uZmlnIiwicmVxdWVzdCIsInJlcXVlc3RMaXN0IiwiaSIsImxlbmd0aCIsInJlcXVlc3ROYW1lIiwicHVzaCIsInJlcG9ydCIsInVzZUFuYWx5dGljc0luU2FuZGJveCIsImVsZW1lbnQiLCJwcm9taXNlIiwiYW5hbHl0aWNzRWxlbWVudCIsImNvbmZpZ1Byb21pc2Ui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QUQsQ0FBYjtBQUNBQSxNQUFBQSxnQkFBZ0IsR0FBRyxJQUFuQjtBQUNEO0FBQ0YsR0FUSDtBQVVEIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDb3B5cmlnaHQgMjAxNiBUaGUgQU1QIEhUTUwgQXV0aG9ycy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xuICogeW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuICogWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG4gKlxuICogICAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcbiAqXG4gKiBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4gKiBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTLUlTXCIgQkFTSVMsXG4gKiBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cbiAqIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbiAqIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuICovXG5cbmltcG9ydCB7dHJpZ2dlckFuYWx5dGljc0V2ZW50fSBmcm9tICcuL2FuYWx5dGljcyc7XG5pbXBvcnQge0NvbW1vblNpZ25hbHN9IGZyb20gJy4vY29yZS9jb25zdGFudHMvY29tbW9uLXNpZ25hbHMnO1xuaW1wb3J0IHtjcmVhdGVFbGVtZW50V2l0aEF0dHJpYnV0ZXMsIHJlbW92ZUVsZW1lbnR9IGZyb20gJy4vY29yZS9kb20nO1xuaW1wb3J0IHtpc0FycmF5fSBmcm9tICcuL2NvcmUvdHlwZXMnO1xuaW1wb3J0IHtkaWN0fSBmcm9tICcuL2NvcmUvdHlwZXMvb2JqZWN0JztcbmltcG9ydCB7dG9XaW59IGZyb20gJy4vY29yZS93aW5kb3cnO1xuaW1wb3J0IHtkZXZBc3NlcnR9IGZyb20gJy4vbG9nJztcbmltcG9ydCB7U2VydmljZXN9IGZyb20gJy4vc2VydmljZSc7XG5cbi8qKlxuICogTWV0aG9kIHRvIGNyZWF0ZSBzY29wZWQgYW5hbHl0aWNzIGVsZW1lbnQgZm9yIGFueSBlbGVtZW50LlxuICogVE9ETzogTWFrZSB0aGlzIGZ1bmN0aW9uIHByaXZhdGVcbiAqIEBwYXJhbSB7IUVsZW1lbnR9IHBhcmVudEVsZW1lbnRcbiAqIEBwYXJhbSB7IUpzb25PYmplY3R9IGNvbmZpZ1xuICogQHBhcmFtIHtib29sZWFuPX0gbG9hZEFuYWx5dGljc1xuICogQHBhcmFtIHtib29sZWFuPX0gZGlzYWJsZUltbWVkaWF0ZVxuICogQHJldHVybiB7IUVsZW1lbnR9IGNyZWF0ZWQgYW5hbHl0aWNzIGVsZW1lbnRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGluc2VydEFuYWx5dGljc0VsZW1lbnQoXG4gIHBhcmVudEVsZW1lbnQsXG4gIGNvbmZpZyxcbiAgbG9hZEFuYWx5dGljcyA9IGZhbHNlLFxuICBkaXNhYmxlSW1tZWRpYXRlID0gZmFsc2Vcbikge1xuICBjb25zdCBkb2MgPSAvKiogQHR5cGUgeyFEb2N1bWVudH0gKi8gKHBhcmVudEVsZW1lbnQub3duZXJEb2N1bWVudCk7XG4gIGNvbnN0IGFuYWx5dGljc0VsZW0gPSBjcmVhdGVFbGVtZW50V2l0aEF0dHJpYnV0ZXMoXG4gICAgZG9jLFxuICAgICdhbXAtYW5hbHl0aWNzJyxcbiAgICBkaWN0KHtcbiAgICAgICdzYW5kYm94JzogJ3RydWUnLFxuICAgICAgJ3RyaWdnZXInOiBkaXNhYmxlSW1tZWRpYXRlID8gJycgOiAnaW1tZWRpYXRlJyxcbiAgICB9KVxuICApO1xuICBjb25zdCBzY3JpcHRFbGVtID0gY3JlYXRlRWxlbWVudFdpdGhBdHRyaWJ1dGVzKFxuICAgIGRvYyxcbiAgICAnc2NyaXB0JyxcbiAgICBkaWN0KHtcbiAgICAgICd0eXBlJzogJ2FwcGxpY2F0aW9uL2pzb24nLFxuICAgIH0pXG4gICk7XG4gIHNjcmlwdEVsZW0udGV4dENvbnRlbnQgPSBKU09OLnN0cmluZ2lmeShjb25maWcpO1xuICBhbmFseXRpY3NFbGVtLmFwcGVuZENoaWxkKHNjcmlwdEVsZW0pO1xuICBhbmFseXRpY3NFbGVtLkNPTkZJRyA9IGNvbmZpZztcblxuICAvLyBGb3JjZSBsb2FkIGFuYWx5dGljcyBleHRlbnNpb24gaWYgc2NyaXB0IG5vdCBpbmNsdWRlZCBpbiBwYWdlLlxuICBpZiAobG9hZEFuYWx5dGljcykge1xuICAgIC8vIEdldCBFeHRlbnNpb25zIHNlcnZpY2UgYW5kIGZvcmNlIGxvYWQgYW5hbHl0aWNzIGV4dGVuc2lvbi5cbiAgICBjb25zdCBleHRlbnNpb25zID0gU2VydmljZXMuZXh0ZW5zaW9uc0ZvcihcbiAgICAgIHRvV2luKHBhcmVudEVsZW1lbnQub3duZXJEb2N1bWVudC5kZWZhdWx0VmlldylcbiAgICApO1xuICAgIGNvbnN0IGFtcGRvYyA9IFNlcnZpY2VzLmFtcGRvYyhwYXJlbnRFbGVtZW50KTtcbiAgICBleHRlbnNpb25zLi8qT0sqLyBpbnN0YWxsRXh0ZW5zaW9uRm9yRG9jKGFtcGRvYywgJ2FtcC1hbmFseXRpY3MnKTtcbiAgfSBlbHNlIHtcbiAgICBTZXJ2aWNlcy5hbmFseXRpY3NGb3JEb2NPck51bGwocGFyZW50RWxlbWVudCkudGhlbigoYW5hbHl0aWNzKSA9PiB7XG4gICAgICBkZXZBc3NlcnQoYW5hbHl0aWNzKTtcbiAgICB9KTtcbiAgfVxuICBwYXJlbnRFbGVtZW50LmFwcGVuZENoaWxkKGFuYWx5dGljc0VsZW0pO1xuICByZXR1cm4gYW5hbHl0aWNzRWxlbTtcbn1cblxuLyoqXG4gKiBBIGNsYXNzIHRoYXQgaGFuZGxlcyBjdXN0b21FdmVudCByZXBvcnRpbmcgb2YgZXh0ZW5zaW9uIGVsZW1lbnQgdGhyb3VnaFxuICogYW1wLWFuYWx5dGljcy4gVGhpcyBjbGFzcyBpcyBub3QgZXhwb3NlZCB0byBleHRlbnNpb24gZWxlbWVudCBkaXJlY3RseSB0b1xuICogcmVzdHJpY3QgdGhlIGdlbnJhdGlvbiBvZiB0aGUgY29uZmlnIFBsZWFzZSB1c2UgQ3VzdG9tRXZlbnRSZXBvcnRlckJ1aWxkZXIgdG9cbiAqIGJ1aWxkIGEgQ3VzdG9tRXZlbnRSZXBvcnRlciBpbnN0YW5jZS5cbiAqL1xuY2xhc3MgQ3VzdG9tRXZlbnRSZXBvcnRlciB7XG4gIC8qKlxuICAgKiBAcGFyYW0geyFFbGVtZW50fSBwYXJlbnRcbiAgICogQHBhcmFtIHshSnNvbk9iamVjdH0gY29uZmlnXG4gICAqL1xuICBjb25zdHJ1Y3RvcihwYXJlbnQsIGNvbmZpZykge1xuICAgIGRldkFzc2VydChjb25maWdbJ3RyaWdnZXJzJ10sICdDb25maWcgbXVzdCBoYXZlIHRyaWdnZXJzIGRlZmluZWQnKTtcbiAgICAvKiogQHByaXZhdGUge3N0cmluZ30gKi9cbiAgICB0aGlzLmlkXyA9IHBhcmVudC5nZXRSZXNvdXJjZUlkKCk7XG5cbiAgICAvKiogQHByaXZhdGUgeyFBbXBFbGVtZW50fSAqL1xuICAgIHRoaXMucGFyZW50XyA9IHBhcmVudDtcblxuICAgIC8qKiBAcHJpdmF0ZSB7SnNvbk9iamVjdH0gKi9cbiAgICB0aGlzLmNvbmZpZ18gPSBjb25maWc7XG5cbiAgICBmb3IgKGNvbnN0IGV2ZW50IGluIGNvbmZpZ1sndHJpZ2dlcnMnXSkge1xuICAgICAgY29uc3QgZXZlbnRUeXBlID0gY29uZmlnWyd0cmlnZ2VycyddW2V2ZW50XVsnb24nXTtcbiAgICAgIGRldkFzc2VydChcbiAgICAgICAgZXZlbnRUeXBlLFxuICAgICAgICAnQ3VzdG9tRXZlbnRSZXBvcnRlciBjb25maWcgbXVzdCBzcGVjaWZ5IHRyaWdnZXIgZXZlbnRUeXBlJ1xuICAgICAgKTtcbiAgICAgIGNvbnN0IG5ld0V2ZW50VHlwZSA9IHRoaXMuZ2V0RXZlbnRUeXBlSW5TYW5kYm94XyhldmVudFR5cGUpO1xuICAgICAgY29uZmlnWyd0cmlnZ2VycyddW2V2ZW50XVsnb24nXSA9IG5ld0V2ZW50VHlwZTtcbiAgICB9XG5cbiAgICB0aGlzLnBhcmVudF9cbiAgICAgIC5zaWduYWxzKClcbiAgICAgIC53aGVuU2lnbmFsKENvbW1vblNpZ25hbHMuTE9BRF9TVEFSVClcbiAgICAgIC50aGVuKCgpID0+IHtcbiAgICAgICAgaW5zZXJ0QW5hbHl0aWNzRWxlbWVudCh0aGlzLnBhcmVudF8sIGNvbmZpZywgdHJ1ZSk7XG4gICAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gZXZlbnRUeXBlXG4gICAqIEBwYXJhbSB7IUpzb25PYmplY3Q9fSBvcHRfdmFycyBBIG1hcCBvZiB2YXJzIGFuZCB0aGVpciB2YWx1ZXMuXG4gICAqL1xuICB0cmlnZ2VyKGV2ZW50VHlwZSwgb3B0X3ZhcnMpIHtcbiAgICBkZXZBc3NlcnQoXG4gICAgICB0aGlzLmNvbmZpZ19bJ3RyaWdnZXJzJ11bZXZlbnRUeXBlXSxcbiAgICAgICdDYW5ub3QgdHJpZ2dlciBub24gaW5pdGlhdGVkIGV2ZW50VHlwZSdcbiAgICApO1xuICAgIHRyaWdnZXJBbmFseXRpY3NFdmVudChcbiAgICAgIHRoaXMucGFyZW50XyxcbiAgICAgIHRoaXMuZ2V0RXZlbnRUeXBlSW5TYW5kYm94XyhldmVudFR5cGUpLFxuICAgICAgb3B0X3ZhcnMsXG4gICAgICAvKiogZW5hYmxlRGF0YVZhcnMgKi8gZmFsc2VcbiAgICApO1xuICB9XG4gIC8qKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gZXZlbnRUeXBlXG4gICAqIEByZXR1cm4ge3N0cmluZ31cbiAgICovXG4gIGdldEV2ZW50VHlwZUluU2FuZGJveF8oZXZlbnRUeXBlKSB7XG4gICAgcmV0dXJuIGBzYW5kYm94LSR7dGhpcy5pZF99LSR7ZXZlbnRUeXBlfWA7XG4gIH1cbn1cblxuLyoqXG4gKiBBIGJ1aWxkZXIgY2xhc3MgdGhhdCBlbmFibGUgZXh0ZW5zaW9uIGVsZW1lbnRzIHRvIGVhc2lseSBidWlsZCBhbmQgZ2V0IGFcbiAqIEN1c3RvbUV2ZW50UmVwb3J0ZXIgaW5zdGFuY2UuIEl0cyBjb25zdHJ1Y3RvciByZXF1aXJlcyB0aGUgcGFyZW50IEFNUFxuICogZWxlbWVudC4gSXQgcHJvdmlkZXMgdHdvIG1ldGhvZHMgI3RyYWNrKCkgYW5kICNidWlsZCgpIHRvIGJ1aWxkIHRoZVxuICogQ3VzdG9tRXZlbnRSZXBvcnRlciBpbnN0YW5jZS5cbiAqL1xuZXhwb3J0IGNsYXNzIEN1c3RvbUV2ZW50UmVwb3J0ZXJCdWlsZGVyIHtcbiAgLyoqIEBwYXJhbSB7IUFtcEVsZW1lbnR9IHBhcmVudCAqL1xuICBjb25zdHJ1Y3RvcihwYXJlbnQpIHtcbiAgICAvKiogQHByaXZhdGUgeyFBbXBFbGVtZW50fSAqL1xuICAgIHRoaXMucGFyZW50XyA9IHBhcmVudDtcblxuICAgIC8qKiBAcHJpdmF0ZSB7P0pzb25PYmplY3R9ICovXG4gICAgdGhpcy5jb25maWdfID0gLyoqIEB0eXBlIHtKc29uT2JqZWN0fSAqLyAoe1xuICAgICAgJ3JlcXVlc3RzJzoge30sXG4gICAgICAndHJpZ2dlcnMnOiB7fSxcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0geyFKc29uT2JqZWN0fSB0cmFuc3BvcnRDb25maWdcbiAgICovXG4gIHNldFRyYW5zcG9ydENvbmZpZyh0cmFuc3BvcnRDb25maWcpIHtcbiAgICB0aGlzLmNvbmZpZ19bJ3RyYW5zcG9ydCddID0gdHJhbnNwb3J0Q29uZmlnO1xuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7IUpzb25PYmplY3R9IGV4dHJhVXJsUGFyYW1zQ29uZmlnXG4gICAqL1xuICBzZXRFeHRyYVVybFBhcmFtcyhleHRyYVVybFBhcmFtc0NvbmZpZykge1xuICAgIHRoaXMuY29uZmlnX1snZXh0cmFVcmxQYXJhbXMnXSA9IGV4dHJhVXJsUGFyYW1zQ29uZmlnO1xuICB9XG5cbiAgLyoqXG4gICAqIFRoZSAjdHJhY2soKSBtZXRob2QgdGFrZXMgaW4gYSB1bmlxdWUgY3VzdG9tLWV2ZW50IG5hbWUsIGFuZCB0aGVcbiAgICogY29ycmVzcG9uZGluZyByZXF1ZXN0IHVybCAob3IgYW4gYXJyYXkgb2YgcmVxdWVzdCB1cmxzKS4gT25lIGNhbiBjYWxsXG4gICAqICN0cmFjaygpIG11bHRpcGxlIHRpbWVzIHdpdGggZGlmZmVyZW50IGV2ZW50VHlwZSBuYW1lIChvcmRlciBkb2Vzbid0XG4gICAqIG1hdHRlcikgYmVmb3JlICNidWlsZCgpIGlzIGNhbGxlZC5cbiAgICogQHBhcmFtIHtzdHJpbmd9IGV2ZW50VHlwZVxuICAgKiBAcGFyYW0ge3N0cmluZ3whQXJyYXk8c3RyaW5nPn0gcmVxdWVzdFxuICAgKiBAcmV0dXJuIHshQ3VzdG9tRXZlbnRSZXBvcnRlckJ1aWxkZXJ9XG4gICAqL1xuICB0cmFjayhldmVudFR5cGUsIHJlcXVlc3QpIHtcbiAgICByZXF1ZXN0ID0gaXNBcnJheShyZXF1ZXN0KSA/IHJlcXVlc3QgOiBbcmVxdWVzdF07XG4gICAgZGV2QXNzZXJ0KFxuICAgICAgIXRoaXMuY29uZmlnX1sndHJpZ2dlcnMnXVtldmVudFR5cGVdLFxuICAgICAgJ2N1c3RvbUV2ZW50UmVwb3J0ZXJCdWlsZGVyIHNob3VsZCBub3QgdHJhY2sgc2FtZSBldmVudFR5cGUgdHdpY2UnXG4gICAgKTtcbiAgICBjb25zdCByZXF1ZXN0TGlzdCA9IFtdO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgcmVxdWVzdC5sZW5ndGg7IGkrKykge1xuICAgICAgY29uc3QgcmVxdWVzdE5hbWUgPSBgJHtldmVudFR5cGV9LXJlcXVlc3QtJHtpfWA7XG4gICAgICB0aGlzLmNvbmZpZ19bJ3JlcXVlc3RzJ11bcmVxdWVzdE5hbWVdID0gcmVxdWVzdFtpXTtcbiAgICAgIHJlcXVlc3RMaXN0LnB1c2gocmVxdWVzdE5hbWUpO1xuICAgIH1cbiAgICB0aGlzLmNvbmZpZ19bJ3RyaWdnZXJzJ11bZXZlbnRUeXBlXSA9IHtcbiAgICAgICdvbic6IGV2ZW50VHlwZSxcbiAgICAgICdyZXF1ZXN0JzogcmVxdWVzdExpc3QsXG4gICAgfTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBDYWxsIHRoZSAjYnVpbGQoKSBtZXRob2QgdG8gYnVpbGQgYW5kIGdldCB0aGUgQ3VzdG9tRXZlbnRSZXBvcnRlciBpbnN0YW5jZS5cbiAgICogT25lIEN1c3RvbUV2ZW50UmVwb3J0ZXJCdWlsZGVyIGluc3RhbmNlIGNhbiBvbmx5IGJ1aWxkIG9uZSByZXBvcnRlciwgd2hpY2hcbiAgICogbWVhbnMgI2J1aWxkKCkgc2hvdWxkIG9ubHkgYmUgY2FsbGVkIG9uY2UgYWZ0ZXIgYWxsIGV2ZW50VHlwZSBhcmUgYWRkZWQuXG4gICAqIEByZXR1cm4geyFDdXN0b21FdmVudFJlcG9ydGVyfVxuICAgKi9cbiAgYnVpbGQoKSB7XG4gICAgZGV2QXNzZXJ0KHRoaXMuY29uZmlnXywgJ0N1c3RvbUV2ZW50UmVwb3J0ZXIgYWxyZWFkeSBidWlsdCcpO1xuICAgIGNvbnN0IHJlcG9ydCA9IG5ldyBDdXN0b21FdmVudFJlcG9ydGVyKFxuICAgICAgdGhpcy5wYXJlbnRfLFxuICAgICAgLyoqIEB0eXBlIHshSnNvbk9iamVjdH0gKi8gKHRoaXMuY29uZmlnXylcbiAgICApO1xuICAgIHRoaXMuY29uZmlnXyA9IG51bGw7XG4gICAgcmV0dXJuIHJlcG9ydDtcbiAgfVxufVxuXG4vKipcbiAqIEEgaGVscGVyIG1ldGhvZCB0aGF0IHNob3VsZCBiZSB1c2VkIGJ5IGFsbCBleHRlbnNpb24gZWxlbWVudHMgdG8gYWRkIHRoZWlyXG4gKiBzYW5kYm94IGFuYWx5dGljcyB0cmFja2luZy4gVGhpcyBtZXRob2QgdGFrZXMgY2FyZSBvZiBpbnNlcnQgYW5kIHJlbW92ZSB0aGVcbiAqIGFuYWx5dGljcyB0cmFja2VyIGF0IHRoZSByaWdodCB0aW1lIG9mIHRoZSBlbGVtZW50IGxpZmVjeWNsZS5cbiAqIEBwYXJhbSB7IUFtcEVsZW1lbnR9IGVsZW1lbnRcbiAqIEBwYXJhbSB7IVByb21pc2U8IUpzb25PYmplY3Q+fSBwcm9taXNlXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB1c2VBbmFseXRpY3NJblNhbmRib3goZWxlbWVudCwgcHJvbWlzZSkge1xuICBsZXQgYW5hbHl0aWNzRWxlbWVudCA9IG51bGw7XG4gIGxldCBjb25maWdQcm9taXNlID0gcHJvbWlzZTtcbiAgLy8gTGlzdGVuZXIgdG8gTE9BRF9TVEFSVCBzaWduYWwuIEluc2VydCBhbmFseXRpY3MgZWxlbWVudCBvbiBMT0FEX1NUQVJUXG4gIGVsZW1lbnRcbiAgICAuc2lnbmFscygpXG4gICAgLndoZW5TaWduYWwoQ29tbW9uU2lnbmFscy5MT0FEX1NUQVJUKVxuICAgIC50aGVuKCgpID0+IHtcbiAgICAgIGlmIChhbmFseXRpY3NFbGVtZW50IHx8ICFjb25maWdQcm9taXNlKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIGNvbmZpZ1Byb21pc2UudGhlbigoY29uZmlnKSA9PiB7XG4gICAgICAgIGlmICghY29uZmlnUHJvbWlzZSkge1xuICAgICAgICAgIC8vIElmIGNvbmZpZyBwcm9taXNlIHJlc29sdmUgYWZ0ZXIgdW5sb2FkLCBkbyBub3RoaW5nLlxuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBjb25maWdQcm9taXNlID0gbnVsbDtcbiAgICAgICAgYW5hbHl0aWNzRWxlbWVudCA9IGluc2VydEFuYWx5dGljc0VsZW1lbnQoZWxlbWVudCwgY29uZmlnLCBmYWxzZSk7XG4gICAgICB9KTtcbiAgICB9KTtcblxuICAvLyBMaXN0ZW5lciB0byBVTkxPQUQgc2lnbmFsLiBEZXN0cm95IHJlbW92ZSBlbGVtZW50IG9uIFVOTE9BRFxuICBlbGVtZW50XG4gICAgLnNpZ25hbHMoKVxuICAgIC53aGVuU2lnbmFsKENvbW1vblNpZ25hbHMuVU5MT0FEKVxuICAgIC50aGVuKCgpID0+IHtcbiAgICAgIGNvbmZpZ1Byb21pc2UgPSBudWxsO1xuICAgICAgaWYgKGFuYWx5dGljc0VsZW1lbnQpIHtcbiAgICAgICAgcmVtb3ZlRWxlbWVudChhbmFseXRpY3NFbGVtZW50KTtcbiAgICAgICAgYW5hbHl0aWNzRWxlbWVudCA9IG51bGw7XG4gICAgICB9XG4gICAgfSk7XG59XG4iXX0=
// /Users/mszylkowski/src/amphtml/src/extension-analytics.js