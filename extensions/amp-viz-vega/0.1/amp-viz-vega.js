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

import {isExperimentOn} from '../../../src/experiments';
import {isLayoutSizeDefined} from '../../../src/layout';
import {dev, user} from '../../../src/log';
import {toggle} from '../../../src/style';

/** @const */
const EXPERIMENT = 'amp-viz-vega';

export class AmpVizVega extends AMP.BaseElement {

  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @priasdvate {?Element} */
    this.container_ = null;
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

    /** @private @const {!HTMLDivElement} */
    this.container_ = this.element.ownerDocument.createElement('div');
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

    return new Promise((resolve, reject) => {
      setTimeout(() => {
        let textNode = this.element.ownerDocument.createTextNode('Hello Vega!');
        this.container_.appendChild(textNode);
        resolve();
      }, 1000);
    });
  }
}

AMP.registerElement('amp-viz-vega', AmpVizVega);
