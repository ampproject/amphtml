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

import {
  getAmpdoc,
  getExistingServiceForDocInEmbedScope,
  getExistingServiceOrNull,
  getService,
  getServiceForDoc,
  getServicePromiseForDoc,
} from './service';
import {
  getElementServiceForDoc,
  getElementServiceIfAvailable,
  getElementServiceIfAvailableForDoc,
  getElementServiceIfAvailableForDocInEmbedScope,
} from './element-service';

/** @typedef {!../extensions/amp-subscriptions/0.1/amp-subscriptions.SubscriptionService} */
export let SubscriptionService;

export class Services {
  /**
   * Hint: Add extensions folder path to compile.js with
   * warnings cannot find modules.
   */

  /**
   * Returns a promise for the Access service.
   * @param {!Element|!ShadowRoot} element
   * @return {!Promise<!../extensions/amp-access/0.1/amp-access.AccessService>}
   */
  static accessServiceForDoc(element) {
    return /** @type {!Promise<!../extensions/amp-access/0.1/amp-access.AccessService>} */ (getElementServiceForDoc(
      element,
      'access',
      'amp-access'
    ));
  }

  /**
   * Returns a promise for the Access service or a promise for null if the
   * service is not available on the current page.
   * @param {!Element|!ShadowRoot} element
   * @return {!Promise<?../extensions/amp-access/0.1/amp-access.AccessService>}
   */
  static accessServiceForDocOrNull(element) {
    return /** @type {!Promise<?../extensions/amp-access/0.1/amp-access.AccessService>} */ (getElementServiceIfAvailableForDoc(
      element,
      'access',
      'amp-access'
    ));
  }

  /**
   * Returns a promise for the Subscriptions service.
   * @param {!Element|!ShadowRoot} element
   * @return {!Promise<!SubscriptionService>}
   */
  static subscriptionsServiceForDoc(element) {
    return /** @type {!Promise<!SubscriptionService>} */ (getElementServiceForDoc(
      element,
      'subscriptions',
      'amp-subscriptions'
    ));
  }

  /**
   * Returns a promise for the Subscriptions service.
   * @param {!Element|!ShadowRoot} element
   * @return {!Promise<?SubscriptionService>}
   */
  static subscriptionsServiceForDocOrNull(element) {
    return /** @type {!Promise<?SubscriptionService>} */ (getElementServiceIfAvailableForDoc(
      element,
      'subscriptions',
      'amp-subscriptions'
    ));
  }

  /**
   * @param {!Element|!ShadowRoot} element
   * @return {!./service/action-impl.ActionService}
   */
  static actionServiceForDoc(element) {
    return /** @type {!./service/action-impl.ActionService} */ (getExistingServiceForDocInEmbedScope(
      element,
      'action'
    ));
  }

  /**
   * @param {!Element|!ShadowRoot} element
   * @return {!./service/standard-actions-impl.StandardActions}
   */
  static standardActionsForDoc(element) {
    return /** @type {!./service/standard-actions-impl.StandardActions} */ (getExistingServiceForDocInEmbedScope(
      element,
      'standard-actions'
    ));
  }

  /**
   * @param {!Element|!ShadowRoot} element
   * @return {!Promise<!../extensions/amp-analytics/0.1/activity-impl.Activity>}
   */
  static activityForDoc(element) {
    return /** @type {!Promise<!../extensions/amp-analytics/0.1/activity-impl.Activity>} */ (getElementServiceForDoc(
      element,
      'activity',
      'amp-analytics'
    ));
  }

  /**
   * Returns the global instance of the `AmpDocService` service that can be
   * used to resolve an ampdoc for any node: either in the single-doc or
   * shadow-doc environment.
   * @param {!Window} window
   * @return {!./service/ampdoc-impl.AmpDocService}
   */
  static ampdocServiceFor(window) {
    return /** @type {!./service/ampdoc-impl.AmpDocService} */ (getService(
      window,
      'ampdoc'
    ));
  }

