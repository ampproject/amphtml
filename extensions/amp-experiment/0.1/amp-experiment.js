import {Layout_Enum} from '#core/dom/layout';
import {parseJson} from '#core/types/object/json';

import {dev, devAssert, userAssert} from '#utils/log';

import {Variants, allocateVariant} from './variant';

import {getServicePromiseForDoc} from '../../../src/service-helpers';

const TAG = 'amp-experiment';
const ATTR_PREFIX = 'amp-x-';

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
    return getServicePromiseForDoc(this.getAmpDoc(), 'variant').then(
      (variantsService) => {
        try {
          const config = this.getConfig_();
          const results = Object.create(null);
          const variants = Object.keys(config).map((experimentName) => {
            return allocateVariant(
              this.getAmpDoc(),
              experimentName,
              config[experimentName]
            ).then((variantName) => {
              results[experimentName] = variantName;
            });
          });

          /** @private @const {!Promise<!{[key: string]: ?string}>} */
          const experimentVariants = Promise.all(variants)
            .then(() => results)
            .then(this.addToBody_.bind(this));

          variantsService.init(experimentVariants);
        } catch (e) {
          // Ensure downstream consumers don't wait for the promise forever.
          variantsService.init({});
          throw e;
        }
      }
    );
  }

  /** @return {!JsonObject} [description] */
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
   * Adds the given experiment and variant pairs to body element as attributes
   * and values. Experiment with no variant assigned (null) will be skipped.
   * @param {!{[key: string]: ?string}} experiments
   * @return {!Promise<!{[key: string]: ?string}>} a promise of the original
   *     param passed in
   * @private
   */
  addToBody_(experiments) {
    const doc = this.getAmpDoc();
    return doc.waitForBodyOpen().then((body) => {
      for (const name in experiments) {
        if (experiments[name]) {
          body.setAttribute(
            ATTR_PREFIX + name,
            dev().assertString(experiments[name])
          );
        }
      }
      return experiments;
    });
  }
}

AMP.extension(TAG, '0.1', (AMP) => {
  AMP.registerServiceForDoc('variant', Variants);
  AMP.registerElement(TAG, AmpExperiment);
});
