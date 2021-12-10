import {isExperimentOn} from '#experiments';

import {AmpPreactBaseElement} from '#preact/amp-base-element';

import {userAssert} from '#utils/log';

import {
  Component,
  layoutSizeDefined,
  loadable,
  preconnects,
  props,
  usesShadowDom,
} from './element';
/** @const {string} */
const TAG = 'amp-soundcloud';

class AmpSoundcloud extends AmpPreactBaseElement {
  /** @override */
  static getPreconnects() {
    return preconnects;
  }

  /** @override */
  isLayoutSupported(layout) {
    userAssert(
      isExperimentOn(this.win, 'bento') ||
        isExperimentOn(this.win, 'bento-soundcloud'),
      'expected global "bento" or specific "bento-soundcloud" experiment to be enabled'
    );
    return super.isLayoutSupported(layout);
  }
}
/** @override */
AmpSoundcloud['Component'] = Component;

/** @override */
AmpSoundcloud['props'] = props;

/** @override */
AmpSoundcloud['layoutSizeDefined'] = layoutSizeDefined;

/** @override */
AmpSoundcloud['usesShadowDom'] = usesShadowDom;

/** @override */
AmpSoundcloud['loadable'] = loadable;

AMP.extension(TAG, '1.0', (AMP) => {
  AMP.registerElement(TAG, AmpSoundcloud);
});
