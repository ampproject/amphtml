function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

/**
 * Copyright 2017 The AMP HTML Authors. All Rights Reserved.
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
import { getElementServiceForDoc, getElementServiceIfAvailable, getElementServiceIfAvailableForDoc, getElementServiceIfAvailableForDocInEmbedScope } from "../element-service";
import { getAmpdoc, getExistingServiceOrNull, getService, getServiceForDoc, getServiceForDocOrNull, getServiceInEmbedWin, getServicePromiseForDoc } from "../service-helpers";

/** @typedef {!../extensions/amp-subscriptions/0.1/amp-subscriptions.SubscriptionService} */
export var SubscriptionService;
export var Services = /*#__PURE__*/function () {
  function Services() {
    _classCallCheck(this, Services);
  }

  _createClass(Services, null, [{
    key: "accessServiceForDoc",
    value:
    /**
     * Hint: Add extensions folder path to compile.js with
     * warnings cannot find modules.
     */

    /**
     * Returns a promise for the Access service.
     * @param {!Element|!ShadowRoot} element
     * @return {!Promise<!../extensions/amp-access/0.1/amp-access.AccessService>}
     */
    function accessServiceForDoc(element) {
      return (
        /** @type {!Promise<!../extensions/amp-access/0.1/amp-access.AccessService>} */
        getElementServiceForDoc(element, 'access', 'amp-access')
      );
    }
    /**
     * Returns a promise for the Access service or a promise for null if the
     * service is not available on the current page.
     * @param {!Element|!ShadowRoot} element
     * @return {!Promise<?../extensions/amp-access/0.1/amp-access.AccessService>}
     */

  }, {
    key: "accessServiceForDocOrNull",
    value: function accessServiceForDocOrNull(element) {
      return (
        /** @type {!Promise<?../extensions/amp-access/0.1/amp-access.AccessService>} */
        getElementServiceIfAvailableForDoc(element, 'access', 'amp-access')
      );
    }
    /**
     * Returns a promise for the Subscriptions service.
     * @param {!Element|!ShadowRoot} element
     * @return {!Promise<!SubscriptionService>}
     */

  }, {
    key: "subscriptionsServiceForDoc",
    value: function subscriptionsServiceForDoc(element) {
      return (
        /** @type {!Promise<!SubscriptionService>} */
        getElementServiceForDoc(element, 'subscriptions', 'amp-subscriptions')
      );
    }
    /**
     * Returns a promise for the Subscriptions service.
     * @param {!Element|!ShadowRoot} element
     * @return {!Promise<?SubscriptionService>}
     */

  }, {
    key: "subscriptionsServiceForDocOrNull",
    value: function subscriptionsServiceForDocOrNull(element) {
      return (
        /** @type {!Promise<?SubscriptionService>} */
        getElementServiceIfAvailableForDoc(element, 'subscriptions', 'amp-subscriptions')
      );
    }
    /**
     * @param {!Element|!ShadowRoot} element
     * @return {!./service/action-impl.ActionService}
     */

  }, {
    key: "actionServiceForDoc",
    value: function actionServiceForDoc(element) {
      return (
        /** @type {!./service/action-impl.ActionService} */
        getServiceForDocOrNull(element, 'action')
      );
    }
    /**
     * @param {!Element|!ShadowRoot} element
     * @return {!./service/standard-actions-impl.StandardActions}
     */

  }, {
    key: "standardActionsForDoc",
    value: function standardActionsForDoc(element) {
      return (
        /** @type {!./service/standard-actions-impl.StandardActions} */
        getServiceForDocOrNull(element, 'standard-actions')
      );
    }
    /**
     * @param {!Element|!ShadowRoot} element
     * @return {!Promise<!../extensions/amp-analytics/0.1/activity-impl.Activity>}
     */

  }, {
    key: "activityForDoc",
    value: function activityForDoc(element) {
      return (
        /** @type {!Promise<!../extensions/amp-analytics/0.1/activity-impl.Activity>} */
        getElementServiceForDoc(element, 'activity', 'amp-analytics')
      );
    }
    /**
     * Returns the global instance of the `AmpDocService` service that can be
     * used to resolve an ampdoc for any node: either in the single-doc or
     * shadow-doc environment.
     * @param {!Window} window
     * @return {!./service/ampdoc-impl.AmpDocService}
     */

  }, {
    key: "ampdocServiceFor",
    value: function ampdocServiceFor(window) {
      return (
        /** @type {!./service/ampdoc-impl.AmpDocService} */
        getService(window, 'ampdoc')
      );
    }
    /**
     * Returns the AmpDoc for the specified context node.
     * @param {!Node|!./service/ampdoc-impl.AmpDoc} nodeOrAmpDoc
     * @return {!./service/ampdoc-impl.AmpDoc}
     */

  }, {
    key: "ampdoc",
    value: function ampdoc(nodeOrAmpDoc) {
      return getAmpdoc(nodeOrAmpDoc);
    }
    /**
     * @param {!Element|!ShadowRoot} element
     * @param {boolean=} loadAnalytics
     * @return {!Promise<!../extensions/amp-analytics/0.1/instrumentation.InstrumentationService>}
     */

  }, {
    key: "analyticsForDoc",
    value: function analyticsForDoc(element, loadAnalytics) {
      if (loadAnalytics === void 0) {
        loadAnalytics = false;
      }

      if (loadAnalytics) {
        // Get Extensions service and force load analytics extension.
        var ampdoc = getAmpdoc(element);
        Services.extensionsFor(ampdoc.win).
        /*OK*/
        installExtensionForDoc(ampdoc, 'amp-analytics');
      }

      return (
        /** @type {!Promise<!../extensions/amp-analytics/0.1/instrumentation.InstrumentationService>} */
        getElementServiceForDoc(element, 'amp-analytics-instrumentation', 'amp-analytics')
      );
    }
    /**
     * @param {!Element|!ShadowRoot} element
     * @return {!Promise<?../extensions/amp-analytics/0.1/instrumentation.InstrumentationService>}
     */

  }, {
    key: "analyticsForDocOrNull",
    value: function analyticsForDocOrNull(element) {
      return (
        /** @type {!Promise<?../extensions/amp-analytics/0.1/instrumentation.InstrumentationService>} */
        getElementServiceIfAvailableForDoc(element, 'amp-analytics-instrumentation', 'amp-analytics')
      );
    }
    /**
     * @param {!Window} window
     * @return {!./service/batched-xhr-impl.BatchedXhr}
     */

  }, {
    key: "batchedXhrFor",
    value: function batchedXhrFor(window) {
      return (
        /** @type {!./service/batched-xhr-impl.BatchedXhr} */
        getService(window, 'batched-xhr')
      );
    }
    /**
     * @param {!Element|!ShadowRoot} element
     * @return {!Promise<?../extensions/amp-bind/0.1/bind-impl.Bind>}
     */

  }, {
    key: "bindForDocOrNull",
    value: function bindForDocOrNull(element) {
      return (
        /** @type {!Promise<?../extensions/amp-bind/0.1/bind-impl.Bind>} */
        getElementServiceIfAvailableForDocInEmbedScope(element, 'bind', 'amp-bind')
      );
    }
    /**
     * @param {!Element|!ShadowRoot} element
     * @return {!Promise<?../extensions/amp-script/0.1/amp-script.AmpScriptService>}
     */

  }, {
    key: "scriptForDocOrNull",
    value: function scriptForDocOrNull(element) {
      return (
        /** @type {!Promise<?../extensions/amp-script/0.1/amp-script.AmpScriptService>} */
        getElementServiceIfAvailableForDocInEmbedScope(element, 'amp-script', 'amp-script')
      );
    }
    /**
     * @param {!Element|!ShadowRoot|!./service/ampdoc-impl.AmpDoc} elementOrAmpDoc
     * @return {!Promise<!./service/cid-impl.CidDef>}
     */

  }, {
    key: "cidForDoc",
    value: function cidForDoc(elementOrAmpDoc) {
      return (
        /** @type {!Promise<!./service/cid-impl.CidDef>} */
        getServicePromiseForDoc(elementOrAmpDoc, 'cid')
      );
    }
    /**
     * @param {!Element|!./service/ampdoc-impl.AmpDoc} elementOrAmpDoc
     * @return {!./service/navigation.Navigation}
     */

  }, {
    key: "navigationForDoc",
    value: function navigationForDoc(elementOrAmpDoc) {
      return (
        /** @type {!./service/navigation.Navigation} */
        getServiceForDoc(elementOrAmpDoc, 'navigation')
      );
    }
    /**
     * @param {!Element|!ShadowRoot} element
     * @return {!Promise<!../extensions/amp-loader/0.1/amp-loader.LoaderService>}
     */

  }, {
    key: "loaderServiceForDoc",
    value: function loaderServiceForDoc(element) {
      return (
        /** @type {!Promise<!../extensions/amp-loader/0.1/amp-loader.LoaderService>} */
        getElementServiceForDoc(element, 'loader', 'amp-loader')
      );
    }
    /**
     * @param {!Element|!ShadowRoot} element
     * @return {!Promise<!../extensions/amp-standalone/0.1/amp-standalone.StandaloneService>}
     */

  }, {
    key: "standaloneServiceForDoc",
    value: function standaloneServiceForDoc(element) {
      return (
        /** @type {!Promise<!../extensions/amp-standalone/0.1/amp-standalone.StandaloneService>} */
        getElementServiceForDoc(element, 'standalone', 'amp-standalone')
      );
    }
    /**
     * @param {!Window} window
     * @return {!./service/crypto-impl.Crypto}
     */

  }, {
    key: "cryptoFor",
    value: function cryptoFor(window) {
      return (
        /** @type {!./service/crypto-impl.Crypto} */
        getService(window, 'crypto')
      );
    }
    /**
     * @param {!Element|!./service/ampdoc-impl.AmpDoc} elementOrAmpDoc
     * @return {!./service/document-info-impl.DocumentInfoDef} Info about the doc
     */

  }, {
    key: "documentInfoForDoc",
    value: function documentInfoForDoc(elementOrAmpDoc) {
      return (
        /** @type {!./service/document-info-impl.DocInfo} */
        getServiceForDoc(elementOrAmpDoc, 'documentInfo').get()
      );
    }
    /**
     * @param {!Window} window
     * @return {!./service/extensions-impl.Extensions}
     */

  }, {
    key: "extensionsFor",
    value: function extensionsFor(window) {
      return (
        /** @type {!./service/extensions-impl.Extensions} */
        getService(window, 'extensions')
      );
    }
    /**
     * Returns a service to register callbacks we wish to execute when an
     * amp-form is submitted.
     * @param {!Element|!./service/ampdoc-impl.AmpDoc} elementOrAmpDoc
     * @return {!Promise<../extensions/amp-form/0.1/form-submit-service.FormSubmitService>}
     */

  }, {
    key: "formSubmitForDoc",
    value: function formSubmitForDoc(elementOrAmpDoc) {
      return (
        /** @type {!Promise<../extensions/amp-form/0.1/form-submit-service.FormSubmitService>} */
        getServicePromiseForDoc(elementOrAmpDoc, 'form-submit-service')
      );
    }
    /**
     * Returns service to listen for `hidden` attribute mutations.
     * @param {!Element|!ShadowRoot} element
     * @return {!./service/hidden-observer-impl.HiddenObserver}
     */

  }, {
    key: "hiddenObserverForDoc",
    value: function hiddenObserverForDoc(element) {
      return (
        /** @type {!./service/hidden-observer-impl.HiddenObserver} */
        getServiceForDocOrNull(element, 'hidden-observer')
      );
    }
    /**
     * Returns service implemented in service/history-impl.
     * @param {!Element|!./service/ampdoc-impl.AmpDoc} elementOrAmpDoc
     * @return {!./service/history-impl.History}
     */

  }, {
    key: "historyForDoc",
    value: function historyForDoc(elementOrAmpDoc) {
      return (
        /** @type {!./service/history-impl.History} */
        getServiceForDoc(elementOrAmpDoc, 'history')
      );
    }
    /**
     * @param {!Window} win
     * @return {!./input.Input}
     */

  }, {
    key: "inputFor",
    value: function inputFor(win) {
      return getService(win, 'input');
    }
    /**s
     * Returns a promise for the Inputmask service.
     * @param {!Element|!ShadowRoot} element
     * @return {!Promise<?../extensions/amp-inputmask/0.1/amp-inputmask.AmpInputmaskService>}
     */

  }, {
    key: "inputmaskServiceForDocOrNull",
    value: function inputmaskServiceForDocOrNull(element) {
      return (
        /** @type {!Promise<?../extensions/amp-inputmask/0.1/amp-inputmask.AmpInputmaskService>} */
        getElementServiceIfAvailableForDoc(element, 'inputmask', 'amp-inputmask')
      );
    }
    /**
     * @param {!Element|!./service/ampdoc-impl.AmpDoc} elementOrAmpDoc
     * @return {?./service/loading-indicator.LoadingIndicatorImpl}
     */

  }, {
    key: "loadingIndicatorOrNull",
    value: function loadingIndicatorOrNull(elementOrAmpDoc) {
      return (
        /** @type {?./service/loading-indicator.LoadingIndicatorImpl} */
        getServiceForDocOrNull(elementOrAmpDoc, 'loadingIndicator')
      );
    }
    /**
     * @param {!Element|!./service/ampdoc-impl.AmpDoc} elementOrAmpDoc
     * @return {!../extensions/amp-next-page/1.0/service.NextPageService}
     */

  }, {
    key: "nextPageServiceForDoc",
    value: function nextPageServiceForDoc(elementOrAmpDoc) {
      return (
        /** @type {!../extensions/amp-next-page/1.0/service.NextPageService} */
        getServiceForDoc(elementOrAmpDoc, 'next-page')
      );
    }
    /**
     * @param {!Element|!./service/ampdoc-impl.AmpDoc} elementOrAmpDoc
     * @return {!./service/mutator-interface.MutatorInterface}
     */

  }, {
    key: "mutatorForDoc",
    value: function mutatorForDoc(elementOrAmpDoc) {
      return (
        /** @type {!./service/mutator-interface.MutatorInterface} */
        getServiceForDoc(elementOrAmpDoc, 'mutator')
      );
    }
    /**
     * @param {!Element|!./service/ampdoc-impl.AmpDoc} elementOrAmpDoc
     * @return {!./service/owners-interface.OwnersInterface}
     */

  }, {
    key: "ownersForDoc",
    value: function ownersForDoc(elementOrAmpDoc) {
      return (
        /** @type {!./service/owners-interface.OwnersInterface} */
        getServiceForDoc(elementOrAmpDoc, 'owners')
      );
    }
    /**
     * @param {!Window} window
     * @return {!./service/performance-impl.Performance}
     */

  }, {
    key: "performanceFor",
    value: function performanceFor(window) {
      return (
        /** @type {!./service/performance-impl.Performance}*/
        getService(window, 'performance')
      );
    }
    /**
     * @param {!Window} window
     * @return {!./service/performance-impl.Performance}
     */

  }, {
    key: "performanceForOrNull",
    value: function performanceForOrNull(window) {
      return (
        /** @type {!./service/performance-impl.Performance}*/
        getExistingServiceOrNull(window, 'performance')
      );
    }
    /**
     * @param {!Window} window
     * @return {!./service/platform-impl.Platform}
     */

  }, {
    key: "platformFor",
    value: function platformFor(window) {
      return (
        /** @type {!./service/platform-impl.Platform} */
        getService(window, 'platform')
      );
    }
    /**
     * Not installed by default; must be installed in extension code before use.
     * @param {!Element|!ShadowRoot} element
     * @return {!./service/position-observer/position-observer-impl.PositionObserver}
     * @throws If the service is not installed.
     */

  }, {
    key: "positionObserverForDoc",
    value: function positionObserverForDoc(element) {
      return (
        /** @type {!./service/position-observer/position-observer-impl.PositionObserver} */
        getServiceForDoc(element, 'position-observer')
      );
    }
    /**
     * @param {!Window} window
     * @return {!./preconnect.PreconnectService}
     */

  }, {
    key: "preconnectFor",
    value: function preconnectFor(window) {
      return getService(window, 'preconnect');
    }
    /**
     * @param {!Element|!./service/ampdoc-impl.AmpDoc} elementOrAmpDoc
     * @return {!./service/resources-interface.ResourcesInterface}
     */

  }, {
    key: "resourcesForDoc",
    value: function resourcesForDoc(elementOrAmpDoc) {
      return (
        /** @type {!./service/resources-interface.ResourcesInterface} */
        getServiceForDoc(elementOrAmpDoc, 'resources')
      );
    }
    /**
     * @param {!Element|!./service/ampdoc-impl.AmpDoc} elementOrAmpDoc
     * @return {!Promise<!./service/resources-interface.ResourcesInterface>}
     */

  }, {
    key: "resourcesPromiseForDoc",
    value: function resourcesPromiseForDoc(elementOrAmpDoc) {
      return (
        /** @type {!Promise<!./service/resources-interface.ResourcesInterface>} */
        getServicePromiseForDoc(elementOrAmpDoc, 'resources')
      );
    }
    /**
     * @param {!Window} win
     * @return {?Promise<?../extensions/amp-story/1.0/variable-service.AmpStoryVariableService>}
     */

  }, {
    key: "storyVariableServiceForOrNull",
    value: function storyVariableServiceForOrNull(win) {
      return (
        /** @type {!Promise<?../extensions/amp-story/1.0/variable-service.AmpStoryVariableService>} */
        getElementServiceIfAvailable(win, 'story-variable', 'amp-story', '1.0')
      );
    }
    /**
     * @param {!Window} win
     * @return {?../extensions/amp-story/1.0/variable-service.AmpStoryVariableService}
     */

  }, {
    key: "storyVariableService",
    value: function storyVariableService(win) {
      return (
        /** @type {?../extensions/amp-story/1.0/variable-service.AmpStoryVariableService} */
        getExistingServiceOrNull(win, 'story-variable')
      );
    }
    /**
     * Version of the story store service depends on which version of amp-story
     * the publisher is loading. They all have the same implementation.
     * @param {!Window} win
     * @return {?Promise<?../extensions/amp-story/1.0/amp-story-store-service.AmpStoryStoreService>}
     */

  }, {
    key: "storyStoreServiceForOrNull",
    value: function storyStoreServiceForOrNull(win) {
      return (
        /** @type {!Promise<?../extensions/amp-story/1.0/amp-story-store-service.AmpStoryStoreService>} */
        getElementServiceIfAvailable(win, 'story-store', 'amp-story', '1.0')
      );
    }
    /**
     * @param {!Window} win
     * @return {?../extensions/amp-story/1.0/amp-story-store-service.AmpStoryStoreService}
     */

  }, {
    key: "storyStoreService",
    value: function storyStoreService(win) {
      return (
        /** @type {?../extensions/amp-story/1.0/amp-story-store-service.AmpStoryStoreService} */
        getExistingServiceOrNull(win, 'story-store')
      );
    }
    /**
     * @param {!Window} win
     * @return {?../extensions/amp-story/1.0/amp-story-media-query-service.AmpStoryMediaQueryService}
     */

  }, {
    key: "storyMediaQueryService",
    value: function storyMediaQueryService(win) {
      return (
        /** @type {?../extensions/amp-story/1.0/amp-story-media-query-service.AmpStoryMediaQueryService} */
        getExistingServiceOrNull(win, 'story-media-query')
      );
    }
    /**
     * Get promise with story request service
     * @param {!Window} win
     * @return {?Promise<?../extensions/amp-story/1.0/amp-story-request-service.AmpStoryRequestService>}
     */

  }, {
    key: "storyRequestServiceForOrNull",
    value: function storyRequestServiceForOrNull(win) {
      return (
        /** @type {!Promise<?../extensions/amp-story/1.0/amp-story-request-service.AmpStoryRequestService>} */
        getElementServiceIfAvailable(win, 'story-request', 'amp-story', '1.0')
      );
    }
    /**
     * @param {!Window} win
     * @return {?../extensions/amp-story/1.0/amp-story-request-service.AmpStoryRequestService}
     */

  }, {
    key: "storyRequestService",
    value: function storyRequestService(win) {
      return (
        /** @type {?../extensions/amp-story/1.0/amp-story-request-service.AmpStoryRequestService} */
        getExistingServiceOrNull(win, 'story-request')
      );
    }
    /**
     * @param {!Window} win
     * @return {?../extensions/amp-story/1.0/media-performance-metrics-service.MediaPerformanceMetricsService}
     */

  }, {
    key: "mediaPerformanceMetricsService",
    value: function mediaPerformanceMetricsService(win) {
      return (
        /** @type {?../extensions/amp-story/1.0/media-performance-metrics-service.MediaPerformanceMetricsService} */
        getExistingServiceOrNull(win, 'media-performance-metrics')
      );
    }
    /**
     * @param {!Element} el
     * @return {!Promise<./service/localization.LocalizationService>}
     */

  }, {
    key: "localizationServiceForOrNull",
    value: function localizationServiceForOrNull(el) {
      return (
        /** @type {!Promise<?./service/localization.LocalizationService>} */
        getServicePromiseForDoc(el, 'localization')
      );
    }
    /**
     * @param {!Element} element
     * @return {?./service/localization.LocalizationService}
     */

  }, {
    key: "localizationForDoc",
    value: function localizationForDoc(element) {
      return (
        /** @type {?./service/localization.LocalizationService} */
        getServiceForDocOrNull(element, 'localization')
      );
    }
    /**
     * TODO(#14357): Remove this when amp-story:0.1 is deprecated.
     * @param {!Window} win
     * @return {!Promise<?../extensions/amp-story/1.0/story-analytics.StoryAnalyticsService>}
     */

  }, {
    key: "storyAnalyticsServiceForOrNull",
    value: function storyAnalyticsServiceForOrNull(win) {
      return (
        /** @type {!Promise<?../extensions/amp-story/1.0/story-analytics.StoryAnalyticsService>} */
        getElementServiceIfAvailable(win, 'story-analytics', 'amp-story', '1.0', true)
      );
    }
    /**
     * @param {!Window} win
     * @return {?../extensions/amp-story/1.0/story-analytics.StoryAnalyticsService}
     */

  }, {
    key: "storyAnalyticsService",
    value: function storyAnalyticsService(win) {
      return (
        /** @type {?../extensions/amp-story/1.0/story-analytics.StoryAnalyticsService} */
        getExistingServiceOrNull(win, 'story-analytics')
      );
    }
    /**
     * @param {!Element|!ShadowRoot} element
     * @return {!Promise<!../extensions/amp-animation/0.1/web-animation-service.WebAnimationService>}
     */

  }, {
    key: "webAnimationServiceFor",
    value: function webAnimationServiceFor(element) {
      return (
        /** @type {!Promise<!../extensions/amp-animation/0.1/web-animation-service.WebAnimationService>} */
        getElementServiceForDoc(element, 'web-animation', 'amp-animation')
      );
    }
    /**
     * @param {!Element|!./service/ampdoc-impl.AmpDoc} elementOrAmpDoc
     * @return {!Promise<!./service/real-time-config/real-time-config-impl.RealTimeConfigManager>}
     */

  }, {
    key: "realTimeConfigForDoc",
    value: function realTimeConfigForDoc(elementOrAmpDoc) {
      return (
        /** @type {!Promise<!./service/real-time-config/real-time-config-impl.RealTimeConfigManager>} */
        getServicePromiseForDoc(elementOrAmpDoc, 'real-time-config')
      );
    }
    /**
     * @param {!Element|!./service/ampdoc-impl.AmpDoc} elementOrAmpDoc
     * @return {!Promise<!./service/storage-impl.Storage>}
     */

  }, {
    key: "storageForDoc",
    value: function storageForDoc(elementOrAmpDoc) {
      return (
        /** @type {!Promise<!./service/storage-impl.Storage>} */
        getServicePromiseForDoc(elementOrAmpDoc, 'storage')
      );
    }
    /**
     * @param {!Element|!./service/ampdoc-impl.AmpDoc} elementOrAmpDoc
     * @return {!Promise<!./service/storage-impl.Storage>}
     * TODO(dmanek): Add tests for this method.
     */

  }, {
    key: "storageForTopLevelDoc",
    value: function storageForTopLevelDoc(elementOrAmpDoc) {
      var thisAmpdoc = Services.ampdoc(elementOrAmpDoc);
      var ampdocService = Services.ampdocServiceFor(thisAmpdoc.win);
      var topAmpdoc = ampdocService.isSingleDoc() ? ampdocService.getSingleDoc() : null;
      // We need to verify that ampdocs are on the same origin, therefore
      // we compare the windows of both.
      var ampdoc = topAmpdoc && topAmpdoc.win == thisAmpdoc.win ? topAmpdoc : thisAmpdoc;
      return (
        /** @type {!Promise<!./service/storage-impl.Storage>} */
        getServicePromiseForDoc(ampdoc, 'storage')
      );
    }
    /**
     * @param {!Element|!./service/ampdoc-impl.AmpDoc} elementOrAmpDoc
     * @return {!./service/template-impl.Templates}
     */

  }, {
    key: "templatesForDoc",
    value: function templatesForDoc(elementOrAmpDoc) {
      return (
        /** @type {!./service/template-impl.Templates} */
        getServiceForDoc(elementOrAmpDoc, 'templates')
      );
    }
    /**
     * @param {!Window} window
     * @return {!./service/timer-impl.Timer}
     */

  }, {
    key: "timerFor",
    value: function timerFor(window) {
      // TODO(alabiaga): This will always return the top window's Timer service.
      return (
        /** @type {!./service/timer-impl.Timer} */
        getServiceInEmbedWin(window, 'timer')
      );
    }
    /**
     * @param {!Element|!ShadowRoot} element
     * @return {!./service/url-replacements-impl.UrlReplacements}
     */

  }, {
    key: "urlReplacementsForDoc",
    value: function urlReplacementsForDoc(element) {
      return (
        /** @type {!./service/url-replacements-impl.UrlReplacements} */
        getServiceForDocOrNull(element, 'url-replace')
      );
    }
    /**
     * @param {!Element|!ShadowRoot} element
     * @return {!Promise<!../extensions/amp-user-notification/0.1/amp-user-notification.UserNotificationManager>}
     */

  }, {
    key: "userNotificationManagerForDoc",
    value: function userNotificationManagerForDoc(element) {
      return (
        /** @type {!Promise<!../extensions/amp-user-notification/0.1/amp-user-notification.UserNotificationManager>} */
        getElementServiceForDoc(element, 'userNotificationManager', 'amp-user-notification')
      );
    }
    /**
     * Returns a promise for the consentPolicy Service or a promise for null if
     * the service is not available on the current page.
     * @param {!Element|!ShadowRoot} element
     * @return {!Promise<?../extensions/amp-consent/0.1/consent-policy-manager.ConsentPolicyManager>}
     */

  }, {
    key: "consentPolicyServiceForDocOrNull",
    value: function consentPolicyServiceForDocOrNull(element) {
      return (
        /** @type {!Promise<?../extensions/amp-consent/0.1/consent-policy-manager.ConsentPolicyManager>} */
        getElementServiceIfAvailableForDoc(element, 'consentPolicyManager', 'amp-consent')
      );
    }
    /**
     * Returns a promise for the geo service or a promise for null if
     * the service is not available on the current page.
     * @param {!Element|!ShadowRoot} element
     * @return {!Promise<?../extensions/amp-geo/0.1/amp-geo.GeoDef>}
     */

  }, {
    key: "geoForDocOrNull",
    value: function geoForDocOrNull(element) {
      return (
        /** @type {!Promise<?../extensions/amp-geo/0.1/amp-geo.GeoDef>} */
        getElementServiceIfAvailableForDoc(element, 'geo', 'amp-geo', true)
      );
    }
    /**
     * Unlike most service getters, passing `Node` is necessary for some FIE-scope
     * services since sometimes we only have the FIE Document for context.
     * @param {!Element|!ShadowRoot} element
     * @return {!./service/url-impl.Url}
     */

  }, {
    key: "urlForDoc",
    value: function urlForDoc(element) {
      return (
        /** @type {!./service/url-impl.Url} */
        getServiceForDocOrNull(element, 'url')
      );
    }
    /**
     * Returns a promise for the experiment variants or a promise for null if it
     * is not available on the current page.
     * @param {!Element|!ShadowRoot} element
     * @return {!Promise<?../extensions/amp-experiment/0.1/variant.Variants>}
     */

  }, {
    key: "variantsForDocOrNull",
    value: function variantsForDocOrNull(element) {
      return (
        /** @type {!Promise<?../extensions/amp-experiment/0.1/variant.Variants>} */
        getElementServiceIfAvailableForDoc(element, 'variant', 'amp-experiment', true)
      );
    }
    /**
     * @param {!Element|!./service/ampdoc-impl.AmpDoc} elementOrAmpDoc
     * @return {!./service/video-manager-impl.VideoManager}
     */

  }, {
    key: "videoManagerForDoc",
    value: function videoManagerForDoc(elementOrAmpDoc) {
      return (
        /** @type {!./service/video-manager-impl.VideoManager} */
        getServiceForDoc(elementOrAmpDoc, 'video-manager')
      );
    }
    /**
     * @param {!Element|!./service/ampdoc-impl.AmpDoc} elementOrAmpDoc
     * @return {!./service/viewer-interface.ViewerInterface}
     */

  }, {
    key: "viewerForDoc",
    value: function viewerForDoc(elementOrAmpDoc) {
      return (
        /** @type {!./service/viewer-interface.ViewerInterface} */
        getServiceForDoc(elementOrAmpDoc, 'viewer')
      );
    }
    /**
     * Returns promise for the viewer. This is an unusual case and necessary only
     * for services that need reference to the viewer before it has been
     * initialized. Most of the code, however, just should use `viewerForDoc`.
     * @param {!Element|!./service/ampdoc-impl.AmpDoc} elementOrAmpDoc
     * @return {!Promise<!./service/viewer-interface.ViewerInterface>}
     */

  }, {
    key: "viewerPromiseForDoc",
    value: function viewerPromiseForDoc(elementOrAmpDoc) {
      return (
        /** @type {!Promise<!./service/viewer-interface.ViewerInterface>} */
        getServicePromiseForDoc(elementOrAmpDoc, 'viewer')
      );
    }
    /**
     * @param {!Window} window
     * @return {!./service/vsync-impl.Vsync}
     */

  }, {
    key: "vsyncFor",
    value: function vsyncFor(window) {
      return (
        /** @type {!./service/vsync-impl.Vsync} */
        getService(window, 'vsync')
      );
    }
    /**
     * @param {!Element|!./service/ampdoc-impl.AmpDoc} elementOrAmpDoc
     * @return {!./service/viewport/viewport-interface.ViewportInterface}
     */

  }, {
    key: "viewportForDoc",
    value: function viewportForDoc(elementOrAmpDoc) {
      return (
        /** @type {!./service/viewport/viewport-interface.ViewportInterface} */
        getServiceForDoc(elementOrAmpDoc, 'viewport')
      );
    }
    /**
     * @param {!Window} window
     * @return {!./service/xhr-impl.Xhr}
     */

  }, {
    key: "xhrFor",
    value: function xhrFor(window) {
      return (
        /** @type {!./service/xhr-impl.Xhr} */
        getService(window, 'xhr')
      );
    }
    /**
     * @param {!Element|!./service/ampdoc-impl.AmpDoc} elementOrAmpDoc
     * @return {!Promise<../amp-cache-url/amp-cache-url.AmpCacheUrlService>}
     */

  }, {
    key: "cacheUrlServicePromiseForDoc",
    value: function cacheUrlServicePromiseForDoc(elementOrAmpDoc) {
      return (
        /** @type {!Promise<?../amp-cache-url/amp-cache-url.AmpCacheUrlService>} */
        getServicePromiseForDoc(elementOrAmpDoc, 'cache-url')
      );
    }
  }]);

  return Services;
}();
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImluZGV4LmpzIl0sIm5hbWVzIjpbImdldEVsZW1lbnRTZXJ2aWNlRm9yRG9jIiwiZ2V0RWxlbWVudFNlcnZpY2VJZkF2YWlsYWJsZSIsImdldEVsZW1lbnRTZXJ2aWNlSWZBdmFpbGFibGVGb3JEb2MiLCJnZXRFbGVtZW50U2VydmljZUlmQXZhaWxhYmxlRm9yRG9jSW5FbWJlZFNjb3BlIiwiZ2V0QW1wZG9jIiwiZ2V0RXhpc3RpbmdTZXJ2aWNlT3JOdWxsIiwiZ2V0U2VydmljZSIsImdldFNlcnZpY2VGb3JEb2MiLCJnZXRTZXJ2aWNlRm9yRG9jT3JOdWxsIiwiZ2V0U2VydmljZUluRW1iZWRXaW4iLCJnZXRTZXJ2aWNlUHJvbWlzZUZvckRvYyIsIlN1YnNjcmlwdGlvblNlcnZpY2UiLCJTZXJ2aWNlcyIsImVsZW1lbnQiLCJ3aW5kb3ciLCJub2RlT3JBbXBEb2MiLCJsb2FkQW5hbHl0aWNzIiwiYW1wZG9jIiwiZXh0ZW5zaW9uc0ZvciIsIndpbiIsImluc3RhbGxFeHRlbnNpb25Gb3JEb2MiLCJlbGVtZW50T3JBbXBEb2MiLCJnZXQiLCJlbCIsInRoaXNBbXBkb2MiLCJhbXBkb2NTZXJ2aWNlIiwiYW1wZG9jU2VydmljZUZvciIsInRvcEFtcGRvYyIsImlzU2luZ2xlRG9jIiwiZ2V0U2luZ2xlRG9jIl0sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFFQSxTQUNFQSx1QkFERixFQUVFQyw0QkFGRixFQUdFQyxrQ0FIRixFQUlFQyw4Q0FKRjtBQU1BLFNBQ0VDLFNBREYsRUFFRUMsd0JBRkYsRUFHRUMsVUFIRixFQUlFQyxnQkFKRixFQUtFQyxzQkFMRixFQU1FQyxvQkFORixFQU9FQyx1QkFQRjs7QUFVQTtBQUNBLE9BQU8sSUFBSUMsbUJBQUo7QUFFUCxXQUFhQyxRQUFiO0FBQUE7QUFBQTtBQUFBOztBQUFBO0FBQUE7QUFBQTtB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RDtBQUVEO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQXR1QkE7QUFBQTtBQUFBLFdBdXVCRSw2QkFBMkJBLGVBQTNCLEVBQTRDO0FBQzFDO0FBQU87QUFDTFgsUUFBQUEsdUJBQXVCLENBQUNXLGVBQUQsRUFBa0IsUUFBbEI7QUFEekI7QUFHRDtBQUVEO0FBQ0Y7QUFDQTtBQUNBOztBQWh2QkE7QUFBQTtBQUFBLFdBaXZCRSxrQkFBZ0JQLE1BQWhCLEVBQXdCO0FBQ3RCO0FBQU87QUFDTFIsUUFBQUEsVUFBVSxDQUFDUSxNQUFELEVBQVMsT0FBVDtBQURaO0FBR0Q7QUFFRDtBQUNGO0FBQ0E7QUFDQTs7QUExdkJBO0FBQUE7QUFBQSxXQTJ2QkUsd0JBQXNCTyxlQUF0QixFQUF1QztBQUNyQztBQUFPO0FBQ0xkLFFBQUFBLGdCQUFnQixDQUFDYyxlQUFELEVBQWtCLFVBQWxCO0FBRGxCO0FBR0Q7QUFFRDtBQUNGO0FBQ0E7QUFDQTs7QUFwd0JBO0FBQUE7QUFBQSxXQXF3QkUsZ0JBQWNQLE1BQWQsRUFBc0I7QUFDcEI7QUFBTztBQUF3Q1IsUUFBQUEsVUFBVSxDQUFDUSxNQUFELEVBQVMsS0FBVDtBQUF6RDtBQUNEO0FBRUQ7QUFDRjtBQUNBO0FBQ0E7O0FBNXdCQTtBQUFBO0FBQUEsV0E2d0JFLHNDQUFvQ08sZUFBcEMsRUFBcUQ7QUFDbkQ7QUFBTztBQUNMWCxRQUFBQSx1QkFBdUIsQ0FBQ1csZUFBRCxFQUFrQixXQUFsQjtBQUR6QjtBQUdEO0FBanhCSDs7QUFBQTtBQUFBIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDb3B5cmlnaHQgMjAxNyBUaGUgQU1QIEhUTUwgQXV0aG9ycy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xuICogeW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuICogWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG4gKlxuICogICAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcbiAqXG4gKiBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4gKiBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTLUlTXCIgQkFTSVMsXG4gKiBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cbiAqIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbiAqIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuICovXG5cbmltcG9ydCB7XG4gIGdldEVsZW1lbnRTZXJ2aWNlRm9yRG9jLFxuICBnZXRFbGVtZW50U2VydmljZUlmQXZhaWxhYmxlLFxuICBnZXRFbGVtZW50U2VydmljZUlmQXZhaWxhYmxlRm9yRG9jLFxuICBnZXRFbGVtZW50U2VydmljZUlmQXZhaWxhYmxlRm9yRG9jSW5FbWJlZFNjb3BlLFxufSBmcm9tICcuLi9lbGVtZW50LXNlcnZpY2UnO1xuaW1wb3J0IHtcbiAgZ2V0QW1wZG9jLFxuICBnZXRFeGlzdGluZ1NlcnZpY2VPck51bGwsXG4gIGdldFNlcnZpY2UsXG4gIGdldFNlcnZpY2VGb3JEb2MsXG4gIGdldFNlcnZpY2VGb3JEb2NPck51bGwsXG4gIGdldFNlcnZpY2VJbkVtYmVkV2luLFxuICBnZXRTZXJ2aWNlUHJvbWlzZUZvckRvYyxcbn0gZnJvbSAnLi4vc2VydmljZS1oZWxwZXJzJztcblxuLyoqIEB0eXBlZGVmIHshLi4vZXh0ZW5zaW9ucy9hbXAtc3Vic2NyaXB0aW9ucy8wLjEvYW1wLXN1YnNjcmlwdGlvbnMuU3Vic2NyaXB0aW9uU2VydmljZX0gKi9cbmV4cG9ydCBsZXQgU3Vic2NyaXB0aW9uU2VydmljZTtcblxuZXhwb3J0IGNsYXNzIFNlcnZpY2VzIHtcbiAgLyoqXG4gICAqIEhpbnQ6IEFkZCBleHRlbnNpb25zIGZvbGRlciBwYXRoIHRvIGNvbXBpbGUuanMgd2l0aFxuICAgKiB3YXJuaW5ncyBjYW5ub3QgZmluZCBtb2R1bGVzLlxuICAgKi9cblxuICAvKipcbiAgICogUmV0dXJucyBhIHByb21pc2UgZm9yIHRoZSBBY2Nlc3Mgc2VydmljZS5cbiAgICogQHBhcmFtIHshRWxlbWVudHwhU2hhZG93Um9vdH0gZWxlbWVudFxuICAgKiBAcmV0dXJuIHshUHJvbWlzZTwhLi4vZXh0ZW5zaW9ucy9hbXAtYWNjZXNzLzAuMS9hbXAtYWNjZXNzLkFjY2Vzc1NlcnZpY2U+fVxuICAgKi9cbiAgc3RhdGljIGFjY2Vzc1NlcnZpY2VGb3JEb2MoZWxlbWVudCkge1xuICAgIHJldHVybiAvKiogQHR5cGUgeyFQcm9taXNlPCEuLi9leHRlbnNpb25zL2FtcC1hY2Nlc3MvMC4xL2FtcC1hY2Nlc3MuQWNjZXNzU2VydmljZT59ICovIChcbiAgICAgIGdldEVsZW1lbnRTZXJ2aWNlRm9yRG9jKGVsZW1lbnQsICdhY2Nlc3MnLCAnYW1wLWFjY2VzcycpXG4gICAgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGEgcHJvbWlzZSBmb3IgdGhlIEFjY2VzcyBzZXJ2aWNlIG9yIGEgcHJvbWlzZSBmb3IgbnVsbCBpZiB0aGVcbiAgICogc2VydmljZSBpcyBub3QgYXZhaWxhYmxlIG9uIHRoZSBjdXJyZW50IHBhZ2UuXG4gICAqIEBwYXJhbSB7IUVsZW1lbnR8IVNoYWRvd1Jvb3R9IGVsZW1lbnRcbiAgICogQHJldHVybiB7IVByb21pc2U8Py4uL2V4dGVuc2lvbnMvYW1wLWFjY2Vzcy8wLjEvYW1wLWFjY2Vzcy5BY2Nlc3NTZXJ2aWNlPn1cbiAgICovXG4gIHN0YXRpYyBhY2Nlc3NTZXJ2aWNlRm9yRG9jT3JOdWxsKGVsZW1lbnQpIHtcbiAgICByZXR1cm4gLyoqIEB0eXBlIHshUHJvbWlzZTw/Li4vZXh0ZW5zaW9ucy9hbXAtYWNjZXNzLzAuMS9hbXAtYWNjZXNzLkFjY2Vzc1NlcnZpY2U+fSAqLyAoXG4gICAgICBnZXRFbGVtZW50U2VydmljZUlmQXZhaWxhYmxlRm9yRG9jKGVsZW1lbnQsICdhY2Nlc3MnLCAnYW1wLWFjY2VzcycpXG4gICAgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGEgcHJvbWlzZSBmb3IgdGhlIFN1YnNjcmlwdGlvbnMgc2VydmljZS5cbiAgICogQHBhcmFtIHshRWxlbWVudHwhU2hhZG93Um9vdH0gZWxlbWVudFxuICAgKiBAcmV0dXJuIHshUHJvbWlzZTwhU3Vic2NyaXB0aW9uU2VydmljZT59XG4gICAqL1xuICBzdGF0aWMgc3Vic2NyaXB0aW9uc1NlcnZpY2VGb3JEb2MoZWxlbWVudCkge1xuICAgIHJldHVybiAvKiogQHR5cGUgeyFQcm9taXNlPCFTdWJzY3JpcHRpb25TZXJ2aWNlPn0gKi8gKFxuICAgICAgZ2V0RWxlbWVudFNlcnZpY2VGb3JEb2MoZWxlbWVudCwgJ3N1YnNjcmlwdGlvbnMnLCAnYW1wLXN1YnNjcmlwdGlvbnMnKVxuICAgICk7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyBhIHByb21pc2UgZm9yIHRoZSBTdWJzY3JpcHRpb25zIHNlcnZpY2UuXG4gICAqIEBwYXJhbSB7IUVsZW1lbnR8IVNoYWRvd1Jvb3R9IGVsZW1lbnRcbiAgICogQHJldHVybiB7IVByb21pc2U8P1N1YnNjcmlwdGlvblNlcnZpY2U+fVxuICAgKi9cbiAgc3RhdGljIHN1YnNjcmlwdGlvbnNTZXJ2aWNlRm9yRG9jT3JOdWxsKGVsZW1lbnQpIHtcbiAgICByZXR1cm4gLyoqIEB0eXBlIHshUHJvbWlzZTw/U3Vic2NyaXB0aW9uU2VydmljZT59ICovIChcbiAgICAgIGdldEVsZW1lbnRTZXJ2aWNlSWZBdmFpbGFibGVGb3JEb2MoXG4gICAgICAgIGVsZW1lbnQsXG4gICAgICAgICdzdWJzY3JpcHRpb25zJyxcbiAgICAgICAgJ2FtcC1zdWJzY3JpcHRpb25zJ1xuICAgICAgKVxuICAgICk7XG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHshRWxlbWVudHwhU2hhZG93Um9vdH0gZWxlbWVudFxuICAgKiBAcmV0dXJuIHshLi9zZXJ2aWNlL2FjdGlvbi1pbXBsLkFjdGlvblNlcnZpY2V9XG4gICAqL1xuICBzdGF0aWMgYWN0aW9uU2VydmljZUZvckRvYyhlbGVtZW50KSB7XG4gICAgcmV0dXJuIC8qKiBAdHlwZSB7IS4vc2VydmljZS9hY3Rpb24taW1wbC5BY3Rpb25TZXJ2aWNlfSAqLyAoXG4gICAgICBnZXRTZXJ2aWNlRm9yRG9jT3JOdWxsKGVsZW1lbnQsICdhY3Rpb24nKVxuICAgICk7XG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHshRWxlbWVudHwhU2hhZG93Um9vdH0gZWxlbWVudFxuICAgKiBAcmV0dXJuIHshLi9zZXJ2aWNlL3N0YW5kYXJkLWFjdGlvbnMtaW1wbC5TdGFuZGFyZEFjdGlvbnN9XG4gICAqL1xuICBzdGF0aWMgc3RhbmRhcmRBY3Rpb25zRm9yRG9jKGVsZW1lbnQpIHtcbiAgICByZXR1cm4gLyoqIEB0eXBlIHshLi9zZXJ2aWNlL3N0YW5kYXJkLWFjdGlvbnMtaW1wbC5TdGFuZGFyZEFjdGlvbnN9ICovIChcbiAgICAgIGdldFNlcnZpY2VGb3JEb2NPck51bGwoZWxlbWVudCwgJ3N0YW5kYXJkLWFjdGlvbnMnKVxuICAgICk7XG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHshRWxlbWVudHwhU2hhZG93Um9vdH0gZWxlbWVudFxuICAgKiBAcmV0dXJuIHshUHJvbWlzZTwhLi4vZXh0ZW5zaW9ucy9hbXAtYW5hbHl0aWNzLzAuMS9hY3Rpdml0eS1pbXBsLkFjdGl2aXR5Pn1cbiAgICovXG4gIHN0YXRpYyBhY3Rpdml0eUZvckRvYyhlbGVtZW50KSB7XG4gICAgcmV0dXJuIC8qKiBAdHlwZSB7IVByb21pc2U8IS4uL2V4dGVuc2lvbnMvYW1wLWFuYWx5dGljcy8wLjEvYWN0aXZpdHktaW1wbC5BY3Rpdml0eT59ICovIChcbiAgICAgIGdldEVsZW1lbnRTZXJ2aWNlRm9yRG9jKGVsZW1lbnQsICdhY3Rpdml0eScsICdhbXAtYW5hbHl0aWNzJylcbiAgICApO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIGdsb2JhbCBpbnN0YW5jZSBvZiB0aGUgYEFtcERvY1NlcnZpY2VgIHNlcnZpY2UgdGhhdCBjYW4gYmVcbiAgICogdXNlZCB0byByZXNvbHZlIGFuIGFtcGRvYyBmb3IgYW55IG5vZGU6IGVpdGhlciBpbiB0aGUgc2luZ2xlLWRvYyBvclxuICAgKiBzaGFkb3ctZG9jIGVudmlyb25tZW50LlxuICAgKiBAcGFyYW0geyFXaW5kb3d9IHdpbmRvd1xuICAgKiBAcmV0dXJuIHshLi9zZXJ2aWNlL2FtcGRvYy1pbXBsLkFtcERvY1NlcnZpY2V9XG4gICAqL1xuICBzdGF0aWMgYW1wZG9jU2VydmljZUZvcih3aW5kb3cpIHtcbiAgICByZXR1cm4gLyoqIEB0eXBlIHshLi9zZXJ2aWNlL2FtcGRvYy1pbXBsLkFtcERvY1NlcnZpY2V9ICovIChcbiAgICAgIGdldFNlcnZpY2Uod2luZG93LCAnYW1wZG9jJylcbiAgICApO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIEFtcERvYyBmb3IgdGhlIHNwZWNpZmllZCBjb250ZXh0IG5vZGUuXG4gICAqIEBwYXJhbSB7IU5vZGV8IS4vc2VydmljZS9hbXBkb2MtaW1wbC5BbXBEb2N9IG5vZGVPckFtcERvY1xuICAgKiBAcmV0dXJuIHshLi9zZXJ2aWNlL2FtcGRvYy1pbXBsLkFtcERvY31cbiAgICovXG4gIHN0YXRpYyBhbXBkb2Mobm9kZU9yQW1wRG9jKSB7XG4gICAgcmV0dXJuIGdldEFtcGRvYyhub2RlT3JBbXBEb2MpO1xuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7IUVsZW1lbnR8IVNoYWRvd1Jvb3R9IGVsZW1lbnRcbiAgICogQHBhcmFtIHtib29sZWFuPX0gbG9hZEFuYWx5dGljc1xuICAgKiBAcmV0dXJuIHshUHJvbWlzZTwhLi4vZXh0ZW5zaW9ucy9hbXAtYW5hbHl0aWNzLzAuMS9pbnN0cnVtZW50YXRpb24uSW5zdHJ1bWVudGF0aW9uU2VydmljZT59XG4gICAqL1xuICBzdGF0aWMgYW5hbHl0aWNzRm9yRG9jKGVsZW1lbnQsIGxvYWRBbmFseXRpY3MgPSBmYWxzZSkge1xuICAgIGlmIChsb2FkQW5hbHl0aWNzKSB7XG4gICAgICAvLyBHZXQgRXh0ZW5zaW9ucyBzZXJ2aWNlIGFuZCBmb3JjZSBsb2FkIGFuYWx5dGljcyBleHRlbnNpb24uXG4gICAgICBjb25zdCBhbXBkb2MgPSBnZXRBbXBkb2MoZWxlbWVudCk7XG4gICAgICBTZXJ2aWNlcy5leHRlbnNpb25zRm9yKGFtcGRvYy53aW4pLi8qT0sqLyBpbnN0YWxsRXh0ZW5zaW9uRm9yRG9jKFxuICAgICAgICBhbXBkb2MsXG4gICAgICAgICdhbXAtYW5hbHl0aWNzJ1xuICAgICAgKTtcbiAgICB9XG4gICAgcmV0dXJuIC8qKiBAdHlwZSB7IVByb21pc2U8IS4uL2V4dGVuc2lvbnMvYW1wLWFuYWx5dGljcy8wLjEvaW5zdHJ1bWVudGF0aW9uLkluc3RydW1lbnRhdGlvblNlcnZpY2U+fSAqLyAoXG4gICAgICBnZXRFbGVtZW50U2VydmljZUZvckRvYyhcbiAgICAgICAgZWxlbWVudCxcbiAgICAgICAgJ2FtcC1hbmFseXRpY3MtaW5zdHJ1bWVudGF0aW9uJyxcbiAgICAgICAgJ2FtcC1hbmFseXRpY3MnXG4gICAgICApXG4gICAgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0geyFFbGVtZW50fCFTaGFkb3dSb290fSBlbGVtZW50XG4gICAqIEByZXR1cm4geyFQcm9taXNlPD8uLi9leHRlbnNpb25zL2FtcC1hbmFseXRpY3MvMC4xL2luc3RydW1lbnRhdGlvbi5JbnN0cnVtZW50YXRpb25TZXJ2aWNlPn1cbiAgICovXG4gIHN0YXRpYyBhbmFseXRpY3NGb3JEb2NPck51bGwoZWxlbWVudCkge1xuICAgIHJldHVybiAvKiogQHR5cGUgeyFQcm9taXNlPD8uLi9leHRlbnNpb25zL2FtcC1hbmFseXRpY3MvMC4xL2luc3RydW1lbnRhdGlvbi5JbnN0cnVtZW50YXRpb25TZXJ2aWNlPn0gKi8gKFxuICAgICAgZ2V0RWxlbWVudFNlcnZpY2VJZkF2YWlsYWJsZUZvckRvYyhcbiAgICAgICAgZWxlbWVudCxcbiAgICAgICAgJ2FtcC1hbmFseXRpY3MtaW5zdHJ1bWVudGF0aW9uJyxcbiAgICAgICAgJ2FtcC1hbmFseXRpY3MnXG4gICAgICApXG4gICAgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0geyFXaW5kb3d9IHdpbmRvd1xuICAgKiBAcmV0dXJuIHshLi9zZXJ2aWNlL2JhdGNoZWQteGhyLWltcGwuQmF0Y2hlZFhocn1cbiAgICovXG4gIHN0YXRpYyBiYXRjaGVkWGhyRm9yKHdpbmRvdykge1xuICAgIHJldHVybiAvKiogQHR5cGUgeyEuL3NlcnZpY2UvYmF0Y2hlZC14aHItaW1wbC5CYXRjaGVkWGhyfSAqLyAoXG4gICAgICBnZXRTZXJ2aWNlKHdpbmRvdywgJ2JhdGNoZWQteGhyJylcbiAgICApO1xuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7IUVsZW1lbnR8IVNoYWRvd1Jvb3R9IGVsZW1lbnRcbiAgICogQHJldHVybiB7IVByb21pc2U8Py4uL2V4dGVuc2lvbnMvYW1wLWJpbmQvMC4xL2JpbmQtaW1wbC5CaW5kPn1cbiAgICovXG4gIHN0YXRpYyBiaW5kRm9yRG9jT3JOdWxsKGVsZW1lbnQpIHtcbiAgICByZXR1cm4gLyoqIEB0eXBlIHshUHJvbWlzZTw/Li4vZXh0ZW5zaW9ucy9hbXAtYmluZC8wLjEvYmluZC1pbXBsLkJpbmQ+fSAqLyAoXG4gICAgICBnZXRFbGVtZW50U2VydmljZUlmQXZhaWxhYmxlRm9yRG9jSW5FbWJlZFNjb3BlKFxuICAgICAgICBlbGVtZW50LFxuICAgICAgICAnYmluZCcsXG4gICAgICAgICdhbXAtYmluZCdcbiAgICAgIClcbiAgICApO1xuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7IUVsZW1lbnR8IVNoYWRvd1Jvb3R9IGVsZW1lbnRcbiAgICogQHJldHVybiB7IVByb21pc2U8Py4uL2V4dGVuc2lvbnMvYW1wLXNjcmlwdC8wLjEvYW1wLXNjcmlwdC5BbXBTY3JpcHRTZXJ2aWNlPn1cbiAgICovXG4gIHN0YXRpYyBzY3JpcHRGb3JEb2NPck51bGwoZWxlbWVudCkge1xuICAgIHJldHVybiAvKiogQHR5cGUgeyFQcm9taXNlPD8uLi9leHRlbnNpb25zL2FtcC1zY3JpcHQvMC4xL2FtcC1zY3JpcHQuQW1wU2NyaXB0U2VydmljZT59ICovIChcbiAgICAgIGdldEVsZW1lbnRTZXJ2aWNlSWZBdmFpbGFibGVGb3JEb2NJbkVtYmVkU2NvcGUoXG4gICAgICAgIGVsZW1lbnQsXG4gICAgICAgICdhbXAtc2NyaXB0JyxcbiAgICAgICAgJ2FtcC1zY3JpcHQnXG4gICAgICApXG4gICAgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0geyFFbGVtZW50fCFTaGFkb3dSb290fCEuL3NlcnZpY2UvYW1wZG9jLWltcGwuQW1wRG9jfSBlbGVtZW50T3JBbXBEb2NcbiAgICogQHJldHVybiB7IVByb21pc2U8IS4vc2VydmljZS9jaWQtaW1wbC5DaWREZWY+fVxuICAgKi9cbiAgc3RhdGljIGNpZEZvckRvYyhlbGVtZW50T3JBbXBEb2MpIHtcbiAgICByZXR1cm4gLyoqIEB0eXBlIHshUHJvbWlzZTwhLi9zZXJ2aWNlL2NpZC1pbXBsLkNpZERlZj59ICovIChcbiAgICAgIGdldFNlcnZpY2VQcm9taXNlRm9yRG9jKGVsZW1lbnRPckFtcERvYywgJ2NpZCcpXG4gICAgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0geyFFbGVtZW50fCEuL3NlcnZpY2UvYW1wZG9jLWltcGwuQW1wRG9jfSBlbGVtZW50T3JBbXBEb2NcbiAgICogQHJldHVybiB7IS4vc2VydmljZS9uYXZpZ2F0aW9uLk5hdmlnYXRpb259XG4gICAqL1xuICBzdGF0aWMgbmF2aWdhdGlvbkZvckRvYyhlbGVtZW50T3JBbXBEb2MpIHtcbiAgICByZXR1cm4gLyoqIEB0eXBlIHshLi9zZXJ2aWNlL25hdmlnYXRpb24uTmF2aWdhdGlvbn0gKi8gKFxuICAgICAgZ2V0U2VydmljZUZvckRvYyhlbGVtZW50T3JBbXBEb2MsICduYXZpZ2F0aW9uJylcbiAgICApO1xuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7IUVsZW1lbnR8IVNoYWRvd1Jvb3R9IGVsZW1lbnRcbiAgICogQHJldHVybiB7IVByb21pc2U8IS4uL2V4dGVuc2lvbnMvYW1wLWxvYWRlci8wLjEvYW1wLWxvYWRlci5Mb2FkZXJTZXJ2aWNlPn1cbiAgICovXG4gIHN0YXRpYyBsb2FkZXJTZXJ2aWNlRm9yRG9jKGVsZW1lbnQpIHtcbiAgICByZXR1cm4gLyoqIEB0eXBlIHshUHJvbWlzZTwhLi4vZXh0ZW5zaW9ucy9hbXAtbG9hZGVyLzAuMS9hbXAtbG9hZGVyLkxvYWRlclNlcnZpY2U+fSAqLyAoXG4gICAgICBnZXRFbGVtZW50U2VydmljZUZvckRvYyhlbGVtZW50LCAnbG9hZGVyJywgJ2FtcC1sb2FkZXInKVxuICAgICk7XG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHshRWxlbWVudHwhU2hhZG93Um9vdH0gZWxlbWVudFxuICAgKiBAcmV0dXJuIHshUHJvbWlzZTwhLi4vZXh0ZW5zaW9ucy9hbXAtc3RhbmRhbG9uZS8wLjEvYW1wLXN0YW5kYWxvbmUuU3RhbmRhbG9uZVNlcnZpY2U+fVxuICAgKi9cbiAgc3RhdGljIHN0YW5kYWxvbmVTZXJ2aWNlRm9yRG9jKGVsZW1lbnQpIHtcbiAgICByZXR1cm4gLyoqIEB0eXBlIHshUHJvbWlzZTwhLi4vZXh0ZW5zaW9ucy9hbXAtc3RhbmRhbG9uZS8wLjEvYW1wLXN0YW5kYWxvbmUuU3RhbmRhbG9uZVNlcnZpY2U+fSAqLyAoXG4gICAgICBnZXRFbGVtZW50U2VydmljZUZvckRvYyhlbGVtZW50LCAnc3RhbmRhbG9uZScsICdhbXAtc3RhbmRhbG9uZScpXG4gICAgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0geyFXaW5kb3d9IHdpbmRvd1xuICAgKiBAcmV0dXJuIHshLi9zZXJ2aWNlL2NyeXB0by1pbXBsLkNyeXB0b31cbiAgICovXG4gIHN0YXRpYyBjcnlwdG9Gb3Iod2luZG93KSB7XG4gICAgcmV0dXJuIC8qKiBAdHlwZSB7IS4vc2VydmljZS9jcnlwdG8taW1wbC5DcnlwdG99ICovIChcbiAgICAgIGdldFNlcnZpY2Uod2luZG93LCAnY3J5cHRvJylcbiAgICApO1xuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7IUVsZW1lbnR8IS4vc2VydmljZS9hbXBkb2MtaW1wbC5BbXBEb2N9IGVsZW1lbnRPckFtcERvY1xuICAgKiBAcmV0dXJuIHshLi9zZXJ2aWNlL2RvY3VtZW50LWluZm8taW1wbC5Eb2N1bWVudEluZm9EZWZ9IEluZm8gYWJvdXQgdGhlIGRvY1xuICAgKi9cbiAgc3RhdGljIGRvY3VtZW50SW5mb0ZvckRvYyhlbGVtZW50T3JBbXBEb2MpIHtcbiAgICByZXR1cm4gLyoqIEB0eXBlIHshLi9zZXJ2aWNlL2RvY3VtZW50LWluZm8taW1wbC5Eb2NJbmZvfSAqLyAoXG4gICAgICBnZXRTZXJ2aWNlRm9yRG9jKGVsZW1lbnRPckFtcERvYywgJ2RvY3VtZW50SW5mbycpXG4gICAgKS5nZXQoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0geyFXaW5kb3d9IHdpbmRvd1xuICAgKiBAcmV0dXJuIHshLi9zZXJ2aWNlL2V4dGVuc2lvbnMtaW1wbC5FeHRlbnNpb25zfVxuICAgKi9cbiAgc3RhdGljIGV4dGVuc2lvbnNGb3Iod2luZG93KSB7XG4gICAgcmV0dXJuIC8qKiBAdHlwZSB7IS4vc2VydmljZS9leHRlbnNpb25zLWltcGwuRXh0ZW5zaW9uc30gKi8gKFxuICAgICAgZ2V0U2VydmljZSh3aW5kb3csICdleHRlbnNpb25zJylcbiAgICApO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgYSBzZXJ2aWNlIHRvIHJlZ2lzdGVyIGNhbGxiYWNrcyB3ZSB3aXNoIHRvIGV4ZWN1dGUgd2hlbiBhblxuICAgKiBhbXAtZm9ybSBpcyBzdWJtaXR0ZWQuXG4gICAqIEBwYXJhbSB7IUVsZW1lbnR8IS4vc2VydmljZS9hbXBkb2MtaW1wbC5BbXBEb2N9IGVsZW1lbnRPckFtcERvY1xuICAgKiBAcmV0dXJuIHshUHJvbWlzZTwuLi9leHRlbnNpb25zL2FtcC1mb3JtLzAuMS9mb3JtLXN1Ym1pdC1zZXJ2aWNlLkZvcm1TdWJtaXRTZXJ2aWNlPn1cbiAgICovXG4gIHN0YXRpYyBmb3JtU3VibWl0Rm9yRG9jKGVsZW1lbnRPckFtcERvYykge1xuICAgIHJldHVybiAvKiogQHR5cGUgeyFQcm9taXNlPC4uL2V4dGVuc2lvbnMvYW1wLWZvcm0vMC4xL2Zvcm0tc3VibWl0LXNlcnZpY2UuRm9ybVN1Ym1pdFNlcnZpY2U+fSAqLyAoXG4gICAgICBnZXRTZXJ2aWNlUHJvbWlzZUZvckRvYyhlbGVtZW50T3JBbXBEb2MsICdmb3JtLXN1Ym1pdC1zZXJ2aWNlJylcbiAgICApO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgc2VydmljZSB0byBsaXN0ZW4gZm9yIGBoaWRkZW5gIGF0dHJpYnV0ZSBtdXRhdGlvbnMuXG4gICAqIEBwYXJhbSB7IUVsZW1lbnR8IVNoYWRvd1Jvb3R9IGVsZW1lbnRcbiAgICogQHJldHVybiB7IS4vc2VydmljZS9oaWRkZW4tb2JzZXJ2ZXItaW1wbC5IaWRkZW5PYnNlcnZlcn1cbiAgICovXG4gIHN0YXRpYyBoaWRkZW5PYnNlcnZlckZvckRvYyhlbGVtZW50KSB7XG4gICAgcmV0dXJuIC8qKiBAdHlwZSB7IS4vc2VydmljZS9oaWRkZW4tb2JzZXJ2ZXItaW1wbC5IaWRkZW5PYnNlcnZlcn0gKi8gKFxuICAgICAgZ2V0U2VydmljZUZvckRvY09yTnVsbChlbGVtZW50LCAnaGlkZGVuLW9ic2VydmVyJylcbiAgICApO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgc2VydmljZSBpbXBsZW1lbnRlZCBpbiBzZXJ2aWNlL2hpc3RvcnktaW1wbC5cbiAgICogQHBhcmFtIHshRWxlbWVudHwhLi9zZXJ2aWNlL2FtcGRvYy1pbXBsLkFtcERvY30gZWxlbWVudE9yQW1wRG9jXG4gICAqIEByZXR1cm4geyEuL3NlcnZpY2UvaGlzdG9yeS1pbXBsLkhpc3Rvcnl9XG4gICAqL1xuICBzdGF0aWMgaGlzdG9yeUZvckRvYyhlbGVtZW50T3JBbXBEb2MpIHtcbiAgICByZXR1cm4gLyoqIEB0eXBlIHshLi9zZXJ2aWNlL2hpc3RvcnktaW1wbC5IaXN0b3J5fSAqLyAoXG4gICAgICBnZXRTZXJ2aWNlRm9yRG9jKGVsZW1lbnRPckFtcERvYywgJ2hpc3RvcnknKVxuICAgICk7XG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHshV2luZG93fSB3aW5cbiAgICogQHJldHVybiB7IS4vaW5wdXQuSW5wdXR9XG4gICAqL1xuICBzdGF0aWMgaW5wdXRGb3Iod2luKSB7XG4gICAgcmV0dXJuIGdldFNlcnZpY2Uod2luLCAnaW5wdXQnKTtcbiAgfVxuXG4gIC8qKnNcbiAgICogUmV0dXJucyBhIHByb21pc2UgZm9yIHRoZSBJbnB1dG1hc2sgc2VydmljZS5cbiAgICogQHBhcmFtIHshRWxlbWVudHwhU2hhZG93Um9vdH0gZWxlbWVudFxuICAgKiBAcmV0dXJuIHshUHJvbWlzZTw/Li4vZXh0ZW5zaW9ucy9hbXAtaW5wdXRtYXNrLzAuMS9hbXAtaW5wdXRtYXNrLkFtcElucHV0bWFza1NlcnZpY2U+fVxuICAgKi9cbiAgc3RhdGljIGlucHV0bWFza1NlcnZpY2VGb3JEb2NPck51bGwoZWxlbWVudCkge1xuICAgIHJldHVybiAvKiogQHR5cGUgeyFQcm9taXNlPD8uLi9leHRlbnNpb25zL2FtcC1pbnB1dG1hc2svMC4xL2FtcC1pbnB1dG1hc2suQW1wSW5wdXRtYXNrU2VydmljZT59ICovIChcbiAgICAgIGdldEVsZW1lbnRTZXJ2aWNlSWZBdmFpbGFibGVGb3JEb2MoZWxlbWVudCwgJ2lucHV0bWFzaycsICdhbXAtaW5wdXRtYXNrJylcbiAgICApO1xuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7IUVsZW1lbnR8IS4vc2VydmljZS9hbXBkb2MtaW1wbC5BbXBEb2N9IGVsZW1lbnRPckFtcERvY1xuICAgKiBAcmV0dXJuIHs/Li9zZXJ2aWNlL2xvYWRpbmctaW5kaWNhdG9yLkxvYWRpbmdJbmRpY2F0b3JJbXBsfVxuICAgKi9cbiAgc3RhdGljIGxvYWRpbmdJbmRpY2F0b3JPck51bGwoZWxlbWVudE9yQW1wRG9jKSB7XG4gICAgcmV0dXJuIC8qKiBAdHlwZSB7Py4vc2VydmljZS9sb2FkaW5nLWluZGljYXRvci5Mb2FkaW5nSW5kaWNhdG9ySW1wbH0gKi8gKFxuICAgICAgZ2V0U2VydmljZUZvckRvY09yTnVsbChlbGVtZW50T3JBbXBEb2MsICdsb2FkaW5nSW5kaWNhdG9yJylcbiAgICApO1xuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7IUVsZW1lbnR8IS4vc2VydmljZS9hbXBkb2MtaW1wbC5BbXBEb2N9IGVsZW1lbnRPckFtcERvY1xuICAgKiBAcmV0dXJuIHshLi4vZXh0ZW5zaW9ucy9hbXAtbmV4dC1wYWdlLzEuMC9zZXJ2aWNlLk5leHRQYWdlU2VydmljZX1cbiAgICovXG4gIHN0YXRpYyBuZXh0UGFnZVNlcnZpY2VGb3JEb2MoZWxlbWVudE9yQW1wRG9jKSB7XG4gICAgcmV0dXJuIC8qKiBAdHlwZSB7IS4uL2V4dGVuc2lvbnMvYW1wLW5leHQtcGFnZS8xLjAvc2VydmljZS5OZXh0UGFnZVNlcnZpY2V9ICovIChcbiAgICAgIGdldFNlcnZpY2VGb3JEb2MoZWxlbWVudE9yQW1wRG9jLCAnbmV4dC1wYWdlJylcbiAgICApO1xuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7IUVsZW1lbnR8IS4vc2VydmljZS9hbXBkb2MtaW1wbC5BbXBEb2N9IGVsZW1lbnRPckFtcERvY1xuICAgKiBAcmV0dXJuIHshLi9zZXJ2aWNlL211dGF0b3ItaW50ZXJmYWNlLk11dGF0b3JJbnRlcmZhY2V9XG4gICAqL1xuICBzdGF0aWMgbXV0YXRvckZvckRvYyhlbGVtZW50T3JBbXBEb2MpIHtcbiAgICByZXR1cm4gLyoqIEB0eXBlIHshLi9zZXJ2aWNlL211dGF0b3ItaW50ZXJmYWNlLk11dGF0b3JJbnRlcmZhY2V9ICovIChcbiAgICAgIGdldFNlcnZpY2VGb3JEb2MoZWxlbWVudE9yQW1wRG9jLCAnbXV0YXRvcicpXG4gICAgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0geyFFbGVtZW50fCEuL3NlcnZpY2UvYW1wZG9jLWltcGwuQW1wRG9jfSBlbGVtZW50T3JBbXBEb2NcbiAgICogQHJldHVybiB7IS4vc2VydmljZS9vd25lcnMtaW50ZXJmYWNlLk93bmVyc0ludGVyZmFjZX1cbiAgICovXG4gIHN0YXRpYyBvd25lcnNGb3JEb2MoZWxlbWVudE9yQW1wRG9jKSB7XG4gICAgcmV0dXJuIC8qKiBAdHlwZSB7IS4vc2VydmljZS9vd25lcnMtaW50ZXJmYWNlLk93bmVyc0ludGVyZmFjZX0gKi8gKFxuICAgICAgZ2V0U2VydmljZUZvckRvYyhlbGVtZW50T3JBbXBEb2MsICdvd25lcnMnKVxuICAgICk7XG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHshV2luZG93fSB3aW5kb3dcbiAgICogQHJldHVybiB7IS4vc2VydmljZS9wZXJmb3JtYW5jZS1pbXBsLlBlcmZvcm1hbmNlfVxuICAgKi9cbiAgc3RhdGljIHBlcmZvcm1hbmNlRm9yKHdpbmRvdykge1xuICAgIHJldHVybiAvKiogQHR5cGUgeyEuL3NlcnZpY2UvcGVyZm9ybWFuY2UtaW1wbC5QZXJmb3JtYW5jZX0qLyAoXG4gICAgICBnZXRTZXJ2aWNlKHdpbmRvdywgJ3BlcmZvcm1hbmNlJylcbiAgICApO1xuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7IVdpbmRvd30gd2luZG93XG4gICAqIEByZXR1cm4geyEuL3NlcnZpY2UvcGVyZm9ybWFuY2UtaW1wbC5QZXJmb3JtYW5jZX1cbiAgICovXG4gIHN0YXRpYyBwZXJmb3JtYW5jZUZvck9yTnVsbCh3aW5kb3cpIHtcbiAgICByZXR1cm4gLyoqIEB0eXBlIHshLi9zZXJ2aWNlL3BlcmZvcm1hbmNlLWltcGwuUGVyZm9ybWFuY2V9Ki8gKFxuICAgICAgZ2V0RXhpc3RpbmdTZXJ2aWNlT3JOdWxsKHdpbmRvdywgJ3BlcmZvcm1hbmNlJylcbiAgICApO1xuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7IVdpbmRvd30gd2luZG93XG4gICAqIEByZXR1cm4geyEuL3NlcnZpY2UvcGxhdGZvcm0taW1wbC5QbGF0Zm9ybX1cbiAgICovXG4gIHN0YXRpYyBwbGF0Zm9ybUZvcih3aW5kb3cpIHtcbiAgICByZXR1cm4gLyoqIEB0eXBlIHshLi9zZXJ2aWNlL3BsYXRmb3JtLWltcGwuUGxhdGZvcm19ICovIChcbiAgICAgIGdldFNlcnZpY2Uod2luZG93LCAncGxhdGZvcm0nKVxuICAgICk7XG4gIH1cblxuICAvKipcbiAgICogTm90IGluc3RhbGxlZCBieSBkZWZhdWx0OyBtdXN0IGJlIGluc3RhbGxlZCBpbiBleHRlbnNpb24gY29kZSBiZWZvcmUgdXNlLlxuICAgKiBAcGFyYW0geyFFbGVtZW50fCFTaGFkb3dSb290fSBlbGVtZW50XG4gICAqIEByZXR1cm4geyEuL3NlcnZpY2UvcG9zaXRpb24tb2JzZXJ2ZXIvcG9zaXRpb24tb2JzZXJ2ZXItaW1wbC5Qb3NpdGlvbk9ic2VydmVyfVxuICAgKiBAdGhyb3dzIElmIHRoZSBzZXJ2aWNlIGlzIG5vdCBpbnN0YWxsZWQuXG4gICAqL1xuICBzdGF0aWMgcG9zaXRpb25PYnNlcnZlckZvckRvYyhlbGVtZW50KSB7XG4gICAgcmV0dXJuIC8qKiBAdHlwZSB7IS4vc2VydmljZS9wb3NpdGlvbi1vYnNlcnZlci9wb3NpdGlvbi1vYnNlcnZlci1pbXBsLlBvc2l0aW9uT2JzZXJ2ZXJ9ICovIChcbiAgICAgIGdldFNlcnZpY2VGb3JEb2MoZWxlbWVudCwgJ3Bvc2l0aW9uLW9ic2VydmVyJylcbiAgICApO1xuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7IVdpbmRvd30gd2luZG93XG4gICAqIEByZXR1cm4geyEuL3ByZWNvbm5lY3QuUHJlY29ubmVjdFNlcnZpY2V9XG4gICAqL1xuICBzdGF0aWMgcHJlY29ubmVjdEZvcih3aW5kb3cpIHtcbiAgICByZXR1cm4gZ2V0U2VydmljZSh3aW5kb3csICdwcmVjb25uZWN0Jyk7XG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHshRWxlbWVudHwhLi9zZXJ2aWNlL2FtcGRvYy1pbXBsLkFtcERvY30gZWxlbWVudE9yQW1wRG9jXG4gICAqIEByZXR1cm4geyEuL3NlcnZpY2UvcmVzb3VyY2VzLWludGVyZmFjZS5SZXNvdXJjZXNJbnRlcmZhY2V9XG4gICAqL1xuICBzdGF0aWMgcmVzb3VyY2VzRm9yRG9jKGVsZW1lbnRPckFtcERvYykge1xuICAgIHJldHVybiAvKiogQHR5cGUgeyEuL3NlcnZpY2UvcmVzb3VyY2VzLWludGVyZmFjZS5SZXNvdXJjZXNJbnRlcmZhY2V9ICovIChcbiAgICAgIGdldFNlcnZpY2VGb3JEb2MoZWxlbWVudE9yQW1wRG9jLCAncmVzb3VyY2VzJylcbiAgICApO1xuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7IUVsZW1lbnR8IS4vc2VydmljZS9hbXBkb2MtaW1wbC5BbXBEb2N9IGVsZW1lbnRPckFtcERvY1xuICAgKiBAcmV0dXJuIHshUHJvbWlzZTwhLi9zZXJ2aWNlL3Jlc291cmNlcy1pbnRlcmZhY2UuUmVzb3VyY2VzSW50ZXJmYWNlPn1cbiAgICovXG4gIHN0YXRpYyByZXNvdXJjZXNQcm9taXNlRm9yRG9jKGVsZW1lbnRPckFtcERvYykge1xuICAgIHJldHVybiAvKiogQHR5cGUgeyFQcm9taXNlPCEuL3NlcnZpY2UvcmVzb3VyY2VzLWludGVyZmFjZS5SZXNvdXJjZXNJbnRlcmZhY2U+fSAqLyAoXG4gICAgICBnZXRTZXJ2aWNlUHJvbWlzZUZvckRvYyhlbGVtZW50T3JBbXBEb2MsICdyZXNvdXJjZXMnKVxuICAgICk7XG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHshV2luZG93fSB3aW5cbiAgICogQHJldHVybiB7P1Byb21pc2U8Py4uL2V4dGVuc2lvbnMvYW1wLXN0b3J5LzEuMC92YXJpYWJsZS1zZXJ2aWNlLkFtcFN0b3J5VmFyaWFibGVTZXJ2aWNlPn1cbiAgICovXG4gIHN0YXRpYyBzdG9yeVZhcmlhYmxlU2VydmljZUZvck9yTnVsbCh3aW4pIHtcbiAgICByZXR1cm4gKFxuICAgICAgLyoqIEB0eXBlIHshUHJvbWlzZTw/Li4vZXh0ZW5zaW9ucy9hbXAtc3RvcnkvMS4wL3ZhcmlhYmxlLXNlcnZpY2UuQW1wU3RvcnlWYXJpYWJsZVNlcnZpY2U+fSAqL1xuICAgICAgKGdldEVsZW1lbnRTZXJ2aWNlSWZBdmFpbGFibGUod2luLCAnc3RvcnktdmFyaWFibGUnLCAnYW1wLXN0b3J5JywgJzEuMCcpKVxuICAgICk7XG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHshV2luZG93fSB3aW5cbiAgICogQHJldHVybiB7Py4uL2V4dGVuc2lvbnMvYW1wLXN0b3J5LzEuMC92YXJpYWJsZS1zZXJ2aWNlLkFtcFN0b3J5VmFyaWFibGVTZXJ2aWNlfVxuICAgKi9cbiAgc3RhdGljIHN0b3J5VmFyaWFibGVTZXJ2aWNlKHdpbikge1xuICAgIHJldHVybiAoXG4gICAgICAvKiogQHR5cGUgez8uLi9leHRlbnNpb25zL2FtcC1zdG9yeS8xLjAvdmFyaWFibGUtc2VydmljZS5BbXBTdG9yeVZhcmlhYmxlU2VydmljZX0gKi9cbiAgICAgIChnZXRFeGlzdGluZ1NlcnZpY2VPck51bGwod2luLCAnc3RvcnktdmFyaWFibGUnKSlcbiAgICApO1xuICB9XG5cbiAgLyoqXG4gICAqIFZlcnNpb24gb2YgdGhlIHN0b3J5IHN0b3JlIHNlcnZpY2UgZGVwZW5kcyBvbiB3aGljaCB2ZXJzaW9uIG9mIGFtcC1zdG9yeVxuICAgKiB0aGUgcHVibGlzaGVyIGlzIGxvYWRpbmcuIFRoZXkgYWxsIGhhdmUgdGhlIHNhbWUgaW1wbGVtZW50YXRpb24uXG4gICAqIEBwYXJhbSB7IVdpbmRvd30gd2luXG4gICAqIEByZXR1cm4gez9Qcm9taXNlPD8uLi9leHRlbnNpb25zL2FtcC1zdG9yeS8xLjAvYW1wLXN0b3J5LXN0b3JlLXNlcnZpY2UuQW1wU3RvcnlTdG9yZVNlcnZpY2U+fVxuICAgKi9cbiAgc3RhdGljIHN0b3J5U3RvcmVTZXJ2aWNlRm9yT3JOdWxsKHdpbikge1xuICAgIHJldHVybiAoXG4gICAgICAvKiogQHR5cGUgeyFQcm9taXNlPD8uLi9leHRlbnNpb25zL2FtcC1zdG9yeS8xLjAvYW1wLXN0b3J5LXN0b3JlLXNlcnZpY2UuQW1wU3RvcnlTdG9yZVNlcnZpY2U+fSAqL1xuICAgICAgKGdldEVsZW1lbnRTZXJ2aWNlSWZBdmFpbGFibGUod2luLCAnc3Rvcnktc3RvcmUnLCAnYW1wLXN0b3J5JywgJzEuMCcpKVxuICAgICk7XG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHshV2luZG93fSB3aW5cbiAgICogQHJldHVybiB7Py4uL2V4dGVuc2lvbnMvYW1wLXN0b3J5LzEuMC9hbXAtc3Rvcnktc3RvcmUtc2VydmljZS5BbXBTdG9yeVN0b3JlU2VydmljZX1cbiAgICovXG4gIHN0YXRpYyBzdG9yeVN0b3JlU2VydmljZSh3aW4pIHtcbiAgICByZXR1cm4gKFxuICAgICAgLyoqIEB0eXBlIHs/Li4vZXh0ZW5zaW9ucy9hbXAtc3RvcnkvMS4wL2FtcC1zdG9yeS1zdG9yZS1zZXJ2aWNlLkFtcFN0b3J5U3RvcmVTZXJ2aWNlfSAqL1xuICAgICAgKGdldEV4aXN0aW5nU2VydmljZU9yTnVsbCh3aW4sICdzdG9yeS1zdG9yZScpKVxuICAgICk7XG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHshV2luZG93fSB3aW5cbiAgICogQHJldHVybiB7Py4uL2V4dGVuc2lvbnMvYW1wLXN0b3J5LzEuMC9hbXAtc3RvcnktbWVkaWEtcXVlcnktc2VydmljZS5BbXBTdG9yeU1lZGlhUXVlcnlTZXJ2aWNlfVxuICAgKi9cbiAgc3RhdGljIHN0b3J5TWVkaWFRdWVyeVNlcnZpY2Uod2luKSB7XG4gICAgcmV0dXJuIChcbiAgICAgIC8qKiBAdHlwZSB7Py4uL2V4dGVuc2lvbnMvYW1wLXN0b3J5LzEuMC9hbXAtc3RvcnktbWVkaWEtcXVlcnktc2VydmljZS5BbXBTdG9yeU1lZGlhUXVlcnlTZXJ2aWNlfSAqL1xuICAgICAgKGdldEV4aXN0aW5nU2VydmljZU9yTnVsbCh3aW4sICdzdG9yeS1tZWRpYS1xdWVyeScpKVxuICAgICk7XG4gIH1cblxuICAvKipcbiAgICogR2V0IHByb21pc2Ugd2l0aCBzdG9yeSByZXF1ZXN0IHNlcnZpY2VcbiAgICogQHBhcmFtIHshV2luZG93fSB3aW5cbiAgICogQHJldHVybiB7P1Byb21pc2U8Py4uL2V4dGVuc2lvbnMvYW1wLXN0b3J5LzEuMC9hbXAtc3RvcnktcmVxdWVzdC1zZXJ2aWNlLkFtcFN0b3J5UmVxdWVzdFNlcnZpY2U+fVxuICAgKi9cbiAgc3RhdGljIHN0b3J5UmVxdWVzdFNlcnZpY2VGb3JPck51bGwod2luKSB7XG4gICAgcmV0dXJuIChcbiAgICAgIC8qKiBAdHlwZSB7IVByb21pc2U8Py4uL2V4dGVuc2lvbnMvYW1wLXN0b3J5LzEuMC9hbXAtc3RvcnktcmVxdWVzdC1zZXJ2aWNlLkFtcFN0b3J5UmVxdWVzdFNlcnZpY2U+fSAqL1xuICAgICAgKGdldEVsZW1lbnRTZXJ2aWNlSWZBdmFpbGFibGUod2luLCAnc3RvcnktcmVxdWVzdCcsICdhbXAtc3RvcnknLCAnMS4wJykpXG4gICAgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0geyFXaW5kb3d9IHdpblxuICAgKiBAcmV0dXJuIHs/Li4vZXh0ZW5zaW9ucy9hbXAtc3RvcnkvMS4wL2FtcC1zdG9yeS1yZXF1ZXN0LXNlcnZpY2UuQW1wU3RvcnlSZXF1ZXN0U2VydmljZX1cbiAgICovXG4gIHN0YXRpYyBzdG9yeVJlcXVlc3RTZXJ2aWNlKHdpbikge1xuICAgIHJldHVybiAoXG4gICAgICAvKiogQHR5cGUgez8uLi9leHRlbnNpb25zL2FtcC1zdG9yeS8xLjAvYW1wLXN0b3J5LXJlcXVlc3Qtc2VydmljZS5BbXBTdG9yeVJlcXVlc3RTZXJ2aWNlfSAqL1xuICAgICAgKGdldEV4aXN0aW5nU2VydmljZU9yTnVsbCh3aW4sICdzdG9yeS1yZXF1ZXN0JykpXG4gICAgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0geyFXaW5kb3d9IHdpblxuICAgKiBAcmV0dXJuIHs/Li4vZXh0ZW5zaW9ucy9hbXAtc3RvcnkvMS4wL21lZGlhLXBlcmZvcm1hbmNlLW1ldHJpY3Mtc2VydmljZS5NZWRpYVBlcmZvcm1hbmNlTWV0cmljc1NlcnZpY2V9XG4gICAqL1xuICBzdGF0aWMgbWVkaWFQZXJmb3JtYW5jZU1ldHJpY3NTZXJ2aWNlKHdpbikge1xuICAgIHJldHVybiAoXG4gICAgICAvKiogQHR5cGUgez8uLi9leHRlbnNpb25zL2FtcC1zdG9yeS8xLjAvbWVkaWEtcGVyZm9ybWFuY2UtbWV0cmljcy1zZXJ2aWNlLk1lZGlhUGVyZm9ybWFuY2VNZXRyaWNzU2VydmljZX0gKi9cbiAgICAgIChnZXRFeGlzdGluZ1NlcnZpY2VPck51bGwod2luLCAnbWVkaWEtcGVyZm9ybWFuY2UtbWV0cmljcycpKVxuICAgICk7XG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHshRWxlbWVudH0gZWxcbiAgICogQHJldHVybiB7IVByb21pc2U8Li9zZXJ2aWNlL2xvY2FsaXphdGlvbi5Mb2NhbGl6YXRpb25TZXJ2aWNlPn1cbiAgICovXG4gIHN0YXRpYyBsb2NhbGl6YXRpb25TZXJ2aWNlRm9yT3JOdWxsKGVsKSB7XG4gICAgcmV0dXJuIC8qKiBAdHlwZSB7IVByb21pc2U8Py4vc2VydmljZS9sb2NhbGl6YXRpb24uTG9jYWxpemF0aW9uU2VydmljZT59ICovIChcbiAgICAgIGdldFNlcnZpY2VQcm9taXNlRm9yRG9jKGVsLCAnbG9jYWxpemF0aW9uJylcbiAgICApO1xuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7IUVsZW1lbnR9IGVsZW1lbnRcbiAgICogQHJldHVybiB7Py4vc2VydmljZS9sb2NhbGl6YXRpb24uTG9jYWxpemF0aW9uU2VydmljZX1cbiAgICovXG4gIHN0YXRpYyBsb2NhbGl6YXRpb25Gb3JEb2MoZWxlbWVudCkge1xuICAgIHJldHVybiAvKiogQHR5cGUgez8uL3NlcnZpY2UvbG9jYWxpemF0aW9uLkxvY2FsaXphdGlvblNlcnZpY2V9ICovIChcbiAgICAgIGdldFNlcnZpY2VGb3JEb2NPck51bGwoZWxlbWVudCwgJ2xvY2FsaXphdGlvbicpXG4gICAgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBUT0RPKCMxNDM1Nyk6IFJlbW92ZSB0aGlzIHdoZW4gYW1wLXN0b3J5OjAuMSBpcyBkZXByZWNhdGVkLlxuICAgKiBAcGFyYW0geyFXaW5kb3d9IHdpblxuICAgKiBAcmV0dXJuIHshUHJvbWlzZTw/Li4vZXh0ZW5zaW9ucy9hbXAtc3RvcnkvMS4wL3N0b3J5LWFuYWx5dGljcy5TdG9yeUFuYWx5dGljc1NlcnZpY2U+fVxuICAgKi9cbiAgc3RhdGljIHN0b3J5QW5hbHl0aWNzU2VydmljZUZvck9yTnVsbCh3aW4pIHtcbiAgICByZXR1cm4gKFxuICAgICAgLyoqIEB0eXBlIHshUHJvbWlzZTw/Li4vZXh0ZW5zaW9ucy9hbXAtc3RvcnkvMS4wL3N0b3J5LWFuYWx5dGljcy5TdG9yeUFuYWx5dGljc1NlcnZpY2U+fSAqL1xuICAgICAgKFxuICAgICAgICBnZXRFbGVtZW50U2VydmljZUlmQXZhaWxhYmxlKFxuICAgICAgICAgIHdpbixcbiAgICAgICAgICAnc3RvcnktYW5hbHl0aWNzJyxcbiAgICAgICAgICAnYW1wLXN0b3J5JyxcbiAgICAgICAgICAnMS4wJyxcbiAgICAgICAgICB0cnVlXG4gICAgICAgIClcbiAgICAgIClcbiAgICApO1xuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7IVdpbmRvd30gd2luXG4gICAqIEByZXR1cm4gez8uLi9leHRlbnNpb25zL2FtcC1zdG9yeS8xLjAvc3RvcnktYW5hbHl0aWNzLlN0b3J5QW5hbHl0aWNzU2VydmljZX1cbiAgICovXG4gIHN0YXRpYyBzdG9yeUFuYWx5dGljc1NlcnZpY2Uod2luKSB7XG4gICAgcmV0dXJuIChcbiAgICAgIC8qKiBAdHlwZSB7Py4uL2V4dGVuc2lvbnMvYW1wLXN0b3J5LzEuMC9zdG9yeS1hbmFseXRpY3MuU3RvcnlBbmFseXRpY3NTZXJ2aWNlfSAqL1xuICAgICAgKGdldEV4aXN0aW5nU2VydmljZU9yTnVsbCh3aW4sICdzdG9yeS1hbmFseXRpY3MnKSlcbiAgICApO1xuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7IUVsZW1lbnR8IVNoYWRvd1Jvb3R9IGVsZW1lbnRcbiAgICogQHJldHVybiB7IVByb21pc2U8IS4uL2V4dGVuc2lvbnMvYW1wLWFuaW1hdGlvbi8wLjEvd2ViLWFuaW1hdGlvbi1zZXJ2aWNlLldlYkFuaW1hdGlvblNlcnZpY2U+fVxuICAgKi9cbiAgc3RhdGljIHdlYkFuaW1hdGlvblNlcnZpY2VGb3IoZWxlbWVudCkge1xuICAgIHJldHVybiAoXG4gICAgICAvKiogQHR5cGUgeyFQcm9taXNlPCEuLi9leHRlbnNpb25zL2FtcC1hbmltYXRpb24vMC4xL3dlYi1hbmltYXRpb24tc2VydmljZS5XZWJBbmltYXRpb25TZXJ2aWNlPn0gKi9cbiAgICAgIChnZXRFbGVtZW50U2VydmljZUZvckRvYyhlbGVtZW50LCAnd2ViLWFuaW1hdGlvbicsICdhbXAtYW5pbWF0aW9uJykpXG4gICAgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0geyFFbGVtZW50fCEuL3NlcnZpY2UvYW1wZG9jLWltcGwuQW1wRG9jfSBlbGVtZW50T3JBbXBEb2NcbiAgICogQHJldHVybiB7IVByb21pc2U8IS4vc2VydmljZS9yZWFsLXRpbWUtY29uZmlnL3JlYWwtdGltZS1jb25maWctaW1wbC5SZWFsVGltZUNvbmZpZ01hbmFnZXI+fVxuICAgKi9cbiAgc3RhdGljIHJlYWxUaW1lQ29uZmlnRm9yRG9jKGVsZW1lbnRPckFtcERvYykge1xuICAgIHJldHVybiAvKiogQHR5cGUgeyFQcm9taXNlPCEuL3NlcnZpY2UvcmVhbC10aW1lLWNvbmZpZy9yZWFsLXRpbWUtY29uZmlnLWltcGwuUmVhbFRpbWVDb25maWdNYW5hZ2VyPn0gKi8gKFxuICAgICAgZ2V0U2VydmljZVByb21pc2VGb3JEb2MoZWxlbWVudE9yQW1wRG9jLCAncmVhbC10aW1lLWNvbmZpZycpXG4gICAgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0geyFFbGVtZW50fCEuL3NlcnZpY2UvYW1wZG9jLWltcGwuQW1wRG9jfSBlbGVtZW50T3JBbXBEb2NcbiAgICogQHJldHVybiB7IVByb21pc2U8IS4vc2VydmljZS9zdG9yYWdlLWltcGwuU3RvcmFnZT59XG4gICAqL1xuICBzdGF0aWMgc3RvcmFnZUZvckRvYyhlbGVtZW50T3JBbXBEb2MpIHtcbiAgICByZXR1cm4gLyoqIEB0eXBlIHshUHJvbWlzZTwhLi9zZXJ2aWNlL3N0b3JhZ2UtaW1wbC5TdG9yYWdlPn0gKi8gKFxuICAgICAgZ2V0U2VydmljZVByb21pc2VGb3JEb2MoZWxlbWVudE9yQW1wRG9jLCAnc3RvcmFnZScpXG4gICAgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0geyFFbGVtZW50fCEuL3NlcnZpY2UvYW1wZG9jLWltcGwuQW1wRG9jfSBlbGVtZW50T3JBbXBEb2NcbiAgICogQHJldHVybiB7IVByb21pc2U8IS4vc2VydmljZS9zdG9yYWdlLWltcGwuU3RvcmFnZT59XG4gICAqIFRPRE8oZG1hbmVrKTogQWRkIHRlc3RzIGZvciB0aGlzIG1ldGhvZC5cbiAgICovXG4gIHN0YXRpYyBzdG9yYWdlRm9yVG9wTGV2ZWxEb2MoZWxlbWVudE9yQW1wRG9jKSB7XG4gICAgY29uc3QgdGhpc0FtcGRvYyA9IFNlcnZpY2VzLmFtcGRvYyhlbGVtZW50T3JBbXBEb2MpO1xuICAgIGNvbnN0IGFtcGRvY1NlcnZpY2UgPSBTZXJ2aWNlcy5hbXBkb2NTZXJ2aWNlRm9yKHRoaXNBbXBkb2Mud2luKTtcbiAgICBjb25zdCB0b3BBbXBkb2MgPSBhbXBkb2NTZXJ2aWNlLmlzU2luZ2xlRG9jKClcbiAgICAgID8gYW1wZG9jU2VydmljZS5nZXRTaW5nbGVEb2MoKVxuICAgICAgOiBudWxsO1xuICAgIC8vIFdlIG5lZWQgdG8gdmVyaWZ5IHRoYXQgYW1wZG9jcyBhcmUgb24gdGhlIHNhbWUgb3JpZ2luLCB0aGVyZWZvcmVcbiAgICAvLyB3ZSBjb21wYXJlIHRoZSB3aW5kb3dzIG9mIGJvdGguXG4gICAgY29uc3QgYW1wZG9jID1cbiAgICAgIHRvcEFtcGRvYyAmJiB0b3BBbXBkb2Mud2luID09IHRoaXNBbXBkb2Mud2luID8gdG9wQW1wZG9jIDogdGhpc0FtcGRvYztcbiAgICByZXR1cm4gLyoqIEB0eXBlIHshUHJvbWlzZTwhLi9zZXJ2aWNlL3N0b3JhZ2UtaW1wbC5TdG9yYWdlPn0gKi8gKFxuICAgICAgZ2V0U2VydmljZVByb21pc2VGb3JEb2MoYW1wZG9jLCAnc3RvcmFnZScpXG4gICAgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0geyFFbGVtZW50fCEuL3NlcnZpY2UvYW1wZG9jLWltcGwuQW1wRG9jfSBlbGVtZW50T3JBbXBEb2NcbiAgICogQHJldHVybiB7IS4vc2VydmljZS90ZW1wbGF0ZS1pbXBsLlRlbXBsYXRlc31cbiAgICovXG4gIHN0YXRpYyB0ZW1wbGF0ZXNGb3JEb2MoZWxlbWVudE9yQW1wRG9jKSB7XG4gICAgcmV0dXJuIC8qKiBAdHlwZSB7IS4vc2VydmljZS90ZW1wbGF0ZS1pbXBsLlRlbXBsYXRlc30gKi8gKFxuICAgICAgZ2V0U2VydmljZUZvckRvYyhlbGVtZW50T3JBbXBEb2MsICd0ZW1wbGF0ZXMnKVxuICAgICk7XG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHshV2luZG93fSB3aW5kb3dcbiAgICogQHJldHVybiB7IS4vc2VydmljZS90aW1lci1pbXBsLlRpbWVyfVxuICAgKi9cbiAgc3RhdGljIHRpbWVyRm9yKHdpbmRvdykge1xuICAgIC8vIFRPRE8oYWxhYmlhZ2EpOiBUaGlzIHdpbGwgYWx3YXlzIHJldHVybiB0aGUgdG9wIHdpbmRvdydzIFRpbWVyIHNlcnZpY2UuXG4gICAgcmV0dXJuIC8qKiBAdHlwZSB7IS4vc2VydmljZS90aW1lci1pbXBsLlRpbWVyfSAqLyAoXG4gICAgICBnZXRTZXJ2aWNlSW5FbWJlZFdpbih3aW5kb3csICd0aW1lcicpXG4gICAgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0geyFFbGVtZW50fCFTaGFkb3dSb290fSBlbGVtZW50XG4gICAqIEByZXR1cm4geyEuL3NlcnZpY2UvdXJsLXJlcGxhY2VtZW50cy1pbXBsLlVybFJlcGxhY2VtZW50c31cbiAgICovXG4gIHN0YXRpYyB1cmxSZXBsYWNlbWVudHNGb3JEb2MoZWxlbWVudCkge1xuICAgIHJldHVybiAvKiogQHR5cGUgeyEuL3NlcnZpY2UvdXJsLXJlcGxhY2VtZW50cy1pbXBsLlVybFJlcGxhY2VtZW50c30gKi8gKFxuICAgICAgZ2V0U2VydmljZUZvckRvY09yTnVsbChlbGVtZW50LCAndXJsLXJlcGxhY2UnKVxuICAgICk7XG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHshRWxlbWVudHwhU2hhZG93Um9vdH0gZWxlbWVudFxuICAgKiBAcmV0dXJuIHshUHJvbWlzZTwhLi4vZXh0ZW5zaW9ucy9hbXAtdXNlci1ub3RpZmljYXRpb24vMC4xL2FtcC11c2VyLW5vdGlmaWNhdGlvbi5Vc2VyTm90aWZpY2F0aW9uTWFuYWdlcj59XG4gICAqL1xuICBzdGF0aWMgdXNlck5vdGlmaWNhdGlvbk1hbmFnZXJGb3JEb2MoZWxlbWVudCkge1xuICAgIHJldHVybiAoXG4gICAgICAvKiogQHR5cGUgeyFQcm9taXNlPCEuLi9leHRlbnNpb25zL2FtcC11c2VyLW5vdGlmaWNhdGlvbi8wLjEvYW1wLXVzZXItbm90aWZpY2F0aW9uLlVzZXJOb3RpZmljYXRpb25NYW5hZ2VyPn0gKi9cbiAgICAgIChcbiAgICAgICAgZ2V0RWxlbWVudFNlcnZpY2VGb3JEb2MoXG4gICAgICAgICAgZWxlbWVudCxcbiAgICAgICAgICAndXNlck5vdGlmaWNhdGlvbk1hbmFnZXInLFxuICAgICAgICAgICdhbXAtdXNlci1ub3RpZmljYXRpb24nXG4gICAgICAgIClcbiAgICAgIClcbiAgICApO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgYSBwcm9taXNlIGZvciB0aGUgY29uc2VudFBvbGljeSBTZXJ2aWNlIG9yIGEgcHJvbWlzZSBmb3IgbnVsbCBpZlxuICAgKiB0aGUgc2VydmljZSBpcyBub3QgYXZhaWxhYmxlIG9uIHRoZSBjdXJyZW50IHBhZ2UuXG4gICAqIEBwYXJhbSB7IUVsZW1lbnR8IVNoYWRvd1Jvb3R9IGVsZW1lbnRcbiAgICogQHJldHVybiB7IVByb21pc2U8Py4uL2V4dGVuc2lvbnMvYW1wLWNvbnNlbnQvMC4xL2NvbnNlbnQtcG9saWN5LW1hbmFnZXIuQ29uc2VudFBvbGljeU1hbmFnZXI+fVxuICAgKi9cbiAgc3RhdGljIGNvbnNlbnRQb2xpY3lTZXJ2aWNlRm9yRG9jT3JOdWxsKGVsZW1lbnQpIHtcbiAgICByZXR1cm4gKFxuICAgICAgLyoqIEB0eXBlIHshUHJvbWlzZTw/Li4vZXh0ZW5zaW9ucy9hbXAtY29uc2VudC8wLjEvY29uc2VudC1wb2xpY3ktbWFuYWdlci5Db25zZW50UG9saWN5TWFuYWdlcj59ICovXG4gICAgICAoXG4gICAgICAgIGdldEVsZW1lbnRTZXJ2aWNlSWZBdmFpbGFibGVGb3JEb2MoXG4gICAgICAgICAgZWxlbWVudCxcbiAgICAgICAgICAnY29uc2VudFBvbGljeU1hbmFnZXInLFxuICAgICAgICAgICdhbXAtY29uc2VudCdcbiAgICAgICAgKVxuICAgICAgKVxuICAgICk7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyBhIHByb21pc2UgZm9yIHRoZSBnZW8gc2VydmljZSBvciBhIHByb21pc2UgZm9yIG51bGwgaWZcbiAgICogdGhlIHNlcnZpY2UgaXMgbm90IGF2YWlsYWJsZSBvbiB0aGUgY3VycmVudCBwYWdlLlxuICAgKiBAcGFyYW0geyFFbGVtZW50fCFTaGFkb3dSb290fSBlbGVtZW50XG4gICAqIEByZXR1cm4geyFQcm9taXNlPD8uLi9leHRlbnNpb25zL2FtcC1nZW8vMC4xL2FtcC1nZW8uR2VvRGVmPn1cbiAgICovXG4gIHN0YXRpYyBnZW9Gb3JEb2NPck51bGwoZWxlbWVudCkge1xuICAgIHJldHVybiAvKiogQHR5cGUgeyFQcm9taXNlPD8uLi9leHRlbnNpb25zL2FtcC1nZW8vMC4xL2FtcC1nZW8uR2VvRGVmPn0gKi8gKFxuICAgICAgZ2V0RWxlbWVudFNlcnZpY2VJZkF2YWlsYWJsZUZvckRvYyhlbGVtZW50LCAnZ2VvJywgJ2FtcC1nZW8nLCB0cnVlKVxuICAgICk7XG4gIH1cblxuICAvKipcbiAgICogVW5saWtlIG1vc3Qgc2VydmljZSBnZXR0ZXJzLCBwYXNzaW5nIGBOb2RlYCBpcyBuZWNlc3NhcnkgZm9yIHNvbWUgRklFLXNjb3BlXG4gICAqIHNlcnZpY2VzIHNpbmNlIHNvbWV0aW1lcyB3ZSBvbmx5IGhhdmUgdGhlIEZJRSBEb2N1bWVudCBmb3IgY29udGV4dC5cbiAgICogQHBhcmFtIHshRWxlbWVudHwhU2hhZG93Um9vdH0gZWxlbWVudFxuICAgKiBAcmV0dXJuIHshLi9zZXJ2aWNlL3VybC1pbXBsLlVybH1cbiAgICovXG4gIHN0YXRpYyB1cmxGb3JEb2MoZWxlbWVudCkge1xuICAgIHJldHVybiAvKiogQHR5cGUgeyEuL3NlcnZpY2UvdXJsLWltcGwuVXJsfSAqLyAoXG4gICAgICBnZXRTZXJ2aWNlRm9yRG9jT3JOdWxsKGVsZW1lbnQsICd1cmwnKVxuICAgICk7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyBhIHByb21pc2UgZm9yIHRoZSBleHBlcmltZW50IHZhcmlhbnRzIG9yIGEgcHJvbWlzZSBmb3IgbnVsbCBpZiBpdFxuICAgKiBpcyBub3QgYXZhaWxhYmxlIG9uIHRoZSBjdXJyZW50IHBhZ2UuXG4gICAqIEBwYXJhbSB7IUVsZW1lbnR8IVNoYWRvd1Jvb3R9IGVsZW1lbnRcbiAgICogQHJldHVybiB7IVByb21pc2U8Py4uL2V4dGVuc2lvbnMvYW1wLWV4cGVyaW1lbnQvMC4xL3ZhcmlhbnQuVmFyaWFudHM+fVxuICAgKi9cbiAgc3RhdGljIHZhcmlhbnRzRm9yRG9jT3JOdWxsKGVsZW1lbnQpIHtcbiAgICByZXR1cm4gLyoqIEB0eXBlIHshUHJvbWlzZTw/Li4vZXh0ZW5zaW9ucy9hbXAtZXhwZXJpbWVudC8wLjEvdmFyaWFudC5WYXJpYW50cz59ICovIChcbiAgICAgIGdldEVsZW1lbnRTZXJ2aWNlSWZBdmFpbGFibGVGb3JEb2MoXG4gICAgICAgIGVsZW1lbnQsXG4gICAgICAgICd2YXJpYW50JyxcbiAgICAgICAgJ2FtcC1leHBlcmltZW50JyxcbiAgICAgICAgdHJ1ZVxuICAgICAgKVxuICAgICk7XG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHshRWxlbWVudHwhLi9zZXJ2aWNlL2FtcGRvYy1pbXBsLkFtcERvY30gZWxlbWVudE9yQW1wRG9jXG4gICAqIEByZXR1cm4geyEuL3NlcnZpY2UvdmlkZW8tbWFuYWdlci1pbXBsLlZpZGVvTWFuYWdlcn1cbiAgICovXG4gIHN0YXRpYyB2aWRlb01hbmFnZXJGb3JEb2MoZWxlbWVudE9yQW1wRG9jKSB7XG4gICAgcmV0dXJuIC8qKiBAdHlwZSB7IS4vc2VydmljZS92aWRlby1tYW5hZ2VyLWltcGwuVmlkZW9NYW5hZ2VyfSAqLyAoXG4gICAgICBnZXRTZXJ2aWNlRm9yRG9jKGVsZW1lbnRPckFtcERvYywgJ3ZpZGVvLW1hbmFnZXInKVxuICAgICk7XG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHshRWxlbWVudHwhLi9zZXJ2aWNlL2FtcGRvYy1pbXBsLkFtcERvY30gZWxlbWVudE9yQW1wRG9jXG4gICAqIEByZXR1cm4geyEuL3NlcnZpY2Uvdmlld2VyLWludGVyZmFjZS5WaWV3ZXJJbnRlcmZhY2V9XG4gICAqL1xuICBzdGF0aWMgdmlld2VyRm9yRG9jKGVsZW1lbnRPckFtcERvYykge1xuICAgIHJldHVybiAvKiogQHR5cGUgeyEuL3NlcnZpY2Uvdmlld2VyLWludGVyZmFjZS5WaWV3ZXJJbnRlcmZhY2V9ICovIChcbiAgICAgIGdldFNlcnZpY2VGb3JEb2MoZWxlbWVudE9yQW1wRG9jLCAndmlld2VyJylcbiAgICApO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgcHJvbWlzZSBmb3IgdGhlIHZpZXdlci4gVGhpcyBpcyBhbiB1bnVzdWFsIGNhc2UgYW5kIG5lY2Vzc2FyeSBvbmx5XG4gICAqIGZvciBzZXJ2aWNlcyB0aGF0IG5lZWQgcmVmZXJlbmNlIHRvIHRoZSB2aWV3ZXIgYmVmb3JlIGl0IGhhcyBiZWVuXG4gICAqIGluaXRpYWxpemVkLiBNb3N0IG9mIHRoZSBjb2RlLCBob3dldmVyLCBqdXN0IHNob3VsZCB1c2UgYHZpZXdlckZvckRvY2AuXG4gICAqIEBwYXJhbSB7IUVsZW1lbnR8IS4vc2VydmljZS9hbXBkb2MtaW1wbC5BbXBEb2N9IGVsZW1lbnRPckFtcERvY1xuICAgKiBAcmV0dXJuIHshUHJvbWlzZTwhLi9zZXJ2aWNlL3ZpZXdlci1pbnRlcmZhY2UuVmlld2VySW50ZXJmYWNlPn1cbiAgICovXG4gIHN0YXRpYyB2aWV3ZXJQcm9taXNlRm9yRG9jKGVsZW1lbnRPckFtcERvYykge1xuICAgIHJldHVybiAvKiogQHR5cGUgeyFQcm9taXNlPCEuL3NlcnZpY2Uvdmlld2VyLWludGVyZmFjZS5WaWV3ZXJJbnRlcmZhY2U+fSAqLyAoXG4gICAgICBnZXRTZXJ2aWNlUHJvbWlzZUZvckRvYyhlbGVtZW50T3JBbXBEb2MsICd2aWV3ZXInKVxuICAgICk7XG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHshV2luZG93fSB3aW5kb3dcbiAgICogQHJldHVybiB7IS4vc2VydmljZS92c3luYy1pbXBsLlZzeW5jfVxuICAgKi9cbiAgc3RhdGljIHZzeW5jRm9yKHdpbmRvdykge1xuICAgIHJldHVybiAvKiogQHR5cGUgeyEuL3NlcnZpY2UvdnN5bmMtaW1wbC5Wc3luY30gKi8gKFxuICAgICAgZ2V0U2VydmljZSh3aW5kb3csICd2c3luYycpXG4gICAgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0geyFFbGVtZW50fCEuL3NlcnZpY2UvYW1wZG9jLWltcGwuQW1wRG9jfSBlbGVtZW50T3JBbXBEb2NcbiAgICogQHJldHVybiB7IS4vc2VydmljZS92aWV3cG9ydC92aWV3cG9ydC1pbnRlcmZhY2UuVmlld3BvcnRJbnRlcmZhY2V9XG4gICAqL1xuICBzdGF0aWMgdmlld3BvcnRGb3JEb2MoZWxlbWVudE9yQW1wRG9jKSB7XG4gICAgcmV0dXJuIC8qKiBAdHlwZSB7IS4vc2VydmljZS92aWV3cG9ydC92aWV3cG9ydC1pbnRlcmZhY2UuVmlld3BvcnRJbnRlcmZhY2V9ICovIChcbiAgICAgIGdldFNlcnZpY2VGb3JEb2MoZWxlbWVudE9yQW1wRG9jLCAndmlld3BvcnQnKVxuICAgICk7XG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHshV2luZG93fSB3aW5kb3dcbiAgICogQHJldHVybiB7IS4vc2VydmljZS94aHItaW1wbC5YaHJ9XG4gICAqL1xuICBzdGF0aWMgeGhyRm9yKHdpbmRvdykge1xuICAgIHJldHVybiAvKiogQHR5cGUgeyEuL3NlcnZpY2UveGhyLWltcGwuWGhyfSAqLyAoZ2V0U2VydmljZSh3aW5kb3csICd4aHInKSk7XG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHshRWxlbWVudHwhLi9zZXJ2aWNlL2FtcGRvYy1pbXBsLkFtcERvY30gZWxlbWVudE9yQW1wRG9jXG4gICAqIEByZXR1cm4geyFQcm9taXNlPC4uL2FtcC1jYWNoZS11cmwvYW1wLWNhY2hlLXVybC5BbXBDYWNoZVVybFNlcnZpY2U+fVxuICAgKi9cbiAgc3RhdGljIGNhY2hlVXJsU2VydmljZVByb21pc2VGb3JEb2MoZWxlbWVudE9yQW1wRG9jKSB7XG4gICAgcmV0dXJuIC8qKiBAdHlwZSB7IVByb21pc2U8Py4uL2FtcC1jYWNoZS11cmwvYW1wLWNhY2hlLXVybC5BbXBDYWNoZVVybFNlcnZpY2U+fSAqLyAoXG4gICAgICBnZXRTZXJ2aWNlUHJvbWlzZUZvckRvYyhlbGVtZW50T3JBbXBEb2MsICdjYWNoZS11cmwnKVxuICAgICk7XG4gIH1cbn1cbiJdfQ==
// /Users/mszylkowski/src/amphtml/src/service/index.js