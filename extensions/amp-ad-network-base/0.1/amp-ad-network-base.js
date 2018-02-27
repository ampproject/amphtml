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

import {AmpAdUIHandler} from '../../amp-ad/0.1/amp-ad-ui'; // eslint-disable-line no-unused-vars
import {
  LayoutInfoDef,
  getAmpAdMetadata,
  sendXhrRequest,
} from '../../amp-a4a/0.1/a4a-utils';
import {
  RendererDef,
  RendererInputDef,
  ValidatorDef, // eslint-disable-line no-unused-vars
  ValidatorOutputDef,
  ValidatorResultType, // eslint-disable-line no-unused-vars
} from '../../amp-a4a/0.1/a4a-render';
import {dev} from '../../../src/log';
import {utf8Encode} from '../../../src/utils/bytes';

const TAG = 'amp-ad-network-base';

export class AmpAdNetworkBase extends AMP.BaseElement {

  constructor(element) {
    super(element);

    /** @private {Object<ValidatorResultType, !RendererDef>} */
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
      width: element.getAttribute('width'),
      height: element.getAttribute('height'),
    };

    /** @private {string} @const */
    this.networkType_ = element.getAttribute('type') || 'anon';

    /**
     * @private {number} unique ID of the currently executing promise to allow
     * for cancellation.
     */
    this.freshnessId_ = 0;

    /** @private {function():boolean} a function that will return true if the
     * freshness id changes due to unlayout. Initialized to always return
     * false, and has an actual value set in onLayoutMeasure.
     */
    this.isStale_ = () => false;

    /** {?AMP.AmpAdUIHandler} */
    this.uiHandler = null;
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
   * @param {ValidatorResultType} resultType
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
   * Called at various lifecycle stages. Can be overwitten by implementing
   * networks to handle lifecycle event.
   */
  emitLifecycleEvent() {}

  /**
   * Collapses slot by setting its size to 0x0.
   */
  forceCollapse() {
    dev().assert(this.uiHandler);
    this.uiHandler.applyNoContentUI();
    super.attemptChangeSize(0, 0);
  }

  /**
   * Returns context data necessary to render creative in cross-domain
   * NameFrame.
   * @return {!JsonObject}
   */
  getCrossDomainContextData() {
    return /** @type {!JsonObject} */ ({});
  }

  /**
   * Returns sentinel value necessary for interframe communicaiton.
   * @return {?string}
   */
  getCrossDomainSentinel() {
    return null;
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
   * @return {function():boolean} function that when called will verify if
   *    current ad retrieval is current (meaning unlayoutCallback was not
   *    executed). If not, will return false.
   * @throws {Error}
   */
  getFreshnessVerifier() {
    const id = this.freshnessId_;
    return () => {
      if (id != this.freshnessId_) {
        this.handleStaleExecution();
        return true;
      }
      return false;
    };
  }

  /**
   * @param {!ValidatorOutputDef} validatorOutput
   * @return {!RendererInputDef}
   */
  getRenderingDataInput_(validatorOutput) {
    const creative = validatorOutput.creative;
    return /** @type {!RendererInputDef} */ ({
      creativeMetadata: getAmpAdMetadata(creative, TAG, this.networkType_),
      templateData: null,
      crossDomainData: {
        rawCreativeBytes: this.unvalidatedBytes_,
        additionalContextMetadata: this.getCrossDomainContextData(),
        sentinel: this.getCrossDomainSentinel(),
      },
      unvalidatedBytes: this.unvalidatedBytes_,
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
    if (this.isStale_()) {
      return;
    }
    const unvalidatedBytes = response.bytes;
    const headers = response.headers;
    if (!unvalidatedBytes) {
      // TODO(levitzky) Add error reporting.
      this.forceCollapse();
      return;
    }
    dev().assert(this.boundValidator_, 'Validator never bound!');
    this.unvalidatedBytes_ = unvalidatedBytes;
    this.boundValidator_(unvalidatedBytes, headers, this)
        .then(validatedBytes =>
          this.handleValidatorResponse(validatedBytes));
  }

  handleAdResponseError(error) {
    // TODO(levitzky) add actual error processing logic.
    dev().warn(TAG, error);
  }

  /**
   * Handler invoked when the current freshness id has expired.
   */
  handleStaleExecution() {}

  /**
   * Processes validator response and delegates further action to appropriate
   *   renderer.
   * @param {!ValidatorOutputDef} validatedResponse The utf-8 decoded ad
   *   response.
   */
  handleValidatorResponse(validatedResponse) {
    if (this.isStale_()) {
      return;
    }
    if (!validatedResponse.creative) {
      // TODO(levitzky) Add error reporting.
      this.forceCollapse();
      return;
    }
    dev().assert(this.boundRenderers_[validatedResponse.result],
        'Renderer for AMP creatives never bound!');
    this.boundRenderers_[validatedResponse.result](
        this.getRenderingDataInput_(validatedResponse), this);
  }


  resetInstance() {
    this.freshnessId_++;
    this.uiHandler.applyUnlayoutUI();
  }

  /** @override */
  buildCallback() {
    this.uiHandler = new AMP.AmpAdUIHandler(this);
  }

  /** @override */
  isLayoutSupported(unusedLayout) {
    return true;
  }

  /** @override */
  onLayoutMeasure() {
    ++this.freshnessId_;
    this.isStale_ = this.getFreshnessVerifier();
    sendXhrRequest(this.getExpandedUrl_())
        .then(response => this.handleAdResponse(response))
        .catch(error => this.handleAdResponseError(error));
  }

  /** @override */
  unlayoutCallback() {
    this.freshnessId_++;
    return true;
  }
}

AMP.extension(TAG, '0.1', AMP => {
  AMP.registerElement(TAG, AmpAdNetworkBase);
});

