import {dict} from '#core/types/object';

import {isExperimentOn} from '#experiments';

import {AmpPreactBaseElement} from '#preact/amp-base-element';

import {userAssert} from '#utils/log';

import {
  Component,
  layoutSizeDefined,
  loadable,
  props,
  unloadOnPause,
  usesShadowDom,
} from './element';

import {CSS} from '../../../build/amp-instagram-1.0.css';

/** @const {string} */
const TAG = 'amp-instagram';

class AmpInstagram extends AmpPreactBaseElement {
  /** @override */
  isLayoutSupported(layout) {
    userAssert(
      isExperimentOn(this.win, 'bento') ||
        isExperimentOn(this.win, 'bento-instagram'),
      'expected global "bento" or specific "bento-instagram" experiment to be enabled'
    );
    return super.isLayoutSupported(layout);
  }

  /** @override */
  init() {
    return dict({
      'requestResize': (height) => this.attemptChangeHeight(height),
    });
  }
}

/** @override */
AmpInstagram['Component'] = Component;

/** @override */
AmpInstagram['loadable'] = loadable;

/** @override */
AmpInstagram['unloadOnPause'] = unloadOnPause;

/** @override */
AmpInstagram['props'] = props;

/** @override */
AmpInstagram['usesShadowDom'] = usesShadowDom;

/** @override */
AmpInstagram['layoutSizeDefined'] = layoutSizeDefined;

AMP.extension(TAG, '1.0', (AMP) => {
  AMP.registerElement(TAG, AmpInstagram, CSS);
});
