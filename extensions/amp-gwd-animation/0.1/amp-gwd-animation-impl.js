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
import {registerServiceBuilderForDoc} from '../../../src/service';
import {user} from '../../../src/log';

/**
 * CSS class used to deactivate animations.
 * @const {string}
 */
export const ANIMATIONS_DISABLED_CLASS = 'i-amphtml-gwd-animation-disabled';

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
 * CSS class name used to identify GWD page wrapper elements.
 * @const {string}
 */
export const GWD_PAGE_WRAPPER_CLASS = 'gwd-page-wrapper';

/**
 * Standard and vendor-prefixed versions of the `animationend` event for which
 * listeners are added.
 * @const {!Array<string>}
 */
const ANIMATIONEND_EVENTS = ['animationend', 'webkitAnimationEnd'];

/**
 * GWD playback control CSS classes.
 * @enum {string}
 */
export const PlaybackCssClass = {
  PAUSE: 'gwd-pause-animation',
  PLAY: 'gwd-play-animation',
};

/**
 * The GWD runtime service ID (arbitrary string).
 * @const {string}
 */
export const GWD_SERVICE_NAME = 'gwd';

/**
 * Uppercase identifier for log statements.
 * @const {string}
 */
const LOG_ID = 'GWD';

/**
 * AMP GWD animation runtime service.
 * @implements {../../../src/service.Disposable}
 */
class AmpGwdRuntimeService {
  /**
   * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc An AMP document
   *     with GWD content in which to install the animation runtime controller.
   */
  constructor(ampdoc) {
    /** @private {!../../../src/service/ampdoc-impl.AmpDoc} */
    this.ampdoc_ = ampdoc;

    /** @private {!Function} */
    this.boundOnAnimationEndEvent_ = this.onAnimationEndEvent_.bind(this);

    /**
     * Whether animations may run (@see setEnabled). False initially; animations
     * will be immediately disabled below.
     * @private {boolean}
     */
    this.enabled_ = false;

    this.ampdoc_.whenBodyAvailable().then(() => { this.initialize_(); });
  }

