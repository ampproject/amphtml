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

import {isJsonScriptTag, childElementsByTag} from '../../../src/dom';
import {isExperimentOn} from '../../../src/experiments';
import {tryParseJson} from '../../../src/json';
import {isLayoutSizeDefined} from '../../../src/layout';
import {dev, user} from '../../../src/log';
import {vsyncFor} from '../../../src/vsync';

/*
 * We are using `require()` instead of `import` here for two reasons:
 *    1- vega expects d3 to be available on window at import time but babel
 *       re-orders imports so setting window.d3 happens after loading vega.
 *    2- d3 and vega are commonJS modules and behaviour of `import *` differs
 *       between babel and closure compiler (used for dist). In the babel case
 *       one needs to do x.default but not in the closure compiler case.
 */
/* global require: false */
window.d3 = require('../../../third_party/d3/d3');
const vega = require('../../../third_party/vega/vega');

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
      this.data_ = tryParseJson(this.inlineData_, err => {
        user().assert(!err, 'data could not be ' +
            'parsed. Is it in a valid JSON format?: %s', err);
      });
    } else {
      // TODO(aghassemi): Fetch and validate the data file.
      this.data_ = {
        'url': this.src_,
      };
    }

    return Promise.resolve();
  }

  /**
   * @return {?string|undefined}
   * @private
   */
  getInlineData_() {
    const scripts = childElementsByTag(this.element, 'SCRIPT');
    if (scripts.length == 0) {
      return;
    }

    user().assert(scripts.length == 1, '%s: more than one ' +
        '<script> tags found. Only one allowed.', this.getName_());

    const child = scripts[0];
    user().assert(isJsonScriptTag(child), '%s: data should ' +
        'be put in a <script type="application/json"> tag.', this.getName_());

    return child.textContent;
  }

  /**
   * @return {!Promise}
   * @private
   */
  renderGraph_() {
    return new Promise((resolve, reject) => {
      vega.parse.spec(this.data_, (error, chart) => {
        if (error) {
          reject(error);
          return;
        }
        vsyncFor(this.win).mutate(() => {
          chart({el: this.container_}).update();
          resolve();
        });
      });
    });
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

AMP.registerElement('amp-viz-vega', AmpVizVega);
