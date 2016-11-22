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

import {childElementByTag} from '../../../src/dom';
import {user} from '../../../src/log';
import {isExperimentOn} from '../../../src/experiments';
import {installWebAnimations} from 'web-animations-js/web-animations.install';
import {MeasureScanner} from './web-animations';
import {tryParseJson} from '../../../src/json';

const TAG = 'amp-animation';


export class AmpAnimation extends AMP.BaseElement {

  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {?JSONType} */
    this.configJson_ = null;

    /** @private {?./web-animations.WebAnimationRunner} */
    this.runner_ = null;
  }

  /** @override */
  buildCallback() {
    user().assert(isExperimentOn(this.win, TAG),
        `Experiment "${TAG}" is disabled.`);

    // Parse config.
    const scriptElement = user().assert(
        childElementByTag(this.element, 'script'),
        '"<script type=application/json>" must be present');
    this.configJson_ = tryParseJson(scriptElement.textContent, error => {
      throw user().createError('failed to parse animation script', error);
    });
  }

  /** @override */
  activate() {
    // Force cast to `WebAnimationDef`. It will be validated during preparation
    // phase.
    const configJson = /** @type {!./web-animation-types.WebAnimationDef} */ (
        this.configJson_);

    // Ensure polyfill is installed.
    if (!this.win.Element.prototype.animate) {
      installWebAnimations(this.win);
    }

    const measurer = new MeasureScanner(this.win, {
      resolveTarget: id => this.getAmpDoc().getElementById(id),
    }, /* validate */ true);
    const vsync = this.getVsync();
    vsync.measurePromise(() => {
      measurer.scan(configJson);
      return measurer.createRunner(this.element.getResources());
    }).then(runner => {
      this.runner_ = runner;
      this.runner_.play();
    });
  }
}


AMP.registerElement(TAG, AmpAnimation);