  /**
   * Returns the AmpDoc for the specified context node.
   * @param {!Node|!./service/ampdoc-impl.AmpDoc} nodeOrAmpDoc
   * @return {!./service/ampdoc-impl.AmpDoc}
   */
  static ampdoc(nodeOrAmpDoc) {
    return getAmpdoc(nodeOrAmpDoc);
  }

  /**
   * @param {!Element|!ShadowRoot} element
   * @param {boolean=} loadAnalytics
   * @return {!Promise<!../extensions/amp-analytics/0.1/instrumentation.InstrumentationService>}
   */
  static analyticsForDoc(element, loadAnalytics = false) {
    if (loadAnalytics) {
      // Get Extensions service and force load analytics extension.
      const ampdoc = getAmpdoc(element);
      Services.extensionsFor(ampdoc.win)./*OK*/ installExtensionForDoc(
        ampdoc,
        'amp-analytics'
      );
    }
    return /** @type {!Promise<!../extensions/amp-analytics/0.1/instrumentation.InstrumentationService>} */ (getElementServiceForDoc(
      element,
      'amp-analytics-instrumentation',
      'amp-analytics'
    ));
  }

  /**
   * @param {!Element|!ShadowRoot} element
   * @return {!Promise<?../extensions/amp-analytics/0.1/instrumentation.InstrumentationService>}
   */
  static analyticsForDocOrNull(element) {
    return /** @type {!Promise<?../extensions/amp-analytics/0.1/instrumentation.InstrumentationService>} */ (getElementServiceIfAvailableForDoc(
      element,
      'amp-analytics-instrumentation',
      'amp-analytics'
    ));
  }

  /**
   * @param {!Window} window
   * @return {!./service/batched-xhr-impl.BatchedXhr}
   */
  static batchedXhrFor(window) {
    return /** @type {!./service/batched-xhr-impl.BatchedXhr} */ (getService(
      window,
      'batched-xhr'
    ));
  }

  /**
   * @param {!Element|!ShadowRoot} element
   * @return {!Promise<?../extensions/amp-bind/0.1/bind-impl.Bind>}
   */
  static bindForDocOrNull(element) {
    return /** @type {!Promise<?../extensions/amp-bind/0.1/bind-impl.Bind>} */ (getElementServiceIfAvailableForDocInEmbedScope(
      element,
      'bind',
      'amp-bind'
    ));
  }

  /**
   * @param {!Element|!ShadowRoot} element
   * @return {!Promise<?../extensions/amp-script/0.1/amp-script.AmpScriptService>}
   */
  static scriptForDocOrNull(element) {
    return /** @type {!Promise<?../extensions/amp-script/0.1/amp-script.AmpScriptService>} */ (getElementServiceIfAvailableForDocInEmbedScope(
      element,
      'amp-script',
      'amp-script'
    ));
  }

  /**
   * @param {!Element|!ShadowRoot|!./service/ampdoc-impl.AmpDoc} elementOrAmpDoc
   * @return {!Promise<!./service/cid-impl.CidDef>}
   */
  static cidForDoc(elementOrAmpDoc) {
    return /** @type {!Promise<!./service/cid-impl.CidDef>} */ (getServicePromiseForDoc(
      elementOrAmpDoc,
      'cid'
    ));
  }

  /**
   * @param {!Element|!./service/ampdoc-impl.AmpDoc} elementOrAmpDoc
   * @return {!./service/navigation.Navigation}
   */
  static navigationForDoc(elementOrAmpDoc) {
    return /** @type {!./service/navigation.Navigation} */ (getServiceForDoc(
      elementOrAmpDoc,
      'navigation'
    ));
  }

