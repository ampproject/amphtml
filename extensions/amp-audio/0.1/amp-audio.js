/**
 * Copyright 2015 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {
  EMPTY_METADATA,
  parseFavicon,
  parseOgImage,
  parseSchemaImage,
  setMediaSession,
} from '../../../src/mediasession-helper';
import {Layout} from '../../../src/layout';
import {assertHttpsUrl} from '../../../src/url';
import {closestAncestorElementBySelector} from '../../../src/dom';
import {dev, user} from '../../../src/log';
import {getMode} from '../../../src/mode';
import {listen} from '../../../src/event-helper';

const TAG = 'amp-audio';

/**
 * Visible for testing only.
 */
export class AmpAudio extends AMP.BaseElement {
  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {?Element} */
    this.audio_ = null;

    /** @private {!../../../src/mediasession-helper.MetadataDef} */
    this.metadata_ = EMPTY_METADATA;

    /** @public {boolean} */
    this.isPlaying = false;
  }

  /** @override */
  isLayoutSupported(layout) {
    return layout == Layout.FIXED || layout == Layout.FIXED_HEIGHT;
  }

  /** @override */
  buildCallback() {
    // If layout="nodisplay" force autoplay to off
    const layout = this.getLayout();
    if (layout === Layout.NODISPLAY) {
      this.element.removeAttribute('autoplay');
      this.buildAudioElement();
    }

    this.registerAction('play', this.play_.bind(this));
    this.registerAction('pause', this.pause_.bind(this));
  }

  /**
   * Builds the internal <audio> element
   */
  buildAudioElement() {
    const audio = this.element.ownerDocument.createElement('audio');
    if (!audio.play) {
      this.toggleFallback(true);
      return Promise.resolve();
    }

    // Force controls otherwise there is no player UI.
    audio.controls = true;
    const src = this.getElementAttribute_('src');
    if (src) {
      assertHttpsUrl(src, this.element);
    }
    this.propagateAttributes(
      [
        'src',
        'preload',
        'autoplay',
        'muted',
        'loop',
        'aria-label',
        'aria-describedby',
        'aria-labelledby',
        'controlsList',
      ],
      audio
    );

    this.applyFillContent(audio);
    this.getRealChildNodes().forEach(child => {
      if (child.getAttribute && child.getAttribute('src')) {
        assertHttpsUrl(child.getAttribute('src'), dev().assertElement(child));
      }
      audio.appendChild(child);
    });
    this.element.appendChild(audio);
    this.audio_ = audio;

    listen(this.audio_, 'playing', () => this.audioPlaying_());
  }

  /** @override */
  layoutCallback() {
    const layout = this.getLayout();
    if (layout !== Layout.NODISPLAY) {
      this.buildAudioElement();
    }

    // Gather metadata
    const {document} = this.getAmpDoc().win;
    const artist = this.getElementAttribute_('artist') || '';
    const title =
      this.getElementAttribute_('title') ||
      this.getElementAttribute_('aria-label') ||
      document.title ||
      '';
    const album = this.getElementAttribute_('album') || '';
    const artwork =
      this.getElementAttribute_('artwork') ||
      parseSchemaImage(document) ||
      parseOgImage(document) ||
      parseFavicon(document) ||
      '';
    this.metadata_ = {
      title,
      artist,
      album,
      artwork: [{src: artwork}],
    };

    // Resolve layoutCallback right away if the audio won't preload.
    if (this.element.getAttribute('preload') === 'none') {
      return this.audio_;
    }

    return this.loadPromise(this.audio_);
  }

  /** @override */
  renderOutsideViewport() {
    return true;
  }

  /**
   * Returns the value of the attribute specified
   * @param {string} attr
   * @return {string}
   */
  getElementAttribute_(attr) {
    return this.element.getAttribute(attr);
  }

  /** @override */
  pauseCallback() {
    if (this.audio_) {
      this.audio_.pause();
      this.setPlayingStateForTesting_(false);
    }
  }

  /**
   * Checks if the function is allowed to be called
   * @return {boolean}
   */
  isInvocationValid_() {
    if (!this.audio_) {
      return false;
    }
    if (this.isStoryDescendant_()) {
      user().warn(
        TAG,
        '<amp-story> elements do not support actions on ' +
          '<amp-audio> elements'
      );
      return false;
    }
    return true;
  }

  /**
   * Pause action for <amp-audio>.
   */
  pause_() {
    if (!this.isInvocationValid_()) {
      return;
    }
    this.audio_.pause();
    this.setPlayingStateForTesting_(false);
  }

  /**
   * Play action for <amp-audio>.
   */
  play_() {
    if (!this.isInvocationValid_()) {
      return;
    }
    this.audio_.play();
    this.setPlayingStateForTesting_(true);
  }

  /**
   * Sets whether the audio is playing or not.
   * @param {boolean} isPlaying
   * @private
   */
  setPlayingStateForTesting_(isPlaying) {
    if (getMode().test) {
      this.isPlaying = isPlaying;
    }
  }

  /**
   * Returns whether `<amp-audio>` has an `<amp-story>` for an ancestor.
   * @return {?Element}
   * @private
   */
  isStoryDescendant_() {
    return closestAncestorElementBySelector(this.element, 'AMP-STORY');
  }

  /** @private */
  audioPlaying_() {
    const playHandler = () => {
      this.audio_.play();
      this.setPlayingStateForTesting_(true);
    };
    const pauseHandler = () => {
      this.audio_.pause();
      this.setPlayingStateForTesting_(false);
    };

    // Update the media session
    setMediaSession(
      this.element,
      this.win,
      this.metadata_,
      playHandler,
      pauseHandler
    );
  }
}

AMP.extension(TAG, '0.1', AMP => {
  AMP.registerElement(TAG, AmpAudio);
});
