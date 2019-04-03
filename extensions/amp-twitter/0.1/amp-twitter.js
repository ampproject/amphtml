/**
 * Copyright 2015 The AMP HTML Authors. All Rights Reserved.
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


import {CSS} from '../../../build/amp-twitter-0.1.css';
import {MessageType} from '../../../src/3p-frame-messaging';
import {getIframe, preloadBootstrap} from '../../../src/3p-frame';
import {htmlFor} from '../../../src/static-template';
import {isExperimentOn} from '../../../src/experiments';
import {isLayoutSizeDefined} from '../../../src/layout';
import {listenFor} from '../../../src/iframe-helper';
import {removeElement} from '../../../src/dom';
import {setStyle} from '../../../src/style';

class AmpTwitter extends AMP.BaseElement {

  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {?HTMLIFrameElement} */
    this.iframe_ = null;

    /** @private {?Element} */
    this.userPlaceholder_ = null;
  }

  /**
   * @override
   */
  buildCallback() {
    this.userPlaceholder_ = this.getPlaceholder();
  }

  /**
   * @override
   */
  createLoaderBrandCallback() {
    return htmlFor(this.element)`
        <path fill="1DA1F2" d="M56.29,68.13c7.55,0,11.67-6.25,11.67-11.67c0-0.18,0-0.35-0.01-0.53c0.8-0.58,1.5-1.3,2.05-2.12
        c-0.74,0.33-1.53,0.55-2.36,0.65c0.85-0.51,1.5-1.31,1.8-2.27c-0.79,0.47-1.67,0.81-2.61,1c-0.75-0.8-1.82-1.3-3-1.3
        c-2.27,0-4.1,1.84-4.1,4.1c0,0.32,0.04,0.64,0.11,0.94c-3.41-0.17-6.43-1.8-8.46-4.29c-0.35,0.61-0.56,1.31-0.56,2.06
        c0,1.42,0.72,2.68,1.83,3.42c-0.67-0.02-1.31-0.21-1.86-0.51c0,0.02,0,0.03,0,0.05c0,1.99,1.41,3.65,3.29,4.02
        c-0.34,0.09-0.71,0.14-1.08,0.14c-0.26,0-0.52-0.03-0.77-0.07c0.52,1.63,2.04,2.82,3.83,2.85c-1.4,1.1-3.17,1.76-5.1,1.76
        c-0.33,0-0.66-0.02-0.98-0.06C51.82,67.45,53.97,68.13,56.29,68.13"></path>`;
  }

  /**
   * @param {boolean=} opt_onLayout
   * @override
   */
  preconnectCallback(opt_onLayout) {
    preloadBootstrap(this.win, this.preconnect);
    // Hosts the script that renders tweets.
    this.preconnect.preload(
        'https://platform.twitter.com/widgets.js', 'script');
    // This domain serves the actual tweets as JSONP.
    this.preconnect.url('https://syndication.twitter.com', opt_onLayout);
    // All images
    this.preconnect.url('https://pbs.twimg.com', opt_onLayout);
    this.preconnect.url('https://cdn.syndication.twimg.com', opt_onLayout);
  }

  /** @override */
  isLayoutSupported(layout) {
    return isLayoutSizeDefined(layout);
  }

  /** @override */
  firstLayoutCompleted() {
    // Do not hide the placeholder.
  }

  /** @override */
  layoutCallback() {
    const iframe = getIframe(this.win, this.element, 'twitter', null,
        {allowFullscreen: true});
    this.applyFillContent(iframe);
    iframe.classList.add('i-amphtml-twitter-iframe');
    this.updateForLoadingState_();
    listenFor(iframe, MessageType.EMBED_SIZE, data => {
      this.updateForSuccessState_(data['height']);
    }, /* opt_is3P */true);
    listenFor(iframe, MessageType.NO_CONTENT, () => {
      this.updateForFailureState_();
    }, /* opt_is3P */true);
    this.element.appendChild(iframe);
    this.iframe_ = iframe;
    return this.loadPromise(iframe);
  }

  /**
   * Updates when starting to load a tweet.
   * @private
   */
  updateForLoadingState_() {
    let height;
    this.measureMutateElement(() => {
      height = this.element./*OK*/getBoundingClientRect().height;
    }, () => {
      this.element.setAttribute('i-amphtml-loading', 'start');
      // Set an explicit height so we can animate it.
      this./*OK*/changeHeight(height);
    });
  }

  /**
   * Updates when the tweet has successfully rendered.
   * @param {number} height The height of the rendered tweet.
   * @private
   */
  updateForSuccessState_(height) {
    let placeholderHeight;
    this.measureMutateElement(() => {
      if (!this.userPlaceholder_ && isFadingPlaceholder(this.win)) {
        // Use an explicit height so that the placeholder does not move when\
        // the container resizes.
        placeholderHeight = this.element./*OK*/getBoundingClientRect().height;
      }
    }, () => {
      if (this.userPlaceholder_) {
        this.togglePlaceholder(false);
      }
      this.element.setAttribute('i-amphtml-loading', 'done');
      this./*OK*/changeHeight(height);
      if (placeholderHeight) {
        setStyle(this.getPlaceholder(), 'height', placeholderHeight, 'px');
      }
    });
  }

  /**
   * Updates wheen the tweet that failed to load. This uses the fallback
   * provided if available. If not, it uses the user specified placeholder.
   * @private
   */
  updateForFailureState_() {
    const fallback = this.getFallback();
    const content = fallback || this.userPlaceholder_;

    this.mutateElement(() => {
      if (fallback) {
        this.togglePlaceholder(false);
        this.toggleFallback(true);
      }

      if (content) {
        this./*OK*/changeHeight(content./*OK*/offsetHeight);
      }
    });
  }

  /** @override */
  unlayoutOnPause() {
    return true;
  }

  /** @override */
  unlayoutCallback() {
    if (this.iframe_) {
      removeElement(this.iframe_);
      this.iframe_ = null;
    }
    return true;
  }
}


AMP.extension('amp-twitter', '0.1', AMP => {
  const styles = enableDefaultPlaceholder(AMP.win) ? CSS : undefined;
  AMP.registerElement('amp-twitter', AmpTwitter, styles);
});
