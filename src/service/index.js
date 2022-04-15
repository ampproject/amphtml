// This lint rule must be enabled on this file only.
// It checks that all Services properties are arrow function expressions.
// This allows unused getters to be stripped out from the bundle.
/* eslint local/service-getters: 2 */

import {
  getElementServiceForDoc,
  getElementServiceIfAvailable,
  getElementServiceIfAvailableForDoc,
  getElementServiceIfAvailableForDocInEmbedScope,
} from '../element-service';
import {
  getAmpdoc,
  getExistingServiceOrNull,
  getService,
  getServiceForDoc,
  getServiceForDocOrNull,
  getServiceInEmbedWin,
  getServicePromiseForDoc,
} from '../service-helpers';

/** @typedef {!../extensions/amp-subscriptions/0.1/amp-subscriptions.SubscriptionService} */
export let SubscriptionService;

/**
 * Returns the global instance of the `AmpDocService` service that can be
 * used to resolve an ampdoc for any node: either in the single-doc or
 * shadow-doc environment.
 * @param {!Window} window
 * @return {!./service/ampdoc-impl.AmpDocService}
 */
function ampdocServiceForInternal(window) {
  return /** @type {!./service/ampdoc-impl.AmpDocService} */ (
    getService(window, 'ampdoc')
  );
}

/**
 * Returns the AmpDoc for the specified context node.
 * @param {!Node|!./service/ampdoc-impl.AmpDoc} nodeOrAmpDoc
 * @return {!./service/ampdoc-impl.AmpDoc}
 */
function ampdocInternal(nodeOrAmpDoc) {
  return getAmpdoc(nodeOrAmpDoc);
}

/**
 * @param {!Window} window
 * @return {!./service/extensions-impl.Extensions}
 */
function extensionsForInternal(window) {
  return /** @type {!./service/extensions-impl.Extensions} */ (
    getService(window, 'extensions')
  );
}

/**
 * Services used to be a class full of static methods.
 * This was changed to an object in #36486 because terser has better minification
 * support for regular objects than static methods.
 *
 * In order to prevent deoptimizations, we must ensure:
 * - Services does not self-references.
 * - Services does not use method definition shorthand.
 */
