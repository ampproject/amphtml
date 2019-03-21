/**
 * Copyright 2016 The AMP HTML Authors. All Rights Reserved.
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

import {
  ADSENSE_EXPERIMENTS,
  ADSENSE_EXP_NAMES,
} from '../../amp-ad-network-adsense-impl/0.1/adsense-a4a-config';
import {
  CONSTANTS,
  MessageType,
} from '../../../src/3p-frame-messaging';
import {CommonSignals} from '../../../src/common-signals';
import {Deferred} from '../../../src/utils/promise';
import {
  IntersectionObserver,
} from '../../../src/intersection-observer';
import {Services} from '../../../src/services';
import {
  SubscriptionApi,
  listenFor,
  listenForOncePromise,
  postMessageToWindows,
} from '../../../src/iframe-helper';
import {dev, devAssert} from '../../../src/log';
import {dict} from '../../../src/utils/object';
import {getData} from '../../../src/event-helper';
import {
  getExperimentBranch,
  isExperimentOn,
} from '../../../src/experiments';
import {getHtml} from '../../../src/get-html';
import {removeElement} from '../../../src/dom';
import {reportErrorToAnalytics} from '../../../src/error';
import {setStyle} from '../../../src/style';
import {throttle} from '../../../src/utils/rate-limit';

const VISIBILITY_TIMEOUT = 10000;

const MIN_INABOX_POSITION_EVENT_INTERVAL = 100;


export class AmpAdXOriginIframeHandler {

  /**
   * @param {!./amp-ad-3p-impl.AmpAd3PImpl|!../../amp-a4a/0.1/amp-a4a.AmpA4A} baseInstance
   */
  constructor(baseInstance) {
    /** @private {!Window} */
    this.win_ = baseInstance.win;

    /** @private */
    this.baseInstance_ = baseInstance;

    /** @private {!Element} */
    this.element_ = baseInstance.element;

    /** @private {?AMP.AmpAdUIHandler} */
    this.uiHandler_ = baseInstance.uiHandler;

    /** @type {?Element} iframe instance */
    this.iframe = null;

    /** @private {?IntersectionObserver} */
    this.intersectionObserver_ = null;

    /** @private {SubscriptionApi} */
    this.embedStateApi_ = null;

    /** @private {?SubscriptionApi} */
    this.inaboxPositionApi_ = null;

    /** @private {boolean} */
    this.isInaboxPositionApiInit_ = false;

    /** @private {!Array<!Function>} functions to unregister listeners */
    this.unlisteners_ = [];

    /** @private @const {!../../../src/service/viewer-impl.Viewer} */
    this.viewer_ = Services.viewerForDoc(this.baseInstance_.getAmpDoc());

    /** @private @const {!../../../src/service/viewport/viewport-impl.Viewport} */
    this.viewport_ = Services.viewportForDoc(this.baseInstance_.getAmpDoc());

    /** @private {boolean} */
    this.sendPositionPending_ = false;
  }


  /**
   * Sets up listeners and iframe state for iframe containing ad creative.
   * @param {!Element} iframe
   * @param {boolean=} opt_isA4A when true do not listen to ad response
   * @param {boolean=} opt_letCreativeTriggerRenderStart Whether to wait for
   *    render start from the creative, or simply trigger it in here.
   * @return {!Promise} awaiting render complete promise
   */
  init(iframe, opt_isA4A, opt_letCreativeTriggerRenderStart) {
    devAssert(
        !this.iframe, 'multiple invocations of init without destroy!');
    this.iframe = iframe;
    this.iframe.setAttribute('scrolling', 'no');
    this.baseInstance_.applyFillContent(this.iframe);
    const timer = Services.timerFor(this.baseInstance_.win);

    // Init IntersectionObserver service.
    this.intersectionObserver_ = new IntersectionObserver(
        this.baseInstance_, this.iframe, true);

    this.embedStateApi_ = new SubscriptionApi(
        this.iframe, 'send-embed-state', true,
        () => this.sendEmbedInfo_(this.baseInstance_.isInViewport()));

    // TODO(bradfrizzell): Would be better to turn this on if
    // A4A.isXhrEnabled() is false, or if we simply decide it is
    // ok to turn this on for all traffic.
    if (getExperimentBranch(
        this.win_, ADSENSE_EXP_NAMES.UNCONDITIONED_CANONICAL) ==
       ADSENSE_EXPERIMENTS.UNCONDITIONED_CANONICAL_EXP ||
       getExperimentBranch(this.win_, ADSENSE_EXP_NAMES.CANONICAL) ==
        ADSENSE_EXPERIMENTS.CANONICAL_EXP ||
       isExperimentOn(this.win_, 'inabox-position-api')) {
      // To provide position to inabox.
      this.inaboxPositionApi_ = new SubscriptionApi(
          this.iframe, MessageType.SEND_POSITIONS, true, () => {
            // TODO(@zhouyx): Make sendPosition_ only send to
            // message origin iframe
            this.sendPosition_();
            this.registerPosition_();
          });
    }
    // Triggered by context.reportRenderedEntityIdentifier(…) inside the ad
    // iframe.
    listenForOncePromise(this.iframe, 'entity-id', true)
        .then(info => {
          this.element_.creativeId = info.data['id'];
        });

    this.handleOneTimeRequest_(MessageType.GET_HTML, payload => {
      const selector = payload['selector'];
      const attributes = payload['attributes'];
      let content = '';
      if (this.element_.hasAttribute('data-html-access-allowed')) {
        content = getHtml(this.baseInstance_.win, selector, attributes);
      }
      return Promise.resolve(content);
    });

    this.handleOneTimeRequest_(MessageType.GET_CONSENT_STATE, () => {
      return this.baseInstance_.getConsentState().then(consentState => {
        return {consentState};
      });
    });

    // Install iframe resize API.
    this.unlisteners_.push(listenFor(this.iframe, 'embed-size',
        (data, source, origin) => {
          if (!!data['hasOverflow']) {
            this.element_.warnOnMissingOverflow = false;
          }
          this.handleResize_(data['height'], data['width'], source, origin);
        }, true, true));

    this.unlisteners_.push(this.viewer_.onVisibilityChanged(() => {
      this.sendEmbedInfo_(this.baseInstance_.isInViewport());
    }));

    this.unlisteners_.push(listenFor(this.iframe,
        MessageType.USER_ERROR_IN_IFRAME, data => {
          this.userErrorForAnalytics_(data['message']);
        }, true, true /* opt_includingNestedWindows */));

    // Iframe.onload normally called by the Ad after full load.
    const iframeLoadPromise = this.baseInstance_.loadPromise(this.iframe)
        .then(() => {
          // Wait just a little to allow `no-content` message to arrive.
          if (this.iframe) {
            // Chrome does not reflect the iframe readystate.
            this.iframe.readyState = 'complete';
          }
          return timer.promise(10);
        });

    // Calculate render-start and no-content signals.
    const {
      promise: renderStartPromise,
      resolve: renderStartResolve,
    } = new Deferred();
    const {
      promise: noContentPromise,
      resolve: noContentResolve,
    } = new Deferred();

    if (this.baseInstance_.config &&
            this.baseInstance_.config.renderStartImplemented) {
      // When `render-start` is supported, these signals are mutually
      // exclusive. Whichever arrives first wins.
      listenForOncePromise(this.iframe,
          ['render-start', 'no-content'], true).then(info => {
        const {data} = info;
        if (data['type'] == 'render-start') {
          this.renderStart_(info);
          renderStartResolve();
        } else {
          this.noContent_();
          noContentResolve();
        }
      });
    } else {
      // If `render-start` is not supported, listen to `bootstrap-loaded`.
      // This will avoid keeping the Ad empty until it's fully loaded, which
      // could be a long time.
      listenForOncePromise(this.iframe, 'bootstrap-loaded', true).then(() => {
        this.renderStart_();
        renderStartResolve();
      });
      // Likewise, no-content is observed here. However, it's impossible to
      // assure exclusivity between `no-content` and `bootstrap-loaded` b/c
      // `bootstrap-loaded` always arrives first.
      listenForOncePromise(this.iframe, 'no-content', true).then(() => {
        this.noContent_();
        noContentResolve();
      });
    }

    // Wait for initial load signal. Notice that this signal is not
    // used to resolve the final layout promise because iframe may still be
    // consuming significant network and CPU resources.
    listenForOncePromise(this.iframe, CommonSignals.INI_LOAD, true).then(() => {
      // TODO(dvoytenko, #7788): ensure that in-a-box "ini-load" message is
      // received here as well.
      this.baseInstance_.signals().signal(CommonSignals.INI_LOAD);
    });

    this.element_.appendChild(this.iframe);
    if (opt_isA4A && !opt_letCreativeTriggerRenderStart) {
      // A4A writes creative frame directly to page once creative is received
      // and therefore does not require render start message so attach and
      // impose no loader delay.  Network is using renderStart or
      // bootstrap-loaded to indicate ad request was sent, either way we know
      // that occurred for Fast Fetch.
      this.renderStart_();
      renderStartResolve();
    } else {
      // Set iframe initially hidden which will be removed on render-start or
      // load, whichever is earlier.
      setStyle(this.iframe, 'visibility', 'hidden');
    }

    Promise.race([
      renderStartPromise,
      iframeLoadPromise,
      timer.promise(VISIBILITY_TIMEOUT),
    ]).then(() => {
      if (this.iframe) {
        setStyle(this.iframe, 'visibility', '');
      }
    });

    // The actual ad load is eariliest of iframe.onload event and no-content.
    return Promise.race([iframeLoadPromise, noContentPromise]);
  }

  /**
   * @param {string} requestType
   * @param {function(*)} getter
   * @private
   */
  handleOneTimeRequest_(requestType, getter) {
    this.unlisteners_.push(listenFor(this.iframe, requestType,
        (info, source, origin) => {
          if (!this.iframe) {
            return;
          }

          const messageId = info[CONSTANTS.messageIdFieldName];
          const payload = info[CONSTANTS.payloadFieldName];

          getter(payload).then(content => {
            const result = dict();
            result[CONSTANTS.messageIdFieldName] = messageId;
            result[CONSTANTS.contentFieldName] = content;
            postMessageToWindows(
                dev().assertElement(this.iframe), [{win: source, origin}],
                requestType + CONSTANTS.responseTypeSuffix,
                result, true
            );
          });
        }, true /* opt_is3P */, false /* opt_includingNestedWindows */));
  }

  /**
   * callback functon on receiving render-start
   * @param {{data: !JsonObject}=} opt_info
   * @private
   */
  renderStart_(opt_info) {
    this.baseInstance_.renderStarted();
    if (!opt_info) {
      return;
    }
    const data = getData(opt_info);
    this.handleResize_(
        data['height'], data['width'], opt_info['source'], opt_info['origin']);
  }

  /**
   * Cleans up the listeners on the cross domain ad iframe and frees the
   * iframe resource.
   * @param {boolean=} opt_keep
   */
  freeXOriginIframe(opt_keep) {
    this.cleanup_();
    // If ask to keep the iframe.
    // Use in the case of no-content and iframe is a master iframe.
    if (opt_keep) {
      return;
    }
    if (this.iframe) {
      removeElement(this.iframe);
      this.iframe = null;
    }
  }

  /**
   * Cleans up listeners on the ad, and apply the default UI for ad.
   * @private
   */
  noContent_() {
    if (!this.iframe) {
      // unlayout already called
      return;
    }
    this.freeXOriginIframe(this.iframe.name.indexOf('_master') >= 0);
    this.uiHandler_.applyNoContentUI();
  }

  /**
   * Cleans up listeners on the ad iframe.
   * @private
   */
  cleanup_() {
    this.unlisteners_.forEach(unlistener => unlistener());
    this.unlisteners_.length = 0;
    if (this.embedStateApi_) {
      this.embedStateApi_.destroy();
      this.embedStateApi_ = null;
    }
    if (this.inaboxPositionApi_) {
      this.inaboxPositionApi_.destroy();
      this.inaboxPositionApi_ = null;
    }
    if (this.intersectionObserver_) {
      this.intersectionObserver_.destroy();
      this.intersectionObserver_ = null;
    }
  }

  /**
   * Updates the element's dimensions to accommodate the iframe's
   * requested dimensions. Notifies the window that request the resize
   * of success or failure.
   * @param {number|string|undefined} height
   * @param {number|string|undefined} width
   * @param {!Window} source
   * @param {string} origin
   * @private
   */
  handleResize_(height, width, source, origin) {
    this.baseInstance_.getVsync().mutate(() => {
      if (!this.iframe) {
        // iframe can be cleanup before vsync.
        return;
      }
      const iframeHeight = this.iframe./*OK*/offsetHeight;
      const iframeWidth = this.iframe./*OK*/offsetWidth;
      this.uiHandler_.updateSize(height, width, iframeHeight,
          iframeWidth).then(info => {
        this.sendEmbedSizeResponse_(info.success,
            info.newWidth, info.newHeight, source, origin);
      }, () => {});
    });
  }

  /**
   * Sends a response to the window which requested a resize.
   * @param {boolean} success
   * @param {number} requestedWidth
   * @param {number} requestedHeight
   * @param {!Window} source
   * @param {string} origin
   * @private
   */
  sendEmbedSizeResponse_(success, requestedWidth, requestedHeight, source,
    origin) {
    // The iframe may have been removed by the time we resize.
    if (!this.iframe) {
      return;
    }
    postMessageToWindows(
        this.iframe,
        [{win: source, origin}],
        success ? 'embed-size-changed' : 'embed-size-denied',
        dict({
          'requestedWidth': requestedWidth,
          'requestedHeight': requestedHeight,
        }),
        true);
  }

  /**
   * @param {boolean} inViewport
   * @private
   */
  sendEmbedInfo_(inViewport) {
    if (!this.embedStateApi_) {
      return;
    }
    this.embedStateApi_.send('embed-state', dict({
      'inViewport': inViewport,
      'pageHidden': !this.viewer_.isVisible(),
    }));
  }

  /**
   * Retrieve iframe position entry in next animation frame.
   * @private
   */
  getIframePositionPromise_() {
    return this.viewport_.getClientRectAsync(
        dev().assertElement(this.iframe)).then(position => {
      devAssert(position,
          'element clientRect should intersects with root clientRect');
      const viewport = this.viewport_.getRect();
      return dict({
        'targetRect': position,
        'viewportRect': viewport,
      });
    });
  }

  /** @private */
  sendPosition_() {
    if (this.sendPositionPending_) {
      // Only send once in single animation frame.
      return;
    }

    this.sendPositionPending_ = true;
    this.getIframePositionPromise_().then(position => {
      this.sendPositionPending_ = false;
      this.inaboxPositionApi_.send(MessageType.POSITION, position);
    });
  }

  /** @private */
  registerPosition_() {
    if (this.isInaboxPositionApiInit_) {
      // only register to viewport scroll/resize once
      return;
    }

    this.isInaboxPositionApiInit_ = true;
    // Send window scroll/resize event to viewport.
    this.unlisteners_.push(this.viewport_.onScroll(throttle(this.win_, () => {
      this.getIframePositionPromise_().then(position => {
        this.inaboxPositionApi_.send(MessageType.POSITION, position);
      });
    }, MIN_INABOX_POSITION_EVENT_INTERVAL)));
    this.unlisteners_.push(this.viewport_.onResize(() => {
      this.getIframePositionPromise_().then(position => {
        this.inaboxPositionApi_.send(MessageType.POSITION, position);
      });
    }));
  }

  /**
   * See BaseElement method.
   * @param {boolean} inViewport
   */
  viewportCallback(inViewport) {
    if (this.intersectionObserver_) {
      this.intersectionObserver_.onViewportCallback(inViewport);
    }
    this.sendEmbedInfo_(inViewport);
  }


  /**
   * See BaseElement method.
   */
  onLayoutMeasure() {
    // When the framework has the need to remeasure us, our position might
    // have changed. Send an intersection record if needed.
    if (this.intersectionObserver_) {
      this.intersectionObserver_.fire();
    }
  }

  /**
   * @param {string} message
   * @private
   */
  userErrorForAnalytics_(message) {
    if (typeof message == 'string') {
      const e = new Error(message);
      e.name = '3pError';
      reportErrorToAnalytics(e, this.baseInstance_.win);
    }
  }
}

// Make the class available to other late loaded amp-ad implementations
// without them having to depend on it directly.
AMP.AmpAdXOriginIframeHandler = AmpAdXOriginIframeHandler;
