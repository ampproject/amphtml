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

import {dict} from '../src/utils/object';
import {getData, listen} from '../src/event-helper';
import {getMode} from '../src/mode';
import {isFiniteNumber} from '../src/types';
import {once} from '../src/utils/function';
import {tryParseJson} from '../src/json';
import {tryResolve} from '../src/utils/promise';

/** @fileoverview Entry point for documents inside an <amp-video-iframe>. */

/**
 * @typedef {{
 *   sourceUrl: string,
 *   canonicalUrl: string,
 * }}
 */
let DocMetadataDef;

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

/**
 * @param {T} shouldBeTrueish
 * @param {...*} args
 * @return {T}
 * @template T
 */
function userAssert(shouldBeTrueish, ...args) {
  if (!shouldBeTrueish) {
    throw new Error(args.join(' '));
  }
  return shouldBeTrueish;
}

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

/** @visibleForTesting */
export class AmpVideoIntegration {

  /** @param {!Window} win */
  constructor(win) {

    /**
     * Used for checking callback return type.
     * @visibleForTesting
     */
    this.isAmpVideoIntegration_ = true;

    /** @private @const */
    this.callCounter_ = 0;

    /** @private @const {!Object<number, function()>} */
    this.callbacks_ = {};

    /** @private @const {!Window} */
    this.win_ = win;

    /** @private @const {!Object<string, function()>} */
    this.methods_ = {};

    /** @private @const {function()} */
    this.listenToOnce_ = once(() => {
      listenTo(this.win_, e => this.onMessage_(e));
    });

    /** @private {boolean} */
    this.muted_ = false;

    /**
     * @return {!DocMetadataDef}
     * @private
     */
    this.getMetadataOnce_ = once(() => {
      const {canonicalUrl, sourceUrl} = tryParseJson(this.win_.name);
      return {canonicalUrl, sourceUrl};
    });
  }

  /** @return {!DocMetadataDef} */
  getMetadata() {
    return this.getMetadataOnce_();
  }

  /**
   * @param {string} name
   * @param {function()} callback
   */
  method(name, callback) {
    userAssert(validMethods.indexOf(name) > -1, `Invalid method ${name}.`);

    const wrappedCallback =
        (name == 'play' || name == 'pause') ?
          this.safePlayOrPause_(callback) :
          callback;

    this.methods_[name] = wrappedCallback;
    this.listenToOnce_();
  }

  /**
   * @param {!JsonObject} data
   * @private
   */
  onMessage_(data) {
    const id = data['id'];
    if (isFiniteNumber(id) && this.callbacks_[id]) {
      this.handleResponse_(id, data['args']);
      return;
    }

    if (data['event'] == 'method') {
      this.maybeExecute_(data['method']);
    }
  }

  /**
   * @param {number} id
   * @param {!JsonObject} args
   * @private
   */
  handleResponse_(id, args) {
    const callback = this.callbacks_[id];
    callback(args);
    delete this.callbacks_[id];
  }

