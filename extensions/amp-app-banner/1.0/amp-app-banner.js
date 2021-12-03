import {BaseElement} from './base-element';
import {CSS} from '../../../build/amp-app-banner-1.0.css';
import {dict} from '#core/types/object';
import {isExperimentOn} from '#experiments';
import {userAssert} from '#utils/log';

/** @const {string} */
const TAG = 'amp-app-banner';

class AmpAppBanner extends BaseElement {
  /** @override */
  init() {
    return dict({
      // Extra props passed by wrapper AMP component
      'dismissButtonAriaLabel': this.element.getAttribute('dismiss-button-aria-label'),
    });
  }

  /** @override */
  isLayoutSupported(layout) {
    userAssert(
      isExperimentOn(this.win, 'bento') ||
        isExperimentOn(this.win, 'bento-app-banner'),
      'expected global "bento" or specific "bento-app-banner" experiment to be enabled'
    );
    return super.isLayoutSupported(layout);
  }
}

AMP.extension(TAG, '1.0', (AMP) => {
  AMP.registerElement(TAG, AmpAppBanner, CSS);
});
