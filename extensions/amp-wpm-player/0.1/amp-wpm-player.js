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
  VideoEvents,
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
     * @private
     * @param {*} name
     * @param {*} required
     * @param {*} parseFunction
     */
    const parseAttribute = (name, required, parseFunction) => {
      let value = this.element_.getAttribute(name);

      if (value === '') {
        value = 'true';
      }

      if (value) {
        return parseFunction(value);
      } else if (required) {
        throw new Error(`attribute ${name} is reqired`);
      }
    };

    /**
     * Method that parses a json object from the html attribute
     * specified in the name parameter
     * @private
     * @param {string} name
     * @param {boolean} required Specifies weather to throw and error when the attribute is not preset
     *
     * @return {Object}
     */
    parseAttribute.json = (name, required) =>
      parseAttribute(
          name,
          required,
          value => JSON.parse(decodeURIComponent(value))
      );

    /**
     * Method that parses a boolean from the html attribute
     * specified in the name parameter
     * @private
     * @param {string} name
     * @param {boolean} required Specifies weather to throw and error when the attribute is not preset
     *
     * @return {boolean}
     */
    parseAttribute.boolean = (name, required) =>
      parseAttribute(
          name,
          required,
          value => value.toLowerCase() === 'true',
      );

    /**
     * Method that parses a string from the html attribute
     * specified in the name parameter
     * @private
     * @param {string} name
     * @param {boolean} required Specifies weather to throw and error when the attribute is not preset
     *
     * @return {string}
     */
    parseAttribute.string = (name, required) =>
      parseAttribute(
          name,
          required,
          value => value,
      );

    /**
     * Method that parses a number from the html attribute
     * specified in the name parameter
     * @private
     * @param {string} name
     * @param {boolean} required Specifies weather to throw and error when the attribute is not preset
     *
     * @return {number}
     */
    parseAttribute.number = (name, required) =>
      parseAttribute(
          name,
          required,
          value => parseInt(value, 10),
      );

    const clip = parseAttribute.json('clip') || {};
    return {
      ampcontrols: true,
      forceUrl4stat: this.win.location.href,
      target: 'playerTarget',
      ...clip,
      adv: parseAttribute.boolean('adv'),
      url: parseAttribute.string('url'),
      title: parseAttribute.string('title'),
      screenshot: parseAttribute.string('screenshot'),
      forcerelated: parseAttribute.boolean('forcerelated'),
      hiderelated: parseAttribute.boolean('hiderelated'),
      hideendscreen: parseAttribute.boolean('hideendscreen'),
      mediaEmbed: parseAttribute.string('mediaEmbed'),
      extendedrelated: parseAttribute.boolean('extendedrelated'),
      skin: parseAttribute.json('skin'),
      showlogo: parseAttribute.boolean('showlogo'),
      watermark: parseAttribute.boolean('watermark'),
      qoeEventsConfig: parseAttribute.json('qoeEventsConfig'),
      advVastDuration: parseAttribute.number('advVastDuration'),
      vastTag: parseAttribute.string('vastTag'),
      embedTrackings: parseAttribute.json('embedTrackings'),
      id: parseAttribute.string('id'),

      autoplay: parseAttribute.boolean(VideoAttributes.AUTOPLAY) || false,
      ampnoaudio: parseAttribute.boolean(VideoAttributes.NO_AUDIO),
      dock: parseAttribute.boolean(VideoAttributes.DOCK),
      rotateToFullscreen: parseAttribute.boolean(
          VideoAttributes.ROTATE_TO_FULLSCREEN,
      ),
    };
  }

  /**
   * Method that sends postMessage to iframe that contains the player.
   * Message is prepended with proper header.
   * If the frame is not ready all messages will be saved in queue and
   * sent whe runQueue method is called.
   * @private
   * @param {string} name name of the command
   * @param {string} data optional data to send with the command
   * @param {boolean} skipQueue if this parameter is present the message will
   * send the command even when the frame is not read
   */
  sendCommand_(name, data, skipQueue = false) {
    if (this.frameReady_ || skipQueue) {
      this.contentWindow_.postMessage(data
        ? `${this.header_}${name}@PAYLOAD@${data}`
        : `${this.header_}${name}`, '*');
    } else {
      this.messageQueue_.push({name, data});
    }
  }

  /**
   * Method that sends messages that were saved in queue
   * @private
   */
  runQueue_() {
    while (this.messageQueue_.length) {
      const command = this.messageQueue_.shift();

      this.sendCommand_(command.name, command.data);
    }
  }

  /**
   * Method that adds a listener for messages from iframe
   * @private
   * @param {string} messageName Name of the message this callback listenes for
   * @param {function(string)} callback
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

    /** @private {!Element} */
    this.element_ = element;

    /** @private {!Array<Object<string, string>>} */
    this.messageQueue_ = [];

    /** @private {bool} */
    this.frameReady_ = false;

    /** @private {string} */
    this.playingState_ = PlayingStates.PAUSED;

    /** @private {!Array<function>} */
    this.messageListeners_ = [];

    /** @private {?Object} */
    this.attributes_;

    /** @private {string} */
    this.frameId_;

    /** @private {string} */
    this.frameUrl_;

    /** @private {string} */
    this.videoId_;

    /** @private {string} */
    this.header_;

    /** @private {element} */
    this.container_;

    /** @private {string} */
    this.placeholderUrl_;

    /** @private {element} */
    this.iframe_;

    /** @private {!Object} */
    this.contentWindow_;

    /** @private {number} */
    this.position_;

    /** @private {Array<Array<number>>} */
    this.playedRanges_;

    /** @private {Object} */
    this.metadata_;

    /** @private {!Window} */
    this.win;
  }

  /** @override */
  buildCallback() {
    this.win.addEventListener('message', e => {
      if (typeof e.data === 'string' && e.data.startsWith(this.header_)) {
        const message = e.data.replace(this.header_, '');

        this.messageListeners_.forEach(listener => {
          listener(message);
        });
      }
    });

    this.attributes_ = this.parseAttributes_();

    this.frameId_ = this.attributes_.id || `${Math.random() * 10e17}`;
    this.frameUrl_ = new URL('https://std.wpcdn.pl/wpjslib/AMP-270-init-iframe/playerComponentFrame.html');
    this.frameUrl_.searchParams.set('frameId', this.frameId_);
    this.frameUrl_.searchParams.set('debug', 'ampPlayerComponent');

    if (this.attributes_.url) {
      this.videoId_ = /mid=(\d*)/g.exec(this.attributes_.url)[1];
    } else {
      this.videoId_ = this.attributes_.clip;
    }

    if (!this.videoId_) {
      throw new Error('No clip specified');
    }
    this.header_ = `WP.AMP.PLAYER.${this.frameId_}.`;

    this.registerAction('showControls', () => { this.showControls(); });
    this.registerAction('hideControls', () => { this.hideControls(); });
    this.registerAction('getMetadata', () => { this.getMetadata(); });

    this.container_ = this.win.document.createElement('div');
    this.element_.appendChild(this.container_);

    this.placeholderUrl_ = this.attributes_.screenshot;
  }

  /** @override */
  isLayoutSupported(layout) {
    return isLayoutSizeDefined(layout);
  }

  /** @override */
  isInteractive() {
    return true;
  }

  /** @override */
  createPlaceholderCallback() {
    const placeholder = this.win.document.createElement('div');
    placeholder.setAttribute('placeholder', 'true');

    const image = this.win.document.createElement('amp-img');
    image.setAttribute('layout', 'fill');
    if (this.placeholderUrl_) {
      image.setAttribute('src', this.placeholderUrl_);
    }

    placeholder.appendChild(image);
    return placeholder;
  }

  /** @override */
  layoutCallback() {
    const that = this;

    this.addMessageListener_('FRAME_READY', () => {
      that.contentWindow_ = that.iframe_
          .querySelector('iframe')
          .contentWindow;

      that.sendCommand_('init', JSON.stringify(that.attributes_), true);
    });

    this.addMessageListener_('PLAYER_READY', () => {
      that.frameReady_ = true;

      that.element_.dispatchCustomEvent(VideoEvents.LOAD);
      this.runQueue_();
      that.togglePlaceholder(false);
    });

    this.addMessageListener_('START_MOVIE', () => {
      that.element_.dispatchCustomEvent(VideoEvents.PLAYING);
      that.element_.dispatchCustomEvent(VideoEvents.RELOAD);
      that.playingState_ = PlayingStates.PLAYING_AUTO;
      that.togglePlaceholder(false);

    });

    this.addMessageListener_('USERPLAY', () => {
      that.element_.dispatchCustomEvent(VideoEvents.PLAYING);
      that.playingState_ = PlayingStates.PLAYING_MANUAL;
    });

    this.addMessageListener_('USERPAUSE', () => {
      that.element_.dispatchCustomEvent(VideoEvents.PAUSE);
      that.playingState_ = PlayingStates.PAUSED;
    });

    this.addMessageListener_('END_MOVIE', () => {
      that.element_.dispatchCustomEvent(VideoEvents.ENDED);
      that.playingState_ = PlayingStates.PAUSED;
    });

    this.addMessageListener_('START_ADV_QUEUE', () => {
      that.element_.dispatchCustomEvent(VideoEvents.AD_START);
      that.togglePlaceholder(false);
    });

    this.addMessageListener_('END_ADV_QUEUE', () => {
      that.element_.dispatchCustomEvent(VideoEvents.AD_END);
    });

    this.addMessageListener_('USER.ACTION', () => {
      if (that.playingState_ === PlayingStates.PLAYING_AUTO) {
        that.playingState_ = PlayingStates.PLAYING_MANUAL;
      }
    });

    this.addMessageListener_('POSITION', data => {
      that.position_ = parseInt(data, 10);
    });

    this.addMessageListener_('PLAYED.RANGES', data => {
      that.playedRanges_ = JSON.parse(data);
    });

    this.addMessageListener_('METADATA', data => {
      that.metadata_ = JSON.parse(data);
    });

    this.iframe_ = this.win.document.createElement('amp-iframe');
    this.iframe_.setAttribute('layout', 'fill');
    this.iframe_.setAttribute(
        'sandbox',
        'allow-scripts allow-same-origin allow-popups',
    );
    this.iframe_.setAttribute('src', this.frameUrl_.toLocaleString());
    this.iframe_.setAttribute('frameborder', 0);
    this.iframe_.setAttribute('allowfullscreen', true);

    const placeholder = this.win.document.createElement('amp-img');
    placeholder.setAttribute('layout', 'fill');
    placeholder.setAttribute('placeholder', 'true');
    if (this.placeholderUrl_) {
      placeholder.setAttribute('src', this.placeholderUrl_);
    }

    this.iframe_.appendChild(placeholder);
    this.container_.appendChild(this.iframe_);

    installVideoManagerForDoc(this.element_);
    Services.videoManagerForDoc(
        this.getAmpDoc(),
    ).register(this);

    this.element_.dispatchCustomEvent(VideoEvents.REGISTERED);
  }

  /** @override */
  supportsPlatform() {
    return true;
  }

  /** @override */
  unlayoutCallback() {
    if (this.iframe_) {
      this.removeElement(this.iframe_);
      this.iframe_ = null;
    }
    return true;
  }

  /** @override */
  preconnectCallback(onLayout) {
    this.preconnect.url(this.frameUrl_.toLocaleString(), onLayout);
  }

  /** @override */
  pauseCallback() {
    this.sendCommand_('pause');
  }

  /** @override */
  viewportCallback(visible) {
    this.element_.dispatchCustomEvent(VideoEvents.VISIBILITY, {visible});
  }

  /** @override */
  play(isAutoplay) {
    this.sendCommand_('play');

    this.playingState_ = isAutoplay
      ? PlayingStates.PLAYING_AUTO
      : PlayingStates.PLAYING_MANUAL;
  }

  /** @override */
  pause() {
    this.sendCommand_('pause');
    this.playingState_ = PlayingStates.PAUSED;
  }

  /** @override */
  mute() {
    this.sendCommand_('mute');
    this.element_.dispatchCustomEvent(VideoEvents.MUTED);
  }

  /** @override */
  unmute() {
    this.sendCommand_('unmute');
    this.element_.dispatchCustomEvent(VideoEvents.UNMUTED);
  }

  /** @override */
  showControls() {
    if (this.playingState_ === PlayingStates.PLAYING_AUTO) {
      this.sendCommand_('popupControls');
    } else {
      this.sendCommand_('showControls');
    }
  }

  /** @override */
  hideControls() {
    this.sendCommand_('hideControls');
  }

  /** @override */
  fullscreenEnter() {
    fullscreenEnter(this.iframe_);
  }

  /** @override */
  fullscreenExit() {
    fullscreenExit(this.iframe_);
  }

  /** @override */
  isFullscreen() {
    return isFullscreenElement(this.iframe_);
  }

  /** @override */
  getMetadata() {
    return this.metadata_;
  }

  /** @override */
  getCurrentTime() {
    return this.position_;
  }

  /** @override */
  getDuration() {
    return this.metadata_ ? this.metadata_.duration : undefined;
  }

  /** @override */
  getPlayedRanges() {
    return this.playedRanges_ || [];
  }

  /** @override */
  preimplementsAutoFullscreen() {
    return false;
  }

  /** @override */
  preimplementsMediaSessionAPI() {
    return false;
  }

  /** @override */
  firstLayoutCompleted() {
    // Do not hide the placeholder.
  }
}

AMP.extension('amp-wpm-player', '0.1', AMP => {
  AMP.registerElement('amp-wpm-player', AmpWpmPlayer);
});
