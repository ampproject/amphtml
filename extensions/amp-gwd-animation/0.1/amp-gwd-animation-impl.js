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
import {dev, user} from '../../../src/log';
import {dict, hasOwn} from '../../../src/utils/object';
import {escapeCssSelectorIdent} from '../../../src/css';
import {installServiceInEmbedScope} from '../../../src/service';
import {scopedQuerySelector, waitForChild} from '../../../src/dom';
import {toArray} from '../../../src/types';
import {whenDocumentReady} from '../../../src/document-ready';

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
 * Property name used to store pending goto counters on an element.
 * @const {string}
 * Exported for test only.
 */
export const GOTO_COUNTER_PROP = '__AMP_GWD_GOTO_COUNTERS__';

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
  if (
    receiver[GOTO_COUNTER_PROP] &&
    hasOwn(receiver[GOTO_COUNTER_PROP], counterName)
  ) {
    return receiver[GOTO_COUNTER_PROP][counterName];
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
  if (!receiver[GOTO_COUNTER_PROP]) {
    receiver[GOTO_COUNTER_PROP] = {};
  }
  if (!hasOwn(receiver[GOTO_COUNTER_PROP], counterName)) {
    receiver[GOTO_COUNTER_PROP][counterName] = 0;
  }
  receiver[GOTO_COUNTER_PROP][counterName] = counterValue;
}

/**
 * AMP GWD animation runtime service.
 * @implements {../../../src/service.Disposable}
 * @implements {../../../src/service.EmbeddableService}
 */
export class AmpGwdRuntimeService {
  /**
   * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc An AMP document
   *     with GWD content in which to install the animation runtime controller.
   * @param {!Window=} opt_win If in a FIE, the FIE window in which to install
   *     the service.
   */
  constructor(ampdoc, opt_win) {
    /** @const @private {!../../../src/service/ampdoc-impl.AmpDoc} */
    this.ampdoc_ = ampdoc;

    /**
     * The window containing the GWD ad document. This will differ from the
     * provided AmpDoc's window when in FIE.
     * @const @private {!Window}
     */
    this.win_ = opt_win || ampdoc.win;

    /**
     * The GWD ad document root. This will differ from the top-level AmpDoc's
     * root when in FIE.
     * @const @private {!Document}
     */
    this.doc_ = this.win_.document;

    /** @const @private {!Function} */
    this.boundOnAnimationEndEvent_ = this.onAnimationEndEvent_.bind(this);

    // Initialize once the body and DOM is ready.
    const docReadyPromise = opt_win
      ? whenDocumentReady(this.doc_)
      : ampdoc.whenReady();
    docReadyPromise.then(() => {
      // If the page deck is not yet in the DOM, wait until it is. The page deck
      // must be present in the body before the runtime can be initialized, as
      // it must activate animations on the first page. It's not clear whether
      // in production this is a realistic scenario (though this occurs in
      // tests), but this also avoids performing initialization on the top-level
      // document on which the service is first (unnecessarily) installed when
      // in a FIE.
      const body = dev().assertElement(this.doc_.body);
      waitForChild(
        body,
        () =>
          !!body.querySelector(
            `.${escapeCssSelectorIdent(GWD_PAGE_WRAPPER_CLASS)}`
          ),
        this.initialize_.bind(this)
      );
    });
  }

  /**
   * @param {!Window} embedWin
   * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
   * @nocollapse
   */
  static installInEmbedWindow(embedWin, ampdoc) {
    installServiceInEmbedScope(
      embedWin,
      GWD_SERVICE_NAME,
      new AmpGwdRuntimeService(ampdoc, embedWin)
    );
  }

  /**
   * Initializes the runtime. Attaches `animationend` event listeners for
   * handling timeline events, and activates animations on the first page.
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
    this.doc_.body.classList.toggle(ANIMATIONS_DISABLED_CLASS, !enable);
  }

  /**
   * Handles a page switch by resetting animations and goto counters on the
   * currently-active page and starting animations on the new page.
   * @param {number} index The index of the newly-active page (a slide in the
   *     pagedeck amp-carousel).
   */
  setCurrentPage(index) {
    const gwdPages = this.doc_.body.querySelectorAll(
      `.${escapeCssSelectorIdent(GWD_PAGE_WRAPPER_CLASS)}`
    );

    if (gwdPages.length == 0) {
      user().warn(
        LOG_ID,
        'Could not set current page. No pages were found in the document.'
      );
      return;
    }

    // Deactivate the outgoing current page, if there is one.
    // TODO(sklobovskaya): Decide if it's worth just storing the index.
    const activePageSelector = `.${escapeCssSelectorIdent(
      GWD_PAGE_WRAPPER_CLASS
    )}.${escapeCssSelectorIdent(PlaybackCssClass.PLAY)}`;
    const currentPageEl = scopedQuerySelector(
      this.doc_.body,
      activePageSelector
    );

    if (currentPageEl) {
      this.deactivatePage_(currentPageEl);
    }

    // Activate animations on the new current page.
    const newPageEl = gwdPages[index];

    if (newPageEl) {
      this.activatePage_(newPageEl);
    } else {
      user().error(LOG_ID, 'Could not find page with index ' + index + '.');
    }
  }

