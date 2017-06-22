/**
 * Copyright 2017 The AMP HTML Authors. All Rights Reserved.
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

import {assertHttpsUrl} from '../../../src/url';
import {getIframe, preloadBootstrap} from '../../../src/3p-frame';
import {IMAVideoEvents} from '../../../ads/google/imaVideo.js';
import {
  installVideoManagerForDoc,
} from '../../../src/service/video-manager-impl';
import {isExperimentOn} from '../../../src/experiments';
import {isLayoutSizeDefined} from '../../../src/layout';
import {
  isObject,
  toArray,
} from '../../../src/types';
import {
  getData,
  listen,
} from '../../../src/event-helper';
import {dict} from '../../../src/utils/object';
import {removeElement} from '../../../src/dom';
import {user} from '../../../src/log';
import {VideoEvents} from '../../../src/video-interface';
import {videoManagerForDoc} from '../../../src/services';

/** @const */
const TAG = 'amp-ima-video';

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

    /** @private {?Function} */
    this.unlistenMessage_ = null;

    /** @private {?String} */
    this.preconnectSource_ = null;

    /** @private {?String} */
    this.preconnectTrack_ = null;
  }

  /** @override */
  buildCallback() {
    user().assert(isExperimentOn(this.win, TAG),
        'Experiment ' + TAG + ' is disabled.');

    assertHttpsUrl(this.element.getAttribute('data-tag'),
        'The data-tag attribute is required for <amp-video-ima> and must be ' +
            'https');

    const sourceElements = this.element.getElementsByTagName('source');
    const trackElements = this.element.getElementsByTagName('track');
    const childElements =
        toArray(sourceElements).concat(toArray(trackElements));
    if (childElements.length > 0) {
      const children = [];
      childElements.forEach(child => {
        // Save the first source and first track to preconnect.
        if (child.tagName == 'SOURCE' && !this.preconnectSource_) {
          this.preconnectSource_ = child.src;
        } else if (child.tagName == 'TRACK' && !this.preconnectTrack_) {
          this.preconnectTrack_ = child.src;
        }
        children.push(child./*OK*/outerHTML);
      });
      this.element.setAttribute(
          'data-child-elements', JSON.stringify(children));
    }
  }

  /** @override */
  preconnectCallback() {
    this.preconnect.preload(
        'https://imasdk.googleapis.com/js/sdkloader/ima3.js', 'script');
    const source = this.element.getAttribute('data-src');
    if (source) {
      this.preconnect.url(source);
    }
    if (this.preconnectSource_) {
      this.preconnect.url(this.preconnectSource_);
    }
    if (this.preconnectTrack_) {
      this.preconnect.url(this.preconnectTrack_);
    }
    this.preconnect.url(this.element.getAttribute('data-tag'));
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
    //iframe.setAttribute('allowfullscreen', 'false');
    this.applyFillContent(iframe);

    this.iframe_ = iframe;

    this.playerReadyPromise_ = new Promise(resolve => {
      this.playerReadyResolver_ = resolve;
    });

    this.unlistenMessage_ = listen(
        this.win,
        'message',
        this.handlePlayerMessages_.bind(this)
    );

    this.element.appendChild(iframe);

    installVideoManagerForDoc(this.element);
    videoManagerForDoc(this.win.document).register(this);

    return this.loadPromise(iframe).then(() => this.playerReadyPromise_);
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
    if (this.unlistenMessage_) {
      this.unlistenMessage_();
    }

    this.playerReadyPromise_ = new Promise(resolve => {
      this.playerReadyResolver_ = resolve;
    });
    return true;
  }

  /** @override */
  onLayoutMeasure() {
    if (this.iframe_) {
      this.sendCommand_('resize', {
        'width': this.iframe_./*OK*/offsetWidth,
        'height': this.iframe_./*OK*/offsetHeight,
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
    if (this.iframe_ && this.iframe_.contentWindow)
    {
      this.playerReadyPromise_.then(() => {
        this.iframe_.contentWindow./*OK*/postMessage(JSON.stringify(dict({
          'event': 'command',
          'func': command,
          'args': opt_args || '',
        })), '*');
      });
    }
  }

  /** @private */
  handlePlayerMessages_(event) {
    if (event.source != this.iframe_.contentWindow) {
      return;
    }
    const eventData = getData(event);

    if (isObject(eventData)) {
      const videoEvent = eventData['event'];
      if (videoEvent == VideoEvents.LOAD ||
          videoEvent == VideoEvents.PLAY ||
          videoEvent == VideoEvents.PAUSE ||
          videoEvent == VideoEvents.MUTED ||
          videoEvent == VideoEvents.UNMUTED) {
        if (videoEvent == VideoEvents.LOAD) {
          this.playerReadyResolver_(this.iframe_);
        }
        this.element.dispatchCustomEvent(videoEvent);
      } else if (event.data.event == IMAVideoEvents.REQUEST_FULLSCREEN) {
        this.iframe_.setAttribute('allowfullscreen', true);
        if (event.data.confirm) {
          this.sendCommand_('toggleFullscreen');
        }
      } else if (event.data.event == IMAVideoEvents.CANCEL_FULLSCREEN) {
        this.iframe_.removeAttribute('allowfullscreen');
        if (event.data.confirm) {
          this.sendCommand_('toggleFullscreen');
        }
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
    this.sendCommand_('playVideo');
  }

  /**
   * @override
   */
  pause() {
    this.sendCommand_('pauseVideo');
  }

  /**
   * @override
   */
  mute() {
    this.sendCommand_('mute');
  }

  /**
   * @override
   */
  unmute() {
    this.sendCommand_('unMute');
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
