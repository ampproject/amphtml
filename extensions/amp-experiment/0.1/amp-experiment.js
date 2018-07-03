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

import {Deferred} from '../../../src/utils/promise';
import {Layout} from '../../../src/layout';
import {allocateVariant} from './variant';
import {dev, user} from '../../../src/log';
import {parseJson} from '../../../src/json';
import {waitForBodyPromise} from '../../../src/dom';

const TAG = 'amp-experiment';
const ATTR_PREFIX = 'amp-x-';


export class AmpExperiment extends AMP.BaseElement {

  /** @override */
  isLayoutSupported(layout) {
    return layout == Layout.NODISPLAY || layout == Layout.CONTAINER;
  }

  /** @override */
  buildCallback() {
    try {
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
      const experimentVariants = Promise.all(variants)
          .then(() => results)
          .then(this.addToBody_.bind(this));

      serviceDeferred.resolve(experimentVariants);
    } catch (e) {
      // Ensure downstream consumers don't wait for the promise forever.
      serviceDeferred.resolve(null);
      throw e;
    }
  }

  /** @return {!JsonObject} [description] */
  getConfig_() {
    const {children} = this.element;
    user().assert(
        children.length == 1 && children[0].tagName == 'SCRIPT'
            && children[0].getAttribute('type').toUpperCase()
                == 'APPLICATION/JSON',
        '<amp-experiment> should contain exactly one ' +
        '<script type="application/json"> child.');

    return /** @type {!JsonObject} */ (
      dev().assert(parseJson(children[0].textContent)));
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
          doc.body.setAttribute(ATTR_PREFIX + name,
              dev().assertString(experiments[name]));
        }
      }
      return experiments;
    });
  }
}

/**
 * Create the service promise at load time to prevent race between extensions
 */

/** singleton */
let serviceDeferred = null;

AMP.extension(TAG, '0.1', AMP => {
  serviceDeferred = new Deferred();
  AMP.registerElement(TAG, AmpExperiment);
  AMP.registerServiceForDoc('variant', () => serviceDeferred.promise);
});
