/**
 * Copyright 2020 The AMP HTML Authors. All Rights Reserved.
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

import {AmpStoryPlayerManager} from './amp-story-player-manager';
import {IframePool} from './amp-story-player-iframe-pool';
import {Messaging} from '@ampproject/viewer-messaging';
import {VisibilityState} from './visibility-state';
import {
  addParamsToUrl,
  getFragment,
  parseUrlWithA,
  removeFragment,
} from './url';
import {applySandbox} from './3p-frame';
import {dict, map} from './utils/object';
// Source for this constant is css/amp-story-player-iframe.css
import {cssText} from '../build/amp-story-player-iframe.css';
import {resetStyles, setStyle, setStyles} from './style';
import {toArray} from './types';

/** @enum {string} */
const LoadStateClass = {
  LOADING: 'i-amphtml-story-player-loading',
  LOADED: 'i-amphtml-story-player-loaded',
  ERROR: 'i-amphtml-story-player-error',
};

/** @enum {number} */
const IframePosition = {
  PREVIOUS: -1,
  CURRENT: 0,
  NEXT: 1,
};

/**
 * @enum {number}
 */
const SwipingState = {
  NOT_SWIPING: 0,
  SWIPING_TO_LEFT: 1,
  SWIPING_TO_RIGHT: 2,
};

/** @const {number} */
const TOGGLE_THRESHOLD_PX = 50;

/** @const {number} */
const MAX_IFRAMES = 3;

/** @const {string} */
export const IFRAME_IDX = '__AMP_IFRAME_IDX__';

/**
 * Note that this is a vanilla JavaScript class and should not depend on AMP
 * services, as v0.js is not expected to be loaded in this context.
 */
export class AmpStoryPlayer extends HTMLElement {
  /**
   * Player is appended to the document.
   */
  connectedCallback() {
    console./*OK*/ assert(this.childElementCount > 0, 'Missing configuration.');

    /** @private {!Window} */
    this._win = self;

    /** @private {!Array<!Element>} */
    this._iframes = [];

    /** @private {!Document} */
    this._doc = this._win.document;

    /** @private {!Element} */
    this._cachedA = this._doc.createElement('a');

    /** @private {!Array<!HTMLAnchorElement>} */
    this._stories = [];

    /** @private {?Element} */
    this._rootEl = null;

    /** @private {boolean} */
    this._isLaidOut = false;

    /** @private {!IframePool} */
    this._iframePool = new IframePool();

    /** @private {!Object<string, !Promise>} */
    this._messagingPromises = map();

    /** @private {number} */
    this._currentIdx = 0;

    /** @private {!SwipingState} */
    this._swipingState = SwipingState.NOT_SWIPING;

    /** @private {!Object} */
    this._touchEventState = {
      startX: 0,
      startY: 0,
      lastX: 0,
      isSwipeX: null,
    };

    this._buildCallback();
    const manager = new AmpStoryPlayerManager(self);
    manager.layoutWhenVisible(this);
  }

  /**
   * @public
   * @return {!Element}
   */
  getElement() {
    return this;
  }

  /** @private */
  _buildCallback() {
    this._stories = toArray(this.querySelectorAll('a'));

    this._initializeShadowRoot();
    this._initializeIframes();
  }

  /** @private */
  _initializeIframes() {
    for (let idx = 0; idx < MAX_IFRAMES && idx < this._stories.length; idx++) {
      const story = this._stories[idx];
      this._buildIframe(story);

      story[IFRAME_IDX] = idx;
      this._setUpMessagingForIframe(story, this._iframes[idx]);

      this._iframePool.addIframeIdx(idx);
      this._iframePool.addStoryIdx(idx);
    }
  }

  /** @private */
  _initializeShadowRoot() {
    this._rootEl = this._doc.createElement('main');

    // Create shadow root
    const shadowRoot = this.attachShadow({mode: 'open'});

    // Inject default styles
    const styleEl = this._doc.createElement('style');
    styleEl.textContent = cssText;
    shadowRoot.appendChild(styleEl);
    shadowRoot.appendChild(this._rootEl);
  }

  /**
   * @param {!Element} story
   * @private
   */
  _buildIframe(story) {
    const iframeEl = this._doc.createElement('iframe');
    setStyle(
      iframeEl,
      'backgroundImage',
      story.getAttribute('data-poster-portrait-src')
    );
    iframeEl.classList.add('story-player-iframe');
    this._iframes.push(iframeEl);

    applySandbox(iframeEl);
    this._initializeLoadingListeners(iframeEl);
    this._rootEl.appendChild(iframeEl);
  }

