import {Layout_Enum} from '#core/dom/layout';
import {parseJson} from '#core/types/object/json';

import {isExperimentOn} from '#experiments';

import {Services} from '#service';
import {
  installOriginExperimentsForDoc,
  originExperimentsForDoc,
} from '#service/origin-experiments-impl';

import {devAssert, user, userAssert} from '#utils/log';

import {applyExperimentToVariant} from './apply-experiment';
import {ATTR_PREFIX, Variants, allocateVariant} from './variant';

import {getServicePromiseForDoc} from '../../../src/service-helpers';

const TAG = 'amp-experiment';

export class AmpExperiment extends AMP.BaseElement {
  /** @override  */
  static prerenderAllowed() {
    /*
     * Prerender is allowed because the client_id is only used to calculate
     * the variant bucket.
     * In the case where a client_id is first generated
     * during prerender, the base cid will be stored in the AMP viewer domain.
     */
    return true;
  }

  /** @override */
  isLayoutSupported(layout) {
    return layout == Layout_Enum.NODISPLAY || layout == Layout_Enum.CONTAINER;
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

      let config = {};

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

        /** @private @const {!Promise<!{[key: string]: ?string}>} */
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
   * @return {!{[key: string]: ?string}}
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
