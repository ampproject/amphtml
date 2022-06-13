import {MessageType_Enum} from '#core/3p-frame-messaging';
import {ActionTrust_Enum} from '#core/constants/action-constants';
import {AMPDOC_SINGLETON_NAME_ENUM} from '#core/constants/enums';
import {removeElement} from '#core/dom';
import {
  LayoutPriority_Enum,
  applyFillContent,
  isLayoutSizeDefined,
} from '#core/dom/layout';
import {propagateAttributes} from '#core/dom/propagate-attributes';
import {setStyle} from '#core/dom/style';
import {playIgnoringError} from '#core/dom/video';
import {PauseHelper} from '#core/dom/video/pause-helper';
import {parseJson} from '#core/types/object/json';
import {endsWith} from '#core/types/string';
import {base64EncodeFromBytes} from '#core/types/string/base64';
import {utf8Encode} from '#core/types/string/bytes';

import {isExperimentOn} from '#experiments';

import {Services} from '#service';

import {createCustomEvent, getData, listen} from '#utils/event-helper';
import {IntersectionObserver3pHost} from '#utils/intersection-observer-3p-host';
import {user, userAssert} from '#utils/log';

import {isAdPositionAllowed} from '../../../src/ad-helper';
import * as urls from '../../../src/config/urls';
import {getConsentDataToForward} from '../../../src/consent';
import {
  isAdLike,
  listenFor,
  looksLikeTrackingIframe,
} from '../../../src/iframe-helper';
import {removeFragment} from '../../../src/url';

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
  'tabindex',
  'title',
];

/** @type {number}  */
let count = 0;

/** @type {number}  */
let trackingIframeTimeout = 5000;

export class AmpIframe extends AMP.BaseElement {
  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {?Element} */
    this.placeholder_ = null;

    /** @private {boolean} */
    this.hasPlaceholder_ = false;

    /** @private {boolean} */
    this.isAdLike_ = false;

    /** @private {boolean} */
    this.isTrackingFrame_ = false;

    /** @private {boolean} */
    this.isDisallowedAsAd_ = false;

    /** @private  {?HTMLIFrameElement} */
    this.iframe_ = null;

    /** @private {boolean} */
    this.isResizable_ = false;

    /** @private {?IntersectionObserver3pHost} */
    this.intersectionObserverHostApi_ = null;

    /** @private {string} */
    this.sandbox_ = '';

    /** @private {Function} */
    this.unlistenPym_ = null;

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

    /** @private {boolean} */
    this.hasErroredEmbedSize_ = false;

