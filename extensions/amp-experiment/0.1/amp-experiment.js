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
<<<<<<< HEAD
import {waitForBody} from '../../../src/dom';
import {allocateVariant} from './variant';
=======
import {Layout} from '../../../src/layout';
import {waitForBodyPromise} from '../../../src/dom';
import {allocateVariant} from './variant';
import {getService} from '../../../src/service';
>>>>>>> ampproject/master

/** @const */
const EXPERIMENT = 'amp-experiment';
const ATTR_PREFIX = 'amp-x-';

export class AmpExperiment extends AMP.BaseElement {

  /** @override */
<<<<<<< HEAD
  isLayoutSupported(unusedLayout) {
    return true;
=======
  isLayoutSupported(layout) {
    return layout == Layout.NODISPLAY || layout == Layout.CONTAINER;
>>>>>>> ampproject/master
  }

  /** @override */
  buildCallback() {
<<<<<<< HEAD
    this.isExperimentOn_ = isExperimentOn(this.getWin(), EXPERIMENT);
    if (!this.isExperimentOn_) {
      dev.warn(EXPERIMENT, `Experiment ${EXPERIMENT} disabled`);
      toggle(this.element, false);
=======
    this.isExperimentOn_ = isExperimentOn(this.win, EXPERIMENT);
    if (!this.isExperimentOn_) {
      dev().warn(EXPERIMENT, `Experiment ${EXPERIMENT} disabled`);
      toggle(this.element, false);
      getService(this.win, 'variant', () => Promise.resolve());
>>>>>>> ampproject/master
      return;
    }

    const config = this.getConfig_();
    const results = Object.create(null);
<<<<<<< HEAD
    this.experimentVariants = Promise.all(
        Object.keys(config).map(experimentName => {
          return allocateVariant(this.getWin(), config[experimentName])
              .then(variantName => {
                if (variantName) {
                  results[experimentName] = variantName;
                }
              });
        })).then(() => results);
    this.experimentVariants.then(this.addToBody_.bind(this));
=======
    const variants = Object.keys(config).map(experimentName => {
      return allocateVariant(
          this.win, experimentName, config[experimentName])
              .then(variantName => {
                results[experimentName] = variantName;
              });
    });

    /** @private @const {!Promise<!Object<string, ?string>>} */
    this.experimentVariants_ = Promise.all(variants)
        .then(() => results)
        .then(this.addToBody_.bind(this));

    getService(this.win, 'variant', () => this.experimentVariants_);
>>>>>>> ampproject/master
  }

  getConfig_() {
    const children = this.element.children;
<<<<<<< HEAD
    user.assert(
=======
    user().assert(
>>>>>>> ampproject/master
        children.length == 1 && children[0].tagName == 'SCRIPT'
            && children[0].getAttribute('type').toUpperCase()
                == 'APPLICATION/JSON',
        '<amp-experiment> should contain exactly one ' +
        '<script type="application/json"> child.');

    return JSON.parse(children[0].textContent);
  }

  /**
   * Adds the given experiment and variant pairs to body element as attributes
<<<<<<< HEAD
   * and values.
   * @param {!Object<string, string>} experiments
   * @private
   */
  addToBody_(experiments) {
    const doc = this.getWin().document;
    waitForBody(doc, () => {
      for (const name in experiments) {
        doc.body.setAttribute(ATTR_PREFIX + name, experiments[name]);
      }
=======
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
>>>>>>> ampproject/master
    });
  }
}

AMP.registerElement('amp-experiment', AmpExperiment);
