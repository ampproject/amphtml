import {Layout} from '#core/dom/layout';
import {dict} from '#core/types/object';

import {isExperimentOn} from '#experiments';

import {BaseElement} from './base-element';

import {triggerAnalyticsEvent} from '../../../src/analytics';
import {userAssert} from '../../../src/log';

/** @const {string} */
const TAG = 'amp-audio';

class AmpAudio extends BaseElement {
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
    return dict({
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
    });
  }

  /** @override */
  isLayoutSupported(layout) {
    userAssert(
      isExperimentOn(this.win, 'bento') ||
        isExperimentOn(this.win, 'bento-audio'),
      'expected global "bento" or specific "bento-audio" experiment to be enabled'
    );
    return layout == Layout.FIXED || layout == Layout.FIXED_HEIGHT;
  }
}

AMP.extension(TAG, '1.0', (AMP) => {
  AMP.registerElement(TAG, AmpAudio);
});
