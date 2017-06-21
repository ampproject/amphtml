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
  getService,
  getServiceForDoc,
  getServicePromiseForDoc,
  getExistingServiceOrNull,
  getExistingServiceForDocInEmbedScope,
} from './service';
import {
  getElementService,
  getElementServiceForDoc,
  getElementServiceForDocInEmbedScope,
  getElementServiceIfAvailable,
  getElementServiceIfAvailableForDoc,
} from './element-service';


/**
 * Returns a promise for the Access service.
 * @param {!Node|!./service/ampdoc-impl.AmpDoc} nodeOrDoc
 * @return {!Promise<!AccessService>}
 */
export function accessServiceForDoc(nodeOrDoc) {
  return /** @type {!Promise<!AccessService>} */ (
      getElementServiceForDoc(nodeOrDoc, 'access', 'amp-access'));
}

/**
 * Returns a promise for the Access service or a promise for null if the service
 * is not available on the current page.
 * @param {!Node|!./service/ampdoc-impl.AmpDoc} nodeOrDoc
 * @return {!Promise<?AccessService>}
 */
export function accessServiceForDocOrNull(nodeOrDoc) {
  return /** @type {!Promise<?AccessService>} */ (
      getElementServiceIfAvailableForDoc(nodeOrDoc, 'access', 'amp-access'));
}

/**
 * @param {!Node|!./service/ampdoc-impl.AmpDoc} nodeOrDoc
 * @return {!./service/action-impl.ActionService}
 */
export function actionServiceForDoc(nodeOrDoc) {
  return /** @type {!./service/action-impl.ActionService} */ (
      getExistingServiceForDocInEmbedScope(nodeOrDoc, 'action'));
}

/**
 * @param {!Node|!./service/ampdoc-impl.AmpDoc} nodeOrDoc
 * @return {!Promise<!Activity>}
 */
export function activityForDoc(nodeOrDoc) {
  return /** @type {!Promise<!Activity>} */ (
      getElementServiceForDoc(nodeOrDoc, 'activity', 'amp-analytics'));
}

/**
 * @param {!Window} window
 * @return {!./service/batched-xhr-impl.BatchedXhr}
 */
export function batchedXhrFor(window) {
  return /** @type {!./service/batched-xhr-impl.BatchedXhr} */ (
      getService(window, 'batched-xhr'));
}

/**
 * @param {!Node|!./service/ampdoc-impl.AmpDoc} nodeOrDoc
 * @return {!Promise<!../extensions/amp-bind/0.1/bind-impl.Bind>}
 */
export function bindForDoc(nodeOrDoc) {
  return /** @type {!Promise<!../extensions/amp-bind/0.1/bind-impl.Bind>} */ (
      getElementServiceForDocInEmbedScope(nodeOrDoc, 'bind', 'amp-bind'));
}

/**
 * @param {!Node|!./service/ampdoc-impl.AmpDoc} nodeOrDoc
 * @return {!Promise<!./service/cid-impl.Cid>}
 */
export function cidForDoc(nodeOrDoc) {
  return /** @type {!Promise<!./service/cid-impl.Cid>} */ ( // eslint-disable-line max-len
      getServicePromiseForDoc(nodeOrDoc, 'cid'));
}

/**
 * @param {!Node|!./service/ampdoc-impl.AmpDoc} nodeOrDoc
 * @return {!./service/document-info-impl.DocumentInfoDef} Info about the doc
 */
export function documentInfoForDoc(nodeOrDoc) {
  return /** @type {!./service/document-info-impl.DocInfo} */ (
      getServiceForDoc(nodeOrDoc, 'documentInfo')).get();
}

/**
 * @param {!Window} window
 * @return {!./service/extensions-impl.Extensions}
 */
export function extensionsFor(window) {
  return /** @type {!./service/extensions-impl.Extensions} */ (
      getService(window, 'extensions'));
}

/**
 * Returns service implemented in service/history-impl.
 * @param {!Node|!./service/ampdoc-impl.AmpDoc} nodeOrDoc
 * @return {!./service/history-impl.History}
 */
export function historyForDoc(nodeOrDoc) {
  return /** @type {!./service/history-impl.History} */ (
      getServiceForDoc(nodeOrDoc, 'history'));
}

/**
 * @param {!Window} win
 * @return {!./input.Input}
 */
export function inputFor(win) {
  return getService(win, 'input');
};

/**
 * @param {!Node|!./service/ampdoc-impl.AmpDoc} nodeOrDoc
 * @return {!./service/parallax-impl.ParallaxService}
 */
export function parallaxForDoc(nodeOrDoc) {
  return /** @type {!./service/parallax-impl.ParallaxService} */ (
      getServiceForDoc(nodeOrDoc, 'amp-fx-parallax'));
}

/**
 * @param {!Window} window
 * @return {!./service/performance-impl.Performance}
 */
