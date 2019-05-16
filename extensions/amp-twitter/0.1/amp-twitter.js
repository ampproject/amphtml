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

/**
 * @param {!Window} win
 * @return {boolean} True if we should show the default placeholder with
 *    plusing.
 */
function isPulsingPlaceholder(win) {
  return isExperimentOn(win, 'twitter-default-placeholder-pulse');
}

/**
 * @param {!Window} win
 * @return {boolean} True if we should show the default placeholder with
 *    a fade out.
 */
function isFadingPlaceholder(win) {
  return isExperimentOn(win, 'twitter-default-placeholder-fade');
}

/**
 * @param {!Window} win
 * @return {boolean} True if we should show the default placeholder with
 *    a burst ending animation.
 */
function isBurstingPlaceholder(win) {
  return isExperimentOn(win, 'twitter-default-placeholder-burst');
}

/**
 * @param {!Window} win
 * @return {boolean} True if we should show the default placeholder.
 */
function enableDefaultPlaceholder(win) {
  return isExperimentOn(win, 'twitter-default-placeholder');
}

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
  createPlaceholderCallback() {
    if (!enableDefaultPlaceholder(this.win)) {
      return;
    }

    // Svg from https://about.twitter.com/en_us/company/brand-resources.html
    return htmlFor(this.element)`
        <div class="i-amphtml-twitter-placeholder" placeholder>
          <div class="i-amphtml-twitter-placeholder-logo">
            <svg class="i-amphtml-twitter-placeholder-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400"><defs><style>.cls-1{fill:none;}.cls-2{fill:#1da1f2;}</style></defs><rect class="cls-1" width="400" height="400"></rect><path class="cls-2" d="M153.62,301.59c94.34,0,145.94-78.16,145.94-145.94,0-2.22,0-4.43-.15-6.63A104.36,104.36,0,0,0,325,122.47a102.38,102.38,0,0,1-29.46,8.07,51.47,51.47,0,0,0,22.55-28.37,102.79,102.79,0,0,1-32.57,12.45,51.34,51.34,0,0,0-87.41,46.78A145.62,145.62,0,0,1,92.4,107.81a51.33,51.33,0,0,0,15.88,68.47A50.91,50.91,0,0,1,85,169.86c0,.21,0,.43,0,.65a51.31,51.31,0,0,0,41.15,50.28,51.21,51.21,0,0,1-23.16.88,51.35,51.35,0,0,0,47.92,35.62,102.92,102.92,0,0,1-63.7,22A104.41,104.41,0,0,1,75,278.55a145.21,145.21,0,0,0,78.62,23"></path></svg>
          </div>
        </div>`;
  }

  /**
   * @param {boolean=} opt_onLayout
   * @override
   */
  preconnectCallback(opt_onLayout) {
    preloadBootstrap(this.win, this.preconnect);
    // Hosts the script that renders tweets.
    this.preconnect.preload(
      'https://platform.twitter.com/widgets.js',
      'script'
    );
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
    const iframe = getIframe(this.win, this.element, 'twitter', null, {
      allowFullscreen: true,
    });
    this.applyFillContent(iframe);
    iframe.classList.add('i-amphtml-twitter-iframe');
    if (isPulsingPlaceholder(this.win)) {
      this.element.classList.add('i-amphtml-twitter-pulse');
    }
    if (isFadingPlaceholder(this.win)) {
      this.element.classList.add('i-amphtml-twitter-fade');
    }
    if (isBurstingPlaceholder(this.win)) {
      this.element.classList.add('i-amphtml-twitter-burst');
    }
    this.updateForLoadingState_();
    listenFor(
      iframe,
      MessageType.EMBED_SIZE,
      data => {
        this.updateForSuccessState_(data['height']);
      },
      /* opt_is3P */ true
    );
    listenFor(
      iframe,
      MessageType.NO_CONTENT,
      () => {
        this.updateForFailureState_();
      },
      /* opt_is3P */ true
    );
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
    this.measureMutateElement(
      () => {
        height = this.element./*OK*/ getBoundingClientRect().height;
      },
      () => {
        this.element.setAttribute('i-amphtml-loading', 'start');
        // Set an explicit height so we can animate it.
        this./*OK*/ changeHeight(height);
      }
    );
  }

  /**
   * Updates when the tweet has successfully rendered.
   * @param {number} height The height of the rendered tweet.
   * @private
   */
  updateForSuccessState_(height) {
    let placeholderHeight;
    this.measureMutateElement(
      () => {
        if (!this.userPlaceholder_ && isFadingPlaceholder(this.win)) {
          // Use an explicit height so that the placeholder does not move when\
          // the container resizes.
          placeholderHeight = this.element./*OK*/ getBoundingClientRect()
            .height;
        }
      },
      () => {
        if (this.userPlaceholder_) {
          this.togglePlaceholder(false);
        }
        this.element.setAttribute('i-amphtml-loading', 'done');
        this./*OK*/ changeHeight(height);
        if (placeholderHeight) {
          setStyle(this.getPlaceholder(), 'height', placeholderHeight, 'px');
        }
      }
    );
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
        this./*OK*/ changeHeight(content./*OK*/ offsetHeight);
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
