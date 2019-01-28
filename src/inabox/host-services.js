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
  // The host service doesn't match its environment.  For example, a SafeFrame
  // host service when run in something that isn't a SafeFrame.  The
  // implementation should consider falling back to its default implementation
  // on the regular web.
  MISMATCH: 1,
  // The host service is correct for its environment, but not able to function.
  // For example, a SafeFrame host service running inside a SafeFrame
  // implementation that is incomplete or out of date.
  UNSUPPORTED: 2,
};

export class HostServices {

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
   *     indicating if the request was fulfilled
   */
  enterFullscreenOverlay(unusedTargetElement) {
    throwUnsupportedError();
  }

  /**
   * Request to exit from fullscreen overlay.
   *
   * @param {!Element} unusedTargetElement
   * @return {!Promise<boolean>} promise resolves to a boolean
   *     indicating if the request was fulfilled
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
   *     indicating if the request was fulfilled
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
