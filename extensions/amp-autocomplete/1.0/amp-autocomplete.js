import {BaseElement} from '#bento/components/bento-autocomplete/1.0/base-element';

import {isExperimentOn} from '#experiments';

import {AmpPreactBaseElement, setSuperClass} from '#preact/amp-base-element';

import {userAssert} from '#utils/log';

import {CSS} from '../../../build/amp-autocomplete-1.0.css';

/** @const {string} */
const TAG = 'amp-autocomplete';

class AmpAutocomplete extends setSuperClass(BaseElement, AmpPreactBaseElement) {
  /** @override */
  init() {
    return {
      // Extra props passed by wrapper AMP component
    };
  }

  /** @override */
  isLayoutSupported(layout) {
    userAssert(
      isExperimentOn(this.win, 'bento') ||
        isExperimentOn(this.win, 'bento-autocomplete'),
      'expected global "bento" or specific "bento-autocomplete" experiment to be enabled'
    );
    return super.isLayoutSupported(layout);
  }
}

AMP.extension(TAG, '1.0', (AMP) => {
  AMP.registerElement(TAG, AmpAutocomplete, CSS);
});
