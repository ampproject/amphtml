import {isExperimentOn} from '#experiments';

import {userAssert} from '#utils/log';

import {AmpVideoBaseElement} from 'extensions/amp-video/1.0/video-base-element';

import {
  Component,
  layoutSizeDefined,
  loadable,
  props,
  usesShadowDom,
} from './element';

import {CSS} from '../../../build/amp-vimeo-1.0.css';

/** @const {string} */
const TAG = 'amp-vimeo';

class AmpVimeo extends AmpVideoBaseElement {
  /** @override */
  isLayoutSupported(layout) {
    userAssert(
      isExperimentOn(this.win, 'bento') ||
        isExperimentOn(this.win, 'bento-vimeo'),
      'expected global "bento" or specific "bento-vimeo" experiment to be enabled'
    );
    return super.isLayoutSupported(layout);
  }
}

/** @override */
AmpVimeo['Component'] = Component;

/** @override */
AmpVimeo['props'] = props;

/** @override */
AmpVimeo['layoutSizeDefined'] = layoutSizeDefined;

/** @override */
AmpVimeo['usesShadowDom'] = usesShadowDom;

/** @override */
AmpVimeo['loadable'] = loadable;

AMP.extension(TAG, '1.0', (AMP) => {
  AMP.registerElement(TAG, AmpVimeo, CSS);
});
