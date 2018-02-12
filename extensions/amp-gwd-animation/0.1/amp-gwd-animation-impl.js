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
import {hasOwn} from '../../../src/utils/object';
import {user} from '../../../src/log';

/**
 * CSS class used to deactivate animations.
 * @const {string}
 */
export const ANIMATIONS_DISABLED_CLASS = 'i-amphtml-gwd-animation-disabled';

/**
 * CSS class name used to identify GWD page wrapper elements.
 * @const {string}
 */
export const GWD_PAGE_WRAPPER_CLASS = 'gwd-page-wrapper';

/**
 * GWD playback control CSS classes.
 * @enum {string}
 */
export const PlaybackCssClass = {
  PAUSE: 'gwd-pause-animation',
  PLAY: 'gwd-play-animation',
};

/**
 * The attribute used to store the name of an element's currently-active label
 * animation.
 * @const {string}
 */
export const CURRENT_LABEL_ANIMATION_ATTR = 'data-gwd-label-animation';

/**
 * The attribute used to store the event name on a GWD event element.
 * @const {string}
 */
const EVENT_NAME_ATTR = 'data-event-name';

/**
 * Event dispatched when a GWD event `animationend` is captured.
 * @const {string}
 */
export const GWD_TIMELINE_EVENT = 'gwd.timelineEvent';

/**
 * Standard and vendor-prefixed versions of the `animationend` event for which
 * listeners are added.
 * @const {!Array<string>}
 */
const VENDOR_ANIMATIONEND_EVENTS = ['animationend', 'webkitAnimationEnd'];

/**
 * When executing gotoAndPause, the amount of time to wait (in milliseconds)
 * before triggering pause.
 * @const {number}
 */
const GOTO_AND_PAUSE_DELAY = 40;

/**
 * The GWD runtime service ID (arbitrary string).
 * @const {string}
 */
export const GWD_SERVICE_NAME = 'gwd';

/**
 * Uppercase identifier for log statements (arbitrary string).
 * @const {string}
 */
const LOG_ID = 'GWD';

/**
 * @param {!Element} receiver
 * @param {string} counterName
 * @return {number} The current GWD goto counter value for the given receiver
 *     element and goto event counter name.
 * @private
 */
function getCounter(receiver, counterName) {
  if (receiver.gwdGotoCounters &&
      hasOwn(receiver.gwdGotoCounters, counterName)) {
    return receiver.gwdGotoCounters[counterName];
  }
  return 0;
}

/**
 * @param {!Element} receiver
 * @param {string} counterName
 * @param {number} counterValue
 * @private
 */
function setCounter(receiver, counterName, counterValue) {
  // Ensure a goto counters map with an empty counter is initialized for the
  // given element and goto event name.
  if (!receiver.gwdGotoCounters) {
    receiver.gwdGotoCounters = {};
  }
  if (!hasOwn(receiver.gwdGotoCounters, counterName)) {
    receiver.gwdGotoCounters[counterName] = 0;
  }
  receiver.gwdGotoCounters[counterName] = counterValue;
}

/**
 * AMP GWD animation runtime service.
 * @implements {../../../src/service.Disposable}
 */
export class AmpGwdRuntimeService {
  /**
   * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc An AMP document
   *     with GWD content in which to install the animation runtime controller.
   */
  constructor(ampdoc) {
    /** @private {!../../../src/service/ampdoc-impl.AmpDoc} */
    this.ampdoc_ = ampdoc;

    /** @private {!Function} */
    this.boundOnAnimationEndEvent_ = this.onAnimationEndEvent_.bind(this);

    this.ampdoc_.whenBodyAvailable().then(() => { this.initialize_(); });
  }

  /**
   * Performs setup tasks on body ready.
   * @private
   */
  initialize_() {
    // TODO(#7846): The GWD animation runtime should start out disabled, but
    // leaving it enabled for now as the main runtime is not yet integrated to
    // enable it. When it does so, uncomment the below code (also see
    // associated test).
    /*
    // Initially disable all animations (AMP runtime will enable when ready).
    this.setEnabled(false);
    */

    // Begin listening for timeline events (GWD event element `animationend`).
    this.listenForAnimationEnd_();

    // Permit animations to play on the first GWD page.
    this.setCurrentPage(0);
  }

