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

/**
 * @fileoverview Embeds an AddThis widget.
 * The data-pubId and data-widgetId can be found easily in the AddThis dashboard at addthis.com.
 * Example:
 * <code>
 * <amp-addthis
 *   width="320"
 *   height="92"
 *   layout="responsive"
 *   data-pubId="ra-59c2c366435ef478"
 *   data-widgetId="0fyg">
 * </amp-addthis>
 * </code>
 */

import {isLayoutSizeDefined} from '../../../src/layout';
import {setStyle} from '../../../src/style';
import {createElementWithAttributes, removeElement} from '../../../src/dom';
import {user} from '../../../src/log';

import {ConfigManager} from './ConfigManager';
import {ORIGIN, ICON_SIZE, ALT_TEXT} from './constants';

// This `configManager` will be shared by all AmpAddThis elements on a page, to prevent unnecessary
// HTTP requests, get accurate analytics, etc.
const configManager = new ConfigManager();

export function getConfigManager() {
  return configManager;
}

class AmpAddThis extends AMP.BaseElement {

  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {?HTMLIFrameElement} */
    this.iframe_ = null;

    /** @private {?Promise} */
    this.iframeLoadPromise_ = null;

    /** @private {string} */
    this.pubId_ = '';

    /** @private {string} */
    this.widgetId_ = '';
  }

  /**
   * @param {boolean=} opt_onLayout
   * @override
   */
  preconnectCallback(opt_onLayout) {
    const {preconnect} = this;
    preconnect.url(ORIGIN, opt_onLayout);
    preconnect.url('https://m.addthis.com', opt_onLayout);
    preconnect.url('https://m.addthisedge.com', opt_onLayout);
    preconnect.url('https://cache.addthiscdn.com', opt_onLayout);
  }

  /**
   * @return {boolean}
   * @override
   */
  renderOutsideViewport() {
    return true;
  }

  /**
   * Note: Does no actual building (building is deferred until layout). Simply checks for/sets
   * required attributes (pudId/widgetId).
   * @override
   */
  buildCallback() {
    const {element} = this;
    const pubId = element.getAttribute('data-pubId') ||
        element.getAttribute('pubId');
    const widgetId = element.getAttribute('data-widgetId') ||
        element.getAttribute('widgetId');

    this.pubId_ = user().assert(
        pubId,
        'The data-pubId attribute is required for <amp-addthis> %s',
        element
    );
    this.widgetId_ = user().assert(
        widgetId,
        'The data-widgetId attribute is required for <amp-addthis> %s',
        element
    );
  }

  createPlaceholderCallback() {
    const {win} = this;

    const placeholder = createElementWithAttributes(
        win.document,
        'div',
        /** @type !JsonObject */ ({
          placeholder: '',
        })
    );
    setStyle(placeholder, 'background-color', '#eee');

    const image = createElementWithAttributes(
        win.document,
        'amp-img',
        /** @type !JsonObject */ ({
          src: `https://cache.addthiscdn.com/icons/v3/thumbs/${ICON_SIZE}x${ICON_SIZE}/addthis.png`,
          layout: 'fixed',
          width: ICON_SIZE,
          height: ICON_SIZE,
          referrerpolicy: 'origin',
          alt: ALT_TEXT,
        })
    );

    placeholder.appendChild(image);
    return placeholder;
  }

  /**
   * @return {boolean}
   * @override
   */
  isLayoutSupported(layout) {
    return isLayoutSizeDefined(layout);
  }

  /** @override */
  layoutCallback() {
    const iframe = createElementWithAttributes(
        /** @type !Document */ (this.element.ownerDocument),
        'iframe',
        /** @type !JsonObject */ ({
          frameborder: 0,
          title: ALT_TEXT,
          src: `${ORIGIN}/dc/amp-addthis.html`,
        })
    );
    setStyle(iframe, 'margin-bottom', '-5px');
    this.applyFillContent(iframe);
    this.element.appendChild(iframe);
    this.iframe_ = iframe;
    this.iframeLoadPromise_ = this.loadPromise(iframe);

    configManager.register({
      iframe,
      iframeLoadPromise: this.iframeLoadPromise_,
      element: this.element,
      pubId: this.pubId_,
      widgetId: this.widgetId_,
      win: this.win,
    });

    return this.iframeLoadPromise_;
  }

  /**
   * @override
   * @return {boolean}
   */
  unlayoutCallback() {
    if (this.iframe_) {
      removeElement(this.iframe_);
      configManager.unregister({
        pubId: this.pubId_,
        iframe: this.iframe_,
      });
      this.iframe_ = null;
      this.iframeLoadPromise_ = null;
    }
    return true;
  }

}

AMP.extension('amp-addthis', '0.1', AMP => {
  AMP.registerElement('amp-addthis', AmpAddThis);
});
