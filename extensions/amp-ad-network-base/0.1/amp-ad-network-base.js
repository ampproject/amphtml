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

import {AmpAdContext} from './amp-ad-context';
import {
  FailureType,
  RecoveryModeType,
} from './amp-ad-type-defs';
import {Services} from '../../../src/services';
import {dev} from '../../../src/log';
import {isLayoutSizeDefined} from '../../../src/layout';
import {map} from '../../../src/utils/object';
import {sendXhrRequest} from './amp-ad-utils';

const TAG = 'amp-ad-network-base';

/**
 * @abstract
 */
export class AmpAdNetworkBase extends AMP.BaseElement {

  constructor(element) {
    super(element);

    /** @private {Object<string, !./amp-ad-type-defs.Renderer>} */
    this.renderers_ = map();

    /** @private {Object<string, !./amp-ad-type-defs.Validator>} */
    this.validators_ = map();

    /** @private {Object<string, string>} */
    this.recoveryModes_ = map();

    /** @private {?./amp-ad-type-defs.LayoutInfoDef} */
    this.initialSize_ = null;

    /** @const @private {!AmpAdContext} */
    this.context_ = new AmpAdContext(this.win);

    /**
     * When true, indicates that the renderer and validator should not be
     * freed (e.g., for refreshable implementations).
     * @private {boolean}
     */
    this.isReusable_ = false;

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

  /**
   * @param {string} failure
   * @param {string} recovery
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
   * @return {string} The finalized ad request URL.
   * @protected
   * @abstract
   */
  getRequestUrl() {
    // Subclass must override.
  }

  /** @param {boolean} isReusable */
  setIsReusable(isReusable) {
    this.isReusable_ = isReusable;
  }

  /** @param {number} retries */
  setRequestRetries(retries) {
    this.retryLimit_ = retries;
  }


  /**
   * Processes the ad response as soon as the XHR request returns. This can be
   * overridden and used as a hook to perform any desired logic before passing
   * the response to the validator.
   * @param {?../../../src/service/xhr-impl.FetchResponse} response
   * @private
   */
  handleAdResponse_(response) {
    if (!response.arrayBuffer) {
      this.handleFailure_(FailureType.INVALID_RESPONSE);
      return;
    }
    response.arrayBuffer().then(unvalidatedBytes => {
      const validatorType = response.headers.get('validator-type') || 'default';
      this.context_
          .setUnvalidatedBytes(unvalidatedBytes)
          .setHeaders(response.headers);
      this.invokeValidator_(validatorType);
    });
  }

  /**
   * @param {string} validatorType
   * @private
   */
  invokeValidator_(validatorType) {
    const unvalidatedBytes = this.context_.getUnvalidatedBytes();
    dev().assert(this.validators_[validatorType],
        'Validator never registered!');
    dev().assert(unvalidatedBytes,
        'Validator invoked before ad response received!');
    this.validators_[validatorType].validate(this.context_)
        .then(context => {
          this.handleValidatorResponse_(context);
          if (!this.isReusable_) {
            this.validators_ = map();
          }
        })
        .catch(error =>
          this.handleFailure_(FailureType.VALIDATOR_ERROR, error));
  }

  /**
   * Processes validator response and delegates further action to appropriate
   *   renderer.
   * @param {!AmpAdContext} context
   * @private
   */
  handleValidatorResponse_(context) {
    const rendererType = context.getValidatorResult();
    this.invokeRenderer_(/** @type {string} */ (rendererType), context);
  }

  /**
   * @param {string} rendererType
   * @param {!AmpAdContext} context
   * @private
   */
  invokeRenderer_(rendererType, context) {
    const renderer = this.renderers_[rendererType];

    dev().assert(renderer, 'Renderer for AMP creatives never registered!');
    renderer.render(context, this)
        .then(unusedContext => {
          if (!this.isReusable_) {
            this.renderers_ = map();
          }
        })
        .catch(error =>
          this.handleFailure_(FailureType.RENDERER_ERROR, error));
  }

  /**
   * @param {string} failureType
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

  /**
   * Sends ad request.
   * @private
   */
  sendRequest_() {
    Services.viewerForDoc(this.getAmpDoc()).whenFirstVisible().then(() => {
      const url = this.getRequestUrl();
      this.context_.setRequestUrl(url);
      sendXhrRequest(url, this.win)
          .then(response => this.handleAdResponse_(response))
          .catch(error =>
            this.handleFailure_(FailureType.REQUEST_ERROR, error));
    });
  }

  /** @override */
  buildCallback() {
    this.initialSize_ = {
      // TODO(levitzky) handle non-numeric values.
      width: this.element.getAttribute('width'),
      height: this.element.getAttribute('height'),
    };
    this.context_.setSize(this.initialSize_);
  }

  /** @override */
  isLayoutSupported(layout) {
    return isLayoutSizeDefined(layout);
  }

  /** @override */
  onLayoutMeasure() {
    this.sendRequest_();
  }
}



