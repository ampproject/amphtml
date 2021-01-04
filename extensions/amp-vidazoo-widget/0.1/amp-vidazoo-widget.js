/**
 * Copyright 2020 The AMP HTML Authors. All Rights Reserved.
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
import {CSS} from '../../../build/amp-vidazoo-widget-0.1.css';
import {Deferred} from '../../../src/utils/promise';
import {Services} from '../../../src/services';
import {addParamsToUrl} from '../../../src/url';
import {
  assertDoesNotContainDisplay,
  setStyle,
  setStyles,
  toggle,
} from '../../../src/style';
import {dict} from '../../../src/utils/object';
import {generateSentinel} from '../../../src/3p-frame';
import {
  getCloseButtonExtendedRadius,
  getCloseButtonInnerPositionStyle,
  getCloseButtonOuterPositionStyle,
  isClickInsideElementRect,
} from './utils';
import {getContextMetadata} from '../../../src/iframe-attributes';
import {getData} from '../../../src/event-helper';
import {isLayoutSizeDefined} from '../../../src/layout';
import {removeElement} from '../../../src/dom';
import {setIsMediaComponent} from '../../../src/video-interface';
import {tryParseJson} from '../../../src/json';
import {userAssert} from '../../../src/log';

let REQUEST_ID = 1;

/** @const */
const TAG = 'amp-vidazoo-widget';

class AmpVidazooWidget extends AMP.BaseElement {
  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {string} */
    this.widgetId_ = '';

    /** @private {string} */
    this.iframeDomain_ = 'http://localhost:8080';
    // this.iframeDomain_ = 'https://static.vidazoo.com';

    /** @private {?Object} */
    this.widgetOptions_ = null;

    /** @private {?HTMLDivElement} */
    this.wrapper_ = null;

    /** @private {?HTMLDivElement} */
    this.floater_ = null;

    /** @private {?HTMLAnchorElement} */
    this.closeButton_ = null;

    /** @private {?HTMLIFrameElement} */
    this.iframe_ = null;

    /** @private {?Promise} */
    this.widgetReadyPromise_ = null;

    /** @private {?Function} */
    this.widgetReadyResolver_ = null;

    /** @private {?IntersectionObserver} */
    this.intersectionObserver_ = null;

