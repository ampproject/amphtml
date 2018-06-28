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

    /** @private @const */
    this.callCounter_ = 0;

    /** @private @const {!Object<number, function()} */
    this.callbacks_ = {};

    /** @private @const {!Window} */
    this.win_ = win;

    /** @private @const {!Object<string, function()>} */
    this.methods_ = {};

    /** @private @const {function()} */
    this.listenToOnce_ = once(() => {
      listenTo(this.win_, e => this.onMessage_(e));
    });

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
    this.methods_[name] = callback;
    this.listenToOnce_();
  }

  /**
   * @param {!JsonObject} data
   * @private
   */
  onMessage_(data) {
    const id = data['id'];
    if (id && this.callbacks_[id]) {
      const callback = this.callbacks_[id];
      const args = data['args'];
      callback(args);
      delete this.callbacks_[id];
      return;
    }
    if (data['event'] != 'method') {
      return;
    }
    const method = data['method'];
    if (!(method in this.methods_)) {
      return;
    }
    this.methods_[method].call();
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
   * @param {function()|undefined|null} optCallback
   * @private
   */
  postToParent_(data, optCallback = null) {
    const id = this.callCounter_++;
    const completeData = Object.assign({id}, data);
    this.win_.parent./*OK*/postMessage(completeData, '*');
    if (optCallback) {
      this.callbacks_[id] = optCallback;
    }
    return id;
  }

  /**
   * Gets the video's intersection with the document's viewport.
   * @param {function(!JsonObject)} callback
   */
  getIntersection(callback) {
    this.getIntersectionForTesting_(callback);
  }

  /**
   * Returns message id for testing. Private as message id is an implementation
   * detail that others should not rely on.
   * @param {function(!JsonObject)} callback
   * @private
   */
  getIntersectionForTesting_(callback) {
    return this.postToParent_({method: 'getIntersection'}, callback);
  }
}

/**
 * @param {!Window} win
 * @param {function(!JsonObject)} onMessage
 */
function listenTo(win, onMessage) {
  listen(win, 'message', e => {
    onMessage(tryParseJson(e.data));
  });
}

/**
 * @param {!Window} global
 * @visibleForTesting
 */
export function adopt(global) {
  const exposed = (global.AmpVideoIframe = global.AmpVideoIframe || []);
  const integration = new AmpVideoIntegration(global);
  exposed.push = callback => callback(integration);
  exposed.forEach(exposed.push);
}

adopt(self);
