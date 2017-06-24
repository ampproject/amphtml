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

import {base64EncodeFromBytes} from '../../../src/utils/base64.js';
import {
  IntersectionObserverApi,
} from '../../../src/intersection-observer-polyfill';
import {isAdPositionAllowed} from '../../../src/ad-helper';
import {isLayoutSizeDefined} from '../../../src/layout';
import {endsWith} from '../../../src/string';
import {listenFor} from '../../../src/iframe-helper';
import {removeElement} from '../../../src/dom';
import {removeFragment, parseUrl, isSecureUrl} from '../../../src/url';
import {timerFor} from '../../../src/services';
import {user, dev} from '../../../src/log';
import {utf8EncodeSync} from '../../../src/utils/bytes.js';
import {urls} from '../../../src/config';
import {moveLayoutRect} from '../../../src/layout-rect';
import {setStyle} from '../../../src/style';

/** @const {string} */
const TAG_ = 'amp-iframe';

/** @const {!Array<string>} */
const ATTRIBUTES_TO_PROPAGATE = [
  'allowfullscreen',
  'allowpaymentrequest',
  'allowtransparency',
  'frameborder',
  'referrerpolicy',
  'scrolling',
];

/** @type {number}  */
let count = 0;

/** @type {number}  */
let trackingIframeCount = 0;

/** @type {number}  */
let trackingIframeTimeout = 5000;

export class AmpIframe extends AMP.BaseElement {
  /** @override */
  isLayoutSupported(layout) {
    return isLayoutSizeDefined(layout);
  }

  assertSource(src, containerSrc, sandbox) {
    const url = parseUrl(src);
    // Some of these can be easily circumvented with redirects.
    // Checks are mostly there to prevent people easily do something
    // they did not mean to.
    user().assert(
        isSecureUrl(url) || url.protocol == 'data:',
        'Invalid <amp-iframe> src. Must start with https://. Found %s',
        this.element);
    const containerUrl = parseUrl(containerSrc);
    user().assert(
        !((' ' + sandbox + ' ').match(/\s+allow-same-origin\s+/i)) ||
        (url.origin != containerUrl.origin && url.protocol != 'data:'),
        'Origin of <amp-iframe> must not be equal to container %s' +
        'if allow-same-origin is set. See https://github.com/ampproject/' +
        'amphtml/blob/master/spec/amp-iframe-origin-policy.md for details.',
        this.element);
    user().assert(!(endsWith(url.hostname, `.${urls.thirdPartyFrameHost}`) ||
        endsWith(url.hostname, '.ampproject.org')),
        'amp-iframe does not allow embedding of frames from ' +
        'ampproject.*: %s', src);
    return src;
  }

  assertPosition() {
    const pos = this.element.getLayoutBox();
    const minTop = Math.min(600, this.getViewport().getSize().height * .75);
    user().assert(pos.top >= minTop,
        '<amp-iframe> elements must be positioned outside the first 75% ' +
        'of the viewport or 600px from the top (whichever is smaller): %s ' +
        ' Current position %s. Min: %s' +
        'Positioning rules don\'t apply for iframes that use `placeholder`.' +
        'See https://github.com/ampproject/amphtml/blob/master/extensions/' +
        'amp-iframe/amp-iframe.md#iframe-with-placeholder for details.',
        this.element,
        pos.top,
        minTop);
  }

  /**
   * Transforms the src attribute. When possible, it adds `#amp=1` fragment
   * to indicate that the iframe is running in AMP environment.
   * @param {?string} src
   * @return {string|undefined}
   * @private
   */
  transformSrc_(src) {
    if (!src) {
      return;
    }
    const url = parseUrl(src);
    // data-URLs are not modified.
    if (url.protocol == 'data:') {
      return src;
    }
    // If fragment already exists, it's not modified.
    if (url.hash && url.hash != '#') {
      return src;
    }
    // Add `#amp=1` fragment.
    return removeFragment(src) + '#amp=1';
  }

