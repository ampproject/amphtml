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
import {Layout, isLayoutSizeDefined} from '../../../src/layout';
import {isExperimentOn} from '../../../src/experiments';
import {setStyles} from '../../../src/style';
import {removeElement} from '../../../src/dom';
import {user} from '../../../src/log';
import * as events from '../../../src/event-helper';

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

  }
  /**
   * @param {boolean=} opt_onLayout
   * @override
   */
  preconnectCallback(opt_onLayout) {
    this.preconnect.url('https://www.playbuzz.com', opt_onLayout);
    this.preconnect.url('http://cdn.playbuzz.com', opt_onLayout);
  }

  /** @override */
  // renderOutsideViewport() {
  //   return false;
  // }

  /** @override */
  buildCallback() {

    // EXPERIMENT
    AMP.toggleExperiment('amp-playbuzz', true); //for dev
    user().assert(isExperimentOn(this.win, EXPERIMENT),
      `Enable ${EXPERIMENT} experiment`);

    this.item_ = user().assert(
      this.element.getAttribute('item-url'),
      'The item attribute is required for <amp-playbuzz> %s',
      this.element);
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
    //placeholder.appendChild(this.createAmpImage_('//cdn.playbuzz.com/amp/assets/loader/loader-360@2x.png'));
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
      this.setElementSize_.bind(this));

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
      this.win.addEventListener('scroll',
        this.sendScrollDataToItem_.bind(this));
    });
  }

  createAmpImage_(src) {
    const image = this.win.document.createElement('amp-img');
    image.setAttribute('noprerender', '');
    image.setAttribute('src', src);
    image.setAttribute('layout', 'fill');
    image.setAttribute('referrerpolicy', 'origin');
    this.propagateAttributes(['alt'], image);
    setStyles(image, {
      'top': '48px',
      'bottom': '48px',
      'left': '8px',
      'right': '8px',
    });
    return image;
  }

  createPlaybuzzLoader_() {
    /*eslint-disable */
    const loadingPlaceholder = this.win.document.createElement('div');
    loadingPlaceholder.className = 'pb_feed_placeholder_container';
    let loadingPlaceholderInner = "<div class='pb_feed_placeholder_inner'>";
    loadingPlaceholderInner += "    <div class='pb_feed_placeholder_content'>";
    loadingPlaceholderInner += "        <div class='pb_feed_placeholder_preloader'>";
    loadingPlaceholderInner += "            <img src='data:image/png;base64,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' class='pb_feed_anim_mask' />";
    loadingPlaceholderInner += '        </div>';
    loadingPlaceholderInner += "        <div class='pb_ie_fixer'></div>";
    loadingPlaceholderInner += "        <div class='pb_feed_loading_text'>Loading...</div>";
    loadingPlaceholderInner += '    </div>';
    loadingPlaceholderInner += '</div>';

    loadingPlaceholder.innerHTML = loadingPlaceholderInner;
    return loadingPlaceholder;
    /*eslint-enable */
  }

  /**
   * @param {number} height
   *
   * @memberOf AmpPlaybuzz
   */
  setElementSize_(height) {
    const heightInPixels = height + 'px';

    this.getVsync().mutate(() => {
      setStyles(this.iframe_, {
        'height': heightInPixels,
        'max-height': heightInPixels,
      });
    });

    this.getVsync().mutate(() => {
      setStyles(this.element, {'height': heightInPixels});
    });
  }

  /**
   * @param {Object} event
   * @param {String} eventName
   * @param {Function} handler
   *
   * @memberOf AmpPlaybuzz
   */
  handlePlaybuzzItemEvent_(event, eventName, handler) {
    const data = this.parsePlaybuzzEventData_(event.data);
    if (data[eventName]) {
      // console.log('Handeling playbuzz item message -->' + eventName);
      handler(data[eventName]);
    }
  }

  parsePlaybuzzEventData_(data) {
    if (typeof data === 'object') {
      return data;
    }
    const err = 'error parsing json message from playbuzz item: ' + data;
    try {
      if (typeof data === 'string') {
        return JSON.parse(data);
      }
    }
    catch (e) {
      //TODO: use user().error()
      console.error(err, e);
      return {};
    }

    console.error(err, data);
    return {};
  }

  listenToPlaybuzzItemMessage_(messageName, handler) {
    events.listen(this.win, 'message', function gotMessageEvent(event) {
      const isPlaybuzzItemEvent = event.origin &&
        event.origin.indexOf &&
        event.origin.indexOf('playbuzz.com') >= 0;

      if (isPlaybuzzItemEvent) {
        this.handlePlaybuzzItemEvent_(event, messageName, handler);
      }

    }.bind(this));
  }

  generateEmbedSourceUrl_() {
    const e = this.element;
    const itemUrl = this.item_.replace('https://', '//').replace('http://', '//');
    const displayItemInfo = e.getAttribute('display-item-info') === 'true';
    const displayShareBar = e.getAttribute('display-share-buttons') === 'true';
    const displayComments = e.getAttribute('display-comments') === 'true';
    const windowUrl = this.win.location;
    const parentUrl = windowUrl.href.split(windowUrl.hash)[0];

    const embedUrl = itemUrl +
      '?feed=true' +
      '&implementation=amp' +
      '&src=' + itemUrl +
      '&embedBy=00000000-0000-0000-0000-000000000000' + // TODO: (must pass user id - for now can generate uuid)
      '&game=' + itemUrl.split('.playbuzz.com')[1] + // /shaulolmert10/5-u-s-athletes-you-need-to-know-about-before-the-rio-olympics
      '&comments=undefined' + //display comments (not in use)
      '&useComments=' + displayComments +
      '&gameInfo=' + displayItemInfo +
      '&useShares=' + displayShareBar +
      '&socialReferrer=false' + //always false - will use parent url for sharing
      '&height=auto' + //must pass as is - if not, makes problems in trivia (iframe height scrolling)
      '&parentUrl=' + parentUrl + //used for sharing
      '&parentHost=' + windowUrl.hostname;

    return embedUrl;
  }

  sendScrollDataToItem_() {
    const doc = this.win.document.documentElement;
    const scrollingData = {
      event: 'queryScroll',
      data: {
        windowHeight: this.win.innerHeight,
        scroll: doc.scrollTop || this.win.pageYOffset,
        offsetTop: Math.round(this.calculateOffset_(this.iframe_).top) || 0,
      },
    };

    this.iframe_.contentWindow.postMessage(scrollingData, '*');
  }

  calculateOffset_(element) {
    let box = {top: 0, left: 0};
    const elem = element;
    const doc = elem && elem.ownerDocument;

    if (!doc) {
      return {
        top: null,
        left: null,
      };
    }

    const docElem = doc.documentElement;

    if (elem.getBoundingClientRect != undefined) {
      box = elem.getBoundingClientRect();
    }

    return {
      top: box.top +
        (this.win.pageYOffset || docElem.scrollTop) -
        (docElem.clientTop || 0),
      left: box.left +
        (this.win.pageXOffset || docElem.scrollLeft) -
        (docElem.clientLeft || 0),
    };
  }

  /** @override */
  unlayoutOnPause() {
    return true;
  }

  /** @override */
  unlayoutCallback() {
    if (this.iframe_) {
      removeElement(this.iframe_);
      this.iframe_ = null;
      this.iframePromise_ = null;
    }
    return true;  // Call layoutCallback again.
  }
};

AMP.registerElement('amp-playbuzz', AmpPlaybuzz, CSS);
