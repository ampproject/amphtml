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

    /** @private {?function()} */
    this.adResponsePromiseResolver_ = null;

    /**
     * @const {!Promise<?Promise<?{bytes: !ArrayBuffer, headers: !Headers}>>}
     * @private
     */
    this.adResponsePromise_ = new Promise((resolve, unused) => {
      this.adResponsePromiseResolver_ = resolve;
    });

    /** @private {?function()} */
    this.validatedResponsePromiseResolver_ = null;

    /**
     * @const {!Promise<string>}
     * @private
     */
    this.validatedResponsePromise_ = new Promise((resolve, unused) => {
      this.validatedResponsePromiseResolver_ = resolve;
    });

    /** @private {?ArrayBuffer} */
    this.unvalidatedBytes_ = null;

    /** @private {!SizeInfoDef} */
    this.initialSize_ = {
      width: this.element.getAttribute('width'),
      height: this.element.getAttribute('height'),
    };

    this.init_();

    // TODO Remove
    // For test purposes only
    this.bindAdRequestUrl('foo');
    this.bindValidator((bytes, header, impl) => Promise.resolve(bytes));
    this.bindRenderer(ValidationResult.AMP, creative => dev().info(TAG, creative));
  }

  /////////////////////////////////////////////////////////////////////////////
  //          Public methods: Please keep in alphabetic order                //
  /////////////////////////////////////////////////////////////////////////////

  /**
   * @param {string} adUrl
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
   */
  bindRenderer(resultType, renderer) {
    if (this.boundRenderers_[resultType]) {
      dev().warn(TAG, `Rendering mode already bound for type '${resultType}'`);
    }
    this.boundRenderers_[resultType] = renderer;
  }

  /**
   * @param {function()} validator
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

  /////////////////////////////////////////////////////////////////////////////
  //         Private methods: Please keep in alphabetic order                //
  /////////////////////////////////////////////////////////////////////////////


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
   * Defines sequence of events to follow:
   * - ad response receipt
   * - validation
   */
  init_() {
    this.initAdResponseHandling_();
    this.initValidationResponseHandling_();
  }

  /**
   * Defines sequence of events to follow upon resolution of
   * adResponsePromise_. The promise will resolve once a response is received
   * following the XhrRequest.
   *
   * After resolution, the validator will be invoked, and unvalidatedBytes will
   * be set.
   */
  initAdResponseHandling_() {
    this.adResponsePromise_.then(response => {
      const unvalidatedBytes = response.bytes;
      const headers = response.headers;
      dev().assert(this.boundValidator_, 'Validator never bound!');
      this.unvalidatedBytes_ = unvalidatedBytes;
      this.boundValidator_(unvalidatedBytes, headers, this)
          .then(validatedBytes => {
            this.validatedResponsePromiseResolver_(utf8Decode(validatedBytes));
          });
    });
  }

  /**
   * Defines sequence of events to follow upon resolution of
   * validatedResponsePromise_. The promise will resolve after the validator is
   * finished.
   *
   * After resolution, the renderer will be invoked.
   */
  initValidationResponseHandling_() {
    this.validatedResponsePromise_.then(validatedResponse => {
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
    });
  }

  /////////////////////////////////////////////////////////////////////////////
  //    AMP element lifecycle methods: Please keep in alphabetic order.      //
  /////////////////////////////////////////////////////////////////////////////

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
    sendXhrRequestMock(this.getExpandedUrl_()).then(responseParts => {
      this.adResponsePromiseResolver_(responseParts);
    });
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
