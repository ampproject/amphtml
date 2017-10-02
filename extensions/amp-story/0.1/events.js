/**
 * Copyright 2017 The AMP HTML Authors. All Rights Reserved.
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

import {createCustomEvent} from '../../../src/event-helper';


/** @const {!Object<string, string>} */
export const EventType = {
  // Triggered when the user clicks the exit full screen button
  EXIT_FULLSCREEN: 'ampstory:exitfullscreen',

  // Triggered when the user clicks the close bookend button
  CLOSE_BOOKEND: 'ampstory:closebookend',

  // Triggered when the user mutes the story
  MUTE: 'ampstory:mute',

  // Triggered when the user unmutes the story
  UNMUTE: 'ampstory:unmute',

  // Triggered when there are audio sources playing on the active page
  AUDIO_PLAYING: 'ampstory:audioplaying',

  // Triggered when there are no audio sources playing on the active page
  AUDIO_STOPPED: 'ampstory:audiostopped',

  // Triggered when the story should switch to a specified page
  SWITCH_PAGE: 'ampstory:switchpage',
};


/**
 * @param {!Element} source
 * @param {string} eventName
 * @param {boolean=} opt_bubbles
 */
export function dispatch(source, eventName, opt_bubbles) {
  const event = new Event(eventName, {bubbles: !!opt_bubbles});
  if (event.initEvent) {
    event.initEvent(eventName, /* bubbles */ !!opt_bubbles);
  }
  source.dispatchEvent(event);
}


/**
 * @param {!Window} win
 * @param {!Element} source
 * @param {string} eventName
 * @param {!CustomEventInit} eventInit
 */
export function dispatchCustom(win, source, eventName, payload, opt_eventInit) {
  const event = createCustomEvent(win, eventName, payload, opt_eventInit);
  source.dispatchEvent(event);
}
