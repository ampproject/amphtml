function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError("Cannot call a class as a function");}}function _defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}function _createClass(Constructor, protoProps, staticProps) {if (protoProps) _defineProperties(Constructor.prototype, protoProps);if (staticProps) _defineProperties(Constructor, staticProps);return Constructor;} /**
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

import { devAssert } from "./log";
import { Services } from "./service";
import { getServicePromise } from "./service-helpers";

/**
 * A map of services that delay rendering. The key is the name of the service
 * and the value is a DOM query which is used to check if the service is needed
 * in the current document.
 * Do not add a service unless absolutely necessary.
 *
 * \   \  /  \  /   / /   \     |   _  \     |  \ |  | |  | |  \ |  |  / _____|
 *  \   \/    \/   / /  ^  \    |  |_)  |    |   \|  | |  | |   \|  | |  |  __
 *   \            / /  /_\  \   |      /     |  . `  | |  | |  . `  | |  | |_ |
 *    \    /\    / /  _____  \  |  |\  \----.|  |\   | |  | |  |\   | |  |__| |
 *     \__/  \__/ /__/     \__\ | _| `._____||__| \__| |__| |__| \__|  \______|
 *
 * The equivalent of this list is used for server-side rendering (SSR) and any
 * changes made to it must be made in coordination with caches that implement
 * SSR. For more information on SSR see bit.ly/amp-ssr.
 *
 * @const {!Object<string, string>}
 */
var SERVICES = {
  'amp-dynamic-css-classes': '[custom-element=amp-dynamic-css-classes]',
  'variant': 'amp-experiment',
  'amp-story-render': 'amp-story[standalone]' };


/**
 * Base class for render delaying services.
 * This should be extended to ensure the service
 * is properly handled
 *
 * @interface
 */
export var RenderDelayingService = /*#__PURE__*/function () {function RenderDelayingService() {_classCallCheck(this, RenderDelayingService);}_createClass(RenderDelayingService, [{ key: "whenReady", value:
    /**
     * Function to return a promise for when
     * it is finished delaying render, and is ready.
     * NOTE: This should simply return Promise.resolve,
     * if your service does not need to perform any logic
     * after being registered.
     * @return {!Promise}
     */
    function whenReady() {} }]);return RenderDelayingService;}();


/**
 * Maximum milliseconds to wait for all extensions to load before erroring.
 * @const
 */
var LOAD_TIMEOUT = 3000;

/**
 * Detects any render delaying services that are required on the page, and
 * returns a promise with a timeout.
 * @param {!Window} win
 * @return {!Promise<!Array<*>>} resolves to an Array that has the same length
 *     as the detected render delaying services
 */
export function waitForServices(win) {
  var promises = includedServices(win).map(function (serviceId) {
    var serviceReadyPromise = getServicePromise(win, serviceId).then(
    function (service) {
      if (service && isRenderDelayingService(service)) {
        return service.whenReady().then(function () {
          return service;
        });
      }
      return service;
    });


    return Services.timerFor(win).timeoutPromise(
    LOAD_TIMEOUT,
    serviceReadyPromise, "Render timeout waiting for service ".concat(
    serviceId, " to be ready."));

  });
  return Promise.all(promises);
}

/**
 * Returns true if the page has a render delaying service.
 * @param {!Window} win
 * @return {boolean}
 */
export function hasRenderDelayingServices(win) {
  return includedServices(win).length > 0;
}

/**
 * Function to determine if the passed
 * Object is a Render Delaying Service
 * @param {!Object} service
 * @return {boolean}
 */
export function isRenderDelayingService(service) {
  var maybeRenderDelayingService = /** @type {!RenderDelayingService}*/(
  service);

  return typeof maybeRenderDelayingService.whenReady == 'function';
}

/**
 * Detects which, if any, render-delaying extensions are included on the page.
 * @param {!Window} win
 * @return {!Array<string>}
 */
export function includedServices(win) {
  /** @const {!Document} */
  var doc = win.document;
  devAssert(doc.body);

  return Object.keys(SERVICES).filter(function (service) {
    return doc.querySelector(SERVICES[service]);
  });
}
// /Users/mszylkowski/src/amphtml/src/render-delaying-services.js