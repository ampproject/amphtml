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

import {AdDisplayState} from './amp-ad-ui';
import {CommonSignals} from '../../../src/common-signals';
import {
  IntersectionObserver,
} from '../../../src/intersection-observer';
import {
  SubscriptionApi,
  listenFor,
  listenForOncePromise,
  postMessageToWindows,
} from '../../../src/iframe-helper';
import {viewerForDoc} from '../../../src/services';
import {dev} from '../../../src/log';
import {timerFor} from '../../../src/services';
import {setStyle} from '../../../src/style';
import {loadPromise} from '../../../src/event-helper';
import {getHtml} from '../../../src/get-html';
import {removeElement} from '../../../src/dom';
import {getServiceForDoc} from '../../../src/service';
import {MessageType} from '../../../src/3p-frame-messaging';
import {isExperimentOn} from '../../../src/experiments';
import {
  installPositionObserverServiceForDoc,
  PositionObserverFidelity,
} from '../../../src/service/position-observer-impl';



const VISIBILITY_TIMEOUT = 10000;


export class AmpAdXOriginIframeHandler {

  /**
   * @param {!./amp-ad-3p-impl.AmpAd3PImpl|!../../amp-a4a/0.1/amp-a4a.AmpA4A} baseInstance
   */
  constructor(baseInstance) {

    /** @private */
    this.baseInstance_ = baseInstance;

    /** @private {!Element} */
    this.element_ = baseInstance.element;

    /** @private {?AMP.AmpAdUIHandler} */
    this.uiHandler_ = baseInstance.uiHandler;

    /** {?Element} iframe instance */
    this.iframe = null;

    /** @private {?IntersectionObserver} */
    this.intersectionObserver_ = null;

    /** @private {SubscriptionApi} */
    this.embedStateApi_ = null;

    /** @private {?SubscriptionApi} */
    this.positionObserverHighFidelityApi_ = null;

    /**
     * {?../../../src/service/position-observer-impl.AbstractPositionObserver}
     * @private
     */
    this.positionObserver_ = null;

    /** @private {!Array<!Function>} functions to unregister listeners */
    this.unlisteners_ = [];

    /** @private @const {!../../../src/service/viewer-impl.Viewer} */
    this.viewer_ = viewerForDoc(this.baseInstance_.getAmpDoc());
  }