    /** @private @const */
    this.pauseHelper_ = new PauseHelper(this.element);
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
    const {hostname, origin, protocol} = url;
    // Some of these can be easily circumvented with redirects.
    // Checks are mostly there to prevent people easily do something
    // they did not mean to.
    userAssert(
      urlService.isSecure(src) || protocol == 'data:',
      'Invalid <amp-iframe> src. Must start with https://. Found %s',
      element
    );
    const containerUrl = urlService.parse(containerSrc);
    userAssert(
      !this.sandboxContainsToken_(sandbox, 'allow-same-origin') ||
        (origin != containerUrl.origin && protocol != 'data:'),
      'Origin of <amp-iframe> must not be equal to container %s' +
        ' if allow-same-origin is set. See https://github.com/ampproject/' +
        'amphtml/blob/main/docs/spec/amp-iframe-origin-policy.md for details.',
      element
    );
    userAssert(
      !(
        endsWith(hostname, `.${urls.thirdPartyFrameHost}`) ||
        endsWith(hostname, '.ampproject.org')
      ),
      'amp-iframe does not allow embedding of frames from ' +
        'ampproject.*: %s',
      src
    );
    return src;
  }

  /** @private */
  assertPosition_() {
    const pos = this.element.getLayoutBox();
    const minTop = Math.min(600, this.getViewport().getSize().height * 0.75);
    userAssert(
      pos.top >= minTop,
      '<amp-iframe> elements must be positioned outside the first 75% ' +
        'of the viewport or 600px from the top (whichever is smaller): %s ' +
        ' Current position %s. Min: %s' +
        "Positioning rules don't apply for iframes that use `placeholder`." +
        'See https://github.com/ampproject/amphtml/blob/main/extensions/' +
        'amp-iframe/amp-iframe.md#iframe-with-placeholder for details.',
      this.element,
      pos.top,
      minTop
    );
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
    const {hash, protocol} = Services.urlForDoc(this.element).parse(src);
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
      !(' ' + sandbox + ' ').match(/\s+allow-same-origin\s+/i),
      'allow-same-origin is not allowed with the srcdoc attribute %s.',
      this.element
    );

    return (
      'data:text/html;charset=utf-8;base64,' +
      base64EncodeFromBytes(utf8Encode(srcdoc))
    );
  }

  /**
   * @param {boolean=} onLayout
   * @override
   */
  preconnectCallback(onLayout) {
    if (this.iframeSrc) {
      Services.preconnectFor(this.win).url(
        this.getAmpDoc(),
        this.iframeSrc,
        onLayout
      );
    }
  }

  /** @override */
  buildCallback() {
    this.sandbox_ = this.element.getAttribute('sandbox');

    const iframeSrc = /** @type {string} */ (
      this.transformSrc_(this.element.getAttribute('src')) ||
        this.transformSrcDoc_(
          this.element.getAttribute('srcdoc'),
          this.sandbox_
        )
    );
    this.iframeSrc = this.assertSource_(
      iframeSrc,
      window.location.href,
      this.sandbox_
    );

    this.placeholder_ = this.getPlaceholder();
    this.hasPlaceholder_ = !!this.placeholder_;

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
    const {element} = this;

    this.isAdLike_ = isAdLike(element);
    this.isTrackingFrame_ = this.looksLikeTrackingIframe_();
    this.isDisallowedAsAd_ =
      this.isAdLike_ && !isAdPositionAllowed(element, this.win);
  }

  /**
   * @return {boolean}
   * @private
   */
  looksLikeTrackingIframe_() {
    // It may be tempting to inline this method, but it's referenced in tests.
    return looksLikeTrackingIframe(this.element);
  }

  /** @override */
  layoutCallback() {
    userAssert(
      !this.isDisallowedAsAd_,
      'amp-iframe is not used for ' +
        'displaying fixed ad. Please use amp-sticky-ad and amp-ad instead.'
    );

    if (!this.hasPlaceholder_) {
      this.assertPosition_();
    }

    if (this.isResizable_) {
      userAssert(
        this.getOverflowElement(),
        'Overflow element must be defined for resizable frames: %s',
        this.element
      );
    }

    if (!this.iframeSrc) {
      // This failed already, lets not signal another error.
      return Promise.resolve();
    }

    if (this.isTrackingFrame_) {
      if (
        !this.getAmpDoc().registerSingleton(
          AMPDOC_SINGLETON_NAME_ENUM.TRACKING_IFRAME
        )
      ) {
        console /*OK*/
          .error(
            'Only 1 analytics/tracking iframe allowed per ' +
              'page. Please use amp-analytics instead or file a GitHub issue ' +
              'for your use case: ' +
              'https://github.com/ampproject/amphtml/issues/new/choose'
          );
        return Promise.resolve();
      }
    }

    const iframe = this.element.ownerDocument.createElement('iframe');

    this.iframe_ = /** @type {HTMLIFrameElement} */ (iframe);

    applyFillContent(iframe);
    iframe.name = 'amp_iframe' + count++;

    if (this.hasPlaceholder_) {
      setStyle(iframe, 'zIndex', -1);
    }

    propagateAttributes(ATTRIBUTES_TO_PROPAGATE, this.element, iframe);

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
      this.intersectionObserverHostApi_ = new IntersectionObserver3pHost(
        this,
        iframe
      );
    }

    iframe.onload = () => {
      // Chrome does not reflect the iframe readystate.
      iframe.readyState = 'complete';
      this.activateIframe_();

      if (this.isTrackingFrame_) {
        // Prevent this iframe from ever being recreated.
        this.iframeSrc = null;

        Services.timerFor(this.win)
          .promise(trackingIframeTimeout)
          .then(() => {
            removeElement(iframe);
            this.element.setAttribute('amp-removed', '');
            this.iframe_ = null;
          });
      }
    };

    listenFor(
      iframe,
      'embed-size',
      (data) => {
        this.updateSize_(data['height'], data['width']);
      },
      /*opt_is3P*/ undefined,
      /*opt_includingNestedWindows*/ undefined,
      /*opt_allowOpaqueOrigin*/ true
    );

    // Listen for resize messages sent by Pym.js.
    this.unlistenPym_ = listen(this.win, 'message', (event) => {
      return this.listenForPymMessage_(/** @type {!MessageEvent} */ (event));
    });

    if (this.hasPlaceholder_) {
      listenFor(iframe, 'embed-ready', this.activateIframe_.bind(this));
    }

    listenFor(
      iframe,
      MessageType_Enum.SEND_CONSENT_DATA,
      (data, source, origin) => {
        this.sendConsentData_(source, origin);
      }
    );

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

      this.pauseHelper_.updatePlaying(true);
    });
  }

  /**
   * Listen for Pym.js messages for 'height' and 'width'.
   *
   * @see http://blog.apps.npr.org/pym.js/
   * @param {!MessageEvent} event
   * @private
   */
  listenForPymMessage_(event) {
    if (!this.iframe_ || event.source !== this.iframe_.contentWindow) {
      return;
    }
    const data = getData(event);
    if (typeof data !== 'string' || !data.startsWith('pym')) {
      return;
    }

    // The format of the message takes the form of `pymxPYMx${id}xPYMx${type}xPYMx${message}`.
    // The id is unnecessary for integration with amp-iframe; the possible types include
    // 'height', 'width', 'parentPositionInfo', 'navigateTo', and  'scrollToChildPos'.
    // Only the 'height' and 'width' messages are currently supported.
    // See <https://github.com/nprapps/pym.js/blob/57feb68/src/pym.js#L85-L102>
    const args = data.split(/xPYMx/);
    if ('height' === args[2]) {
      this.updateSize_(parseInt(args[3], 10), undefined);
    } else if ('width' === args[2]) {
      this.updateSize_(undefined, parseInt(args[3], 10));
    } else {
      user().warn(TAG_, `Unsupported Pym.js message: ${data}`);
    }
  }

  /**
   * Requests consent data from consent module
   * and forwards information to iframe
   * @param {Window} source
   * @param {string} origin
   * @private
   */
  sendConsentData_(source, origin) {
    getConsentDataToForward(this.element, this.getConsentPolicy()).then(
      (consents) => {
        this.sendConsentDataToIframe_(source, origin, {
          'sentinel': 'amp',
          'type': MessageType_Enum.CONSENT_DATA,
          ...consents,
        });
      }
    );
  }

  /**
   * Send consent data to iframe
   * @param {Window} source
   * @param {string} origin
   * @param {JsonObject} data
   * @private
   */
  sendConsentDataToIframe_(source, origin, data) {
    source./*OK*/ postMessage(data, origin);
  }

  /**
   * Removes this iframe from the page, freeing its resources. This is needed
   * to stop the bad eggs who continue to play videos even after the user has
   * swiped away from the doc.
   * @override
   **/
  unlayoutCallback() {
    if (this.unlistenPym_) {
      this.unlistenPym_();
      this.unlistenPym_ = null;
    }
    if (this.iframe_) {
      removeElement(this.iframe_);
      if (this.placeholder_) {
        this.togglePlaceholder(true);
      }

      this.iframe_ = null;
      // Needs to clean up intersectionObserverHostApi_
      if (this.intersectionObserverHostApi_) {
        this.intersectionObserverHostApi_.destroy();
        this.intersectionObserverHostApi_ = null;
      }
    }
    this.pauseHelper_.updatePlaying(false);
    return true;
  }

  /** @override  */
  getLayoutPriority() {
    if (this.isAdLike_) {
      return LayoutPriority_Enum.ADS; // See AmpAd3PImpl.
    }
    if (this.isTrackingFrame_) {
      return LayoutPriority_Enum.METADATA;
    }
    return super.getLayoutPriority();
  }

  /** @override */
  mutatedAttributesCallback(mutations) {
    const src = mutations['src'];
    if (src !== undefined) {
      this.iframeSrc = /** @type {?string} */ (this.transformSrc_(src));
      if (this.iframe_) {
        this.iframe_.src = this.assertSource_(
          /** @type {string} */ (this.iframeSrc),
          window.location.href,
          this.sandbox_
        );
      }
    }
    if (this.iframe_ && mutations['title']) {
      // only propagating title because propagating all causes e2e error:
      propagateAttributes(['title'], this.element, this.iframe_);
    }
  }

  /** @override */
  unlayoutOnPause() {
    return true;
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
  firstLayoutCompleted() {}

  /**
   * Throws an error if window navigation is disallowed by this element.
   * Otherwise, does nothing.
   * @throws {!Error}
   */
  throwIfCannotNavigate() {
    if (!this.sandboxContainsToken_(this.sandbox_, 'allow-top-navigation')) {
      throw user().createError(
        '"AMP.navigateTo" is only allowed on ' +
          '<amp-iframe> when its "sandbox" attribute contains ' +
          '"allow-top-navigation".'
      );
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
      if (!this.hasErroredEmbedSize_) {
        this.user().error(
          TAG_,
          'Ignoring embed-size request because this iframe is not resizable',
          this.element
        );
        this.hasErroredEmbedSize_ = true;
      }
      return;
    }

    if (height < 100) {
      this.user().error(
        TAG_,
        'Ignoring embed-size request because the resize height is less ' +
          'than 100px. If you are using amp-iframe to display ads, consider ' +
          'using amp-ad instead.',
        this.element
      );
      return;
    }

    // Calculate new width and height of the container to include the padding.
    // If padding is negative, just use the requested width and height directly.
    let newHeight, newWidth;
    height = parseInt(height, 10);
    if (!isNaN(height)) {
      newHeight = Math.max(
        height +
          (this.element./*OK*/ offsetHeight - this.iframe_./*OK*/ offsetHeight),
        height
      );
    }
    width = parseInt(width, 10);
    if (!isNaN(width)) {
      newWidth = Math.max(
        width +
          (this.element./*OK*/ offsetWidth - this.iframe_./*OK*/ offsetWidth),
        width
      );
    }

    if (newHeight !== undefined || newWidth !== undefined) {
      this.attemptChangeSize(newHeight, newWidth).then(
        () => {
          if (newHeight !== undefined) {
            this.element.setAttribute('height', newHeight);
          }
          if (newWidth !== undefined) {
            this.element.setAttribute('width', newWidth);
          }
          this.element.overflowCallback(
            /* overflown */ false,
            newHeight,
            newWidth
          );
        },
        () => {}
      );
    } else {
      this.user().error(
        TAG_,
        'Ignoring embed-size request because ' +
          'no width or height value is provided',
        this.element
      );
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
    this.registerAction('postMessage', (invocation) => {
      if (this.targetOrigin_) {
        this.iframe_.contentWindow./*OK*/ postMessage(
          invocation.args,
          this.targetOrigin_
        );
      } else {
        user().error(
          TAG_,
          '"postMessage" action is only allowed with "src"' +
            'attribute with an origin.'
        );
      }
    });

    // However, don't listen for 'message' event if targetOrigin_ is null.
    if (!this.targetOrigin_) {
      return;
    }

    const maxUnexpectedMessages = 10;
    let unexpectedMessages = 0;

    const listener = (e) => {
      if (e.source !== this.iframe_.contentWindow) {
        // Ignore messages from other iframes.
        return;
      }
      if (e.origin !== this.targetOrigin_) {
        user().error(
          TAG_,
          '"message" received from unexpected origin: ' +
            e.origin +
            '. Only allowed from: ' +
            this.targetOrigin_
        );
        return;
      }
      if (!this.isUserGesture_()) {
        unexpectedMessages++;
        user().error(
          TAG_,
          '"message" event may only be triggered from a user gesture.'
        );
        // Disable the 'message' event if the iframe is behaving badly.
        if (unexpectedMessages >= maxUnexpectedMessages) {
          user().error(
            TAG_,
            'Too many non-gesture-triggered "message" ' +
              'events; detaching event listener.'
          );
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
      const event = createCustomEvent(this.win, 'amp-iframe:message', {
        'data': sanitized,
      });
      const actionService = Services.actionServiceForDoc(this.element);
      actionService.trigger(
        this.element,
        'message',
        event,
        ActionTrust_Enum.HIGH
      );
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
    playIgnoringError(audio);
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
      'i-amphtml-scroll-container'
    );
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

AMP.extension(TAG_, '0.1', (AMP) => {
  AMP.registerElement(TAG_, AmpIframe);
});
