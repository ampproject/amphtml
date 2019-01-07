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

// TODO: parametry jakos tam ogarnac

import {
  PlayingStates,
  VideoAttributes,
  VideoEvents, //TODO: registered, visibility
  VideoInterface,
} from '../../../src/video-interface';
import {Services} from '../../../src/services';

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
  parseAttributes_() {
    const output = {};
    output.id = this.parseAttribute_('id');
    output.ampnoaudio = this.parseAttribute_(VideoAttributes.NO_AUDIO);
    output.autoplay = this.parseAttribute_(VideoAttributes.AUTOPLAY);
    output.dock = this.parseAttribute_(VideoAttributes.DOCK);
    output.rotateToFullscreen = this.parseAttribute_(
        VideoAttributes.ROTATE_TO_FULLSCREEN
    );

    output.ampcontrols = true;
    output.forceUrl4stat = this.win.location.href;

    output.target = 'playerTarget';
    output.adv = this.parseAttribute_('adv', false, true);
    output.url = this.parseAttribute_('url', true);
    // output.clip = this.parseAttribute_('clip');
    // output.forcerelated = this.parseAttribute_('forcerelated');
    output.forcesound = this.parseAttribute_('forcesound', false, false);
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
    output.getAppUserInfo = this.parseAttribute_(
        'getAppUserInfo',
        false,
        function() {});
    output.screenshott = this.parseAttribute_('screenshot'); // TODO: check

    return output;
  }

  /**
   * @private
   * @param {*} videoID
   */
  getScreenshot_(videoID) {
    //TODO: Make sure not to request external resources in the pre-render phase. Requests to the publisher's origin itself are OK. If in doubt, please flag this in review.
    return new Promise(res => {
      const xhr = new XMLHttpRequest();
      xhr.open('GET', `https://video.wp.pl/api/v1/embed/${videoID}`, true);
      xhr.send(null);
      xhr.onreadystatechange = function() {
        if (this.readyState == 4) {
          if (xhr.status === 200) {
            res(JSON.parse(xhr.responseText).clip.screenshot);
          } else {
            res('https://via.placeholder.com/800x500'); // TODO: uniwersalny placeholder
          }
        }
      };
    });
  }

  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {?Element} */
    this.container_ = null;
    this.element = element;
    this.attributes = this.parseAttributes_(); // TODO: rename options

    console.log('initPlayer1', this.attributes);

    this.frameId = this.attributes.id || `${Math.random() * 10e17}`;

    this.frameUrl = new URL('https://std.wpcdn.pl/mbartoszewicz/frame.html');

    // this.frameUrl.searchParams.set('wpplayer', 'mob-auto-master');
    // this.frameUrl.searchParams.set('disabledLiteEmbed', 1);
    // this.frameUrl.searchParams.set('ampnoaudio', 1);
    this.frameUrl.searchParams.set('frameId', this.frameId);

    this.messageQueue = [];
    this.frameReady = false;

    if (this.attributes.url) {
      this.videoId = /mid=(\d*)/g.exec(this.attributes.url)[1];
    } else {
      this.videoId = this.attributes.clip;
    }

    this.playingState = PlayingStates.PAUSED;
    this.header = `WP.AMP.PLAYER.${this.frameId}.`;
  }

  /**
   *
   * @private
   * @param {*} name
   * @param {*} data
   * @param {*} skipQueue
   */
  sendCommand_(name, data, skipQueue = false) {
    console.log('component -> sent', name, ' with data ', data);
    if (this.frameReady || skipQueue) {
      this.contentWindow_.postMessage(data
        ? `${this.header}${name}@PAYLOAD@${data}`
        : `${this.header}${name}`, '*');
    } else {
      this.messageQueue.push({name, data});
    }
  }

  /**
   * @private
   */
  runQueue_() {
    while (this.messageQueue.length) {
      const command = this.messageQueue.shift();

      this.sendCommand_(command.name, command.data);
    }
  }

  /**
   * @private
   * @param {*} messageName
   * @param {*} callback
   */
  addMessageListener_(messageName, callback) {
    this.eventListeners_.push(data => {
      const message = data.split('@PAYLOAD@');
      if (messageName === message[0]) {
        callback(message[1]);
      }
    });
  }

  /** @override */
  buildCallback() {
    // setInterval(() => {console.log('state', this.playingState);}, 1000);



    this.win.addEventListener('message', e => {
      // console.log('component -> recived', e.data);

      if (e.data.startsWith(this.header)) {
        const message = e.data.replace(this.header, '');

        this.eventListeners_.forEach(listener => {
          listener(message);
        });
      }
    });

    /** @private @const {!Array<!UnlistenDef>} */
    this.eventListeners_ = [];
    const that = this;

    this.addMessageListener_('FRAME.READY', () => {
      console.log('FRAME.READY');
      that.contentWindow_ = that.iframe
          .querySelector('iframe')
          .contentWindow;

      console.log('initPlayer3', that.attributes);

      that.sendCommand_('init', JSON.stringify(that.attributes), true);
    });

    this.addMessageListener_('PLAYER.READY', () => {
      console.log('PLAYER.READY');
      that.frameReady = true;

      that.element.dispatchCustomEvent(VideoEvents.LOAD);
      this.runQueue_();
      that.togglePlaceholder(false);
    });

    this.addMessageListener_('START_MOVIE', () => {
      console.log('START_MOVIE');
      that.element.dispatchCustomEvent(VideoEvents.PLAYING);
      that.element.dispatchCustomEvent(VideoEvents.RELOAD);
      that.playingState = PlayingStates.PLAYING_AUTO; // TODO: a co tutaj za stan?
    });

    this.addMessageListener_('METADATA', data => {
      console.log('METADATA');
      that.metadata_ = JSON.parse(data);
      console.log('duration', that.getDuration());
      // that.element.dispatchCustomEvent(VideoEvents.LOADEDMETADATA); // TODO: TUTAJ COS NIE DZIALA I WALI BLAD
    });

    this.addMessageListener_('PLAY', () => {
      console.log('PLAY');
      that.element.dispatchCustomEvent(VideoEvents.PLAYING); // TODO: dokończyc to, autoplay
    });

    this.addMessageListener_('PAUSE', () => {
      console.log('PAUSE');
      that.element.dispatchCustomEvent(VideoEvents.PAUSE);
      that.playingState = PlayingStates.PAUSED;
    });

    this.addMessageListener_('USERPLAY', () => {
      console.log('USERPLAY');
      that.element.dispatchCustomEvent(VideoEvents.PLAYING); // TODO: dokończyc to, autoplay
    });

    this.addMessageListener_('USERPAUSE', () => {
      console.log('USERPAUSE');
      that.element.dispatchCustomEvent(VideoEvents.PAUSE);
      that.playingState = PlayingStates.PAUSED;
    });

    this.addMessageListener_('END_MOVIE', () => {
      console.log('END_MOVIE');
      that.element.dispatchCustomEvent(VideoEvents.ENDED); // TODO: dokończyc to, pause + to + src change pewnie
      that.playingState = PlayingStates.PAUSED; // TODO: tutaj cos ogarnac
    });

    this.addMessageListener_('START_ADV_QUEUE', () => {
      console.log('START_ADV_QUEUE');
      that.element.dispatchCustomEvent(VideoEvents.AD_START);
    });

    this.addMessageListener_('END_ADV_QUEUE', () => {
      console.log('END_ADV_QUEUE');
      that.element.dispatchCustomEvent(VideoEvents.AD_END);
    });

    this.addMessageListener_('USER.ACTION', () => {
      console.log('USER.ACTION');
      that.playingState = PlayingStates.PLAYING_MANUAL;
    });

    this.addMessageListener_('POSITION', data => {
      that.position = parseInt(data, 10);
    });

    this.addMessageListener_('PLAYED.RANGES', data => {
      that.playedRanges = JSON.parse(data);
    }); // TODO: user play powinno zmieniac stan

    this.registerAction('showControls', () => {this.showControls();});
    this.registerAction('hideControls', () => {this.hideControls();});
    this.registerAction('getMetadata', () => {this.getMetadata();});
  }

  /** @override */
  isLayoutSupported(layout) {
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
  removeElement(element) { // TODO: czy to wgl trzeba nadpisywac
    // TODO: send destruct to player
    console.log('destroy');
    this.sendCommand_('destroy');

    if (element.parentElement) {
      element.parentElement.removeChild(element);
    }
  }

  // /**
  //  * @override
  //  */
  // createPlaceholderCallback() {
  //   if (!this.attributes.screenshott) {
  //     this.attributes.screenshott = this.getScreenshot_(this.videoId);
  //   }

  //   const placeholder = this.win.document.createElement('amp-img');
  //   placeholder.setAttribute('layout', 'fill');
  //   placeholder.setAttribute('placeholder', 'true');
  //   // this.attributes.screenshot.then(url => {
  //   placeholder.setAttribute('src', 'https://via.placeholder.com/300x200.jpg');
  //   // });

  // }

  /** @override */
  layoutCallback() {
    this.container_ = this.win.document.createElement('div');

    this.iframe = this.win.document.createElement('amp-iframe');
    this.iframe.setAttribute('layout', 'fill');
    this.iframe.setAttribute(
        'sandbox',
        'allow-scripts allow-same-origin allow-popups');
    this.iframe.setAttribute('src', this.frameUrl.toLocaleString());
    this.iframe.setAttribute('frameborder', 0);
    this.iframe.setAttribute('allowfullscreen', true);
    // this.iframe.setAttribute('resizable', true); // TODO: wtedy trzeba overflow, problematyczne

    const placeholder = this.win.document.createElement('amp-img');
    placeholder.setAttribute('layout', 'fill');
    placeholder.setAttribute('placeholder', 'true');
    placeholder.setAttribute('src', 'https://via.placeholder.com/300x200.jpg');
    // if (!this.attributes.screenshott) {
    //   this.attributes.screenshott = this.getScreenshot_(this.videoId);
    // }
    // this.attributes.screenshott.then(url => {
    // });

    this.iframe.appendChild(placeholder);

    this.container_.appendChild(this.iframe);
    this.element.appendChild(this.container_);
    // this.applyFillContent(this.container_, /* replacedContent */ true);

    installVideoManagerForDoc(this.element);
    Services.videoManagerForDoc(
        this.getAmpDoc()
    ).register(this);

    this.element.dispatchCustomEvent(VideoEvents.REGISTERED);
  }

  /**
  * @override
  */
  supportsPlatform() {
    return true;
  }

  /** @override */
  unlayoutCallback() {
    if (this.iframe) {
      this.removeElement(this.iframe);
      this.iframe = null;
    }
    return true; // Call layoutCallback again.
  }

  /**
  * @param {boolean=} onLayout
  * @override
  */
  preconnectCallback(onLayout) {
    this.preconnect.url(this.frameUrl.toLocaleString(), onLayout);
    this.preconnect.url(this.attributes.url, onLayout);
    this.preconnect.url('https://std.wpcdn.pl/wpjslib/wpjslib-inline.js', onLayout);
    this.preconnect.url('https://std.wpcdn.pl/player/mobile-autoplay/wpjslib_player.js', onLayout); // TODO: url playera
  }

  /** @override */
  pauseCallback() { // TODO: tf is this?
    if (this.video_) {
      this.video_.pause();
    }
  }

  /** @override */
  viewportCallback(inViewport) { // TODO: czy mozna tego nie nadpisywac, a moze jakies zliczenia?
    this.element.dispatchCustomEvent(VideoEvents.VISIBILITY, {inViewport});
  }

  /**
  * @override
  */
  play(isAutoplay) {
    console.log('auto', isAutoplay); // TODO: set autoplay // TODO: playing states naprawic
    this.sendCommand_('play');

    this.playingState = isAutoplay
      ? PlayingStates.PLAYING_AUTO
      : PlayingStates.PLAYING_MANUAL; // TODO: ten stan jeszcze musi sie zmieniac na 100% gdzies
  }

  /**
  * @override
  */
  pause() {
    this.sendCommand_('pause');
    this.playingState = PlayingStates.PAUSED;
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
    if (this.playingState === PlayingStates.PLAYING_AUTO) {
      this.sendCommand_('popupControls');
    } else {
      this.sendCommand_('showControls');
    }
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
    fullscreenEnter(this.iframe); // TODO: resize iframe
  }

  /**
  * @override
  */
  fullscreenExit() {
    fullscreenExit(this.iframe);
  }

  /** @override */
  isFullscreen() {
    return isFullscreenElement(this.iframe);
  }

  /** @override */
  getMetadata() {
    return this.metadata_; // TODO: odpowiedni format danych
  }

  /** @override */
  getCurrentTime() {
    return this.position;
  }

  /** @override */
  getDuration() {
    return this.metadata_ ? this.metadata_.duration : undefined; // TODO: duration do innej zmiennej
  }

  /** @override */
  getPlayedRanges() {
    return this.playedRanges || [];
  }

  /** @override */
  preimplementsAutoFullscreen() {
    return true; // TODO: check
  }

  /** @override */
  preimplementsMediaSessionAPI() {
    return false; // TODO: check
  }

  // TODO: zaimplementować video element actions z: https://www.ampproject.org/docs/interaction_dynamic/amp-actions-and-events

  /**
  * Called when video is first loaded.
  * @override
  */
  firstLayoutCompleted() {} // TODO: tfisthis?

  /** @override */
  mutatedAttributesCallback(mutations) {
    console.log('mutations', mutations);
  }

  /** @override */
  detachedCallback() {
    console.warn('DETACHED LOG W KODZIE');
  }
}

AMP.extension('amp-wpm-player', '0.1', AMP => {
  AMP.registerElement('amp-wpm-player', AmpWpmPlayer);
});
