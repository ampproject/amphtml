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
import {listenFor} from '../../../src/iframe-helper';
import {Layout} from '../../../src/layout';
import {isExperimentOn} from '../../../src/experiments';

/** @const */
const TAG = 'amp-apester-media';

/**
 * AMP Apester-media
 */
class AmpApesterMedia extends AMP.BaseElement {

  /** @override */
  isLayoutSupported(layout) {
    return layout == Layout.FIXED_HEIGHT;
  }

  /** @override */
  // viewportCallback(inViewport) {
  //   // TODO: if amp left the viewport, send iframe post message that it has been seen.
  // }

  /** @override */
  buildCallback() {


    user().assert(isExperimentOn(this.win, TAG), `Enable ${TAG} experiment`);

    /**
     * @const @private {?String}
     */
    //TODO change to prod with https
    this.displayBaseUrl_ = 'https://renderer.qmerce.local.com';

    /**
     * @const @private {?String}
     */
    this.mediaAttribute_ = user().assert(
      (this.element.getAttribute('data-apester-media-id') ||
      this.element.getAttribute('data-apester-channel-token')),
      'Either the data-apester-media-id or the data-apester-channel-token ' +
      'attributes must be specified for <amp-apester-media> %s',
      this.element);

    /**
     * @private {?Element}
     */
    this.iframe_ = this.element.ownerDocument.createElement('iframe');
    /**
     * @private {?Promise}
     */
    this.iframePromise_ = null;
    this.element.classList.add('-amp-apester-container');
  }

  /** @override */
  firstLayoutCompleted() {
    // Do not hide placeholder
  }

  /** @override */
  layoutCallback() {
    const iframe = this.iframe_;
    iframe.setAttribute('frameborder', '0');
    iframe.setAttribute('allowtransparency', 'true');
    iframe.setAttribute('scrolling', 'no');
    iframe.src = this.displayBaseUrl_ + '/interaction/' + this.mediaAttribute_;
    iframe.height = this.element.getAttribute('height');
    iframe.classList.add('-amp-apester-iframe');
    this.applyFillContent(iframe);

    //TODO remove overflow when 'changeHeight' approved
    const overflow = this.element.ownerDocument.createElement('div');
    overflow.setAttribute('overflow', '');
    overflow.className = '-amp-apester-overflow-container';
    const overflowButton = this.element.ownerDocument.createElement('button');
    overflowButton.className = '-amp-apester-overflow-button';
    overflowButton.innerHTML = 'Start Here';
    overflow.appendChild(overflowButton);
    this.element.appendChild(overflow);


    // TODO: fallback hide loader if there iframe.src return 404
    listenFor(iframe, 'embed-size', data => {

      // We only get the message if and when there is a media to display.
      this.togglePlaceholder(false);
      let height = data.interaction.data.size.height;
      const width = data.interaction.data.size.width;
      height += (data.interaction.layout.directive === 'contest-poll') ? 40 : 0;
      iframe.height = height;
      iframe.width = width;
      const amp = this.element;
      amp.setAttribute('height', height);
      amp.setAttribute('width', width);
      this./*OK*/attemptChangeHeight(height);
    }, /* opt_is3P */false);

    const mutate = state => {
      state.element.classList.add('-amp-apester-iframe-ready');
    };

    const state = {
      element: iframe,
      mutator: mutate,
    };

    // append iframe
    this.element.appendChild(iframe);
    return this.iframePromise_ = loadPromise(iframe).then(() => {
      this.getVsync().runPromise({mutate}, state);
    });
  }


  /** @override */
  createPlaceholderCallback() {
    const img = this.element.ownerDocument.createElement('amp-img');
    const placeholder = this.element.ownerDocument.createElement('div');

    // white background
    placeholder.setAttribute('placeholder', '');
    //placeholder.width = this.element.getAttribute('width');
    placeholder.height = this.element.getAttribute('height');
    placeholder.className = '-amp-apester-loader-container';

    // loading gif
    img.className = '-amp-apester-loader';
    img.setAttribute('src', 'https://images.apester.com/images%2Floader.gif');
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
      this.removeElement(this.iframe_);
      this.iframe_ = null;
      this.iframePromise_ = null;
    }
    return true;  // Call layoutCallback again.
  }

}

AMP.registerElement('amp-apester-media', AmpApesterMedia, CSS);
