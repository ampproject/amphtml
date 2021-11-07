import {user} from '#utils/log';

/** @private @const {string} */
const TAG = 'amp-slides';

/** Deprecated. Please see {@link AmpCarousel} with `type=slides` attribute. */
class AmpSlides extends AMP.BaseElement {
  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);
    user().error(
      TAG,
      'No longer available. ' +
        'Use `amp-carousel` with `type="slides"` for an alternative'
    );
  }
}

AMP.extension(TAG, '0.1', (AMP) => {
  AMP.registerElement(TAG, AmpSlides);
});
