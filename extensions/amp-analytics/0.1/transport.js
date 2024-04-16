import {removeElement} from '#core/dom';
import {toggle} from '#core/dom/style';
import {getWin} from '#core/window';
import {WindowInterface} from '#core/window/interface';

import {Services} from '#service';

import {loadPromise} from '#utils/event-helper';
import {dev, user, userAssert} from '#utils/log';

import {IframeTransport} from './iframe-transport';
import {
  BatchSegmentDef,
  RequestDef,
  TransportSerializerDef,
  TransportSerializers,
  defaultSerializer,
} from './transport-serializer';

import {getAmpAdResourceId} from '../../../src/ad-helper';
import {getMode} from '../../../src/mode';
import {createPixel} from '../../../src/pixel';
import {getTopWindow} from '../../../src/service-helpers';
import {
  assertHttpsUrl,
  checkCorsUrl,
  isAmpScriptUri,
  parseUrlDeprecated,
} from '../../../src/url';

/** @const {string} */
const TAG_ = 'amp-analytics/transport';

/**
 * Transport defines the ways how the analytics pings are going to be sent.
 */
export class Transport {
  /**
   * @param {!AmpDoc} ampdoc
   * @param {!JsonObject} options
   */
  constructor(ampdoc, options = /** @type {!JsonObject} */ ({})) {
    /** @private {!AmpDoc} */
    this.ampdoc_ = ampdoc;

    /** @private {!Window} */
    this.win_ = ampdoc.win;

    /** @private {!JsonObject} */
    this.options_ = options;

    /** @private {string|undefined} */
    this.referrerPolicy_ = /** @type {string|undefined} */ (
      this.options_['referrerPolicy']
    );

    // no-referrer is only supported in image transport
    if (this.referrerPolicy_ === 'no-referrer') {
      this.options_['beacon'] = false;
      this.options_['xhrpost'] = false;
    }

    /** @private {boolean} */
    this.useBody_ = !!this.options_['useBody'];

    /** @private {?IframeTransport} */
    this.iframeTransport_ = null;

    /** @private {boolean} */
    this.isInabox_ = getMode(this.win_).runtime == 'inabox';

    /** @private {string|undefined} */
    this.attributionSrc_ = /** @type {string|undefined} */ (
      this.options_['attributionsrc']
    );
  }

  /**
   * @param {string} url
   * @param {!Array<!BatchSegmentDef>} segments
   * @param {boolean} inBatch
   */
  sendRequest(url, segments, inBatch) {
    if (!url || segments.length === 0) {
      dev().info(TAG_, 'Empty request not sent: ', url);
      return;
    }
    const serializer = this.getSerializer_();
    /**
     * @param {boolean} withPayload
     * @return {!RequestDef}
     */
    function generateRequest(withPayload) {
      const request = inBatch
        ? serializer.generateBatchRequest(url, segments, withPayload)
        : serializer.generateRequest(url, segments[0], withPayload);
      if (!isAmpScriptUri(request.url)) {
        assertHttpsUrl(request.url, 'amp-analytics request');
        checkCorsUrl(request.url);
      }
      return request;
    }

    const getRequest = cacheFuncResult(generateRequest);

    if (this.options_['iframe']) {
      if (!this.iframeTransport_) {
        dev().error(TAG_, 'iframe transport was inadvertently deleted');
        return;
      }
      this.iframeTransport_.sendRequest(getRequest(false).url);
      return;
    }

    if (this.options_['amp-script']) {
      Transport.forwardRequestToAmpScript(this.ampdoc_, {
        url,
        payload: getRequest(true).payload,
      });
      return;
    }

    if (
      this.options_['beacon'] &&
      Transport.sendRequestUsingBeacon(this.win_, getRequest(this.useBody_))
    ) {
      return;
    }
    if (
      this.options_['xhrpost'] &&
      Transport.sendRequestUsingXhr(this.win_, getRequest(this.useBody_))
    ) {
      return;
    }
    const image = this.options_['image'];
    if (image) {
      const suppressWarnings =
        typeof image == 'object' && image['suppressWarnings'];
      Transport.sendRequestUsingImage(
        this.win_,
        getRequest(false),
        suppressWarnings,
        /** @type {string|undefined} */ (this.referrerPolicy_),
        /** @type {string|undefined} */ (this.attributionSrc_),
        this.ampdoc_
      );
      return;
    }
    user().warn(TAG_, 'Failed to send request', url, this.options_);
  }

  /**
   * amp-analytics will create an iframe for vendors in
   * extensions/amp-analytics/0.1/vendors/* who have transport/iframe defined.
   * This is limited to MRC-accreddited vendors. The frame is removed if the
   * user navigates/swipes away from the page, and is recreated if the user
   * navigates back to the page.
   *
   * @param {!Element} element
   */
  maybeInitIframeTransport(element) {
    if (!this.options_['iframe'] || this.iframeTransport_) {
      return;
    }

    // In the case of FIE rendering, we should be using the parent doc win.
    const topWin = getTopWindow(getWin(element));
    const type = element.getAttribute('type');
    // In inabox there is no amp-ad element.
    const ampAdResourceId = this.isInabox_
      ? '1'
      : user().assertString(
          getAmpAdResourceId(element, topWin),
          'No friendly amp-ad ancestor element was found ' +
            'for amp-analytics tag with iframe transport.'
        );

    this.iframeTransport_ = new IframeTransport(
      topWin,
      type,
      this.options_,
      ampAdResourceId
    );
  }

