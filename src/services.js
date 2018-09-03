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
  getServiceForDocDeprecated,
  getServicePromiseForDoc,
} from './service';
import {
  getElementServiceForDoc,
  getElementServiceIfAvailable,
  getElementServiceIfAvailableForDoc,
  getElementServiceIfAvailableForDocInEmbedScope,
} from './element-service';

import {LINK_REWRITER_SERVICE_NAME} from './service/link-rewriter/constants';

/** @typedef {!../extensions/amp-subscriptions/0.1/amp-subscriptions.SubscriptionService} */
export let SubscriptionService;

export class Services {
  /**
   * Hint: Add extensions folder path to compile.js with
   * warnings cannot find modules.
   */

  /**
   * Returns a promise for the Access service.
   * @param {!Element|!./service/ampdoc-impl.AmpDoc} elementOrAmpDoc
   * @return {!Promise<!../extensions/amp-access/0.1/amp-access.AccessService>}
   */
  static accessServiceForDoc(elementOrAmpDoc) {
    return (/** @type {!Promise<!../extensions/amp-access/0.1/amp-access.AccessService>} */ (
      getElementServiceForDoc(elementOrAmpDoc, 'access', 'amp-access')));
  }

  /**
   * Returns a promise for the Access service or a promise for null if the
   * service is not available on the current page.
   * @param {!Element|!./service/ampdoc-impl.AmpDoc} elementOrAmpDoc
   * @return {!Promise<?../extensions/amp-access/0.1/amp-access.AccessService>}
   */
  static accessServiceForDocOrNull(elementOrAmpDoc) {
    return (/** @type {!Promise<?../extensions/amp-access/0.1/amp-access.AccessService>} */ (
      getElementServiceIfAvailableForDoc(elementOrAmpDoc, 'access',
          'amp-access')));
  }

  /**
   * Returns a promise for the Subscriptions service.
   * @param {!Element|!./service/ampdoc-impl.AmpDoc} elementOrAmpDoc
   * @return {!Promise<!SubscriptionService>}
   */
  static subscriptionsServiceForDoc(elementOrAmpDoc) {
    return (/** @type {!Promise<!SubscriptionService>} */ (
      getElementServiceForDoc(elementOrAmpDoc, 'subscriptions',
          'amp-subscriptions')));
  }

  /**
   * Returns a promise for the Subscriptions service.
   * @param {!Element|!./service/ampdoc-impl.AmpDoc} elementOrAmpDoc
   * @return {!Promise<?SubscriptionService>}
   */
  static subscriptionsServiceForDocOrNull(elementOrAmpDoc) {
    return (/** @type {!Promise<?SubscriptionService>} */ (
      getElementServiceIfAvailableForDoc(elementOrAmpDoc, 'subscriptions',
          'amp-subscriptions')));
  }

  /**
   * Unlike most service getters, passing `Node` is necessary for some FIE-scope
   * services since sometimes we only have the FIE Document for context.
   * @param {!Node|!./service/ampdoc-impl.AmpDoc} nodeOrDoc
   * @return {!./service/action-impl.ActionService}
   */
  static actionServiceForDoc(nodeOrDoc) {
    return /** @type {!./service/action-impl.ActionService} */ (
      getExistingServiceForDocInEmbedScope(
          nodeOrDoc, 'action', /* opt_fallbackToTopWin */ true));
  }

  /**
   * @param {!Element|!./service/ampdoc-impl.AmpDoc} elementOrAmpDoc
   * @return {!Promise<!Activity>}
   */
  static activityForDoc(elementOrAmpDoc) {
    return /** @type {!Promise<!Activity>} */ (
      getElementServiceForDoc(elementOrAmpDoc, 'activity', 'amp-analytics'));
  }

  /**
   * Returns the global instance of the `AmpDocService` service that can be
   * used to resolve an ampdoc for any node: either in the single-doc or
   * shadow-doc environment.
   * @param {!Window} window
   * @return {!./service/ampdoc-impl.AmpDocService}
   */
  static ampdocServiceFor(window) {
    return /** @type {!./service/ampdoc-impl.AmpDocService} */ (
      getService(window, 'ampdoc'));
  }

  /**
   * Returns the AmpDoc for the specified context node.
   * @param {!Element|!./service/ampdoc-impl.AmpDoc} elementOrAmpDoc
   * @return {!./service/ampdoc-impl.AmpDoc}
   */
  static ampdoc(elementOrAmpDoc) {
    return getAmpdoc(elementOrAmpDoc);
  }

