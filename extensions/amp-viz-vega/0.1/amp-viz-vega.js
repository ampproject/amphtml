/**
 * Copyright 2016 The AMP HTML Authors. All Rights Reserved.
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

import * as dom from '../../../src/dom';
import {CSS} from '../../../build/amp-viz-vega-0.1.css';
import {Services} from '../../../src/services';
import {assertHttpsUrl} from '../../../src/url';
import {dev, devAssert, userAssert} from '../../../src/log';
import {dict} from '../../../src/utils/object';
import {isExperimentOn} from '../../../src/experiments';
import {isFiniteNumber, isObject} from '../../../src/types';
import {isLayoutSizeDefined} from '../../../src/layout';
import {tryParseJson} from '../../../src/json';

export class AmpVizVega extends AMP.BaseElement {
  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {?JsonObject} */
    this.data_ = null;

    /** @private {?string} */
    this.inlineData_ = null;

    /** @private {?string} */
    this.src_ = null;

    /** @private {boolean} */
    this.useDataWidth_ = false;

    /** @private {boolean} */
    this.useDataHeight_ = false;

    /** @private {number} */
    this.measuredWidth_ = 0;

    /** @private {number} */
    this.measuredHeight_ = 0;

    /** @private {?VegaObject} */
    this.vega_ = null;

    /** @private {?Element} */
    this.container_ = null;

    /**
     * @private {Object}
     * Instance of Vega chart object. https://goo.gl/laszHL
     */
    this.chart_ = null;
  }

  /** @override */
  isLayoutSupported(layout) {
    return isLayoutSizeDefined(layout);
  }

  /** @override */
  buildCallback() {
    userAssert(
      isExperimentOn(this.win, 'amp-viz-vega'),
      'Experiment amp-viz-vega disabled'
    );

    /**
     * Global vg (and implicitly d3) are required and they are created by
     * appending vega and d3 minified files during the build process.
     */
    this.vega_ = /** @type {!VegaObject} */ (this.win.vg);
    this.inlineData_ = /** @type {string} */ (this.getInlineData_());
    this.src_ = this.element.getAttribute('src');
    this.useDataWidth_ = this.element.hasAttribute('use-data-width');
    this.useDataHeight_ = this.element.hasAttribute('use-data-height');

    userAssert(
      this.inlineData_ || this.src_,
      '%s: neither `src` attribute nor a ' +
        'valid <script type="application/json"> child was found for Vega data.',
      this.getName_()
    );

    userAssert(
      !(this.inlineData_ && this.src_),
      '%s: both `src` attribute and a valid ' +
        '<script type="application/json"> child were found for Vega data. ' +
        'Only one way of specifying the data is allowed.',
      this.getName_()
    );

    if (this.src_) {
      assertHttpsUrl(this.src_, this.element, this.getName_());
    }
  }

  /** @override */
  layoutCallback() {
    this.initialize_();
    return this.loadData_().then(() => this.renderGraph_());
  }

  /** @override */
  onLayoutMeasure() {
    const box = this.getLayoutBox();
    if (
      this.measuredWidth_ == box.width &&
      this.measuredHeight_ == box.height
    ) {
      return;
    }
    this.measuredWidth_ = box.width;
    this.measuredHeight_ = box.height;
    if (this.chart_) {
      this.renderGraph_();
    }
  }

  /**
   * Create the vega container.
   * Called lazily in the first `#layoutCallback`.
   */
  initialize_() {
    this.container_ = this.element.ownerDocument.createElement('div');

    this.applyFillContent(this.container_, true);
    this.element.appendChild(this.container_);
  }

  /**
   * @return {!Promise}
   * @private
   */
  loadData_() {
    // Validation in buildCallback should ensure one and only one of
    // src_/inlineData_ is ever set.
    devAssert(!this.src_ != !this.inlineData_);

    if (this.inlineData_) {
      this.data_ = /** @type {JsonObject} */ (tryParseJson(
        this.inlineData_,
        err => {
          userAssert(
            !err,
            'data could not be ' + 'parsed. Is it in a valid JSON format?: %s',
            err
          );
        }
      ));
      return Promise.resolve();
    } else {
      // TODO(aghassemi): We may need to expose credentials and set
      // requireAmpResponseSourceOrigin to true as well. But for now Vega
      // runtime also does XHR to load subresources (e.g. Vega spec can
      // point to other Vega specs) an they don't include credentials on those
      // calls. We may want to intercept all "urls" in spec and do the loading
      // and parsing ourselves.

      return Services.xhrFor(this.win)
        .fetchJson(dev().assertString(this.src_), {
          requireAmpResponseSourceOrigin: false,
        })
        .then(res => res.json())
        .then(data => {
          this.data_ = data;
        });
    }
  }

  /**
   * @return {?string|undefined}
   * @private
   */
  getInlineData_() {
    const scripts = dom.childElementsByTag(this.element, 'SCRIPT');
    if (scripts.length == 0) {
      return;
    }

    userAssert(
      scripts.length == 1,
      '%s: more than one ' + '<script> tags found. Only one allowed.',
      this.getName_()
    );

    const child = scripts[0];
    userAssert(
      dom.isJsonScriptTag(child),
      '%s: data should ' + 'be put in a <script type="application/json"> tag.',
      this.getName_()
    );

    return child.textContent;
  }

  /**
   * @return {!Promise}
   * @private
   */
  renderGraph_() {
    const parsePromise = new Promise((resolve, reject) => {
      this.vega_.parse.spec(
        /** @type {!JsonObject} */ (this.data_),
        (error, chartFactory) => {
          if (error) {
            reject(error);
          }
          resolve(/** @type {!VegaChartFactory} */ (chartFactory));
        }
      );
    });

    return parsePromise.then(
      /** @param {!VegaChartFactory} chartFactory */
      chartFactory => {
        return Services.vsyncFor(this.win).mutatePromise(() => {
          dom.removeChildren(dev().assertElement(this.container_));
          this.chart_ = chartFactory(dict({'el': this.container_}));
          if (!this.useDataWidth_) {
            const w = this.measuredWidth_ - this.getDataPadding_('width');
            this.chart_.width(w);
          }
          if (!this.useDataHeight_) {
            const h = this.measuredHeight_ - this.getDataPadding_('height');
            this.chart_.height(h);
          }

          this.chart_.viewport([this.measuredWidth_, this.measuredHeight_]);
          this.chart_.update();
        });
      }
    );
  }

  /**
   * Gets the padding defined in the Vega data for either width or height.
   * @param {string} widthOrHeight One of 'width' or 'height' string values.
   * @return {number}
   * @private
   */
  getDataPadding_(widthOrHeight) {
    const p = this.data_['padding'];
    if (!p) {
      return 0;
    }
    if (isFiniteNumber(p)) {
      return p;
    }
    if (isObject(p)) {
      if (widthOrHeight == 'width') {
        return (p.left || 0) + (p.right || 0);
      } else if (widthOrHeight == 'height') {
        return (p.top || 0) + (p.bottom || 0);
      }
    }
    return 0;
  }

  /**
   * @return {string} Returns a string to identify this tag. May not be unique
   * if the element id is not unique.
   * @private
   */
  getName_() {
    return (
      'amp-viz-vega ' + (this.element.getAttribute('id') || '<unknown id>')
    );
  }
}

AMP.extension('amp-viz-vega', '0.1', AMP => {
  AMP.registerElement('amp-viz-vega', AmpVizVega, CSS);
});
