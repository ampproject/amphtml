import {ActionTrust_Enum} from '#core/constants/action-constants';
import {Deferred} from '#core/data-structures/promise';
import {removeElement} from '#core/dom';
import {applyFillContent, isLayoutSizeDefined} from '#core/dom/layout';
import {
  observeContentSize,
  unobserveContentSize,
} from '#core/dom/layout/size-observer';
import {observeIntersections} from '#core/dom/layout/viewport-observer';

import {Services} from '#service';

import {dev, devAssert} from '#utils/log';

import {getIframe, preloadBootstrap} from '../../../src/3p-frame';
import {listenFor, postMessage} from '../../../src/iframe-helper';
import {assertHttpsUrl, resolveRelativeUrl} from '../../../src/url';

const TAG = 'amp-3d-gltf';
const TYPE = '3d-gltf';

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
    this.context_ = {};

    /** @private {?Function} */
    this.unlistenMessage_ = null;

    this.onResized_ = this.onResized_.bind(this);

    /** @private {?UnlistenDef} */
    this.unobserveIntersections_ = null;
  }

  /**
   * @param {boolean=} opt_onLayout
   * @override
   */
  preconnectCallback(opt_onLayout) {
    const preconnect = Services.preconnectFor(this.win);
    preloadBootstrap(this.win, TYPE, this.getAmpDoc(), preconnect);
    preconnect.url(
      this.getAmpDoc(),
      'https://cdnjs.cloudflare.com/ajax/libs/three.js/91/three.js',
      opt_onLayout
    );
    preconnect.url(
      this.getAmpDoc(),
      'https://cdn.jsdelivr.net/npm/three@0.91/examples/js/loaders/GLTFLoader.js',
      opt_onLayout
    );
    preconnect.url(
      this.getAmpDoc(),
      'https://cdn.jsdelivr.net/npm/three@0.91/examples/js/controls/OrbitControls.js',
      opt_onLayout
    );
  }

  /** @override */
  unlayoutCallback() {
    this.unobserveIntersections_?.();
    this.unobserveIntersections_ = null;
    this.viewportCallback_(false);
    if (this.iframe_) {
      removeElement(this.iframe_);
      this.iframe_ = null;
    }
    if (this.unlistenMessage_) {
      this.unlistenMessage_();
    }

    this.willBeReady_ = new Deferred();
    this.willBeLoaded_ = new Deferred();

    unobserveContentSize(this.element, this.onResized_);
    return true;
  }

  /** @override */
  buildCallback() {
    const getOption = (name, fmt, dflt) =>
      this.element.hasAttribute(name)
        ? fmt(this.element.getAttribute(name))
        : dflt;

    const bool = (x) => x !== 'false';
    const string = (x) => x;
    const number = (x) => parseFloat(x);

    const src = assertHttpsUrl(getOption('src', string, ''), this.element);

    const useAlpha = getOption('alpha', bool, false);

    this.context_ = {
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
    };
    this.registerAction(
      'setModelRotation',
      (invocation) => {
        this.sendCommandWhenReady_('setModelRotation', invocation.args).catch(
          (e) => dev().error('AMP-3D-GLTF', 'setModelRotation failed: %s', e)
        );
      },
      ActionTrust_Enum.LOW
    );
  }

  /** @override */
  layoutCallback() {
    this.unobserveIntersections_ = observeIntersections(
      this.element,
      ({isIntersecting}) => this.viewportCallback_(isIntersecting)
    );
    if (!isWebGLSupported()) {
      this.toggleFallback(true);
      return Promise.resolve();
    }

    const iframe = getIframe(this.win, this.element, TYPE, this.context_);
    iframe.title = this.element.title || 'GLTF 3D model';
    applyFillContent(iframe, true);
    this.iframe_ = iframe;
    this.unlistenMessage_ = devAssert(this.listenGltfViewerMessages_());

    this.element.appendChild(this.iframe_);

    observeContentSize(this.element, this.onResized_);

    return this.willBeLoaded_.promise;
  }

  /**
   * @private
   * @return {function()|undefined}
   */
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
    return () => disposers.forEach((d) => d());
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
      const message = {
        'action': action,
        'args': args,
      };

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
   * @private
   */
  viewportCallback_(inViewport) {
    this.sendCommandWhenReady_('toggleAmpViewport', inViewport);
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
   * @param {!../layout-rect.LayoutSizeDef} size
   * @private
   */
  onResized_({height, width}) {
    this.sendCommandWhenReady_('setSize', {'width': width, 'height': height});
  }

  /** @override */
  isLayoutSupported(layout) {
    return isLayoutSizeDefined(layout);
  }
}

AMP.extension(TAG, '0.1', (AMP) => {
  AMP.registerElement(TAG, Amp3dGltf);
});
