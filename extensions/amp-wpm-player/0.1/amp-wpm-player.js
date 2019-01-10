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
  VideoAttributes,
  VideoEvents, // TODO: registered, visibility
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
   * @return {Object}
   */
  parseAttributes_() {
    /**
   * @description Method that parses attributes,
   * and ensures that all of the required parameters are present
   * @function
   * @private
   *
   * @param {*} name
   * @param {*} required
   * @param {*} parseFunction
   */
    const parseAttribute = (name, required, parseFunction) => {
      const value = this.element.getAttribute(name);

      if (value) {
        return parseFunction(value);
      } else if (required) {
        throw new Error(`attribute ${name} is reqired`);
      }
    };

    parseAttribute.json = (name, required) =>
      parseAttribute(
          name,
          required,
          value => JSON.parse(value)
      );

    parseAttribute.boolean = (name, required) =>
      parseAttribute(
          name,
          required,
          value => value.toLowerCase() === 'true',
      );

    parseAttribute.string = (name, required) =>
      parseAttribute(
          name,
          required,
          value => value,
      );

    parseAttribute.number = (name, required) =>
      parseAttribute(
          name,
          required,
          value => parseInt(value, 10),
      );

    const output = {
      ampcontrols: true,
      forceUrl4stat: this.win.location.href,
      target: 'playerTarget',
    };

    output.adv = parseAttribute.boolean('adv');
    output.url = parseAttribute.string('url', true); // false, moze byc clip obj
    output.title = parseAttribute.string('title');
    // screenshot?
    output.clip = parseAttribute.json('clip');
    output.forcerelated = parseAttribute.boolean('forcerelated');
    output.hiderelated = parseAttribute.boolean('hiderelated');
    output.hideendscreen = parseAttribute.boolean('hideendscreen');
    output.mediaEmbed = parseAttribute.string('mediaEmbed');
    output.extendedrelated = parseAttribute.boolean('extendedrelated');
    // skin OBJ
    output.showlogo = parseAttribute.boolean('showlogo');
    output.watermark = parseAttribute.boolean('watermark');
    // output.getAppUserInfo = parseAttribute.function('getAppUserInfo');
    output.qoeEventsConfig = parseAttribute.json('qoeEventsConfig');
    output.advVastDuration = parseAttribute.number('advVastDuration');
    output.vastTag = parseAttribute.string('vastTag');
    output.embedTrackings = parseAttribute.json('embedTrackings');

    output.id = parseAttribute.string('id');

    // output.autoplay = this.parseAttribute_(VideoAttributes.AUTOPLAY);
    output.ampnoaudio = parseAttribute.boolean(VideoAttributes.NO_AUDIO);
    output.dock = parseAttribute.boolean(VideoAttributes.DOCK);
    output.rotateToFullscreen = parseAttribute.boolean(
        VideoAttributes.ROTATE_TO_FULLSCREEN,
    );

    return output;
  }

  /**
   * @private
   * @param {*} videoID
   */
  getScreenshotUrl_(videoID) {
    return new Promise(res => {
      const xhr = new XMLHttpRequest();
      xhr.open('GET', `https://video.wp.pl/api/v1/embed/${videoID}`, true);
      xhr.send(null);
      xhr.onreadystatechange = function() {
        if (this.readyState === 4) {
          if (xhr.status === 200) {
            res(JSON.parse(xhr.responseText).clip.screenshot);
          } else {
            res('https://via.placeholder.com/800x500'); // TODO: uniwersalny placeholder
          }
        }
      };
    });
  }

  /**
   *
   * @private
   * @param {*} name
   * @param {*} data
   * @param {*} skipQueue
   */
  sendCommand_(name, data, skipQueue = false) {
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
    this.messageListeners_.push(data => {
      const message = data.split('@PAYLOAD@');
      if (messageName === message[0]) {
        callback(message[1]);
      }
    });
  }

  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    this.element = element;

    this.messageQueue = [];
    this.frameReady = false;
    this.playingState = PlayingStates.PAUSED;
    this.messageListeners_ = [];
  }

  /** @override */
  buildCallback() {
    this.win.addEventListener('message', e => {
      if (e.data.startsWith(this.header)) {
        const message = e.data.replace(this.header, '');

        this.messageListeners_.forEach(listener => {
          listener(message);
        });
      }
    });

    this.attributes = this.parseAttributes_();

    this.frameId = this.attributes.id || `${Math.random() * 10e17}`;
    this.frameUrl = new URL('https://std.wpcdn.pl/wpjslib/AMP-270-init-iframe/playerComponentFrame.html'); // TODO: zmiana na niebrancha
    this.frameUrl.searchParams.set('frameId', this.frameId);
    this.frameUrl.searchParams.set('debug', 'ampPlayerComponent');

    if (this.attributes.url) {
      this.videoId = /mid=(\d*)/g.exec(this.attributes.url)[1];
    } else {
      this.videoId = this.attributes.clip;
    }

    // TODO: atrybuty z obiektu clip

    if (!this.videoId) {
      throw new Error('No clip specified');
    }

    this.header = `WP.AMP.PLAYER.${this.frameId}.`;

    this.registerAction('showControls', () => { this.showControls(); });
    this.registerAction('hideControls', () => { this.hideControls(); });
    this.registerAction('getMetadata', () => { this.getMetadata(); });

    this.container_ = this.win.document.createElement('div');
    this.element.appendChild(this.container_);

    this.placeholderUrl = this.attributes.screenshot || this.getScreenshotUrl_(this.videoId);
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
   * @override
   */
  createPlaceholderCallback() {
    const placeholder = this.win.document.createElement('div');

    const image = this.win.document.createElement('amp-img');
    image.setAttribute('layout', 'fill');
    image.setAttribute('placeholder', 'true');
    this.placeholderUrl.then(url => {
      image.setAttribute('src', url);
    });

    placeholder.appendChild(image);
    return placeholder;
  }

  /** @override */
  layoutCallback() {
    const that = this;

    this.addMessageListener_('FRAME.READY', () => {
      that.contentWindow_ = that.iframe
          .querySelector('iframe')
          .contentWindow;

      that.sendCommand_('init', JSON.stringify(that.attributes), true);
    });

    this.addMessageListener_('PLAYER.READY', () => {
      that.frameReady = true;

      that.element.dispatchCustomEvent(VideoEvents.LOAD);
      this.runQueue_();
      that.togglePlaceholder(false);
    });

    this.addMessageListener_('START_MOVIE', () => {
      that.element.dispatchCustomEvent(VideoEvents.PLAYING);
      that.element.dispatchCustomEvent(VideoEvents.RELOAD);
      that.playingState = PlayingStates.PLAYING_AUTO;
    });

    this.addMessageListener_('USERPLAY', () => {
      that.element.dispatchCustomEvent(VideoEvents.PLAYING);
      that.playingState = PlayingStates.PLAYING_MANUAL;
    });

    this.addMessageListener_('USERPAUSE', () => {
      that.element.dispatchCustomEvent(VideoEvents.PAUSE);
      that.playingState = PlayingStates.PAUSED;
    });

    this.addMessageListener_('END_MOVIE', () => {
      that.element.dispatchCustomEvent(VideoEvents.ENDED);
      that.playingState = PlayingStates.PAUSED;
    });

    this.addMessageListener_('START_ADV_QUEUE', () => {
      that.element.dispatchCustomEvent(VideoEvents.AD_START);
    });

    this.addMessageListener_('END_ADV_QUEUE', () => {
      that.element.dispatchCustomEvent(VideoEvents.AD_END);
    });

    this.addMessageListener_('USER.ACTION', () => {
      if (that.playingState === PlayingStates.PLAYING_AUTO) {
        that.playingState = PlayingStates.PLAYING_MANUAL;
      }
    });

    this.addMessageListener_('POSITION', data => {
      that.position = parseInt(data, 10);
    });

    this.addMessageListener_('PLAYED.RANGES', data => {
      that.playedRanges = JSON.parse(data);
    });

    this.addMessageListener_('METADATA', data => {
      that.metadata_ = JSON.parse(data);
      // that.element.dispatchCustomEvent(VideoEvents.LOADEDMETADATA); // TODO: TUTAJ COS NIE DZIALA I WALI BLAD
    });

    this.iframe = this.win.document.createElement('amp-iframe');
    this.iframe.setAttribute('layout', 'fill');
    this.iframe.setAttribute(
        'sandbox',
        'allow-scripts allow-same-origin allow-popups',
    );
    this.iframe.setAttribute('src', this.frameUrl.toLocaleString());
    this.iframe.setAttribute('frameborder', 0);
    this.iframe.setAttribute('allowfullscreen', true);

    this.placeholderUrl.then(url => {
      placeholder.setAttribute('src', url);
    });
    const placeholder = this.win.document.createElement('amp-img');
    placeholder.setAttribute('layout', 'fill');
    placeholder.setAttribute('placeholder', 'true');

    this.iframe.appendChild(placeholder);
    this.container_.appendChild(this.iframe);

    installVideoManagerForDoc(this.element);
    Services.videoManagerForDoc(
        this.getAmpDoc(),
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
    return true;
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
  pauseCallback() {
    this.sendCommand_('pause');
  }

  /**
  * @override
  */
  play(isAutoplay) {
    this.sendCommand_('play');

    this.playingState = isAutoplay
      ? PlayingStates.PLAYING_AUTO
      : PlayingStates.PLAYING_MANUAL;
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
    return this.metadata_ ? this.metadata_.duration : undefined;
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

  // /**
  // * Called when video is first loaded.
  // * @override
  // */
  // firstLayoutCompleted() {} // TODO: tfisthis?

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