    /** @private {Object.<string, Deferred>} */
    this.requests_ = {};
  }

  /**
   * @param {boolean=} onLayout
   * @override
   */
  preconnectCallback(onLayout) {
    // Serves the player assets
    Services.preconnectFor(this.win).url(
      this.getAmpDoc(),
      this.iframeDomain_,
      onLayout
    );
  }

  /** @override */
  isLayoutSupported(layout) {
    return isLayoutSizeDefined(layout);
  }

  /** @override */
  buildCallback() {
    const {element} = this;

    setIsMediaComponent(element);

    this.widgetId_ = userAssert(
      element.getAttribute('data-widget-id'),
      'The data-widget-id attribute is required for <amp-vidazoo-widget> %s',
      element
    );

    this.initializePromise_();
  }

  /** @override */
  layoutCallback() {
    const {element} = this;

    const urlParams = dict({
      'widgetId': this.widgetId_ || undefined,
    });
    const iframeUrl = this.iframeDomain_ + '/basev/amp/artemis/0.1/index.html';
    const src = addParamsToUrl(iframeUrl, urlParams);

    const iframe = element.ownerDocument.createElement('iframe');
    iframe.setAttribute('frameborder', '0');
    iframe.setAttribute('scrolling', 'no');
    iframe.setAttribute('allowfullscreen', 'true');
    iframe.src = src;
    this.applyFillContent(iframe, true);
    this.iframe_ = iframe;

    this.floater_ = element.ownerDocument.createElement('div');
    this.floater_.classList.add('i-amphtml-vidazoo-floater');
    this.floater_.appendChild(this.iframe_);

    this.wrapper_ = element.ownerDocument.createElement('div');
    this.wrapper_.classList.add('i-amphtml-vidazoo-wrapper');
    this.wrapper_.appendChild(this.floater_);

    element.appendChild(this.wrapper_);

    this.bindToWidgetMessages_();

    return this.loadPromise(iframe).then(() => this.widgetReadyPromise_);
  }

  /** @override */
  unlayoutCallback() {
    this.destroyWidgetUI_();
    this.destroyIntersectionObserver_();
    this.initializePromise_();
    this.widgetOptions_ = null;

    return true;
  }

  /**
   * Removes the widget iframe
   * @private
   */
  destroyWidgetUI_() {
    if (this.wrapper_) {
      removeElement(this.wrapper_);
      this.iframe_ = null;
      this.wrapper_ = null;
      this.floater_ = null;
      this.closeButton_ = null;
    }
  }

  /**
   * Subscribe to widget messages from iframe.
   * @private
   */
  bindToWidgetMessages_() {
    this.win.addEventListener('message', (e) => {
      if (!this.iframe_ || e.source !== this.iframe_.contentWindow) {
        return;
      }
      const dataString = getData(e);
      const dataJSON = tryParseJson(dataString);

      if (!dataJSON || !dataJSON.vdzw_artemis_amp_broadcast) {
        return;
      }

      const {data} = dataJSON;

      switch (data.type) {
        case 'hook':
          this.handleHook_(data);
          break;
        case 'response':
          this.handleResponse_(data);
          break;
        case 'float_layout':
          this.handleFloatLayoutReceived_(data);
          break;
      }
    });
  }

  /**
   * Handles hook event from widget
   * @private
   * @param {*} data - The payload from the message event
   */
  handleHook_(data) {
    // import hook name and arguments from payload
    const {hook, args} = data;

    // handle hook
    switch (hook) {
      case 'widgetReady':
        this.handleWidgetReady_.apply(this, args);
        break;
      case 'fullScreenModeChange':
        this.handleFullScreenToggle_.apply(this, args);
        break;
      case 'floatModeChange':
        this.handleFloatModeToggle_.apply(this, args);
        break;
      case 'closeVisibilityChange':
        this.handleCloseButtonVisibilityToggle_.apply(this, args);
    }
  }

  /**
   * Setup after widget is ready
   * @private
   */
  handleWidgetReady_() {
    const sentinel = generateSentinel(this.win);
    const {_context: context} = getContextMetadata(
      this.win,
      this.element,
      sentinel
    );

    // sends the AMP context into the iframe
    this.broadcast_({type: 'amp_context', context});

    this.requestFromWidget_('getWidgetOptions').then((options) => {
      this.widgetOptions_ = options;
      setStyle(
        this.element,
        'backgroundColor',
        options.playerHolderBackgroundColor
      );
    });

    this.createIntersectionObserver_();

    this.widgetReadyResolver_(this.iframe_);
  }

  /**
   * Handles request response from widget
   * @private
   * @param {*} data - The payload from the message event
   */
  handleResponse_(data) {
    const {id, response} = data;
    if (!id || !this.requests_[id]) {
      return;
    }

    this.requests_[id].resolve(response);
    delete this.requests_[id];
  }

  /**
   * Called on 'fullScreenModeChange' widget hook.
   * @private
   * @param {boolean} isActive is full screen mode activated
   */
  handleFullScreenToggle_(isActive) {
    this.wrapper_.classList.toggle('i-amphtml-vidazoo-fullscreen', isActive);
  }

  /**
   * Called on 'floatModeChange` widget hook.
   * @private
   * @param {boolean} isFloatActive is float mode active
   */
  handleFloatModeToggle_(isFloatActive) {
    this.floater_.classList.toggle(
      'i-amphtml-vidazoo-float-active',
      isFloatActive
    );

    // clear inline position and layout style
    if (!isFloatActive) {
      setStyles(this.floater_, {
        'top': '',
        'right': '',
        'bottom': '',
        'left': '',
        'width': '',
        'height': '',
        'zIndex': '',
      });
    }
  }

  /**
   * Called on 'closeVisibilityChange' widget hook.
   * @private
   * @param {boolean} isVisible - should the close button be displayed
   */
  handleCloseButtonVisibilityToggle_(isVisible) {
    if (this.widgetOptions_.closeButton.disableUI) {
      return;
    }

    if (!this.closeButton_) {
      this.createCloseButton_();
    }

    toggle(this.closeButton_, isVisible);
  }

  /**
   * Receive layout for iframe while in float mode.
   * @private
   * @param {*} data
   */
  handleFloatLayoutReceived_(data) {
    setStyles(this.floater_, assertDoesNotContainDisplay(data.layout));
  }

  /**
   * Send a request command to the widget
   * @private
   * @param {string} request
   * @param {?any} payload
   * @return {Promise}
   */
  requestFromWidget_(request, payload = {}) {
    const id = REQUEST_ID++;
    const deferred = new Deferred();

    this.requests_[id] = deferred;

    this.broadcast_({
      type: 'request',
      id,
      request,
      payload,
    });

    return deferred.promise;
  }

  /**
   * Broadcast data to the widget inside this.iframe_
   * @private
   * @param {*} data
   */
  broadcast_(data) {
    if (!this.iframe_ || !this.iframe_.contentWindow) {
      return;
    }

    this.iframe_.contentWindow.postMessage(
      JSON.stringify({
        'vdzw_artemis_amp_broadcast': true,
        data,
      }),
      this.iframeDomain_
    );
  }

  /**
   * Create a loading promise.
   * @private
   */
  initializePromise_() {
    const deferred = new Deferred();
    this.widgetReadyPromise_ = deferred.promise;
    this.widgetReadyResolver_ = deferred.resolve;
  }

  /**
   * Creates the UI for the close button.
   * @private
   */
  createCloseButton_() {
    const closeButtonOptions = this.widgetOptions_.closeButton;

    this.closeButton_ = this.element.ownerDocument.createElement('a');
    this.closeButton_.classList.add('i-amphtml-vidazoo-close-button');
    this.closeButton_.innerHTML = '&#215;';

    const position = closeButtonOptions.position.split('-');
    const extend = getCloseButtonExtendedRadius(
      closeButtonOptions.extendRadius
    );

    const style = {
      ...getCloseButtonOuterPositionStyle(
        position[0],
        closeButtonOptions.inset
      ),
      ...getCloseButtonInnerPositionStyle(position[1]),
    };

    setStyles(this.wrapper_, {
      '--extend-button-top': `${extend[0]}px`,
      '--extend-button-right': `${extend[1]}px`,
      '--extend-button-bottom': `${extend[2]}px`,
      '--extend-button-left': `${extend[3]}px`,
    });

    setStyles(this.closeButton_, assertDoesNotContainDisplay(style));

    this.floater_.appendChild(this.closeButton_);
    this.closeButton_.addEventListener(
      'click',
      this.handleCloseClick_.bind(this)
    );
  }

  /**
   * Handle close button click.
   * @param {Event} e
   */
  handleCloseClick_(e) {
    if (
      !isClickInsideElementRect(e, e.currentTarget) &&
      this.widgetOptions_.closeButton.extendRadiusClickStrategy === 'block'
    ) {
      // click was on button margins, we should block it
      return;
    }

    this.broadcast_({
      type: 'close_click',
    });
  }

  /**
   * Observe this.wrapper_ for intersection.
   * @private
   */
  createIntersectionObserver_() {
    this.intersectionObserver_ = new IntersectionObserver(
      this.onIntersection_.bind(this),
      {root: null, rootMargin: '0px', threshold: 0}
    );

    this.intersectionObserver_.observe(this.wrapper_);
  }

  /**
   * Destroys intersection observer
   * @private
   */
  destroyIntersectionObserver_() {
    if (this.intersectionObserver_) {
      this.intersectionObserver_.disconnect();
      this.intersectionObserver_ = null;
    }
  }

  /**
   * Intersection observer callback.
   * Broadcasts the intersection state into the widget.
   * @private
   * @param {IntersectionObserverEntry[]} entries
   */
  onIntersection_(entries) {
    const {isIntersecting} = entries[0];
    this.broadcast_({
      type: 'intersection_change',
      isIntersecting,
    });
  }
}

AMP.extension(TAG, '0.1', (AMP) => {
  AMP.registerElement(TAG, AmpVidazooWidget, CSS);
});
