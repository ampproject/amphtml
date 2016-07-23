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
import {toggle} from '../../../src/style';

/** @const */
const EXPERIMENT = 'amp-viz-vega';

export class AmpVizVega extends AMP.BaseElement {

  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {?Element} */
    this.container_ = null;

    /** @private {?JSONType} */
    this._spec = null;

    /** @private {?string} */
    this._specUrl = null;

  }

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

    this.container_ = this.element.ownerDocument.createElement('div');
    this._specUrl = this.element.getAttribute('spec-url');

    this.applyFillContent(this.container_, true);
    this.element.appendChild(this.container_);
  }

  /** @override */
  buildCallback() {
    if (!isExperimentOn(this.win, EXPERIMENT)) {
      dev.warn(EXPERIMENT, `Experiment ${EXPERIMENT} disabled`);
      toggle(this.element, false);
      return;
    }
  }

  /** @override */
  layoutCallback() {
    this.initialize_();
    return this.loadSpec_().then(() => this.renderGraph_());
  }

  /**
   * @return {!Promise}
   * @private
   */
  loadSpec_() {
    if (this._spec) {
      return Promise.resolve();
    }
    const inlineSpec = this.getInlineSpec();
    if (!inlineSpec && !this._specUrl) {
      const err = this.getName_() + ' neither the spec-url attribute nor a' +
        'valid <script type="application/json"> child was found for Vega spec';
      return Promise.reject(new Error(err));
    }

    if (inlineSpec && this._specUrl) {
      const err = this.getName_() + ' both the spec-url attribute and a valid' +
        '<script type="application/json"> child were found for Vega spec.' +
        'Only one way of specifying the spec is allowed.';
      return Promise.reject(new Error(err));
    }

    if (this._specUrl) {
      // TODO(aghassemi): Fetch and validate the spec file.
      this._spec = {
        'url': this._specUrl,
      };
      return Promise.resolve();
    }

    if (inlineSpec) {
      this._spec = inlineSpec;
      return Promise.resolve();
    }
  }

  /**
   * @return {?string}
   * @private
   */
  getInlineSpec() {
    let inlineConfig;

    const scripts = childElementsByTag(this.element, 'SCRIPT');
    if (scripts.length == 1) {
      const child = scripts[0];
      if (isJsonScriptTag(child)) {
        inlineConfig = tryParseJson(scripts[0].textContent, err => {
          user.error(this.getName_(), 'spec could not be ' +
            'parsed. Is it in a valid JSON format?', err);
        });
      } else {
        user.error(this.getName_(), 'spec should ' +
          'be put in a <script type="application/json" tag.');
      }
    }
    return inlineConfig;
  }

  /**
   * @return {!Promise}
   * @private
   */
  renderGraph_() {
    //TODO(aghassemi): Replace with actual rendering implementation.
    return new Promise((resolve, unused) => {
      setTimeout(() => {
        const text = 'To be replaced with Vega graph with spec: ' +
          JSON.stringify(this._spec);
        const textNode = this.element.ownerDocument.createTextNode(text);
        this.container_.appendChild(textNode);
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
