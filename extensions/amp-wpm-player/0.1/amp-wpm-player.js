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

import {Layout} from '../../../src/layout';
import {
  PlayingStates,
  VideoAnalyticsEvents,
  VideoAttributes,
  VideoEvents,
  VideoInterface,
} from '../../../src/video-interface';
import {Services} from '../../../src/services';
import {VisibilityState} from '../../../src/visibility-state';
import {htmlFor} from '../../../src/static-template';
import {listen} from '../../../src/event-helper';
import {
  setInitialDisplay,
  setStyles,
} from '../../../src/style';

import {
  installVideoManagerForDoc,
} from '../../../src/service/video-manager-impl';

import {
  fullscreenEnter,
  fullscreenExit,
  isFullscreenElement,
} from '../../../src/dom';

export class AmpWpmPlayer extends AMP.BaseElement {

  /**
   * @description Method that parses attributes,
   * and ensures that all of the required parameters are present
   * @function
   * @private
   *
   * @param {*} name
   * @param {*} required
   * @param {*} defaultValue
   */
  parseAttribute_(name, required, defaultValue) {
    if (this.element.hasAttribute(name)) {
      const value = this.element.getAttribute(name);

      if (value === 'true' || value === 'false') { // Check if bool
        return value === 'true';
      }

      return isNaN(value) ? value : parseInt(value, 10); // Check if number
    } else {
      if (required) {
        throw new Error(`attribute ${name} is reqired`);
      } else {
        return defaultValue;
      }
    }
  }

  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {?Element} */
    this.container_ = null;
    this.element = element;

    this.iframeUrl_ = 'http://localhost:8080/frame.html?wpplayer=ampnoaudio';
    this.iframe_ = null;

    this.options = {};
    this.toSend_ = [];
    this.playerReady_ = false;
    this.screenshot = this.parseAttribute_('screenshot');

