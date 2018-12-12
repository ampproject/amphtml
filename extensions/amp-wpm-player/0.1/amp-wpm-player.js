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

import {
  PlayingStates,
  VideoAttributes, // TODO: docking
  VideoEvents, // TODO: registered, visibility
  VideoInterface, // TODO: played ranges
} from '../../../src/video-interface';
import {Services} from '../../../src/services';
import {htmlFor} from '../../../src/static-template';
import {
  setInitialDisplay,
  setStyles,
} from '../../../src/style';

import {listenOncePromise} from '../../../src/event-helper';

import {
  installVideoManagerForDoc,
} from '../../../src/service/video-manager-impl';

import {
  fullscreenEnter,
  fullscreenExit,
  isFullscreenElement,
} from '../../../src/dom';

import {isLayoutSizeDefined} from '../../../src/layout';

/** @implements {../../../src/video-interface.VideoInterface} */
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

  /**
   * @description Method that parses attributes,
   * and ensures that all of the required parameters are present
   * @function
   * @private
   *
   * @return {Object}
   */
  parseOptions_() {
    const output = {};
    output.ampnoaudio = this.parseAttribute_(VideoAttributes.NO_AUDIO);
    output.autoplay = this.parseAttribute_(VideoAttributes.AUTOPLAY);
    output.dock = this.parseAttribute_(VideoAttributes.DOCK);
    output.rotateToFullscreen = this.parseAttribute_(VideoAttributes.ROTATE_TO_FULLSCREEN);

    output.ampcontrols = true;
    output.target = 'playerTarget';
    output.adv = this.parseAttribute_('adv', false, true);
    output.url = this.parseAttribute_('url', true);
    output.title = this.parseAttribute_('title');
    output.floatingplayer = this.parseAttribute_( // TODO: to wgl będzie obsługiwane?
        'floatingplayer',
        false,
        true);
    output.clip = this.parseAttribute_('clip');
    output.forcerelated = this.parseAttribute_('forcerelated');
    output.forceliteembed = this.parseAttribute_(
        'forceliteembed',
        false,
        true);
    output.forceautoplay = this.parseAttribute_(
        'forceautoplay',
        false,
        false);
    output.forcesound = this.parseAttribute_('forcesound', false, false);
    output.hiderelated = this.parseAttribute_(
        'hiderelated',
        false,
        false);
    output.hideendscreen = this.parseAttribute_(
        'hideendscreen',
        false,
        false);
    output.mediaEmbed = this.parseAttribute_(
        'mediaEmbed',
        false,
        'portalowy');
    output.extendedrelated = this.parseAttribute_(
        'extendedrelated',
        false,
        true);
    output.skin = this.parseAttribute_('skin', false, null);
    output.showlogo = this.parseAttribute_('showlogo', false, true);
    output.watermark = this.parseAttribute_('watermark', false, false);
    output.getAppUserInfo = this.parseAttribute_(
        'getAppUserInfo',
        false,
        function() {});
    output.qoeEventsConfig = this.parseAttribute_(
        'qoeEventsConfig',
        false,
        null);
    output.advVastDuration = this.parseAttribute_(
        'advVastDuration',
        false,
        2);
    output.vastTag = this.parseAttribute_('vastTag', false, null);
    output.embedTrackings = this.parseAttribute_(
        'embedTrackings',
        false,
        null);
    output.destroyAfterAd = this.parseAttribute_('destroyAfterAd',
        false,
        false);
    output.forceUrl4stat = this.parseAttribute_(
        'forceUrl4stat',
        false,
        null);

    return output;
  }

  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {?Element} */
    this.container_ = null;
    this.element = element;

    this.iframeUrl_ = 'https://std.wpcdn.pl/mbartoszewicz/frame.html?wpplayer=mobile-autoplay&disabledLiteEmbed=1&ampnoaudio=1&_aa=0';
    this.iframe_ = null;

    this.options = this.parseOptions_();
    this.toSend_ = [];
    this.playerReady_ = false;

    this.width = this.parseAttribute_('width', false, 'auto');
    this.height = this.parseAttribute_('height', false, 'auto');

    if (this.options.url) {
      this.videoId = /mid=(\d*)/g.exec(this.options.url)[1];
    } else {
      this.videoId = this.options.clip;
    }

    const getScreenshot = videoID => {
      const xhr = new XMLHttpRequest();
      xhr.open('GET', `https://video.wp.pl/api/v1/embed/${videoID}`, false);
      xhr.send(null);
      if (xhr.status == 200) {
        return JSON.parse(xhr.responseText).clip.screenshot;
      } else {
        return 'https://via.placeholder.com/800x500'; // TODO: uniwersalny placeholder
      }
    };

    this.screenshot = this.parseAttribute_('screenshot');
    if (!this.screenshot) {
      this.screenshot = getScreenshot(this.videoId);
    }
    console.log('constructor done');
  }

  /**
  * @private
  * @param {TODO} message
  */
  sendCommand_(message) {
    console.log('component -> sent', message);
    if (this.playerReady_ || message.startsWith('init')) {
      const HEADER = 'WP.AMP.PLAYER.';
      console.log('asdfasdf');
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

        that.element.dispatchCustomEvent(VideoEvents.LOAD);

        while (that.toSend_.length) {
          that.sendCommand_(that.toSend_.shift());
        }

        that.togglePlaceholder(false);
      }
    });

    this.eventListeners_.push(function(data) {
      const HEADER = 'WP.AMP.PLAYER.';

      if (data.startsWith(`${HEADER}START_MOVIE`)) {
        that.metadata_ = JSON.parse(data.replace(`${HEADER}START_MOVIE`, ''));
        that.element.dispatchCustomEvent(VideoEvents.PLAYING); // TODO: sprawdzic czy wszystko
        that.element.dispatchCustomEvent(VideoEvents.RELOAD); // TODO: sprawdzic czy wszystko
      }
    });

    this.eventListeners_.push(function(data) {
      const HEADER = 'WP.AMP.PLAYER.';

      if (data.startsWith(`${HEADER}PLAY`)) {
        that.element.dispatchCustomEvent(VideoEvents.PLAYING); // TODO: dokończyc to, autoplay
      }
    });

    this.eventListeners_.push(function(data) {
      const HEADER = 'WP.AMP.PLAYER.';

      if (data.startsWith(`${HEADER}PAUSE`)) {
        that.element.dispatchCustomEvent(VideoEvents.PAUSE); // TODO: dokończyc to, autoplay
      }
    });

    this.eventListeners_.push(function(data) {
      const HEADER = 'WP.AMP.PLAYER.';

      if (data.startsWith(`${HEADER}END_MOVIE`)) {
        that.element.dispatchCustomEvent(VideoEvents.ENDED); // TODO: dokończyc to, pause + to + src change pewnie
      }
    });

    this.eventListeners_.push(function(data) {
      const HEADER = 'WP.AMP.PLAYER.';

      if (data.startsWith(`${HEADER}START_ADV_QUEUE`)) {
        that.element.dispatchCustomEvent(VideoEvents.AD_START);
      }
    });

    this.eventListeners_.push(function(data) {
      const HEADER = 'WP.AMP.PLAYER.';

      if (data.startsWith(`${HEADER}END_ADV_QUEUE`)) {
        that.element.dispatchCustomEvent(VideoEvents.AD_END); // TODO: czy to moze byc jako adstart i adend ++ czy end beak moze byc tak samo jak end queue
      }
    });

    // TODO: event listenery do kupy

    this.createPosterForAndroidBug_();
    this.registerAction('showControls', () => {this.showControls();});
    this.registerAction('hideControls', () => {this.hideControls();});
    this.registerAction('getMetadata', () => {this.getMetadata();});
  }

  /** @override */
  isLayoutSupported(layout) {
    // return layout == Layout.RESPONSIVE;
    return isLayoutSizeDefined(layout);
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
    iframe.setAttribute('layout', 'fill');
    iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin');
    iframe.setAttribute('src', this.iframeUrl_);
    iframe.setAttribute('frameborder', 0);
    iframe.setAttribute('allowfullscreen', true);
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
  play() {
    this.sendCommand_('play');
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
  mute() {
    this.sendCommand_('mute');
    this.element.dispatchCustomEvent(VideoEvents.MUTED);
  }

  /**
  * @override
  */
  unmute() {
    this.sendCommand_('unmute');
    this.element.dispatchCustomEvent(VideoEvents.UNMUTED);
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
    console.log(this.metadata_);
    return this.metadata_;
  }

  /** @override */
  getCurrentTime() { // TODO: current time
    return 0;
  }

  /** @override */
  getDuration() {
    return 0; // TODO: duration
  }

  /** @override */
  getPlayedRanges() {
    return []; // TODO: implement
  }

  /** @override */
  preimplementsAutoFullscreen() {
    return true; // TODO: nie wiem
  }

  /** @override */
  preimplementsMediaSessionAPI() {
    return false; // TODO: nie wiem
  }

  // TODO: zaimplementować video element actions z: https://www.ampproject.org/docs/interaction_dynamic/amp-actions-and-events

  /**
  * Called when video is first loaded.
  * @override
  */
  firstLayoutCompleted() {}
}

// AMP.registerElement('amp-wpm-player', AmpWpmPlayer);

AMP.extension('amp-wpm-player', '0.1', AMP => {
  AMP.registerElement('amp-wpm-player', AmpWpmPlayer);
});
