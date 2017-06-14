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
 * @fileoverview Embeds an playbuzz item.
 * The src attribute can be easily copied from a normal playbuzz URL.
 * data-item supports item id which can be taken from the item's embed code
 * in case both are present data-item will be used
 * Example:
 * <code>
    <amp-playbuzz
        src="http://www.playbuzz.com/perezhilton/poll-which-presidential-candidate-did-ken-bone-vote-for"
        data-item="a6aa5a14-8888-4618-b2e3-fe6a30d8c51b"
        layout="responsive"
        height="300"
        width="300"
        data-item-info="true"
        data-share-buttons="true"
        data-comments="true">
    </amp-playbuzz>
 * </code>
 *
 * For responsive embedding the width and height can be left unchanged from
 * the example above and will produce the correct aspect ratio.
 */

import {CSS} from '../../../build/amp-playbuzz-0.1.css.js';
import {logo, showMoreArrow} from './images';
import * as utils from './utils';
import {Layout, isLayoutSizeDefined} from '../../../src/layout';
import {removeElement} from '../../../src/dom';
import {isExperimentOn} from '../../../src/experiments';
import {user} from '../../../src/log';
import * as events from '../../../src/event-helper';
import {postMessage} from '../../../src/iframe-helper';
import {
  parseUrl,
  removeFragment,
  assertAbsoluteHttpOrHttpsUrl,
} from '../../../src/url';

/** @const */
const EXPERIMENT = 'amp-playbuzz';

class AmpPlaybuzz extends AMP.BaseElement {

  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {?Element} */
    this.iframe_ = null;

    /** @private {?Promise} */
    this.iframePromise_ = null;

    /** @private {?number} */
    this.itemHeight_ = 300; //default

    /** @private {?boolean} */
    this.displayItemInfo_ = false;

    /** @private {?boolean} */
    this.displayShareBar_ = false;

    /** @private {?boolean} */
    this.displayComments_ = false;

    /** @private {?boolean} */
    this.iframeLoaded_ = false;

