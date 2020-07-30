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
import {buildUrl, connectHostname} from './scroll-url';
import {dict} from '../../../src/utils/object';

/**
 * UI for Scroll users.
 *
 * Presents a fixed bar at the bottom of the screen with Scroll content.
 */
export class ScrollBar extends ScrollComponent {
  /**
   * @param {!../../../src/service/ampdoc-impl.AmpDoc} doc
   * @param {!../../amp-access/0.1/amp-access-source.AccessSource} accessSource
   */
  constructor(doc, accessSource) {
    super(doc);

    /** @protected */
    this.accessSource_ = accessSource;

    this.render_();
  }

  /** @private */
  render_() {
    this.mutate(() => {
      if (!this.frame_) {
        this.makeIframe_();
        this.setWindow_(this.frame_.contentWindow);
      }
      this.renderHorizontalLayout();
    });
  }

  /**
   * @protected
   * */
  makeIframe_() {
    this.frame_ = /** @type {!HTMLIFrameElement} */ (this.el(
      'iframe',
      dict({
        'scrolling': 'no',
        'frameborder': '0',
        'allowtransparency': 'true',
        'title': 'Scroll',
        'width': '100%',
        'height': '100%',
        'sandbox':
          'allow-scripts allow-same-origin ' +
          'allow-top-navigation allow-popups ' +
          'allow-popups-to-escape-sandbox',
      })
    ));

    this.root_ = this.el(
      'div',
      dict({
        'class': 'amp-access-scroll-bar',
      }),
      [this.frame_]
    );

    this.mount();

    // Set iframe to scrollbar URL.
    buildUrl(
      this.accessSource_,
      connectHostname(this.accessSource_.getAdapterConfig()) +
        '/html/amp/scrolltab'
    ).then((scrollbarUrl) => {
      this.frame_.setAttribute('src', scrollbarUrl);
    });
  }

  /**
   * @param {!JsonObject} action
   */
  update(action) {
    const changed = this.updateHorizontalLayout(action);

    if (changed) {
      this.render_();
    }
  }
}
