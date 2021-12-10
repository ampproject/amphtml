import {isExperimentOn} from '#experiments';

import {AmpPreactBaseElement} from '#preact/amp-base-element';

import {userAssert} from '#utils/log';

import {
  Component,
  layoutSizeDefined,
  props,
  updatePropsForRendering,
  usesShadowDom,
} from './element';

/** @const {string} */
const TAG = 'amp-timeago';

class AmpTimeago extends AmpPreactBaseElement {
  /** @override */
  isLayoutSupported(layout) {
    userAssert(
      isExperimentOn(this.win, 'bento') ||
        isExperimentOn(this.win, 'bento-timeago'),
      'expected global "bento" or specific "bento-timeago" experiment to be enabled'
    );
    return super.isLayoutSupported(layout);
  }

  /** @override */
  updatePropsForRendering(props) {
    updatePropsForRendering(props);
  }
}

/** @override */
AmpTimeago['Component'] = Component;

/** @override */
AmpTimeago['layoutSizeDefined'] = layoutSizeDefined;

/** @override */
AmpTimeago['props'] = props;

/** @override */
AmpTimeago['usesShadowDom'] = usesShadowDom;

AMP.extension(TAG, '1.0', (AMP) => {
  AMP.registerElement(TAG, AmpTimeago);
});