    /** @private {Array.<function>} */
    this.unlisteners_ = [];
  }
  /**
   * @override
   */
  preconnectCallback() {
    this.preconnect.url(this.iframeSrcUrl_);
  }

  /** @override */
  renderOutsideViewport() {
    return false;
  }

  /** @override */
  buildCallback() {
    // EXPERIMENT
    // AMP.toggleExperiment(EXPERIMENT, true); //for dev
    user().assert(isExperimentOn(this.win, EXPERIMENT),
        `Enable ${EXPERIMENT} experiment`);

    const e = this.element;
    const src = e.getAttribute('src');
    const itemId = e.getAttribute('data-item');

    user().assert(src || itemId,
        'Either src or data-item attribute is required for <amp-playbuzz> %s',
        this.element);

    if (src) {
      assertAbsoluteHttpOrHttpsUrl(src);
    }

    const parsedHeight = parseInt(e.getAttribute('height'), 10);

    this.iframeSrcUrl_ = utils.composeItemSrcUrl(src, itemId);
    this.itemHeight_ = isNaN(parsedHeight) ? this.itemHeight_ : parsedHeight;
    this.displayItemInfo_ = e.getAttribute('data-item-info') === 'true';
    this.displayShareBar_ = e.getAttribute('data-share-buttons') === 'true';
    this.displayComments_ = e.getAttribute('data-comments') === 'true';
  }

  /** @override */
  isLayoutSupported(layout) {
    return layout === Layout.RESPONSIVE ||
      layout === Layout.FIXED_HEIGHT;
  }

  /** @override */
  createPlaceholderCallback() {
    const placeholder = this.win.document.createElement('div');
    placeholder.setAttribute('placeholder', '');
    placeholder.appendChild(this.createPlaybuzzLoader_());
    return placeholder;
  }

  notifyIframe_(eventData) {
    const data = JSON.stringify(eventData);
    postMessage(this.iframe_, 'onMessage', data, '*', false);
  }
  /**
   *
   * Returns the overflow element
   * @returns {!Element} overflowElement
   *
   */
  getOverflowElement_() {
    const createElement = utils.getElementCreator(this.element.ownerDocument);

    const overflow = createElement('div', 'pb-overflow');
    overflow.setAttribute('overflow', '');

    const overflowButton = createElement('button');
    overflowButton.textContent = 'Show More';

    const arrow = createElement('img', 'pb-arrow-down');
    arrow.src = showMoreArrow;

    overflowButton.appendChild(arrow);
    overflow.appendChild(overflowButton);

    return overflow;
  }

  /** @override */
  layoutCallback() {

    const iframe = this.element.ownerDocument.createElement('iframe');
    this.iframe_ = iframe;
    iframe.setAttribute('scrolling', 'no');
    iframe.setAttribute('frameborder', '0');
    iframe.setAttribute('allowtransparency', 'true');
    iframe.setAttribute('allowfullscreen', 'true');
    iframe.src = this.generateEmbedSourceUrl_();

    this.listenToPlaybuzzItemMessage_('resize_height',
        utils.debounce(this.itemHeightChanged_.bind(this), 100));

    this.element.appendChild(this.getOverflowElement_());

    this.applyFillContent(iframe);
    this.element.appendChild(iframe);

    return this.iframePromise_ = this.loadPromise(iframe).then(function() {
      this.iframeLoaded_ = true;
      this.attemptChangeHeight(this.itemHeight_).catch(() => {/* die */ });

      const unlisten = this.getViewport().onChanged(
          this.sendScrollDataToItem_.bind(this));
      this.unlisteners_.push(unlisten);
    }.bind(this));
  }

  /** @return {!Element} @private */
  createPlaybuzzLoader_() {
    const doc = this.element.ownerDocument;
    const createElement = utils.getElementCreator(doc);

    const loaderImage = createElement('img', 'pb_feed_anim_mask');
    loaderImage.src = logo;

    const loadingPlaceholder =
      createElement('div', 'pb_feed_placeholder_container',
          createElement('div', 'pb_feed_placeholder_inner',
              createElement('div', 'pb_feed_placeholder_content',
                  createElement('div', 'pb_feed_placeholder_preloader',
                      loaderImage)
          )));

    return loadingPlaceholder;
  }

  /**
   * @param {number} height
   */
  itemHeightChanged_(height) {

    if (isNaN(height) || height === this.itemHeight_) {
      return;
    }

    this.itemHeight_ = height; //Save new height

    if (this.iframeLoaded_) {
      this.attemptChangeHeight(this.itemHeight_).catch(() => {/* die */ });
    }
  }


  /**
   * @param {string} messageName
   * @param {function} handler
   */
  listenToPlaybuzzItemMessage_(messageName, handler) {
    const unlisten = events.listen(this.win, 'message',
        event => utils.handleMessageByName(this.iframe_,
            event, messageName, handler));
    this.unlisteners_.push(unlisten);
  }

  /**
   *
   * Returns the composed embed source url
   * @returns {string} url
   *
   */
  generateEmbedSourceUrl_() {
    const winUrl = this.win.location;
    const params = {
      itemUrl: this.iframeSrcUrl_,
      relativeUrl: parseUrl(this.iframeSrcUrl_).pathname,
      displayItemInfo: this.displayItemInfo_,
      displayShareBar: this.displayShareBar_,
      displayComments: this.displayComments_,
      parentUrl: removeFragment(winUrl.href),
      parentHost: winUrl.hostname,
    };

    const embedUrl = utils.composeEmbedUrl(params);
    return embedUrl;
  }

  sendScrollDataToItem_(changeEvent) {
    if (!this.isInViewport()) {
      return;
    }

    const scrollingData = {
      event: 'scroll',
      windowHeight: changeEvent.height,
      scroll: changeEvent.top,
      offsetTop: this.getLayoutBox().top,
    };

    this.notifyIframe_(scrollingData);
  }

  //User might have made some progress or had the results when going inactive
  //TODO: build a message telling the iframe to pause
  /** @override */
  unlayoutOnPause() {
    return true;
  }

  /** @override */
  unlayoutCallback() {
    this.unlisteners_.forEach(unlisten => unlisten());
    this.unlisteners_.length = 0;

    if (this.iframe_) {
      removeElement(this.iframe_);
      this.iframe_ = null;
      this.iframePromise_ = null;
    }
    return true;  // Call layoutCallback again.
  }
};

AMP.registerElement('amp-playbuzz', AmpPlaybuzz, CSS);
