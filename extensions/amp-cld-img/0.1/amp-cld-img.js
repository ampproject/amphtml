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

import {CSS} from '../../../build/amp-cld-img-0.1.css';
import {buildUrl, deriveObjectFit, getAsBoolean} from './utils';
import {dashToCamelCase} from '../../../src/string';
import {isLayoutSizeDefined} from '../../../src/layout';
import {tryParseJson} from '../../../src/json';
import {user, userAssert} from '../../../src/log';

const DEFAULT_CROP = 'fill';
const DEFAULT_STEP_SIZE = 100;
const DEFAULT_MAX_SIZE = 2000;

/**
 * Attributes to propagate to internal image when changed externally.
 * @type {!Array<string>}
 */
const ATTRIBUTES_TO_PROPAGATE = ['alt', 'title', 'referrerpolicy', 'aria-label',
  'aria-describedby', 'aria-labelledby'];

/**
 * Boolean attributes to merge into options object used to generate the url
 * @type {!Array<string>}
 */
const BOOLEAN_ATTRIBUTES = [
  'private-cdn',
  'secure-cdn-subdomain',
];

/**
 * Non-boolean attributes to merge into options object used to generate the url
 * @type {!Array<string>}
 */
const ATTRIBUTES_FOR_OPTIONS = [
  'step-size',
  'max-size',
  'type',
  'resource-type',
  'secure-distribution',
  'version',
  'raw-transformation',
  'cloud-name',
  'data-cloud-name',
  'cdn-subdomain',
  'cname',
  'shorten',
  'url-suffix',
  'use-root-path',
  'quality',
  'format',
  'crop',
  'gravity',
  'background',
  'effect',
  'border',
  'aspect-ratio',
  'dpr',
  'transformation-width',
  'transformation-height',
  'src',
];

export class AmpCldImg extends AMP.BaseElement {

  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {?string} */
    this.publicId_ = null;

    /** @private {?Element} */
    this.image_ = null;

    /** @private {?string} */
    this.crop_ = null;

    const cldConfigElement_ = element.ownerDocument
        .getElementById('amp-cld-config');

    /**
     * Configuration json from amp-cld-config element, if exists.
     * @private {Object}
     */
    this.config_ = cldConfigElement_ ?
      tryParseJson(cldConfigElement_.textContent, e => {
        throw user().createError('Failed to parse "amp-cld-config" JSON: ' + e);
      }) : {};

    /**  @private {Object} */
    this.options_ = {};
  }

  /** @override */
  mutatedAttributesCallback(mutations) {
    if (this.image_) {
      const attrs = ATTRIBUTES_TO_PROPAGATE.filter(
          value => mutations[value] !== undefined);
      this.propagateAttributes(
          attrs, this.image_, true);
    }
  }

  /** @override */
  buildCallback() {
    /* move all attributes into object, overriding global values if needed: */
    this.buildOptions_();

    if (!this.element.getAttribute('src')) {
      /* Assert required fields since we need to construct the url ourselves: */
      this.publicId_ = userAssert(
          this.element.getAttribute('data-public-id'),
          'The data-public-id attribute is required for <amp-cld-img> %s',
          this.element);

      userAssert(this.options_.cloudName,
          'A cloud name must be provided in global-config or element',
          this.element);
    }

    /* save the crop as it is needed later (see firstLayoutCompleted) */
    this.crop_ = this.options_['crop'];

    const image = this.element.ownerDocument.createElement('img');
    this.applyFillContent(image);
    this.propagateAttributes(ATTRIBUTES_TO_PROPAGATE, image);
    this.element.appendChild(image);
    this.image_ = image;
  }

  /** @override */
  firstLayoutCompleted() {
    if (this.crop_ && !this.element.className.includes('amp-object-fit')) {
      this.element.classList.add(deriveObjectFit(this.crop_));
    }
  }

  /** @override */
  layoutCallback() {
    /* set transformations width and height based on actual element
     dimensions: */
    this.options_['width'] = this.roundValue_(this.element.clientWidth);
    this.options_['height'] = this.roundValue_(this.element.clientHeight);

    this.updateSrc_();

    return this.loadPromise(this.image_);
  }

  /**
   * Rounds the given value up to the nearest step-size (up to max-size).
   * @param {number} value  Number of pixels to round according to step size
   * @return {number} The rounded number of pixels, up to maxSize
   * @private
   */
  roundValue_(value) {
    const stepSize = this.options_['stepSize'] || DEFAULT_STEP_SIZE;
    const maxSize = this.options_['maxSize'] || DEFAULT_MAX_SIZE;
    const rounded = (Math.floor((value - 1) / stepSize) + 1)
      * stepSize;

    return Math.min(rounded, maxSize);
  }

  /**
   * Update the src attribute of this underlying with a generated url based on
   * the configuration and transformation attributes.
   * @private
   */
  updateSrc_() {
    const src = buildUrl(this.publicId_, this.options_);
    console.log('Generated url:' + src);
    this.image_.setAttribute('src', src || '');
  }

  /**
   * merge options from attributes into options object
   * @private
   */
  buildOptions_() {
    /* get all values from config, and override them with this element's
     attributes */
    const options = this.options_ || {};
    Object.assign(options, this.config_);

    ATTRIBUTES_FOR_OPTIONS.forEach(attr => {
      const attrValue = this.element.getAttribute(attr);
      if (attrValue) {
        this.options_[dashToCamelCase(attr)] = attrValue;
      }
    });

    BOOLEAN_ATTRIBUTES.forEach(attr => {
      const attrValue = this.element.getAttribute(attr);
      if (attrValue !== undefined) {
        this.options_[dashToCamelCase(attr)] = getAsBoolean(attrValue);
      }
    });

    /* If the tag has a cloud name attribute it overrides the global config */
    this.options_.cloudName =
      this.options_.dataCloudName || this.options_.cloudName;

    /* set defaults for empty values if src not provided: */
    if (!this.options_.src) {
      this.options_.crop = this.options_.crop || DEFAULT_CROP;
      if (this.options_.dpr === 'auto') {
        // round dpr, no less than 1
        this.options_.dpr = Math.max(Math.round(window.devicePixelRatio), 1);
      }
    }
  }

  /** @override */
  isLayoutSupported(layout) {
    return isLayoutSizeDefined(layout);
  }
}

AMP.extension('amp-cld-img', '0.1', AMP => {
  AMP.registerElement('amp-cld-img', AmpCldImg, CSS);
});