export function performanceFor(window) {
  return /** @type {!./service/performance-impl.Performance}*/ (
      getService(window, 'performance'));
}

/**
 * @param {!Window} window
 * @return {!./service/performance-impl.Performance}
 */
export function performanceForOrNull(window) {
  return /** @type {!./service/performance-impl.Performance}*/ (
      getExistingServiceOrNull(window, 'performance'));
}

/**
 * @param {!Window} window
 * @return {!./service/platform-impl.Platform}
 */
export function platformFor(window) {
  return /** @type {!./service/platform-impl.Platform} */ (
      getService(window, 'platform'));
}

/**
 * @param {!Node|!./service/ampdoc-impl.AmpDoc} nodeOrDoc
 * @return {!./service/resources-impl.Resources}
 */
export function resourcesForDoc(nodeOrDoc) {
  return /** @type {!./service/resources-impl.Resources} */ (
      getServiceForDoc(nodeOrDoc, 'resources'));
}

/**
 * @param {!Window} win
 * @return {?Promise<?{incomingFragment: string, outgoingFragment: string}>}
 */
export function shareTrackingForOrNull(win) {
  return (/** @type {
    !Promise<?{incomingFragment: string, outgoingFragment: string}>} */ (
    getElementServiceIfAvailable(win, 'share-tracking', 'amp-share-tracking',
        true)));
}

/**
 * @param {!Node|!./service/ampdoc-impl.AmpDoc} nodeOrDoc
 * @return {!Promise<!./service/storage-impl.Storage>}
 */
export function storageForDoc(nodeOrDoc) {
  return /** @type {!Promise<!./service/storage-impl.Storage>} */ (
      getServicePromiseForDoc(nodeOrDoc, 'storage'));
}

/**
 * @param {!Window} window
 * @return {!./service/template-impl.Templates}
 */
export function templatesFor(window) {
  return /** @type {!./service/template-impl.Templates} */ (
      getService(window, 'templates'));
}

/**
 * @param {!Window} window
 * @return {!./service/timer-impl.Timer}
 */
export function timerFor(window) {
  return /** @type {!./service/timer-impl.Timer} */ (
      getService(window, 'timer'));
}

/**
 * @param {!Node|!./service/ampdoc-impl.AmpDoc} nodeOrDoc
 * @return {!./service/url-replacements-impl.UrlReplacements}
 */
export function urlReplacementsForDoc(nodeOrDoc) {
  return /** @type {!./service/url-replacements-impl.UrlReplacements} */ (
      getExistingServiceForDocInEmbedScope(nodeOrDoc, 'url-replace'));
}

/**
 * @param {!Window} window
 * @return {!Promise<!UserNotificationManager>}
 */
export function userNotificationManagerFor(window) {
  return /** @type {!Promise<!UserNotificationManager>} */ (
      getElementService(window, 'userNotificationManager',
          'amp-user-notification'));
}

/**
 * Returns a promise for the experiment variants or a promise for null if it is
 * not available on the current page.
 * @param {!Window} win
 * @return {!Promise<?Object<string>>}
 */
export function variantForOrNull(win) {
  return /** @type {!Promise<?Object<string>>} */ (
      getElementServiceIfAvailable(win, 'variant', 'amp-experiment', true));
}

/**
 * @param {!Node|!./service/ampdoc-impl.AmpDoc} nodeOrDoc
 * @return {!./service/video-manager-impl.VideoManager}
 */
export function videoManagerForDoc(nodeOrDoc) {
  return /** @type {!./service/video-manager-impl.VideoManager} */ (
      getServiceForDoc(nodeOrDoc, 'video-manager'));
}

/**
 * @param {!Node|!./service/ampdoc-impl.AmpDoc} nodeOrDoc
 * @return {!./service/viewer-impl.Viewer}
 */
export function viewerForDoc(nodeOrDoc) {
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
export function viewerPromiseForDoc(nodeOrDoc) {
  return /** @type {!Promise<!./service/viewer-impl.Viewer>} */ (
      getServicePromiseForDoc(nodeOrDoc, 'viewer'));
}

/**
 * @param {!Window} window
 * @return {!./service/vsync-impl.Vsync}
 */
export function vsyncFor(window) {
  return /** @type {!./service/vsync-impl.Vsync} */ (
      getService(window, 'vsync'));
}

/**
 * @param {!Node|!./service/ampdoc-impl.AmpDoc} nodeOrDoc
 * @return {!./service/viewport-impl.Viewport}
 */
export function viewportForDoc(nodeOrDoc) {
  return /** @type {!./service/viewport-impl.Viewport} */ (
      getServiceForDoc(nodeOrDoc, 'viewport'));
}

/**
 * @param {!Window} window
 * @return {!./service/xhr-impl.Xhr}
 */
export function xhrFor(window) {
  return /** @type {!./service/xhr-impl.Xhr} */ (getService(window, 'xhr'));
}