  /**
   * @param {!Element|!ShadowRoot} element
   * @return {!Promise<!../extensions/amp-loader/0.1/amp-loader.LoaderService>}
   */
  static loaderServiceForDoc(element) {
    return /** @type {!Promise<!../extensions/amp-loader/0.1/amp-loader.LoaderService>} */ (getElementServiceForDoc(
      element,
      'loader',
      'amp-loader'
    ));
  }

  /**
   * @param {!Element|!ShadowRoot} element
   * @return {!Promise<!../extensions/amp-standalone/0.1/amp-standalone.StandaloneService>}
   */
  static standaloneServiceForDoc(element) {
    return /** @type {!Promise<!../extensions/amp-standalone/0.1/amp-standalone.StandaloneService>} */ (getElementServiceForDoc(
      element,
      'standalone',
      'amp-standalone'
    ));
  }

  /**
   * @param {!Window} window
   * @return {!./service/crypto-impl.Crypto}
   */
  static cryptoFor(window) {
    return /** @type {!./service/crypto-impl.Crypto} */ (getService(
      window,
      'crypto'
    ));
  }

  /**
   * @param {!Element|!./service/ampdoc-impl.AmpDoc} elementOrAmpDoc
   * @return {!./service/document-info-impl.DocumentInfoDef} Info about the doc
   */
  static documentInfoForDoc(elementOrAmpDoc) {
    return /** @type {!./service/document-info-impl.DocInfo} */ (getServiceForDoc(
      elementOrAmpDoc,
      'documentInfo'
    )).get();
  }

  /**
   * @param {!Window} window
   * @return {!./service/extensions-impl.Extensions}
   */
  static extensionsFor(window) {
    return /** @type {!./service/extensions-impl.Extensions} */ (getService(
      window,
      'extensions'
    ));
  }

  /**
   * Returns a service to register callbacks we wish to execute when an
   * amp-form is submitted.
   * @param {!Element|!./service/ampdoc-impl.AmpDoc} elementOrAmpDoc
   * @return {!Promise<../extensions/amp-form/0.1/form-submit-service.FormSubmitService>}
   */
  static formSubmitForDoc(elementOrAmpDoc) {
    return /** @type {!Promise<../extensions/amp-form/0.1/form-submit-service.FormSubmitService>} */ (getServicePromiseForDoc(
      elementOrAmpDoc,
      'form-submit-service'
    ));
  }

  /**
   * Returns service to listen for `hidden` attribute mutations.
   * @param {!Element|!ShadowRoot} element
   * @return {!./service/hidden-observer-impl.HiddenObserver}
   */
  static hiddenObserverForDoc(element) {
    return /** @type {!./service/hidden-observer-impl.HiddenObserver} */ (getExistingServiceForDocInEmbedScope(
      element,
      'hidden-observer'
    ));
  }

  /**
   * Returns service implemented in service/history-impl.
   * @param {!Element|!./service/ampdoc-impl.AmpDoc} elementOrAmpDoc
   * @return {!./service/history-impl.History}
   */
  static historyForDoc(elementOrAmpDoc) {
    return /** @type {!./service/history-impl.History} */ (getServiceForDoc(
      elementOrAmpDoc,
      'history'
    ));
  }

  /**
   * @param {!Window} win
   * @return {!./input.Input}
   */
  static inputFor(win) {
    return getService(win, 'input');
  }

  /**s
   * Returns a promise for the Inputmask service.
   * @param {!Element|!ShadowRoot} element
   * @return {!Promise<?../extensions/amp-inputmask/0.1/amp-inputmask.AmpInputmaskService>}
   */
  static inputmaskServiceForDocOrNull(element) {
    return /** @type {!Promise<?../extensions/amp-inputmask/0.1/amp-inputmask.AmpInputmaskService>} */ (getElementServiceIfAvailableForDoc(
      element,
      'inputmask',
      'amp-inputmask'
    ));
  }