  /**
   * Sets up messaging for a story inside an iframe.
   * @param {!Element} story
   * @param {!Element} iframeEl
   * @private
   */
  _setUpMessagingForIframe(story, iframeEl) {
    const iframeIdx = story[IFRAME_IDX];

    this._messagingPromises[iframeIdx] = new Promise(resolve => {
      this._initializeHandshake(story, iframeEl).then(
        messaging => {
          messaging.setDefaultHandler(() => Promise.resolve());
          messaging.registerHandler('touchstart', (event, data) => {
            this._onTouchStart(data);
          });

          messaging.registerHandler('touchmove', (event, data) => {
            this._onTouchMove(data);
          });

          messaging.registerHandler('touchend', () => {
            this._onTouchEnd();
          });

          messaging.registerHandler('selectDocument', (event, data) => {
            this._onSelectDocument(data);
          });
          resolve(messaging);
        },
        err => {
          console /*OK*/
            .log({err});
        }
      );
    });
  }

  /**
   * @param {!Element} story
   * @param {!Element} iframeEl
   * @return {!Promise<!Messaging>}
   * @private
   */
  _initializeHandshake(story, iframeEl) {
    const frameOrigin = this._getEncodedLocation(story.href).origin;

    return Messaging.waitForHandshakeFromDocument(
      this._win,
      iframeEl.contentWindow,
      frameOrigin
    );
  }

  /**
   * @param {!Element} iframeEl
   * @private
   */
  _initializeLoadingListeners(iframeEl) {
    this._rootEl.classList.add(LoadStateClass.LOADING);

    iframeEl.onload = () => {
      this._rootEl.classList.remove(LoadStateClass.LOADING);
      this._rootEl.classList.add(LoadStateClass.LOADED);
      this.classList.add(LoadStateClass.LOADED);
    };
    iframeEl.onerror = () => {
      this._rootEl.classList.remove(LoadStateClass.LOADING);
      this._rootEl.classList.add(LoadStateClass.ERROR);
      this.classList.add(LoadStateClass.ERROR);
    };
  }

  /** @public */
  layoutCallback() {
    if (this._isLaidOut) {
      return;
    }

    for (let idx = 0; idx < this._stories.length && idx < MAX_IFRAMES; idx++) {
      const story = this._stories[idx];
      const iframeIdx = story[IFRAME_IDX];
      const iframe = this._iframes[iframeIdx];
      this._layoutIframe(
        story,
        iframe,
        idx === 0 ? VisibilityState.VISIBLE : VisibilityState.PRERENDER
      );
    }

    this._isLaidOut = true;
  }

  /**
   * Navigates to the next story in the player.
   * @private
   */
  _next() {
    if (this._currentIdx + 1 >= this._stories.length) {
      return;
    }

    this._currentIdx++;

    const previousStory = this._stories[this._currentIdx - 1];
    this._updatePreviousIframe(
      previousStory[IFRAME_IDX],
      IframePosition.PREVIOUS
    );

    const currentStory = this._stories[this._currentIdx];
    this._updateCurrentIframe(currentStory[IFRAME_IDX]);

    const nextStoryIdx = this._currentIdx + 1;
    if (
      nextStoryIdx < this._stories.length &&
      this._stories[nextStoryIdx][IFRAME_IDX] === undefined
    ) {
      this._allocateIframeForStory(nextStoryIdx);
    }
  }

  /**
   * Navigates to the previous story in the player.
   * @private
   */
  _previous() {
    if (this._currentIdx - 1 < 0) {
      return;
    }

    this._currentIdx--;

    const previousStory = this._stories[this._currentIdx + 1];
    this._updatePreviousIframe(previousStory[IFRAME_IDX], IframePosition.NEXT);

    const currentStory = this._stories[this._currentIdx];
    this._updateCurrentIframe(currentStory[IFRAME_IDX]);

    const nextStoryIdx = this._currentIdx - 1;
    if (
      nextStoryIdx >= 0 &&
      this._stories[nextStoryIdx][IFRAME_IDX] === undefined
    ) {
      this._allocateIframeForStory(nextStoryIdx, true /** reverse */);
    }
  }

  /**
   * Updates an iframe to the `inactive` state.
   * @param {number} iframeIdx
   * @param {!IframePosition} position
   * @private
   */
  _updatePreviousIframe(iframeIdx, position) {
    this._updateVisibilityState(iframeIdx, VisibilityState.INACTIVE);
    this._updateIframePosition(iframeIdx, position);
  }

