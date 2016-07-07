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

import {CSS} from '../../../build/amp-cxense-player-0.1.css';
import {getLengthNumeral, isLayoutSizeDefined} from '../../../src/layout';
import {loadPromise} from '../../../src/event-helper';
import {addParamsToUrl} from '../../../src/url';
import {createLoaderElement} from '../../../src/loader';
import {getDataParamsFromAttributes} from '../../../src/dom';
import {setStyles} from '../../../src/style';

const cxDefaults = {
  apiHost: 'https://api.widget.cx',
  distEmbedHost: 'https://embed.widget.cx',
  debugEmbedHost: 'https://stage-embed.widget.cx',
  distEmbedApp: '/app/player/m4/dist/',
  debugEmbedApp: '/app/player/m4/debug/',
    // can't access the window.top.location.href from the iframe to enable sharing the top url
  attrs: {
    'share.enable': false,
  },
};

class AmpCxense extends AMP.BaseElement {

    /** @override */
    preconnectCallback(onLayout) {
      this.preconnect.url(cxDefaults.apiHost, onLayout);
      this.preconnect.prefetch(this.getIframeSrc_(), 'document');
    }

    /** @override */
    isLayoutSupported(layout) {
      return isLayoutSizeDefined(layout);
    }

    /** @override */
    renderOutsideViewport() {
      return false;
    }

    /** @override */
    buildCallback() {
      this.element.classList.add('amp-cxense-player');

        /** @private @const {object} */
      this.cxDefaults_ = JSON.parse(JSON.stringify(cxDefaults));
        /** @private @const {object} */
      this.attrs_ = this.getDataAttributes_();

      this.cxDefaults_.embedHost = this.attrs_.debug
            ? this.cxDefaults_.debugEmbedHost : this.cxDefaults_.distEmbedHost;
      this.cxDefaults_.embedApp = this.attrs_.debug
            ? this.cxDefaults_.debugEmbedApp : this.cxDefaults_.distEmbedApp;

        /** @private @const {number} */
      this.width_ = getLengthNumeral(this.element.getAttribute('width'));
        /** @private @const {number} */
      this.height_ = getLengthNumeral(this.element.getAttribute('height'));

      if (!this.getPlaceholder()) {
        this.buildImagePoster_();
        this.loading_(true);
      }
    }

    /** @override */
    layoutCallback() {
      const self = this;

        /** @private @const {Element} */
      this.iframe_ = this.element.ownerDocument.createElement('iframe');

      this.iframe_.setAttribute('frameborder', '0');
      this.iframe_.setAttribute('allowfullscreen', 'true');

      this.iframe_.width = this.width_;
      this.iframe_.height = this.height_;

      this.iframe_.src = this.getIframeSrc_();
      setStyles(this.iframe_, {display: 'none'});
      this.element.appendChild(this.iframe_);

        /** @private {boolean} */
      this.mpfReady_ = false;

        /** @private @const {!Promise} */
      this.playerReadyPromise_ = new Promise(resolve => {
            /** @private @const {function()} */
        this.playerReadyResolver_ = iframe => {
          self.mpfReady = true;
          resolve(iframe);
        };
      });

      this.handleFrameMessages_ = this.handleFrameMessages_.bind(this);
      this.getWin().addEventListener('message', this.handleFrameMessages_);

      return loadPromise(this.iframe_)
            .then(() => this.playerReadyPromise_)
            .then(ret => {
              self.loading_(false);
              setStyles(self.iframe_, {display: ''});
              self.applyFillContent(self.iframe_);
              return ret;
            });
    }

    /** @override */
    pauseCallback() {
      this.postMessage_({type: 'mpf.video.pause'});
      return true;
    }

    /** @override */
    unlayoutCallback() {
      this.getWin().removeEventListener('message', this.handleFrameMessages_);
      this.iframe_.setAttribute('src', 'about:blank');
      this.iframe_.parentNode.removeChild(this.iframe_);
      return true;
    }

    /** @private */
    handleFrameMessages_(event) {
      if (event.origin != this.cxDefaults_.embedHost
            || event.source != this.iframe_.contentWindow) {
        return;
      }
      let data;
      if (!event.data || event.data.indexOf('{') != 0) {
        return;  // Doesn't look like JSON.
      }
      try {
        data = JSON.parse(event.data);
      } catch (unused) {
        return; // We only process valid JSON.
      }
      // for now, we only need this event
      if (data.type == 'mpf.ready') {
        this.playerReadyResolver_(this.iframe_);
      }
    }

    /** @private */
    getIframeSrc_() {
      const attrs = this.getDataAttributes_();
      return addParamsToUrl(this.cxDefaults_.embedHost
            + this.cxDefaults_.embedApp
            , attrs);
    }

    /** @private */
    getDataAttributes_() {
      return extend(
            this.cxDefaults_.attrs,
            getDataParamsFromAttributes(this.element, null, 'data-')
        );
    }

    /** @private */
    postMessage_(data) {
      data = extend({
        location: location,
      }, data || {});

      return this.iframe_.contentWindow./*OK*/postMessage(
            JSON.stringify(data), this.cxDefaults_.embedHost
        );
    }

    /** @private */
    buildImagePoster_() {
      const src = this.element.getAttribute('poster')
            || this.element.getAttribute('data-poster');

      if (!src) {
        return;
      }

      const imgPlaceholder = this.getDoc_().createElement('img');
      setStyles(imgPlaceholder, {
        'object-fit': 'cover',
        'visibility': 'hidden',
      });
      imgPlaceholder.src = src;
      imgPlaceholder.width = this.width_;
      imgPlaceholder.height = this.height_;
      this.element.appendChild(imgPlaceholder);
      this.applyFillContent(imgPlaceholder);
      loadPromise(imgPlaceholder)
            .then(() => {
              setStyles(imgPlaceholder, {
                'visibility': '',
              });
            });
    }

    loading_(state) {
      if (!this.loadingElement_) {
            /** @private @const {Element} */
        this.loadingContainer_ = this.getDoc_().createElement('div');
            /** @private @const {Element} */
        this.loadingElement_ = createLoaderElement(this.getDoc_());

        this.loadingContainer_.classList.add('-amp-loading-container');
        this.loadingContainer_.classList.add('amp-hidden');

        this.element.appendChild(this.loadingElement_);
        this.applyFillContent(this.loadingContainer_);
      }
      this.loadingContainer_.classList.toggle('amp-hidden', !state);
      this.loadingElement_.classList.toggle('amp-active', state);
    }

    /** @private */
    getDoc_() {
      return this.getWin().document;
    }
}

AMP.registerElement('amp-cxense-player', AmpCxense, CSS);

function extend(target, source) {
  for (const prop in source) {
    if (target[prop] && typeof source[prop] === 'object') {
      extend(target[prop], source[prop]);
    } else {
      target[prop] = source[prop];
    }
  }
  return target;
}
