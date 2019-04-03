/**
 * Copyright 2019 The AMP HTML Authors. All Rights Reserved.
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

import {Layout} from '../../../src/layout';
import {
  Variants,
  allocateVariant,
} from './variant';
import {devAssert, user, userAssert} from '../../../src/log';
import {getServicePromiseForDoc} from '../../../src/service';
import {
  installOriginExperimentsForDoc,
  originExperimentsForDoc,
} from '../../../src/service/origin-experiments-impl';
import {isExperimentOn} from '../../../src/experiments';
import {parseJson} from '../../../src/json';

const TAG = 'amp-experiment';

export class AmpExperiment extends AMP.BaseElement {

  /** @override */
  isLayoutSupported(layout) {
    return layout == Layout.NODISPLAY || layout == Layout.CONTAINER;
  }

  /** @override */
  buildCallback() {

    const buildCallbackPromises = [
      getServicePromiseForDoc(this.getAmpDoc(), 'variant'),
      this.isExperimentEnabled_(),
    ];

    return Promise.all(buildCallbackPromises).then(responses => {
      const variantsService = responses[0];
      const enabled = responses[1];

      if (!enabled) {
        user().error(TAG, 'Experiment amp-experiment-1.0 is not enabled.');

        // Ensure downstream consumers don't wait for the promise forever.
        variantsService.init(Promise.resolve({}));

        return Promise.reject(
            'Experiment amp-experiment-1.0 is not enabled.'
        );
      }

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
            .then(this.applyExperimentVariants_.bind(this, config));

        variantsService.init(experimentVariants);
      } catch (e) {
        // Ensure downstream consumers don't wait for the promise forever.
        variantsService.init(Promise.resolve({}));
        throw e;
      }
    });
  }

  /**
   * The experiment config can be represented as:
   * const config = {
   *   experimentObject: {
   *     // General experiment settings e.g schedule.
   *     variants: {
   *       variantObject: {
   *         // Objects that represent what
   *         // should change (mutations) when
   *         // this variant of the experiment is
   *         // applied (weight)
   *       }
   *     }
   *   }
   * }
   * @return {!JsonObject} [description]
   */
  getConfig_() {
    const {children} = this.element;
    userAssert(
        children.length == 1 && children[0].tagName == 'SCRIPT'
            && children[0].getAttribute('type').toUpperCase()
                == 'APPLICATION/JSON',
        '<amp-experiment> should contain exactly one ' +
        '<script type="application/json"> child.');

    return /** @type {!JsonObject} */ (
      devAssert(parseJson(children[0].textContent)));
  }

  /**
   * Passes the given experiment and variant pairs to the correct handler,
   * to apply the experiment to the document.
   * Experiment with no variant assigned (null) will be skipped.
   *
   * For example, the `experimentToVariant` object looks like:
   * {
   *   'appliedExperimentName': 'chosenVariantName',
   *   'anotherAppliedExperimentName': 'chosenVariantName'
   * }
   * Which is a simplified version of the config and
   * represents what variant of each experiment
   * should be applied.
   *
   * @param {!JsonObject} config
   * @param {!Object<string, ?string>} experimentToVariant
   * @return {!Promise<!Object<string, ?string>>} a promise of the original
   *     param passed in
   * @private
   */
  applyExperimentVariants_(config, experimentToVariant) {

    const appliedExperimentToVariantPromises = [];

    for (const experimentName in experimentToVariant) {
      const variantName = experimentToVariant[experimentName];
      if (variantName) {
        const variantObject = config[experimentName]['variants'][variantName];
        appliedExperimentToVariantPromises.push(
            this.applyMutations_(experimentName, variantObject)
        );
      }
    }

    return Promise.all(appliedExperimentToVariantPromises)
        .then(() => experimentToVariant);
  }

  /**
   * Passes the given experimentName and variantObject pairs
   * to the mutation service to be applied to the document.
   * @param {string} experimentName
   * @param {!JsonObject} variantObject
   * @return {!Promise}
   * @private
   */
  applyMutations_(experimentName, variantObject) {
    const doc = this.getAmpDoc();
    return doc.whenBodyAvailable().then(() => {
      // TODO (torch2424): Use a mutation service,
      // and apply mutations
      // Placehodler to pass linting for code review
      // and keep PRs small
      // This is a NOOP
      variantObject[experimentName] = experimentName;
    });
  }

  /**
   * Function to check if recaptcha experiment is enabled,
   * through origin trial, or AMP.toggleExperiment
   * @return {!Promise<boolean>}
   */
  isExperimentEnabled_() {

    // Check if we are enabled by AMP.toggleExperiment
    if (isExperimentOn(this.win, 'amp-experiment-1.0')) {
      return Promise.resolve(true);
    }

    // Check if we are enabled by an origin trial
    installOriginExperimentsForDoc(this.getAmpDoc());
    return originExperimentsForDoc(this.element)
        .getExperiments()
        .then(trials => {
          return trials && trials.includes('amp-experiment-1.0');
        });
  }
}


AMP.extension(TAG, '1.0', AMP => {
  AMP.registerServiceForDoc('variant', Variants);
  AMP.registerElement(TAG, AmpExperiment);
});
