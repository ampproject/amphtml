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

import {PROTOCOL_VERSION} from './scroll-protocol';
import {ScrollComponent} from './scroll-component';
import {dict} from '../../../src/utils/object';

/**
 * UI for Scroll users.
 *
 * Presents a fixed bar at the bottom of the screen with Scroll content.
 * @abstract
 */
class Bar extends ScrollComponent {
  /**
   * @param {!../../../src/service/ampdoc-impl.AmpDoc} doc
   * @param {!../../amp-access/0.1/amp-access-source.AccessSource} accessSource
   * @param {string} baseUrl
   * @param {boolean} holdback
   */
  constructor(doc, accessSource, baseUrl, holdback) {
    super(doc, holdback);

    /** @protected */
    this.accessSource_ = accessSource;

    /** @protected */
    this.baseUrl_ = baseUrl;

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

    this.toggleClass(this.HOLDBACK_CLASS, this.holdback_);
    this.mount();
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

export class ScrollUserBar extends Bar {
  /**
   * Load the scrollbar URL in the iframe.
   * @protected
   * @override
   * */
  makeIframe_() {
    Bar.prototype.makeIframe_.call(this);
    // Set iframe to scrollbar URL.
    this.accessSource_
      .buildUrl(
        `${this.baseUrl_}/html/amp/${
          this.holdback_ ? 'scrollbar' : 'scrolltab'
        }` +
          '?rid=READER_ID' +
          '&cid=CLIENT_ID(scroll1)' +
          '&c=CANONICAL_URL' +
          '&o=AMPDOC_URL' +
          `&p=${PROTOCOL_VERSION}`,
        false
      )
      .then(scrollbarUrl => {
        this.frame_.setAttribute('src', scrollbarUrl);
      });
  }
}
/**
 * Add link to the Scroll App connect page.
 */
export class ActivateBar extends Bar {
  /**
   * @protected
   * @override
   * */
  makeIframe_() {
    Bar.prototype.makeIframe_.call(this);

    this.accessSource_
      .buildUrl(
        `${this.baseUrl_}/html/amp/activate` +
          '?rid=READER_ID' +
          '&cid=CLIENT_ID(scroll1)' +
          '&c=CANONICAL_URL' +
          '&o=AMPDOC_URL' +
          '&x=QUERY_PARAM(scrollx)' +
          `&p=${PROTOCOL_VERSION}`,
        false
      )
      .then(url => {
        this.frame_.setAttribute('src', url);
      });
  }
}