  /**
   * @param {!Element|!./service/ampdoc-impl.AmpDoc} elementOrAmpDoc
   * @return {!../extensions/amp-next-page/1.0/service.NextPageService}
   */
  static nextPageServiceForDoc(elementOrAmpDoc) {
    return /** @type {!../extensions/amp-next-page/1.0/service.NextPageService} */ (getServiceForDoc(
      elementOrAmpDoc,
      'next-page'
    ));
  }

  /**
   * @param {!Element|!./service/ampdoc-impl.AmpDoc} elementOrAmpDoc
   * @return {!./service/mutator-interface.MutatorInterface}
   */
  static mutatorForDoc(elementOrAmpDoc) {
    return /** @type {!./service/mutator-interface.MutatorInterface} */ (getServiceForDoc(
      elementOrAmpDoc,
      'mutator'
    ));
  }

  /**
   * @param {!Element|!./service/ampdoc-impl.AmpDoc} elementOrAmpDoc
   * @return {!./service/owners-interface.OwnersInterface}
   */
  static ownersForDoc(elementOrAmpDoc) {
    return /** @type {!./service/owners-interface.OwnersInterface} */ (getServiceForDoc(
      elementOrAmpDoc,
      'owners'
    ));
  }

  /**
   * @param {!Window} window
   * @return {!./service/performance-impl.Performance}
   */
  static performanceFor(window) {
    return /** @type {!./service/performance-impl.Performance}*/ (getService(
      window,
      'performance'
    ));
  }

  /**
   * @param {!Window} window
   * @return {!./service/performance-impl.Performance}
   */
  static performanceForOrNull(window) {
    return /** @type {!./service/performance-impl.Performance}*/ (getExistingServiceOrNull(
      window,
      'performance'
    ));
  }

  /**
   * @param {!Window} window
   * @return {!./service/platform-impl.Platform}
   */
  static platformFor(window) {
    return /** @type {!./service/platform-impl.Platform} */ (getService(
      window,
      'platform'
    ));
  }

  /**
   * Not installed by default; must be installed in extension code before use.
   * @param {!Element|!ShadowRoot} element
   * @return {!./service/position-observer/position-observer-impl.PositionObserver}
   * @throws If the service is not installed.
   */
  static positionObserverForDoc(element) {
    return /** @type {!./service/position-observer/position-observer-impl.PositionObserver} */ (getServiceForDoc(
      element,
      'position-observer'
    ));
  }

  /**
   * @param {!Window} window
   * @return {!./preconnect.PreconnectService}
   */
  static preconnectFor(window) {
    return getService(window, 'preconnect');
  }

  /**
   * @param {!Element|!./service/ampdoc-impl.AmpDoc} elementOrAmpDoc
   * @return {!./service/resources-interface.ResourcesInterface}
   */
  static resourcesForDoc(elementOrAmpDoc) {
    return /** @type {!./service/resources-interface.ResourcesInterface} */ (getServiceForDoc(
      elementOrAmpDoc,
      'resources'
    ));
  }

  /**
   * @param {!Element|!./service/ampdoc-impl.AmpDoc} elementOrAmpDoc
   * @return {!Promise<!./service/resources-interface.ResourcesInterface>}
   */
  static resourcesPromiseForDoc(elementOrAmpDoc) {
    return /** @type {!Promise<!./service/resources-interface.ResourcesInterface>} */ (getServicePromiseForDoc(
      elementOrAmpDoc,
      'resources'
    ));
  }

  /**
   * @param {!Window} win
   * @return {?Promise<?../extensions/amp-story/1.0/variable-service.AmpStoryVariableService>}
   */
  static storyVariableServiceForOrNull(win) {
    return (
      /** @type {!Promise<?../extensions/amp-story/1.0/variable-service.AmpStoryVariableService>} */
      (getElementServiceIfAvailable(win, 'story-variable', 'amp-story'))
    );
  }

