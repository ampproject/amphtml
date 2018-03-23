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
  AmpAdContext,
  FailureType,
  RecoveryModeType,
} from './amp-ad-type-defs';
import {Services} from '../../../src/services';
import {dev} from '../../../src/log';
import {isLayoutSizeDefined} from '../../../src/layout';
import {map} from '../../../src/utils/object';
import {sendXhrRequest} from './amp-ad-utils';

const TAG = 'amp-ad-network-base';

class AmpAdContextBase extends AmpAdContext {
  /**
   * @param {!Window} win
   * @param {AmpAdNetworkBase} ampAdInstance
   */
  constructor(win, ampAdInstance) {
    super(win);

    /** @private @const {!AmpAdNetwork} */
    this.ampAdInstance_ = ampAdInstance;
  }

  /** @override */
  applyFillContent(element) {
    this.ampAdInstance.applyFillContent(element);
  }

  /** @override */
  isInViewport() {
    this.ampAdInstance.isInViewport();
  }
}

/**
 * @abstract
 */
export class AmpAdNetworkBase extends AMP.BaseElement {

  constructor(element) {
    super(element);

    /** @private {?Promise<!../../../src/service/xhr-impl.FetchResponse>} */
    this.adResponsePromise_ = null;

    /** @private {Object<string, !./amp-ad-type-defs.Validator>} */
    this.validators_ = map();

    /** @private {Object<string, !./amp-ad-type-defs.Renderer>} */
    this.renderers_ = map();

    /** @private {Object<string, string>} */
    this.recoveryModes_ = map();

    /** @const @private {!AmpAdContext} */
    this.context_ = this.initContext();

    // Register default error modes.
    for (const failureType in FailureType) {
      this.recoveryModes_[failureType] = RecoveryModeType.COLLAPSE;
    }

    /**
     * Number of times to retry a failed request. Zero by default.
     * @type {number}
     */
    this.retryLimit_ = 0;
  }

  /** @override */
  isLayoutSupported(layout) {
    return isLayoutSizeDefined(layout);
  }

  /** @override */
  onLayoutMeasure() {
    this.sendRequest_();
  }

  /** @override */
  layoutCallback() {
    dev().assert(this.adResponsePromise_,
        'layoutCallback invoked before XHR request!');
    return this.adResponsePromise_
        .then(response => this.invokeValidator_(response))
        .then(validatorResult => this.invokeRenderer_(validatorResult))
        .catch(error => this.handleFailure_(error.type, error.msg));
  }

  /**
   * @param {!FailureType} failure
   * @param {!RecoveryModeType} recovery
   * @final
   */
  onFailure(failure, recovery) {
    if (this.recoveryModes_[failure]) {
      dev().warn(TAG,
          `Recovery mode for failure type ${failure} already registered!`);
    }
    this.recoveryModes_[failure] = recovery;
  }

  /**
   * @param {!./amp-ad-type-defs.Validator} validator
   * @param {string=} type
   * @final
   */
  registerValidator(validator, type = 'default') {
    if (this.validators_[type]) {
      dev().warn(TAG, `${type} validator already registered.`);
    }
    this.validators_[type] = validator;
  }

  /**
   * @param {!./amp-ad-type-defs.Renderer} renderer
   * @param {string} type
   * @final
   */
  registerRenderer(renderer, type) {
    if (this.renderers_[type]) {
      dev().warn(TAG, `Rendering mode already registered for type '${type}'`);
    }
    this.renderers_[type] = renderer;
  }

  /**
   * @return {!Object} The context object passed to validators and renderers.
   */
  getContext() {
    return this.context_;
  }

  /**
   * @return {string} The finalized ad request URL.
   * @protected
   * @abstract
   */
  getRequestUrl() {
    // Subclass must override.
  }

  /**
   * Creates an AmpAdContext instance. This method can be overriden by
   * subclasses to generate custom AmpAdContext instances. If not overridden, a
   * default is supplied.
   *
   * @return {!AmpAdContext}
   */
  initContext() {
    return new AmpAdContextBase(this.win, this);
  }

  /** @param {number} retries */
  setRequestRetries(retries) {
    this.retryLimit_ = retries;
  }

  /**
   * Sends ad request.
   * @private
   */
  sendRequest_() {
    Services.viewerForDoc(this.getAmpDoc()).whenFirstVisible().then(() => {
      const url = this.getRequestUrl();
      this.adResponsePromise_ = sendXhrRequest(this.win, url);
    });
  }

  /**
   * Processes the ad response as soon as the XHR request returns.
   * @param {?../../../src/service/xhr-impl.FetchResponse} response
   * @return {!Promise}
   * @private
   */
  invokeValidator_(response) {
    if (!response.arrayBuffer) {
      return Promise.reject(this.handleFailure_(FailureType.INVALID_RESPONSE));
    }
    return response.arrayBuffer().then(unvalidatedBytes => {
      const validatorType = response.headers.get('AMP-Ad-Response-Type')
          || 'default';
      dev().assert(this.validators_[validatorType],
          'Validator never registered!');
      return this.validators_[validatorType].validate(
          this.context_, unvalidatedBytes, response.headers)
          .catch(err =>
            Promise.reject({type: FailureType.VALIDATOR_ERROR, msg: err}));
    });
  }

  /**
   * @param {!./amp-ad-type-defs.ValidatorOutput} validatorOutput
   * @return {!Promise}
   * @private
   */
  invokeRenderer_(validatorOutput) {
    const renderer = this.renderers_[validatorOutput.type];
    dev().assert(renderer, 'Renderer for AMP creatives never registered!');
    return renderer.render(
        this.context_, this.element, validatorOutput.creativeData)
        .catch(err =>
          Promise.reject({type: FailureType.RENDERER_ERROR, msg: err}));
  }

  /**
   * @param {FailureType} failureType
   * @param {*=} error
   * @private
   */
  handleFailure_(failureType, error) {
    const recoveryMode = this.recoveryModes_[failureType];
    if (error) {
      dev().warn(TAG, error);
    }
    switch (recoveryMode.type) {
      case RecoveryModeType.COLLAPSE:
        this.forceCollapse_();
        break;
      case RecoveryModeType.RETRY:
        if (this.retryLimit_--) {
          this.sendRequest_();
        }
        break;
      default:
        dev().error(TAG, 'Invalid recovery mode!');
    }
  }

  /**
   * Collapses slot by setting its size to 0x0.
   * @private
   */
  forceCollapse_() {
    this.attemptChangeSize(0, 0);
  }
}