  /**
   * Enables or disables all animations in this document. When disabled, all
   * animations are turned off with a CSS `animation: none` override. Actions
   * like play or gotoAndPlay may be invoked while in the disabled state, though
   * they will have no immediate effect; playback changes will be reflected when
   * animations are re-enabled.
   * @param {boolean} enable True to enable, false to disable.
   */
  setEnabled(enable) {
    this.ampdoc_.getBody().classList.toggle(ANIMATIONS_DISABLED_CLASS, !enable);
  }

  /**
   * Stops animations on the previously-active page and starts them on the
   * newly-active page.
   * @param {number} index The index of the newly-active slide.
   */
  setCurrentPage(index) {
    // Turn off animations on the previously-active page, if there was one.
    // TODO(sklobovskaya): Decide if it's worth just storing the index.
    const currentPageEl = this.ampdoc_.getRootNode().querySelector(
        `.${GWD_PAGE_WRAPPER_CLASS}.${PlaybackCssClass.PLAY}`);

    if (currentPageEl) {
      currentPageEl.classList.remove(PlaybackCssClass.PLAY);
    }

    // Activate animations on the new current page.
    const gwdPages = this.ampdoc_.getRootNode().querySelectorAll(
        `.${GWD_PAGE_WRAPPER_CLASS}`);
    const newPageEl = gwdPages[index];

    if (newPageEl) {
      newPageEl.classList.add(PlaybackCssClass.PLAY);
    }
  }

  /**
   * The play action.
   * @param {string} id Receiver id.
   */
  play(id) {
    const receiver = this.getReceiver(id);

    if (!receiver) {
      return;
    }

    receiver.classList.remove(PlaybackCssClass.PAUSE);
  }

  /**
   * The pause action.
   * @param {string} id Receiver id.
   */
  pause(id) {
    const receiver = this.getReceiver(id);

    if (!receiver) {
      return;
    }

    receiver.classList.add(PlaybackCssClass.PAUSE);
  }

  /**
   * The togglePlay action.
   * @param {string} id Receiver id.
   */
  togglePlay(id) {
    const receiver = this.getReceiver(id);

    if (!receiver) {
      return;
    }

    receiver.classList.toggle(PlaybackCssClass.PAUSE);
  }

  /**
   * The gotoAndPlay action.
   * @param {string} id Receiver id.
   * @param {string} label The name of the label animation to go to.
   */
  gotoAndPlay(id, label) {
    const receiver = this.getReceiver(id);

    if (!receiver) {
      return;
    }

    this.playLabelAnimation_(receiver, label);
  }

  /**
   * The gotoAndPause action. A gotoAndPause is a gotoAndPlay followed by an
   * (almost) immediate pause.
   * @param {string} id Receiver id.
   * @param {string} label The name of the label animation to go to.
   */
  gotoAndPause(id, label) {
    const receiver = this.getReceiver(id);

    if (!receiver) {
      return;
    }

    // Switch to the label animation.
    this.playLabelAnimation_(receiver, label);

    // Pause playback. The pause must be triggered after a delay as a workaround
    // for a Safari bug that prevents pausing animations from working.
    this.ampdoc_.win.setTimeout(() => {
      this.pause(id);
    }, GOTO_AND_PAUSE_DELAY);
  }

  /**
   * The gotoAndPlayNTimes action.
   * @param {string} id Receiver id.
   * @param {string} label The name of the label animation to go to.
   * @param {number} maxCount The number of times this timeline event should
   *     trigger gotoAndPlay.
   * @param {string} eventName The source timeline event name, used to enforce
   *     that gotoAndPlay is triggered a maximum of N times for this event.
   */
  gotoAndPlayNTimes(id, label, maxCount, eventName) {
    if (maxCount <= 0) {
      user().error(LOG_ID, `Invalid maxCount parameter: ${maxCount}`);
      return;
    }

    if (!eventName) {
      user().error(LOG_ID, 'Event name required but not specified.');
      return;
    }

    const receiver = this.getReceiver(id);

    if (!receiver) {
      return;
    }

    // Invoke gotoAndPlay up to the requested number of times.
    const counterName = `${eventName}_${label}`;
    const currentCount = getCounter(receiver, counterName);

    if (currentCount < maxCount) {
      this.playLabelAnimation_(receiver, label);
      setCounter(receiver, counterName, currentCount + 1);
    }
  }

