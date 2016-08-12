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

import {createThumb} from '../cast-elements';
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
    this.container_ = win.document.getElementById('container');
    if (!this.container_) {
      throw new Error('container not found');
    }

    /** @private {number} */
    this.galleryStartIndex_ = -1;

    /** @private {?Element} */
    this.selected_ = null;

    // Actions.
    channel.onAction('gallery', this.handleGallery_.bind(this));
    channel.onAction('show-image', this.handleShowImage_.bind(this));
  }

  /**
   * @param {!Object} payload
   */
  handleGallery_(payload) {
    log('show gallery: ', payload);
    const items = payload.items;

    const gallery = this.win.document.getElementById('gallery');
    const galleryContainer = this.win.document.getElementById('gallery-container');

    if (this.galleryStartIndex_ != payload.startIndex) {
      this.galleryStartIndex_ = payload.startIndex;
      galleryContainer.textContent = '';
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const el = createThumb(item);
        el.classList.add('gallery-item');
        galleryContainer.appendChild(el);
      }
    }

    const oldSelected = this.selected_;
    this.selected_ = galleryContainer.children[
        payload.selectedIndex - payload.startIndex];
    if (oldSelected != this.selected_) {
      if (oldSelected) {
        oldSelected.classList.remove('selected');
      }
      this.selected_.classList.add('selected');
    }

    st.toggle(gallery, true);
  }

  /**
   * @param {!Object} payload
   */
  handleShowImage_(payload) {
    const src = payload.src;
    log('show image: ' + src);

    const gallery = this.win.document.getElementById('gallery');
    st.toggle(gallery, false);

    // this.container_.textContent = '';

    const parent = this.win.document.createElement('div');
    parent.classList.add('flex-container');

    const img = this.win.document.createElement('img');
    img.style.width = '100%';
    img.style.height = '100%';
    img.style.objectFit = 'contain';
    img.src = src;

    parent.appendChild(img);
    this.container_.appendChild(parent);
  }

}
