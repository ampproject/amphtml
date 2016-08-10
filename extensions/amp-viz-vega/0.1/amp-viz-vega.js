/**
 * Copyright 2015 The AMP HTML Authors. All Rights Reserved.
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

import {CSS} from '../../../build/amp-viz-vega-0.1.css';
import * as dom from '../../../src/dom';
import {isExperimentOn} from '../../../src/experiments';
import {tryParseJson} from '../../../src/json';
import {isLayoutSizeDefined} from '../../../src/layout';
import {dev, user} from '../../../src/log';
import {vsyncFor} from '../../../src/vsync';
import {xhrFor} from '../../../src/xhr';

/** @const */
const EXPERIMENT = 'amp-viz-vega';

export class AmpVizVega extends AMP.BaseElement {

  /** @override */
  isLayoutSupported(layout) {
    return isLayoutSizeDefined(layout);
  }

  /** @override */
  buildCallback() {
    user().assert(isExperimentOn(this.win, EXPERIMENT),
        `Experiment ${EXPERIMENT} disabled`);

    /** @private {?JSONType} */
    this.data_ = null;

    /** @private {?string} */
    this.inlineData_ = this.getInlineData_();

    /** @private {?string} */
    this.src_ = this.element.getAttribute('src');

    /**
     * @private
     * Global vg (and implicitly d3) are required and they are created by
     * appending vega and d3 minified files during build process.
     */
    this.vega_ = window.vg;

    /**
     * @private
     * Instance of Vega chart object. https://goo.gl/laszHL
     */
    this.chart_ = null;

    user().assert(this.inlineData_ || this.src_,
        '%s: neither `src` attribute nor a ' +
        'valid <script type="application/json"> child was found for Vega data.',
        this.getName_());

    user().assert(!(this.inlineData_ && this.src_),
        '%s: both `src` attribute and a valid ' +
        '<script type="application/json"> child were found for Vega data. ' +
        'Only one way of specifying the data is allowed.',
        this.getName_());
  }

  /** @override */
  layoutCallback() {
    this.initialize_();
    return this.loadData_().then(() => this.renderGraph_());
  }

  /** @override */
  onLayoutMeasure() {
    const box = this.element.getLayoutBox();
    this.measuredWidth_ = box.width;
    this.measuredHeight_ = box.height;
    if (this.chart_) {
      vsyncFor(this.win).mutate(() => {
        this.updateGraph_();
      });
    }
  }

  /**
   * Create the vega container.
   * Called lazily in the first `#layoutCallback`.
   */
  initialize_() {
    /** @private {?Element} */
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
    dev().assert(!this.src_ != !this.inlineData_);

    if (this.inlineData_) {
      let err;
      this.data_ = tryParseJson(this.inlineData_, err => {
        err = err;
      });
      if (err) {
        user().assert(!err, 'data could not be ' +
            'parsed. Is it in a valid JSON format?: %s', err);
        return Promise.reject();
      }
      return Promise.resolve();
    } else {
      // TODO(aghassemi): We may need to expose credentials and set
      // requireAmpResponseSourceOrigin to true as well. But for now Vega
      // runtime also does XHR to load subresources (e.g. Vega spec can
      // point to other Vega specs) an they don't include credentials on those
      // calls. We may want to intercept all "urls" in spec and do the loading
      // and parsing ourselves.
      return xhrFor(this.win).fetchJson(this.src_).then(data => {
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

    user().assert(scripts.length == 1, '%s: more than one ' +
        '<script> tags found. Only one allowed.', this.getName_());

    const child = scripts[0];
    user().assert(dom.isJsonScriptTag(child), '%s: data should ' +
        'be put in a <script type="application/json"> tag.', this.getName_());

    return child.textContent;
  }

  /**
   * @return {!Promise}
   * @private
   */
  renderGraph_() {
    return new Promise((resolve, reject) => {
      this.vega_.parse.spec(this.data_, (error, chart) => {
        if (error) {
          reject(error);
          return;
        }
        vsyncFor(this.win).mutate(() => {
          dom.removeChildren(this.container_);
          this.chart_ = chart({el: this.container_});
          this.updateGraph_();
          resolve();
        });
      });
    });
  }

  /**
   * @private
   */
  updateGraph_() {
    if (!this.chart_) {
      return;
    }
    const measuredViewport = [this.measuredWidth_, this.measuredHeight_];
    this.chart_.viewport(measuredViewport);
    this.chart_.update();
  }

  /**
   * @return {string} Returns a string to identify this tag. May not be unique
   * if the element id is not unique.
   * @private
   */
  getName_() {
    return 'amp-viz-vega ' +
      (this.element.getAttribute('id') || '<unknown id>');
  }
}

AMP.registerElement('amp-viz-vega', AmpVizVega, CSS);
