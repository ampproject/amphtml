import {isExperimentOn} from '#experiments';

import {userAssert} from '#utils/log';

import {AmpVideoBaseElement} from 'extensions/amp-video/1.0/video-base-element';

import {Component, loadable, props, usesShadowDom} from './element';

import {CSS} from '../../../build/amp-youtube-1.0.css';

/** @const {string} */
const TAG = 'amp-youtube';

class AmpYoutube extends AmpVideoBaseElement {
  /** @override */
  isLayoutSupported(layout) {
    userAssert(
      isExperimentOn(this.win, 'bento') ||
        isExperimentOn(this.win, 'bento-youtube'),
      'expected global "bento" or specific "bento-youtube" experiment to be enabled'
    );
    return super.isLayoutSupported(layout);
  }
}

/** @override */
AmpYoutube['Component'] = Component;

/** @override */
AmpYoutube['loadable'] = loadable;

/** @override */
AmpYoutube['props'] = props;

/** @override */
AmpYoutube['usesShadowDom'] = usesShadowDom;

AMP.extension(TAG, '1.0', (AMP) => {
  AMP.registerElement(TAG, AmpYoutube, CSS);
});
