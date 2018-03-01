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

import {dev} from '../../../src/log';
import {
  getAmpAdMetadata, // eslint-disable-line no-unused-vars
  sendXhrRequest, // eslint-disable-line no-unused-vars
} from './amp-ad-utils';
import {utf8Encode} from '../../../src/utils/bytes';

const TAG = 'amp-ad-network-base';

export class AmpAdNetworkBase extends AMP.BaseElement {

  constructor(element) {
    super(element);

    /** @private {Object<./amp-ad-type-defs.ValidatorResultType, !./amp-ad-type-defs.RendererDef>} */
    this.boundRenderers_ = {};

    /** @private {?./amp-ad-type-defs.ValidatorDef} */
    this.boundValidator_ = null;

    /** @private {?ArrayBuffer} */
    this.unvalidatedBytes_ = null;

    /** @private {!./amp-ad-utils.LayoutInfoDef} */
    this.initialSize_ = {
      // TODO(levitzky) handle non-numeric values.
      width: element.getAttribute('width'),
      height: element.getAttribute('height'),
    };

    /** @private {string} @const */
    this.networkType_ = element.getAttribute('type') || 'anon';
  }

  /**
   * @param {./amp-ad-type-defs.ValidatorResultType} resultType
   * @param {!./amp-ad-type-defs.RendererDef} renderer
   * @final
   */
  bindRenderer(resultType, renderer) {
    if (this.boundRenderers_[resultType]) {
      dev().warn(TAG, `Rendering mode already bound for type '${resultType}'`);
    }
    this.boundRenderers_[resultType] = renderer;
  }

  /**
   * @param {!./amp-ad-type-defs.ValidatorDef} validator
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

  /**
   * @return {string} The finalized ad request URL.
   * @protected
   */
  getRequestUrl() {
    return '';
  }

  /**
   * @param {!./amp-ad-type-defs.ValidatorOutputDef} validatorOutput
   * @return {!./amp-ad-type-defs.RendererInputDef}
   * @private
   */
  getRendererInput_(validatorOutput) {
    const creative = validatorOutput.creative;
    return /** @type {!./amp-ad-type-defs.RendererInputDef} */ ({
      creativeMetadata: getAmpAdMetadataMock(creative, TAG, this.networkType_),
      templateData: null,
      crossDomainData: {
        rawCreativeBytes: this.unvalidatedBytes_,
        additionalContextMetadata: {},
        sentinel: '',
      },
      unvalidatedBytes: this.unvalidatedBytes_,
      // TODO(levitzky) This may change based on the ad response.
      size: this.initialSize_,
      adUrl: this.getRequestUrl(),
    });
  }

  /**
   * Processes the ad response as soon as the XHR request returns. This can be
   * overridden and used as a hook to perform any desired logic before passing
   * the response to the validator.
   * @param {{bytes: !ArrayBuffer, headers: !Headers}} response
   * @private
   */
  handleAdResponse_(response) {
    const unvalidatedBytes = response.bytes;
    const headers = response.headers;
    if (!unvalidatedBytes) {
      // TODO(levitzky) Add error reporting.
      this.forceCollapse_();
      return;
    }
    dev().assert(this.boundValidator_, 'Validator never bound!');
    this.unvalidatedBytes_ = unvalidatedBytes;
    this.boundValidator_(unvalidatedBytes, headers, this)
        .then(validatedBytes => this.handleValidatorResponse_(validatedBytes))
        .catch(error => this.handleValidatorError_(error));
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
   * @param {!./amp-ad-type-defs.ValidatorOutputDef} validatedResponse The utf-8 decoded ad
   *   response.
   * @private
   */
  handleValidatorResponse_(validatedResponse) {
    if (!validatedResponse.creative) {
      // TODO(levitzky) Add error reporting.
      this.forceCollapse_();
      return;
    }
    dev().assert(this.boundRenderers_[validatedResponse.result],
        'Renderer for AMP creatives never bound!');
    const rendererInput = this.getRendererInput_(validatedResponse);
    this.boundRenderers_[validatedResponse.result](rendererInput, this);
  }

  /** @override */
  isLayoutSupported(unusedLayout) {
    return true;
  }

  /** @override */
  onLayoutMeasure() {
    sendXhrRequestMock(this.getRequestUrl())
        .then(response => this.handleAdResponse_(response))
        .catch(error => this.handleAdResponseError_(error));
  }
}

// Mocks for development. These will obviously go away.
function sendXhrRequestMock(unusedAdUrl) {
  return Promise.resolve({
    bytes: utf8Encode(JSON.stringify(/** @type {!JsonObject} */ ({
      templateUrl: 'www.fake.com',
      data: {},
    }))),
    headers: () => {},
  });
}

function getAmpAdMetadataMock(creative, unusedTag, unusedType) {
  return {
    minifiedCreative: creative,
    customElementExtensions: [],
    extensions: [],
  };
}