  /**
   * Performs setup tasks on body ready.
   * @private
   */
  initialize_() {
    // Initially disable all animations (AMP runtime will enable when ready).
    this.ampdoc_.getBody().classList.add(ANIMATIONS_DISABLED_CLASS);

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
   * animations are re-enabled and the CSS override is lifted.
   * @param {boolean} enable True to enable, false to disable.
   */
  setEnabled(enable) {
    if (enable == this.enabled_) {
      return;  // No change in enabled status.
    }

    if (enable) {
      // Lift the animation CSS override.
      this.ampdoc_.getBody().classList.remove(ANIMATIONS_DISABLED_CLASS);
    } else {
      // Stop all animations by overriding them with `animation: none`.
      this.ampdoc_.getBody().classList.add(ANIMATIONS_DISABLED_CLASS);
    }

    this.enabled_ = enable;
  }

  /**
   * Stops animations on the previously-active page and enables them on the
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

    // Trigger a pause.
    const timeToWaitBeforePause = 40;
    this.ampdoc_.win.setTimeout(() => {
      this.pause(id);
    }, timeToWaitBeforePause);
  }

  /**
   * The gotoAndPlayNTimes action.
   * @param {string} id Receiver id.
   * @param {string} label The name of the label animation to go to.
   * @param {number} count The number of times to repeat this gotoAndPlay.
   * @param {string} eventName The name of the original event.
   */
  gotoAndPlayNTimes(id, label, count, eventName) {
    if (count <= 0) {
      user().warn(LOG_ID, `Invalid count parameter ${count}.`);
      return;
    }

    const receiver = this.getReceiver(id);
    if (!receiver) {
      return;
    }

    // Invoke gotoAndPlay up to the requested number of times.
    const counterName = `${eventName}_${label}`;
    const currentCount = this.getOrInitCounter_(receiver, counterName);
    if (currentCount < count) {
      this.playLabelAnimation_(receiver, label);
      this.setCounter_(receiver, counterName, currentCount + 1);
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
      user().warn(LOG_ID, `Could not get receiver with id ${id}.`);
      return null;
    }
  }

  /**
   * Switches the given element's animation to the given label animation.
   * This is a core gotoAndPlay routine that is used in all the goto* actions.
   * @param {!Element} receiver
   * @param {string} label
   * @private
   */
  playLabelAnimation_(receiver, label) {
    // Unpause playback.
    receiver.classList.remove(PlaybackCssClass.PAUSE);

    // If another goto animation is currently active on this element, stop it.
    const currentlabel =
        receiver.getAttribute(CURRENT_LABEL_ANIMATION_ATTR);
    if (currentlabel) {
      receiver.classList.remove(currentlabel);
      receiver.removeAttribute(CURRENT_LABEL_ANIMATION_ATTR);
    }

    // A forced reflow is needed if removing and readding the same class so
    // the animation is restarted.
    if (currentlabel == label) {
      reflow(receiver);
    }

    // Add the label animation class and record this label as this element's
    // current animation.
    receiver.classList.add(label);
    receiver.setAttribute(CURRENT_LABEL_ANIMATION_ATTR, label);
  }

  /**
   * Handles GWD event `animationend` events, which signal that a timeline event
   * marker has been reached.
   * If the event originated from a GWD event element, extracts its event name
   * and dispatches a custom event.
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
        `${GWD_TIMELINE_EVENT}`,
        {eventName: userEventName, sourceEvent: event});
    this.ampdoc_.win.dispatchEvent(timelineEvent);
  }

  /**
   * @param {!Element} receiver
   * @param {string} counterName
   * @private
   */
  getOrInitCounter_(receiver, counterName) {
    this.initCounterIfNotExists_(receiver, counterName);
    return receiver.gwdGotoCounters[counterName];
  }

  /**
   * @param {!Element} receiver
   * @param {string} counterName
   * @param {number} val Counter value to set.
   * @private
   */
  setCounter_(receiver, counterName, val) {
    this.initCounterIfNotExists_(receiver, counterName);
    receiver.gwdGotoCounters[counterName] = val;
  }

  /**
   * Initializes the counters map if it is not yet initialized, and initializes
   * an entry for the given counter with an initial value of 0 if there is no
   * entry yet.
   * @param {!Element} receiver
   * @param {string} counterName
   * @private
   */
  initCounterIfNotExists_(receiver, counterName) {
    if (!receiver.gwdGotoCounters) {
      receiver.gwdGotoCounters = {};
    }
    if (!receiver.gwdGotoCounters.hasOwnProperty(counterName)) {
      receiver.gwdGotoCounters[counterName] = 0;
    }
  }

  /**
   * @private
   */
  listenForAnimationEnd_() {
    for (const animationendEvent of ANIMATIONEND_EVENTS) {
      this.ampdoc_.getBody().addEventListener(
          animationendEvent, this.boundOnAnimationEndEvent_, true);
    }
  }

  /**
   * @private
   */
  unlistenForAnimationEnd_() {
    for (const animationendEvent of ANIMATIONEND_EVENTS) {
      this.ampdoc_.getBody().removeEventListener(
          animationendEvent, this.boundOnAnimationEndEvent_, true);
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
const reflow = function(element) {
  element./*OK*/offsetWidth = element./*OK*/offsetWidth;
};

/**
 * Registers and immediately starts the GWD runtime service for the given
 * ampdoc. Retrieve the service instance with getServiceForDoc and
 * GWD_SERVICE_NAME.
 * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
 */
export const installGwdRuntimeServiceForDoc = function(ampdoc) {
  registerServiceBuilderForDoc(
      ampdoc,
      GWD_SERVICE_NAME,
      (ampdoc) => {
        return new AmpGwdRuntimeService(ampdoc);
      },
      true /* instantiate */);
};
