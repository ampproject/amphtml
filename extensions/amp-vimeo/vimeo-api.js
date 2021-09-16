/**
 * Copyright 2021 The AMP HTML Authors. All Rights Reserved.
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
import {VideoEvents} from '../../src/video-interface';
import {addParamsToUrl} from '../../src/url';
import {dict} from '../../src/core/types/object';
import {postMessageWhenAvailable} from '../../src/iframe-video';

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
 * @const {!Object<string, ?string>}
 */
export const VIMEO_EVENTS = {
  'play': VideoEvents.PLAYING,
  'pause': VideoEvents.PAUSE,
  'ended': VideoEvents.ENDED,
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
    dict({
      'dnt': doNotTrack ? '1' : undefined,
      'muted': autoplay ? '1' : undefined,
    })
  );
}

/**
 * @param {string} method
 * @param {?Object|string=} params
 * @return {string}
 */
export function makeVimeoMessage(method, params = '') {
  return JSON.stringify(
    dict({
      'method': method,
      'value': params,
    })
  );
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