  /**
   * @param {!Window} win
   * @return {?../extensions/amp-story/1.0/variable-service.AmpStoryVariableService}
   */
  static storyVariableService(win) {
    return (
      /** @type {?../extensions/amp-story/1.0/variable-service.AmpStoryVariableService} */
      (getExistingServiceOrNull(win, 'story-variable'))
    );
  }

  /**
   * Version of the story store service depends on which version of amp-story
   * the publisher is loading. They all have the same implementation.
   * @param {!Window} win
   * @return {?Promise<?../extensions/amp-story/1.0/amp-story-store-service.AmpStoryStoreService>}
   */
  static storyStoreServiceForOrNull(win) {
    return (
      /** @type {!Promise<?../extensions/amp-story/1.0/amp-story-store-service.AmpStoryStoreService>} */
      (getElementServiceIfAvailable(win, 'story-store', 'amp-story'))
    );
  }

  /**
   * @param {!Window} win
   * @return {?../extensions/amp-story/1.0/amp-story-store-service.AmpStoryStoreService}
   */
  static storyStoreService(win) {
    return (
      /** @type {?../extensions/amp-story/1.0/amp-story-store-service.AmpStoryStoreService} */
      (getExistingServiceOrNull(win, 'story-store'))
    );
  }

  /**
   * @param {!Window} win
   * @return {?../extensions/amp-story/1.0/amp-story-media-query-service.AmpStoryMediaQueryService}
   */
  static storyMediaQueryService(win) {
    return (
      /** @type {?../extensions/amp-story/1.0/amp-story-media-query-service.AmpStoryMediaQueryService} */
      (getExistingServiceOrNull(win, 'story-media-query'))
    );
  }

  /**
   * Get promise with story request service
   * @param {!Window} win
   * @return {?Promise<?../extensions/amp-story/1.0/amp-story-request-service.AmpStoryRequestService>}
   */
  static storyRequestServiceForOrNull(win) {
    return (
      /** @type {!Promise<?../extensions/amp-story/1.0/amp-story-request-service.AmpStoryRequestService>} */
      (getElementServiceIfAvailable(win, 'story-request', 'amp-story'))
    );
  }

  /**
   * @param {!Window} win
   * @return {?../extensions/amp-story/1.0/amp-story-request-service.AmpStoryRequestService}
   */
  static storyRequestService(win) {
    return (
      /** @type {?../extensions/amp-story/1.0/amp-story-request-service.AmpStoryRequestService} */
      (getExistingServiceOrNull(win, 'story-request'))
    );
  }

  /**
   * @param {!Window} win
   * @return {?../extensions/amp-story/1.0/media-performance-metrics-service.MediaPerformanceMetricsService}
   */
  static mediaPerformanceMetricsService(win) {
    return (
      /** @type {?../extensions/amp-story/1.0/media-performance-metrics-service.MediaPerformanceMetricsService} */
      (getExistingServiceOrNull(win, 'media-performance-metrics'))
    );
  }

  /**
   * @param {!Element} el
   * @return {!Promise<./service/localization.LocalizationService>}
   */
  static localizationServiceForOrNull(el) {
    return /** @type {!Promise<?./service/localization.LocalizationService>} */ (getServicePromiseForDoc(
      el,
      'localization'
    ));
  }

  /**
   * @param {!Element} element
   * @return {?./service/localization.LocalizationService}
   */
  static localizationForDoc(element) {
    return /** @type {?./service/localization.LocalizationService} */ (getExistingServiceForDocInEmbedScope(
      element,
      'localization'
    ));
  }

  /**
   * TODO(#14357): Remove this when amp-story:0.1 is deprecated.
   * @param {!Window} win
   * @return {!Promise<?../extensions/amp-story/1.0/story-analytics.StoryAnalyticsService>}
   */
  static storyAnalyticsServiceForOrNull(win) {
    return (
      /** @type {!Promise<?../extensions/amp-story/1.0/story-analytics.StoryAnalyticsService>} */
      (getElementServiceIfAvailable(win, 'story-analytics', 'amp-story', true))
    );
  }

