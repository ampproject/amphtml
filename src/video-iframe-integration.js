/* eslint-disable local/window-property-name */

import {tryResolve} from '#core/data-structures/promise';
import {isFiniteNumber} from '#core/types';
import {once} from '#core/types/function';
import {tryParseJson} from '#core/types/object/json';

import {getData, listen} from '#utils/event-helper';

import {getMode} from './mode';

/** @fileoverview Entry point for documents inside an <amp-video-iframe>. */

const TAG = '<amp-video-iframe>';
const DOCS_URL = 'https://go.amp.dev/c/amp-video-iframe';
const __AMP__ = '__AMP__VIDEO_IFRAME__';

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
    throw new Error(`[${TAG}] ${args.join(' ')} ${DOCS_URL}`);
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

/**
 * @param {function()} win
 * @param {*} opt_initializer
 * @return {function()}
 * @visibleForTesting
 */
export function getVideoJs(win, opt_initializer) {
  return userAssert(
    opt_initializer || /** @type {function()} */ (win.videojs),
    'Video.JS not imported or initializer undefined.'
  );
}

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

    /** @private @const {!{[key: number]: function()}} */
    this.callbacks_ = {};

    /** @private @const {!Window} */
    this.win_ = win;

    /** @private @const {!{[key: string]: function()}} */
    this.methods_ = {};

    /** @private @const {function()} */
    this.listenToOnce_ = once(() => {
      listenTo(this.win_, (e) => this.onMessage_(e));
    });

    /** @private {boolean} */
    this.muted_ = false;

    /** @private {boolean} */
    this.usedListenToHelper_ = false;

    /**
     * @return {!JsonObject}
     * @private
     */
    this.getMetadataOnce_ = once(() => tryParseJson(this.win_.name));
  }

  /** @return {!JsonObject} */
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
      name == 'play' || name == 'pause'
        ? this.safePlayOrPause_(callback)
        : callback;

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
    this.methods_[method]();
  }

  /**
   * @param {string} type
   * @param {*=} opt_obj
   * @param {function()=} opt_initializer For VideoJS, this optionally takes a
   * reference to the `videojs` function. If not provided, this reference
   * will be taken from the `window` object.
   */
  listenTo(type, opt_obj, opt_initializer) {
    userAssert(
      !this.usedListenToHelper_,
      '`listenTo` is meant to be used once per page.'
    );
    const types = {
      'jwplayer': () => {
        userAssert(
          !opt_initializer,
          "listenTo('jwplayer', opt_instance) does not take an initializer."
        );
        this.listenToJwPlayer_(this.getJwplayer_(opt_obj));
      },
      'videojs': () => {
        this.listenToVideoJs_(
          userAssert(
            opt_obj,
            "listenTo('videojs', element) expects a second argument"
          ),
          opt_initializer
        );
      },
    };
    userAssert(
      types[type.toLowerCase()],
      `Invalid listener type [${type}].`,
      `Valid types are [${Object.keys(types).join(', ')}]`
    )(); // notice the call here ;)
    this.usedListenToHelper_ = true;
  }

  /**
   * Checks comformity for opt_player, or obtains global singleton instance.
   * @param {?JwplayerPartialInterfaceDef=} opt_player
   * @return {!JwplayerPartialInterfaceDef}
   */
  getJwplayer_(opt_player) {
    if (opt_player) {
      userAssert(
        opt_player.on,
        "listenTo('jwplayer', myjwplayer) takes a jwplayer instance as ",
        'second argument'
      );
      return opt_player;
    }
    return userAssert(
      this.win_.jwplayer,
      "listenTo('jwplayer') expects a global jwplayer() in window."
    )(); // notice the call here ;)
  }

  /**
   * @param {!JwplayerPartialInterfaceDef} player
   * @private
   */
  listenToJwPlayer_(player) {
    ['error', 'setupError'].forEach((e) => {
      player.on(e, () => {
        userAssert.apply(null, [false].concat(arguments));
        this.postEvent('error');
      });
    });

    ['adSkipped', 'adComplete', 'adError'].forEach((e) => {
      player.on(e, () => this.postEvent('ad_end'));
    });

    player.on('adStarted', () => this.postEvent('ad_start'));

    const redispatchAs = {
      'play': 'playing',
      'ready': 'canplay',
      'pause': 'pause',
    };

    Object.keys(redispatchAs).forEach((e) => {
      player.on(e, () => this.postEvent(redispatchAs[e]));
    });

    player.on('volume', (e) => this.onVolumeChange_(e.volume));

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
   * @param {function()=} opt_initializer
   * @private
   */
  listenToVideoJs_(element, opt_initializer) {
    const initializer = getVideoJs(this.win_, opt_initializer);
    const player = initializer(element);

    player.ready(() => {
      const canplay = 'canplay';

      ['playing', 'pause', 'ended'].forEach((e) => {
        player.on(e, () => this.postEvent(e));
      });

      // in case `canplay` fires before this script loads
      if (player.readyState() >= /* HAVE_FUTURE_DATA */ 3) {
        this.postEvent(canplay);
      } else {
        player.on(canplay, () => this.postEvent(canplay));
      }

      listen(element, 'volumechange', () =>
        this.onVolumeChange_(player.volume())
      );

      this.method('play', () => player.play());
      this.method('pause', () => player.pause());
      this.method('mute', () => player.muted(true));
      this.method('unmute', () => player.muted(false));
      this.method('showcontrols', () => player.controls(true));
      this.method('hidecontrols', () => player.controls(false));
      this.method('fullscreenenter', () => player.requestFullscreen());
      this.method('fullscreenexit', () => player.exitFullscreen());
    });
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
   * @return {!Promise}
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
    this.postToParent_({'event': event});
  }

  /**
   * Posts a custom analytics event.
   * @param {string} eventType
   * @param {!{[key: string]: string}=} opt_vars
   */
  postAnalyticsEvent(eventType, opt_vars) {
    this.postToParent_({
      'event': 'analytics',
      'analytics': {
        'eventType': eventType,
        'vars': opt_vars,
      },
    });
  }

  /**
   * @param {!JsonObject} data
   * @param {function()=} opt_callback
   * @return {number}
   * @private
   */
  postToParent_(data, opt_callback) {
    const id = this.callCounter_++;
    const completeData = {id, ...data};

    if (!getMode(this.win_).test && this.win_.parent) {
      this.win_.parent./*OK*/ postMessage(completeData, '*');
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
    this.getFromHostForTesting_('getIntersection', callback);
  }

  /**
   * Gets the host document's user consent data.
   * @param {function(!JsonObject)} callback
   */
  getConsentData(callback) {
    this.getFromHostForTesting_('getConsentData', callback);
  }

  /**
   * Returns message id for testing. Private as message id is an implementation
   * detail that others should not rely on.
   * @param {string} method
   * @param {function(!JsonObject)} callback
   * @return {number}
   * @private
   */
  getFromHostForTesting_(method, callback) {
    this.listenToOnce_();
    return this.postToParent_({'method': method}, callback);
  }
}

/**
 * @param {!Window} win
 * @param {function(!JsonObject)} onMessage
 */
function listenTo(win, onMessage) {
  listen(win, 'message', (e) => {
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
  userAssert(
    !global[__AMP__],
    'video-iframe-integration-v0.js should only be included once.'
  );

  global[__AMP__] = true;

  // Hacky way to make AMP errors (e.g. from listenFor) do *something*.
  global.__AMP_REPORT_ERROR = console.error.bind(console);

  // Initialize one object per frame.
  const integration = new AmpVideoIntegration(global);

  // Create array if the script loaded before callback push
  // (otherwise already created).
  const callbacks = (global.AmpVideoIframe = global.AmpVideoIframe || []);

  // Rewrite push to execute callbacks are added after adoption.
  callbacks.push = (callback) => callback(integration);

  // Execute callbacks created before adoption.
  callbacks.forEach(callbacks.push);
}

if (!getMode(self).test) {
  adopt(self);
}