  /**
   * @param {string} method
   * @private
   */
  maybeExecute_(method) {
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
      case 'videojs':
        this.listenToVideoJs_(obj);
        break;
      default:
        userAssert(false, `Invalid listener type ${type}.`);
    }
  }

  /**
   * @param {!JwplayerPartialInterfaceDef} player
   * @private
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

    player.on('volume', e => this.onVolumeChange_(e.volume));

    this.method('play', () => player.play());
    this.method('pause', () => player.pause());
    this.method('mute', () => player.setMute(true));
    this.method('unmute', () => player.setMute(false));
    this.method('showcontrols', () => player.setControls(true));
    this.method('hidecontrols', () => player.setControls(false));
    this.method('fullscreenenter', () => player.setFullscreen(true));
    this.method('fullscreenexit', () => player.setFullscreen(false));
  }

  /**
   * @param {!Element} element
   * @private
   */
  listenToVideoJs_(element) {
    userAssert(this.win_.videojs, 'Video.JS not imported.');

    // Retrieve lazily.
    const player = once(() =>
      this.win_.videojs.getPlayer(element));

    ['canplay', 'playing', 'pause', 'ended'].forEach(e => {
      listen(element, e, () => this.postEvent(e));
    });

    listen(element, 'volumechange', () =>
      this.onVolumeChange_(player().volume()));

    this.method('play', () => player().play());
    this.method('pause', () => player().pause());
    this.method('mute', () => player().muted(true));
    this.method('unmute', () => player().muted(false));
    this.method('showcontrols', () => player().controls(true));
    this.method('hidecontrols', () => player().controls(false));
    this.method('fullscreenenter', () => player().requestFullscreen());
    this.method('fullscreenexit', () => player().exitFullscreen());
  }

  /**
   * @param {number} newVolume
   * @private
   */
  onVolumeChange_(newVolume) {
    if (newVolume < 0.01) {
      this.muted_ = true;
      this.postEvent('muted');
      return;
    }
    if (this.muted_) {
      this.muted_ = false;
      this.postEvent('unmuted');
    }
  }

  /**
   * @param {function()} callback
   * @private
   */
  safePlayOrPause_(callback) {
    return () => {
      try {
        tryResolve(() => callback());
      } catch (e) {
        // OK to dismiss errors as they are expected.
      }
    };
  }

  /**
   * Posts a playback event.
   * @param {string} event
   */
  postEvent(event) {
    userAssert(validEvents.indexOf(event) > -1, `Invalid event ${event}`);
    this.postToParent_(dict({'event': event}));
  }

  /**
   * Posts a custom analytics event.
   * @param {string} eventType
   * @param {!Object<string, string>=} opt_vars
   */
  postAnalyticsEvent(eventType, opt_vars) {
    this.postToParent_(dict({
      'event': 'analytics',
      'analytics': {
        'eventType': eventType,
        'vars': opt_vars,
      },
    }));
  }

  /**
   * @param {!JsonObject} data
   * @param {function()=} opt_callback
   * @private
   */
  postToParent_(data, opt_callback) {
    const id = this.callCounter_++;
    const completeData = Object.assign({id}, data);

    if (!getMode(this.win_).test && this.win_.parent) {
      this.win_.parent./*OK*/postMessage(completeData, '*');
    }

    if (opt_callback) {
      this.callbacks_[id] = opt_callback;
    }
    return id;
  }

  /**
   * Gets the video's intersection with the document's viewport.
   * @param {function(!JsonObject)} callback
   */
  getIntersection(callback) {
    this.listenToOnce_();
    this.getIntersectionForTesting_(callback);
  }

  /**
   * Returns message id for testing. Private as message id is an implementation
   * detail that others should not rely on.
   * @param {function(!JsonObject)} callback
   * @private
   */
  getIntersectionForTesting_(callback) {
    return this.postToParent_(dict({'method': 'getIntersection'}), callback);
  }
}

/**
 * @param {!Window} win
 * @param {function(!JsonObject)} onMessage
 */
function listenTo(win, onMessage) {
  listen(win, 'message', e => {
    const message = tryParseJson(getData(e));
    if (!message) {
      // only process valid JSON.
      return;
    }
    onMessage(message);
  });
}

/**
 * Adopt window asynchronously.
 * This follows the same method as AMP.push (see runtime).
 * @param {!Window} global
 * @visibleForTesting
 */
export function adopt(global) {
  // Hacky way to make AMP errors (e.g. from listenFor) do *something*.
  global.reportError = console.error.bind(console);

  // Initialize one object per frame.
  const integration = new AmpVideoIntegration(global);

  // Create array if the script loaded before callback push
  // (otherwise already created).
  const callbacks = (global.AmpVideoIframe = global.AmpVideoIframe || []);

  // Rewrite push to execute callbacks are added after adoption.
  callbacks.push = callback => callback(integration);

  // Execute callbacks created before adoption.
  callbacks.forEach(callbacks.push);
}

if (!getMode(self).test) {
  adopt(self);
}
