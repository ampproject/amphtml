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

import {listen} from '../src/event-helper';
import {once} from '../src/utils/function';
import {tryParseJson} from '../src/json';


/**
 * @typedef {{
 *   on: function(string, function()),
 *   play: function(),
 *   pause: function(),
 *   setMuted: function(boolean),
 *   setControls: function(boolean),
 *   setFullscreen: function(boolean),
 * }}
 */
let JwplayerPartialInterfaceDef;


const validMethods = [
  'pause',
  'play',
  'mute',
  'unmute',
  'fullscreenenter',
  'fullscreenexit',
  'showcontrols',
  'hidecontrols',
];


const validEvents = [
  'canplay',
  'load',
  'playing',
  'pause',
  'ended',
  'muted',
  'unmuted',
];


/**
 * @param {*} shouldBeTrueish
 * @param {...*} args
 */
function userAssert(shouldBeTrueish, ...args) {
  if (!shouldBeTrueish) {
    throw new Error(args.join(' '));
  }
  return shouldBeTrueish;
}

/** @visibleForTesting */
export class AmpVideoIntegration {

  /** @param {!Window} win */
  constructor(win) {

    /** @private @const {!Window} */
    this.win_ = win;

    /** @private @const {!Object<string, function()>} */
    this.methods_ = {};

    /** @private @const {function()} */
    this.listenToOnce_ = once(listenTo);

    /**
     * Used for checking callback return type.
     * @visibleForTesting
     */
    this.isAmpVideoIntegration_ = true;
  }

  /**
   * @param {string} name
   * @param {function()} callback
   */
  method(name, callback) {
    userAssert(validMethods.indexOf(name) > -1, `Invalid method ${name}.`);

    this.listenToOnce_(this.win_, this.methods_);

    this.methods_[name] = callback;
  }

  /**
   * @param {string} type
   * @param {*} obj
   */
  listenTo(type, obj) {
    switch (type.toLowerCase()) {
      case 'jwplayer':
        this.listenToJwPlayer_(obj);
        break;
      default:
        userAssert(false, `Invalid listener type ${type}.`);
    }
  }

  /**
   * @param {!JwplayerPartialInterfaceDef} player
   */
  listenToJwPlayer_(player) {
    ['error', 'setupError'].forEach(e => {
      player.on(e, () => {
        userAssert.apply(null, [false].concat(arguments));
        this.postEvent('error');
      });
    });

    ['adSkipped', 'adComplete', 'adError'].forEach(e => {
      player.on(e, () => this.postEvent('ad_end'));
    });

    player.on('adStarted', () => this.postEvent('ad_start'));

    const redispatchAs = {
      'play': 'playing',
      'ready': 'canplay',
      'pause': 'pause',
    };

    Object.keys(redispatchAs).forEach(e => {
      player.on(e, () => this.postEvent(redispatchAs[e]));
    });

    this.method('play', () => player.play());
    this.method('pause', () => player.pause());
    this.method('mute', () => player.setMute(true));
    this.method('unmute', () => player.setMute(false));
    this.method('showcontrols', () => player.setControls(true));
    this.method('hidecontrols', () => player.setControls(false));
    this.method('fullscreenenter', () => player.setFullscreen(true));
    this.method('fullscreenexit', () => player.setFullscreen(false));
  }

  // TODO(alanorozco): Video.js integration.

  /**
   * Posts a playback event.
   * @param {string} event
   */
  postEvent(event) {
    userAssert(validEvents.indexOf(event) > -1, `Invalid event ${event}`);
    this.postToParent_({event});
  }

  /**
   * @param {!JsonObject} data
   * @private
   */
  postToParent_(data) {
    this.win_.parent./*OK*/postMessage(data, '*');
  }
}

/**
 * @param {!Window} win
 * @param {!Object<string, function()>} methods
 */
function listenTo(win, methods) {
  listen(win, 'message', e => {
    const data = tryParseJson(e.data);
    if (data['event'] != 'method') {
      return;
    }
    const method = data['method'];
    if (!(method in methods)) {
      return;
    }
    methods[method].call();
  });
}

/**
 * @param {!Window} global
 * @visibleForTesting
 */
export function adopt(global) {
  global.AmpVideoIframe = global.AmpVideoIframe || [];

  const exposed = global.AmpVideoIframe;
  const integration = new AmpVideoIntegration(global);

  exposed.push = callback => callback(integration);

  exposed.forEach(exposed.push);
}

adopt(self);
