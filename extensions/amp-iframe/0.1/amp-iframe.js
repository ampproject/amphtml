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

import {ActionTrust} from '../../../src/action-constants';
import {
  IntersectionObserverApi,
} from '../../../src/intersection-observer-polyfill';
import {LayoutPriority, isLayoutSizeDefined} from '../../../src/layout';
import {Services} from '../../../src/services';
import {base64EncodeFromBytes} from '../../../src/utils/base64.js';
import {createCustomEvent, getData} from '../../../src/event-helper';
import {devAssert, user, userAssert} from '../../../src/log';
import {dict} from '../../../src/utils/object';
import {endsWith} from '../../../src/string';
import {
  isAdLike,
  listenFor,
  looksLikeTrackingIframe,
} from '../../../src/iframe-helper';
import {isAdPositionAllowed} from '../../../src/ad-helper';
import {isExperimentOn} from '../../../src/experiments';
import {moveLayoutRect} from '../../../src/layout-rect';
import {parseJson} from '../../../src/json';
import {removeElement} from '../../../src/dom';
import {removeFragment} from '../../../src/url';
import {setStyle} from '../../../src/style';
import {urls} from '../../../src/config';
import {utf8Encode} from '../../../src/utils/bytes.js';

/** @const {string} */
const TAG_ = 'amp-iframe';

