import * as Preact from '#core/dom/jsx';
import {Layout_Enum, isLayoutSizeDefined} from '#core/dom/layout';
import {toArray} from '#core/types/array';

import {listen} from '#utils/event-helper';

import {TrackRenderer} from './track-renderer';

import {CSS} from '../../../build/amp-story-captions-0.1.css';
import {CSS as PRESETS_CSS} from '../../../build/amp-story-captions-presets-0.1.css';
import {createShadowRootWithStyle} from '../../amp-story/1.0/utils';

/**
 * List of valid preset values.
 * @const {Array<string>}
 */
const presetValues = ['default', 'appear'];

export class AmpStoryCaptions extends AMP.BaseElement {
  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {?Element} */
    this.container_ = null;

    /** @private {?HTMLVideoElement} */
    this.video_ = null;

    /** @private {?UnlistenDef} */
    this.textTracksChangeUnlistener_ = null;

    /** @private {!Array<!TrackRenderer>} */
    this.trackRenderers_ = [];
  }

  /** @override */
  buildCallback() {
    this.container_ = <div />;
    // Check if style-preset is defined and valid.
    // If valid it renders in shadow dom with preset syles.
    const preset = this.element.getAttribute('style-preset');
    if (presetValues.includes(preset)) {
      this.container_.classList.add(`amp-story-captions-${preset}`);
      createShadowRootWithStyle(this.element, this.container_, PRESETS_CSS);
    } else {
      this.element.appendChild(this.container_);
    }
    if (this.element.hasAttribute('auto-append')) {
      this.container_.classList.add(`i-amphtml-amp-story-captions-auto-append`);
    }
  }

  /** @override */
  isLayoutSupported(layout) {
    return isLayoutSizeDefined(layout) || layout === Layout_Enum.CONTAINER;
  }

  /**
   * Attaches caption rendering to a video element. Called from amp-video.
   * @param {!HTMLVideoElement} video
   */
  setVideoElement(video) {
    if (this.textTracksChangeUnlistener_) {
      this.textTracksChangeUnlistener_();
    }

    this.video_ = video;

    this.updateTracks_();
    this.textTracksChangeUnlistener_ = listen(
      video.textTracks,
      'change',
      () => {
        this.updateTracks_();
      }
    );
  }

  /**
   * Creates new track renderers for current textTracks.
   * @private
   */
  updateTracks_() {
    while (this.trackRenderers_.length) {
      this.trackRenderers_.pop().dispose();
    }

    toArray(this.video_.textTracks).forEach((track) => {
      // Render both showing and hidden, because otherwise we would need to remember when we set it to hidden.
      // Disabled tracks are ignored.
      if (track.mode === 'showing' || track.mode === 'hidden') {
        track.mode = 'hidden';
        this.trackRenderers_.push(
          new TrackRenderer(this.video_, track, this.container_)
        );
      }
    });
  }
}

AMP.extension('amp-story-captions', '0.1', (AMP) => {
  AMP.registerElement('amp-story-captions', AmpStoryCaptions, CSS);
});
