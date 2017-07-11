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

import {Layout} from '../../../src/layout';
import {assertHttpsUrl} from '../../../src/url';
import {dev} from '../../../src/log';
import {listen} from '../../../src/event-helper';
import {
  EMPTY_METADATA,
  parseSchemaImage,
  parseOgImage,
  parseFavicon,
  setMediaSession,
} from '../../../src/mediasession-helper';
import {isFiniteNumber} from '../../../src/types';
import {removeElement} from '../../../src/dom.js';
import {Animation} from '../../../src/animation';
import * as tr from '../../../src/transition';
import {
  TapRecognizer,
  DoubletapRecognizer,
} from '../../../src/gesture-recognizers';
import {Gestures} from '../../../src/gesture';
import {CSS} from '../../../build/amp-audio-0.1.css';

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

    /** @private {?Element} */
    this.floatingMuteBtn_ = null;

    /** @private {boolean} */
    this.scrollListenerInstalled_ = false;

    /** @private {?UnlistenDef} */
    this.volumeChangeUnlistener_ = null;

    /** @private {boolean} */
    this.hasFmb_ = this.element.hasAttribute('floating-mute-button');
  }

  /** @override */
  isLayoutSupported(layout) {
    return layout == Layout.FIXED || layout == Layout.FIXED_HEIGHT;
  }


  /** @override */
  layoutCallback() {
    const audio = this.element.ownerDocument.createElement('audio');
    if (!audio.play) {
      this.toggleFallback(true);
      return Promise.resolve();
    }

    // Force controls otherwise there is no player UI.
    audio.controls = true;
    if (this.element.getAttribute('src')) {
      assertHttpsUrl(this.element.getAttribute('src'), this.element);
    }
    this.propagateAttributes(
        ['src', 'autoplay', 'muted', 'loop', 'aria-label',
          'aria-describedby', 'aria-labelledby'],
        audio);

    this.applyFillContent(audio);
    this.getRealChildNodes().forEach(child => {
      if (child.getAttribute && child.getAttribute('src')) {
        assertHttpsUrl(child.getAttribute('src'),
            dev().assertElement(child));
      }
      audio.appendChild(child);
    });
    this.element.appendChild(audio);
    this.audio_ = audio;

    // Gather metadata
    const doc = this.getAmpDoc().win.document;
    const artist = this.element.getAttribute('artist');
    const title = this.element.getAttribute('title')
                  || this.element.getAttribute('aria-label')
                  || doc.title;
    const album = this.element.getAttribute('album');
    const poster = this.element.getAttribute('poster')
                   || parseSchemaImage(doc)
                   || parseOgImage(doc)
                   || parseFavicon(doc);
    this.metadata_ = {
      'title': title || '',
      'artist': artist || '',
      'album': album || '',
      'artwork': [
        {'src': poster || ''},
      ],
    };

    listen(this.audio_, 'playing', () => this.audioPlaying_());

    // Activate the floating mute button
    if (!this.scrollListenerInstalled_ && this.hasFmb_) {
      const scrollListener = () => {
        const change = this.element.getIntersectionChangeEntry();
        const ratio = change.intersectionRatio;
        const visible = isFiniteNumber(ratio) && ratio != 0;
        if (visible) {
          this.removeFloatingMuteBtn_();
        } else if (!this.audio_.paused) {
          this.createFloatingMuteBtn_(this.audio_);
        }
      };
      this.getViewport().onScroll(scrollListener);
      this.scrollListenerInstalled_ = true;
    }

    return this.loadPromise(audio);
  }

  /** @override */
  pauseCallback() {
    if (this.audio_) {
      this.audio_.pause();
    }
  }

  audioPlaying_() {
    const playHandler = () => {
      this.audio_.play();
    };
    const pauseHandler = () => {
      this.audio_.pause();
    };

    // Update the media session
    setMediaSession(
        this.getAmpDoc().win,
        this.metadata_,
        playHandler,
        pauseHandler
    );

  /** @private */
  createFloatingMuteBtn_(audio) {
    if (this.floatingMuteBtn_) {
      return;
    }
    const doc = this.element.ownerDocument;
    const btn = doc.createElement('div');
    btn.classList.add('amp-audio-floating-mute-btn');
    this.element.ownerDocument.body.appendChild(btn);

    // Different positioning based on page direction
    const pageDir = doc.body.getAttribute('dir')
                      || doc.documentElement.getAttribute('dir')
                      || 'ltr';

    btn.classList.toggle('rtl', pageDir != 'ltr');

    // Raise the button if a sticky ad exists
    const stickyadexists = doc.querySelector('amp-sticky-ad');
    btn.classList.toggle('sticky-ad-exists', !!stickyadexists);

    // Button pops in
    const anim = new Animation(btn);
    anim.add(0, tr.setStyles(dev().assertElement(btn), {
      'transform': tr.scale(tr.numeric(0, 1.5)),
    }), 0.5);
    anim.add(0.5, tr.setStyles(dev().assertElement(btn), {
      'transform': tr.scale(tr.numeric(1.5, 1)),
    }), 0.5);
    anim.start(300);

    const gestures = Gestures.get(btn);

    // Single tap toggles audio mute/unmute
    gestures.onGesture(TapRecognizer, () => {
      audio.muted = !audio.muted;
    });

    // Double-tap scrolls back to the element's position on the page
    gestures.onGesture(DoubletapRecognizer, () => {
      this.getViewport().animateScrollIntoView(audio);
    });

    // Change style when button is clicked (provides feedback since gestures
    // are a bit slow)
    listen(dev().assertElement(btn),
        'touchstart', () => {
          btn.classList.toggle('active', true);
        });
    listen(dev().assertElement(btn),
        'touchend', () => {
          setTimeout(() => {
            btn.classList.toggle('active', false);
          }, 300);
        });


    // Style the button based on whether the audio is muted or not
    this.volumeChangeUnlistener_ = listen(dev().assertElement(this.audio_),
        'volumechange', () => {
          btn.classList.toggle('mute', audio.muted);
          btn.classList.toggle('unmute', !audio.muted);
        });

    btn.classList.toggle('mute', audio.muted);
    btn.classList.toggle('unmute', !audio.muted);

    this.floatingMuteBtn_ = btn;
  }

  /** @private */
  removeFloatingMuteBtn_() {
    if (!this.floatingMuteBtn_) {
      return;
    }
    const btn = this.floatingMuteBtn_;

    // Button pops out
    const anim = new Animation(btn);
    anim.add(0, tr.setStyles(dev().assertElement(btn), {
      'transform': tr.scale(tr.numeric(1, 1.5)),
    }), 0.5);
    anim.add(0.5, tr.setStyles(dev().assertElement(btn), {
      'transform': tr.scale(tr.numeric(1.5, 0)),
    }), 0.5);
    anim.start(300).thenAlways(() => {
      removeElement(btn);
    });

    this.volumeChangeUnlistener_();

    this.floatingMuteBtn_ = null;
  }
}

AMP.registerElement('amp-audio', AmpAudio, CSS);