  /**
   * Sets a page as the current active page by enabling animations on it.
   * Animations are prevented from running on inactive pages.
   * @param {!Element} pageEl
   * @private
   */
  activatePage_(pageEl) {
    pageEl.classList.add(PlaybackCssClass.PLAY);
  }

  /**
   * Sets a page inactive by disabling all animations and resetting all
   * animation state (such as goto counters) on all elements within the page.
   * @param {!Element} pageEl
   * @private
   */
  deactivatePage_(pageEl) {
    // Cancel and disable all animations on the page.
    pageEl.classList.remove(PlaybackCssClass.PLAY);

    // Reset other animation state on the page and all descendants.
    [pageEl]
      .concat(toArray(pageEl.querySelectorAll('*')))
      .forEach(el => this.resetAnimatedElement_(el));
  }

  /**
   * Resets all transient GWD animation state on an animated element associated
   * with a page (either a descendant of the page or the page element itself).
   * The page elements themselves have an additional class which controls
   * whether any animations may play on the page (PlaybackCssClass.PLAY); this
   * class is toggled separately in activatePage_ and deactivatePage_.
   * @param {!Element} element A descendant of a page or a page element.
   * @private
   */
  resetAnimatedElement_(element) {
    // Reset animation-play-state for animations which have been paused.
    element.classList.remove(PlaybackCssClass.PAUSE);

    // Cancel any active label animations in the page. The main non-label
    // animations will be automatically cancelled when the play class is
    // removed above, but because goto animations are activated with a special
    // class, the class must be removed manually.
    if (element.hasAttribute(CURRENT_LABEL_ANIMATION_ATTR)) {
      const activeGotoAnimation = element.getAttribute(
        CURRENT_LABEL_ANIMATION_ATTR
      );
      element.classList.remove(activeGotoAnimation);
      element.removeAttribute(CURRENT_LABEL_ANIMATION_ATTR);
    }

    // Clear all gotoAndPlayNTimes counters.
    delete element[GOTO_COUNTER_PROP];
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
    this.win_.setTimeout(() => {
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
      return this.doc_.body;
    }

    // Try to locate the receiver by id in the DOM.
    // TODO(sklobovskaya): When support for groups is added, this lookup will
    // need to use GwdIds.
    const receiver = this.doc_.getElementById(id);

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
    const currentLabel = receiver.getAttribute(CURRENT_LABEL_ANIMATION_ATTR);

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

    const detail = dict({
      'eventName': userEventName,
      'sourceEvent': event,
    });
    const timelineEvent = createCustomEvent(
      this.win_,
      GWD_TIMELINE_EVENT,
      detail
    );

    this.doc_.dispatchEvent(timelineEvent);
  }

  /**
   * @private
   */
  listenForAnimationEnd_() {
    for (let i = 0; i < VENDOR_ANIMATIONEND_EVENTS.length; i++) {
      this.doc_.body.addEventListener(
        VENDOR_ANIMATIONEND_EVENTS[i],
        this.boundOnAnimationEndEvent_,
        true
      );
    }
  }

  /**
   * @private
   */
  unlistenForAnimationEnd_() {
    for (let i = 0; i < VENDOR_ANIMATIONEND_EVENTS.length; i++) {
      this.doc_.body.removeEventListener(
        VENDOR_ANIMATIONEND_EVENTS[i],
        this.boundOnAnimationEndEvent_,
        true
      );
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
  // exporting global to trick Closure into thinking this function has side
  // effects.
  const globalRef = '__AMP_GWD_TEMP';
  // Reading `offsetWidth` is what actually causes reflow.
  self[globalRef] = element./*OK*/ offsetWidth;
  delete self[globalRef];
}
