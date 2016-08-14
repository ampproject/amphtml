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

import {
  IframeViewController,
  ImageViewController,
  TextViewController,
  VideoViewController,
  YoutubeViewController,
} from './view-controller';
import {createPauseOverlay, createPlayOverlay, createThumb} from '../cast-elements';
import {log} from './cast-log';
import * as st from '../../../../src/style';


/**
 */
export class App {
  constructor(win, channel) {
    /** @const {!Window} */
    this.win = win;

    /** @const {!CastChannel} */
    this.channel = channel;

    /** @private @const {!Element} */
    this.root_ = win.document.getElementById('root');

    /** @private @const {!Element} */
    this.container_ = win.document.getElementById('container');
    if (!this.container_) {
      throw new Error('container not found');
    }

    /** @private @const {!Element} */
    this.prevIndicator_ = win.document.getElementById('prev-indicator');

    /** @private @const {!Element} */
    this.nextIndicator_ = win.document.getElementById('next-indicator');

    st.toggle(this.prevIndicator_, false);
    st.toggle(this.nextIndicator_, false);

    /** @private @const {!Element} */
    this.gallery_ = win.document.getElementById('gallery');

    /** @private @const {!Element} */
    this.galleryContainer_ = win.document.getElementById('gallery-container');

    /** @private @const {!Element} */
    this.view_ = win.document.getElementById('view');

    /** @private {number} */
    this.galleryStartIndex_ = -1;

    /** @private {?Element} */
    this.selected_ = null;

    /** @private {?CastInfo} */
    this.shown_ = null;

    /** @private {?ViewController} */
    this.viewController_ = null;

    // Actions.
    channel.onAction('article', this.handleArticle_.bind(this));
    channel.onAction('gallery', this.handleGallery_.bind(this));
    channel.onAction('view', this.handleView_.bind(this));
    channel.onAction('playstate', this.handlePlayState_.bind(this));
  }

  /**
   * @param {!Object} payload
   */
  handleArticle_(payload) {
    if (!payload.debug) {
      document.getElementById('log').style.display = 'none';
    }
    this.root_.style.backgroundColor = payload.themeColor || '';
    document.getElementById('logo').src = payload.logo || '';
    document.getElementById('bg').style.backgroundImage =
        payload.preview ?
        `url(${payload.preview})` :
        '';
  }

  /**
   * @param {!Object} payload
   */
  handleGallery_(payload) {
    log('show gallery: ', payload);
    const items = payload.items;

    if (this.galleryStartIndex_ != payload.startIndex) {
      this.galleryStartIndex_ = payload.startIndex;
      this.galleryContainer_.textContent = '';
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const el = this.createThumb_(item);
        this.galleryContainer_.appendChild(el);
      }
    }

    const oldSelected = this.selected_;
    this.selected_ = this.galleryContainer_.children[
        payload.selectedIndex - payload.startIndex];
    if (oldSelected != this.selected_) {
      if (oldSelected) {
        oldSelected.classList.remove('selected');
      }
      this.selected_.classList.add('selected');
    }

    st.toggle(this.gallery_, true);
    st.toggle(this.view_, false);
    st.toggle(this.prevIndicator_, payload.hasPrev);
    st.toggle(this.nextIndicator_, payload.hasNext);
  }

  /**
   * @param {!Object} payload
   */
  handleView_(payload) {
    log('view item: ' + payload);
    const item = payload.item;
    const autoplay = payload.autoplay;

    st.toggle(this.gallery_, false);
    st.toggle(this.view_, true);

    if (this.shown_ && item.id == this.shown_.id) {
      return;
    }

    if (this.viewController_) {
      this.viewController_.dispose();
      this.viewController_ = null;
    }

    this.shown_ = item;
    this.viewController_ = this.createViewController_(item);
    this.viewController_.onPlayStateChanged(this.playStateChanged_.bind(this));
    this.view_.textContent = '';
    this.view_.appendChild(this.viewController_.getElement());
    if (autoplay) {
      this.viewController_.play();
    }
  }

  /**
   * @param {!Object} payload
   */
  handlePlayState_(payload) {
    const playing = payload.playing;
    log('play state: ' + playing);
    if (this.viewController_) {
      if (playing) {
        this.viewController_.play();
      } else {
        this.viewController_.pause();
      }
    }
  }

  /**
   * @param {...} state
   * @private
   */
  playStateChanged_(state) {
    // TODO
  }

  /**
   * @param {!CastInfo} item
   * @return {!ViewController}
   */
  createViewController_(item) {

    if (item.type == 'BLOCKQUOTE') {
      return new TextViewController({text: item.source});
    }
    if (item.type == 'IMG') {
      return new ImageViewController({src: item.source});
    }
    if (item.type == 'VIDEO') {
      return new VideoViewController({src: item.source});
    }
    if (item.type == 'YOUTUBE') {
      return new YoutubeViewController({videoId: item.source});
    }
    if (item.type == 'TWITTER') {
      // XXX: source: this.element.getAttribute('data-tweetID'),
      /*
<blockquote class="twitter-tweet" data-lang="en">
  <p lang="en" dir="ltr">We are all witnesses <a href="https://t.co/f6buxJO9sk">pic.twitter.com/f6buxJO9sk</a></p>&mdash; Deadspin (@Deadspin) <a href="https://twitter.com/Deadspin/status/764272526516187136">August 13, 2016</a></blockquote>
<script async src="//platform.twitter.com/widgets.js" charset="utf-8"></script>
      */
      return new IframeViewController({src: 'XXX'});
    }

    return new TextViewController({text: 'Unknown'});
  }

  /**
   * @param {!CastInfo} item
   * @return {!Element}
   */
  createThumb_(item) {
    const thumb = createThumb(item);
    const wrapper = document.createElement('div');
    wrapper.classList.add('gallery-item');
    wrapper.appendChild(thumb);
    if (item.playable) {
      wrapper.appendChild(createPlayOverlay(80));
    }
    return wrapper;
  }
}
