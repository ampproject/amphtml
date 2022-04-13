import {removeChildren, removeElement} from '#core/dom';
import {toArray} from '#core/types/array';

import {listen} from '#utils/event-helper';

// Class used for sections of text in the future (for ASR-style captions).
const FUTURE_CUE_SECTION_CLASS = 'amp-story-captions-future';

/**
 * Parses a WebVTT timestamp and returns the time in seconds from video start.
 * https://www.w3.org/TR/webvtt1/#webvtt-timestamp
 * @param {string} timestamp
 * @return {?number}
 */
function parseTimestamp(timestamp) {
  const match = /^(?:(\d{2,}):)?(\d{2}):(\d{2})\.(\d{3})$/.exec(timestamp);
  if (!match) {
    return null;
  }
  const hours = match[1] ? parseInt(match[1], 10) : 0;
  const minutes = parseInt(match[2], 10);
  const seconds = parseInt(match[3], 10);
  const milliseconds = parseInt(match[4], 10);
  return hours * 3600 + minutes * 60 + seconds + milliseconds / 1000;
}

export class TrackRenderer {
  /**
   *
   * @param {!HTMLVideoElement} video
   * @param {!TextTrack} track
   * @param {!Element} container
   */
  constructor(video, track, container) {
    /** @private {!HTMLVideoElement} */
    this.video_ = video;

    /** @private {?TextTrack} */
    this.track_ = track;

    /** @private {!Element} */
    this.element_ = container.ownerDocument.createElement('div');
    container.appendChild(this.element_);
    this.element_.classList.add('amp-story-captions-cue-wrapper');

    /** @private {!Array<number>} */
    this.cueTimestamps_ = [];

    this.render_();
    this.cueChangeUnlistener_ = listen(track, 'cuechange', () => {
      this.render_();
    });
    this.timeUpdateUnlistener_ = listen(video, 'timeupdate', () => {
      this.updateTime_();
    });
  }

  /**
   * Cleans up listeners and DOM elements.
   */
  dispose() {
    this.cueChangeUnlistener_();
    this.timeUpdateUnlistener_();
    removeElement(this.element_);
    this.video_ = null;
    this.track_ = null;
  }

  /**
   * Render currently active cues.
   * @private
   */
  render_() {
    removeChildren(this.element_);
    this.cueTimestamps_.length = 0;
    toArray(this.track_.activeCues).forEach((cue) => {
      const cueElement = this.element_.ownerDocument.createElement('div');
      cueElement.classList.add('amp-story-captions-cue');
      const html = cue.getCueAsHTML();
      let section = this.element_.ownerDocument.createElement('span');
      cueElement.appendChild(section);
      const timestamps = [];
      toArray(html.childNodes).forEach((node) => {
        if (node.target === 'timestamp') {
          const timestamp = parseTimestamp(node.data);
          if (timestamp !== null) {
            timestamps.push(timestamp);
            // Create a new section after each timestamp, so the style can
            // easily be updated based on time.
            section = this.element_.ownerDocument.createElement('span');
            cueElement.appendChild(section);
          }
        } else {
          section.appendChild(node);
        }
      });

      this.cueTimestamps_.push(timestamps);
      this.element_.appendChild(cueElement);
    });
    this.updateTime_();
  }

  /**
   * Update cue style based on the current video time (for ASR-style captions).
   * @private
   */
  updateTime_() {
    const videoTime = this.video_.currentTime;
    toArray(this.element_.childNodes).forEach((cue, i) => {
      toArray(cue.childNodes).forEach((section, j) => {
        // The first section always has implicit timestamp 0, so it's never in
        // the future.
        if (j > 0) {
          section.classList.toggle(
            FUTURE_CUE_SECTION_CLASS,
            this.cueTimestamps_[i][j - 1] > videoTime
          );
        }
      });
    });
  }
}
