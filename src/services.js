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
   * @param {!Node|!./service/ampdoc-impl.AmpDoc} nodeOrDoc
   * @return {!Promise<!../extensions/amp-access/0.1/amp-access.AccessService>}
   */
  static accessServiceForDoc(nodeOrDoc) {
    return (/** @type {!Promise<
        !../extensions/amp-access/0.1/amp-access.AccessService>} */ (
        getElementServiceForDoc(nodeOrDoc, 'access', 'amp-access')));
  }

  /**
   * Returns a promise for the Subscriptions service.
   * @param {!Node|!./service/ampdoc-impl.AmpDoc} nodeOrDoc
   * @return {!Promise<!SubscriptionService>}
   */
  static subscriptionsServiceForDoc(nodeOrDoc) {
    return (/** @type {!Promise<SubscriptionService>} */ (
      getElementServiceForDoc(nodeOrDoc, 'subscriptions',
          'amp-subscriptions')));
  }

  /**
   * Returns a promise for the Access service or a promise for null if the service
   * is not available on the current page.
   * @param {!Node|!./service/ampdoc-impl.AmpDoc} nodeOrDoc
   * @return {!Promise<?../extensions/amp-access/0.1/amp-access.AccessService>}
   */
  static accessServiceForDocOrNull(nodeOrDoc) {
    return (/** @type {
        !Promise<?../extensions/amp-access/0.1/amp-access.AccessService>} */ (
        getElementServiceIfAvailableForDoc(nodeOrDoc, 'access', 'amp-access')));
  }

  /**
   * @param {!Node|!./service/ampdoc-impl.AmpDoc} nodeOrDoc
   * @return {!./service/action-impl.ActionService}
   */
  static actionServiceForDoc(nodeOrDoc) {
    return /** @type {!./service/action-impl.ActionService} */ (
      getExistingServiceForDocInEmbedScope(
          nodeOrDoc, 'action', /* opt_fallbackToTopWin */ true));
  }

  /**
   * @param {!Node|!./service/ampdoc-impl.AmpDoc} nodeOrDoc
   * @return {!Promise<!Activity>}
   */
  static activityForDoc(nodeOrDoc) {
    return /** @type {!Promise<!Activity>} */ (
      getElementServiceForDoc(nodeOrDoc, 'activity', 'amp-analytics'));
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
   * @param {!Node|!./service/ampdoc-impl.AmpDoc} nodeOrDoc
   * @return {!./service/ampdoc-impl.AmpDoc}
   */
  static ampdoc(nodeOrDoc) {
    return getAmpdoc(nodeOrDoc);
  }

  /**
   * @param {!Node|!./service/ampdoc-impl.AmpDoc} nodeOrDoc
   * @param {boolean=} loadAnalytics
   * @return {!Promise<!../extensions/amp-analytics/0.1/instrumentation.InstrumentationService>}
   */
  static analyticsForDoc(nodeOrDoc, loadAnalytics = false) {
    if (loadAnalytics) {
      // Get Extensions service and force load analytics extension.
      const ampdoc = getAmpdoc(nodeOrDoc);
      Services.extensionsFor(ampdoc.win)./*OK*/installExtensionForDoc(
          ampdoc, 'amp-analytics');
    }
    return (/** @type {!Promise<
              !../extensions/amp-analytics/0.1/instrumentation.InstrumentationService
            >} */ (getElementServiceForDoc(
          nodeOrDoc, 'amp-analytics-instrumentation', 'amp-analytics')));
  }

  /**
   * @param {!Node|!./service/ampdoc-impl.AmpDoc} nodeOrDoc
   * @return {!Promise<?../extensions/amp-analytics/0.1/instrumentation.InstrumentationService>}
   */
  static analyticsForDocOrNull(nodeOrDoc) {
    return (/** @type {!Promise<
              ?../extensions/amp-analytics/0.1/instrumentation.InstrumentationService
            >} */ (getElementServiceIfAvailableForDoc(
          nodeOrDoc, 'amp-analytics-instrumentation', 'amp-analytics')));
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
   * @param {!Node|!./service/ampdoc-impl.AmpDoc} nodeOrDoc
   * @return {!Promise<?../extensions/amp-bind/0.1/bind-impl.Bind>}
   */
  static bindForDocOrNull(nodeOrDoc) {
    return /** @type {!Promise<?../extensions/amp-bind/0.1/bind-impl.Bind>} */ (
      getElementServiceIfAvailableForDocInEmbedScope(
          nodeOrDoc, 'bind', 'amp-bind'));
  }

  /**
   * @param {!Node|!./service/ampdoc-impl.AmpDoc} nodeOrDoc
   * @return {!Promise<!./service/cid-impl.Cid>}
   */
  static cidForDoc(nodeOrDoc) {
    return /** @type {!Promise<!./service/cid-impl.Cid>} */ (
      getServicePromiseForDoc(nodeOrDoc, 'cid'));
  }

  /**
   * @param {!Node|!./service/ampdoc-impl.AmpDoc} nodeOrDoc
   * @return {!./service/navigation.Navigation}
   */
  static navigationForDoc(nodeOrDoc) {
    return /** @type {!./service/navigation.Navigation} */ (
      getServiceForDoc(nodeOrDoc, 'navigation'));
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
   * @param {!Node|!./service/ampdoc-impl.AmpDoc} nodeOrDoc
   * @return {!./service/document-info-impl.DocumentInfoDef} Info about the doc
   */
  static documentInfoForDoc(nodeOrDoc) {
    return /** @type {!./service/document-info-impl.DocInfo} */ (
      getServiceForDoc(nodeOrDoc, 'documentInfo')).get();
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
   * @param {!Node|!./service/ampdoc-impl.AmpDoc} nodeOrDoc
   * @return {!./service/history-impl.History}
   */
  static historyForDoc(nodeOrDoc) {
    return /** @type {!./service/history-impl.History} */ (
      getServiceForDoc(nodeOrDoc, 'history'));
  }

  /**
   * @param {!Window} win
   * @return {!./input.Input}
   */
  static inputFor(win) {
    return getService(win, 'input');
  }

  /**
   * @param {!Node|!./service/ampdoc-impl.AmpDoc} nodeOrDoc
   * @return {!./service/layers-impl.LayoutLayers}
   */
  static layersForDoc(nodeOrDoc) {
    return /** @type {!./service/layers-impl.LayoutLayers} */ (
      getServiceForDoc(nodeOrDoc, 'layers'));
  }

  /**
   * @param {!Node} node
   * @return {!Promise<!../extensions/amp-story/0.1/media-pool.MediaPoolService>}
   */
  static mediaPoolFor(node) {
    return (
      /** @type {!Promise<!../extensions/amp-story/0.1/media-pool.MediaPoolService>} */
      (getElementServiceForDoc(node, 'mediapool', 'amp-story')));
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
   * @param {!Node|!./service/ampdoc-impl.AmpDoc} nodeOrDoc
   * @return {!./service/resources-impl.Resources}
   */
  static resourcesForDoc(nodeOrDoc) {
    return /** @type {!./service/resources-impl.Resources} */ (
      getServiceForDoc(nodeOrDoc, 'resources'));
  }

  /**
   * @param {!Window} win
   * @return {?Promise<?{incomingFragment: string, outgoingFragment: string}>}
   */
  static shareTrackingForOrNull(win) {
    return (/** @type {
      !Promise<?{incomingFragment: string, outgoingFragment: string}>} */ (
        getElementServiceIfAvailable(win, 'share-tracking',
            'amp-share-tracking', true)));
  }

  /**
   * @param {!Window} win
   * @return {?Promise<?../extensions/amp-story/0.1/variable-service.StoryVariableDef>}
   */
  static storyVariableServiceForOrNull(win) {
    return (
    /** @type {!Promise<?../extensions/amp-story/0.1/variable-service.StoryVariableDef>} */
      (getElementServiceIfAvailable(win, 'story-variable', 'amp-story',
          true)));
  }

  /**
   * @param {!Window} win
   * @return {?Promise<?../extensions/amp-story/0.1/amp-story-store-service.AmpStoryStoreService>}
   */
  static storyStoreServiceForOrNull(win) {
    return (
    /** @type {!Promise<?../extensions/amp-story/0.1/amp-story-store-service.AmpStoryStoreService>} */
      (getElementServiceIfAvailable(win, 'story-store', 'amp-story')));
  }

  /**
   * @param {!Window} win
   * @return {!../extensions/amp-story/0.1/amp-story-store-service.AmpStoryStoreService}
   */
  static storyStoreService(win) {
    return getService(win, 'story-store');
  }

  /**
   * @param {!Window} win
   * @return {!../extensions/amp-story/0.1/amp-story-request-service.AmpStoryRequestService}
   */
  static storyRequestService(win) {
    return getService(win, 'story-request');
  }

  /**
   * @param {!Window} win
   * @return {!Promise<?../extensions/amp-story/0.1/localization.LocalizationService>}
   */
  static localizationServiceForOrNull(win) {
    return (
    /** @type {!Promise<?../extensions/amp-story/0.1/localization.LocalizationService>} */
      (getElementServiceIfAvailable(win, 'localization', 'amp-story', true)));
  }

  /**
   * @param {!Window} win
   * @return {!../extensions/amp-story/0.1/localization.LocalizationService}
   */
  static localizationService(win) {
    return getService(win, 'localization');
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
   * @param {!Node|!./service/ampdoc-impl.AmpDoc} nodeOrDoc
   * @return {!Promise<!../extensions/amp-animation/0.1/web-animation-service.WebAnimationService>}
   */
  static webAnimationServiceFor(nodeOrDoc) {
    return (/** @type {
        !Promise<!../extensions/amp-animation/0.1/web-animation-service.WebAnimationService>} */
      (getElementServiceForDoc(nodeOrDoc, 'web-animation', 'amp-animation')));
  }

  /**
   * @param {!Node|!./service/ampdoc-impl.AmpDoc} nodeOrDoc
   * @return {!Promise<!./service/storage-impl.Storage>}
   */
  static storageForDoc(nodeOrDoc) {
    return /** @type {!Promise<!./service/storage-impl.Storage>} */ (
      getServicePromiseForDoc(nodeOrDoc, 'storage'));
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
   * @param {!Node|!./service/ampdoc-impl.AmpDoc} nodeOrDoc
   * @return {!./service/url-replacements-impl.UrlReplacements}
   */
  static urlReplacementsForDoc(nodeOrDoc) {
    return /** @type {!./service/url-replacements-impl.UrlReplacements} */ (
      getExistingServiceForDocInEmbedScope(
          nodeOrDoc, 'url-replace', /* opt_fallbackToTopWin */ true));
  }

  /**
   * @param {!Node|!./service/ampdoc-impl.AmpDoc} nodeOrDoc
   * @return {!Promise<!../extensions/amp-user-notification/0.1/amp-user-notification.UserNotificationManager>}
   */
  static userNotificationManagerForDoc(nodeOrDoc) {
    return (/** @type {!Promise<!../extensions/amp-user-notification/0.1/amp-user-notification.UserNotificationManager>} */
      (getElementServiceForDoc(nodeOrDoc, 'userNotificationManager',
          'amp-user-notification')));
  }

  /**
   * Returns a promise for the consentPolicy Service or a promise for null if
   * the service is not available on the current page.
   * @param {!Node|!./service/ampdoc-impl.AmpDoc} nodeOrDoc
   * @return {!Promise<?../extensions/amp-consent/0.1/consent-policy-manager.ConsentPolicyManager>}
   */
  static consentPolicyServiceForDocOrNull(nodeOrDoc) {
    return (/** @type {!Promise<?../extensions/amp-consent/0.1/consent-policy-manager.ConsentPolicyManager>} */
      (getElementServiceIfAvailableForDoc(nodeOrDoc, 'consentPolicyManager',
          'amp-consent')));
  }

  /**
   * Returns a promise for the experiment variants or a promise for null if it is
   * not available on the current page.
   * @param {!Window} win
   * @return {!Promise<?Object<string>>}
   */
  static variantForOrNull(win) {
    return /** @type {!Promise<?Object<string>>} */ (
      getElementServiceIfAvailable(win, 'variant', 'amp-experiment', true));
  }

  /**
   * @param {!Node|!./service/ampdoc-impl.AmpDoc} nodeOrDoc
   * @return {!./service/video-manager-impl.VideoService}
   */
  static videoManagerForDoc(nodeOrDoc) {
    return /** @type {!./service/video-manager-impl.VideoService} */ (
      getServiceForDoc(nodeOrDoc, 'video-manager'));
  }

  /**
   * @param {!Node|!./service/ampdoc-impl.AmpDoc} nodeOrDoc
   * @return {!./service/viewer-impl.Viewer}
   */
  static viewerForDoc(nodeOrDoc) {
    return /** @type {!./service/viewer-impl.Viewer} */ (
      getServiceForDoc(nodeOrDoc, 'viewer'));
  }

  /**
   * Returns promise for the viewer. This is an unusual case and necessary only
   * for services that need reference to the viewer before it has been
   * initialized. Most of the code, however, just should use `viewerForDoc`.
   * @param {!Node|!./service/ampdoc-impl.AmpDoc} nodeOrDoc
   * @return {!Promise<!./service/viewer-impl.Viewer>}
   */
  static viewerPromiseForDoc(nodeOrDoc) {
    return /** @type {!Promise<!./service/viewer-impl.Viewer>} */ (
      getServicePromiseForDoc(nodeOrDoc, 'viewer'));
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
   * @param {!Node|!./service/ampdoc-impl.AmpDoc} nodeOrDoc
   * @return {!./service/viewport/viewport-impl.Viewport}
   */
  static viewportForDoc(nodeOrDoc) {
    return /** @type {!./service/viewport/viewport-impl.Viewport} */ (
      getServiceForDoc(nodeOrDoc, 'viewport'));
  }

  /**
   * @param {!Window} window
   * @return {!./service/xhr-impl.Xhr}
   */
  static xhrFor(window) {
    return /** @type {!./service/xhr-impl.Xhr} */ (getService(window, 'xhr'));
  }
}
