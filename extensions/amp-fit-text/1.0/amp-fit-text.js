import {CSS} from '../../../build/amp-fit-text-1.0.css';
import {isExperimentOn} from '#experiments';
import {userAssert} from '#utils/log';

import {
  Component,
  layoutSizeDefined,
  props,
  shadowCss,
  usesShadowDom,
} from './element';
import {AmpPreactBaseElement} from '#preact/amp-base-element';

/** @const {string} */
const TAG = 'amp-fit-text';

class AmpFitText extends AmpPreactBaseElement {
  /** @override */
  isLayoutSupported(layout) {
    userAssert(
      isExperimentOn(this.win, 'bento') ||
        isExperimentOn(this.win, 'bento-fit-text'),
      'expected global "bento" or specific "bento-fit-text" experiment to be enabled'
    );
    return super.isLayoutSupported(layout);
  }
}

/** @override */
AmpFitText['Component'] = Component;

/** @override */
AmpFitText['props'] = props;

/** @override */
AmpFitText['layoutSizeDefined'] = layoutSizeDefined;

/** @override */
AmpFitText['usesShadowDom'] = usesShadowDom;

/** @override */
AmpFitText['shadowCss'] = shadowCss;

AMP.extension(TAG, '1.0', (AMP) => {
  AMP.registerElement(TAG, AmpFitText, CSS);
});