  /**
   * Updates an iframe to the `current` state.
   * @param {number} iframeIdx
   * @private
   */
  _updateCurrentIframe(iframeIdx) {
    this._updateVisibilityState(iframeIdx, VisibilityState.VISIBLE);
    this._updateIframePosition(iframeIdx, IframePosition.CURRENT);
  }

  /**
   * Updates iframe position.
   * @param {number} iframeIdx
   * @param {!IframePosition} position
   * @private
   */
  _updateIframePosition(iframeIdx, position) {
    requestAnimationFrame(() => {
      const iframe = this._iframes[iframeIdx];
      resetStyles(iframe, ['transform', 'transition']);
      iframe.setAttribute('i-amphtml-iframe-position', position);
    });
  }

  /**
   * Detaches iframe from a story and gives it to the next story. It detaches
   * the iframe from the story furthest away; depending where the user is
   * navigating and allocates it to a story that the user is close to seeing.
   * @param {number} nextStoryIdx
   * @param {boolean} reverse
   * @private
   */
  _allocateIframeForStory(nextStoryIdx, reverse = false) {
    const detachedStoryIdx = reverse
      ? this._iframePool.rotateLast(nextStoryIdx)
      : this._iframePool.rotateFirst(nextStoryIdx);

    const detachedStory = this._stories[detachedStoryIdx];
    const nextStory = this._stories[nextStoryIdx];

    this._messagingPromises[detachedStory[IFRAME_IDX]].then(messaging => {
      messaging.unregisterHandler('selectDocument');
    });

    nextStory[IFRAME_IDX] = detachedStory[IFRAME_IDX];
    detachedStory[IFRAME_IDX] = undefined;

    const nextIframe = this._iframes[nextStory[IFRAME_IDX]];
    this._layoutIframe(nextStory, nextIframe, VisibilityState.PRERENDER);
    this._updateIframePosition(
      nextStory[IFRAME_IDX],
      reverse ? IframePosition.PREVIOUS : IframePosition.NEXT
    );
    this._setUpMessagingForIframe(nextStory, nextIframe);
  }

  /**
   * @param {!Element} story
   * @param {!Element} iframe
   * @param {!VisibilityState} visibilityState
   * @private
   */
  _layoutIframe(story, iframe, visibilityState) {
    const {href} = this._getEncodedLocation(story.href, visibilityState);

    iframe.setAttribute('src', href);
  }

  /**
   * Gets encoded url for player usage.
   * @param {string} href
   * @param {VisibilityState=} visibilityState
   * @return {!Location}
   * @private
   */
  _getEncodedLocation(href, visibilityState = VisibilityState.INACTIVE) {
    const {location} = this._win;
    const url = parseUrlWithA(this._cachedA, location.href);

    const params = dict({
      'amp_js_v': '0.1',
      'visibilityState': visibilityState,
      'origin': url.origin,
      'showStoryUrlInfo': '0',
      'storyPlayer': 'v0',
      'cap': 'swipe',
    });

    const fragmentParam = getFragment(href);
    const noFragmentUrl = removeFragment(href);
    let inputUrl = addParamsToUrl(noFragmentUrl, params);

    // Prepend fragment of original url.
    const prependFragment = match => {
      // Remove the last '&' after amp_js_v=0.1 and replace with a '#'.
      return fragmentParam + match.slice(0, -1) + '#';
    };
    inputUrl = inputUrl.replace(/[?&]amp_js_v=0.1&/, prependFragment);

    return parseUrlWithA(this._cachedA, inputUrl);
  }

  /**
   * Updates the visibility state of the story inside the iframe.
   * @param {number} iframeIdx
   * @param {!VisibilityState} visibilityState
   * @private
   */
  _updateVisibilityState(iframeIdx, visibilityState) {
    this._messagingPromises[iframeIdx].then(messaging => {
      messaging.sendRequest('visibilitychange', {state: visibilityState}, true);
    });
  }

  /**
   * React to selectDocument events.
   * @param {!Object} data
   * @private
   */
  _onSelectDocument(data) {
    if (data.next) {
      this._next();
    } else if (data.previous) {
      this._previous();
    }
  }

  /**
   * Reacts to touchstart events and caches its coordinates.
   * @param {!Event} event
   * @private
   */
  _onTouchStart(event) {
    const coordinates = this._getClientTouchCoordinates(event);
    if (!coordinates) {
      return;
    }

    this._touchEventState.startX = coordinates.x;
    this._touchEventState.startY = coordinates.y;
  }

