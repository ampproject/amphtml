import {postMessageWhenAvailable} from '../../iframe-video';
import {addParamsToUrl} from '../../url';
import {VideoEvents_Enum} from '../../video-interface';

/**
 * @fileoverview
 * Definitions of messages and other utilities to talk to Vimeo embed iframes.
 * See https://developer.vimeo.com/player/js-api
 */

// ⚠️ This module should not have side-effects.

export const getVimeoOriginRegExp = () =>
  /^(https?:)?\/\/((player|www)\.)?vimeo.com(?=$|\/)/;

/**
 * Maps events coming from the Vimeo frame to events to be dispatched from the
 * component element.
 *
 * If the item does not have a value, the event will not be forwarded 1:1, but
 * it will be listened to.
 *
 * @const {!{[key: string]: ?string}}
 */
export const VIMEO_EVENTS = {
  'play': VideoEvents_Enum.PLAYING,
  'pause': VideoEvents_Enum.PAUSE,
  'ended': VideoEvents_Enum.ENDED,
  'volumechange': null,
};

/**
 * @param {string} videoid
 * @param {?boolean=} autoplay
 * @param {?boolean=} doNotTrack
 * @return {string}
 */
export function getVimeoIframeSrc(videoid, autoplay, doNotTrack) {
  return addParamsToUrl(
    `https://player.vimeo.com/video/${encodeURIComponent(videoid)}`,
    {
      'dnt': doNotTrack ? '1' : undefined,
      'muted': autoplay ? '1' : undefined,
    }
  );
}

/**
 * @param {string} method
 * @param {?Object|string=} params
 * @return {string}
 */
export function makeVimeoMessage(method, params = '') {
  return JSON.stringify({
    'method': method,
    'value': params,
  });
}

/**
 * Sends a set of messages to the Vimeo iframe to listen to events.
 * We need to explicitly listen to these so that we receive incoming event
 * messages.
 * @param {!HTMLIFrameElement} iframe
 */
export function listenToVimeoEvents(iframe) {
  Object.keys(VIMEO_EVENTS).forEach((event) => {
    postMessageWhenAvailable(
      iframe,
      makeVimeoMessage('addEventListener', event)
    );
  });
}
