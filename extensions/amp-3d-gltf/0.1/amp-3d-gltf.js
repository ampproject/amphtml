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
import {ActionTrust} from '../../../src/action-constants';
import {Deferred} from '../../../src/utils/promise';
import {assertHttpsUrl, resolveRelativeUrl} from '../../../src/url';
import {dev} from '../../../src/log';
import {dict} from '../../../src/utils/object';
import {getIframe, preloadBootstrap} from '../../../src/3p-frame';
import {isLayoutSizeDefined} from '../../../src/layout';
import {listenFor, postMessage} from '../../../src/iframe-helper';
import {removeElement} from '../../../src/dom';

const TAG = 'amp-3d-gltf';

const isWebGLSupported = () => {
  const canvas = document.createElement('canvas');
  const gl =
    canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
  return gl && gl instanceof WebGLRenderingContext;
};

export class Amp3dGltf extends AMP.BaseElement {
  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {?Element} */
    this.iframe_ = null;

    /** @private {!Deferred} */
    this.willBeReady_ = new Deferred();

    /** @private {!Deferred} */
    this.willBeLoaded_ = new Deferred();

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
    this.preconnect.url(
      'https://cdnjs.cloudflare.com/ajax/libs/three.js/91/three.js',
      opt_onLayout
    );
    this.preconnect.url(
      'https://cdn.jsdelivr.net/npm/three@0.91/examples/js/loaders/GLTFLoader.js',
      opt_onLayout
    );
    this.preconnect.url(
      'https://cdn.jsdelivr.net/npm/three@0.91/examples/js/controls/OrbitControls.js',
      opt_onLayout
    );
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

    this.willBeReady_ = new Deferred();
    this.willBeLoaded_ = new Deferred();

    return true;
  }

  /** @override */
  buildCallback() {
    const getOption = (name, fmt, dflt) =>
      this.element.hasAttribute(name)
        ? fmt(this.element.getAttribute(name))
        : dflt;

    const bool = x => x !== 'false';
    const string = x => x;
    const number = x => parseFloat(x);

    const src = assertHttpsUrl(getOption('src', string, ''), this.element);

    const useAlpha = getOption('alpha', bool, false);

    this.context_ = dict({
      'src': resolveRelativeUrl(src, this.getAmpDoc().getUrl()),
      'renderer': {
        'alpha': useAlpha,
        'antialias': getOption('antialiasing', bool, true),
      },
      'rendererSettings': {
        'clearAlpha': useAlpha ? 0 : 1,
        'clearColor': getOption('clearColor', string, '#fff'),
        'maxPixelRatio': getOption(
          'maxPixelRatio',
          number,
          devicePixelRatio || 1
        ),
      },
      'controls': {
        'enableZoom': getOption('enableZoom', bool, true),
        'autoRotate': getOption('autoRotate', bool, false),
      },
    });
    this.registerAction(
      'setModelRotation',
      invocation => {
        this.sendCommandWhenReady_('setModelRotation', invocation.args).catch(
          e => dev().error('AMP-3D-GLTF', 'setModelRotation failed: %s', e)
        );
      },
      ActionTrust.LOW
    );
  }

  /** @override */
  layoutCallback() {
    if (!isWebGLSupported()) {
      this.toggleFallback(true);
      return Promise.resolve();
    }

    const iframe = getIframe(this.win, this.element, '3d-gltf', this.context_);

    this.applyFillContent(iframe, true);
    this.iframe_ = iframe;
    this.unlistenMessage_ = this.listenGltfViewerMessages_();

    this.element.appendChild(this.iframe_);

    return this.willBeLoaded_.promise;
  }

  /** @private */
  listenGltfViewerMessages_() {
    if (!this.iframe_) {
      return;
    }

    const listenIframe = (evName, cb) =>
      listenFor(dev().assertElement(this.iframe_), evName, cb, true);

    const disposers = [
      listenIframe('ready', this.willBeReady_.resolve),
      listenIframe('loaded', this.willBeLoaded_.resolve),
      listenIframe('error', () => {
        this.toggleFallback(true);
      }),
    ];
    return () => disposers.forEach(d => d());
  }

  /**
   * Sends a command to the viewer via postMessage when iframe is ready
   *
   * @param {string} action
   * @param {(JsonObject|boolean)=} args
   * @return {!Promise}
   * @private
   */
  sendCommandWhenReady_(action, args) {
    return this.willBeReady_.promise.then(() => {
      const message = dict({
        'action': action,
        'args': args,
      });

      this.postMessage_('action', message);
    });
  }

  /**
   * Wraps postMessage for testing
   *
   * @param {string} type
   * @param {!JsonObject} message
   * @private
   */
  postMessage_(type, message) {
    postMessage(dev().assertElement(this.iframe_), type, message, '*', true);
  }

  /**
   * @param {boolean} inViewport
   * @override
   */
  viewportCallback(inViewport) {
    return this.sendCommandWhenReady_('toggleAmpViewport', inViewport);
  }

  /** @override */
  pauseCallback() {
    this.sendCommandWhenReady_('toggleAmpPlay', false);
  }

  /** @override */
  resumeCallback() {
    this.sendCommandWhenReady_('toggleAmpPlay', true);
  }

  /**
   * Sends `setSize` command when ready
   *
   */
  onLayoutMeasure() {
    const box = this.getLayoutBox();
    this.sendCommandWhenReady_(
      'setSize',
      dict({'width': box.width, 'height': box.height})
    );
  }

  /** @override */
  isLayoutSupported(layout) {
    return isLayoutSizeDefined(layout);
  }
}

AMP.extension(TAG, '0.1', AMP => {
  AMP.registerElement(TAG, Amp3dGltf);
});