  /**
   * Transforms the srcdoc attribute if present to an equivalent data URI.
   *
   * It may be OK to change this later to leave the `srcdoc` in place and
   * instead ensure that `allow-same-origin` is not present, but this
   * implementation has the right security behavior which is that the document
   * may under no circumstances be able to run JS on the parent.
   * @param {?string} srcdoc
   * @param {string} sandbox
   * @return {string|undefined} Data URI for the srcdoc
   * @private
   */
  transformSrcDoc_(srcdoc, sandbox) {
    if (!srcdoc) {
      return;
    }
    user().assert(
        !((' ' + sandbox + ' ').match(/\s+allow-same-origin\s+/i)),
        'allow-same-origin is not allowed with the srcdoc attribute %s.',
        this.element);

    return 'data:text/html;charset=utf-8;base64,' +
        base64EncodeFromBytes(utf8EncodeSync(srcdoc));
  }

  /** @override */
  firstAttachedCallback() {
    /** @private @const {string} */
    this.sandbox_ = this.element.getAttribute('sandbox');

    const iframeSrc =
        this.transformSrc_(this.element.getAttribute('src')) ||
        this.transformSrcDoc_(
            this.element.getAttribute('srcdoc'), this.sandbox_);
    /**
     * The source of the iframe. May later be set to null for tracking iframes
     * to prevent them from being recreated.
     * @type {?string}
     **/
    this.iframeSrc = this.assertSource(
        iframeSrc, window.location.href, this.sandbox_);

    /**
     * The element which will contain the iframe. This may be the amp-iframe
     * itself if the iframe is non-scrolling, or a wrapper element if it is.
     * @type {!Element}
     */
    this.container_ = makeIOsScrollable(this.element);
  }

  /** @override */
  preconnectCallback(onLayout) {
    if (this.iframeSrc) {
      this.preconnect.url(this.iframeSrc, onLayout);
    }
  }

  /** @override */
  buildCallback() {
    /** @private @const {!Element} */
    this.placeholder_ = this.getPlaceholder();

    /** @private @const {boolean} */
    this.isClickToPlay_ = !!this.placeholder_;

    /** @private {boolean} */
    this.isAdLike_ = false;

    /** @private {boolean} */
    this.isTrackingFrame_ = false;

    /** @private {boolean} */
    this.isDisallowedAsAd_ = false;

    /**
     * Call to stop listening to viewport changes.
     * @private {?function()}
     */
    this.unlistenViewportChanges_ = null;

    /**
     * The (relative) layout box of the ad iframe to the amp-ad tag.
     * @private {?../../../src/layout-rect.LayoutRectDef}
     */
    this.iframeLayoutBox_ = null;

    /** @private  {?HTMLIFrameElement} */
    this.iframe_ = null;

    /** @private @const {boolean} */
    this.isResizable_ = this.element.hasAttribute('resizable');
    if (this.isResizable_) {
      this.element.setAttribute('scrolling', 'no');
    }

    /** @private {?IntersectionObserverApi} */
    this.intersectionObserverApi_ = null;

    if (!this.element.hasAttribute('frameborder')) {
      this.element.setAttribute('frameborder', '0');
    }
  }

  /**
   * @override
   */
  onLayoutMeasure() {
    // We remeasured this tag, lets also remeasure the iframe. Should be
    // free now and it might have changed.
    this.measureIframeLayoutBox_();

    this.isAdLike_ = isAdLike(this.element);
    this.isTrackingFrame_ = this.looksLikeTrackingIframe_();
    this.isDisallowedAsAd_ = this.isAdLike_ &&
        !isAdPositionAllowed(this.element, this.win);

    // When the framework has the need to remeasure us, our position might
    // have changed. Send an intersection record if needed. This can be done by
    // intersectionObserverApi onlayoutMeasure function.
    if (this.intersectionObserverApi_) {
      this.intersectionObserverApi_.fire();
    }
  }

  /**
   * Measure the layout box of the iframe if we rendered it already.
   * @private
   */
  measureIframeLayoutBox_() {
    if (this.iframe_) {
      const iframeBox = this.getViewport().getLayoutRect(this.iframe_);
      const box = this.getLayoutBox();
      // Cache the iframe's relative position to the amp-iframe. This is
      // necessary for fixed-position containers which "move" with the
      // viewport.
      this.iframeLayoutBox_ = moveLayoutRect(iframeBox, -box.left, -box.top);
    }
  }

  /**
   * @override
   */
  getIntersectionElementLayoutBox() {
    if (!this.iframe_) {
      return super.getIntersectionElementLayoutBox();
    }
    const box = this.getLayoutBox();
    if (!this.iframeLayoutBox_) {
      this.measureIframeLayoutBox_();
    }

    const iframe = /** @type {!../../../src/layout-rect.LayoutRectDef} */(
        dev().assert(this.iframeLayoutBox_));
    return moveLayoutRect(iframe, box.left, box.top);
  }

