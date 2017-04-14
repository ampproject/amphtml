import {getIframe, preloadBootstrap} from '../../../src/3p-frame';
import {
  installVideoManagerForDoc,
} from '../../../src/service/video-manager-impl';
import {isLayoutSizeDefined} from '../../../src/layout';
import {isObject} from '../../../src/types';
import {listenFor} from '../../../src/iframe-helper';
import {loadPromise} from '../../../src/event-helper';
import {removeElement} from '../../../src/dom';
import {VideoEvents} from '../../../src/video-interface';
import {videoManagerForDoc} from '../../../src/services';

/**
 * @implements {../../../src/video-interface.VideoInterface}
 */
class AmpImaVideo extends AMP.BaseElement {

  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {?Element} */
    this.iframe_ = null;

    /** @private {?Promise} */
    this.playerReadyPromise_ = null;

    /** @private {?Function} */
    this.playerReadyResolver_ = null;
  }

  /** @override */
  preconnectCallback() {
    this.preconnect.preload(
        'https://imasdk.googleapis.com/js/sdkloader/ima3.js', 'script');
    preloadBootstrap(this.win, this.preconnect);
  }

  /** @override */
  isLayoutSupported(layout) {
    return isLayoutSizeDefined(layout);
  }

  /** @override */
  layoutCallback() {
    const iframe = getIframe(this.element.ownerDocument.defaultView,
        this.element, 'ima-video');
    iframe.setAttribute('allowfullscreen', 'true');
    this.applyFillContent(iframe);
    listenFor(iframe, 'embed-size', data => {
      iframe.height = data.height;
      iframe.width = data.width;
      const amp = iframe.parentElement;
      amp.setAttribute('height', data.height);
      amp.setAttribute('width', data.width);
    }, /* opt_is3P */true);
    this.element.appendChild(iframe);

    this.iframe_ = iframe;

    this.playerReadyPromise_ = new Promise(resolve => {
      this.playerReadyResolver_ = resolve;
    });

    this.win.addEventListener(
        'message', event => this.handlePlayerMessages_(event));

    installVideoManagerForDoc(this.element);
    videoManagerForDoc(this.win.document).register(this);

    return loadPromise(iframe).then(() => this.playerReadyPromise_);
  }

  /** @override */
  viewportCallback(visible) {
    this.element.dispatchCustomEvent(VideoEvents.VISIBILITY, {visible});
  }

  /** @override */
  unlayoutCallback() {
    if (this.iframe_) {
      removeElement(this.iframe_);
      this.iframe_ = null;
    }
    return true;
  }

  /** @override */
  onLayoutMeasure() {
    if (this.iframe_) {
      this.sendCommand_('resize', {
        'width': this.iframe_.offsetWidth,
        'height': this.iframe_.offsetHeight,
      });
    }
  }

  /**
   * Sends a command to the player through postMessage.
   * @param {string} command
   * @param {Object=} opt_args
   * @private
   * */
  sendCommand_(command, opt_args) {
    this.iframe_.contentWindow./*OK*/postMessage(JSON.stringify({
      'event': 'command',
      'func': command,
      'args': opt_args || '',
    }), '*');
  }

  /** @private */
  handlePlayerMessages_(event) {
    if (event.source != this.iframe_.contentWindow) {
      return;
    }
    if (!event.data ||
        !(isObject(event.data) || event.data.indexOf('{') == 0)) {
      return;  // Doesn't look like JSON.
    }

    if (isObject(event.data)) {
      if (event.data.event == VideoEvents.LOAD ||
          event.data.event == VideoEvents.PLAY ||
          event.data.event == VideoEvents.PAUSE ||
          event.data.event == VideoEvents.MUTED ||
          event.data.event == VideoEvents.UNMUTED) {
        if (event.data.event == VideoEvents.LOAD) {
          this.playerReadyResolver_(this.iframe_);
        }
        this.element.dispatchCustomEvent(event.data.event);
      }
    }
  }

  // VideoInterface Implementation. See ../src/video-interface.VideoInterface

  /**
   * @override
   */
  supportsPlatform() {
    return true;
  }

  /** @override */
  isInteractive() {
    return true;
  }

  /**
   * @override
   */
  play(unusedIsAutoplay) {
    this.playerReadyPromise_.then(() => {
      this.sendCommand_('playVideo');
    });
  }

  /**
   * @override
   */
  pause() {
    this.playerReadyPromise_.then(() => {
      this.sendCommand_('pauseVideo');
    });
  }

  /**
   * @override
   */
  mute() {
    this.playerReadyPromise_.then(() => {
      this.sendCommand_('mute');
    });
  }

  /**
   * @override
   */
  unmute() {
    this.playerReadyPromise_.then(() => {
      this.sendCommand_('unMute');
    });
  }

  /**
   * @override
   */
  showControls() {
    // Not supported.
  }

  /**
   * @override
   */
  hideControls() {
    // Not supported.
  }
};

AMP.registerElement('amp-ima-video', AmpImaVideo);
