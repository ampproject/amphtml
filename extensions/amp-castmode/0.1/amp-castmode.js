/**
 * Copyright 2016 The AMP HTML Authors. All Rights Reserved.
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

import {CSS} from '../../../build/amp-castmode-0.1.css';
import {CastSenderDebug, CastSenderProd} from './cast-sender';
import {Layout} from '../../../src/layout';
import {historyFor} from '../../../src/history';
import {toArray} from '../../../src/types';
import {viewerFor} from '../../../src/viewer';
import * as st from '../../../src/style';


/** @enum {number} */
const Mode = {
  GALLERY: 1,
  VIEW: 2,
}


class AmpCastmode extends AMP.BaseElement {

  /** @override */
  isLayoutSupported(layout) {
    return layout == Layout.NODISPLAY;
  }

  /** @override */
  buildCallback() {
    /** @private {!Mode} */
    this.mode_ = Mode.GALLERY;

    /** @const @private {!Element} */
    this.container_ = this.element.ownerDocument.createElement('div');
    this.applyFillContent(this.container_);
    this.element.appendChild(this.container_);

    /** @const @private {!Element} */
    this.rcContainer_ = this.element.ownerDocument.createElement('div');
    this.rcContainer_.classList.add('-amp-cast-rc');
    this.applyFillContent(this.rcContainer_);
    this.container_.appendChild(this.rcContainer_);

    const createButton = (dir, handler) => {
      const button = this.element.ownerDocument.createElement('div');
      button.classList.add('-amp-cast-rc-action');
      button.classList.add('-amp-cast-rc-' + dir);
      this.rcContainer_.appendChild(button);
      const thisHandler = handler.bind(this);
      button.onclick = event => {
        event.stopPropagation();
        thisHandler();
      };
      return button;
    };
    /** @const @private {!Element} */
    this.prevButton_ = createButton('prev', this.handlePrev_);
    /** @const @private {!Element} */
    this.nextButton_ = createButton('next', this.handleNext_);
    /** @const @private {!Element} */
    this.upButton_ = createButton('up', this.handleUp_);

    this.rcContainer_.onclick = this.handleClick_.bind(this);

    /** @const @private {!Element} */
    this.viewSpace_ = this.element.ownerDocument.createElement('div');
    this.viewSpace_.classList.add('-amp-cast-view');
    this.applyFillContent(this.viewSpace_);
    this.container_.appendChild(this.viewSpace_);

    /** @const @private {!Element} */
    this.galleryContainer_ = this.element.ownerDocument.createElement('div');
    this.galleryContainer_.classList.add('-amp-cast-gallery-container');
    this.viewSpace_.appendChild(this.galleryContainer_);

    /** @const @private {!Element} */
    this.gallery_ = this.element.ownerDocument.createElement('div');
    this.gallery_.classList.add('-amp-cast-gallery');
    this.galleryContainer_.appendChild(this.gallery_);

    /** @const @private {!Element} */
    this.preview_ = this.element.ownerDocument.createElement('div');
    this.preview_.classList.add('-amp-cast-preview');
    this.viewSpace_.appendChild(this.preview_);

    /** @private {number} */
    this.selectedIndex_ = 0;

    this.registerAction('close', this.close.bind(this));

    /** @private {number} */
    this.historyId_ = -1;

    /** @private {boolean} */
    this.active_ = false;

    const startButton = this.win.document.createElement('button');
    startButton.classList.add('amp-castmode-button');
    startButton.textContent = 'CAST';
    startButton.disabled = true;
    this.win.document.body.appendChild(startButton);
    startButton.addEventListener('click', () => {
      this.activate();
    });

    const castDebugParam = viewerFor(this.win).getParam('castdebug');
    const castDebug = castDebugParam == '1';
    console.log('debug: ', castDebug);

    /** @private @const {!CastSender} */
    this.sender_ = castDebug ?
        new CastSenderDebug(this.win) :
        new CastSenderProd(this.win);
    const connectPromise = this.sender_.connect();
    connectPromise.then(() => {
      console.log('Connected!');
      startButton.disabled = false;
    });
  }

  /** @override */
  layoutCallback() {
    return Promise.resolve();
  }

  /** @override */
  activate() {
    if (this.active_) {
      return;
    }
    this.active_ = true;

    /**  @private {function(this:AmpCastmode, Event)}*/
    this.boundCloseOnEscape_ = this.closeOnEscape_.bind(this);
    this.win.document.documentElement.addEventListener(
        'keydown', this.boundCloseOnEscape_);
    this.getViewport().enterLightboxMode();

    this.mutateElement(() => {
      this.element.style.display = '';
    });

    this.getHistory_().push(this.close.bind(this)).then(historyId => {
      this.historyId_ = historyId;
    });

    this.sender_.startSession().then(() => {
      this.startCasting_();
    });
  }

  /**
   * Handles closing the castmode when the ESC key is pressed.
   * @param {!Event} event.
   * @private
   */
  closeOnEscape_(event) {
    if (event.keyCode == 27) {
      this.close();
    }
  }