  /**
   * Returns the element identified by a receiver id if it exists in the
   * invocation origin document and has a classList. If not found, returns null.
   * @param {string} id The receiver id.
   * @return {?Element}
   */
  getReceiver(id) {
    if (id == 'document.body') {
      return this.ampdoc_.getBody();
    }

    // Try to locate the receiver by id in the DOM.
    // TODO(sklobovskaya): When support for groups is added, this lookup will
    // need to use GwdIds.
    const receiver = this.ampdoc_.getRootNode().getElementById(id);

    // Check that a valid element was found.
    if (receiver && receiver.classList) {
      return receiver;
    } else {
      user().error(LOG_ID, `Could not get receiver with id ${id}.`);
      return null;
    }
  }

  /**
   * Switches an element's current animation to a label animation.
   * This is a core gotoAndPlay routine used in all goto* actions.
   * @param {!Element} receiver
   * @param {string} label
   * @private
   */
  playLabelAnimation_(receiver, label) {
    // Unpause playback.
    receiver.classList.remove(PlaybackCssClass.PAUSE);

    // If another goto animation is currently active on this element, stop it.
    const currentLabel =
        receiver.getAttribute(CURRENT_LABEL_ANIMATION_ATTR);

    if (currentLabel) {
      receiver.classList.remove(currentLabel);
      receiver.removeAttribute(CURRENT_LABEL_ANIMATION_ATTR);
    }

    // A forced reflow is needed if removing and readding the same class so
    // the animation is restarted.
    if (currentLabel == label) {
      reflow(receiver);
    }

    // Add the label animation class and record this label as this element's
    // current animation.
    receiver.classList.add(label);
    receiver.setAttribute(CURRENT_LABEL_ANIMATION_ATTR, label);
  }

  /**
   * Handles GWD event `animationend` events, which signal that a timeline event
   * marker has been reached. If the event originated from a GWD event element,
   * extracts its event name and dispatches a custom event.
   * @param {!Event} event An `animationend` event.
   * @private
   */
  onAnimationEndEvent_(event) {
    const userEventName = event.target.getAttribute(EVENT_NAME_ATTR);

    if (!userEventName) {
      // No GWD event name could be extracted, usually just because the event is
      // from some other animation. Just ignore it.
      return;
    }

    const timelineEvent = createCustomEvent(
        this.ampdoc_.win,
        GWD_TIMELINE_EVENT,
        {eventName: userEventName, sourceEvent: event});

    this.ampdoc_.getRootNode().dispatchEvent(timelineEvent);
  }

  /**
   * @private
   */
  listenForAnimationEnd_() {
    for (let i = 0; i < VENDOR_ANIMATIONEND_EVENTS.length; i++) {
      this.ampdoc_.getBody().addEventListener(
          VENDOR_ANIMATIONEND_EVENTS[i], this.boundOnAnimationEndEvent_, true);
    }
  }

  /**
   * @private
   */
  unlistenForAnimationEnd_() {
    for (let i = 0; i < VENDOR_ANIMATIONEND_EVENTS.length; i++) {
      this.ampdoc_.getBody().removeEventListener(
          VENDOR_ANIMATIONEND_EVENTS[i], this.boundOnAnimationEndEvent_, true);
    }
  }

  /** @override */
  dispose() {
    this.unlistenForAnimationEnd_();
  }
}

/**
 * Utility function which triggers layout on the element. This is necessary
 * to invoke when reapplying the same label animation class so the animation
 * restarts.
 * @param {!Element} element
 */
function reflow(element) {
  element./*OK*/offsetWidth = element./*OK*/offsetWidth;
}