  /**
   * @param {!Window} win
   * @return {?../extensions/amp-story/1.0/story-analytics.StoryAnalyticsService}
   */
  static storyAnalyticsService(win) {
    return (
      /** @type {?../extensions/amp-story/1.0/story-analytics.StoryAnalyticsService} */
      (getExistingServiceOrNull(win, 'story-analytics'))
    );
  }

  /**
   * @param {!Element|!ShadowRoot} element
   * @return {!Promise<!../extensions/amp-animation/0.1/web-animation-service.WebAnimationService>}
   */
  static webAnimationServiceFor(element) {
    return (
      /** @type {!Promise<!../extensions/amp-animation/0.1/web-animation-service.WebAnimationService>} */
      (getElementServiceForDoc(element, 'web-animation', 'amp-animation'))
    );
  }

  /**
   * @param {!Element|!./service/ampdoc-impl.AmpDoc} elementOrAmpDoc
   * @return {!Promise<!./service/storage-impl.Storage>}
   */
  static storageForDoc(elementOrAmpDoc) {
    return /** @type {!Promise<!./service/storage-impl.Storage>} */ (getServicePromiseForDoc(
      elementOrAmpDoc,
      'storage'
    ));
  }

  /**
   * @param {!Window} window
   * @return {!./service/template-impl.Templates}
   */
  static templatesFor(window) {
    return /** @type {!./service/template-impl.Templates} */ (getService(
      window,
      'templates'
    ));
  }

  /**
   * @param {!Window} window
   * @return {!./service/timer-impl.Timer}
   */
  static timerFor(window) {
    // TODO(alabiaga): This will always return the top window's Timer service.
    return /** @type {!./service/timer-impl.Timer} */ (getService(
      window,
      'timer'
    ));
  }

  /**
   * @param {!Element|!ShadowRoot} element
   * @return {!./service/url-replacements-impl.UrlReplacements}
   */
  static urlReplacementsForDoc(element) {
    return /** @type {!./service/url-replacements-impl.UrlReplacements} */ (getExistingServiceForDocInEmbedScope(
      element,
      'url-replace'
    ));
  }

  /**
   * @param {!Element|!ShadowRoot} element
   * @return {!Promise<!../extensions/amp-user-notification/0.1/amp-user-notification.UserNotificationManager>}
   */
  static userNotificationManagerForDoc(element) {
    return (
      /** @type {!Promise<!../extensions/amp-user-notification/0.1/amp-user-notification.UserNotificationManager>} */
      (getElementServiceForDoc(
        element,
        'userNotificationManager',
        'amp-user-notification'
      ))
    );
  }

  /**
   * Returns a promise for the consentPolicy Service or a promise for null if
   * the service is not available on the current page.
   * @param {!Element|!ShadowRoot} element
   * @return {!Promise<?../extensions/amp-consent/0.1/consent-policy-manager.ConsentPolicyManager>}
   */
  static consentPolicyServiceForDocOrNull(element) {
    return (
      /** @type {!Promise<?../extensions/amp-consent/0.1/consent-policy-manager.ConsentPolicyManager>} */
      (getElementServiceIfAvailableForDoc(
        element,
        'consentPolicyManager',
        'amp-consent'
      ))
    );
  }

  /**
   * Returns a promise for the geo service or a promise for null if
   * the service is not available on the current page.
   * @param {!Element|!ShadowRoot} element
   * @return {!Promise<?../extensions/amp-geo/0.1/amp-geo.GeoDef>}
   */
  static geoForDocOrNull(element) {
    return /** @type {!Promise<?../extensions/amp-geo/0.1/amp-geo.GeoDef>} */ (getElementServiceIfAvailableForDoc(
      element,
      'geo',
      'amp-geo',
      true
    ));
  }