  close() {
    if (!this.active_) {
      return;
    }
    this.getViewport().leaveLightboxMode();
    this.element.style.display = 'none';
    if (this.historyId_ != -1) {
      this.getHistory_().pop(this.historyId_);
    }
    this.win.document.documentElement.removeEventListener(
        'keydown', this.boundCloseOnEscape_);
    this.boundCloseOnEscape_ = null;
    this.active_ = false;
  }

  getHistory_() {
    return historyFor(this.element.ownerDocument.defaultView);
  }

  /** @private */
  startCasting_() {
    // TODO(dvoytenko): create a preview pane, a cursor and a remote control.

    this.sender_.sendAction('show-image', {
      src: 'https://lh3.googleusercontent.com/pSECrJ82R7-AqeBCOEPGPM9iG9OEIQ_QXcbubWIOdkY=w400-h300-no-n',
    });

    this.candidates_ = toArray(this.win.document.querySelectorAll(
        'amp-img,amp-video,amp-twitter,amp-youtube,blockquote'));
    console.log('candidates: ', this.candidates_.length, this.candidates_);
    this.thumbs_ = [];
    for (let i = 0; i < this.candidates_.length; i++) {
      const candidate = this.candidates_[i];
      const thumb = this.win.document.createElement('div');
      thumb.classList.add('-amp-cast-gallery-thumb');
      thumb.appendChild(this.createThumb_(candidate));
      if (this.isPlayback_(candidate)) {
        thumb.appendChild(this.createPlayThumb_());
      }
      this.gallery_.appendChild(thumb);
      this.thumbs_.push(thumb);
    }

    this.getVsync().mutate(() => {
      this.setMode_(Mode.GALLERY);
      this.setSelectedThumb_(0);
    });
  }

  /**
   * @param {!Mode} mode
   * @private
   */
  setMode_(mode) {
    this.mode_ = mode;
    st.toggleVisibility(this.galleryContainer_, mode == Mode.GALLERY);
    st.toggleVisibility(this.preview_, mode == Mode.VIEW);
  }

  /**
   * @param {number} index
   * @private
   */
  setSelectedThumb_(index) {
    console.log('setSelectedThumb_: ', index);
    this.thumbs_[this.selectedIndex_].classList.remove('-amp-selected');

    this.selectedIndex_ = index;
    const thumb = this.thumbs_[index];
    const width = thumb.offsetWidth;
    const height = thumb.offsetHeight;
    thumb.classList.add('-amp-selected');
    const offsetLeft = thumb.offsetLeft;
    const totalWidth = this.viewSpace_.offsetWidth;
    const tx = -offsetLeft + (totalWidth - width) / 2;
    this.gallery_.style.transform = `translateX(${tx}px)`;

    this.preview_.textContent = '';
    const previewThumb = (thumb.firstElementChild || thumb).cloneNode(true);
    this.preview_.appendChild(previewThumb);
    const scale = Math.max(this.container_.offsetWidth / width,
        this.container_.offsetHeight / height);
    console.log('scale: ', scale);
    previewThumb.style.transform = `scale(${scale})`;
  }

  /** @private */
  handlePrev_() {
    if (this.selectedIndex_ - 1 >= 0) {
      this.setSelectedThumb_(this.selectedIndex_ - 1);
    }
  }

  /** @private */
  handleNext_() {
    if (this.selectedIndex_ + 1 < this.candidates_.length) {
      this.setSelectedThumb_(this.selectedIndex_ + 1);
    }
  }

  /** @private */
  handleUp_() {
    switch (this.mode_) {
      case Mode.VIEW:
        this.setMode_(Mode.GALLERY);
        break;
    }
  }

  /** @private */
  handleClick_() {
    switch (this.mode_) {
      case Mode.GALLERY:
        this.setMode_(Mode.VIEW);
        break;
    }
  }

  /**
   * @param {!Element} element
   * @return {!Element}
   * @private
   */
  createThumb_(element) {
    let thumb = null;
    if (element.toThumbnail) {
      thumb = element.toThumbnail();
    }

    if (!thumb && element.tagName == 'BLOCKQUOTE') {
      const text = element.textContent;
      const snippet = text.length > 50 ? text.substring(0, 50) + '...' : text;
      thumb = document.createElement('div');
      thumb.textContent = `\u00AB${snippet}\u00BB`;
      thumb.style.width = '120px';
    }

    if (!thumb) {
      thumb = document.createElement('div');
      thumb.textContent = element.tagName;
      thumb.style.width = '120px';
    }
    return thumb;
  }

  /**
   * @param {!Element} element
   * @return {boolean}
   * @private
   */
  isPlayback_(element) {
    return (element.tagName == 'AMP-VIDEO'
        || element.tagName == 'AMP-YOUTUBE');
  }

  /**
   * @return {boolean}
   * @private
   */
  createPlayThumb_() {
    const div = document.createElement('div');
    div.classList.add('-amp-cast-play-thumb');
    return div;
  }
}


AMP.registerElement('amp-castmode', AmpCastmode, CSS);
