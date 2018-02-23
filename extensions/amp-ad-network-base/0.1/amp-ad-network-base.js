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
  LayoutInfoDef,
  getAmpAdMetadata, // eslint-disable-line no-unused-vars
  sendXhrRequest, // eslint-disable-line no-unused-vars
} from '../../amp-a4a/0.1/a4a-utils';
import {
  RendererDef,
  RendererInputDef,
  ValidationResult,
  ValidationResultType, // eslint-disable-line no-unused-vars
  ValidatorDef, // eslint-disable-line no-unused-vars
} from '../../amp-a4a/0.1/a4a-render';
import {dev} from '../../../src/log';
import {utf8Decode, utf8Encode} from '../../../src/utils/bytes';

const TAG = 'amp-ad-network-base';

export class AmpAdNetworkBase extends AMP.BaseElement {

  constructor(element) {
    super(element);

    /** @private {Object<ValidationResultType, !RendererDef>} */
    this.boundRenderers_ = {};

    /** @private {?ValidatorDef} */
    this.boundValidator_ = null;

    /** @private {?string} */
    this.adUrl_ = null;

    /** @private {?string} */
    this.expandedAdUrl_ = null;

    /** @private {?ArrayBuffer} */
    this.unvalidatedBytes_ = null;

    /** @private {!LayoutInfoDef} */
    this.initialSize_ = {
      // TODO(levitzky) handle non-numeric values.
      width: this.element.getAttribute('width'),
      height: this.element.getAttribute('height'),
    };
  }

  /**
   * @param {string} adUrl
   * @protected
   */
  bindAdRequestUrl(adUrl) {
    if (this.adUrl_) {
      dev().warn(TAG, `Ad Request URL already bound: '${this.adUrl_}'`);
    }
    this.adUrl_ = adUrl;
  }

  /**
   * @param {ValidationResultType} resultType
   * @param {!RendererDef} renderer
   * @protected
   */
  bindRenderer(resultType, renderer) {
    if (this.boundRenderers_[resultType]) {
      dev().warn(TAG, `Rendering mode already bound for type '${resultType}'`);
    }
    this.boundRenderers_[resultType] = renderer;
  }

  /**
   * @param {!ValidatorDef} validator
   * @protected
   */
  bindValidator(validator) {
    if (this.boundValidator_) {
      dev().warn(TAG, 'Validator already bound.');
    }
    this.boundValidator_ = validator;
  }

  /**
   * Collapses slot by setting its size to 0x0.
   */
  forceCollapse() {
    super.attemptChangeSize(0, 0);
  }

  /**
   * @return {string} The finalized ad request URL.
   * @private
   */
  getExpandedUrl_() {
    dev().assert(this.adUrl_, 'Ad Request URL never registered!');
    // TODO add expansion logic
    this.expandedAdUrl_ = /** @type {string} */ (this.adUrl_);
    return this.expandedAdUrl_;
  }

  /**
   * @param {string} creative
   * @return {!RendererInputDef}
   */
  getRenderingDataInput_(creative) {
    return /** @type {!RendererInputDef} */ ({
      creativeMetadata: getAmpAdMetadataMock(creative, TAG, ''),
      // TODO(levitzky) This may change based on the ad response.
      size: this.initialSize_,
      adUrl: this.expandedAdUrl_ ? this.expandedAdUrl_ : this.adUrl_,
    });
  }

  /**
   * Processes the ad response as soon as the XHR request returns. This can be
   * overridden and used as a hook to perform any desired logic before passing
   * the response to the validator.
   * @param {{bytes: !ArrayBuffer, headers: !Headers}} response
   * @protected
   */
  handleAdResponse(response) {
    const unvalidatedBytes = response.bytes;
    const headers = response.headers;
    dev().assert(this.boundValidator_, 'Validator never bound!');
    this.unvalidatedBytes_ = unvalidatedBytes;
    this.boundValidator_(unvalidatedBytes, headers, this)
        .then(validatedBytes =>
          this.handleValidationResponse(validatedBytes));
  }

  handleAdResponseError(error) {
    // TODO(levitzky) add actual error processing logic.
    dev().warn(TAG, error);
  }

  /**
   * Processes validation response and delegates further action to appropriate
   * renderer.
   * @param {?string} validatedResponse The utf-8 decoded ad response.
   */
  handleValidationResponse(validatedResponse) {
    if (validatedResponse) {
      dev().assert(this.boundRenderers_[ValidationResult.AMP],
          'Renderer for AMP creatives never bound!');
      this.boundRenderers_[ValidationResult.AMP](
          this.getRenderingDataInput_(validatedResponse));
    } else if (this.unvalidatedBytes_) {
      dev().assert(this.boundRenderers_[ValidationResult.NON_AMP],
          'Renderer for non-AMP creatives never bound!');
      this.boundRenderers_[ValidationResult.NON_AMP](
          this.getRenderingDataInput_(utf8Decode(this.unvalidatedBytes_)));
    }
  }

  /** @override */
  isLayoutSupported(unusedLayout) {
    return true;
  }

  /** @override */
  onLayoutMeasure() {
    sendXhrRequestMock(this.getExpandedUrl_())
        .then(response => this.handleAdResponse(response))
        .catch(error => this.handleAdResponseError(error));
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

AMP.extension(TAG, '0.1', AMP => {
  AMP.registerElement(TAG, AmpAdNetworkBase);
});
