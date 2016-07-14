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
import {parseQueryString} from '../../../src/url';
import {isExperimentOn} from '../../../src/experiments';
import {toggle} from '../../../src/style';
import {waitForBodyPromise} from '../../../src/dom';
import {allocateVariant, nameValidator} from './variant';
import {getService} from '../../../src/service';

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
    const results = Object.create(null);
    const override = this.getVariantOverride_();
    const variants = Object.keys(config).map(experimentName => {
      if (override[experimentName]) {
        results[experimentName] = override[experimentName];
        return Promise.resolve();
      }

      return allocateVariant(this.getWin(), config[experimentName])
          .then(variantName => {
            results[experimentName] = variantName;
          });
    });

    const promise = Promise.all(variants)
        .then(() => results)
        .then(this.addToBody_.bind(this));

    getService(this.getWin(), 'variant', () => promise);
  }

  /**
   * Returns config object.
   * @return {!JSONType}
   * @private
   */
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
   * Adds the given experiment and variant pairs to body element as attributes
   * and values. Experiment with no variant assigned (null) will be skipped.
   * @param {!Object<string, ?string>} experiments
   * @return {!Promise<!Object<string, ?string>>} a promise of the original
   *     param passed in
   * @private
   */
  addToBody_(experiments) {
    const doc = this.getWin().document;
    return waitForBodyPromise(doc).then(() => {
      for (const name in experiments) {
        if (experiments[name]) {
          doc.body.setAttribute(ATTR_PREFIX + name, experiments[name]);
        }
      }
      return experiments;
    });
  }

  /**
   * Parses URL fragment and returns variant override.
   * @return {!Object<string, string>}
   * @private
   */
  getVariantOverride_() {
    const queries = parseQueryString(
        // location.originalHash is set by the viewer when it removes the
        // fragment from the URL.
        this.getWin().location.originalHash || this.getWin().location.hash);

    const override = Object.create(null);
    for (const key in queries) {
      const value = queries[key];
      if (key.startsWith(ATTR_PREFIX) && nameValidator.test(value)) {
        override[key.substr(6 /* amp-x- */)] = value;
      }
    }
    return override;
  }
}

AMP.registerElement('amp-experiment', AmpExperiment);
