import {isExperimentOn} from '#experiments';

import {AmpPreactBaseElement, setSuperClass} from '#preact/amp-base-element';

import {userAssert} from '#utils/log';

import {BaseElement} from './base-element';

import {CSS} from '../../../build/bento-resize-guard-1.0.css';

/** @const {string} */
const TAG = 'amp-resize-guard';

class AmpResizeGuard extends setSuperClass(BaseElement, AmpPreactBaseElement) {
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
        isExperimentOn(this.win, 'bento-resize-guard'),
      'expected global "bento" or specific "bento-resize-guard" experiment to be enabled'
    );
    return super.isLayoutSupported(layout);
  }
}

AMP.extension(TAG, '1.0', (AMP) => {
  AMP.registerElement(TAG, AmpResizeGuard, CSS);
});
