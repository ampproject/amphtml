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

import {loadPromise} from './event-helper';

/** @const {string} */
const SCRIPT_TAG_NAME = 'script';

/** @const {string} */
const SCRIPT_TYPE = 'application/json';

/** @enum {string} */
const LoadStateClass = {
  LOADING: 'loading',
  LOADED: 'loaded',
  ERROR: 'error',
};

/** @const {string} */
const CSS = `
  :host { all: initial; display: block; border-radius: 0; width: 405px; height: 720px; }
  main { background: #202125; }
  iframe { height: 100%; width: 100%; border: 0; opacity: 0; transition: opacity 200ms ease }
  .loaded iframe { opacity: 1; }
`;

/** @typedef {{src: string}} */
let AmpStoryEmbedConfig;

/**
 * Note that this is a vanilla JavaScript class and should not depend on AMP
 * services, as v0.js is not expected to be loaded in this context.
 */
export class AmpStoryEmbed extends HTMLElement {
  /** @constructor */
  constructor() {
    super();

    /** @private {!Document} */
    this.doc_ = this.ownerDocument;

    /** @private {!AmpStoryEmbedConfig} */
    this.config_;

    /** @private {!Element} */
    this.rootEl_;

    /** @private {!HTMLIframeElement} */
    this.iframeEl_;
  }

  /** @override */
  connectedCallback() {
    this.parseConfig_();
    this.initializeShadowRoot_();
    this.buildIframe_();
  }

  /** @private */
  parseConfig_() {
    console.assert(this.childElementCount > 0, 'Missing configuration.');

    const scriptEl = this.children[0];
    console.log(scriptEl);
    console.assert(
      this.childElementCount === 1 &&
        scriptEl.tagName.toLowerCase() === SCRIPT_TAG_NAME &&
        scriptEl.getAttribute('type').toLowerCase() === SCRIPT_TYPE,
      'Must have one <script type="application/json"> configuration'
    );

    // Parse JSON
    this.config_ = JSON.parse(scriptEl.textContent);
    console.assert(
      this.config_ && this.config_.stories && this.config_.stories.length > 0,
      'Must specify at least one story in the configuration.'
    );

    this.currentStory_ = this.config_.stories[0];
    console.assert(this.currentStory_.src, 'Story must have a src.');
  }

  /** @private */
  initializeShadowRoot_() {
    // Create shadow root
    const shadowRoot = this.attachShadow({mode: 'open'});

    // Inject default styles
    const styleEl = this.doc_.createElement('style');
    styleEl.textContent = CSS;
    shadowRoot.appendChild(styleEl);

    this.rootEl_ = this.doc_.createElement('main');
    shadowRoot.appendChild(this.rootEl_);
  }

  /** @private */
  buildIframe_() {
    this.iframeEl_ = this.doc_.createElement('iframe');
    this.iframeEl_.setAttribute('src', this.config_.stories[0].src);
    this.initializeLoadingListeners_();
    this.rootEl_.appendChild(this.iframeEl_);
  }

  /** @private  */
  initializeLoadingListeners_() {
    this.rootEl_.classList.add(LoadStateClass.LOADING);
    loadPromise(this.iframeEl_)
      .then(() => {
        this.rootEl_.classList.remove(LoadStateClass.LOADING);
        this.rootEl_.classList.add(LoadStateClass.LOADED);
      })
      .catch(() => {
        this.rootEl_.classList.remove(LoadStateClass.LOADING);
        this.rootEl_.classList.add(LoadStateClass.ERROR);
      });
  }
}

customElements.define('amp-story-embed', AmpStoryEmbed);
