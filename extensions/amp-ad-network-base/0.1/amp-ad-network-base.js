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
import {dev} from '../../../src/log';
import {isLayoutSizeDefined} from '../../../src/layout';
import {sendXhrRequest} from './amp-ad-utils';

const TAG = 'amp-ad-network-base';

export class AmpAdNetworkBase extends AMP.BaseElement {

  constructor(element) {
    super(element);

    /** @private {Object<./amp-ad-type-defs.ValidatorResultType, !./amp-ad-render.Renderer>} */
    this.boundRenderers_ = {};

    /** @private {?./amp-ad-render.Validator} */
    this.boundValidator_ = null;

    /** @private {!./amp-ad-type-defs.LayoutInfoDef} */
    this.initialSize_ = {
      // TODO(levitzky) handle non-numeric values.
      width: element.getAttribute('width'),
      height: element.getAttribute('height'),
    };

    /** @private {string} @const */
    this.networkType_ = element.getAttribute('type') || 'anon';

    /** @const @private {!AmpAdContext} */
    this.context_ = new AmpAdContext(this.win).setSize(this.initialSize_);
  }

  /**
   * @param {./amp-ad-type-defs.ValidatorResultType} resultType
   * @param {!./amp-ad-render.Renderer} renderer
   * @final
   */
  bindRenderer(resultType, renderer) {
    if (this.boundRenderers_[resultType]) {
      dev().warn(TAG, `Rendering mode already bound for type '${resultType}'`);
    }
    this.boundRenderers_[resultType] = renderer;
  }

  /**
   * @param {!./amp-ad-render.Validator} validator
   * @final
   */
  bindValidator(validator) {
    if (this.boundValidator_) {
      dev().warn(TAG, 'Validator already bound.');
    }
    this.boundValidator_ = validator;
  }

  /**
   * Collapses slot by setting its size to 0x0.
   * @private
   */
  forceCollapse_() {
    super.attemptChangeSize(0, 0);
  }

  /** @return {string} */
  getNetworkType() {
    return this.networkType_;
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
      dev().assert(this.boundValidator_, 'Validator never bound!');
      this.context_
          .setUnvalidatedBytes(unvalidatedBytes)
          .setHeaders(response.headers);
      this.boundValidator_.validate(this.context_)
          .then(context => this.handleValidatorResponse_(context))
          .catch(error => this.handleValidatorError_(error));
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
    dev().assert(this.boundRenderers_[result],
        'Renderer for AMP creatives never bound!');
    this.boundRenderers_[result].render(context, this);
  }

  /** @override */
  isLayoutSupported(layout) {
    return isLayoutSizeDefined(layout);
  }

  /** @override */
  onLayoutMeasure() {
    const url = this.getRequestUrl();
    this.context_.setRequestUrl(url);
    sendXhrRequest(url, this.win)
        .then(response => this.handleAdResponse_(response))
        .catch(error => this.handleAdResponseError_(error));
  }
}