    this.options.target = 'playerTarget';
    this.options.autoplay = this.parseAttribute_('autoplay', false, true);
    this.options.adv = this.parseAttribute_('adv', false, true);
    this.width = this.parseAttribute_('width', false, 'auto');
    this.height = this.parseAttribute_('height', false, 'auto');
    this.options.url = this.parseAttribute_('url', true);
    this.options.title = this.parseAttribute_('title');
    this.options.floatingplayer = this.parseAttribute_(
        'floatingplayer',
        false,
        true);
    this.options.clip = this.parseAttribute_('clip');
    this.options.forcerelated = this.parseAttribute_('forcerelated');
    this.options.forceliteembed = this.parseAttribute_(
        'forceliteembed',
        false,
        true);
    this.options.forceautoplay = this.parseAttribute_(
        'forceautoplay',
        false,
        false);
    this.options.forcesound = this.parseAttribute_('forcesound', false, false);
    this.options.hiderelated = this.parseAttribute_(
        'hiderelated',
        false,
        false);
    this.options.hideendscreen = this.parseAttribute_(
        'hideendscreen',
        false,
        false);
    this.options.mediaEmbed = this.parseAttribute_(
        'mediaEmbed',
        false,
        'portalowy');
    this.options.extendedrelated = this.parseAttribute_(
        'extendedrelated',
        false,
        true);
    this.options.skin = this.parseAttribute_('skin', false, null);
    this.options.showlogo = this.parseAttribute_('showlogo', false, true);
    this.options.watermark = this.parseAttribute_('watermark', false, false);
    this.options.getAppUserInfo = this.parseAttribute_(
        'getAppUserInfo',
        false,
        function() {});
    this.options.qoeEventsConfig = this.parseAttribute_(
        'qoeEventsConfig',
        false,
        null);
    this.options.advVastDuration = this.parseAttribute_(
        'advVastDuration',
        false,
        2);
    this.options.vastTag = this.parseAttribute_('vastTag', false, null);
    this.options.embedTrackings = this.parseAttribute_(
        'embedTrackings',
        false,
        null);
    this.options.destroyAfterAd = this.parseAttribute_('destroyAfterAd',
        false,
        false);
    this.options.forceUrl4stat = this.parseAttribute_(
        'forceUrl4stat',
        false,
        null);
  }

  /**
  * @private
  * @param {TODO} message
  */
  sendCommand_(message) {
    console.log('component -> sent', message);
    if (this.playerReady_ || message.startsWith('init')) {
      const HEADER = 'WP.AMP.PLAYER.';
      this.contentWindow_.postMessage(HEADER + message, '*');
    } else {
      console.warn('Added ', message, ' to queue');
      this.toSend_.push(message);
    }
  }

  /** @override */
  buildCallback() {
    this.win.onmessage = e => {
      console.log('component -> recived', e.data);
      this.eventListeners_.forEach(listener => {
        listener(e.data);
      });
    };

    /** @private @const {!Array<!UnlistenDef>} */
    this.eventListeners_ = [];
    const that = this;

    this.eventListeners_.push(function(data) {
      const HEADER = 'WP.AMP.PLAYER.';

      if (data === `${HEADER}FRAME.READY`) {
        // that.eventListeners_.splice(that.eventListeners_.indexOf(this), 1);

        that.contentWindow_ = that.iframe_
            .querySelector('iframe')
            .contentWindow;

        that.sendCommand_(`init ${JSON.stringify(that.options)}`);
      }
    });

    this.eventListeners_.push(function(data) {
      const HEADER = 'WP.AMP.PLAYER.';

      if (data === `${HEADER}PLAYER.READY`) {
        that.playerReady_ = true;

        while (that.toSend_.length) {
          that.sendCommand_(that.toSend_.shift());
        }
      }
    });

    this.createPosterForAndroidBug_();
    this.registerAction('asdf', () => {console.log('asdf');});
  }

  /** @override */
  isLayoutSupported(layout) {
    return layout == Layout.RESPONSIVE;
  }


  /** @override */
  isInteractive() {
    return true;
  }

  /**
  * Removes the element.
  * @param {!Element} element
  */
  removeElement(element) {
    if (element.parentElement) {
      element.parentElement.removeChild(element);
    }
  }

  /** @override */
  layoutCallback() {
    this.container_ = this.win.document.createElement('div');

    const iframe = this.win.document.createElement('amp-iframe');
    // iframe.setAttribute('width', this.options.width);
    // iframe.setAttribute('height', this.options.height);
    iframe.setAttribute('layout', 'fill');
    iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin');
    iframe.setAttribute('src', this.iframeUrl_);
    iframe.setAttribute('frameborder', 0);
    // iframe.setAttribute('resizable', true);

    const placeholder = this.win.document.createElement('amp-img');
    placeholder.setAttribute('layout', 'fill');
    placeholder.setAttribute('src', this.screenshot);
    placeholder.setAttribute('placeholder', 'true');

    iframe.appendChild(placeholder);
    this.iframe_ = iframe;

    this.container_.appendChild(iframe);
    this.element.appendChild(this.container_);
    // this.applyFillContent(this.container_, /* replacedContent */ true);

    const {element} = this;
    const ampDoc = this.getAmpDoc();

    installVideoManagerForDoc(element);
    Services.videoManagerForDoc(ampDoc).register(this);
  }

  /**
  * @override
  */
  supportsPlatform() {
    return true;
  }

  /** @override */
  unlayoutCallback() {
    // send destruct to player
    if (this.iframe_) {
      this.removeElement(this.iframe_);
      this.iframe_ = null;
    }
    return true; // Call layoutCallback again.
  }

  /**
  * @param {boolean=} onLayout
  * @override
  */
  preconnectCallback(onLayout) {
    this.preconnect.url(this.iframeUrl_, onLayout); // TODO: url playera
    this.preconnect.url(this.options.url, onLayout);
    this.preconnect.url(this.screenshot, onLayout); // TODO: na pewno?
    this.preconnect.url('https://std.wpcdn.pl/wpjslib/wpjslib-inline.js', onLayout);
  }

  /** @override */
  pauseCallback() {
    if (this.video_) {
      this.video_.pause();
    }
  }

  /**
  * Android will show a blank frame between the poster and the first frame in
  * some cases. In these cases, the video element is transparent. By setting
  * a poster layer underneath, the poster is still shown while the first frame
  * buffers, so no FOUC.
  * @private
  */
  createPosterForAndroidBug_() {
    if (!Services.platformFor(this.win).isAndroid()) {
      return;
    }
    const {element} = this;
    if (element.querySelector('i-amphtml-poster')) {
      return;
    }
    const poster = htmlFor(element)`<i-amphtml-poster></i-amphtml-poster>`;
    const src = element.getAttribute('poster');
    setInitialDisplay(poster, 'block');
    setStyles(poster, {
      'background-image': `url(${src})`,
      'background-size': 'cover',
    });
    poster.classList.add('i-amphtml-android-poster-bug');
    this.applyFillContent(poster);
    element.appendChild(poster);
  }

  /**
  * @override
  */
  pause() {
    this.sendCommand_('pause');
  }

  /**
  * @override
  */
  play() {
    this.sendCommand_('play');
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
    this.sendCommand_('unmute');
  }

  /**
  * @override
  */
  showControls() {
    this.sendCommand_('showControls');
  }

  /**
  * @override
  */
  hideControls() {
    this.sendCommand_('hideControls');
  }

  /**
  * @override
  */
  fullscreenEnter() {
    fullscreenEnter(this.iframe_);
  }

  /**
  * @override
  */
  fullscreenExit() {
    fullscreenExit(this.iframe_);
  }

  /** @override */
  isFullscreen() {
    return isFullscreenElement(this.iframe_);
  }

  /** @override */
  getMetadata() {
    this.sendCommand_('getMetadata');
  }

  /** @override */
  getCurrentTime() {
    return this.video_.currentTime;
  }

  /** @override */
  getDuration() {
    return this.video_.duration;
  }

  /** @override */
  preimplementsAutoFullscreen() {
    return false;
  }

  // TODO: zaimplementować video element actions z: https://www.ampproject.org/docs/interaction_dynamic/amp-actions-and-events

  /**
  * Called when video is first loaded.
  * @override
  */
  firstLayoutCompleted() {
    // if (!this.hideBlurryPlaceholder_()) {
    //   this.togglePlaceholder(false);
    // }
  }
}

AMP.registerElement('amp-wpm-player', AmpWpmPlayer);
//  TODO:
/**
  *  If this returns true then it will be assumed that the player implements
   * a feature to enter fullscreen on device rotation internally, so that the
   * video manager does not override it. If not, the video manager will
   * implement this feature automatically for videos with the attribute
   * `rotate-to-fullscreen`.
   *
   * @return {boolean}
   *
   * preimplementsAutoFullscreen
*/
