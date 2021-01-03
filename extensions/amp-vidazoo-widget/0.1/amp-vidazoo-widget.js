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
} from '../../../src/style';
import {dict} from '../../../src/utils/object';
import {generateSentinel} from '../../../src/3p-frame';
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

    /** @private {?HTMLDivElement} */
    this.wrapper_ = null;

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
    const iframeUrl = this.iframeDomain_ + '/basev/amp/artemis/index.html';
    const src = addParamsToUrl(iframeUrl, urlParams);

    const iframe = element.ownerDocument.createElement('iframe');
    iframe.setAttribute('frameborder', '0');
    iframe.setAttribute('scrolling', 'no');
    iframe.setAttribute('allowfullscreen', 'true');
    iframe.src = src;
    this.applyFillContent(iframe, true);
    this.iframe_ = iframe;

    this.wrapper_ = element.ownerDocument.createElement('div');
    this.wrapper_.appendChild(this.iframe_);
    setStyles(this.wrapper_, {
      'width': '100%',
      'height': '100%',
      'position': 'absolute',
      'top': '0',
      'left': '0',
    });
    element.appendChild(this.wrapper_);

    this.bindToWidgetHooks_();

    return this.loadPromise(iframe).then(() => this.widgetReadyPromise_);
  }

  /** @override */
  unlayoutCallback() {
    this.destroyWidgetFrame_();
    this.destroyIntersectionObserver_();
    this.initializePromise_();

    return true;
  }

  /**
   * Removes the widget iframe
   * @private
   */
  destroyWidgetFrame_() {
    if (this.wrapper_) {
      removeElement(this.wrapper_);
      this.iframe_ = null;
      this.wrapper_ = null;
    }
  }

  /**
   * Subscribe to widget hooks from iframe.
   * @private
   */
  bindToWidgetHooks_() {
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

    this.requestFromWidget_('getWidgetOption', {
      option: 'playerHolderBackgroundColor',
    }).then((color = 'transparent') => {
      setStyle(this.element, 'backgroundColor', color);
    });

    this.createIntersectionObserver_();

    this.widgetReadyResolver_(this.iframe_);
  }

  /**
   * Handles request response from widget
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
   *
   * @param {boolean} isActive is full screen mode activated
   */
  handleFullScreenToggle_(isActive) {
    this.wrapper_.classList.toggle('i-amphtml-fullscreen', isActive);
  }

  /**
   * Called on 'floatModeChange` widget hook.
   *
   * @param {boolean} isFloatActive is float mode active
   */
  handleFloatModeToggle_(isFloatActive) {
    this.iframe_.classList.toggle('i-amphtml-float-active', isFloatActive);

    // clear inline position and layout style
    if (!isFloatActive) {
      setStyles(this.iframe_, {
        'top': '',
        'right': '',
        'bottom': '',
        'left': '',
        'zIndex': '',
        'width': '',
        'height': '',
        'minWidth': '',
        'minHeight': '',
      });
    }
  }

  /**
   * Called on 'closeVisibilityChange' widget hook.
   *
   * @param {boolean} isVisible - should the close button be displayed
   */
  handleCloseButtonVisibilityToggle_(isVisible) {
    if (isVisible) {
    }
  }

  /**
   * Receive layout for iframe while in float mode.
   * @param {*} data
   */
  handleFloatLayoutReceived_(data) {
    setStyles(this.iframe_, assertDoesNotContainDisplay(data.layout));
  }

  /**
   * Send a request command to the widget
   * @param {string} request
   * @param {any} payload
   * @return {Promise}
   */
  requestFromWidget_(request, payload) {
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
   * Create a loading promise
   */
  initializePromise_() {
    const deferred = new Deferred();
    this.widgetReadyPromise_ = deferred.promise;
    this.widgetReadyResolver_ = deferred.resolve;
  }

  /**
   * Observer this.element for float
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
