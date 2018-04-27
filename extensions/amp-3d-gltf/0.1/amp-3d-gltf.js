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
import {dev} from '../../../src/log';
import {dict} from '../../../src/utils/object';
import {getIframe, preloadBootstrap} from '../../../src/3p-frame';
import {isLayoutSizeDefined} from '../../../src/layout';
import {listenFor, postMessage} from '../../../src/iframe-helper';
import {removeElement} from '../../../src/dom';

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
          this.iframe_ = iframe;
          this.unlistenMessage_ = this.listenGltfViewerMessages_();

          this.element.appendChild(iframe);
        })
        .then(() => this.willBeLoaded_);
  }

  /** @private */
  listenGltfViewerMessages_() {
    if (!this.iframe_) {
      return;
    }

    const listenIframe = (evName, cb) => listenFor(
        dev().assertElement(this.iframe_),
        evName,
        cb,
        true
    );

    const disposers = [
      listenIframe('ready', this.willBeReadyResolver_),
      listenIframe('loaded', this.willBeLoadedResolver_),
      listenIframe('error', () => {
        this.toggleFallback(true);
      }),
    ];
    return () => disposers.forEach(d => d());
  }

  /**
   * Sends a command to the player through postMessage.
   * @param {string} action
   * @param {(JsonObject|boolean)=} args
   * @private
   * */
  sendCommand_(action, args) {
    this.willBeReady_.then(() => {
      const message = dict({
        'action': action,
        'args': args,
      });

      postMessage(
          dev().assertElement(this.iframe_),
          'action',
          message,
          '*',
          true
      );
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

  onLayoutMeasure() {
    const box = this.getLayoutBox();
    this.sendCommand_(
        'setSize',
        dict({'width': box.width, 'height': box.height})
    );
  }

  /** @override */
  isLayoutSupported(layout) {
    return isLayoutSizeDefined(layout);
  }
}

AMP.registerElement('amp-3d-gltf', Amp3dGltf);
