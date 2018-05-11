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
  // Triggered when the user mutes the story
  MUTE: 'ampstory:mute',

  // Triggered when the user unmutes the story
  UNMUTE: 'ampstory:unmute',

  // Triggered when the story should switch to a specified page
  SWITCH_PAGE: 'ampstory:switchpage',

  // Triggered when the story should switch to the previous page
  PREVIOUS_PAGE: 'ampstory:previouspage',

  // Triggered when the story should switch to the next page
  NEXT_PAGE: 'ampstory:nextpage',

  // Triggered when the story should navigate after a tap on active page.
  TAP_NAVIGATION: 'ampstory:tapnavigation',

  // Triggered when a page updates its progress
  PAGE_PROGRESS: 'ampstory:pageprogress',

  // Triggered when the story should be replayed
  REPLAY: 'ampstory:replay',

  // DEVELOPMENT MODE ONLY: Triggered when a story page has log entries (e.g.
  // warnings or errors).
  DEV_LOG_ENTRIES_AVAILABLE: 'ampstory:devlogentriesavailable',

  // Triggered when user clicks on left 25% of the first page
  SHOW_NO_PREVIOUS_PAGE_HELP: 'ampstory:shownopreviouspagehelp',

  // Triggered when a story has loaded at least its initial set of pages.
  STORY_LOADED: 'ampstory:load',

  // Triggered when a page has loaded at least one frame of all of its media.
  PAGE_LOADED: 'ampstory:pageload',
};


/**
 * @param {!EventTarget} source
 * @param {string} eventName
 * @param {boolean=} opt_bubbles
 */
export function dispatch(source, eventName, opt_bubbles) {
  const event = new Event(eventName, {bubbles: !!opt_bubbles});
  if (event.initEvent) {
    event.initEvent(eventName, /* bubbles */ !!opt_bubbles,
        /* cancelable */ false);
  }
  source.dispatchEvent(event);
}


/**
 * @param {!Window} win
 * @param {!EventTarget} source
 * @param {string} eventName
 * @param {!Object} payload
 * @param {!CustomEventInit=} opt_eventInit
 */
export function dispatchCustom(win, source, eventName, payload, opt_eventInit) {
  const event = createCustomEvent(win, eventName, payload, opt_eventInit);
  source.dispatchEvent(event);
}
