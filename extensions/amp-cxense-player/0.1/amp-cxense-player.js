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
import {listenForOnce, postMessage} from '../../../src/iframe-helper';
import {getDataParamsFromAttributes, removeElement} from '../../../src/dom';
import {setStyles} from '../../../src/style';

const cxDefaults = {
  apiHost: 'https://api.widget.cx',
  distEmbedHost: 'https://embed.widget.cx',
  debugEmbedHost: 'https://stage-embed.widget.cx',
  distEmbedApp: '/app/player/m4/dist/',
  debugEmbedApp: '/app/player/m4/debug/',
  poster: 'https://i.imgur.com/dptGg1l.png',

  // for items without landerLink,
  // we can't access the window.top.location.href from the iframe
  // to enable sharing the top url
  attrs: {
    'share.enable': false,
  },
};

class AmpCxense extends AMP.BaseElement {

    /** @override */
    preconnectCallback(onLayout) {
      this.preconnect.url(cxDefaults.apiHost, onLayout);
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

    }

    /** @override */
    createPlaceholderCallback() {
      const src = this.element.getAttribute('poster')
            || this.element.getAttribute('data-poster')
            || this.cxDefaults_.poster;

      const placeholder = this.getWin().document.createElement('div');
      placeholder.setAttribute('placeholder', '');
      const image = this.getWin().document.createElement('amp-img');
      image.setAttribute('src', src);
      image.setAttribute('layout', 'fill');
      this.propagateAttributes(['alt'], image);
      placeholder.appendChild(image);
      return placeholder;
    }

    /** @override */
    layoutCallback() {
        /** @private @const {Element} */
      this.iframe_ = this.element.ownerDocument.createElement('iframe');

      this.iframe_.setAttribute('frameborder', '0');
      this.iframe_.setAttribute('allowfullscreen', 'true');

      this.iframe_.width = this.width_;
      this.iframe_.height = this.height_;

      this.iframe_.src = this.getIframeSrc_();
      setStyles(this.iframe_, {display: 'none'});

        /** @private {boolean} */
      this.mpfReady_ = false;

        /** @private @const {!Promise} */
      this.playerReadyPromise_ = new Promise(resolve => {
            /** @private @const {function()} */
        this.playerReadyResolver_ = iframe => {
          this.mpfReady = true;
          resolve(iframe);
        };
      });
      listenForOnce(this.iframe_, 'mpf.ready', () => {
        this.playerReadyResolver_();
      });
      this.element.appendChild(this.iframe_);

      return loadPromise(this.iframe_)
            // todo: remove this timeout after OVP release
            // that has the modified frame AMP postMessage support
            // for a more accurate loading time
            // this resolves whether mpf.ready fires or not after 2s
            .then(() => {
              setTimeout(() => {
                if (!this.mpfReady_) {
                  this.playerReadyResolver_(this.iframe_);
                }
              }, 2000);
            })
            .then(() => this.playerReadyPromise_)
            .then(iframe_ => {
              setStyles(iframe_, {display: ''});
              this.applyFillContent(iframe_);
              return iframe_;
            });
    }

    /** @override */
    pauseCallback() {
      postMessage(
        this.iframe_,
        'mpf.video.pause',
        {args: []},
        this.cxDefaults_.embedHost
      );
      return true;
    }

    /** @override */
    unlayoutCallback() {
      removeElement(this.iframe_);
      return true;
    }

    /** @private */
    getIframeSrc_() {
      return addParamsToUrl(this.cxDefaults_.embedHost
            + this.cxDefaults_.embedApp
            , this.attrs_);
    }

    /** @private */
    getDataAttributes_() {
      return extend(
            this.cxDefaults_.attrs,
            getDataParamsFromAttributes(this.element, null, 'data-')
        );
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
