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
import {parseUrlDeprecated} from './url';
import {setStyle} from './style';
import {toArray} from './types';

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
  .i-amphtml-story-embed-loaded iframe { opacity: 1; }`;

/** @const {string} */
const TAG = '[AMP-STORY-EMBED]';

/**
 * Logging.
 */
function log() {
  const var_args = toArray(arguments);
  var_args.unshift(TAG);
  console /*OK*/.log
    .apply(console, var_args);
}

/**
 * Gets encoded url for viewer usage.
 * @param {string} href
 * @return {!Location}
 */
function getEncodedUrl(href) {
  const params = {
    visibilityState: 'inactive',
    origin: parseUrlDeprecated(self.location.href).origin,
  };
  log('Params: ' + JSON.stringify(params));

  let inputUrl = href + '?amp_js_v=0.1#' + encodeUrl(params);
  if (self.location.hash && self.location.hash.length > 1) {
    inputUrl += '&' + self.location.hash.substring(1);
  }
  return parseUrlDeprecated(inputUrl);
}

/**
 * Encodes string of URL parameters.
 * @param {!Object} params
 * @return {string}
 */
function encodeUrl(params) {
  let encodedParams = '';
  for (const name in params) {
    const value = params[name];
    if (value === null || value === undefined) {
      continue;
    }
    if (encodedParams.length > 0) {
      encodedParams += '&';
    }
    encodedParams += encodeURIComponent(name) + '=' + encodeURIComponent(value);
  }
  return encodedParams;
}

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

    /** @private {!Element} */
    this.element_ = element;

    /** @private {!Document} */
    this.doc_ = win.document;

    /** @private {!Array<!HTMLAnchorElement>} */
    this.stories_ = [];

    /** @private {?Element} */
    this.rootEl_ = null;

    /** @private {?HTMLIframeElement} */
    this.iframeEl_ = null;

    /** @private {boolean} */
    this.isLaidOut_ = false;
  }

  /** @public */
  buildCallback() {
    this.stories_ = toArray(this.element_.querySelectorAll('a'));

    this.initializeShadowRoot_();

    this.stories_.forEach(story => {
      this.buildIframe_(story);
    });
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
    this.iframeEl_ = this.doc_.createElement('iframe');
    setStyle(
      this.iframeEl_,
      'backgroundImage',
      story.getAttribute('data-poster-portrait-src')
    );
    this.iframeEl_.classList.add('story');
    this.initializeLoadingListeners_();
    this.rootEl_.appendChild(this.iframeEl_);
    this.initializeHandshake_(story);
  }

  /**
   * @param {!Element} story
   * @private
   */
  initializeHandshake_(story) {
    const frameOrigin = getEncodedUrl(story.href).origin;

    Messaging.waitForHandshakeFromDocument(
      self,
      this.iframeEl_.contentWindow,
      frameOrigin
    ).then(
      messaging => {
        // TODO(Enriqe): Appropiately set visibility to stories.
        messaging.sendRequest('visibilitychange', {state: 'visible'}, true);
        messaging.setDefaultHandler(() => {
          // TODO(Enriqe): Set default handler.
        });
        messaging.registerHandler('moreInfoLinkUrl', () => {
          // TODO(Enriqe): Get publisher defined `moreInfoLinkUrl` (could come
          // from an attribute in the <amp-story-embed> element.
          return Promise.resolve('');
        });
      },
      err => {
        log(err);
      }
    );
  }

  /** @private  */
  initializeLoadingListeners_() {
    this.rootEl_.classList.add(LoadStateClass.LOADING);

    this.iframeEl_.onload = () => {
      this.rootEl_.classList.remove(LoadStateClass.LOADING);
      this.element_.classList.remove(LoadStateClass.LOADING);
      this.rootEl_.classList.add(LoadStateClass.LOADED);
      this.element_.classList.add(LoadStateClass.LOADED);
    };
    this.iframeEl_.onerror = () => {
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
    this.stories_.forEach((story, idx) => {
      this.layoutIframe_(story, iframes[idx]);
    });
    this.isLaidOut_ = true;
  }

  /**
   * @param {!Element} story
   * @param {!Element} iframe
   * @private
   */
  layoutIframe_(story, iframe) {
    this.stories_ = toArray(this.element_.querySelectorAll('a'));

    const url = getEncodedUrl(story.href).href;
    log('AMP URL = ', url);

    iframe.setAttribute('src', url);
  }
}

self.onload = () => {
  const doc = self.document;
  const embeds = doc.getElementsByTagName('amp-story-embed');
  for (let i = 0; i < embeds.length; i++) {
    const embed = embeds[i];
    const embedImpl = new AmpStoryEmbed(self, embed);
    embedImpl.buildCallback();

    const intersectingCallback = entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) {
          return;
        }
        embedImpl.layoutCallback();
      });
    };
    const observer = new IntersectionObserver(intersectingCallback, {
      threshold: 0.5,
    });
    observer.observe(embed);
  }
};
