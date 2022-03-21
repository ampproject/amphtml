import {BaseElement} from './base-element';
import {CSS} from '../../../build/amp-imgur-1.0.css';
import {isExperimentOn} from '#experiments';
import {AmpPreactBaseElement, setSuperClass} from '#preact/amp-base-element';
import {userAssert} from '#utils/log';

/** @const {string} */
const TAG = 'amp-imgur';

class AmpImgur extends setSuperClass(BaseElement, AmpPreactBaseElement) {
  /** @override */
  init() {
    // DO NOT SUBMIT: This is example code only.
    this.registerApiAction('exampleToggle', (api) =>
      api./*OK*/ exampleToggle()
    );

    return {
      // Extra props passed by wrapper AMP component
      exampleTagNameProp: this.element.tagName,
    };
  }

  /** @override */
  isLayoutSupported(layout) {
    userAssert(
      isExperimentOn(this.win, 'bento') ||
        isExperimentOn(this.win, 'bento-imgur'),
      'expected global "bento" or specific "bento-imgur" experiment to be enabled'
    );
    return super.isLayoutSupported(layout);
  }
}

AMP.extension(TAG, '1.0', (AMP) => {
  AMP.registerElement(TAG, AmpImgur, CSS);
});
