import {Layout_Enum, isLayoutSizeDefined} from '#core/dom/layout';
import {toArray} from '#core/types/array';

import {listen} from '#utils/event-helper';

import {TrackRenderer} from './track-renderer';

import {CSS} from '../../../build/amp-story-captions-0.1.css';

export class AmpStoryCaptions extends AMP.BaseElement {
  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {?Element} */
    this.container_ = null;

    /** @private {?HTMLMediaElement} */
    this.mediaElement_ = null;

    /** @private {?UnlistenDef} */
    this.textTracksChangeUnlistener_ = null;

    /** @private {!Array<!TrackRenderer>} */
    this.trackRenderers_ = [];
  }

  /** @override */
  buildCallback() {
    this.container_ = this.element.ownerDocument.createElement('div');
    this.element.appendChild(this.container_);
  }

  /** @override */
  isLayoutSupported(layout) {
    return isLayoutSizeDefined(layout) || layout === Layout_Enum.CONTAINER;
  }

  /**
   * Attaches caption rendering to a video element. Called from amp-video.
   * @param {!HTMLMediaElement} mediaEl
   */
  setMediaElement(mediaEl) {
    if (this.textTracksChangeUnlistener_) {
      this.textTracksChangeUnlistener_();
    }

    this.mediaElement_ = mediaEl;

    this.updateTracks_();
    this.textTracksChangeUnlistener_ = listen(
      mediaEl.textTracks,
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

    toArray(this.mediaElement_.textTracks).forEach((track) => {
      // Render both showing and hidden, because otherwise we would need to remember when we set it to hidden.
      // Disabled tracks are ignored.
      if (track.mode === 'showing' || track.mode === 'hidden') {
        track.mode = 'hidden';
        this.trackRenderers_.push(
          new TrackRenderer(this.mediaElement_, track, this.container_)
        );
      }
    });
  }
}

AMP.extension('amp-story-captions', '0.1', (AMP) => {
  AMP.registerElement('amp-story-captions', AmpStoryCaptions, CSS);
});