  /**
   * Reacts to touchmove events and handles horizontal swipes.
   * @param {!Event} event
   * @private
   */
  _onTouchMove(event) {
    if (this._touchEventState.isSwipeX === false) {
      return;
    }

    const coordinates = this._getClientTouchCoordinates(event);
    if (!coordinates) {
      return;
    }

    const {x, y} = coordinates;
    this._touchEventState.lastX = x;

    if (this._touchEventState.isSwipeX === null) {
      this._touchEventState.isSwipeX =
        Math.abs(this._touchEventState.startX - x) >
        Math.abs(this._touchEventState.startY - y);
      if (!this._touchEventState.isSwipeX) {
        return;
      }
    }

    this._onSwipeX({
      deltaX: x - this._touchEventState.startX,
      last: false,
    });
  }

  /**
   * Reacts to touchend events. Resets cached touch event states.
   * @private
   */
  _onTouchEnd() {
    if (this._touchEventState.isSwipeX === true) {
      this._onSwipeX({
        deltaX: this._touchEventState.lastX - this._touchEventState.startX,
        last: true,
      });
    }

    this._touchEventState.startX = 0;
    this._touchEventState.startY = 0;
    this._touchEventState.lastX = 0;
    this._touchEventState.isSwipeX = null;
    this._swipingState = SwipingState.NOT_SWIPING;
  }

  /**
   * Reacts to horizontal swipe events.
   * @param {!Object} gesture
   */
  _onSwipeX(gesture) {
    const {deltaX} = gesture;

    if (gesture.last === true) {
      const delta = Math.abs(deltaX);

      if (this._swipingState === SwipingState.SWIPING_TO_LEFT) {
        delta > TOGGLE_THRESHOLD_PX && this._getSecondaryIframe()
          ? this._next()
          : this._resetIframeStyles();
      }

      if (this._swipingState === SwipingState.SWIPING_TO_RIGHT) {
        delta > TOGGLE_THRESHOLD_PX && this._getSecondaryIframe()
          ? this._previous()
          : this._resetIframeStyles();
      }

      return;
    }

    this._drag(deltaX);
  }

  /**
   * Resets styles for the currently swiped iframes.
   * @private
   */
  _resetIframeStyles() {
    const currentIframe = this._iframes[
      this._stories[this._currentIdx][IFRAME_IDX]
    ];

    requestAnimationFrame(() => {
      resetStyles(currentIframe, ['transform', 'transition']);
    });

    const secondaryIframe = this._getSecondaryIframe();
    if (secondaryIframe) {
      requestAnimationFrame(() => {
        resetStyles(secondaryIframe, ['transform', 'transition']);
      });
    }
  }

  /**
   * Gets accompanying iframe for the currently swiped iframe if any.
   * @private
   * @return {?IframeElement}
   */
  _getSecondaryIframe() {
    const nextStoryIdx =
      this._swipingState === SwipingState.SWIPING_TO_LEFT
        ? this._currentIdx + 1
        : this._currentIdx - 1;

    if (nextStoryIdx < 0 || nextStoryIdx >= this._stories.length) {
      return;
    }

    return this._iframes[this._stories[nextStoryIdx][IFRAME_IDX]];
  }

  /**
   * Drags stories following the swiping gesture.
   * @param {number} deltaX
   * @private
   */
  _drag(deltaX) {
    let secondaryTranslate;

    if (deltaX < 0) {
      this._swipingState = SwipingState.SWIPING_TO_LEFT;
      secondaryTranslate = `translate3d(calc(100% + ${deltaX}px), 0, 0)`;
    } else {
      this._swipingState = SwipingState.SWIPING_TO_RIGHT;
      secondaryTranslate = `translate3d(calc(${deltaX}px - 100%), 0, 0)`;
    }

    const story = this._stories[this._currentIdx];
    const iframe = this._iframes[story[IFRAME_IDX]];
    const translate = `translate3d(${deltaX}px, 0, 0)`;

    requestAnimationFrame(() => {
      setStyles(iframe, {
        transform: translate,
        transition: 'none',
      });
    });

    const secondaryIframe = this._getSecondaryIframe();
    if (!secondaryIframe) {
      return;
    }

    requestAnimationFrame(() => {
      setStyles(secondaryIframe, {
        transform: secondaryTranslate,
        transition: 'none',
      });
    });
  }

  /**
   * Helper to retrieve the touch coordinates from a TouchEvent.
   * @param {!Event} event
   * @return {?{x: number, y: number}}
   * @private
   */
  _getClientTouchCoordinates(event) {
    const {touches} = event;
    if (!touches || touches.length < 1) {
      return null;
    }

    const {screenX: x, screenY: y} = touches[0];
    return {x, y};
  }
}
