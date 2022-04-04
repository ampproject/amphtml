import {Layout_Enum} from '#core/dom/layout';

import {isExperimentOn} from '#experiments';

import {AmpPreactBaseElement, setSuperClass} from '#preact/amp-base-element';

import {triggerAnalyticsEvent} from '#utils/analytics';
import {userAssert} from '#utils/log';

import {BaseElement} from './base-element';

/** @const {string} */
const TAG = 'amp-audio';

class AmpAudio extends setSuperClass(BaseElement, AmpPreactBaseElement) {
  /** @override */
  init() {
    this.registerApiAction('play', (api) => {
      api.play();
    });
    this.registerApiAction('pause', (api) => {
      api.pause();
    });
    this.registerApiAction('isPlaying', (api) => api.isPlaying());

    /**
     * TODO(AnuragVasanwala):
     * Add "validateMediaMetadata(element, metadata)" to dictionary
     * once validation step for video components on Bento are included
     */
    return {
      'onLoad': () => {
        this.toggleFallback(false);
      },
      'onError': () => {
        this.toggleFallback(true);
      },
      'onPlaying': () => {
        triggerAnalyticsEvent(this.element, 'audio-play');
      },
      'onPause': () => {
        triggerAnalyticsEvent(this.element, 'audio-pause');
      },
    };
  }

  /** @override */
  isLayoutSupported(layout) {
    userAssert(
      isExperimentOn(this.win, 'bento') ||
        isExperimentOn(this.win, 'bento-audio'),
      'expected global "bento" or specific "bento-audio" experiment to be enabled'
    );
    return layout == Layout_Enum.FIXED || layout == Layout_Enum.FIXED_HEIGHT;
  }
}

AMP.extension(TAG, '1.0', (AMP) => {
  AMP.registerElement(TAG, AmpAudio);
});
