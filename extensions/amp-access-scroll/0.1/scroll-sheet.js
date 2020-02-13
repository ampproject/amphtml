/**
 * Copyright 2020 The AMP HTML Authors. All Rights Reserved.
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

import {ScrollComponent} from './scroll-component';
import {dict, hasOwn} from '../../../src/utils/object';
import {toggle} from '../../../src/style';

/** Provides iframe for the Scroll Audio Player. */
export class Sheet extends ScrollComponent {
  /**
   *  Creates an instance of Audio.
   *
   * @param {!../../../src/service/ampdoc-impl.AmpDoc} doc
   * @param {boolean} holdback
   */
  constructor(doc, holdback = true) {
    super(doc);
    /** @private {!Sheet.State} */
    this.state_ = {
      url: '',
      open: false,
      holdback,
    };

    this.updateHorizontalLayout({
      ['width']: this.cssSize(475),
      ['right']: this.cssSize(16),
      ['left']: 'auto',
    });
  }
  /**
   * @param {!JsonObject} action
   */
  update(action) {
    let changed = false;

    switch (action['_scramp']) {
      case 'au':
        changed = this.updateHorizontalLayout(action);
        // update state atoms other than layout
        Object.keys(this.state_).forEach(key => {
          if (key === 'layout' || !hasOwn(action, key)) {
            return;
          }
          const val = action[key];

          if (this.state_[key] !== val) {
            this.state_[key] = val;
            changed = true;
          }
        });
        break;
      case 'st':
        if (action['revealed'] === false && this.state_.open) {
          this.state_.open = false;
          changed = true;
        }
        break;
    }

    if (changed) {
      this.render_(this.state_);
    }
  }

  /**
   * @param {!Sheet.State} state
   * @private
   */
  render_(state) {
    this.mutate_(() => {
      if (!this.frame_) {
        this.frame_ = this.makeIframe_();
        this.setWindow_(this.frame_.contentWindow);
      }

      if (this.frame_.src !== state.url) {
        this.frame_.setAttribute('src', state.url);
      }
      this.renderHorizontalLayout(this.frame_);
      toggle(this.frame_, state.open);
    });
  }

  /**
   * @return {!HTMLIFrameElement}
   * @private
   * */
  makeIframe_() {
    const frame = this.el(
      'iframe',
      dict({
        'class': 'amp-access-scroll-sheet',
        'scrolling': 'no',
        'frameborder': '0',
        'allowtransparency': 'true',
        'title': 'Scroll Feature',
        'sandbox':
          'allow-scripts allow-same-origin ' +
          'allow-top-navigation allow-popups ' +
          'allow-popups-to-escape-sandbox',
      })
    );
    if (this.state_.holdback) {
      frame.classList.add(this.HOLDBACK_CLASS);
    }
    this.mount_(frame);
    return /** @type {!HTMLIFrameElement} */ (frame);
  }
}

/**
 * @typedef {{
 *    open: boolean,
 *    url: string,
 *    holdback: boolean
 * }}
 */
Sheet.State;
