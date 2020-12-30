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
import {dict} from '../../../src/utils/object';
import {generateSentinel} from '../../../src/3p-frame';
import {getContextMetadata} from '../../../src/iframe-attributes';
import {getData} from '../../../src/event-helper';
import {isLayoutSizeDefined} from '../../../src/layout';
import {setIsMediaComponent} from '../../../src/video-interface';
import {setStyle} from '../../../src/style';
import {tryParseJson} from '../../../src/json';
import {userAssert} from '../../../src/log';

let REQUEST_ID = 1;

/** @const */
const VALID_MESSAGE_TYPES = [
  'vdzw_artemis_hook',
  'vdzw_amp_response',
  'vdzw_amp_context',
];

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

    /** @private {?HTMLIFrameElement} */
    this.iframe_ = null;

    /** @private {?Promise} */
    this.widgetReadyPromise_ = null;

    /** @private {?Function} */
    this.widgetReadyResolver_ = null;

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

    const deferred = new Deferred();
    this.widgetReadyPromise_ = deferred.promise;
    this.widgetReadyResolver_ = deferred.resolve;
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
    element.appendChild(iframe);
    this.iframe_ = iframe;

    this.bindToWidgetHooks_();

    return this.loadPromise(iframe).then(() => this.widgetReadyPromise_);
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

      // check if event payload is a widget hook
      if (!dataJSON || VALID_MESSAGE_TYPES.indexOf(dataJSON.type) < 0) {
        return;
      }

      switch (dataJSON.type) {
        case 'vdzw_artemis_hook':
          this.handleHook_(dataJSON);
          break;
        case 'vdzw_amp_response':
          this.handleResponse_(dataJSON);
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
    }
  }

  /**
   * Setup after widget is ready
   */
  handleWidgetReady_() {
    const sentinel = generateSentinel(this.win);
    const {_context} = getContextMetadata(this.win, this.element, sentinel);

    this.iframe_.contentWindow.postMessage(
      JSON.stringify({type: 'vdzw_amp_context', context: _context}),
      this.iframeDomain_
    );

    this.requestFromWidget_('getWidgetOption', {
      option: 'playerHolderBackgroundColor',
    }).then((color = 'transparent') => {
      setStyle(this.element, 'backgroundColor', color);
    });

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
   * @param {boolean} isActive is full screen mode activated
   * @private
   */
  handleFullScreenToggle_(isActive) {
    this.iframe_.classList.toggle('i-amphtml-fullscreen', isActive);
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

    this.iframe_.contentWindow.postMessage(
      JSON.stringify({type: 'vdzw_amp_request', id, request, payload}),
      this.iframeDomain_
    );

    return deferred.promise;
  }
}

AMP.extension(TAG, '0.1', (AMP) => {
  AMP.registerElement(TAG, AmpVidazooWidget, CSS);
});