  /**
   * @param {!Element|!./service/ampdoc-impl.AmpDoc} elementOrAmpDoc
   * @param {boolean=} loadAnalytics
   * @return {!Promise<!../extensions/amp-analytics/0.1/instrumentation.InstrumentationService>}
   */
  static analyticsForDoc(elementOrAmpDoc, loadAnalytics = false) {
    if (loadAnalytics) {
      // Get Extensions service and force load analytics extension.
      const ampdoc = getAmpdoc(elementOrAmpDoc);
      Services.extensionsFor(ampdoc.win)./*OK*/installExtensionForDoc(
          ampdoc, 'amp-analytics');
    }
    return /** @type {!Promise<!../extensions/amp-analytics/0.1/instrumentation.InstrumentationService>} */ (
      getElementServiceForDoc(elementOrAmpDoc, 'amp-analytics-instrumentation',
          'amp-analytics'));
  }

  /**
   * @param {!Element|!./service/ampdoc-impl.AmpDoc} elementOrAmpDoc
   * @return {!Promise<?../extensions/amp-analytics/0.1/instrumentation.InstrumentationService>}
   */
  static analyticsForDocOrNull(elementOrAmpDoc) {
    return /** @type {!Promise<?../extensions/amp-analytics/0.1/instrumentation.InstrumentationService>} */ (
      getElementServiceIfAvailableForDoc(elementOrAmpDoc,
          'amp-analytics-instrumentation', 'amp-analytics'));
  }

  /**
   * @param {!Window} window
   * @return {!./service/batched-xhr-impl.BatchedXhr}
   */
  static batchedXhrFor(window) {
    return /** @type {!./service/batched-xhr-impl.BatchedXhr} */ (
      getService(window, 'batched-xhr'));
  }

  /**
   * @param {!Element|!./service/ampdoc-impl.AmpDoc} elementOrAmpDoc
   * @return {!Promise<?../extensions/amp-bind/0.1/bind-impl.Bind>}
   */
  static bindForDocOrNull(elementOrAmpDoc) {
    return /** @type {!Promise<?../extensions/amp-bind/0.1/bind-impl.Bind>} */ (
      getElementServiceIfAvailableForDocInEmbedScope(
          elementOrAmpDoc, 'bind', 'amp-bind'));
  }

  /**
   * @param {!Element|!./service/ampdoc-impl.AmpDoc} elementOrAmpDoc
   * @return {!Promise<!./service/cid-impl.Cid>}
   */
  static cidForDoc(elementOrAmpDoc) {
    return /** @type {!Promise<!./service/cid-impl.Cid>} */ (
      getServicePromiseForDoc(elementOrAmpDoc, 'cid'));
  }

  /**
   * @param {!Element|!./service/ampdoc-impl.AmpDoc} elementOrAmpDoc
   * @return {!./service/navigation.Navigation}
   */
  static navigationForDoc(elementOrAmpDoc) {
    return /** @type {!./service/navigation.Navigation} */ (
      getServiceForDoc(elementOrAmpDoc, 'navigation'));
  }

  /**
   * @param {!Window} window
   * @return {!./service/crypto-impl.Crypto}
   */
  static cryptoFor(window) {
    return (/** @type {!./service/crypto-impl.Crypto} */ (
      getService(window, 'crypto')));
  }

  /**
   * @param {!Element|!./service/ampdoc-impl.AmpDoc} elementOrAmpDoc
   * @return {!./service/document-info-impl.DocumentInfoDef} Info about the doc
   */
  static documentInfoForDoc(elementOrAmpDoc) {
    return /** @type {!./service/document-info-impl.DocInfo} */ (
      getServiceForDoc(elementOrAmpDoc, 'documentInfo')).get();
  }

  /**
   * @param {!Window} window
   * @return {!./service/document-state.DocumentState}
   */
  static documentStateFor(window) {
    return getService(window, 'documentState');
  }

  /**
   * @param {!Window} window
   * @return {!./service/extensions-impl.Extensions}
   */
  static extensionsFor(window) {
    return /** @type {!./service/extensions-impl.Extensions} */ (
      getService(window, 'extensions'));
  }

  /**
   * Returns service implemented in service/history-impl.
   * @param {!Element|!./service/ampdoc-impl.AmpDoc} elementOrAmpDoc
   * @return {!./service/history-impl.History}
   */
  static historyForDoc(elementOrAmpDoc) {
    return /** @type {!./service/history-impl.History} */ (
      getServiceForDoc(elementOrAmpDoc, 'history'));
  }

  /**
   * @param {!Window} win
   * @return {!./input.Input}
   */
  static inputFor(win) {
    return getService(win, 'input');
  }

