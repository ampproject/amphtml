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

import {childElementByTag} from '../../../src/dom';
import {isExperimentOn} from '../../../src/experiments';
import {log} from '../../../src/log';
import {parse as mustacheParse, render as mustacheRender,
    setUnescapedSanitizier} from '../../../third_party/mustache/mustache';
import {sanitizeHtml, sanitizeFormattingHtml} from '../../../src/sanitizer';

/** @const */
const assert = AMP.assert;

/** @const */
const EXPERIMENT = 'mustache';

/** @const */
const TAG = 'AmpMustache';


// Configure inline sanitizer for unescaped values.
setUnescapedSanitizier(sanitizeFormattingHtml);


/**
 * Implements an AMP template for Mustache.js.
 * See {@link https://github.com/janl/mustache.js/}.
 *
 * @private Visible for testing.
 */
export class AmpMustache extends AMP.BaseTemplate {

  /**
   * @return {boolean}
   * @private
   */
  isExperimentOn_() {
    return isExperimentOn(this.getWin(), EXPERIMENT);
  }

  /** @override */
  compileCallback() {
    if (!this.isExperimentOn_()) {
      return;
    }
    /** @private @const {string} */
    this.template_ = this.element./*OK*/innerHTML;
    mustacheParse(this.template_);
  }

  /** @override */
  render(data) {
    if (!this.isExperimentOn_()) {
      const m = `Experiment "${EXPERIMENT}" disabled`;
      log.warn(TAG, m, this.element);
      const fallback = document.createElement('div');
      fallback.textContent = m;
      return fallback;
    }

    const html = mustacheRender(this.template_, data);
    const sanitized = sanitizeHtml(html);
    const root = this.getWin().document.createElement('div');
    root./*OK*/innerHTML = sanitized;
    return this.unwrap(root);
  }
}


AMP.registerTemplate('amp-mustache', AmpMustache);
