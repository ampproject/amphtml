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
import {waitForBody} from '../../../src/dom';

/** @const */
const EXPERIMENT = 'amp-experiment';
const ATTR_PREFIX = 'amp-x-';

export class AmpExperiment extends AMP.BaseElement {

  /** @override */
  isLayoutSupported(unusedLayout) {
    return true;
  }

  /** @override */
  buildCallback() {
    this.isExperimentOn_ = isExperimentOn(this.getWin(), EXPERIMENT);
    if (!this.isExperimentOn_) {
      dev.warn(EXPERIMENT, `Experiment ${EXPERIMENT} disabled`);
      toggle(this.element, false);
      return;
    }

    const config = this.getConfig_();
    const results = {};
    this.experimentVariants = Promise.all(
        Object.keys(config).map(experimentName => {
          return this.getVariantAllocation_(config[experimentName])
              .then(variantName => {
                if (variantName) {
                  results[experimentName] = variantName;
                }
              });
        })).then(() => results);
    this.experimentVariants.then(this.addToBody_.bind(this));
  }

  getConfig_() {
    const children = this.element.children;
    user.assert(
        children.length == 1 && children[0].tagName == 'SCRIPT'
            && children[0].getAttribute('type').toUpperCase()
                == 'APPLICATION/JSON',
        '<amp-experiment> should contain exactly one ' +
        '<script type="application/json"> child.');

    return JSON.parse(children[0].textContent);
  }

  /**
   * Allocates the current page view to a variant according to the given
   * experiment config.
   * @param {!JSONType} config experiment config
   * @returns {!Promise<?string>} the name of the allocated variant
   * @private
   */
  getVariantAllocation_(config) {
    // TODO(@lannka, #1411): wire up with real variant allocation code.
    return Promise.resolve(Object.keys(config.variants)[0]);
  }

  /**
   * Adds the given experiment and variant pairs to body element as attributes
   * and values.
   * @param {!JSONType} experiments
   * @private
   */
  addToBody_(experiments) {
    const doc = this.getWin().document;
    waitForBody(doc, () => {
      for (const name in experiments) {
        if (experiments.hasOwnProperty(name)) {
          doc.body.setAttribute(ATTR_PREFIX + name, experiments[name]);
        }
      }
    });
  }
}

AMP.registerElement('amp-experiment', AmpExperiment);