  /**
   * Deletes iframe transport.
   */
  deleteIframeTransport() {
    if (this.iframeTransport_) {
      this.iframeTransport_.detach();
      this.iframeTransport_ = null;
    }
  }

  /**
   * Sends a ping request using an iframe, that is removed 5 seconds after
   * it is loaded.
   * This is not available as a standard transport, but rather used for
   * specific, allowlisted requests.
   * Note that this is unrelated to the iframeTransport
   *
   * @param {string} url
   * @param {!BatchSegmentDef} segment
   */
  sendRequestUsingIframe(url, segment) {
    const request = defaultSerializer(url, [segment]);
    if (!request) {
      user().error(TAG_, 'Request not sent. Contents empty.');
      return;
    }

    assertHttpsUrl(request, 'amp-analytics request');
    userAssert(
      parseUrlDeprecated(request).origin !=
        parseUrlDeprecated(this.win_.location.href).origin,
      'Origin of iframe request must not be equal to the document origin.' +
        ' See https://github.com/ampproject/' +
        'amphtml/blob/main/docs/spec/amp-iframe-origin-policy.md for details.'
    );

    /** @const {!Element} */
    const iframe = this.win_.document.createElement('iframe');
    toggle(iframe, false);
    iframe.onload = iframe.onerror = () => {
      Services.timerFor(this.win_).delay(() => {
        removeElement(iframe);
      }, 5000);
    };

    iframe.setAttribute('amp-analytics', '');
    iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin');
    iframe.src = request;
    this.win_.document.body.appendChild(iframe);
  }

  /**
   * @return {!TransportSerializerDef}
   */
  getSerializer_() {
    return /** @type {!TransportSerializerDef} */ (
      TransportSerializers['default']
    );
  }

  /**
   * @param {!Window} win
   * @param {!RequestDef} request
   * @param {boolean} suppressWarnings
   * @param {string|undefined} referrerPolicy
   * @param {string|undefined} attributionSrc
   * @param {!Element|!./service/ampdoc-impl.AmpDoc} elementOrAmpDoc Whether services are provided by an
   *     element.
   */
  static sendRequestUsingImage(
    win,
    request,
    suppressWarnings,
    referrerPolicy,
    attributionSrc,
    elementOrAmpDoc
  ) {
    if (!win) {
      return;
    }
    const image = createPixel(
      win,
      request.url,
      referrerPolicy,
      attributionSrc,
      elementOrAmpDoc
    );
    loadPromise(image)
      .then(() => {
        dev().fine(TAG_, 'Sent image request', request.url);
      })
      .catch(() => {
        if (!suppressWarnings) {
          user().warn(
            TAG_,
            'Response unparseable or failed to send image request',
            request.url
          );
        }
      });
  }

  /**
   * @param {!Window} win
   * @param {!RequestDef} request
   * @return {boolean} True if this browser supports navigator.sendBeacon.
   */
  static sendRequestUsingBeacon(win, request) {
    const sendBeacon = WindowInterface.getSendBeacon(win);
    if (!sendBeacon) {
      return false;
    }
    const result = sendBeacon(request.url, request.payload || '');
    if (result) {
      dev().fine(TAG_, 'Sent beacon request', request);
    }
    return result;
  }

  /**
   * @param {!Window} win
   * @param {!RequestDef} request
   * @return {boolean} True if this browser supports cross-domain XHR.
   */
  static sendRequestUsingXhr(win, request) {
    const XMLHttpRequest = WindowInterface.getXMLHttpRequest(win);
    if (!XMLHttpRequest) {
      return false;
    }
    const xhr = new XMLHttpRequest();
    if (!('withCredentials' in xhr)) {
      return false; // Looks like XHR level 1 - CORS is not supported.
    }
    xhr.open('POST', request.url, true);
    xhr.withCredentials = true;

    // Prevent pre-flight HEAD request.
    xhr.setRequestHeader('Content-Type', 'text/plain');

    xhr.onreadystatechange = () => {
      if (xhr.readyState == 4) {
        dev().fine(TAG_, 'Sent XHR request', request.url);
      }
    };

    xhr.send(request.payload || '');
    return true;
  }

  /**
   * @param {!AmpDoc} ampdoc
   * @param {!RequestDef} request
   * @return {!Promise}
   */
  static forwardRequestToAmpScript(ampdoc, request) {
    return Services.scriptForDocOrNull(ampdoc).then((ampScriptService) => {
      userAssert(ampScriptService, 'AMP-SCRIPT is not installed');
      ampScriptService.fetch(request.url, JSON.parse(request.payload));
    });
  }
}

/**
 * A helper method that wraps a function and cache its return value.
 *
 * @param {!Function} func the function to cache
 * @return {!Function}
 */
function cacheFuncResult(func) {
  const cachedValue = {};
  return (arg) => {
    const key = String(arg);
    if (cachedValue[key] === undefined) {
      cachedValue[key] = func(arg);
    }
    return cachedValue[key];
  };
}