/** @const {!Array<string>} */
const ATTRIBUTES_TO_PROPAGATE = [
  'allowfullscreen',
  'allowpaymentrequest',
  'allowtransparency',
  'allow',
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

  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {?Element} */
    this.placeholder_ = null;

    /** @private {boolean} */
    this.isClickToPlay_ = false;

    /** @private {boolean} */
    this.isAdLike_ = false;

    /** @private {boolean} */
    this.isTrackingFrame_ = false;

    /** @private {boolean} */
    this.isDisallowedAsAd_ = false;

    /**
     * The (relative) layout box of the ad iframe to the amp-ad tag.
     * @private {?../../../src/layout-rect.LayoutRectDef}
     */
    this.iframeLayoutBox_ = null;

    /** @private  {?HTMLIFrameElement} */
    this.iframe_ = null;

    /** @private {boolean} */
    this.isResizable_ = false;

    /** @private {?IntersectionObserverApi} */
    this.intersectionObserverApi_ = null;

    /** @private {string} */
    this.sandbox_ = '';

    /**
     * The source of the iframe. May change to null for tracking iframes
     * to prevent them from being recreated.
     * @type {?string}
     **/
    this.iframeSrc = null;

    /**
     * The element which will contain the iframe. This may be the amp-iframe
     * itself if the iframe is non-scrolling, or a wrapper element if it is.
     * @private {?Element}
     */
    this.container_ = null;

    /**
     * The origin of URL at `src` attr, if available. Otherwise, null.
     * @private {?string}
     */
    this.targetOrigin_ = null;
  }

  /** @override */
  isLayoutSupported(layout) {
    return isLayoutSizeDefined(layout);
  }

  /**
   * @param {string} src
   * @param {string} containerSrc
   * @param {string} sandbox
   * @return {string}
   * @private
   */
  assertSource_(src, containerSrc, sandbox = '') {
    const {element} = this;
    const urlService = Services.urlForDoc(element);
    const url = urlService.parse(src);
    const {hostname, protocol, origin} = url;
    // Some of these can be easily circumvented with redirects.
    // Checks are mostly there to prevent people easily do something
    // they did not mean to.
    userAssert(
        urlService.isSecure(src) || protocol == 'data:',
        'Invalid <amp-iframe> src. Must start with https://. Found %s',
        element);
    const containerUrl = urlService.parse(containerSrc);
    userAssert(
        !this.sandboxContainsToken_(sandbox, 'allow-same-origin') ||
        (origin != containerUrl.origin && protocol != 'data:'),
        'Origin of <amp-iframe> must not be equal to container %s' +
        'if allow-same-origin is set. See https://github.com/ampproject/' +
        'amphtml/blob/master/spec/amp-iframe-origin-policy.md for details.',
        element);
    userAssert(!(endsWith(hostname, `.${urls.thirdPartyFrameHost}`) ||
        endsWith(hostname, '.ampproject.org')),
    'amp-iframe does not allow embedding of frames from ' +
        'ampproject.*: %s', src);
    return src;
  }

  /** @private */
  assertPosition_() {
    const pos = this.element.getLayoutBox();
    const minTop = Math.min(600, this.getViewport().getSize().height * .75);
    userAssert(pos.top >= minTop,
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
   * @param {string} sandbox
   * @param {string} token
   * @return {boolean}
   * @private
   */
  sandboxContainsToken_(sandbox, token) {
    const re = new RegExp(`\\s${token}\\s`, 'i');
    return re.test(' ' + sandbox + ' ');
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
    const {protocol, hash} = Services.urlForDoc(this.element).parse(src);
    // data-URLs are not modified.
    if (protocol == 'data:') {
      return src;
    }
    // If fragment already exists, it's not modified.
    if (hash && hash != '#') {
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
    userAssert(
        !((' ' + sandbox + ' ').match(/\s+allow-same-origin\s+/i)),
        'allow-same-origin is not allowed with the srcdoc attribute %s.',
        this.element);

    return 'data:text/html;charset=utf-8;base64,' +
        base64EncodeFromBytes(utf8Encode(srcdoc));
  }

  /** @override */
  firstAttachedCallback() {
    this.sandbox_ = this.element.getAttribute('sandbox');

    const iframeSrc = /** @type {string} */ (
      this.transformSrc_(this.element.getAttribute('src')) ||
      this.transformSrcDoc_(this.element.getAttribute('srcdoc'), this.sandbox_)
    );
    this.iframeSrc = this.assertSource_(
        iframeSrc, window.location.href, this.sandbox_);
  }

  /**
   * @param {boolean=} onLayout
   * @override
   */
  preconnectCallback(onLayout) {
    if (this.iframeSrc) {
      this.preconnect.url(this.iframeSrc, onLayout);
    }
  }

  /** @override */
  buildCallback() {
    this.placeholder_ = this.getPlaceholder();
    this.isClickToPlay_ = !!this.placeholder_;

    this.isResizable_ = this.element.hasAttribute('resizable');
    if (this.isResizable_) {
      this.element.setAttribute('scrolling', 'no');
    }

    if (!this.element.hasAttribute('frameborder')) {
      this.element.setAttribute('frameborder', '0');
    }

    this.container_ = makeIOsScrollable(this.element);

    this.registerIframeMessaging_();
  }

  /** @override */
  onLayoutMeasure() {
    // We remeasured this tag, lets also remeasure the iframe. Should be
    // free now and it might have changed.
    this.measureIframeLayoutBox_();

    const {element} = this;

    this.isAdLike_ = isAdLike(element);
    this.isTrackingFrame_ = this.looksLikeTrackingIframe_();
    this.isDisallowedAsAd_ = this.isAdLike_ &&
        !isAdPositionAllowed(element, this.win);

    // When the framework has the need to remeasure us, our position might
    // have changed. Send an intersection record if needed. This can be done by
    // intersectionObserverApi onlayoutMeasure function.
    if (this.intersectionObserverApi_) {
      this.intersectionObserverApi_.fire();
    }
  }

  /**
   * @return {boolean}
   * @private
   */
  looksLikeTrackingIframe_() {
    // It may be tempting to inline this method, but it's referenced in tests.
    return looksLikeTrackingIframe(this.element);
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

  /** @override */
  getIntersectionElementLayoutBox() {
    if (!this.iframe_) {
      return super.getIntersectionElementLayoutBox();
    }
    const box = this.getLayoutBox();
    if (!this.iframeLayoutBox_) {
      this.measureIframeLayoutBox_();
    }

    const iframe = /** @type {!../../../src/layout-rect.LayoutRectDef} */(
      devAssert(this.iframeLayoutBox_));
    return moveLayoutRect(iframe, box.left, box.top);
  }

  /** @override */
  layoutCallback() {
    userAssert(!this.isDisallowedAsAd_, 'amp-iframe is not used for ' +
        'displaying fixed ad. Please use amp-sticky-ad and amp-ad instead.');

    if (!this.isClickToPlay_) {
      this.assertPosition_();
    }

    if (this.isResizable_) {
      userAssert(this.getOverflowElement(),
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

    // TEMPORARY: disable `allow=autoplay`
    // This is a workaround for M72-M74 user-activation breakage.
    // If this is still here in May 2019, please ping @aghassemi
    // See https://github.com/ampproject/amphtml/issues/21242 for details.
    // TODO(aghassemi, #21247)
    let allowVal = iframe.getAttribute('allow') || '';
    // allow syntax is complex, not worth parsing for temp code.
    allowVal = allowVal.replace('autoplay', 'autoplay-disabled');
    iframe.setAttribute('allow', allowVal);

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

        Services.timerFor(this.win).promise(trackingIframeTimeout).then(() => {
          removeElement(iframe);
          this.element.setAttribute('amp-removed', '');
          this.iframe_ = null;
        });
      }
    };

    listenFor(iframe, 'embed-size', data => {
      this.updateSize_(data['height'], data['width']);
    },
    /*opt_is3P*/ undefined,
    /*opt_includingNestedWindows*/ undefined,
    /*opt_allowOpaqueOrigin*/ true);

    if (this.isClickToPlay_) {
      listenFor(iframe, 'embed-ready', this.activateIframe_.bind(this));
    }

    this.container_.appendChild(iframe);

    return this.loadPromise(iframe).then(() => {
      // On iOS the iframe at times fails to render inside the `overflow:auto`
      // container. To avoid this problem, we set the `overflow:auto` property
      // 1s later via `amp-active` class.
      if (this.container_ != this.element) {
        Services.timerFor(this.win).delay(() => {
          this.mutateElement(() => {
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
  getLayoutPriority() {
    if (this.isAdLike_) {
      return LayoutPriority.ADS; // See AmpAd3PImpl.
    }
    if (this.isTrackingFrame_) {
      return LayoutPriority.METADATA;
    }
    return super.getLayoutPriority();
  }

  /** @override */
  mutatedAttributesCallback(mutations) {
    const src = mutations['src'];
    if (src !== undefined) {
      this.iframeSrc = this.transformSrc_(src);
      if (this.iframe_) {
        this.iframe_.src = this.assertSource_(
            /** @type {string} */ (this.iframeSrc),
            window.location.href,
            this.sandbox_);
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
   * Throws an error if window navigation is disallowed by this element.
   * Otherwise, does nothing.
   * @throws {!Error}
   */
  throwIfCannotNavigate() {
    if (!this.sandboxContainsToken_(this.sandbox_, 'allow-top-navigation')) {
      throw user().createError('"AMP.navigateTo" is only allowed on ' +
          '<amp-iframe> when its "sandbox" attribute contains ' +
          '"allow-top-navigation".');
    }
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
      this.user().error(TAG_,
          'Ignoring embed-size request because this iframe is not resizable',
          this.element);
      return;
    }

    if (height < 100) {
      this.user().error(TAG_,
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
      this.user().error(TAG_,
          'Ignoring embed-size request because '
          + 'no width or height value is provided',
          this.element);
    }
  }

  /**
   * Registers 'postMessage' action and 'message' event.
   * @private
   */
  registerIframeMessaging_() {
    if (!isExperimentOn(this.win, 'iframe-messaging')) {
      return;
    }

    const {element} = this;
    const src = element.getAttribute('src');
    if (src) {
      this.targetOrigin_ = Services.urlForDoc(element).parse(src).origin;
    }

    // Register action (even if targetOrigin_ is not available so we can
    // provide a helpful error message).
    this.registerAction('postMessage', invocation => {
      if (this.targetOrigin_) {
        this.iframe_.contentWindow./*OK*/postMessage(
            invocation.args, this.targetOrigin_);
      } else {
        user().error(TAG_, '"postMessage" action is only allowed with "src"' +
            'attribute with an origin.');
      }
    }, ActionTrust.HIGH);

    // However, don't listen for 'message' event if targetOrigin_ is null.
    if (!this.targetOrigin_) {
      return;
    }

    const maxUnexpectedMessages = 10;
    let unexpectedMessages = 0;

    const listener = e => {
      if (e.source !== this.iframe_.contentWindow) {
        // Ignore messages from other iframes.
        return;
      }
      if (e.origin !== this.targetOrigin_) {
        user().error(TAG_, '"message" received from unexpected origin: ' +
            e.origin + '. Only allowed from: ' + this.targetOrigin_);
        return;
      }
      if (!this.isUserGesture_()) {
        unexpectedMessages++;
        user().error(TAG_, '"message" event may only be triggered ' +
            'from a user gesture.');
        // Disable the 'message' event if the iframe is behaving badly.
        if (unexpectedMessages >= maxUnexpectedMessages) {
          user().error(TAG_, 'Too many non-gesture-triggered "message" ' +
              'events; detaching event listener.');
          this.win.removeEventListener('message', listener);
        }
        return;
      }
      const unsanitized = getData(e);
      let sanitized;
      try {
        sanitized = parseJson(JSON.stringify(unsanitized));
      } catch (e) {
        user().error(TAG_, 'Data from "message" event must be JSON.');
        return;
      }
      const event =
          createCustomEvent(this.win, 'amp-iframe:message',
              dict({'data': sanitized}));
      const actionService = Services.actionServiceForDoc(this.element);
      actionService.trigger(this.element, 'message', event, ActionTrust.HIGH);
    };
    // TODO(choumx): Consider using global listener in iframe-helper.
    this.win.addEventListener('message', listener);
  }

  /**
   * Returns true if a user gesture was recently performed.
   * @return {boolean}
   * @private
   */
  isUserGesture_() {
    // Best effort polyfill until native support is available: check that
    // iframe has focus and audio playback isn't immediately paused.
    if (this.getAmpDoc().getRootNode().activeElement !== this.iframe_) {
      return false;
    }
    const audio = this.win.document.createElement('audio');
    audio.play();
    if (audio.paused) {
      return false;
    }
    return true;
  }

  /**
   * @param {string} value
   * @visibleForTesting
   */
  setTargetOriginForTesting(value) {
    this.targetOrigin_ = value;
  }
}

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

/**
 * @param {number} ms
 */
export function setTrackingIframeTimeoutForTesting(ms) {
  trackingIframeTimeout = ms;
}

AMP.extension(TAG_, '0.1', AMP => {
  AMP.registerElement(TAG_, AmpIframe);
});
