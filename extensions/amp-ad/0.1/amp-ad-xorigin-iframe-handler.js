import {isGoogleAdsA4AValidEnvironment} from '#ads/google/a4a/utils';

import {CONSTANTS, MessageType_Enum} from '#core/3p-frame-messaging';
import {CommonSignals_Enum} from '#core/constants/common-signals';
import {Deferred} from '#core/data-structures/promise';
import {removeElement} from '#core/dom';
import {getHtml} from '#core/dom/get-html';
import {applyFillContent} from '#core/dom/layout';
import {setStyle} from '#core/dom/style';
import {throttle} from '#core/types/function';

import {isExperimentOn} from '#experiments';

import {Services} from '#service';

import {getData} from '#utils/event-helper';
import {dev, devAssert} from '#utils/log';

import {LegacyAdIntersectionObserverHost} from './legacy-ad-intersection-observer-host';

import {reportErrorToAnalytics} from '../../../src/error-reporting';
import {
  SubscriptionApi,
  listenFor,
  listenForOncePromise,
  postMessageToWindows,
} from '../../../src/iframe-helper';

const VISIBILITY_TIMEOUT = 10000;

const MIN_INABOX_POSITION_EVENT_INTERVAL = 100;

/** @type {string} */
const TAG = 'amp-ad-xorigin-iframe';

