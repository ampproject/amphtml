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

import {Messaging} from '@ampproject/viewer-messaging';
import {parseUrlWithA, serializeQueryString} from './url';
import {setStyle} from './style';
import {toArray} from './types';

/** @enum {string} */
const LoadStateClass = {
  LOADING: 'i-amphtml-story-embed-loading',
  LOADED: 'i-amphtml-story-embed-loaded',
  ERROR: 'i-amphtml-story-embed-error',
};

/** @const {string} */
const SCROLL_THROTTLE_MS = 500;

/** @const {string} */
const CSS = `
  :host { all: initial; display: block; border-radius: 0 !important; width: 405px; height: 720px; overflow: auto; }
  .story { height: 100%; width: 100%; flex: 0 0 100%; border: 0; opacity: 0; transition: opacity 500ms ease; }
  main { display: flex; flex-direction: row; height: 100%; }
  .i-amphtml-story-embed-loaded iframe { opacity: 1; }`;

/**
 * Note that this is a vanilla JavaScript class and should not depend on AMP
 * services, as v0.js is not expected to be loaded in this context.
 */
export class AmpStoryEmbed {
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

    /** @private {?Element} */
    this.cachedA_ = null;

    /** @private {number} */
    this.iframeIdCounter_ = 0;

    /** @private {!Object<string, Messaging>} */
    this.messagingFor_ = {};

    /** @private {!Element} */
    this.element_ = element;

    /** @private {!Document} */
    this.doc_ = win.document;

    /** @private {!Array<!HTMLAnchorElement>} */
    this.stories_ = [];

    /** @private {?Element} */
    this.rootEl_ = null;

    /** @private {boolean} */
    this.isLaidOut_ = false;
  }

  /** @public */
  buildCallback() {
    this.stories_ = toArray(this.element_.querySelectorAll('a'));

    this.initializeShadowRoot_();

    // TODO(Enriqe): Build all child iframes.
    this.buildIframe_(this.stories_[0]);
  }

  /** @private */
  initializeShadowRoot_() {
    this.rootEl_ = this.doc_.createElement('main');

    // Create shadow root
    const shadowRoot = this.element_.attachShadow({mode: 'open'});

    // Inject default styles
    const styleEl = this.doc_.createElement('style');
    styleEl.textContent = CSS;
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
    iframeEl.setAttribute('id', 'i' + this.iframeIdCounter_++);
    iframeEl.classList.add('story');

    this.initializeLoadingListeners_(iframeEl);
    this.rootEl_.appendChild(iframeEl);

    this.initializeHandshake_(story, iframeEl).then(
      messaging => {
        this.messagingFor_[iframeEl.id] = messaging;

        // TODO(Enriqe): Appropiately set visibility to stories.
        this.messagingFor_[iframeEl.id].sendRequest(
          'visibilitychange',
          {state: 'visible'},
          true
        );
      },
      err => {
        console /*OK*/
          .log({err});
      }
    );
  }

  /**
   * @param {!Element} story
   * @param {!Element} iframeEl
   * @return {Promise<Messaging>}
   * @private
   */
  initializeHandshake_(story, iframeEl) {
    const frameOrigin = this.getEncodedUrl_(story.href).origin;

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
      this.element_.classList.remove(LoadStateClass.LOADING);
      this.rootEl_.classList.add(LoadStateClass.LOADED);
      this.element_.classList.add(LoadStateClass.LOADED);
    };
    iframeEl.onerror = () => {
      this.rootEl_.classList.remove(LoadStateClass.LOADING);
      this.element_.classList.remove(LoadStateClass.LOADING);
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

    const iframes = toArray(this.rootEl_.querySelectorAll('iframe'));
    // TODO(Enriqe): Layout all child iframes.
    this.layoutIframe_(this.stories_[0], iframes[0]);

    this.isLaidOut_ = true;
  }

  /**
   * @param {!Element} story
   * @param {!Element} iframe
   * @private
   */
  layoutIframe_(story, iframe) {
    this.stories_ = toArray(this.element_.querySelectorAll('a'));

    const {href} = this.getEncodedUrl_(story.href);

    iframe.setAttribute('src', href);
  }

  /**
   * Gets encoded url for viewer usage.
   * @param {string} href
   * @return {!Location}
   * @private
   */
  getEncodedUrl_(href) {
    const {location} = this.win_;
    if (!this.cachedA_) {
      this.cachedA_ = this.doc_.createElement('a');
    }
    const url = parseUrlWithA(this.cachedA_, location.href);
    const params = {
      visibilityState: 'inactive',
      origin: url.origin,
    };

    let inputUrl = href + '?amp_js_v=0.1#' + serializeQueryString(params);
    const {hash} = location;
    if (hash && hash.length > 1) {
      inputUrl += '&' + hash.substring(1);
    }
    return parseUrlWithA(this.cachedA_, inputUrl);
  }
}

self.onload = () => {
  const doc = self.document;
  const embeds = doc.getElementsByTagName('amp-story-embed');
  for (let i = 0; i < embeds.length; i++) {
    const embed = embeds[i];
    const embedImpl = new AmpStoryEmbed(self, embed);
    embedImpl.buildCallback();

    if (IntersectionObserver && self === self.parent) {
      const intersectingCallback = entries => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) {
            return;
          }
          embedImpl.layoutCallback();
        });
      };

      const observer = new IntersectionObserver(intersectingCallback, {
        rootMargin: '200%',
      });
      observer.observe(embed);
    } else {
      let tick = false;
      self.addEventListener('scroll', () => {
        if (!tick) {
          setTimeout(() => {
            const embedTop = embed.getBoundingClientRect().top;
            tick = false;
            if (self.innerHeight * 2 > embedTop) {
              embedImpl.layoutCallback();
            }
          }, SCROLL_THROTTLE_MS);
        }
        tick = true;
      });
    }
  }
};
