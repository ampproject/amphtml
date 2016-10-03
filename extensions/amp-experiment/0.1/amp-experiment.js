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

import {dev, user} from '../../../src/log';
import {isExperimentOn} from '../../../src/experiments';
import {toggle} from '../../../src/style';
import {Layout} from '../../../src/layout';
import {waitForBodyPromise} from '../../../src/dom';
import {allocateVariant} from './variant';
import {getService} from '../../../src/service';

/** @const */
const EXPERIMENT = 'amp-experiment';
const ATTR_PREFIX = 'amp-x-';

export class AmpExperiment extends AMP.BaseElement {

  /** @override */
  isLayoutSupported(layout) {
    return layout == Layout.NODISPLAY || layout == Layout.CONTAINER;
  }

  /** @override */
  buildCallback() {
    this.isExperimentOn_ = isExperimentOn(this.win, EXPERIMENT);
    if (!this.isExperimentOn_) {
      dev().warn(EXPERIMENT, `Experiment ${EXPERIMENT} disabled`);
      toggle(this.element, false);
      getService(this.win, 'variant', () => Promise.resolve());
      return;
    }

    const config = this.getConfig_();
    const results = Object.create(null);
    const variants = Object.keys(config).map(experimentName => {
      return allocateVariant(
          this.getAmpDoc(), experimentName, config[experimentName])
              .then(variantName => {
                results[experimentName] = variantName;
              });
    });

    /** @private @const {!Promise<!Object<string, ?string>>} */
    this.experimentVariants_ = Promise.all(variants)
        .then(() => results)
        .then(this.addToBody_.bind(this));

    getService(this.win, 'variant', () => this.experimentVariants_);
  }

  getConfig_() {
    const children = this.element.children;
    user().assert(
        children.length == 1 && children[0].tagName == 'SCRIPT'
            && children[0].getAttribute('type').toUpperCase()
                == 'APPLICATION/JSON',
        '<amp-experiment> should contain exactly one ' +
        '<script type="application/json"> child.');

    return JSON.parse(children[0].textContent);
  }

  /**
   * Adds the given experiment and variant pairs to body element as attributes
   * and values. Experiment with no variant assigned (null) will be skipped.
   * @param {!Object<string, ?string>} experiments
   * @return {!Promise<!Object<string, ?string>>} a promise of the original
   *     param passed in
   * @private
   */
  addToBody_(experiments) {
    const doc = this.win.document;
    return waitForBodyPromise(doc).then(() => {
      for (const name in experiments) {
        if (experiments[name]) {
          doc.body.setAttribute(ATTR_PREFIX + name, experiments[name]);
        }
      }
      return experiments;
    });
  }
}

AMP.registerElement('amp-experiment', AmpExperiment);
