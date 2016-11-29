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
 * The item-url attribute can be easily copied from a normal playbuzz URL.
 * Example:
 * <code>
    <amp-playbuzz
        item="http://www.playbuzz.com/perezhilton/poll-which-presidential-candidate-did-ken-bone-vote-for"
        layout="responsive"
        height="300"
        width="300"
        display-item-info="true"
        display-share-buttons="true"
        display-comments="true">
    </amp-playbuzz>
 * </code>
 *
 * For responsive embedding the width and height can be left unchanged from
 * the example above and will produce the correct aspect ratio.
 */

import {CSS} from '../../../build/amp-playbuzz-0.1.css.js';
import {logo} from './logo-image';
import * as utils from './utils';
import {Layout, isLayoutSizeDefined} from '../../../src/layout';
import {isExperimentOn} from '../../../src/experiments';
import {setStyles} from '../../../src/style';
import {user} from '../../../src/log';
import * as events from '../../../src/event-helper';
import {whenDocumentComplete} from '../../../src/document-ready';
import {postMessage} from '../../../src/iframe-helper';

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

    /** @private {?string} */
    this.item_ = '';

     /** @private {?number} */
    this.itemHeight_ = 0;

     /** @private {?boolean} */
    this.displayItemInfo_ = false;

     /** @private {?boolean} */
    this.displayShareBar_ = false;

     /** @private {?boolean} */
    this.displayComments_ = false;
  }
  /**
   * @override
   */
  preconnectCallback() {
    this.preconnect.preload(this.item_);
  }

  /** @override */
  renderOutsideViewport() {
    return false;
  }

  /** @override */
  buildCallback() {
    // EXPERIMENT
    AMP.toggleExperiment('amp-playbuzz', true); //for dev
    user().assert(isExperimentOn(this.win, EXPERIMENT),
      `Enable ${EXPERIMENT} experiment`);

    const e = this.element;
    this.item_ = user().assert(
      e.getAttribute('item-url'),
      'The item attribute is required for <amp-playbuzz> %s',
      e);

    this.itemHeight_ = e.height;
    this.displayItemInfo_ = e.getAttribute('display-item-info') === 'true';
    this.displayShareBar_ = e.getAttribute('display-share-buttons') === 'true';
    this.displayComments_ = e.getAttribute('display-comments') === 'true';
  }

  /** @override */
  isLayoutSupported(layout) {
    return layout === Layout.RESPONSIVE;
    // return layout === Layout.CONTAINER;
    // return isLayoutSizeDefined(layout);
  }

  /** @override */
  createPlaceholderCallback() {
    const placeholder = this.win.document.createElement('div');
    setStyles(placeholder, {
      'max-height': '300px',
      'height': '300px',
    });
    placeholder.setAttribute('placeholder', '');
    placeholder.appendChild(this.createPlaybuzzLoader_());
    return placeholder;
  }

  /** @override */
  layoutCallback() {
    const iframe = this.element.ownerDocument.createElement('iframe');
    this.iframe_ = iframe;
    iframe.setAttribute('frameborder', '0');
    iframe.setAttribute('allowtransparency', 'true');
    iframe.src = this.generateEmbedSourceUrl_();

    this.listenToPlaybuzzItemMessage_('resize_height',
      utils.debounce(this.setElementSize_.bind(this), 250));

    whenDocumentComplete(this.win.document)
      .then(this.setElementSize_.bind(this));

    this.applyFillContent(iframe);
    this.element.appendChild(iframe);
    setStyles(iframe, {
      'opacity': 0,
      'min-height': '300px',
      'height': '300px',
    });
    setStyles(this.element, {'height': '300px', 'min-height': '300px'});

    return this.iframePromise_ = this.loadPromise(iframe).then(() => {
      this.togglePlaceholder(false);
      this.getVsync().mutate(() => {
        setStyles(iframe, {'opacity': 1});
      });
      this.getViewport().onChanged(
        utils.debounce(this.sendScrollDataToItem_.bind(this), 250));
    });
  }

  createPlaybuzzLoader_() {
    const doc = this.element.ownerDocument;
    const createElement = utils.getElementCreator(doc);

    const loaderImage = createElement('img', 'pb_feed_anim_mask');
    loaderImage.src = logo;

    const loaderText = createElement('div', 'pb_feed_loading_text');
    loaderText.textContent = 'Loading...';

    const loadingPlaceholder =
      createElement('div', 'pb_feed_placeholder_container',
        createElement('div', 'pb_feed_placeholder_inner',
          createElement('div', 'pb_feed_placeholder_content', [
            createElement('div', 'pb_feed_placeholder_preloader', loaderImage),
            createElement('div', 'pb_ie_fixer'),
            loaderText,
          ])));

    return loadingPlaceholder;
  }

  /**
   * @param {number} height
   *
   * @memberOf AmpPlaybuzz
   */
  setElementSize_(height) {

    if (isNaN(height) || height === this.itemHeight_) {
      return;
    }

    this.itemHeight_ = height; //Save new height

    if (this.win.document.readyState !== 'complete') {
      return;
    }

    const heightInPixels = this.itemHeight_ + 'px';
    // this.changeHeight(this.itemHeight_); //Is that better than using vSync mutate + setStyles ?
    this.getVsync().mutate(() => {
      setStyles(this.element, {'height': heightInPixels, 'width': '100%'});
    });

    this.getVsync().mutate(() => {
      setStyles(this.iframe_, {
        'height': heightInPixels,
        'max-height': heightInPixels,
        'width': '100%',
      });
    });
  }


  listenToPlaybuzzItemMessage_(messageName, handler) {
    events.listen(this.win, 'message',
      event => utils.handleMessageByName(event, messageName, handler));
  }

  generateEmbedSourceUrl_() {
    const params = {};
    params.itemUrl = this.item_.replace('https://', '//').replace('http://', '//').split('#')[0];
    params.relativeUrl = params.itemUrl.split('.playbuzz.com')[1];
    params.displayItemInfo = this.displayItemInfo_;
    params.displayShareBar = this.displayShareBar_;
    params.displayComments = this.displayComments_;
    params.windowUrl = this.win.location;
    params.parentUrl = params.windowUrl.href.split(params.windowUrl.hash)[0];
    params.parentHost = params.windowUrl.hostname;

    const embedUrl = utils.composeEmbedUrl(params);
    return embedUrl;
  }

  sendScrollDataToItem_(changeEvent) {
    const viewport = this.getViewport();

    const scrollingData = {
      event: 'scroll',
      windowHeight: changeEvent.height,
      scroll: changeEvent.top,
      offsetTop: viewport.getLayoutRect(this.element).top,
    };

    const data = JSON.stringify(scrollingData);
    postMessage(this.iframe_, 'onMessage', data, '*', false);
  }

  /** @override */
  unlayoutOnPause() {
    return false;
  }

  /** @override */
  unlayoutCallback() {
    //User might have made some progress or had the results when going inactive
    return false;
  }
};

AMP.registerElement('amp-playbuzz', AmpPlaybuzz, CSS);
