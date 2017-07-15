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
    this.floatingControls_ = null;

    /** @private {boolean} */
    this.scrollListenerInstalled_ = false;

    /** @private {?UnlistenDef} */
    this.playingUnlistener_ = null;

    /** @private {?UnlistenDef} */
    this.pauseUnlistener_ = null;

    /** @private {boolean} */
    this.hasFpb_ = this.element.hasAttribute('floating-controls');
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
    if (!this.scrollListenerInstalled_ && this.hasFpb_) {
      const scrollListener = () => {
        const change = this.element.getIntersectionChangeEntry();
        const ratio = change.intersectionRatio;
        const visible = isFiniteNumber(ratio) && ratio != 0;
        if (visible) {
          this.removefloatingControls_();
        } else if (!this.audio_.paused) {
          this.createfloatingControls_(this.audio_);
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
  createfloatingControls_(audio) {
    if (this.floatingControls_) {
      return;
    }
    const doc = this.element.ownerDocument;
    const btn = doc.createElement('div');
    btn.classList.add('amp-audio-floating-controls');
    // Pause/Play icon
    const pauseBtn = doc.createElement('div');
    pauseBtn.classList.add('amp-audio-floating-controls-pause');
    pauseBtn.classList.toggle('pause', audio.paused);
    pauseBtn.classList.toggle('play', !audio.paused);
    // Scroll to element icon
    // (Different icon based on whether the original element is above or
    // below the viewport)
    const inlineBtn = doc.createElement('div');
    const viewportTop = this.getViewport().getScrollTop();
    const isTop = viewportTop > this.element./*OK*/offsetTop;
    inlineBtn.classList.toggle('top', isTop);
    inlineBtn.classList.toggle('bottom', !isTop);
    inlineBtn.classList.add('amp-audio-floating-controls-inline');
    btn.appendChild(pauseBtn);
    btn.appendChild(inlineBtn);
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
    this.popIn_(btn);

    listen(dev().assertElement(pauseBtn), 'click', () => {
      if (audio.paused) {
        audio.play();
      } else {
        audio.pause();
      }
      this.pop_(btn);
    });

    listen(dev().assertElement(inlineBtn), 'click', () => {
      this.getViewport().animateScrollIntoView(audio, 500, 'ease-in', 'center');
    });

    // Style the button based on whether the audio is paused or not
    this.playingUnlistener_ = listen(dev().assertElement(this.audio_),
        'playing', () => {
          pauseBtn.classList.toggle('pause', false);
          pauseBtn.classList.toggle('play', true);
        });

    this.pauseUnlistener_ = listen(dev().assertElement(this.audio_),
        'pause', () => {
          pauseBtn.classList.toggle('pause', true);
          pauseBtn.classList.toggle('play', false);
        });

    this.pauseUnlistener_ = listen(dev().assertElement(this.audio_),
        'ended', () => {
          pauseBtn.classList.toggle('pause', true);
          pauseBtn.classList.toggle('play', false);
        });

    this.floatingControls_ = btn;
  }

  /** @private */
  removefloatingControls_() {
    if (!this.floatingControls_) {
      return;
    }
    const btn = this.floatingControls_;

    // Button pops out
    this.popOut_(btn).thenAlways(() => {
      removeElement(btn);
    });

    this.playingUnlistener_();
    this.pauseUnlistener_();

    this.floatingControls_ = null;
  }

  /**
  @param {!Node} node
  @return {!Object}
  @private
  */
  pop_(node) {
    const anim = new Animation(node);
    anim.add(0, tr.setStyles(dev().assertElement(node), {
      'transform': tr.scale(tr.numeric(1, 1.3)),
    }), 0.5);
    anim.add(0.5, tr.setStyles(dev().assertElement(node), {
      'transform': tr.scale(tr.numeric(1.3, 1)),
    }), 0.5);
    return anim.start(300);
  }

  /**
  @param {!Node} node
  @return {!Object}
  @private
  */
  popIn_(node) {
    const anim = new Animation(node);
    anim.add(0, tr.setStyles(dev().assertElement(node), {
      'transform': tr.scale(tr.numeric(0, 1.3)),
    }), 0.5);
    anim.add(0.5, tr.setStyles(dev().assertElement(node), {
      'transform': tr.scale(tr.numeric(1.3, 1)),
    }), 0.5);
    return anim.start(300);
  }

  /**
  @param {!Node} node
  @return {!Object}
  @private
  */
  popOut_(node) {
    const anim = new Animation(node);
    anim.add(0, tr.setStyles(dev().assertElement(node), {
      'transform': tr.scale(tr.numeric(1, 1.3)),
    }), 0.5);
    anim.add(0.5, tr.setStyles(dev().assertElement(node), {
      'transform': tr.scale(tr.numeric(1.3, 0)),
    }), 0.5);
    return anim.start(300);
  }
}

AMP.registerElement('amp-audio', AmpAudio, CSS);
