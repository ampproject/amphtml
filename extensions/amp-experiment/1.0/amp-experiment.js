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

import {ATTR_PREFIX, Variants, allocateVariant} from './variant';
import {Layout} from '../../../src/layout';
import {Services} from '../../../src/services';
import {applyExperimentToVariant} from './apply-experiment';
import {devAssert, user, userAssert} from '../../../src/log';
import {dict} from '../../../src/utils/object';
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
  prerenderAllowed() {
    /*
     * Prerender is allowed because the client_id is only used to calculate
     * the variant bucket.
     * In the case where a client_id is first generated
     * during prerender, the base cid will be stored in the AMP viewer domain.
     */
    return true;
  }

  /** @override */
  isBuildRenderBlocking() {
    // variantService is render blocking
    return true;
  }

  /** @override */
  buildCallback() {
    const buildCallbackPromises = [
      getServicePromiseForDoc(this.getAmpDoc(), 'variant'),
      this.isExperimentEnabled_(),
    ];

    return Promise.all(buildCallbackPromises).then((responses) => {
      const variantsService = responses[0];
      const enabled = responses[1];

      let config = dict({});

      try {
        config = this.getConfig_();

        if (!enabled) {
          user().error(TAG, 'Experiment amp-experiment-1.0 is not enabled.');

          // Ensure downstream consumers don't wait for the promise forever.
          variantsService.init(
            Promise.resolve(this.getEmptyExperimentToVariant_(config))
          );

          return;
        }

        const ampdoc = this.getAmpDoc();

        // All experiments can be disabled by a hash param
        const viewer = Services.viewerForDoc(ampdoc);
        const override = ampdoc.getParam(
          ATTR_PREFIX + 'disable-all-experiments'
        );
        if (override != null) {
          variantsService.init(
            Promise.resolve(this.getEmptyExperimentToVariant_(config))
          );
          return;
        }

        const experimentToVariant = Object.create(null);
        const variants = Object.keys(config).map((experimentName) => {
          return allocateVariant(
            ampdoc,
            viewer,
            experimentName,
            config[experimentName]
          ).then((variantName) => {
            experimentToVariant[experimentName] = variantName;
          });
        });

        /** @private @const {!Promise<!Object<string, ?string>>} */
        const experimentVariants = Promise.all(variants)
          .then(() => {
            const ampdoc = this.getAmpDoc();
            const applyExperimentsPromise = applyExperimentToVariant(
              ampdoc,
              config,
              experimentToVariant
            );

            const experimentToVariantPromise = applyExperimentsPromise.then(
              () => experimentToVariant
            );
            variantsService.init(experimentToVariantPromise);
            return experimentToVariantPromise;
          })
          .catch((e) => {
            // Ensure downstream consumers don't wait for the promise forever.
            variantsService.init(
              Promise.resolve(this.getEmptyExperimentToVariant_(config))
            );
            throw e;
          });

        /**
         * Returning the experimentVariants promise here
         * So that the buildCallback that is waiting for
         * the parent promise, will wait for this promise as well.
         * And wait for the variants to be applied before finishing
         * our buildCallback.
         */
        return experimentVariants;
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
      children.length == 1 &&
        children[0].tagName == 'SCRIPT' &&
        children[0].getAttribute('type').toUpperCase() == 'APPLICATION/JSON',
      '<amp-experiment> should contain exactly one ' +
        '<script type="application/json"> child.'
    );

    return devAssert(parseJson(children[0].textContent));
  }

  /**
   * Function to return an empty experiment to variant
   * Object. This is useful for type checking in analytics
   * and disabling all experiments manually.
   * @param {!JsonObject} config
   * @return {!Object<string, ?string>}
   */
  getEmptyExperimentToVariant_(config) {
    const experimentToVariant = Object.create(null);
    Object.keys(config).map((experimentName) => {
      experimentToVariant[experimentName] = null;
    });

    return experimentToVariant;
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
      .then((trials) => {
        return trials && trials.includes('amp-experiment-1.0');
      });
  }
}

AMP.extension(TAG, '1.0', (AMP) => {
  AMP.registerServiceForDoc('variant', Variants);
  AMP.registerElement(TAG, AmpExperiment);
});
