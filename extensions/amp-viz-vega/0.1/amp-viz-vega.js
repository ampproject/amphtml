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

/** @const */
const EXPERIMENT = 'amp-viz-vega';

export class AmpVizVega extends AMP.BaseElement {

  /** @override */
  isLayoutSupported(layout) {
    return isLayoutSizeDefined(layout);
  }

  /**
   * Create the vega container.
   * Called lazily in the first `#layoutCallback`.
   */
  initialize_() {
    if (this.container_) {
      return;
    }

    /** @private {?JSONType} */
    this.data_ = null;

    /** @private {?Element} */
    this.container_ = this.element.ownerDocument.createElement('div');

    /** @private {?string} */
    this.dataUrl_ = this.element.getAttribute('data-url');

    this.applyFillContent(this.container_, true);
    this.element.appendChild(this.container_);
  }

  /** @override */
  buildCallback() {
    user.assert(isExperimentOn(this.win, EXPERIMENT),
      `Experiment ${EXPERIMENT} disabled`);
  }

  /** @override */
  layoutCallback() {
    this.initialize_();
    return this.loadData_().then(() => this.renderGraph_());
  }

  /**
   * @return {!Promise}
   * @private
   */
  loadData_() {
    if (this.data_) {
      return Promise.resolve();
    }
    const inlineData = this.getInlineData_();
    if (!inlineData && !this.dataUrl_) {
      const err = this.getName_() + ' neither `data-url` attribute nor a ' +
        'valid <script type="application/json"> child was found for Vega data';
      return Promise.reject(user.createError(err));
    }

    if (inlineData && this.dataUrl_) {
      const err = this.getName_() + ' both `data-url` attribute and a valid ' +
        '<script type="application/json"> child were found for Vega data. ' +
        'Only one way of specifying the data is allowed.';
      return Promise.reject(user.createError(err));
    }

    if (this.dataUrl_) {
      // TODO(aghassemi): Fetch and validate the data file.
      this.data_ = {
        'url': this.dataUrl_,
      };
      return Promise.resolve();
    }

    this.data_ = dev.assert(inlineData);
    return Promise.resolve();
  }

  /**
   * @return {?JSONObject|undefined}
   * @private
   */
  getInlineData_() {
    let inlineConfig;

    const scripts = childElementsByTag(this.element, 'SCRIPT');
    if (scripts.length == 1) {
      const child = scripts[0];
      if (isJsonScriptTag(child)) {
        inlineConfig = tryParseJson(scripts[0].textContent, err => {
          user.error(this.getName_(), 'data could not be ' +
            'parsed. Is it in a valid JSON format?', err);
        });
      } else {
        user.error(this.getName_(), 'data should ' +
          'be put in a <script type="application/json"> tag.');
      }
    } else if (scripts.length > 1) {
      user.error(this.getName_(), 'more than one' +
        '<script type="application/json"> tags found. Only one allowed.');
    }
    return inlineConfig;
  }

  /**
   * @return {!Promise}
   * @private
   */
  renderGraph_() {
    // TODO(aghassemi): Replace with actual rendering implementation.
    return new Promise((resolve, unused) => {
      setTimeout(() => {
        const text = 'To be replaced with Vega graph with data: ' +
          JSON.stringify(this.data_);
        vsyncFor(this.win).mutate(() => {
          const textNode = this.element.ownerDocument.createTextNode(text);
          this.container_.appendChild(textNode);
        });
        resolve();
      }, 1000);
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
