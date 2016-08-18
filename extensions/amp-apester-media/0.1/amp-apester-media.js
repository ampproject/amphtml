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
import {user} from '../../../src/log';
import {loadPromise} from '../../../src/event-helper';
import {Layout} from '../../../src/layout';
import {isExperimentOn} from '../../../src/experiments';
import {removeElement} from '../../../src/dom';
import {vsyncFor} from '../../../src/vsync';

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
    return layout == Layout.FIXED_HEIGHT;
  }

  /** @override */
  viewportCallback(inViewport) {
    if (inViewport && !this.seen_) {
      if (this.iframe_.contentWindow) {
        console.log('seen');
        this.seen_ = true;
        this.iframe_.contentWindow./*OK*/postMessage('interaction seen', '*');
      }
    }
  }

  /** @override */
  buildCallback() {

    // EXPERIMENT
    user().assert(isExperimentOn(this.win, TAG), `Enable ${TAG} experiment`);

    /**
     * @const @private {?String}
     */
    this.rendererBaseUrl_ = 'https://renderer.qmerce.com';

    /**
     * @const @private {?String}
     */
    this.displayBaseUrl_ = 'https://display.apester.com';

    /**
     * @const @private {?String}
     */
    this.mediaAttribute_ = user().assert(
      (this.element.getAttribute('data-apester-media-id') ||
      (this.random = this.element.getAttribute('data-apester-channel-token'))),
      'Either the data-apester-media-id or the data-apester-channel-token '
      + 'attributes must be specified for <amp-apester-media> %s',
      this.element);

    /**
     * @private {?Element}
     */
    this.iframe_ = this.element.ownerDocument.createElement('iframe');

    /**
     * @private {?Promise}
     */
    this.iframePromise_ = null;

    /**
     * @private {?Promise}
     */
    this.seen_ = false;
    this.element.classList.add('-amp-apester-container');
  }

  /** @override */
  firstLayoutCompleted() {
    // Do not hide placeholder
  }

  buildUrl_() {
    const suffix = (this.random) ? '/tokens/' + this.mediaAttribute_
    + '/interactions/random' : '/interactions/' + this.mediaAttribute_
    + '/display';
    return this.displayBaseUrl_ + suffix;
  }

  queryMedia_() {
    return new Promise(function(resolve, reject) {
      const req = new XMLHttpRequest();
      const url = this.buildUrl_();
      req.open('GET', url);
      req.onload = function() {
        if (req.status == 200) {
          resolve(JSON.parse(req.responseText).payload);
        } else {
          reject(Error(req.statusText));
        }
      };

      // network errors
      req.onerror = function() {
        reject(Error('Network Error'));
      };
      req.send();
    }.bind(this));
  }

  constructUrlFromMedia_(id) {
    return this.rendererBaseUrl_ + '/interaction/' + id;
  }

  constructIframe_(src) {
    const iframe = this.iframe_;
    iframe.setAttribute('frameborder', '0');
    iframe.setAttribute('allowtransparency', 'true');
    iframe.setAttribute('scrolling', 'no');
    iframe.src = src;
    iframe.height = this.element.getAttribute('height');
    iframe.classList.add('-amp-apester-iframe');
    this.applyFillContent(iframe);
    return iframe;
  }

  //TODO remove overflow when 'changeHeight' PR approved
  constructOverflow_() {
    const overflow = this.element.ownerDocument.createElement('div');
    overflow.setAttribute('overflow', '');
    overflow.className = '-amp-apester-overflow-container';
    const overflowButton = this.element.ownerDocument.createElement('button');
    overflowButton.className = '-amp-apester-overflow-button';
    overflowButton.innerHTML = 'Start Here';
    overflow.appendChild(overflowButton);
    return overflow;
  }

  /** @override */
  layoutCallback() {
    return this.queryMedia_()
      .then(media => {
        const src = this.constructUrlFromMedia_(media.interactionId);
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
        return this.iframePromise_ = loadPromise(iframe).then(() => {
          vsyncFor(this.win).runPromise({mutate}, state);
          return media;
        });
      }, () => {
        return undefined;
      }).then(media => {
        // hide placeholder
        this.togglePlaceholder(false);
        let height = 0;
        if (media) {
          height = media.data.size.height;
          const width = media.data.size.width;
          height += (media.layout.directive === 'contest-poll') ? 40 : 0;
          const amp = this.element;
          amp.setAttribute('height', height);
          amp.setAttribute('width', width);
        }

        //TODO: PR change from attemptChangeHeight to changeHeight
        this./*OK*/attemptChangeHeight(height);
      });
  }

  /** @override */
  createPlaceholderCallback() {
    const img = this.element.ownerDocument.createElement('amp-img');
    const placeholder = this.element.ownerDocument.createElement('div');
    placeholder.setAttribute('placeholder', '');
    placeholder.height = this.element.getAttribute('height');
    placeholder.className = '-amp-apester-loader-container';
    img.className = '-amp-apester-loader';
    img.setAttribute('src',
                     'https://images.apester.com/images%2Floader.gif');
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
    return true;  // Call laycxoutCallback again.
  }
}

AMP.registerElement('amp-apester-media', AmpApesterMedia, CSS);
