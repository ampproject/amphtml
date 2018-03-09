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
  FailureTypes,
  RecoveryModeTypes,
  ValidRecoveryModeTypes,
} from './amp-ad-type-defs';
import {Services} from '../../../src/services';
import {dev} from '../../../src/log';
import {isLayoutSizeDefined} from '../../../src/layout';
import {map} from '../../../src/utils/object';
import {sendXhrRequest} from './amp-ad-utils';

const TAG = 'amp-ad-network-base';

export class AmpAdNetworkBase extends AMP.BaseElement {

  constructor(element) {
    super(element);

    /** @private {Object<string, !./amp-ad-render.Renderer>} */
    this.renderers_ = map({});

    /** @private {Object<string, !./amp-ad-render.Validator>} */
    this.validators_ = map({});

    /** @private {Object<./amp-ad-type-defs.FailureType, !./amp-ad-type-defs.RecoveryMode>} */
    this.recoveryModes_ = map({});

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
    for (const failureType in FailureTypes) {
      this.recoveryModes_[failureType] = RecoveryModeTypes.COLLAPSE;
    }
  }

  /**
   * @param {!./amp-ad-type-defs.FailureType} failureType
   * @param {*=} error
   */
  handleFailure_(failureType, error) {
    const recoveryMode = this.recoveryModes_[failureType];
    if (error) {
      dev().warn(TAG, error);
    }
    switch (recoveryMode.type) {
      case RecoveryModeTypes.COLLAPSE:
        this.forceCollapse_();
        break;
      case RecoveryModeTypes.RETRY:
        Services.timerFor(this.win).delay(
            () => this.sendRequest_(), recoveryMode.retryTimer || 0);
        break;
      case RecoveryModeTypes.VALIDATOR_FALLBACK:
        dev().assert(recoveryMode.fallback,
            'Fallback validator never specified for recovery mode!');
        this.invokeValidator_(recoveryMode.fallback);
        break;
      case RecoveryModeTypes.FORCE_RENDERER:
      case RecoveryModeTypes.RENDERER_FALLBACK:
        dev().assert(recoveryMode.fallback,
            'Fallback renderer never specified for recovery mode!');
        this.invokeRenderer_(recoveryMode.fallback, this.context_);
        break;
      default:
        dev().error(TAG, 'Invalid recovery mode!');
    }
  }

  /**
   * @param {!./amp-ad-type-defs.FailureType} type
   * @param {!./amp-ad-type-defs.RecoveryMode} mode
   */
  checkAndSetRecoveryMode_(type, mode) {
    dev().assert(ValidRecoveryModeTypes.indexOf(mode.type) >= 0,
        `Recovery mode ${mode.type} not allowed for failure type ${type}!`);
    this.recoveryModes_[type] = mode;
  }

  /**
   * @param {!./amp-ad-type-defs.FailureType} failureType
   * @param {!./amp-ad-type-defs.RecoveryModeType} recoveryType
   * @param {number=} retryTimer
   * @param {string=} fallback Validator/Renderer fallback.
   */
  registerRecoveryMode(failureType, recoveryType, retryTimer, fallback) {
    if (this.recoveryModes_[failureType]) {
      dev().warn(TAG,
          `Recovery mode for failure type ${failureType} already registered!`);
    }
    this.checkAndSetRecoveryMode_(
        failureType, {type: recoveryType, retryTimer, fallback});
  }

  /**
   * @param {string} resultType
   * @param {!./amp-ad-render.Renderer} renderer
   * @final
   */
  registerRenderer(resultType, renderer) {
    if (this.renderers_[resultType]) {
      dev().warn(TAG,
          `Rendering mode already registered for type '${resultType}'`);
    }
    this.renderers_[resultType] = renderer;
  }

  /**
   * @param {!./amp-ad-render.Validator} validator
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
   * Collapses slot by setting its size to 0x0.
   * @private
   */
  forceCollapse_() {
    this.attemptChangeSize(0, 0);
  }

  /**
   * @return {string} The finalized ad request URL.
   * @protected
   */
  getRequestUrl() {
    return '';
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
      this.handleFailure_(FailureTypes.MISSING_ARRAYBUFFER);
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

  /** @param {string} validatorType */
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
            this.validators_ = map({});
          }
        })
        .catch(error =>
          this.handleFailure_(FailureTypes.VALIDATOR_ERROR, error));
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
   */
  invokeRenderer_(rendererType, context) {
    const renderer = this.renderers_[rendererType];

    dev().assert(renderer, 'Renderer for AMP creatives never registered!');
    renderer.render(context, this)
        .then(unusedContext => {
          if (!this.isReusable_) {
            this.renderers_ = map({});
          }
        })
        .catch(error =>
          this.handleFailure_(FailureTypes.RENDERER_ERROR, error));
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
          .catch(error => this.handleFailure_(FailureTypes.SENDXHR, error));
    });
  }

  /** @param {boolean} isReusable */
  setIsReusable(isReusable) {
    this.isReusable_ = isReusable;
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