  /** @override */
  layoutCallback() {
    user().assert(!this.isDisallowedAsAd_, 'amp-iframe is not used for ' +
        'displaying fixed ad. Please use amp-sticky-ad and amp-ad instead.');

    if (!this.isClickToPlay_) {
      this.assertPosition();
    }

    if (this.isResizable_) {
      user().assert(this.getOverflowElement(),
          'Overflow element must be defined for resizable frames: %s',
          this.element);
    }

    if (!this.iframeSrc) {
      // This failed already, lets not signal another error.
      return Promise.resolve();
    }

    if (this.isTrackingFrame_) {
      trackingIframeCount++;
      if (trackingIframeCount > 1) {
        console/*OK*/.error('Only 1 analytics/tracking iframe allowed per ' +
            'page. Please use amp-analytics instead or file a GitHub issue ' +
            'for your use case: ' +
            'https://github.com/ampproject/amphtml/issues/new');
        return Promise.resolve();
      }
    }

    const iframe = this.element.ownerDocument.createElement('iframe');

    this.iframe_ = iframe;

    this.applyFillContent(iframe);
    iframe.name = 'amp_iframe' + count++;

    if (this.isClickToPlay_) {
      setStyle(iframe, 'zIndex', -1);
    }

    this.propagateAttributes(ATTRIBUTES_TO_PROPAGATE, iframe);
    setSandbox(this.element, iframe, this.sandbox_);
    iframe.src = this.iframeSrc;

    if (!this.isTrackingFrame_) {
      this.intersectionObserverApi_ = new IntersectionObserverApi(this, iframe);
    }

    iframe.onload = () => {
      // Chrome does not reflect the iframe readystate.
      iframe.readyState = 'complete';

      this.activateIframe_();

      if (this.isTrackingFrame_) {
        // Prevent this iframe from ever being recreated.
        this.iframeSrc = null;

        timerFor(this.win).promise(trackingIframeTimeout).then(() => {
          removeElement(iframe);
          this.element.setAttribute('amp-removed', '');
          this.iframe_ = null;
        });
      }
    };

    listenFor(iframe, 'embed-size', data => {
      this.updateSize_(data.height, data.width);
    });

    if (this.isClickToPlay_) {
      listenFor(iframe, 'embed-ready', this.activateIframe_.bind(this));
    }

    this.container_.appendChild(iframe);

    return this.loadPromise(iframe).then(() => {
      // On iOS the iframe at times fails to render inside the `overflow:auto`
      // container. To avoid this problem, we set the `overflow:auto` property
      // 1s later via `amp-active` class.
      if (this.container_ != this.element) {
        timerFor(this.win).delay(() => {
          this.deferMutate(() => {
            this.container_.classList.add('amp-active');
          });
        }, 1000);
      }
    });
  }

  /** @override */
  unlayoutOnPause() {
    return true;
  }

  /**
   * Removes this iframe from the page, freeing its resources. This is needed
   * to stop the bad eggs who continue to play videos even after the user has
   * swiped away from the doc.
   * @override
   **/
  unlayoutCallback() {
    if (this.iframe_) {
      removeElement(this.iframe_);
      if (this.placeholder_) {
        this.togglePlaceholder(true);
      }

      this.iframe_ = null;
      // Needs to clean up intersectionObserverApi_
      if (this.intersectionObserverApi_) {
        this.intersectionObserverApi_.destroy();
        this.intersectionObserverApi_ = null;
      }
    }
    return true;
  }

  /** @override  */
  viewportCallback(inViewport) {
    if (this.intersectionObserverApi_) {
      this.intersectionObserverApi_.onViewportCallback(inViewport);
    }
  }

  /** @override  */
  getPriority() {
    if (this.isAdLike_) {
      return 2; // See AmpAd3PImpl.
    }
    if (this.isTrackingFrame_) {
      return 1;
    }
    return super.getPriority();
  }

  /** @override */
  mutatedAttributesCallback(mutations) {
    const src = mutations['src'];
    if (src !== undefined) {
      this.iframeSrc = this.transformSrc_(src);
      if (this.iframe_) {
        this.iframe_.src = this.assertSource(
            this.iframeSrc, window.location.href, this.sandbox_);
      }
    }
  }

