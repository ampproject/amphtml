/**
 * Copyright 2019 The AMP HTML Authors. All Rights Reserved.
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
import {dict} from '../../../src/utils/object';
import {toggle} from '../../../src/style';

/** Provides iframe for the Scroll Audio Player. */
export class Audio extends ScrollComponent {
  /**
   *  Creates an instance of Audio.
   *
   * @param {!../../../src/service/ampdoc-impl.AmpDoc} doc
   */
  constructor(doc) {
    super(doc);
    /** @private {!Audio.State} */
    this.state_ = {
      url: '',
      open: false,
    };
  }
  /**
   * @param {!JsonObject} action
   */
  update(action) {
    this.state_ = {
      url: action['url'] !== undefined ? action['url'] : this.state_.url,
      open: action['open'],
    };

    this.render_(this.state_);
  }

  /**
   * @param {!Audio.State} state
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
        'class': 'amp-access-scroll-audio',
        'scrolling': 'no',
        'frameborder': '0',
        'allowtransparency': 'true',
        'title': 'Scroll Audio',
        'sandbox':
          'allow-scripts allow-same-origin ' +
          'allow-top-navigation allow-popups ' +
          'allow-popups-to-escape-sandbox',
      })
    );

    this.mount_(frame);
    return /** @type {!HTMLIFrameElement} */ (frame);
  }
}

/**
 * @typedef {{
 *    open: boolean,
 *    url: string
 * }}
 */
Audio.State;
