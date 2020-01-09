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

import {setStyle} from './style';

/** @enum {string} */
const LoadStateClass = {
  LOADING: 'i-amphtml-story-embed-loading',
  LOADED: 'i-amphtml-story-embed-loaded',
  ERROR: 'i-amphtml-story-embed-error',
};

/** @const {string} */
const CSS = `
  :host { all: initial; display: block; border-radius: 0 !important; width: 405px; height: 720px; overflow: auto; }
  .story { height: 100%; width: 100%; flex: 0 0 100%; border: 0; opacity: 0; transition: opacity 500ms ease; }
  main { display: flex; flex-direction: row; height: 100%; }
  .i-amphtml-story-embed-loaded iframe { opacity: 1; }
  iframe[src=""] { display: none; }
`;

/** @const {boolean} */
const isAMP = self.AMP && self.AMP.ampdoc;

/**
 * Note that this is a vanilla JavaScript class and should not depend on AMP
 * services, as v0.js is not expected to be loaded in this context.
 */
export class AmpStoryEmbedManager {
  /**
   * @param {!Window} win
   * @param {!Document} doc
   * @param {!Element} hostEl
   * @constructor
   */
  constructor(win, doc, hostEl) {
    console./*OK*/ assert(
      hostEl.childElementCount > 0,
      'Missing configuration.'
    );

    /** @private {!Element} */
    this.hostEl_ = hostEl;

    /** @private {!Document} */
    this.doc_ = doc;

    /** @private {?Array<!HTMLAnchorElement>} */
    this.stories_ = null;

    /** @private {?Element} */
    this.rootEl_ = null;

    /** @private {?HTMLIframeElement} */
    this.iframeEl_ = null;
  }

  /** @public */
  build() {
    this.stories_ = Array.prototype.slice.call(
      this.hostEl_.querySelectorAll('a')
    );

    this.initializeShadowRoot_();

    // TODO: Build all child iframes.
    this.buildIframe_(0);
  }

  /** @private */
  initializeShadowRoot_() {
    this.rootEl_ = this.doc_.createElement('main');

    // Create shadow root
    const shadowRoot = this.hostEl_.attachShadow({mode: 'open'});

    // Inject default styles
    const styleEl = this.doc_.createElement('style');
    styleEl.textContent = CSS;
    shadowRoot.appendChild(styleEl);
    shadowRoot.appendChild(this.rootEl_);
  }

  /**
   * @param {number} index
   * @private
   */
  buildIframe_(index) {
    const story = this.stories_[index];
    this.iframeEl_ = this.doc_.createElement('iframe');
    setStyle(
      this.iframeEl_,
      'backgroundImage',
      story.getAttribute('data-poster-portrait-src')
    );
    this.iframeEl_.classList.add('story');
    this.initializeLoadingListeners_();
    this.rootEl_.appendChild(this.iframeEl_);
  }

  /** @private  */
  initializeLoadingListeners_() {
    this.rootEl_.classList.add(LoadStateClass.LOADING);

    this.iframeEl_.onload = () => {
      this.rootEl_.classList.remove(LoadStateClass.LOADING);
      this.hostEl_.classList.remove(LoadStateClass.LOADING);
      this.rootEl_.classList.add(LoadStateClass.LOADED);
      this.hostEl_.classList.add(LoadStateClass.LOADED);
    };
    this.iframeEl_.onerror = () => {
      this.rootEl_.classList.remove(LoadStateClass.LOADING);
      this.hostEl_.classList.remove(LoadStateClass.LOADING);
      this.rootEl_.classList.add(LoadStateClass.ERROR);
      this.hostEl_.classList.add(LoadStateClass.ERROR);
    };
  }

  /**
   * @return {!Promise}
   * @public
   */
  layout() {
    // TODO: Layout all child iframes.
    return this.layoutIframe_(0);
  }

  /**
   * @param {number} index
   * @return {!Promise}
   * @private
   */
  layoutIframe_(index) {
    const story = this.stories_[index];
    this.iframeEl_.setAttribute('src', story.href);
    return Promise.resolve();
  }
}

self.onload = () => {
  if (!isAMP) {
    const doc = self.document;
    const embeds = doc.getElementsByTagName('amp-story-embed');
    for (let i = 0; i < embeds.length; i++) {
      const embed = embeds[i];
      const embedImpl = new AmpStoryEmbedManager(self, doc, embed);
      embedImpl.build();
      embedImpl.layout();
    }
  }
};
