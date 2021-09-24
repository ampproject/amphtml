import {applyFillContent, isLayoutSizeDefined} from '#core/dom/layout';
import {toArray} from '#core/types/array';

import {TrackRenderer} from './track-renderer';

import {CSS} from '../../../build/amp-story-captions-0.1.css';
import {listen} from '../../../src/event-helper';

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
    this.container_ = this.element.ownerDocument.createElement('div');
    this.element.appendChild(this.container_);
    applyFillContent(this.container_, /* replacedContent */ true);
  }

  /** @override */
  isLayoutSupported(layout) {
    return isLayoutSizeDefined(layout);
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

  /** Creates new track renderers for current textTracks. */
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