  /**
   * Makes the iframe visible.
   * @private
   */
  activateIframe_() {
    if (this.placeholder_) {
      this.getVsync().mutate(() => {
        if (this.iframe_) {
          setStyle(this.iframe_, 'zIndex', 0);
          this.togglePlaceholder(false);
        }
      });
    }
  }

  /**
   * No need for the default behavior, we'll call togglePlaceholder ourselves.
   * @override
   */
  firstLayoutCompleted() {
  }

  /**
   * Updates the element's dimensions to accommodate the iframe's
   *    requested dimensions.
   * @param {number|undefined} height
   * @param {number|undefined} width
   * @private
   */
  updateSize_(height, width) {
    if (!this.isResizable_) {
      user().error(TAG_,
          'Ignoring embed-size request because this iframe is not resizable',
          this.element);
      return;
    }

    if (height < 100) {
      user().error(TAG_,
          'Ignoring embed-size request because the resize height is less ' +
          'than 100px. If you are using amp-iframe to display ads, consider ' +
          'using amp-ad instead.',
          this.element);
      return;
    }

    // Calculate new width and height of the container to include the padding.
    // If padding is negative, just use the requested width and height directly.
    let newHeight, newWidth;
    height = parseInt(height, 10);
    if (!isNaN(height)) {
      newHeight = Math.max(
          height + (this.element./*OK*/offsetHeight
              - this.iframe_./*OK*/offsetHeight),
          height);
    }
    width = parseInt(width, 10);
    if (!isNaN(width)) {
      newWidth = Math.max(
          width + (this.element./*OK*/offsetWidth
              - this.iframe_./*OK*/offsetWidth),
          width);
    }

    if (newHeight !== undefined || newWidth !== undefined) {
      this.attemptChangeSize(newHeight, newWidth).then(() => {
        if (newHeight !== undefined) {
          this.element.setAttribute('height', newHeight);
        }
        if (newWidth !== undefined) {
          this.element.setAttribute('width', newWidth);
        }
      }, () => {});
    } else {
      user().error(TAG_,
          'Ignoring embed-size request because '
          + 'no width or height value is provided',
          this.element);
    }
  }

  /**
   * Whether this is iframe may have tracking as its primary use case.
   * @return {boolean}
   */
  looksLikeTrackingIframe_() {
    const box = this.element.getLayoutBox();
    // This heuristic is subject to change.
    if (box.width > 10 && box.height > 10) {
      return false;
    }
    return true;
  }
};

/**
 * We always set a sandbox. Default is that none of the things that need
 * to be opted in are allowed.
 * @param {!Element} element
 * @param {!Element} iframe
 * @param {string} sandbox
 */
function setSandbox(element, iframe, sandbox) {
  const allows = sandbox || '';
  iframe.setAttribute('sandbox', allows);
}


/**
 * If scrolling is allowed for the iframe, wraps the element into a container
 * that is scrollable because iOS auto expands iframes to their size.
 * @param {!Element} element
 * @return {!Element} The container or the iframe.
 */
function makeIOsScrollable(element) {
  if (element.getAttribute('scrolling') != 'no') {
    const wrapper = element.ownerDocument.createElement(
        'i-amphtml-scroll-container');
    element.appendChild(wrapper);
    return wrapper;
  }
  return element;
}

// Most common ad sizes
// Array of [width, height] pairs.
const adSizes = [[300, 250], [320, 50], [300, 50], [320, 100]];

/**
 * Guess whether this element might be an ad.
 * @param {!Element} element An amp-iframe element.
 * @return {boolean}
 * @visibleForTesting
 */
export function isAdLike(element) {
  const box = element.getLayoutBox();
  const height = box.height;
  const width = box.width;
  for (let i = 0; i < adSizes.length; i++) {
    const refWidth = adSizes[i][0];
    const refHeight = adSizes[i][1];
    if (refHeight > height) {
      continue;
    }
    if (refWidth > width) {
      continue;
    }
    // Fuzzy matching to account for padding.
    if (height - refHeight <= 20 && width - refWidth <= 20) {
      return true;
    }
  }
  return false;
}

/**
 * @param {number} ms
 */
export function setTrackingIframeTimeoutForTesting(ms) {
  trackingIframeTimeout = ms;
}

AMP.registerElement('amp-iframe', AmpIframe);
