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
  RenderingDataInputDef,
  ValidationResult,
  ValidationResultType, // eslint-disable-line no-unused-vars
} from '../../amp-a4a/0.1/a4a-render';
import {
  SizeInfoDef,
  getAmpAdMetadata,
  sendXhrRequest,
} from '../../amp-a4a/0.1/a4a-utils';
import {dev} from '../../../src/log';

// Only need this for development phase
import {utf8Decode, utf8Encode} from '../../../src/utils/bytes';

const TAG = 'amp-ad-network-base';

export class AmpAdNetworkBase extends AMP.BaseElement {

  constructor(element) {
    super(element);

    /**
     * @const {{ValidationResultType: function()}}
     * @private
     */
    this.boundRenderers_ = {};

    /** @private {?function()} */
    this.boundValidator_ = null;

    /** @private {?string} */
    this.adUrl_ = null;

    /** @private {?string} */
    this.expandedAdUrl_ = null;

    /** @private {?ArrayBuffer} */
    this.unvalidatedBytes_ = null;

    /** @private {!SizeInfoDef} */
    this.initialSize_ = {
      width: this.element.getAttribute('width'),
      height: this.element.getAttribute('height'),
    };

    // TODO Remove
    // For test purposes only
    this.bindAdRequestUrl('foo');
    this.bindValidator((bytes, header, impl) => Promise.resolve(bytes));
    this.bindRenderer(ValidationResult.AMP, creative => dev().info(TAG, creative));
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
   * @param {function()} renderer
   * @protected
   */
  bindRenderer(resultType, renderer) {
    if (this.boundRenderers_[resultType]) {
      dev().warn(TAG, `Rendering mode already bound for type '${resultType}'`);
    }
    this.boundRenderers_[resultType] = renderer;
  }

  /**
   * @param {function()} validator
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
    this.expandedAdUrl_ = this.adUrl_;
    return this.expandedAdUrl_;
  }

  /**
   * @param {string} creative
   * @return {!RenderingDataInputDef}
   */
  getRenderingDataInput_(creative) {
    return /** @type {!RenderingDataInputDef} */ ({
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
   * @param {?Promise<?{bytes: !ArrayBuffer, headers: !Headers}>} response
   * @protected
   */
  handleAdResponse(response) {
    const unvalidatedBytes = response.bytes;
    const headers = response.headers;
    dev().assert(this.boundValidator_, 'Validator never bound!');
    this.unvalidatedBytes_ = unvalidatedBytes;
    this.boundValidator_(unvalidatedBytes, headers, this)
        .then(validatedBytes =>
            this.handleValidationResponse(utf8Decode(validatedBytes)));
  }

  /**
   * @param {string} validatedResponse The utf-8 decoded ad response.
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
  layoutCallback() {
    return Promise.resolve();
  }

  /** @override */
  onLayoutMeasure() {
    sendXhrRequestMock(this.getExpandedUrl_())
        .then(response => this.handleAdResponse(response));
  }
}

// Mocks for development. These will obviously go away.
function sendXhrRequestMock(unusedAdUrl) {
  return Promise.resolve({
    bytes: /** @type {!ArrayBuffer} */ (utf8Encode(JSON.stringify({
      templateUrl: 'www.fake.com',
      data: {},
    }))),
    headers: /** @type {!Headers} */ (() => {}),
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
