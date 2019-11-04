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
  rejectServicePromiseForDoc,
} from '../service';

const ServiceNames = {
  VISIBILITY: 'host-visibility',
  FULLSCREEN: 'host-fullscreen',
  EXIT: 'host-exit',
};

/**
 * Error object for various host services. It is passed around in case
 * of host service failures for proper error handling.
 *
 * - fallback: if the caller should fallback to other impl
 *
 * @typedef {{
 *   fallback: boolean
 * }}
 */
export let HostServiceError;

/**
 * A set of service interfaces that is used when the AMP document is loaded
 * in an environment that does not provide regular web APIs for things like
 * - open URL
 * - scroll events, IntersectionObserver
 * - expand to fullscreen
 *
 * The consumers of those services should get the service by calling
 * XXXForDoc(), which returns a Promise that resolves to the service Object,
 * or gets rejected with an error Object. (See HostServiceError)
 *
 * The providers of those services should install the service by calling
 * installXXXServiceForDoc() when it's available, or
 * rejectXXXServiceForDoc() when there is a failure.
 */
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
   * @return {!Promise<!VisibilityInterface>}
   */
  static visibilityForDoc(elementOrAmpDoc) {
    return /** @type {!Promise<!VisibilityInterface>} */ (getServicePromiseForDoc(
      elementOrAmpDoc,
      ServiceNames.VISIBILITY
    ));
  }

  /**
   * @param {!Element|!../service/ampdoc-impl.AmpDoc} elementOrAmpDoc
   * @param {function(new:Object, !../service/ampdoc-impl.AmpDoc)} impl
   */
  static installVisibilityServiceForDoc(elementOrAmpDoc, impl) {
    registerServiceBuilderForDoc(
      elementOrAmpDoc,
      ServiceNames.VISIBILITY,
      impl,
      /* opt_instantiate */ true
    );
  }

  /**
   * @param {!Element|!../service/ampdoc-impl.AmpDoc} elementOrAmpDoc
   * @param {!HostServiceError} error
   */
  static rejectVisibilityServiceForDoc(elementOrAmpDoc, error) {
    rejectServicePromiseForDoc(elementOrAmpDoc, ServiceNames.VISIBILITY, error);
  }

  /**
   * @param {!Element|!../service/ampdoc-impl.AmpDoc} elementOrAmpDoc
   * @return {!Promise<!FullscreenInterface>}
   */
  static fullscreenForDoc(elementOrAmpDoc) {
    return /** @type {!Promise<!FullscreenInterface>} */ (getServicePromiseForDoc(
      elementOrAmpDoc,
      ServiceNames.FULLSCREEN
    ));
  }

  /**
   * @param {!Element|!../service/ampdoc-impl.AmpDoc} elementOrAmpDoc
   * @param {function(new:Object, !../service/ampdoc-impl.AmpDoc)} impl
   */
  static installFullscreenServiceForDoc(elementOrAmpDoc, impl) {
    registerServiceBuilderForDoc(
      elementOrAmpDoc,
      ServiceNames.FULLSCREEN,
      impl,
      /* opt_instantiate */ true
    );
  }

  /**
   * @param {!Element|!../service/ampdoc-impl.AmpDoc} elementOrAmpDoc
   * @param {!HostServiceError} error
   */
  static rejectFullscreenServiceForDoc(elementOrAmpDoc, error) {
    rejectServicePromiseForDoc(elementOrAmpDoc, ServiceNames.FULLSCREEN, error);
  }

  /**
   * @param {!Element|!../service/ampdoc-impl.AmpDoc} elementOrAmpDoc
   * @return {!Promise<!ExitInterface>}
   */
  static exitForDoc(elementOrAmpDoc) {
    return /** @type {!Promise<!ExitInterface>} */ (getServicePromiseForDoc(
      elementOrAmpDoc,
      ServiceNames.EXIT
    ));
  }

  /**
   * @param {!Element|!../service/ampdoc-impl.AmpDoc} elementOrAmpDoc
   * @param {function(new:Object, !../service/ampdoc-impl.AmpDoc)} impl
   */
  static installExitServiceForDoc(elementOrAmpDoc, impl) {
    registerServiceBuilderForDoc(
      elementOrAmpDoc,
      ServiceNames.EXIT,
      impl,
      /* opt_instantiate */ true
    );
  }

  /**
   * @param {!Element|!../service/ampdoc-impl.AmpDoc} elementOrAmpDoc
   * @param {!HostServiceError} error
   */
  static rejectExitServiceForDoc(elementOrAmpDoc, error) {
    rejectServicePromiseForDoc(elementOrAmpDoc, ServiceNames.EXIT, error);
  }
}

/**
 * VisibilityInterface defines interface provided by host for visibility
 * detection.
 *
 * @interface
 */
export class VisibilityInterface {
  /**
   * Register a callback for visibility change events.
   *
   * @param {function(!VisibilityDataDef)} unusedCallback
   */
  onVisibilityChange(unusedCallback) {}
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
 * FullscreenInterface defines interface provided by host to enable/disable
 * fullscreen mode.
 *
 * @interface
 */
export class FullscreenInterface {
  /**
   * Request to expand the given element to fullscreen overlay.
   *
   * @param {!Element} unusedTargetElement
   * @return {!Promise<boolean>} promise resolves to a boolean
   *     indicating if the request was fulfilled
   */
  enterFullscreenOverlay(unusedTargetElement) {}

  /**
   * Request to exit from fullscreen overlay.
   *
   * @param {!Element} unusedTargetElement
   * @return {!Promise<boolean>} promise resolves to a boolean
   *     indicating if the request was fulfilled
   */
  exitFullscreenOverlay(unusedTargetElement) {}
}

/**
 * ExitInterface defines interface provided by host for navigating out.
 *
 * @interface
 */
export class ExitInterface {
  /**
   * Request to navigate to URL.
   *
   * @param {string} unusedUrl
   * @return {!Promise<boolean>} promise resolves to a boolean
   *     indicating if the request was fulfilled
   */
  openUrl(unusedUrl) {}
}
