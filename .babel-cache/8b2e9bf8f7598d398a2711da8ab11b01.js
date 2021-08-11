function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError("Cannot call a class as a function");}}function _defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}function _createClass(Constructor, protoProps, staticProps) {if (protoProps) _defineProperties(Constructor.prototype, protoProps);if (staticProps) _defineProperties(Constructor, staticProps);return Constructor;} /**
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

import {
getElementServiceForDoc,
getElementServiceIfAvailable,
getElementServiceIfAvailableForDoc,
getElementServiceIfAvailableForDocInEmbedScope } from "../element-service";

import {
getAmpdoc,
getExistingServiceOrNull,
getService,
getServiceForDoc,
getServiceForDocOrNull,
getServiceInEmbedWin,
getServicePromiseForDoc } from "../service-helpers";


/** @typedef {!../extensions/amp-subscriptions/0.1/amp-subscriptions.SubscriptionService} */
export var SubscriptionService;

export var Services = /*#__PURE__*/function () {function Services() {_classCallCheck(this, Services);}_createClass(Services, null, [{ key: "accessServiceForDoc", value:
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
      return (/** @type {!Promise<!../extensions/amp-access/0.1/amp-access.AccessService>} */(
        getElementServiceForDoc(element, 'access', 'amp-access')));

    }

    /**
     * Returns a promise for the Access service or a promise for null if the
     * service is not available on the current page.
     * @param {!Element|!ShadowRoot} element
     * @return {!Promise<?../extensions/amp-access/0.1/amp-access.AccessService>}
     */ }, { key: "accessServiceForDocOrNull", value:
    function accessServiceForDocOrNull(element) {
      return (/** @type {!Promise<?../extensions/amp-access/0.1/amp-access.AccessService>} */(
        getElementServiceIfAvailableForDoc(element, 'access', 'amp-access')));

    }

    /**
     * Returns a promise for the Subscriptions service.
     * @param {!Element|!ShadowRoot} element
     * @return {!Promise<!SubscriptionService>}
     */ }, { key: "subscriptionsServiceForDoc", value:
    function subscriptionsServiceForDoc(element) {
      return (/** @type {!Promise<!SubscriptionService>} */(
        getElementServiceForDoc(element, 'subscriptions', 'amp-subscriptions')));

    }

    /**
     * Returns a promise for the Subscriptions service.
     * @param {!Element|!ShadowRoot} element
     * @return {!Promise<?SubscriptionService>}
     */ }, { key: "subscriptionsServiceForDocOrNull", value:
    function subscriptionsServiceForDocOrNull(element) {
      return (/** @type {!Promise<?SubscriptionService>} */(
        getElementServiceIfAvailableForDoc(
        element,
        'subscriptions',
        'amp-subscriptions')));


    }

    /**
     * @param {!Element|!ShadowRoot} element
     * @return {!./service/action-impl.ActionService}
     */ }, { key: "actionServiceForDoc", value:
    function actionServiceForDoc(element) {
      return (/** @type {!./service/action-impl.ActionService} */(
        getServiceForDocOrNull(element, 'action')));

    }

    /**
     * @param {!Element|!ShadowRoot} element
     * @return {!./service/standard-actions-impl.StandardActions}
     */ }, { key: "standardActionsForDoc", value:
    function standardActionsForDoc(element) {
      return (/** @type {!./service/standard-actions-impl.StandardActions} */(
        getServiceForDocOrNull(element, 'standard-actions')));

    }

    /**
     * @param {!Element|!ShadowRoot} element
     * @return {!Promise<!../extensions/amp-analytics/0.1/activity-impl.Activity>}
     */ }, { key: "activityForDoc", value:
    function activityForDoc(element) {
      return (/** @type {!Promise<!../extensions/amp-analytics/0.1/activity-impl.Activity>} */(
        getElementServiceForDoc(element, 'activity', 'amp-analytics')));

    }

    /**
     * Returns the global instance of the `AmpDocService` service that can be
     * used to resolve an ampdoc for any node: either in the single-doc or
     * shadow-doc environment.
     * @param {!Window} window
     * @return {!./service/ampdoc-impl.AmpDocService}
     */ }, { key: "ampdocServiceFor", value:
    function ampdocServiceFor(window) {
      return (/** @type {!./service/ampdoc-impl.AmpDocService} */(
        getService(window, 'ampdoc')));

    }

    /**
     * Returns the AmpDoc for the specified context node.
     * @param {!Node|!./service/ampdoc-impl.AmpDoc} nodeOrAmpDoc
     * @return {!./service/ampdoc-impl.AmpDoc}
     */ }, { key: "ampdoc", value:
    function ampdoc(nodeOrAmpDoc) {
      return getAmpdoc(nodeOrAmpDoc);
    }

    /**
     * @param {!Element|!ShadowRoot} element
     * @param {boolean=} loadAnalytics
     * @return {!Promise<!../extensions/amp-analytics/0.1/instrumentation.InstrumentationService>}
     */ }, { key: "analyticsForDoc", value:
    function analyticsForDoc(element) {var loadAnalytics = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
      if (loadAnalytics) {
        // Get Extensions service and force load analytics extension.
        var ampdoc = getAmpdoc(element);
        Services.extensionsFor(ampdoc.win). /*OK*/installExtensionForDoc(
        ampdoc,
        'amp-analytics');

      }
      return (/** @type {!Promise<!../extensions/amp-analytics/0.1/instrumentation.InstrumentationService>} */(
        getElementServiceForDoc(
        element,
        'amp-analytics-instrumentation',
        'amp-analytics')));


    }

    /**
     * @param {!Element|!ShadowRoot} element
     * @return {!Promise<?../extensions/amp-analytics/0.1/instrumentation.InstrumentationService>}
     */ }, { key: "analyticsForDocOrNull", value:
    function analyticsForDocOrNull(element) {
      return (/** @type {!Promise<?../extensions/amp-analytics/0.1/instrumentation.InstrumentationService>} */(
        getElementServiceIfAvailableForDoc(
        element,
        'amp-analytics-instrumentation',
        'amp-analytics')));


    }

    /**
     * @param {!Window} window
     * @return {!./service/batched-xhr-impl.BatchedXhr}
     */ }, { key: "batchedXhrFor", value:
    function batchedXhrFor(window) {
      return (/** @type {!./service/batched-xhr-impl.BatchedXhr} */(
        getService(window, 'batched-xhr')));

    }

    /**
     * @param {!Element|!ShadowRoot} element
     * @return {!Promise<?../extensions/amp-bind/0.1/bind-impl.Bind>}
     */ }, { key: "bindForDocOrNull", value:
    function bindForDocOrNull(element) {
      return (/** @type {!Promise<?../extensions/amp-bind/0.1/bind-impl.Bind>} */(
        getElementServiceIfAvailableForDocInEmbedScope(
        element,
        'bind',
        'amp-bind')));


    }

    /**
     * @param {!Element|!ShadowRoot} element
     * @return {!Promise<?../extensions/amp-script/0.1/amp-script.AmpScriptService>}
     */ }, { key: "scriptForDocOrNull", value:
    function scriptForDocOrNull(element) {
      return (/** @type {!Promise<?../extensions/amp-script/0.1/amp-script.AmpScriptService>} */(
        getElementServiceIfAvailableForDocInEmbedScope(
        element,
        'amp-script',
        'amp-script')));


    }

    /**
     * @param {!Element|!ShadowRoot|!./service/ampdoc-impl.AmpDoc} elementOrAmpDoc
     * @return {!Promise<!./service/cid-impl.CidDef>}
     */ }, { key: "cidForDoc", value:
    function cidForDoc(elementOrAmpDoc) {
      return (/** @type {!Promise<!./service/cid-impl.CidDef>} */(
        getServicePromiseForDoc(elementOrAmpDoc, 'cid')));

    }

    /**
     * @param {!Element|!./service/ampdoc-impl.AmpDoc} elementOrAmpDoc
     * @return {!./service/navigation.Navigation}
     */ }, { key: "navigationForDoc", value:
    function navigationForDoc(elementOrAmpDoc) {
      return (/** @type {!./service/navigation.Navigation} */(
        getServiceForDoc(elementOrAmpDoc, 'navigation')));

    }

    /**
     * @param {!Element|!ShadowRoot} element
     * @return {!Promise<!../extensions/amp-loader/0.1/amp-loader.LoaderService>}
     */ }, { key: "loaderServiceForDoc", value:
    function loaderServiceForDoc(element) {
      return (/** @type {!Promise<!../extensions/amp-loader/0.1/amp-loader.LoaderService>} */(
        getElementServiceForDoc(element, 'loader', 'amp-loader')));

    }

    /**
     * @param {!Element|!ShadowRoot} element
     * @return {!Promise<!../extensions/amp-standalone/0.1/amp-standalone.StandaloneService>}
     */ }, { key: "standaloneServiceForDoc", value:
    function standaloneServiceForDoc(element) {
      return (/** @type {!Promise<!../extensions/amp-standalone/0.1/amp-standalone.StandaloneService>} */(
        getElementServiceForDoc(element, 'standalone', 'amp-standalone')));

    }

    /**
     * @param {!Window} window
     * @return {!./service/crypto-impl.Crypto}
     */ }, { key: "cryptoFor", value:
    function cryptoFor(window) {
      return (/** @type {!./service/crypto-impl.Crypto} */(
        getService(window, 'crypto')));

    }

    /**
     * @param {!Element|!./service/ampdoc-impl.AmpDoc} elementOrAmpDoc
     * @return {!./service/document-info-impl.DocumentInfoDef} Info about the doc
     */ }, { key: "documentInfoForDoc", value:
    function documentInfoForDoc(elementOrAmpDoc) {
      return (/** @type {!./service/document-info-impl.DocInfo} */(
        getServiceForDoc(elementOrAmpDoc, 'documentInfo')).
        get());
    }

    /**
     * @param {!Window} window
     * @return {!./service/extensions-impl.Extensions}
     */ }, { key: "extensionsFor", value:
    function extensionsFor(window) {
      return (/** @type {!./service/extensions-impl.Extensions} */(
        getService(window, 'extensions')));

    }

    /**
     * Returns a service to register callbacks we wish to execute when an
     * amp-form is submitted.
     * @param {!Element|!./service/ampdoc-impl.AmpDoc} elementOrAmpDoc
     * @return {!Promise<../extensions/amp-form/0.1/form-submit-service.FormSubmitService>}
     */ }, { key: "formSubmitForDoc", value:
    function formSubmitForDoc(elementOrAmpDoc) {
      return (/** @type {!Promise<../extensions/amp-form/0.1/form-submit-service.FormSubmitService>} */(
        getServicePromiseForDoc(elementOrAmpDoc, 'form-submit-service')));

    }

    /**
     * Returns service to listen for `hidden` attribute mutations.
     * @param {!Element|!ShadowRoot} element
     * @return {!./service/hidden-observer-impl.HiddenObserver}
     */ }, { key: "hiddenObserverForDoc", value:
    function hiddenObserverForDoc(element) {
      return (/** @type {!./service/hidden-observer-impl.HiddenObserver} */(
        getServiceForDocOrNull(element, 'hidden-observer')));

    }

    /**
     * Returns service implemented in service/history-impl.
     * @param {!Element|!./service/ampdoc-impl.AmpDoc} elementOrAmpDoc
     * @return {!./service/history-impl.History}
     */ }, { key: "historyForDoc", value:
    function historyForDoc(elementOrAmpDoc) {
      return (/** @type {!./service/history-impl.History} */(
        getServiceForDoc(elementOrAmpDoc, 'history')));

    }

    /**
     * @param {!Window} win
     * @return {!./input.Input}
     */ }, { key: "inputFor", value:
    function inputFor(win) {
      return getService(win, 'input');
    }

    /**s
     * Returns a promise for the Inputmask service.
     * @param {!Element|!ShadowRoot} element
     * @return {!Promise<?../extensions/amp-inputmask/0.1/amp-inputmask.AmpInputmaskService>}
     */ }, { key: "inputmaskServiceForDocOrNull", value:
    function inputmaskServiceForDocOrNull(element) {
      return (/** @type {!Promise<?../extensions/amp-inputmask/0.1/amp-inputmask.AmpInputmaskService>} */(
        getElementServiceIfAvailableForDoc(element, 'inputmask', 'amp-inputmask')));

    }

    /**
     * @param {!Element|!./service/ampdoc-impl.AmpDoc} elementOrAmpDoc
     * @return {?./service/loading-indicator.LoadingIndicatorImpl}
     */ }, { key: "loadingIndicatorOrNull", value:
    function loadingIndicatorOrNull(elementOrAmpDoc) {
      return (/** @type {?./service/loading-indicator.LoadingIndicatorImpl} */(
        getServiceForDocOrNull(elementOrAmpDoc, 'loadingIndicator')));

    }

    /**
     * @param {!Element|!./service/ampdoc-impl.AmpDoc} elementOrAmpDoc
     * @return {!../extensions/amp-next-page/1.0/service.NextPageService}
     */ }, { key: "nextPageServiceForDoc", value:
    function nextPageServiceForDoc(elementOrAmpDoc) {
      return (/** @type {!../extensions/amp-next-page/1.0/service.NextPageService} */(
        getServiceForDoc(elementOrAmpDoc, 'next-page')));

    }

    /**
     * @param {!Element|!./service/ampdoc-impl.AmpDoc} elementOrAmpDoc
     * @return {!./service/mutator-interface.MutatorInterface}
     */ }, { key: "mutatorForDoc", value:
    function mutatorForDoc(elementOrAmpDoc) {
      return (/** @type {!./service/mutator-interface.MutatorInterface} */(
        getServiceForDoc(elementOrAmpDoc, 'mutator')));

    }

    /**
     * @param {!Element|!./service/ampdoc-impl.AmpDoc} elementOrAmpDoc
     * @return {!./service/owners-interface.OwnersInterface}
     */ }, { key: "ownersForDoc", value:
    function ownersForDoc(elementOrAmpDoc) {
      return (/** @type {!./service/owners-interface.OwnersInterface} */(
        getServiceForDoc(elementOrAmpDoc, 'owners')));

    }

    /**
     * @param {!Window} window
     * @return {!./service/performance-impl.Performance}
     */ }, { key: "performanceFor", value:
    function performanceFor(window) {
      return (/** @type {!./service/performance-impl.Performance}*/(
        getService(window, 'performance')));

    }

    /**
     * @param {!Window} window
     * @return {!./service/performance-impl.Performance}
     */ }, { key: "performanceForOrNull", value:
    function performanceForOrNull(window) {
      return (/** @type {!./service/performance-impl.Performance}*/(
        getExistingServiceOrNull(window, 'performance')));

    }

    /**
     * @param {!Window} window
     * @return {!./service/platform-impl.Platform}
     */ }, { key: "platformFor", value:
    function platformFor(window) {
      return (/** @type {!./service/platform-impl.Platform} */(
        getService(window, 'platform')));

    }

    /**
     * Not installed by default; must be installed in extension code before use.
     * @param {!Element|!ShadowRoot} element
     * @return {!./service/position-observer/position-observer-impl.PositionObserver}
     * @throws If the service is not installed.
     */ }, { key: "positionObserverForDoc", value:
    function positionObserverForDoc(element) {
      return (/** @type {!./service/position-observer/position-observer-impl.PositionObserver} */(
        getServiceForDoc(element, 'position-observer')));

    }

    /**
     * @param {!Window} window
     * @return {!./preconnect.PreconnectService}
     */ }, { key: "preconnectFor", value:
    function preconnectFor(window) {
      return getService(window, 'preconnect');
    }

    /**
     * @param {!Element|!./service/ampdoc-impl.AmpDoc} elementOrAmpDoc
     * @return {!./service/resources-interface.ResourcesInterface}
     */ }, { key: "resourcesForDoc", value:
    function resourcesForDoc(elementOrAmpDoc) {
      return (/** @type {!./service/resources-interface.ResourcesInterface} */(
        getServiceForDoc(elementOrAmpDoc, 'resources')));

    }

    /**
     * @param {!Element|!./service/ampdoc-impl.AmpDoc} elementOrAmpDoc
     * @return {!Promise<!./service/resources-interface.ResourcesInterface>}
     */ }, { key: "resourcesPromiseForDoc", value:
    function resourcesPromiseForDoc(elementOrAmpDoc) {
      return (/** @type {!Promise<!./service/resources-interface.ResourcesInterface>} */(
        getServicePromiseForDoc(elementOrAmpDoc, 'resources')));

    }

    /**
     * @param {!Window} win
     * @return {?Promise<?../extensions/amp-story/1.0/variable-service.AmpStoryVariableService>}
     */ }, { key: "storyVariableServiceForOrNull", value:
    function storyVariableServiceForOrNull(win) {
      return (
        /** @type {!Promise<?../extensions/amp-story/1.0/variable-service.AmpStoryVariableService>} */(
        getElementServiceIfAvailable(win, 'story-variable', 'amp-story', '1.0')));

    }

    /**
     * @param {!Window} win
     * @return {?../extensions/amp-story/1.0/variable-service.AmpStoryVariableService}
     */ }, { key: "storyVariableService", value:
    function storyVariableService(win) {
      return (
        /** @type {?../extensions/amp-story/1.0/variable-service.AmpStoryVariableService} */(
        getExistingServiceOrNull(win, 'story-variable')));

    }

    /**
     * Version of the story store service depends on which version of amp-story
     * the publisher is loading. They all have the same implementation.
     * @param {!Window} win
     * @return {?Promise<?../extensions/amp-story/1.0/amp-story-store-service.AmpStoryStoreService>}
     */ }, { key: "storyStoreServiceForOrNull", value:
    function storyStoreServiceForOrNull(win) {
      return (
        /** @type {!Promise<?../extensions/amp-story/1.0/amp-story-store-service.AmpStoryStoreService>} */(
        getElementServiceIfAvailable(win, 'story-store', 'amp-story', '1.0')));

    }

    /**
     * @param {!Window} win
     * @return {?../extensions/amp-story/1.0/amp-story-store-service.AmpStoryStoreService}
     */ }, { key: "storyStoreService", value:
    function storyStoreService(win) {
      return (
        /** @type {?../extensions/amp-story/1.0/amp-story-store-service.AmpStoryStoreService} */(
        getExistingServiceOrNull(win, 'story-store')));

    }

    /**
     * @param {!Window} win
     * @return {?../extensions/amp-story/1.0/amp-story-media-query-service.AmpStoryMediaQueryService}
     */ }, { key: "storyMediaQueryService", value:
    function storyMediaQueryService(win) {
      return (
        /** @type {?../extensions/amp-story/1.0/amp-story-media-query-service.AmpStoryMediaQueryService} */(
        getExistingServiceOrNull(win, 'story-media-query')));

    }

    /**
     * Get promise with story request service
     * @param {!Window} win
     * @return {?Promise<?../extensions/amp-story/1.0/amp-story-request-service.AmpStoryRequestService>}
     */ }, { key: "storyRequestServiceForOrNull", value:
    function storyRequestServiceForOrNull(win) {
      return (
        /** @type {!Promise<?../extensions/amp-story/1.0/amp-story-request-service.AmpStoryRequestService>} */(
        getElementServiceIfAvailable(win, 'story-request', 'amp-story', '1.0')));

    }

    /**
     * @param {!Window} win
     * @return {?../extensions/amp-story/1.0/amp-story-request-service.AmpStoryRequestService}
     */ }, { key: "storyRequestService", value:
    function storyRequestService(win) {
      return (
        /** @type {?../extensions/amp-story/1.0/amp-story-request-service.AmpStoryRequestService} */(
        getExistingServiceOrNull(win, 'story-request')));

    }

    /**
     * @param {!Window} win
     * @return {?../extensions/amp-story/1.0/media-performance-metrics-service.MediaPerformanceMetricsService}
     */ }, { key: "mediaPerformanceMetricsService", value:
    function mediaPerformanceMetricsService(win) {
      return (
        /** @type {?../extensions/amp-story/1.0/media-performance-metrics-service.MediaPerformanceMetricsService} */(
        getExistingServiceOrNull(win, 'media-performance-metrics')));

    }

    /**
     * @param {!Element} el
     * @return {!Promise<./service/localization.LocalizationService>}
     */ }, { key: "localizationServiceForOrNull", value:
    function localizationServiceForOrNull(el) {
      return (/** @type {!Promise<?./service/localization.LocalizationService>} */(
        getServicePromiseForDoc(el, 'localization')));

    }

    /**
     * @param {!Element} element
     * @return {?./service/localization.LocalizationService}
     */ }, { key: "localizationForDoc", value:
    function localizationForDoc(element) {
      return (/** @type {?./service/localization.LocalizationService} */(
        getServiceForDocOrNull(element, 'localization')));

    }

    /**
     * TODO(#14357): Remove this when amp-story:0.1 is deprecated.
     * @param {!Window} win
     * @return {!Promise<?../extensions/amp-story/1.0/story-analytics.StoryAnalyticsService>}
     */ }, { key: "storyAnalyticsServiceForOrNull", value:
    function storyAnalyticsServiceForOrNull(win) {
      return (
        /** @type {!Promise<?../extensions/amp-story/1.0/story-analytics.StoryAnalyticsService>} */(

        getElementServiceIfAvailable(
        win,
        'story-analytics',
        'amp-story',
        '1.0',
        true)));



    }

    /**
     * @param {!Window} win
     * @return {?../extensions/amp-story/1.0/story-analytics.StoryAnalyticsService}
     */ }, { key: "storyAnalyticsService", value:
    function storyAnalyticsService(win) {
      return (
        /** @type {?../extensions/amp-story/1.0/story-analytics.StoryAnalyticsService} */(
        getExistingServiceOrNull(win, 'story-analytics')));

    }

    /**
     * @param {!Element|!ShadowRoot} element
     * @return {!Promise<!../extensions/amp-animation/0.1/web-animation-service.WebAnimationService>}
     */ }, { key: "webAnimationServiceFor", value:
    function webAnimationServiceFor(element) {
      return (
        /** @type {!Promise<!../extensions/amp-animation/0.1/web-animation-service.WebAnimationService>} */(
        getElementServiceForDoc(element, 'web-animation', 'amp-animation')));

    }

    /**
     * @param {!Element|!./service/ampdoc-impl.AmpDoc} elementOrAmpDoc
     * @return {!Promise<!./service/real-time-config/real-time-config-impl.RealTimeConfigManager>}
     */ }, { key: "realTimeConfigForDoc", value:
    function realTimeConfigForDoc(elementOrAmpDoc) {
      return (/** @type {!Promise<!./service/real-time-config/real-time-config-impl.RealTimeConfigManager>} */(
        getServicePromiseForDoc(elementOrAmpDoc, 'real-time-config')));

    }

    /**
     * @param {!Element|!./service/ampdoc-impl.AmpDoc} elementOrAmpDoc
     * @return {!Promise<!./service/storage-impl.Storage>}
     */ }, { key: "storageForDoc", value:
    function storageForDoc(elementOrAmpDoc) {
      return (/** @type {!Promise<!./service/storage-impl.Storage>} */(
        getServicePromiseForDoc(elementOrAmpDoc, 'storage')));

    }

    /**
     * @param {!Element|!./service/ampdoc-impl.AmpDoc} elementOrAmpDoc
     * @return {!Promise<!./service/storage-impl.Storage>}
     * TODO(dmanek): Add tests for this method.
     */ }, { key: "storageForTopLevelDoc", value:
    function storageForTopLevelDoc(elementOrAmpDoc) {
      var thisAmpdoc = Services.ampdoc(elementOrAmpDoc);
      var ampdocService = Services.ampdocServiceFor(thisAmpdoc.win);
      var topAmpdoc = ampdocService.isSingleDoc() ?
      ampdocService.getSingleDoc() :
      null;
      // We need to verify that ampdocs are on the same origin, therefore
      // we compare the windows of both.
      var ampdoc =
      topAmpdoc && topAmpdoc.win == thisAmpdoc.win ? topAmpdoc : thisAmpdoc;
      return (/** @type {!Promise<!./service/storage-impl.Storage>} */(
        getServicePromiseForDoc(ampdoc, 'storage')));

    }

    /**
     * @param {!Element|!./service/ampdoc-impl.AmpDoc} elementOrAmpDoc
     * @return {!./service/template-impl.Templates}
     */ }, { key: "templatesForDoc", value:
    function templatesForDoc(elementOrAmpDoc) {
      return (/** @type {!./service/template-impl.Templates} */(
        getServiceForDoc(elementOrAmpDoc, 'templates')));

    }

    /**
     * @param {!Window} window
     * @return {!./service/timer-impl.Timer}
     */ }, { key: "timerFor", value:
    function timerFor(window) {
      // TODO(alabiaga): This will always return the top window's Timer service.
      return (/** @type {!./service/timer-impl.Timer} */(
        getServiceInEmbedWin(window, 'timer')));

    }

    /**
     * @param {!Element|!ShadowRoot} element
     * @return {!./service/url-replacements-impl.UrlReplacements}
     */ }, { key: "urlReplacementsForDoc", value:
    function urlReplacementsForDoc(element) {
      return (/** @type {!./service/url-replacements-impl.UrlReplacements} */(
        getServiceForDocOrNull(element, 'url-replace')));

    }

    /**
     * @param {!Element|!ShadowRoot} element
     * @return {!Promise<!../extensions/amp-user-notification/0.1/amp-user-notification.UserNotificationManager>}
     */ }, { key: "userNotificationManagerForDoc", value:
    function userNotificationManagerForDoc(element) {
      return (
        /** @type {!Promise<!../extensions/amp-user-notification/0.1/amp-user-notification.UserNotificationManager>} */(

        getElementServiceForDoc(
        element,
        'userNotificationManager',
        'amp-user-notification')));



    }

    /**
     * Returns a promise for the consentPolicy Service or a promise for null if
     * the service is not available on the current page.
     * @param {!Element|!ShadowRoot} element
     * @return {!Promise<?../extensions/amp-consent/0.1/consent-policy-manager.ConsentPolicyManager>}
     */ }, { key: "consentPolicyServiceForDocOrNull", value:
    function consentPolicyServiceForDocOrNull(element) {
      return (
        /** @type {!Promise<?../extensions/amp-consent/0.1/consent-policy-manager.ConsentPolicyManager>} */(

        getElementServiceIfAvailableForDoc(
        element,
        'consentPolicyManager',
        'amp-consent')));



    }

    /**
     * Returns a promise for the geo service or a promise for null if
     * the service is not available on the current page.
     * @param {!Element|!ShadowRoot} element
     * @return {!Promise<?../extensions/amp-geo/0.1/amp-geo.GeoDef>}
     */ }, { key: "geoForDocOrNull", value:
    function geoForDocOrNull(element) {
      return (/** @type {!Promise<?../extensions/amp-geo/0.1/amp-geo.GeoDef>} */(
        getElementServiceIfAvailableForDoc(element, 'geo', 'amp-geo', true)));

    }

    /**
     * Unlike most service getters, passing `Node` is necessary for some FIE-scope
     * services since sometimes we only have the FIE Document for context.
     * @param {!Element|!ShadowRoot} element
     * @return {!./service/url-impl.Url}
     */ }, { key: "urlForDoc", value:
    function urlForDoc(element) {
      return (/** @type {!./service/url-impl.Url} */(
        getServiceForDocOrNull(element, 'url')));

    }

    /**
     * Returns a promise for the experiment variants or a promise for null if it
     * is not available on the current page.
     * @param {!Element|!ShadowRoot} element
     * @return {!Promise<?../extensions/amp-experiment/0.1/variant.Variants>}
     */ }, { key: "variantsForDocOrNull", value:
    function variantsForDocOrNull(element) {
      return (/** @type {!Promise<?../extensions/amp-experiment/0.1/variant.Variants>} */(
        getElementServiceIfAvailableForDoc(
        element,
        'variant',
        'amp-experiment',
        true)));


    }

    /**
     * @param {!Element|!./service/ampdoc-impl.AmpDoc} elementOrAmpDoc
     * @return {!./service/video-manager-impl.VideoManager}
     */ }, { key: "videoManagerForDoc", value:
    function videoManagerForDoc(elementOrAmpDoc) {
      return (/** @type {!./service/video-manager-impl.VideoManager} */(
        getServiceForDoc(elementOrAmpDoc, 'video-manager')));

    }

    /**
     * @param {!Element|!./service/ampdoc-impl.AmpDoc} elementOrAmpDoc
     * @return {!./service/viewer-interface.ViewerInterface}
     */ }, { key: "viewerForDoc", value:
    function viewerForDoc(elementOrAmpDoc) {
      return (/** @type {!./service/viewer-interface.ViewerInterface} */(
        getServiceForDoc(elementOrAmpDoc, 'viewer')));

    }

    /**
     * Returns promise for the viewer. This is an unusual case and necessary only
     * for services that need reference to the viewer before it has been
     * initialized. Most of the code, however, just should use `viewerForDoc`.
     * @param {!Element|!./service/ampdoc-impl.AmpDoc} elementOrAmpDoc
     * @return {!Promise<!./service/viewer-interface.ViewerInterface>}
     */ }, { key: "viewerPromiseForDoc", value:
    function viewerPromiseForDoc(elementOrAmpDoc) {
      return (/** @type {!Promise<!./service/viewer-interface.ViewerInterface>} */(
        getServicePromiseForDoc(elementOrAmpDoc, 'viewer')));

    }

    /**
     * @param {!Window} window
     * @return {!./service/vsync-impl.Vsync}
     */ }, { key: "vsyncFor", value:
    function vsyncFor(window) {
      return (/** @type {!./service/vsync-impl.Vsync} */(
        getService(window, 'vsync')));

    }

    /**
     * @param {!Element|!./service/ampdoc-impl.AmpDoc} elementOrAmpDoc
     * @return {!./service/viewport/viewport-interface.ViewportInterface}
     */ }, { key: "viewportForDoc", value:
    function viewportForDoc(elementOrAmpDoc) {
      return (/** @type {!./service/viewport/viewport-interface.ViewportInterface} */(
        getServiceForDoc(elementOrAmpDoc, 'viewport')));

    }

    /**
     * @param {!Window} window
     * @return {!./service/xhr-impl.Xhr}
     */ }, { key: "xhrFor", value:
    function xhrFor(window) {
      return (/** @type {!./service/xhr-impl.Xhr} */(getService(window, 'xhr')));
    }

    /**
     * @param {!Element|!./service/ampdoc-impl.AmpDoc} elementOrAmpDoc
     * @return {!Promise<../amp-cache-url/amp-cache-url.AmpCacheUrlService>}
     */ }, { key: "cacheUrlServicePromiseForDoc", value:
    function cacheUrlServicePromiseForDoc(elementOrAmpDoc) {
      return (/** @type {!Promise<?../amp-cache-url/amp-cache-url.AmpCacheUrlService>} */(
        getServicePromiseForDoc(elementOrAmpDoc, 'cache-url')));

    } }]);return Services;}();
// /Users/mszylkowski/src/amphtml/src/service/index.js