  /**
   * @param {!Element|!./service/ampdoc-impl.AmpDoc} elementOrAmpDoc
   * @return {!./service/layers-impl.LayoutLayers}
   */
  static layersForDoc(elementOrAmpDoc) {
    return /** @type {!./service/layers-impl.LayoutLayers} */ (
      getServiceForDoc(elementOrAmpDoc, 'layers'));
  }

  /**
   * @param {!Element|!./service/ampdoc-impl.AmpDoc} elementOrAmpDoc
   * @return {!./service/link-rewriter/link-rewriter-manager.LinkRewriterManager}
   */
  static linkRewriterServiceForDoc(elementOrAmpDoc) {
    return /** @type {!./service/link-rewriter/link-rewriter-manager.LinkRewriterManager} */ (
      getServiceForDoc(elementOrAmpDoc, LINK_REWRITER_SERVICE_NAME));
  }
  /**
   * @param {!Window} window
   * @return {!./service/performance-impl.Performance}
   */
  static performanceFor(window) {
    return /** @type {!./service/performance-impl.Performance}*/ (
      getService(window, 'performance'));
  }

  /**
   * @param {!Window} window
   * @return {!./service/performance-impl.Performance}
   */
  static performanceForOrNull(window) {
    return /** @type {!./service/performance-impl.Performance}*/ (
      getExistingServiceOrNull(window, 'performance'));
  }

  /**
   * @param {!Window} window
   * @return {!./service/platform-impl.Platform}
   */
  static platformFor(window) {
    return /** @type {!./service/platform-impl.Platform} */ (
      getService(window, 'platform'));
  }

  /**
   * Uses getServiceForDocDeprecated() since Resources is a startup service.
   * @param {!Node|!./service/ampdoc-impl.AmpDoc} nodeOrDoc
   * @return {!./service/resources-impl.Resources}
   */
  static resourcesForDoc(nodeOrDoc) {
    return /** @type {!./service/resources-impl.Resources} */ (
      getServiceForDocDeprecated(nodeOrDoc, 'resources'));
  }

  /**
   * @param {!Window} win
   * @return {?Promise<?{incomingFragment: string, outgoingFragment: string}>}
   */
  static shareTrackingForOrNull(win) {
    return (/** @type {!Promise<?{incomingFragment: string, outgoingFragment: string}>} */ (
      getElementServiceIfAvailable(win, 'share-tracking',
          'amp-share-tracking', true)));
  }

  /**
   * @param {!Window} win
   * @return {?Promise<?../extensions/amp-story/1.0/variable-service.StoryVariableDef>}
   */
  static storyVariableServiceForOrNull(win) {
    return (
    /** @type {!Promise<?../extensions/amp-story/1.0/variable-service.StoryVariableDef>} */
      (getElementServiceIfAvailable(win, 'story-variable', 'amp-story',
          true)));
  }

  /**
   * Version of the story store service depends on which version of amp-story
   * the publisher is loading. They all have the same implementation.
   * @param {!Window} win
   * @return {?Promise<?../extensions/amp-story/1.0/amp-story-store-service.AmpStoryStoreService|?../extensions/amp-story/0.1/amp-story-store-service.AmpStoryStoreService>}
   */
  static storyStoreServiceForOrNull(win) {
    return (
    /** @type {!Promise<?../extensions/amp-story/1.0/amp-story-store-service.AmpStoryStoreService|?../extensions/amp-story/0.1/amp-story-store-service.AmpStoryStoreService>} */
      (getElementServiceIfAvailable(win, 'story-store', 'amp-story')));
  }

  /**
   * @param {!Window} win
   * @return {?../extensions/amp-story/1.0/amp-story-store-service.AmpStoryStoreService}
   */
  static storyStoreService(win) {
    return (/** @type {?../extensions/amp-story/1.0/amp-story-store-service.AmpStoryStoreService} */
      (getExistingServiceOrNull(win, 'story-store')));
  }

  /**
   * @param {!Window} win
   * @return {?../extensions/amp-story/1.0/amp-story-request-service.AmpStoryRequestService}
   */
  static storyRequestService(win) {
    return (/** @type {?../extensions/amp-story/1.0/amp-story-request-service.AmpStoryRequestService} */
      (getExistingServiceOrNull(win, 'story-request')));
  }

  /**
   * @param {!Window} win
   * @return {!Promise<?../extensions/amp-story/1.0/localization.LocalizationService>}
   */
  static localizationServiceForOrNull(win) {
    return (
    /** @type {!Promise<?../extensions/amp-story/1.0/localization.LocalizationService>} */
      (getElementServiceIfAvailable(win, 'localization', 'amp-story', true)));
  }

