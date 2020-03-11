/**
 * Copyright 2019 The AMP HTML Authors. All Rights Reserved.
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
import {Messaging} from '@ampproject/viewer-messaging';
import {
  addParamsToUrl,
  getFragment,
  parseUrlWithA,
  removeFragment,
} from './url';
import {dict, map} from './utils/object';
// Source for this constant is css/amp-story-player-iframe.css
import {IframePool} from './amp-story-player-iframe-pool';
import {VisibilityState} from './visibility-state';
import {applySandbox} from './3p-frame';
import {cssText} from '../build/amp-story-player-iframe.css';
import {setStyle} from './style';
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

/** @const {number} */
const MAX_IFRAMES = 3;

/** @const {string} */
export const IFRAME_IDX = '__AMP_IFRAME_IDX__';

/**
 * Note that this is a vanilla JavaScript class and should not depend on AMP
 * services, as v0.js is not expected to be loaded in this context.
 */
export class AmpStoryPlayer {
  /**
   * @param {!Window} win
   * @param {!Element} element
   * @constructor
   */
  constructor(win, element) {
    console./*OK*/ assert(
      element.childElementCount > 0,
      'Missing configuration.'
    );

    /** @private {!Window} */
    this.win_ = win;

    /** @private {!Array<!Element>} */
    this.iframes_ = [];

    /** @private {!Element} */
    this.element_ = element;

    /** @private {!Document} */
    this.doc_ = win.document;

    /** @private {!Element} */
    this.cachedA_ = this.doc_.createElement('a');

    /** @private {!Array<!HTMLAnchorElement>} */
    this.stories_ = [];

    /** @private {?Element} */
    this.rootEl_ = null;

    /** @private {boolean} */
    this.isLaidOut_ = false;

    /** @private {!IframePool} */
    this.iframePool_ = new IframePool();

    /** @private {!Object<string, !Promise>} */
    this.messagingPromises_ = map();

    /** @private {number} */
    this.currentIdx_ = 0;
  }

  /**
   * @public
   * @return {!Element}
   */
  getElement() {
    return this.element_;
  }

  /** @public */
  buildCallback() {
    this.stories_ = toArray(this.element_.querySelectorAll('a'));

    this.initializeShadowRoot_();
    this.initializeIframes_();
  }

  /** @private */
  initializeIframes_() {
    for (let idx = 0; idx < MAX_IFRAMES && idx < this.stories_.length; idx++) {
      const story = this.stories_[idx];
      this.buildIframe_(story);

      story[IFRAME_IDX] = idx;
      this.setUpMessagingForIframe_(story, this.iframes_[idx]);

      this.iframePool_.addIframeIdx(idx);
      this.iframePool_.addStoryIdx(idx);
    }
  }

  /** @private */
  initializeShadowRoot_() {
    this.rootEl_ = this.doc_.createElement('main');

    // Create shadow root
    const shadowRoot = this.element_.attachShadow({mode: 'open'});

    // Inject default styles
    const styleEl = this.doc_.createElement('style');
    styleEl.textContent = cssText;
    shadowRoot.appendChild(styleEl);
    shadowRoot.appendChild(this.rootEl_);
  }

  /**
   * @param {!Element} story
   * @private
   */
  buildIframe_(story) {
    const iframeEl = this.doc_.createElement('iframe');
    setStyle(
      iframeEl,
      'backgroundImage',
      story.getAttribute('data-poster-portrait-src')
    );
    iframeEl.classList.add('story-player-iframe');
    this.iframes_.push(iframeEl);

    applySandbox(iframeEl);
    this.initializeLoadingListeners_(iframeEl);
    this.rootEl_.appendChild(iframeEl);
  }

