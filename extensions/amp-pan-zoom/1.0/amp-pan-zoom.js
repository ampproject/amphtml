import {isExperimentOn} from '#experiments';

import {AmpPreactBaseElement, setSuperClass} from '#preact/amp-base-element';

import {userAssert} from '#utils/log';

import {BaseElement} from './base-element';

import {CSS} from '../../../build/amp-pan-zoom-1.0.css';

/** @const {string} */
const TAG = 'amp-pan-zoom';

class AmpPanZoom extends setSuperClass(BaseElement, AmpPreactBaseElement) {
  /** @override */
  init() {
    this.registerApiAction('transform', (api, {args}) =>
      api./*OK*/ transform(args['scale'], args['x'], args['y'])
    );
  }

  /** @override */
  isLayoutSupported(layout) {
    userAssert(
      isExperimentOn(this.win, 'bento') ||
        isExperimentOn(this.win, 'bento-pan-zoom'),
      'expected global "bento" or specific "bento-pan-zoom" experiment to be enabled'
    );
    return super.isLayoutSupported(layout);
  }
}

AMP.extension(TAG, '1.0', (AMP) => {
  AMP.registerElement(TAG, AmpPanZoom, CSS);
});