export const Services = {
  /**
   * Hint: Add extensions folder path to compile.js with
   * warnings cannot find modules.
   */

  /**
   * Returns a promise for the Access service.
   * @param {!Element|!ShadowRoot} element
   * @return {!Promise<!../extensions/amp-access/0.1/amp-access.AccessService>}
   */
  accessServiceForDoc: (element) => {
    return /** @type {!Promise<!../extensions/amp-access/0.1/amp-access.AccessService>} */ (
      getElementServiceForDoc(element, 'access', 'amp-access')
    );
  },

  /**
   * Returns a promise for the Access service or a promise for null if the
   * service is not available on the current page.
   * @param {!Element|!ShadowRoot} element
   * @return {!Promise<?../extensions/amp-access/0.1/amp-access.AccessService>}
   */
  accessServiceForDocOrNull: (element) => {
    return /** @type {!Promise<?../extensions/amp-access/0.1/amp-access.AccessService>} */ (
      getElementServiceIfAvailableForDoc(element, 'access', 'amp-access')
    );
  },

  /**
   * Returns a promise for the Subscriptions service.
   * @param {!Element|!ShadowRoot} element
   * @return {!Promise<!SubscriptionService>}
   */
  subscriptionsServiceForDoc: (element) => {
    return /** @type {!Promise<!SubscriptionService>} */ (
      getElementServiceForDoc(element, 'subscriptions', 'amp-subscriptions')
    );
  },

  /**
   * Returns a promise for the Subscriptions service.
   * @param {!Element|!ShadowRoot} element
   * @return {!Promise<?SubscriptionService>}
   */
  subscriptionsServiceForDocOrNull: (element) => {
    return /** @type {!Promise<?SubscriptionService>} */ (
      getElementServiceIfAvailableForDoc(
        element,
        'subscriptions',
        'amp-subscriptions'
      )
    );
  },

  /**
   * @param {!Element|!ShadowRoot} element
   * @return {!./service/action-impl.ActionService}
   */
  actionServiceForDoc: (element) => {
    return /** @type {!./service/action-impl.ActionService} */ (
      getServiceForDocOrNull(element, 'action')
    );
  },

  /**
   * @param {!Element|!ShadowRoot} element
   * @return {!./service/standard-actions-impl.StandardActions}
   */
  standardActionsForDoc: (element) => {
    return /** @type {!./service/standard-actions-impl.StandardActions} */ (
      getServiceForDocOrNull(element, 'standard-actions')
    );
  },

  /**
   * @param {!Element|!ShadowRoot} element
   * @return {!Promise<!../extensions/amp-analytics/0.1/activity-impl.Activity>}
   */
  activityForDoc: (element) => {
    return /** @type {!Promise<!../extensions/amp-analytics/0.1/activity-impl.Activity>} */ (
      getElementServiceForDoc(element, 'activity', 'amp-analytics')
    );
  },

  ampdoc: (nodeOrAmpdoc) => ampdocInternal(nodeOrAmpdoc),
  ampdocServiceFor: (win) => ampdocServiceForInternal(win),

  /**
   * @param {!Element|!ShadowRoot} element
   * @param {boolean=} loadAnalytics
   * @return {!Promise<!../extensions/amp-analytics/0.1/instrumentation.InstrumentationService>}
   */
  analyticsForDoc: (element, loadAnalytics = false) => {
    if (loadAnalytics) {
      // Get Extensions service and force load analytics extension.
      const ampdoc = getAmpdoc(element);
      extensionsForInternal(ampdoc.win)./*OK*/ installExtensionForDoc(
        ampdoc,
        'amp-analytics'
      );
    }
    return /** @type {!Promise<!../extensions/amp-analytics/0.1/instrumentation.InstrumentationService>} */ (
      getElementServiceForDoc(
        element,
        'amp-analytics-instrumentation',
        'amp-analytics'
      )
    );
  },

  /**
   * @param {!Element|!ShadowRoot} element
   * @return {!Promise<?../extensions/amp-analytics/0.1/instrumentation.InstrumentationService>}
   */
  analyticsForDocOrNull: (element) => {
    return /** @type {!Promise<?../extensions/amp-analytics/0.1/instrumentation.InstrumentationService>} */ (
      getElementServiceIfAvailableForDoc(
        element,
        'amp-analytics-instrumentation',
        'amp-analytics'
      )
    );
  },

  /**
   * @param {!Window} window
   * @return {!./service/batched-xhr-impl.BatchedXhr}
   */
  batchedXhrFor: (window) => {
    return /** @type {!./service/batched-xhr-impl.BatchedXhr} */ (
      getService(window, 'batched-xhr')
    );
  },

  /**
   * @param {!Element|!ShadowRoot} element
   * @return {!Promise<?../extensions/amp-bind/0.1/bind-impl.Bind>}
   */
  bindForDocOrNull: (element) => {
    return /** @type {!Promise<?../extensions/amp-bind/0.1/bind-impl.Bind>} */ (
      getElementServiceIfAvailableForDocInEmbedScope(
        element,
        'bind',
        'amp-bind'
      )
    );
  },

  /**
   * @param {!Element|!ShadowRoot} element
   * @return {!Promise<?../extensions/amp-script/0.1/amp-script.AmpScriptService>}
   */
  scriptForDocOrNull: (element) => {
    return /** @type {!Promise<?../extensions/amp-script/0.1/amp-script.AmpScriptService>} */ (
      getElementServiceIfAvailableForDocInEmbedScope(
        element,
        'amp-script',
        'amp-script'
      )
    );
  },

  /**
   * @param {!Element|!ShadowRoot|!./service/ampdoc-impl.AmpDoc} elementOrAmpDoc
   * @return {!Promise<!./service/cid-impl.CidDef>}
   */
  cidForDoc: (elementOrAmpDoc) => {
    return /** @type {!Promise<!./service/cid-impl.CidDef>} */ (
      getServicePromiseForDoc(elementOrAmpDoc, 'cid')
    );
  },

  /**
   * @param {!Element|!./service/ampdoc-impl.AmpDoc} elementOrAmpDoc
   * @return {!./service/navigation.Navigation}
   */
  navigationForDoc: (elementOrAmpDoc) => {
    return /** @type {!./service/navigation.Navigation} */ (
      getServiceForDoc(elementOrAmpDoc, 'navigation')
    );
  },

  /**
   * @param {!Element|!ShadowRoot} element
   * @return {!Promise<!../extensions/amp-loader/0.1/amp-loader.LoaderService>}
   */
  loaderServiceForDoc: (element) => {
    return /** @type {!Promise<!../extensions/amp-loader/0.1/amp-loader.LoaderService>} */ (
      getElementServiceForDoc(element, 'loader', 'amp-loader')
    );
  },

  /**
   * @param {!Element|!ShadowRoot} element
   * @return {!Promise<!../extensions/amp-standalone/0.1/amp-standalone.StandaloneService>}
   */
  standaloneServiceForDoc: (element) => {
    return /** @type {!Promise<!../extensions/amp-standalone/0.1/amp-standalone.StandaloneService>} */ (
      getElementServiceForDoc(element, 'standalone', 'amp-standalone')
    );
  },

  /**
   * @param {!Window} window
   * @return {!./service/crypto-impl.Crypto}
   */
  cryptoFor: (window) => {
    return /** @type {!./service/crypto-impl.Crypto} */ (
      getService(window, 'crypto')
    );
  },

  /**
   * @param {!Element|!./service/ampdoc-impl.AmpDoc} elementOrAmpDoc
   * @return {!./service/document-info-impl.DocumentInfoDef} Info about the doc
   */
  documentInfoForDoc: (elementOrAmpDoc) => {
    return /** @type {!./service/document-info-impl.DocInfo} */ (
      getServiceForDoc(elementOrAmpDoc, 'documentInfo')
    ).get();
  },

  extensionsFor: (win) => extensionsForInternal(win),

  /**
   * Returns a service to register callbacks we wish to execute when an
   * amp-form is submitted.
   * @param {!Element|!./service/ampdoc-impl.AmpDoc} elementOrAmpDoc
   * @return {!Promise<../extensions/amp-form/0.1/form-submit-service.FormSubmitService>}
   */
  formSubmitForDoc: (elementOrAmpDoc) => {
    return /** @type {!Promise<../extensions/amp-form/0.1/form-submit-service.FormSubmitService>} */ (
      getServicePromiseForDoc(elementOrAmpDoc, 'form-submit-service')
    );
  },

  /**
   * Returns service to listen for `hidden` attribute mutations.
   * @param {!Element|!ShadowRoot} element
   * @return {!./service/hidden-observer-impl.HiddenObserver}
   */
  hiddenObserverForDoc: (element) => {
    return /** @type {!./service/hidden-observer-impl.HiddenObserver} */ (
      getServiceForDocOrNull(element, 'hidden-observer')
    );
  },

  /**
   * Returns service implemented in service/history-impl.
   * @param {!Element|!./service/ampdoc-impl.AmpDoc} elementOrAmpDoc
   * @return {!./service/history-impl.History}
   */
  historyForDoc: (elementOrAmpDoc) => {
    return /** @type {!./service/history-impl.History} */ (
      getServiceForDoc(elementOrAmpDoc, 'history')
    );
  },

  /**
   * @param {!Window} win
   * @return {!./input.Input}
   */
  inputFor: (win) => {
    return getService(win, 'input');
  },

  /**s
   * Returns a promise for the Inputmask service.
   * @param {!Element|!ShadowRoot} element
   * @return {!Promise<?../extensions/amp-inputmask/0.1/amp-inputmask.AmpInputmaskService>}
   */
  inputmaskServiceForDocOrNull: (element) => {
    return /** @type {!Promise<?../extensions/amp-inputmask/0.1/amp-inputmask.AmpInputmaskService>} */ (
      getElementServiceIfAvailableForDoc(element, 'inputmask', 'amp-inputmask')
    );
  },

  /**
   * @param {!Element|!./service/ampdoc-impl.AmpDoc} elementOrAmpDoc
   * @return {?./service/loading-indicator.LoadingIndicatorImpl}
   */
  loadingIndicatorOrNull: (elementOrAmpDoc) => {
    return /** @type {?./service/loading-indicator.LoadingIndicatorImpl} */ (
      getServiceForDocOrNull(elementOrAmpDoc, 'loadingIndicator')
    );
  },

  /**
   * @param {!Element|!./service/ampdoc-impl.AmpDoc} elementOrAmpDoc
   * @return {!../extensions/amp-next-page/1.0/service.NextPageService}
   */
  nextPageServiceForDoc: (elementOrAmpDoc) => {
    return /** @type {!../extensions/amp-next-page/1.0/service.NextPageService} */ (
      getServiceForDoc(elementOrAmpDoc, 'next-page')
    );
  },

  /**
   * @param {!Element|!./service/ampdoc-impl.AmpDoc} elementOrAmpDoc
   * @return {!./service/mutator-interface.MutatorInterface}
   */
  mutatorForDoc: (elementOrAmpDoc) => {
    return /** @type {!./service/mutator-interface.MutatorInterface} */ (
      getServiceForDoc(elementOrAmpDoc, 'mutator')
    );
  },

  /**
   * @param {!Element|!./service/ampdoc-impl.AmpDoc} elementOrAmpDoc
   * @return {!./service/owners-interface.OwnersInterface}
   */
  ownersForDoc: (elementOrAmpDoc) => {
    return /** @type {!./service/owners-interface.OwnersInterface} */ (
      getServiceForDoc(elementOrAmpDoc, 'owners')
    );
  },

  /**
   * @param {!Window} window
   * @return {!./service/performance-impl.Performance}
   */
  performanceFor: (window) => {
    return /** @type {!./service/performance-impl.Performance}*/ (
      getService(window, 'performance')
    );
  },

  /**
   * @param {!Window} window
   * @return {!./service/performance-impl.Performance}
   */
  performanceForOrNull: (window) => {
    return /** @type {!./service/performance-impl.Performance}*/ (
      getExistingServiceOrNull(window, 'performance')
    );
  },

  /**
   * @param {!Window} window
   * @return {!./service/platform-impl.Platform}
   */
  platformFor: (window) => {
    return /** @type {!./service/platform-impl.Platform} */ (
      getService(window, 'platform')
    );
  },

  /**
   * Not installed by default; must be installed in extension code before use.
   * @param {!Element|!ShadowRoot} element
   * @return {!./service/position-observer/position-observer-impl.PositionObserver}
   * @throws If the service is not installed.
   */
  positionObserverForDoc: (element) => {
    return /** @type {!./service/position-observer/position-observer-impl.PositionObserver} */ (
      getServiceForDoc(element, 'position-observer')
    );
  },

  /**
   * @param {!Window} window
   * @return {!./preconnect.PreconnectService}
   */
  preconnectFor: (window) => {
    return getService(window, 'preconnect');
  },

  /**
   * @param {!Element|!./service/ampdoc-impl.AmpDoc} elementOrAmpDoc
   * @return {!./service/resources-interface.ResourcesInterface}
   */
  resourcesForDoc: (elementOrAmpDoc) => {
    return /** @type {!./service/resources-interface.ResourcesInterface} */ (
      getServiceForDoc(elementOrAmpDoc, 'resources')
    );
  },

  /**
   * @param {!Element|!./service/ampdoc-impl.AmpDoc} elementOrAmpDoc
   * @return {!Promise<!./service/resources-interface.ResourcesInterface>}
   */
  resourcesPromiseForDoc: (elementOrAmpDoc) => {
    return /** @type {!Promise<!./service/resources-interface.ResourcesInterface>} */ (
      getServicePromiseForDoc(elementOrAmpDoc, 'resources')
    );
  },

  /**
   * @param {!Window} win
   * @return {?Promise<?../extensions/amp-story/1.0/variable-service.AmpStoryVariableService>}
   */
  storyVariableServiceForOrNull: (win) => {
    return (
      /** @type {!Promise<?../extensions/amp-story/1.0/variable-service.AmpStoryVariableService>} */
      (getElementServiceIfAvailable(win, 'story-variable', 'amp-story', '1.0'))
    );
  },

  /**
   * @param {!Window} win
   * @return {?../extensions/amp-story/1.0/variable-service.AmpStoryVariableService}
   */
  storyVariableService: (win) => {
    return (
      /** @type {?../extensions/amp-story/1.0/variable-service.AmpStoryVariableService} */
      (getExistingServiceOrNull(win, 'story-variable'))
    );
  },

  /**
   * Version of the story store service depends on which version of amp-story
   * the publisher is loading. They all have the same implementation.
   * @param {!Window} win
   * @return {?Promise<?../extensions/amp-story/1.0/amp-story-store-service.AmpStoryStoreService>}
   */
  storyStoreServiceForOrNull: (win) => {
    return (
      /** @type {!Promise<?../extensions/amp-story/1.0/amp-story-store-service.AmpStoryStoreService>} */
      (getElementServiceIfAvailable(win, 'story-store', 'amp-story', '1.0'))
    );
  },

  /**
   * @param {!Window} win
   * @return {?../extensions/amp-story/1.0/amp-story-store-service.AmpStoryStoreService}
   */
  storyStoreService: (win) => {
    return (
      /** @type {?../extensions/amp-story/1.0/amp-story-store-service.AmpStoryStoreService} */
      (getExistingServiceOrNull(win, 'story-store'))
    );
  },

  /**
   * @param {!Window} win
   * @return {?../extensions/amp-story/1.0/media-performance-metrics-service.MediaPerformanceMetricsService}
   */
  mediaPerformanceMetricsService: (win) => {
    return (
      /** @type {?../extensions/amp-story/1.0/media-performance-metrics-service.MediaPerformanceMetricsService} */
      (getExistingServiceOrNull(win, 'media-performance-metrics'))
    );
  },

  /**
   * @param {!Element} el
   * @return {!Promise<./service/localization.LocalizationService>}
   */
  localizationServiceForOrNull: (el) => {
    return /** @type {!Promise<?./service/localization.LocalizationService>} */ (
      getServicePromiseForDoc(el, 'localization')
    );
  },

  /**
   * @param {!Element} element
   * @return {?./service/localization.LocalizationService}
   */
  localizationForDoc: (element) => {
    return /** @type {?./service/localization.LocalizationService} */ (
      getServiceForDocOrNull(element, 'localization')
    );
  },

  /**
   * TODO(#14357): Remove this when amp-story:0.1 is deprecated.
   * @param {!Window} win
   * @return {!Promise<?../extensions/amp-story/1.0/story-analytics.StoryAnalyticsService>}
   */
  storyAnalyticsServiceForOrNull: (win) => {
    return (
      /** @type {!Promise<?../extensions/amp-story/1.0/story-analytics.StoryAnalyticsService>} */
      (
        getElementServiceIfAvailable(
          win,
          'story-analytics',
          'amp-story',
          '1.0',
          true
        )
      )
    );
  },

  /**
   * @param {!Window} win
   * @return {?../extensions/amp-story/1.0/story-analytics.StoryAnalyticsService}
   */
  storyAnalyticsService: (win) => {
    return (
      /** @type {?../extensions/amp-story/1.0/story-analytics.StoryAnalyticsService} */
      (getExistingServiceOrNull(win, 'story-analytics'))
    );
  },

  /**
   * @param {!Element|!ShadowRoot} element
   * @return {!Promise<!../extensions/amp-animation/0.1/web-animation-service.WebAnimationService>}
   */
  webAnimationServiceFor: (element) => {
    return (
      /** @type {!Promise<!../extensions/amp-animation/0.1/web-animation-service.WebAnimationService>} */
      (getElementServiceForDoc(element, 'web-animation', 'amp-animation'))
    );
  },

  /**
   * @param {!Element|!./service/ampdoc-impl.AmpDoc} elementOrAmpDoc
   * @return {!Promise<!./service/real-time-config/real-time-config-impl.RealTimeConfigManager>}
   */
  realTimeConfigForDoc: (elementOrAmpDoc) => {
    return /** @type {!Promise<!./service/real-time-config/real-time-config-impl.RealTimeConfigManager>} */ (
      getServicePromiseForDoc(elementOrAmpDoc, 'real-time-config')
    );
  },

  /**
   * @param {!Element|!./service/ampdoc-impl.AmpDoc} elementOrAmpDoc
   * @return {!Promise<!./service/storage-impl.Storage>}
   */
  storageForDoc: (elementOrAmpDoc) => {
    return /** @type {!Promise<!./service/storage-impl.Storage>} */ (
      getServicePromiseForDoc(elementOrAmpDoc, 'storage')
    );
  },

  /**
   * @param {!Element|!./service/ampdoc-impl.AmpDoc} elementOrAmpDoc
   * @return {!Promise<!./service/storage-impl.Storage>}
   * TODO(dmanek): Add tests for this method.
   */
  storageForTopLevelDoc: (elementOrAmpDoc) => {
    const thisAmpdoc = ampdocInternal(elementOrAmpDoc);
    const ampdocService = ampdocServiceForInternal(thisAmpdoc.win);
    const topAmpdoc = ampdocService.isSingleDoc()
      ? ampdocService.getSingleDoc()
      : null;
    // We need to verify that ampdocs are on the same origin, therefore
    // we compare the windows of both.
    const ampdoc =
      topAmpdoc && topAmpdoc.win == thisAmpdoc.win ? topAmpdoc : thisAmpdoc;
    return /** @type {!Promise<!./service/storage-impl.Storage>} */ (
      getServicePromiseForDoc(ampdoc, 'storage')
    );
  },

  /**
   * @param {!Element|!./service/ampdoc-impl.AmpDoc} elementOrAmpDoc
   * @return {!./service/template-impl.Templates}
   */
  templatesForDoc: (elementOrAmpDoc) => {
    return /** @type {!./service/template-impl.Templates} */ (
      getServiceForDoc(elementOrAmpDoc, 'templates')
    );
  },

  /**
   * @param {!Window} window
   * @return {!./service/timer-impl.Timer}
   */
  timerFor: (window) => {
    // TODO(alabiaga): This will always return the top window's Timer service.
    return /** @type {!./service/timer-impl.Timer} */ (
      getServiceInEmbedWin(window, 'timer')
    );
  },

  /**
   * @param {!Element|!ShadowRoot} element
   * @return {!./service/url-replacements-impl.UrlReplacements}
   */
  urlReplacementsForDoc: (element) => {
    return /** @type {!./service/url-replacements-impl.UrlReplacements} */ (
      getServiceForDocOrNull(element, 'url-replace')
    );
  },

  /**
   * @param {!Element|!ShadowRoot} element
   * @return {!Promise<!../extensions/amp-user-notification/0.1/amp-user-notification.UserNotificationManager>}
   */
  userNotificationManagerForDoc: (element) => {
    return (
      /** @type {!Promise<!../extensions/amp-user-notification/0.1/amp-user-notification.UserNotificationManager>} */
      (
        getElementServiceForDoc(
          element,
          'userNotificationManager',
          'amp-user-notification'
        )
      )
    );
  },

  /**
   * Returns a promise for the consentPolicy Service or a promise for null if
   * the service is not available on the current page.
   * @param {!Element|!ShadowRoot} element
   * @return {!Promise<?../extensions/amp-consent/0.1/consent-policy-manager.ConsentPolicyManager>}
   */
  consentPolicyServiceForDocOrNull: (element) => {
    return (
      /** @type {!Promise<?../extensions/amp-consent/0.1/consent-policy-manager.ConsentPolicyManager>} */
      (
        getElementServiceIfAvailableForDoc(
          element,
          'consentPolicyManager',
          'amp-consent'
        )
      )
    );
  },

  /**
   * Returns a promise for the geo service or a promise for null if
   * the service is not available on the current page.
   * @param {!Element|!ShadowRoot} element
   * @return {!Promise<?../extensions/amp-geo/0.1/amp-geo.GeoDef>}
   */
  geoForDocOrNull: (element) => {
    return /** @type {!Promise<?../extensions/amp-geo/0.1/amp-geo.GeoDef>} */ (
      getElementServiceIfAvailableForDoc(element, 'geo', 'amp-geo', true)
    );
  },

  /**
   * Unlike most service getters, passing `Node` is necessary for some FIE-scope
   * services since sometimes we only have the FIE Document for context.
   * @param {!Element|!ShadowRoot} element
   * @return {!./service/url-impl.Url}
   */
  urlForDoc: (element) => {
    return /** @type {!./service/url-impl.Url} */ (
      getServiceForDocOrNull(element, 'url')
    );
  },

  /**
   * Returns a promise for the experiment variants or a promise for null if it
   * is not available on the current page.
   * @param {!Element|!ShadowRoot} element
   * @return {!Promise<?../extensions/amp-experiment/0.1/variant.Variants>}
   */
  variantsForDocOrNull: (element) => {
    return /** @type {!Promise<?../extensions/amp-experiment/0.1/variant.Variants>} */ (
      getElementServiceIfAvailableForDoc(
        element,
        'variant',
        'amp-experiment',
        true
      )
    );
  },

  /**
   * @param {!Element|!./service/ampdoc-impl.AmpDoc} elementOrAmpDoc
   * @return {!./service/video-manager-impl.VideoManager}
   */
  videoManagerForDoc: (elementOrAmpDoc) => {
    return /** @type {!./service/video-manager-impl.VideoManager} */ (
      getServiceForDoc(elementOrAmpDoc, 'video-manager')
    );
  },

  /**
   * @param {!Element|!./service/ampdoc-impl.AmpDoc} elementOrAmpDoc
   * @return {!./service/viewer-interface.ViewerInterface}
   */
  viewerForDoc: (elementOrAmpDoc) => {
    return /** @type {!./service/viewer-interface.ViewerInterface} */ (
      getServiceForDoc(elementOrAmpDoc, 'viewer')
    );
  },

  /**
   * Returns promise for the viewer. This is an unusual case and necessary only
   * for services that need reference to the viewer before it has been
   * initialized. Most of the code, however, just should use `viewerForDoc`.
   * @param {!Element|!./service/ampdoc-impl.AmpDoc} elementOrAmpDoc
   * @return {!Promise<!./service/viewer-interface.ViewerInterface>}
   */
  viewerPromiseForDoc: (elementOrAmpDoc) => {
    return /** @type {!Promise<!./service/viewer-interface.ViewerInterface>} */ (
      getServicePromiseForDoc(elementOrAmpDoc, 'viewer')
    );
  },

  /**
   * @param {!Window} window
   * @return {!./service/vsync-impl.Vsync}
   */
  vsyncFor: (window) => {
    return /** @type {!./service/vsync-impl.Vsync} */ (
      getService(window, 'vsync')
    );
  },

  /**
   * @param {!Element|!./service/ampdoc-impl.AmpDoc} elementOrAmpDoc
   * @return {!./service/viewport/viewport-interface.ViewportInterface}
   */
  viewportForDoc: (elementOrAmpDoc) => {
    return /** @type {!./service/viewport/viewport-interface.ViewportInterface} */ (
      getServiceForDoc(elementOrAmpDoc, 'viewport')
    );
  },

  /**
   * @param {!Window} window
   * @return {!./service/xhr-impl.Xhr}
   */
  xhrFor: (window) => {
    return /** @type {!./service/xhr-impl.Xhr} */ (getService(window, 'xhr'));
  },

  /**
   * @param {!Element|!./service/ampdoc-impl.AmpDoc} elementOrAmpDoc
   * @return {!Promise<../amp-cache-url/amp-cache-url.AmpCacheUrlService>}
   */
  cacheUrlServicePromiseForDoc: (elementOrAmpDoc) => {
    return /** @type {!Promise<?../amp-cache-url/amp-cache-url.AmpCacheUrlService>} */ (
      getServicePromiseForDoc(elementOrAmpDoc, 'cache-url')
    );
  },
};
