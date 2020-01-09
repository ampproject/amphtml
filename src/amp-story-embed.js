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

import {setStyle} from '../src/style';

/** @enum {string} */
const LoadStateClass = {
  LOADING: 'loading',
  LOADED: 'loaded',
  ERROR: 'error',
};

/** @const {string} */
const CSS = `
  :host { all: initial; display: block; border-radius: 0 !important; width: 405px; height: 720px; overflow: auto; }
  .story { height: 100%; width: 100%; flex: 0 0 100%; border: 0; opacity: 0; transition: opacity 500ms ease; }
  main { display: flex; flex-direction: row; height: 100%; }
  .loaded iframe { opacity: 1; }
`;

/**
 * Note that this is a vanilla JavaScript class and should not depend on AMP
 * services, as v0.js is not expected to be loaded in this context.
 */
export class AmpStoryEmbed {
  /**
   * @param {!Document} doc
   * @param {!Element} element
   * @constructor
   */
  constructor(doc, element) {
    console./*OK*/ assert(
      element.childElementCount > 0,
      'Missing configuration.'
    );

    /** @private {!Element} */
    this.element_ = element;

    /** @private {!Document} */
    this.doc_ = doc;

    /** @private {!Array<!HTMLAnchorElement>} */
    this.stories_ = Array.prototype.slice.call(element.querySelectorAll('a'));

    /** @private {?Element} */
    this.rootEl_;

    /** @private {?HTMLIframeElement} */
    this.iframeEl_;
  }

  /** @public */
  build() {
    this.initializeShadowRoot_();

    // TODO: Build all child iframes.
    this.buildIframe_(0);
  }

  /** @private */
  initializeShadowRoot_() {
    // Create shadow root
    const shadowRoot = this.element_.attachShadow({mode: 'open'});

    // Inject default styles
    const styleEl = this.doc_.createElement('style');
    styleEl.textContent = CSS;
    shadowRoot.appendChild(styleEl);

    this.rootEl_ = this.doc_.createElement('main');
    shadowRoot.appendChild(this.rootEl_);
  }

  /**
   * @param {number} index
   * @private
   */
  buildIframe_(index) {
    const story = this.stories_[index];
    this.iframeEl_ = this.doc_.createElement('iframe');
    this.iframeEl_.setAttribute('src', story.href);
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
      this.rootEl_.classList.add(LoadStateClass.LOADED);
    };
    this.iframeEl_.onerror = () => {
      this.rootEl_.classList.remove(LoadStateClass.LOADING);
      this.rootEl_.classList.add(LoadStateClass.ERROR);
    };
  }
}

const doc = self.document;
const embeds = doc.getElementsByTagName('amp-story-embed');
for (let i = 0; i < embeds.length; i++) {
  const embed = embeds[i];
  const embedImpl = new AmpStoryEmbed(doc, embed);
  embedImpl.build();
}
