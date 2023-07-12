import {createCustomEvent} from '#utils/event-helper';

/** @const {!{[key: string]: string}} */
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

  // Triggered when a page updates its progress
  PAGE_PROGRESS: 'ampstory:pageprogress',

  // Triggered when the story should be replayed
  REPLAY: 'ampstory:replay',

  // Triggered when user clicks on end 75% of the last page
  NO_NEXT_PAGE: 'ampstory:nonextpage',

  // Triggered when user clicks on start 25% of the first page
  NO_PREVIOUS_PAGE: 'ampstory:nopreviouspage',

  // Triggered when a story has loaded at least its initial set of pages.
  STORY_LOADED: 'ampstory:load',

  // Triggered when a page has loaded at least one frame of all of its media.
  PAGE_LOADED: 'ampstory:pageload',

  // Dispatches an action to the amp-story store service. Only works under test.
  DISPATCH_ACTION: 'ampstory:dispatchaction',
};

/**
 * @param {!Window} win
 * @param {!EventTarget} source
 * @param {string} eventName
 * @param {!JsonObject=} payload
 * @param {!CustomEventInit=} eventInit
 */
export function dispatch(
  win,
  source,
  eventName,
  payload = undefined,
  eventInit = undefined
) {
  const event = createCustomEvent(win, eventName, payload, eventInit);
  source.dispatchEvent(event);
}