/** @type {number} */
const MSEC_REPEATED_REQUEST_DELAY = 500;

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

    /** @private {?./amp-ad-ui.AmpAdUIHandler} */
    this.uiHandler_ = baseInstance.uiHandler;

    /** @type {?HTMLIFrameElement} iframe instance */
    this.iframe = null;

    /* This variable keeps keeps track when an invalid resize request is made, and
     * is associated with each iframe. If the request is invalid, then a new request
     * cannot be made until a certain amount of time has passed, 500 ms by default
     * (see MSEC_REPEATED_REQUEST_DELAY). Once the timer has cooled down,
     * a new request can be made.
     */
    /** @private {number} */
    this.lastRejectedResizeTime_ = 0;

    /** @private {?LegacyAdIntersectionObserverHost} */
    this.legacyIntersectionObserverApiHost_ = null;

    /** @private {SubscriptionApi} */
    this.embedStateApi_ = null;

    /** @private {?SubscriptionApi} */
    this.inaboxPositionApi_ = null;

    /** @private {boolean} */
    this.isInaboxPositionApiInit_ = false;

    /** @private {!Array<!Function>} functions to unregister listeners */
    this.unlisteners_ = [];

    /** @private @const {!../../../src/service/viewport/viewport-interface.ViewportInterface} */
    this.viewport_ = Services.viewportForDoc(this.baseInstance_.getAmpDoc());

    /** @private {boolean} */
    this.inViewport_ = false;

    /** @private {boolean} */
    this.sendPositionPending_ = false;
  }

  /**
   * Sets up listeners and iframe state for iframe containing ad creative.
   * @param {!HTMLIFrameElement} iframe
   * @param {boolean=} opt_isA4A when true do not listen to ad response
   * @param {boolean=} opt_letCreativeTriggerRenderStart Whether to wait for
   *    render start from the creative, or simply trigger it in here.
   * @return {!Promise} awaiting render complete promise
   */
  init(iframe, opt_isA4A, opt_letCreativeTriggerRenderStart) {
    devAssert(!this.iframe, 'multiple invocations of init without destroy!');
    this.iframe = iframe;
    this.iframe.setAttribute('scrolling', 'no');
    if (!this.uiHandler_.isStickyAd()) {
      applyFillContent(this.iframe);
    }
    const timer = Services.timerFor(this.baseInstance_.win);

    // Init the legacy observeInterection API service.
    // (Behave like position observer)
    this.legacyIntersectionObserverApiHost_ =
      new LegacyAdIntersectionObserverHost(this.baseInstance_, this.iframe);

    this.embedStateApi_ = new SubscriptionApi(
      this.iframe,
      'send-embed-state',
      true,
      () => this.sendEmbedInfo_(this.inViewport_)
    );

    // Enable creative position observer if inabox experiment enabled OR
    // adsense running on non-CDN cache where AMP creatives are xdomained and
    // may require this information.
    if (
      isExperimentOn(this.win_, 'inabox-position-api') ||
      (/^adsense$/i.test(this.element_.getAttribute('type')) &&
        !isGoogleAdsA4AValidEnvironment(this.win_))
    ) {
      // To provide position to inabox.
      this.inaboxPositionApi_ = new SubscriptionApi(
        this.iframe,
        MessageType_Enum.SEND_POSITIONS,
        true,
        () => {
          // TODO(@zhouyx): Make sendPosition_ only send to
          // message origin iframe
          this.sendPosition_();
          this.registerPosition_();
        }
      );
    }
    // Triggered by context.reportRenderedEntityIdentifier(…) inside the ad
    // iframe.
    listenForOncePromise(this.iframe, 'entity-id', true).then((info) => {
      this.element_.creativeId = info.data['id'];
    });

    this.handleOneTimeRequest_(MessageType_Enum.GET_HTML, (payload) => {
      const selector = payload['selector'];
      const attributes = payload['attributes'];
      let content = '';
      if (this.element_.hasAttribute('data-html-access-allowed')) {
        content = getHtml(this.baseInstance_.win, selector, attributes);
      }
      return Promise.resolve(content);
    });

    this.handleOneTimeRequest_(MessageType_Enum.GET_CONSENT_STATE, () => {
      return this.baseInstance_.getConsentState().then((consentState) => {
        return {consentState};
      });
    });

    // Install iframe resize API.
    this.unlisteners_.push(
      listenFor(
        this.iframe,
        'embed-size',
        (data, source, origin, event) => {
          if (!!data['hasOverflow']) {
            this.element_.warnOnMissingOverflow = false;
          }
          if (
            Date.now() - this.lastRejectedResizeTime_ >=
            MSEC_REPEATED_REQUEST_DELAY
          ) {
            this.handleResize_(
              data['id'],
              data['height'],
              data['width'],
              source,
              origin,
              event
            );
          } else {
            // need to wait 500ms until next resize request is allowed.
            this.sendEmbedSizeResponse_(
              false,
              data['id'],
              data['width'],
              data['height'],
              source,
              origin
            );
          }
        },
        true,
        true
      )
    );

    this.unlisteners_.push(
      this.baseInstance_.getAmpDoc().onVisibilityChanged(() => {
        this.sendEmbedInfo_(this.inViewport_);
      })
    );

    this.unlisteners_.push(
      listenFor(
        this.iframe,
        MessageType_Enum.USER_ERROR_IN_IFRAME,
        (data) => {
          this.userErrorForAnalytics_(
            data['message'],
            data['expected'] == true
          );
        },
        true,
        true /* opt_includingNestedWindows */
      )
    );

    // Iframe.onload normally called by the Ad after full load.
    const iframeLoadPromise = this.baseInstance_
      .loadPromise(this.iframe)
      .then(() => {
        // Wait just a little to allow `no-content` message to arrive.
        if (this.iframe) {
          // Chrome does not reflect the iframe readystate.
          this.iframe.readyState = 'complete';
        }
        return timer.promise(10);
      });

    // Calculate render-start and no-content signals.
    const {promise: renderStartPromise, resolve: renderStartResolve} =
      new Deferred();
    const {promise: noContentPromise, resolve: noContentResolve} =
      new Deferred();

    if (
      this.baseInstance_.config &&
      this.baseInstance_.config.renderStartImplemented
    ) {
      // When `render-start` is supported, these signals are mutually
      // exclusive. Whichever arrives first wins.
      listenForOncePromise(
        this.iframe,
        ['render-start', 'no-content'],
        true
      ).then((info) => {
        const {data} = info;
        if (data['type'] == 'render-start') {
          this.renderStartMsgHandler_(info);
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
    listenForOncePromise(this.iframe, CommonSignals_Enum.INI_LOAD, true).then(
      () => {
        // TODO(dvoytenko, #7788): ensure that in-a-box "ini-load" message is
        // received here as well.
        this.baseInstance_.signals().signal(CommonSignals_Enum.INI_LOAD);
      }
    );

    this.element_.appendChild(this.iframe);
    if (opt_isA4A && !opt_letCreativeTriggerRenderStart) {
      // A4A writes creative frame directly to page once creative is received
      // and therefore does not require render start message so attach and
      // impose no loader delay.  Network is using renderStart or
      // bootstrap-loaded to indicate ad request was sent, either way we know
      // that occurred for Fast Fetch.
      this.baseInstance_.renderStarted();
      renderStartResolve();
    } else {
      // Set iframe initially hidden which will be removed on render-start or
      // load, whichever is earlier.
      setStyle(this.iframe, 'visibility', 'hidden');
    }

    // If A4A where creative is responsible for triggering render start (e.g
    // no fill for sticky ad case), only trigger if renderStart listener promise
    // explicitly fired (though we do not expect this to occur for A4A).
    const triggerRenderStartPromise =
      opt_isA4A && opt_letCreativeTriggerRenderStart
        ? renderStartPromise
        : Promise.race([
            renderStartPromise,
            iframeLoadPromise,
            timer.promise(VISIBILITY_TIMEOUT),
          ]);
    triggerRenderStartPromise.then(() => {
      // Common signal RENDER_START invoked at toggle visibility time
      // Note: 'render-start' msg and common signal RENDER_START are different
      // 'render-start' msg is a way for implemented Ad to display ad earlier
      // RENDER_START signal is a signal to inform AMP runtime and other AMP
      // elements that the component visibility has been toggled on.
      this.baseInstance_.renderStarted();
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
    this.unlisteners_.push(
      listenFor(
        this.iframe,
        requestType,
        (info, source, origin) => {
          if (!this.iframe) {
            return;
          }

          const messageId = info[CONSTANTS.messageIdFieldName];
          const payload = info[CONSTANTS.payloadFieldName];

          getter(payload).then((content) => {
            const result = {};
            result[CONSTANTS.messageIdFieldName] = messageId;
            result[CONSTANTS.contentFieldName] = content;
            postMessageToWindows(
              dev().assertElement(this.iframe),
              [{win: source, origin}],
              requestType + CONSTANTS.responseTypeSuffix,
              result,
              true
            );
          });
        },
        true /* opt_is3P */,
        false /* opt_includingNestedWindows */
      )
    );
  }

  /**
   * callback functon on receiving render-start
   * @param {{data: !JsonObject}} info
   * @private
   */
  renderStartMsgHandler_(info) {
    const data = getData(info);
    this.handleResize_(
      undefined,
      data['height'],
      data['width'],
      info['source'],
      info['origin'],
      info['event']
    );
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
    this.unlisteners_.forEach((unlistener) => unlistener());
    this.unlisteners_.length = 0;
    if (this.embedStateApi_) {
      this.embedStateApi_.destroy();
      this.embedStateApi_ = null;
    }
    if (this.inaboxPositionApi_) {
      this.inaboxPositionApi_.destroy();
      this.inaboxPositionApi_ = null;
    }
    if (this.legacyIntersectionObserverApiHost_) {
      this.legacyIntersectionObserverApiHost_.destroy();
      this.legacyIntersectionObserverApiHost_ = null;
    }
  }

  /**
   * Updates the element's dimensions to accommodate the iframe's
   * requested dimensions. Notifies the window that request the resize
   * of success or failure.
   * @param {number|undefined} id
   * @param {number|string|undefined} height
   * @param {number|string|undefined} width
   * @param {!Window} source
   * @param {string} origin
   * @param {!MessageEvent} event
   * @private
   */
  handleResize_(id, height, width, source, origin, event) {
    this.baseInstance_.getVsync().mutate(() => {
      if (!this.iframe) {
        // iframe can be cleanup before vsync.
        return;
      }
      const iframeHeight = this.iframe./*OK*/ offsetHeight;
      const iframeWidth = this.iframe./*OK*/ offsetWidth;
      this.uiHandler_
        .updateSize(height, width, iframeHeight, iframeWidth, event)
        .then(
          (info) => {
            if (!info.success) {
              // invalid request parameters, disable requests for 500ms
              this.lastRejectedResizeTime_ = Date.now();
            } else {
              this.lastRejectedResizeTime_ = 0;
            }
            this.uiHandler_.adjustPadding();
            this.sendEmbedSizeResponse_(
              info.success,
              id,
              info.newWidth,
              info.newHeight,
              source,
              origin
            );
          },
          () => {}
        );
    });
  }

  /**
   * Sends a response to the window which requested a resize.
   * @param {boolean} success
   * @param {number|undefined} id
   * @param {number} requestedWidth
   * @param {number} requestedHeight
   * @param {!Window} source
   * @param {string} origin
   * @private
   */
  sendEmbedSizeResponse_(
    success,
    id,
    requestedWidth,
    requestedHeight,
    source,
    origin
  ) {
    // The iframe may have been removed by the time we resize.
    if (!this.iframe) {
      return;
    }
    postMessageToWindows(
      this.iframe,
      [{win: source, origin}],
      success ? 'embed-size-changed' : 'embed-size-denied',
      {
        'id': id,
        'requestedWidth': requestedWidth,
        'requestedHeight': requestedHeight,
      },
      true
    );
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
      'inViewport': inViewport,
      'pageHidden': !this.baseInstance_.getAmpDoc().isVisible(),
    });
  }

  /**
   * Retrieve iframe position entry in next animation frame.
   * @return {*} TODO(#23582): Specify return type
   * @private
   */
  getIframePositionPromise_() {
    return this.viewport_
      .getClientRectAsync(dev().assertElement(this.iframe))
      .then((position) => {
        devAssert(
          position,
          'element clientRect should intersects with root clientRect'
        );
        const viewport = this.viewport_.getRect();
        return {
          'targetRect': position,
          'viewportRect': viewport,
        };
      });
  }

  /** @private */
  sendPosition_() {
    if (this.sendPositionPending_) {
      // Only send once in single animation frame.
      return;
    }

    this.sendPositionPending_ = true;
    this.getIframePositionPromise_().then((position) => {
      this.sendPositionPending_ = false;
      this.inaboxPositionApi_.send(MessageType_Enum.POSITION, position);
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
    this.unlisteners_.push(
      this.viewport_.onScroll(
        throttle(
          this.win_,
          () => {
            this.getIframePositionPromise_().then((position) => {
              this.inaboxPositionApi_.send(MessageType_Enum.POSITION, position);
            });
          },
          MIN_INABOX_POSITION_EVENT_INTERVAL
        )
      )
    );
    this.unlisteners_.push(
      this.viewport_.onResize(() => {
        this.getIframePositionPromise_().then((position) => {
          this.inaboxPositionApi_.send(MessageType_Enum.POSITION, position);
        });
      })
    );
  }

  /**
   * See BaseElement method.
   * @param {boolean} inViewport
   */
  viewportCallback(inViewport) {
    this.inViewport_ = inViewport;
    this.sendEmbedInfo_(inViewport);
  }

  /**
   * See BaseElement method.
   */
  onLayoutMeasure() {
    // When the framework has the need to remeasure us, our position might
    // have changed. Send an intersection record if needed.
    if (this.legacyIntersectionObserverApiHost_) {
      this.legacyIntersectionObserverApiHost_.fire();
    }
  }

  /**
   * @param {string} message
   * @param {boolean} expected
   * @private
   */
  userErrorForAnalytics_(message, expected) {
    if (typeof message != 'string') {
      return;
    }
    if (expected) {
      dev().expectedError(TAG, message);
    } else {
      const e = new Error(message);
      e.name = '3pError';
      reportErrorToAnalytics(e, this.baseInstance_.win);
    }
  }
}

// Make the class available to other late loaded amp-ad implementations
// without them having to depend on it directly.
AMP.AmpAdXOriginIframeHandler = AmpAdXOriginIframeHandler;
