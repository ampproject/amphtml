/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
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
import {Services} from '../../../src/services';
import {dict} from '../../../src/utils/object';
import {getData, listen} from '../../../src/event-helper';
import {getIframe, preloadBootstrap} from '../../../src/3p-frame';
import {isLayoutSizeDefined} from '../../../src/layout';
import {isObject} from '../../../src/types';
import {parseJson} from '../../../src/json';
import {removeElement} from '../../../src/dom';
import {startsWith} from '../../../src/string';

export class Amp3dGltf extends AMP.BaseElement {

  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {?Element} */
    this.iframe_ = null;

    /** @private {?Function} */
    this.willBeReadyResolver_ = null;

    /** @private {?Function} */
    this.willBeLoadedResolver_ = null;

    /** @private {!Promise} */
    this.willBeReady_ = new Promise(resolve => {
      this.willBeReadyResolver_ = resolve;
    });

    /** @private {!Promise} */
    this.willBeLoaded_ = new Promise(resolve => {
      this.willBeLoadedResolver_ = resolve;
    });

    /** @private {!JsonObject} */
    this.context_ = dict();

    /** @private {?Function} */
    this.unlistenMessage_ = null;
  }

  /**
   * @param {boolean=} opt_onLayout
   * @override
   */
  preconnectCallback(opt_onLayout) {
    preloadBootstrap(this.win, this.preconnect);
    this.preconnect.url('https://cdnjs.cloudflare.com/ajax/libs/three.js/91/three.js', opt_onLayout);
  }

  /** @override */
  unlayoutCallback() {
    if (this.iframe_) {
      removeElement(this.iframe_);
      this.iframe_ = null;
    }
    if (this.unlistenMessage_) {
      this.unlistenMessage_();
    }

    this.willBeReady_ = new Promise(resolve => {
      this.willBeReadyResolver_ = resolve;
    });

    this.willBeLoaded_ = new Promise(resolve => {
      this.willBeLoadedResolver_ = resolve;
    });

    return true;
  }

  /** @override */
  buildCallback() {
    const getOption = (name, fmt, dflt) => {
      return this.element.hasAttribute(name)
        ? fmt(this.element.getAttribute(name))
        : dflt;
    };

    const bool = x => x !== 'false';
    const string = x => x;
    const number = x => parseFloat(x);

    this.context_ = dict({
      'src': getOption('src', string, ''),
      'renderer': {
        'alpha': getOption('alpha', bool, false),
        'antialias': getOption('antialiasing', bool, true),
      },
      'maxPixelRatio':
          getOption('maxPixelRatio', number, devicePixelRatio || 1),
      'controls': {
        'enableZoom': getOption('enableZoom', bool, true),
        'autoRotate': getOption('autoRotate', bool, false),
      },
      'hostUrl': this.win.location.href,
    });
  }

  /** @override */
  layoutCallback() {

    const iframe = getIframe(
        this.win, this.element, '3d-gltf', this.context_
    );

    return Services.vsyncFor(this.win)
        .mutatePromise(() => {
          this.applyFillContent(iframe, true);
          this.unlistenMessage_ = listen(
              this.win,
              'message',
              this.handleGltfViewerMessage_.bind(this)
          );

          this.element.appendChild(iframe);
          this.iframe_ = iframe;
        })
        .then(() => this.willBeLoaded_);
  }

  /** @private */
  handleGltfViewerMessage_(event) {
    if (this.iframe_ && event.source !== this.iframe_.contentWindow) {
      return;
    }
    if (!getData(event) || !(isObject(getData(event))
        || startsWith(/** @type {string} */ (getData(event)), '{'))) {
      return; // Doesn't look like JSON.
    }

    /** @const {?JsonObject} */
    const eventData = /** @type {?JsonObject} */ (isObject(getData(event))
      ? getData(event)
      : parseJson(getData(event)));
    if (eventData === undefined) {
      return; // We only process valid JSON.
    }
    if (eventData['action'] === 'ready') {
      this.willBeReadyResolver_();
    }

    if ('notify' in eventData) {
      switch (eventData['notify']) {
        case 'loaded':
          this.willBeLoadedResolver_();
          break;
        case 'progress':
          //todo
          console.log(eventData['loaded'], eventData['total']);
          break;
        case 'error':
          this.toggleFallback(true);
          break;
      }
    }
  }

  /**
   * Sends a command to the player through postMessage.
   * @param {string} action
   * @param {(JsonObject|boolean)=} args
   * @private
   * */
  sendCommand_(action, args) {
    this.willBeReady_.then(() => {
      if (this.iframe_ && this.iframe_.contentWindow) {
        const message = JSON.stringify(dict({
          'action': action,
          'args': args,
        }));
        this.iframe_.contentWindow.postMessage(message, '*');
      }
    });
  }

  /** @override */
  viewportCallback(inViewport) {
    this.sendCommand_('toggleAmpViewport', inViewport);
  }

  /** @override */
  pauseCallback() {
    this.sendCommand_('toggleAmpPlay', false);
  }

  /** @override */
  resumeCallback() {
    this.sendCommand_('toggleAmpPlay', true);
  }

  /** @override */
  isLayoutSupported(layout) {
    return isLayoutSizeDefined(layout);
  }
}

AMP.registerElement('amp-3d-gltf', Amp3dGltf);