  /**
   * Sets up messaging for a story inside an iframe.
   * @param {!Element} story
   * @param {!Element} iframeEl
   * @private
   */
  setUpMessagingForIframe_(story, iframeEl) {
    const iframeIdx = story[IFRAME_IDX];

    this.messagingPromises_[iframeIdx] = new Promise(resolve => {
      this.initializeHandshake_(story, iframeEl).then(
        messaging => {
          messaging.setDefaultHandler(() => Promise.resolve());
          messaging.registerHandler('selectDocument', (event, data) => {
            this.onSelectDocument_(data);
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
  initializeHandshake_(story, iframeEl) {
    const frameOrigin = this.getEncodedLocation_(story.href).origin;

    return Messaging.waitForHandshakeFromDocument(
      this.win_,
      iframeEl.contentWindow,
      frameOrigin
    );
  }

  /**
   * @param {!Element} iframeEl
   * @private
   */
  initializeLoadingListeners_(iframeEl) {
    this.rootEl_.classList.add(LoadStateClass.LOADING);

    iframeEl.onload = () => {
      this.rootEl_.classList.remove(LoadStateClass.LOADING);
      this.rootEl_.classList.add(LoadStateClass.LOADED);
      this.element_.classList.add(LoadStateClass.LOADED);
    };
    iframeEl.onerror = () => {
      this.rootEl_.classList.remove(LoadStateClass.LOADING);
      this.rootEl_.classList.add(LoadStateClass.ERROR);
      this.element_.classList.add(LoadStateClass.ERROR);
    };
  }

  /**
   * @public
   */
  layoutCallback() {
    if (this.isLaidOut_) {
      return;
    }

    for (let idx = 0; idx < this.stories_.length && idx < MAX_IFRAMES; idx++) {
      const story = this.stories_[idx];
      const iframeIdx = story[IFRAME_IDX];
      const iframe = this.iframes_[iframeIdx];
      this.layoutIframe_(
        story,
        iframe,
        idx === 0 ? VisibilityState.VISIBLE : VisibilityState.PRERENDER
      );
    }

    this.isLaidOut_ = true;
  }

  /**
   * Navigates to the next story in the player.
   * @private
   */
  next_() {
    if (this.currentIdx_ + 1 >= this.stories_.length) {
      return;
    }

    this.currentIdx_++;

    const previousStory = this.stories_[this.currentIdx_ - 1];
    this.updatePreviousIframe_(previousStory[IFRAME_IDX]);

    const currentStory = this.stories_[this.currentIdx_];
    this.updateCurrentIframe_(currentStory[IFRAME_IDX]);

    const nextStoryIdx = this.currentIdx_ + 1;
    if (
      nextStoryIdx < this.stories_.length &&
      this.stories_[nextStoryIdx][IFRAME_IDX] === undefined
    ) {
      this.allocateIframeForStory_(nextStoryIdx);
    }
  }

  /**
   * Navigates to the previous story in the player.
   * @private
   */
  previous_() {
    if (this.currentIdx_ - 1 < 0) {
      return;
    }

    this.currentIdx_--;

    const previousStory = this.stories_[this.currentIdx_ + 1];
    this.updatePreviousIframe_(previousStory[IFRAME_IDX]);

    const currentStory = this.stories_[this.currentIdx_];
    this.updateCurrentIframe_(currentStory[IFRAME_IDX]);

    const nextStoryIdx = this.currentIdx_ - 1;
    if (
      nextStoryIdx >= 0 &&
      this.stories_[nextStoryIdx][IFRAME_IDX] === undefined
    ) {
      this.allocateIframeForStory_(nextStoryIdx, true /** reverse */);
    }
  }

  /**
   * Updates an iframe to the `previous` state.
   * @param {number} iframeIdx
   * @private
   */
  updatePreviousIframe_(iframeIdx) {
    this.updateVisibilityState_(iframeIdx, VisibilityState.INACTIVE);
    this.updateIframePosition_(iframeIdx, IframePosition.PREVIOUS);
  }

  /**
   * Updates an iframe to the `current` state.
   * @param {number} iframeIdx
   * @private
   */
  updateCurrentIframe_(iframeIdx) {
    this.updateVisibilityState_(iframeIdx, VisibilityState.VISIBLE);
    this.updateIframePosition_(iframeIdx, IframePosition.CURRENT);
  }

  /**
   * Updates iframe position.
   * @param {number} iframeIdx
   * @param {!IframePosition} position
   * @private
   */
  updateIframePosition_(iframeIdx, position) {
    this.iframes_[iframeIdx].setAttribute(
      'i-amphtml-iframe-position',
      position
    );
  }

  /**
   * Detaches iframe from a story and gives it to the next story. It detaches
   * the iframe from the story furthest away; depending where the user is
   * navigating and allocates it to a story that the user is close to seeing.
   * @param {number} nextStoryIdx
   * @param {boolean} reverse
   * @private
   */
  allocateIframeForStory_(nextStoryIdx, reverse = false) {
    const detachedStoryIdx = reverse
      ? this.iframePool_.rotateLast(nextStoryIdx)
      : this.iframePool_.rotateFirst(nextStoryIdx);

    const detachedStory = this.stories_[detachedStoryIdx];
    const nextStory = this.stories_[nextStoryIdx];

    this.messagingPromises_[detachedStory[IFRAME_IDX]].then(messaging => {
      messaging.unregisterHandler('selectDocument');
    });

    nextStory[IFRAME_IDX] = detachedStory[IFRAME_IDX];
    detachedStory[IFRAME_IDX] = undefined;

    const nextIframe = this.iframes_[nextStory[IFRAME_IDX]];
    this.layoutIframe_(nextStory, nextIframe, VisibilityState.PRERENDER);
    this.updateIframePosition_(
      nextStory[IFRAME_IDX],
      reverse ? IframePosition.PREVIOUS : IframePosition.NEXT
    );
    this.setUpMessagingForIframe_(nextStory, nextIframe);
  }

  /**
   * @param {!Element} story
   * @param {!Element} iframe
   * @param {!VisibilityState} visibilityState
   * @private
   */
  layoutIframe_(story, iframe, visibilityState) {
    const {href} = this.getEncodedLocation_(story.href, visibilityState);

    iframe.setAttribute('src', href);
  }

  /**
   * Gets encoded url for player usage.
   * @param {string} href
   * @param {VisibilityState=} visibilityState
   * @return {!Location}
   * @private
   */
  getEncodedLocation_(href, visibilityState = VisibilityState.INACTIVE) {
    const {location} = this.win_;
    const url = parseUrlWithA(this.cachedA_, location.href);

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

    return parseUrlWithA(this.cachedA_, inputUrl);
  }

  /**
   * Updates the visibility state of the story inside the iframe.
   * @param {number} iframeIdx
   * @param {!VisibilityState} visibilityState
   * @private
   */
  updateVisibilityState_(iframeIdx, visibilityState) {
    this.messagingPromises_[iframeIdx].then(messaging => {
      messaging.sendRequest('visibilitychange', {state: visibilityState}, true);
    });
  }

  /**
   * React to selectDocument events.
   * @param {!Object} data
   * @private
   */
  onSelectDocument_(data) {
    if (data.next) {
      this.next_();
    } else if (data.previous) {
      this.previous_();
    }
  }
}

self.onload = () => {
  const manager = new AmpStoryPlayerManager(self);
  manager.loadPlayers();
};