  /**
   * Sets up listeners and iframe state for iframe containing ad creative.
   * @param {!Element} iframe
   * @param {boolean=} opt_isA4A when true do not listen to ad response
   * @return {!Promise} awaiting render complete promise
   */
  init(iframe, opt_isA4A) {
    dev().assert(
        !this.iframe, 'multiple invocations of init without destroy!');
    this.iframe = iframe;
    this.iframe.setAttribute('scrolling', 'no');
    this.baseInstance_.applyFillContent(this.iframe);
    const timer = timerFor(this.baseInstance_.win);

    // Init IntersectionObserver service.
    this.intersectionObserver_ = new IntersectionObserver(
        this.baseInstance_, this.iframe, true);

    this.embedStateApi_ = new SubscriptionApi(
        this.iframe, 'send-embed-state', true,
        () => this.sendEmbedInfo_(this.baseInstance_.isInViewport()));

    // High-fidelity positions for scrollbound animations.
    // Protected by 'amp-animation' experiment for now.
    if (isExperimentOn(this.baseInstance_.win, 'amp-animation')) {
      this.positionObserverHighFidelityApi_ = new SubscriptionApi(
        this.iframe, MessageType.SEND_POSITIONS_HIGH_FIDELITY, true, () => {
          const ampdoc = this.baseInstance_.getAmpDoc();
          installPositionObserverServiceForDoc(ampdoc);
          this.positionObserver_ = getServiceForDoc(ampdoc,
              'position-observer');
          // TODO(@zhouyx, #9208) Need to unobserve it during cleanup
          this.positionObserver_.observe(
            this.iframe,
            PositionObserverFidelity.HIGH, pos => {
              this.positionObserverHighFidelityApi_.send(
                MessageType.POSITION_HIGH_FIDELITY,
                pos);
            });
        });
    }

    // Triggered by context.reportRenderedEntityIdentifier(…) inside the ad
    // iframe.
    listenForOncePromise(this.iframe, 'entity-id', true)
        .then(info => {
          this.element_.creativeId = info.data.id;
        });

    this.unlisteners_.push(listenFor(this.iframe, 'get-html',
      (info, source, origin) => {
        if (!this.iframe) {
          return;
        }

        const {selector, attributes, messageId} = info;
        let content = '';

        if (this.element_.hasAttribute('data-html-access-allowed')) {
          content = getHtml(this.baseInstance_.win, selector, attributes);
        }

        postMessageToWindows(
            this.iframe, [{win: source, origin}],
            'get-html-result', {content, messageId}, true
          );
      }, true, false));

    // Install iframe resize API.
    this.unlisteners_.push(listenFor(this.iframe, 'embed-size',
        (data, source, origin) => {
          this.handleResize_(data.height, data.width, source, origin);
        }, true, true));

    this.unlisteners_.push(this.viewer_.onVisibilityChanged(() => {
      this.sendEmbedInfo_(this.baseInstance_.isInViewport());
    }));

    // Iframe.onload normally called by the Ad after full load.
    const iframeLoadPromise = loadPromise(this.iframe).then(() => {
      // Wait just a little to allow `no-content` message to arrive.
      if (this.iframe) {
        // Chrome does not reflect the iframe readystate.
        this.iframe.readyState = 'complete';
      }
      return timer.promise(10);
    });
    if (this.baseInstance_.emitLifecycleEvent) {
      // Only set up a load listener if we know that we can send lifecycle
      // messages.
      iframeLoadPromise.then(() => {
        this.baseInstance_.emitLifecycleEvent('xDomIframeLoaded');
      });
    }

    // Calculate render-start and no-content signals.
    let renderStartResolve;
    const renderStartPromise = new Promise(resolve => {
      renderStartResolve = resolve;
    });
    let noContentResolve;
    const noContentPromise = new Promise(resolve => {
      noContentResolve = resolve;
    });
    if (this.baseInstance_.config &&
            this.baseInstance_.config.renderStartImplemented) {
      // When `render-start` is supported, these signals are mutually
      // exclusive. Whichever arrives first wins.
      listenForOncePromise(this.iframe,
          ['render-start', 'no-content'], true).then(info => {
            const data = info.data;
            if (data.type == 'render-start') {
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
    if (opt_isA4A) {
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
      this.baseInstance_.lifecycleReporter.addPingsForVisibility(this.element_);
    }

    Promise.race([
      renderStartPromise,
      iframeLoadPromise,
      timer.promise(VISIBILITY_TIMEOUT),
    ]).then(() => {
      if (this.iframe) {
        setStyle(this.iframe, 'visibility', '');
        if (this.baseInstance_.emitLifecycleEvent) {
          this.baseInstance_.emitLifecycleEvent('adSlotUnhidden');
        }
      }
    });

    // The actual ad load is eariliest of iframe.onload event and no-content.
    return Promise.race([iframeLoadPromise, noContentPromise]);
  }

  /**
   * callback functon on receiving render-start
   * @param {!Object=} opt_info
   * @private
   */
  renderStart_(opt_info) {
    this.uiHandler_.setDisplayState(AdDisplayState.LOADED_RENDER_START);
    this.baseInstance_.renderStarted();
    if (!opt_info) {
      return;
    }
    const data = opt_info.data;
    this.handleResize_(
        data.height, data.width, opt_info.source, opt_info.origin);
    if (this.baseInstance_.emitLifecycleEvent) {
      this.baseInstance_.emitLifecycleEvent('renderCrossDomainStart');
    }
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
    this.uiHandler_.setDisplayState(AdDisplayState.LOADED_NO_CONTENT);
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
    if (this.positionObserverHighFidelityApi_) {
      this.positionObserverHighFidelityApi_.destroy();
      this.positionObserverHighFidelityApi_ = null;
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
        {requestedWidth, requestedHeight},
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
    this.embedStateApi_.send('embed-state', {
      inViewport,
      pageHidden: !this.viewer_.isVisible(),
    });
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
}

// Make the class available to other late loaded amp-ad implementations
// without them having to depend on it directly.
AMP.AmpAdXOriginIframeHandler = AmpAdXOriginIframeHandler;
