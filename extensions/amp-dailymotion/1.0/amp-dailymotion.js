import {BaseElement} from '#bento/components/bento-dailymotion/1.0/base-element';
import {AmpVideoBaseElement} from '#bento/components/bento-video/1.0/video-base-element';

import {isExperimentOn} from '#experiments';

import {setSuperClass} from '#preact/amp-base-element';

import {userAssert} from '#utils/log';

import {CSS} from '../../../build/amp-dailymotion-1.0.css';

/** @const {string} */
const TAG = 'amp-dailymotion';

class AmpDailymotion extends setSuperClass(BaseElement, AmpVideoBaseElement) {
  /** @override */
  init() {
    super.init();
    const {
      'endscreenEnable': endscreenEnable,
      'info': info,
      'mute': mute,
      'sharingEnable': sharingEnable,
      'uiLogo': uiLogo,
    } = this.element.dataset;

    return {
      'endscreenEnable': endscreenEnable !== 'false',
      'info': info !== 'false',
      'mute': mute === 'true',
      'sharingEnable': sharingEnable !== 'false',
      'uiLogo': uiLogo !== 'false',
    };
  }

  /** @override */
  isLayoutSupported(layout) {
    userAssert(
      isExperimentOn(this.win, 'bento') ||
        isExperimentOn(this.win, 'bento-dailymotion'),
      'expected global "bento" or specific "bento-dailymotion" experiment to be enabled'
    );
    return super.isLayoutSupported(layout);
  }
}

AMP.extension(TAG, '1.0', (AMP) => {
  AMP.registerElement(TAG, AmpDailymotion, CSS);
});
