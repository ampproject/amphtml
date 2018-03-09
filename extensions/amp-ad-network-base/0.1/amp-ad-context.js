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

export class AmpAdContext {
  /** @param {!Window} win */
  constructor(win) {
    /**
     * The decoded arraybuffer post-validation.
     * @private {?string}
     */
    this.creative_ = null;

    /** @private {?./amp-ad-type-defs.CreativeMetaDataDef} */
    this.creativeMetadata_ = null;

    /** @private {?./amp-ad-type-defs.CrossDomainDataDef} */
    this.crossDomainData_ = null;

    /** @private {?AMP.AmpAdXOriginIframeHandler} */
    this.crossOriginIframeHandler_ = null;

    /** @private {?Promise} */
    this.frameLoadPromise_ = null;

    /** @private {?../../../src/friendly-iframe-embed.FriendlyIframeEmbed} */
    this.friendlyIframeEmbed_ = null;

    /**
     * Headers returned with XHR response.
     * @private {?../../../src/service/xhr-impl.FetchResponseHeaders}
     */
    this.headers_ = null;

    /** @private {?Element} */
    this.iframe_ = null;

    /** @private {?string} */
    this.requestUrl_ = null;

    /** @private {?./amp-ad-type-defs.LayoutInfoDef} */
    this.size_ = null;

    /** @private {?./amp-ad-type-defs.AmpTemplateCreativeDef} */
    this.templateData_ = null;

    /**
     * Raw bytes returned from XHR response.
     * @private {?ArrayBuffer}
     */
    this.unvalidatedBytes_ = null;

    /**
     * Indicates the type of renderer to use.
     * @private {?string}
     */
    this.validatorResult_ = null;

    /** @const @private {!Window} */
    this.win_ = win;
  }

  /**
   * @return {?string}
   */
  getCreative() {
    return this.creative_;
  }

  /**
   * @param {string} creative
   * @return {!AmpAdContext}
   */
  setCreative(creative) {
    this.creative_ = creative;
    return this;
  }

  /**
   * @return {?./amp-ad-type-defs.CreativeMetaDataDef}
   */
  getCreativeMetadata() {
    return this.creativeMetadata_;
  }

  /**
   * @param {!./amp-ad-type-defs.CreativeMetaDataDef} creativeMetadata
   * @return {AmpAdContext}
   */
  setCreativeMetadata(creativeMetadata) {
    this.creativeMetadata_ = creativeMetadata;
    return this;
  }

  /**
   * @return {?./amp-ad-type-defs.CrossDomainDataDef}
   */
  getCrossDomainData() {
    return this.crossDomainData_;
  }

  /**
   * @param {!./amp-ad-type-defs.CrossDomainDataDef} crossDomainData
   * @return {!AmpAdContext}
   */
  setCrossDomainData(crossDomainData) {
    this.crossDomainData_ = crossDomainData;
    return this;
  }

  /**
   * @return {?AMP.AmpAdXOriginIframeHandler}
   */
  getCrossOriginIframeHandler() {
    return this.crossOriginIframeHandler_;
  }

  /**
   * @param {!AMP.AmpAdXOriginIframeHandler} crossOriginIframeHandler
   * @return {!AmpAdContext}
   */
  setCrossOriginIframeHandler(crossOriginIframeHandler) {
    this.crossOriginIframeHandler_ = crossOriginIframeHandler;
    return this;
  }

  /**
   * @return {?Promise}
   */
  getFrameLoadPromise() {
    return this.frameLoadPromise_;
  }

  /**
   * @param {!Promise} frameLoadPromise
   * @return {!AmpAdContext}
   */
  setFrameLoadPromise(frameLoadPromise) {
    this.frameLoadPromise_ = frameLoadPromise;
    return this;
  }

  /**
   * @return {?../../../src/friendly-iframe-embed.FriendlyIframeEmbed}
   */
  getFriendlyIframeEmbed() {
    return this.friendlyIframeEmbed_;
  }

  /**
   * @param {!../../../src/friendly-iframe-embed.FriendlyIframeEmbed}
   *   fie
   * @return {!AmpAdContext}
   */
  setFriendlyIframeEmbed(fie) {
    this.friendlyIframeEmbed_ = fie;
    return this;
  }

  /**
   * @return {?../../../src/service/xhr-impl.FetchResponseHeaders}
   */
  getHeaders() {
    return this.headers_;
  }

  /**
   * @param {!../../../src/service/xhr-impl.FetchResponseHeaders} headers
   * @return {!AmpAdContext}
   */
  setHeaders(headers) {
    this.headers_ = headers;
    return this;
  }

  /**
   * @return {?Element}
   */
  getIframe() {
    return this.iframe_;
  }

  /**
   * @param {!Element} iframe
   * @return {!AmpAdContext}
   */
  setIframe(iframe) {
    this.iframe_ = iframe;
    return this;
  }

  /**
   * @return {?string}
   */
  getRequestUrl() {
    return this.requestUrl_;
  }

  /**
   * @param {string} requestUrl
   * @return {!AmpAdContext}
   */
  setRequestUrl(requestUrl) {
    this.requestUrl_ = requestUrl;
    return this;
  }

  /**
   * @return {?./amp-ad-type-defs.LayoutInfoDef}
   */
  getSize() {
    return this.size_;
  }

  /**
   * @param {!./amp-ad-type-defs.LayoutInfoDef} size
   * @return {!AmpAdContext}
   */
  setSize(size) {
    this.size_ = size;
    return this;
  }

  /**
   * @return {?./amp-ad-type-defs.AmpTemplateCreativeDef}
   */
  getTemplateData() {
    return this.templateData_;
  }

  /**
   * @param {!./amp-ad-type-defs.AmpTemplateCreativeDef} templateData
   * @return {!AmpAdContext}
   */
  setTemplateData(templateData) {
    this.templateData_ = templateData;
    return this;
  }

  /**
   * @return {?ArrayBuffer}
   */
  getUnvalidatedBytes() {
    return this.unvalidatedBytes_;
  }

  /**
   * @param {!ArrayBuffer} unvalidatedBytes
   * @return {!AmpAdContext}
   */
  setUnvalidatedBytes(unvalidatedBytes) {
    this.unvalidatedBytes_ = unvalidatedBytes;
    return this;
  }

  /**
   * @return {?string}
   */
  getValidatorResult() {
    return this.validatorResult_;
  }

  /**
   * @param {string} validatorResult
   * @return {!AmpAdContext}
   */
  setValidatorResult(validatorResult) {
    this.validatorResult_ = validatorResult;
    return this;
  }

  /** @return {!Window} */
  getWindow() {
    return this.win_;
  }
}