  /**
   * @param {!Window} win
   * @return {!../extensions/amp-story/1.0/localization.LocalizationService}
   */
  static localizationService(win) {
    return getService(win, 'localization');
  }

  /**
   * TODO(#14357): Remove this when amp-story:0.1 is deprecated.
   * @param {!Window} win
   * @return {!../extensions/amp-story/0.1/amp-story-store-service.AmpStoryStoreService}
   */
  static storyStoreServiceV01(win) {
    return getService(win, 'story-store');
  }

  /**
   * TODO(#14357): Remove this when amp-story:0.1 is deprecated.
   * @param {!Window} win
   * @return {!../extensions/amp-story/0.1/amp-story-request-service.AmpStoryRequestService}
   */
  static storyRequestServiceV01(win) {
    return getService(win, 'story-request-v01');
  }

  /**
   * TODO(#14357): Remove this when amp-story:0.1 is deprecated.
   * @param {!Window} win
   * @return {!Promise<?../extensions/amp-story/0.1/localization.LocalizationService>}
   */
  static localizationServiceForOrNullV01(win) {
    return (
    /** @type {!Promise<?../extensions/amp-story/0.1/localization.LocalizationService>} */
      (getElementServiceIfAvailable(win, 'localization-v01', 'amp-story',
          true)));
  }

  /**
   * TODO(#14357): Remove this when amp-story:0.1 is deprecated.
   * @param {!Window} win
   * @return {!../extensions/amp-story/0.1/localization.LocalizationService}
   */
  static localizationServiceV01(win) {
    return getService(win, 'localization-v01');
  }

  /**
   * @param {!Window} win
   * @return {?Promise<?../extensions/amp-viewer-integration/0.1/variable-service.ViewerIntegrationVariableDef>}
   */
  static viewerIntegrationVariableServiceForOrNull(win) {
    return (
    /** @type {!Promise<?../extensions/amp-viewer-integration/0.1/variable-service.ViewerIntegrationVariableDef>} */
      (getElementServiceIfAvailable(win, 'viewer-integration-variable',
          'amp-viewer-integration', true)));
  }

  /**
   * @param {!Element|!./service/ampdoc-impl.AmpDoc} elementOrAmpDoc
   * @return {!Promise<!../extensions/amp-animation/0.1/web-animation-service.WebAnimationService>}
   */
  static webAnimationServiceFor(elementOrAmpDoc) {
    return (/** @type {!Promise<!../extensions/amp-animation/0.1/web-animation-service.WebAnimationService>} */
      (getElementServiceForDoc(
          elementOrAmpDoc, 'web-animation', 'amp-animation')));
  }

  /**
   * @param {!Element|!./service/ampdoc-impl.AmpDoc} elementOrAmpDoc
   * @return {!Promise<!./service/storage-impl.Storage>}
   */
  static storageForDoc(elementOrAmpDoc) {
    return /** @type {!Promise<!./service/storage-impl.Storage>} */ (
      getServicePromiseForDoc(elementOrAmpDoc, 'storage'));
  }

  /**
   * @param {!Window} window
   * @return {!./service/template-impl.Templates}
   */
  static templatesFor(window) {
    return /** @type {!./service/template-impl.Templates} */ (
      getService(window, 'templates'));
  }

  /**
   * @param {!Window} window
   * @return {!./service/timer-impl.Timer}
   */
  static timerFor(window) {
    return /** @type {!./service/timer-impl.Timer} */ (
      getService(window, 'timer'));
  }

  /**
   * Unlike most service getters, passing `Node` is necessary for some FIE-scope
   * services since sometimes we only have the FIE Document for context.
   * @param {!Node|!./service/ampdoc-impl.AmpDoc} nodeOrDoc
   * @return {!./service/url-replacements-impl.UrlReplacements}
   */
  static urlReplacementsForDoc(nodeOrDoc) {
    return /** @type {!./service/url-replacements-impl.UrlReplacements} */ (
      getExistingServiceForDocInEmbedScope(
          nodeOrDoc, 'url-replace', /* opt_fallbackToTopWin */ true));
  }

  /**
   * @param {!Element|!./service/ampdoc-impl.AmpDoc} elementOrAmpDoc
   * @return {!Promise<!../extensions/amp-user-notification/0.1/amp-user-notification.UserNotificationManager>}
   */
  static userNotificationManagerForDoc(elementOrAmpDoc) {
    return (/** @type {!Promise<!../extensions/amp-user-notification/0.1/amp-user-notification.UserNotificationManager>} */
      (getElementServiceForDoc(elementOrAmpDoc, 'userNotificationManager',
          'amp-user-notification')));
  }

