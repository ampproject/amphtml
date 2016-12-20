/**
 * Copyright 2016 The AMP HTML Authors.
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


import {CSS} from '../../../build/amp-apester-media-0.1.css';
import {user, dev} from '../../../src/log';
import {getLengthNumeral, isLayoutSizeDefined} from '../../../src/layout';
import {isExperimentOn} from '../../../src/experiments';
import {removeElement} from '../../../src/dom';
import {vsyncFor} from '../../../src/vsync';
import {xhrFor} from '../../../src/xhr';


/** @const */
const TAG = 'amp-apester-media';

/**
 * AMP Apester-media
 */
class AmpApesterMedia extends AMP.BaseElement {
  /** @override */
  preconnectCallback(onLayout) {
    this.preconnect.url(this.displayBaseUrl_, onLayout);
    this.preconnect.url(this.rendererBaseUrl_, onLayout);
  }

  /** @override */
  isLayoutSupported(layout) {
    return isLayoutSizeDefined(layout);
  }

  /** @override */
  viewportCallback(inViewport) {
    if (inViewport && !this.seen_) {
      if (this.iframe_) {
        dev().fine(TAG, 'media seen');
        this.seen_ = true;
        this.iframe_.contentWindow./*OK*/postMessage('interaction seen', '*');
      }
    }
    if (this.getPlaceholder() && !this.ready_) {
      this.togglePlaceholder(inViewport);
    }
  }

  /** @override */
  buildCallback() {

    // EXPERIMENT
    user().assert(isExperimentOn(this.win, TAG), `Enable ${TAG} experiment`);
    const width = this.element.getAttribute('width');
    const height = this.element.getAttribute('height');

    /**
     *  @private @const {number}
     *  */
    this.width_ = getLengthNumeral(width);

    /**
     * @private @const {number}
     * */
    this.height_ = getLengthNumeral(height);

    /**
     * @const @private {string}
     */
    this.rendererBaseUrl_ = 'https://renderer.qmerce.com';

    /**
     * @const @private {string}
     */
    this.displayBaseUrl_ = 'https://display.apester.com';

    /**
     * @const @private {string}
     */
    this.loaderUrl_ = 'https://images.apester.com/images%2Floader.gif';

    /**
     * @private {boolean}
     */
    this.random_ = false;

    /**
     * @const @private {string}
     */
    this.mediaAttribute_ = user().assert(
        (this.element.getAttribute('data-apester-media-id') ||
         (this.random_ =
             this.element.getAttribute('data-apester-channel-token'))),
        'Either the data-apester-media-id or the data-apester-channel-token ' +
        'attributes must be specified for <amp-apester-media> %s',
        this.element);

    /**
     * @private {?Element}
     */
    this.iframe_ = null;

    /**
     * @private {?Promise}
     */
    this.iframePromise_ = null;

    /**
     * @private {boolean}
     */
    this.seen_ = false;

    /**
     * @private {boolean}
     */
    this.ready_ = false;
  }

  /** @override */
  firstLayoutCompleted() {
    this.viewportCallback(this.isInViewport());

    // Do not hide placeholder
  }

  /**
   * @return {string}
   **/
  buildUrl_() {
    const encodedMediaAttribute = encodeURIComponent(this.mediaAttribute_);
    const suffix = (this.random_) ?
        `/tokens/${encodedMediaAttribute}/interactions/random` :
        `/interactions/${encodedMediaAttribute}/display`;
    return `${this.displayBaseUrl_}${suffix}`;
  }

  /**
   * @return {!Promise<!JSONType>}
   **/
  queryMedia_() {
    const url = this.buildUrl_();
    return xhrFor(this.win).fetchJson(url, {
      requireAmpResponseSourceOrigin: false,
    });
  }

  /** @param {string} id
   * @return {string}
   * */
  constructUrlFromMedia_(id) {
    return `${this.rendererBaseUrl_}/interaction/${encodeURIComponent(id)}`;
  }

  /** @param {string} src
   * @return {!Element}
   */
  constructIframe_(src) {
    const iframe = this.element.ownerDocument.createElement('iframe');
    iframe.setAttribute('frameborder', '0');
    iframe.setAttribute('allowtransparency', 'true');
    iframe.setAttribute('scrolling', 'no');
    iframe.src = src;
    iframe.height = this.height_;
    iframe.width = this.width_;
    iframe.classList.add('amp-apester-iframe');
    this.applyFillContent(iframe);
    return iframe;
  }

  /**
   * @return {!Element}
   */
  constructOverflow_() {
    const overflow = this.element.ownerDocument.createElement('div');
    overflow.setAttribute('overflow', '');
    overflow.className = 'amp-apester-overflow';
    const overflowButton = this.element.ownerDocument.createElement('button');
    overflowButton.textContent = 'Full Size';
    overflow.appendChild(overflowButton);
    return overflow;
  }

  /** @override */
  layoutCallback() {
    this.element.classList.add('amp-apester-container');
    return this.queryMedia_()
        .then(response => {
          const media = response.payload;
          const src = this.constructUrlFromMedia_(
              media.interactionId);
          const iframe = this.constructIframe_(src);
          const overflow = this.constructOverflow_();
          const mutate = state => {
            state.element.classList.add('-amp-apester-iframe-ready');
          };
          const state = {
            element: iframe, mutator: mutate,
          };
          this.iframe_ = iframe;
          this.element.appendChild(overflow);
          this.element.appendChild(iframe);
          return this.iframePromise_ = this.loadPromise(iframe).then(() => {
            vsyncFor(this.win).runPromise({mutate}, state);
            return media;
          });
        }, error => {
          dev().error(TAG, 'Display', error);
          return undefined;
        }).then(media => {
          this.togglePlaceholder(false);
          this.ready_ = true;
          const height = 0 || media.data.size.height;
          if (height != this.height_) {
            this.height_ = height;
            if (this.random_) {
              this./*OK*/attemptChangeHeight(height);
            } else {
              this./*OK*/changeHeight(height);
            }
          }
        });
  }

  /** @override */
  createPlaceholderCallback() {
    const img = this.element.ownerDocument.createElement('amp-img');
    const placeholder = this.element.ownerDocument.createElement('div');
    placeholder.setAttribute('placeholder', '');
    placeholder.className = 'amp-apester-loader';
    img.setAttribute('src', this.loaderUrl_);
    img.setAttribute('layout', 'fill');
    img.setAttribute('noloading', '');
    placeholder.appendChild(img);
    return placeholder;
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
      this.iframePromise_ = null;
    }
    return true; //Call layoutCallback again.
  }
}

AMP.registerElement('amp-apester-media', AmpApesterMedia, CSS);
