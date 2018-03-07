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
import {Services} from '../../../src/services';
import {dev} from '../../../src/log';
import {isLayoutSizeDefined} from '../../../src/layout';
import {map} from '../../../src/utils/object';
import {sendXhrRequest} from './amp-ad-utils';

const TAG = 'amp-ad-network-base';

export class AmpAdNetworkBase extends AMP.BaseElement {

  constructor(element) {
    super(element);

    /** @private {Object<./amp-ad-type-defs.ValidatorResultType, !./amp-ad-render.Renderer>} */
    this.registeredRenderers_ = map({});

    /** @private {?./amp-ad-render.Validator} */
    this.registeredValidator_ = null;

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
  }

  /**
   * @param {./amp-ad-type-defs.ValidatorResultType} resultType
   * @param {!./amp-ad-render.Renderer} renderer
   * @final
   */
  registerRenderer(resultType, renderer) {
    if (this.registeredRenderers_[resultType]) {
      dev().warn(TAG,
          `Rendering mode already registered for type '${resultType}'`);
    }
    this.registeredRenderers_[resultType] = renderer;
  }

  /**
   * @param {!./amp-ad-render.Validator} validator
   * @final
   */
  registerValidator(validator) {
    if (this.registeredValidator_) {
      dev().warn(TAG, 'Validator already registered.');
    }
    this.registeredValidator_ = validator;
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
      // TODO(levitzky) Add error reporting.
      this.forceCollapse_();
      return;
    }
    response.arrayBuffer().then(unvalidatedBytes => {
      dev().assert(this.registeredValidator_, 'Validator never registered!');
      this.context_
          .setUnvalidatedBytes(unvalidatedBytes)
          .setHeaders(response.headers);
      this.registeredValidator_.validate(this.context_)
          .then(context => this.handleValidatorResponse_(context))
          .catch(error => this.handleValidatorError_(error));
      if (!this.isReusable_) {
        this.registeredValidator_ = null;
      }
    });
  }

  /**
   * Invoked whenever the ad response errors out for any reason whatsoever.
   * @param {*} error
   * @private
   */
  handleAdResponseError_(error) {
    // TODO(levitzky) add actual error processing logic.
    dev().warn(TAG, error);
  }

  /**
   * Invoked whenever the validator encounters an error.
   * @param {*} error
   * @private
   */
  handleValidatorError_(error) {
    // TODO(levitzky) add actual error processing logic.
    dev().warn(TAG, error);
  }

  /**
   * Processes validator response and delegates further action to appropriate
   *   renderer.
   * @param {!AmpAdContext} context
   * @private
   */
  handleValidatorResponse_(context) {
    const result = context.getValidatorResult();
    dev().assert(this.registeredRenderers_[result],
        'Renderer for AMP creatives never registered!');
    this.registeredRenderers_[result].render(context, this);
    if (!this.isReusable_) {
      this.registeredRenderers_ = map({});
    }
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
    Services.viewerForDoc(this.getAmpDoc()).whenFirstVisible().then(() => {
      const url = this.getRequestUrl();
      this.context_.setRequestUrl(url);
      sendXhrRequest(url, this.win)
          .then(response => this.handleAdResponse_(response))
          .catch(error => this.handleAdResponseError_(error));
    });
  }
}