  /**
   * Returns a promise for the consentPolicy Service or a promise for null if
   * the service is not available on the current page.
   * @param {!Element|!./service/ampdoc-impl.AmpDoc} elementOrAmpDoc
   * @return {!Promise<?../extensions/amp-consent/0.1/consent-policy-manager.ConsentPolicyManager>}
   */
  static consentPolicyServiceForDocOrNull(elementOrAmpDoc) {
    return (/** @type {!Promise<?../extensions/amp-consent/0.1/consent-policy-manager.ConsentPolicyManager>} */
      (getElementServiceIfAvailableForDoc(elementOrAmpDoc,
          'consentPolicyManager', 'amp-consent')));
  }

  /**
   * Returns a promise for the geo service or a promise for null if
   * the service is not available on the current page.
   * @param {!Element|!./service/ampdoc-impl.AmpDoc} elementOrAmpDoc
   * @return {!Promise<?../extensions/amp-geo/0.1/amp-geo.GeoDef>}
   */
  static geoForDocOrNull(elementOrAmpDoc) {
    return /** @type {!Promise<?../extensions/amp-geo/0.1/amp-geo.GeoDef>} */ (
      getElementServiceIfAvailableForDoc(
          elementOrAmpDoc, 'geo', 'amp-geo', true));
  }

  /**
   * Unlike most service getters, passing `Node` is necessary for some FIE-scope
   * services since sometimes we only have the FIE Document for context.
   * @param {!Node|!./service/ampdoc-impl.AmpDoc} nodeOrDoc
   * @return {!./service/url-impl.Url}
   */
  static urlForDoc(nodeOrDoc) {
    return /** @type {!./service/url-impl.Url} */ (
      getExistingServiceForDocInEmbedScope(
          nodeOrDoc, 'url', /* opt_fallbackToTopWin */ true));
  }

  /**
   * Returns a promise for the experiment variants or a promise for null if it
   * is not available on the current page.
   * @param {!Window} win
   * @return {!Promise<?Object<string>>}
   */
  static variantForOrNull(win) {
    return /** @type {!Promise<?Object<string>>} */ (
      getElementServiceIfAvailable(win, 'variant', 'amp-experiment', true));
  }

  /**
   * @param {!Element|!./service/ampdoc-impl.AmpDoc} elementOrAmpDoc
   * @return {!./service/video-service-interface.VideoServiceInterface}
   */
  static videoManagerForDoc(elementOrAmpDoc) {
    return (
      /** @type {!./service/video-service-interface.VideoServiceInterface} */ (
        getServiceForDoc(elementOrAmpDoc, 'video-manager')));
  }

  /**
   * Uses getServiceForDocDeprecated() since Viewer is a startup service.
   * @param {!Node|!./service/ampdoc-impl.AmpDoc} nodeOrDoc
   * @return {!./service/viewer-impl.Viewer}
   */
  static viewerForDoc(nodeOrDoc) {
    return /** @type {!./service/viewer-impl.Viewer} */ (
      getServiceForDocDeprecated(nodeOrDoc, 'viewer'));
  }

  /**
   * Returns promise for the viewer. This is an unusual case and necessary only
   * for services that need reference to the viewer before it has been
   * initialized. Most of the code, however, just should use `viewerForDoc`.
   * @param {!Element|!./service/ampdoc-impl.AmpDoc} elementOrAmpDoc
   * @return {!Promise<!./service/viewer-impl.Viewer>}
   */
  static viewerPromiseForDoc(elementOrAmpDoc) {
    return /** @type {!Promise<!./service/viewer-impl.Viewer>} */ (
      getServicePromiseForDoc(elementOrAmpDoc, 'viewer'));
  }

  /**
   * @param {!Window} window
   * @return {!./service/vsync-impl.Vsync}
   */
  static vsyncFor(window) {
    return /** @type {!./service/vsync-impl.Vsync} */ (
      getService(window, 'vsync'));
  }

  /**
   * Uses getServiceForDocDeprecated() since Viewport is a startup service.
   * @param {!Node|!./service/ampdoc-impl.AmpDoc} nodeOrDoc
   * @return {!./service/viewport/viewport-impl.Viewport}
   */
  static viewportForDoc(nodeOrDoc) {
    return /** @type {!./service/viewport/viewport-impl.Viewport} */ (
      getServiceForDocDeprecated(nodeOrDoc, 'viewport'));
  }

  /**
   * @param {!Window} window
   * @return {!./service/xhr-impl.Xhr}
   */
  static xhrFor(window) {
    return /** @type {!./service/xhr-impl.Xhr} */ (getService(window, 'xhr'));
  }
}