  /**
   * Unlike most service getters, passing `Node` is necessary for some FIE-scope
   * services since sometimes we only have the FIE Document for context.
   * @param {!Element|!ShadowRoot} element
   * @return {!./service/url-impl.Url}
   */
  static urlForDoc(element) {
    return /** @type {!./service/url-impl.Url} */ (getExistingServiceForDocInEmbedScope(
      element,
      'url'
    ));
  }

  /**
   * Returns a promise for the experiment variants or a promise for null if it
   * is not available on the current page.
   * @param {!Element|!ShadowRoot} element
   * @return {!Promise<?../extensions/amp-experiment/0.1/variant.Variants>}
   */
  static variantsForDocOrNull(element) {
    return /** @type {!Promise<?../extensions/amp-experiment/0.1/variant.Variants>} */ (getElementServiceIfAvailableForDoc(
      element,
      'variant',
      'amp-experiment',
      true
    ));
  }

  /**
   * @param {!Element|!./service/ampdoc-impl.AmpDoc} elementOrAmpDoc
   * @return {!./service/video-manager-impl.VideoManager}
   */
  static videoManagerForDoc(elementOrAmpDoc) {
    return /** @type {!./service/video-manager-impl.VideoManager} */ (getServiceForDoc(
      elementOrAmpDoc,
      'video-manager'
    ));
  }

  /**
   * @param {!Element|!ShadowRoot} element
   * @return {!Promise<?../extensions/amp-viewer-assistance/0.1/amp-viewer-assistance.AmpViewerAssistance>}
   */
  static viewerAssistanceForDocOrNull(element) {
    return (
      /** @type {!Promise<?../extensions/amp-viewer-assistance/0.1/amp-viewer-assistance.AmpViewerAssistance>} */
      (getElementServiceIfAvailableForDoc(
        element,
        'amp-viewer-assistance',
        'amp-viewer-assistance'
      ))
    );
  }

  /**
   * @param {!Element|!./service/ampdoc-impl.AmpDoc} elementOrAmpDoc
   * @return {!./service/viewer-interface.ViewerInterface}
   */
  static viewerForDoc(elementOrAmpDoc) {
    return /** @type {!./service/viewer-interface.ViewerInterface} */ (getServiceForDoc(
      elementOrAmpDoc,
      'viewer'
    ));
  }

  /**
   * Returns promise for the viewer. This is an unusual case and necessary only
   * for services that need reference to the viewer before it has been
   * initialized. Most of the code, however, just should use `viewerForDoc`.
   * @param {!Element|!./service/ampdoc-impl.AmpDoc} elementOrAmpDoc
   * @return {!Promise<!./service/viewer-interface.ViewerInterface>}
   */
  static viewerPromiseForDoc(elementOrAmpDoc) {
    return /** @type {!Promise<!./service/viewer-interface.ViewerInterface>} */ (getServicePromiseForDoc(
      elementOrAmpDoc,
      'viewer'
    ));
  }

  /**
   * @param {!Window} window
   * @return {!./service/vsync-impl.Vsync}
   */
  static vsyncFor(window) {
    return /** @type {!./service/vsync-impl.Vsync} */ (getService(
      window,
      'vsync'
    ));
  }

  /**
   * @param {!Element|!./service/ampdoc-impl.AmpDoc} elementOrAmpDoc
   * @return {!./service/viewport/viewport-interface.ViewportInterface}
   */
  static viewportForDoc(elementOrAmpDoc) {
    return /** @type {!./service/viewport/viewport-interface.ViewportInterface} */ (getServiceForDoc(
      elementOrAmpDoc,
      'viewport'
    ));
  }

  /**
   * @param {!Window} window
   * @return {!./service/xhr-impl.Xhr}
   */
  static xhrFor(window) {
    return /** @type {!./service/xhr-impl.Xhr} */ (getService(window, 'xhr'));
  }
}
