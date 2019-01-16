/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
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

import {Services} from '../services';
import {
  getServicePromiseForDoc,
  registerServiceBuilderForDoc,
} from '../service';

const ServiceNames = {
  VISIBILITY: 'host-visibility',
  FULLSCREEN: 'host-fullscreen',
  EXIT: 'host-exit',
};

export const HostServiceError = {
  MISS_MATCH: 1, // The HostService impl mis-matches the environment,
  // extension should consider to fallback to
  // its default behavior on regular web.
  NOT_SUPPORTED: 2, // The particular feature is not supported
  // by the current implementation of HostServices,
  // it's up to extension to decide what's the best
  // fallback behavior.
};

export class HostServices {

  /**
   * @param {!Element|!../service/ampdoc-impl.AmpDoc} elementOrAmpDoc
   * @return {boolean}
   */
  static isAvailable(elementOrAmpDoc) {
    const head = Services.ampdoc(elementOrAmpDoc).getHeadNode();
    return !!head.querySelector('script[host-service]');
  }

  /**
   * @param {!Element|!../service/ampdoc-impl.AmpDoc} elementOrAmpDoc
   * @return {!Promise<!Visibility>}
   */
  static visibilityForDoc(elementOrAmpDoc) {
    return /** @type {!Promise<!Visibility>} */ (
      getServicePromiseForDoc(elementOrAmpDoc, ServiceNames.VISIBILITY));
  }

  /**
   * @param {!Element|!../service/ampdoc-impl.AmpDoc} elementOrAmpDoc
   * @param {!Visibility} impl
   */
  static installVisibilityServiceForDoc(elementOrAmpDoc, impl) {
    registerServiceBuilderForDoc(elementOrAmpDoc,
        ServiceNames.VISIBILITY, impl, /* opt_instantiate */ true);
  }

  /**
   * @param {!Element|!../service/ampdoc-impl.AmpDoc} elementOrAmpDoc
   * @return {!Promise<!Visibility>}
   */
  static fullscreenForDoc(elementOrAmpDoc) {
    return /** @type {!Promise<!Fullscreen>} */ (
      getServicePromiseForDoc(elementOrAmpDoc, ServiceNames.FULLSCREEN));
  }

  /**
   * @param {!Element|!../service/ampdoc-impl.AmpDoc} elementOrAmpDoc
   * @param {!Fullscreen} impl
   */
  static installFullscreenServiceForDoc(elementOrAmpDoc, impl) {
    registerServiceBuilderForDoc(elementOrAmpDoc,
        ServiceNames.FULLSCREEN, impl, /* opt_instantiate */ true);
  }

  /**
   * @param {!Element|!../service/ampdoc-impl.AmpDoc} elementOrAmpDoc
   * @return {!Promise<!Exit>}
   */
  static exitForDoc(elementOrAmpDoc) {
    return /** @type {!Promise<!Fullscreen>} */ (
      getServicePromiseForDoc(elementOrAmpDoc, ServiceNames.EXIT));
  }

  /**
   * @param {!Element|!../service/ampdoc-impl.AmpDoc} elementOrAmpDoc
   * @param {!Exit} impl
   */
  static installExitServiceForDoc(elementOrAmpDoc, impl) {
    registerServiceBuilderForDoc(elementOrAmpDoc,
        ServiceNames.EXIT, impl, /* opt_instantiate */ true);
  }
}

/**
 * Visibility defines interface provided by host for visibility detection.
 *
 * @interface
 */
export class Visibility {

  /**
   * Register a callback for visibility change events.
   *
   * @param {function(!VisibilityDataDef)} unusedCallback
   */
  onVisibilityChange(unusedCallback) {
    throwUnsupportedError();
  }
}

/**
 * The structure that combines position and size for an element. The exact
 * interpretation of position and size depends on the use case.
 *
 * @typedef {{
 *   visibleRect: (?../layout-rect.LayoutRectDef),
 *   visibleRatio: number
 * }}
 */
export let VisibilityDataDef;


/**
 * Fullscreen defines interface provided by host to enable/disable
 * fullscreen mode.
 *
 * @interface
 */
export class Fullscreen {

  /**
   * Request to expand the given element to fullscreen overlay.
   *
   * @param {!Element} unusedTargetElement
   * @return {!Promise<boolean>} promise resolves to a boolean
   *     indicating if the request if fulfilled
   */
  enterFullscreenOverlay(unusedTargetElement) {
    throwUnsupportedError();
  }

  /**
   * Request to exit from fullscreen overlay.
   *
   * @param {!Element} unusedTargetElement
   * @return {!Promise<boolean>} promise resolves to a boolean
   *     indicating if the request if fulfilled
   */
  exitFullscreenOverlay(unusedTargetElement) {
    throwUnsupportedError();
  }
}

/**
 * Exit defines interface provided by host for navigating out.
 *
 * @interface
 */
export class Exit {

  /**
   * Request to navigate to URL.
   *
   * @param {string} unusedUrl
   * @return {!Promise<boolean>} promise resolves to a boolean
   *     indicating if the request if fulfilled
   */
  openUrl(unusedUrl) {
    throwUnsupportedError();
  }
}

/**
 * Throw unsupported error.
 */
function throwUnsupportedError() {
  throw new Error('Unsupported operation');
}
