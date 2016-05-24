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
import {isLayoutSizeDefined} from '../../../src/layout';
import {loadPromise} from '../../../src/event-helper';
import {addParamsToUrl} from '../../../src/url';
import {dashToCamelCase} from '../../../src/string';
import {getDataParamsFromAttributes} from '../../../src/dom';
import {setStyles} from '../../../src/style';

const cxDefaults = {
  apiHost: 'https://api.widget.cx',
  embedHost: 'https://embed.widget.cx',
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
    buildCallback() {
      this.element.classList.add('amp-cxense-player');

      /** @private @const {object} */
      this.cxDefaults_ = JSON.parse(JSON.stringify(cxDefaults));

      if (!this.getPlaceholder()) {
        this.buildWidgetPlaceholder_();
      }
    }

    /** @override */
    layoutCallback() {
      const self = this;

        /** @private @const {Element} */
      this.iframe_ = this.element.ownerDocument.createElement('iframe');

      this.iframe_.setAttribute('frameborder', '0');
      this.iframe_.setAttribute('allowfullscreen', 'true');
      this.iframe_.width = this.element.getAttribute('width');
      this.iframe_.height = this.element.getAttribute('height');
      this.iframe_.src = this.getIframeSrc_();
      setStyles(this.iframe_, {display: 'none'});

      this.element.appendChild(this.iframe_);

      return loadPromise(this.iframe_).then(ret => {
        if (self.placeholder_) {
          setStyles(this.placeholder_, {display: 'none'});
        }
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
      this.iframe_.setAttribute('src', 'about:blank');
      this.iframe_.parentNode.removeChild(this.iframe_);
      return true;
    }

    /** @private */
    getIframeSrc_() {
      const attrs = this.getDataAttributes_();
      return addParamsToUrl(this.cxDefaults_.embedHost
            + (attrs.debug
                ? this.cxDefaults_.debugEmbedApp
                : this.cxDefaults_.distEmbedApp
              )
            , attrs);
    }

    /** @private */
    getDataAttributes_() {
      return extend(this.cxDefaults_.attrs, getDataParamsFromAttributes(this.element, null, 'data-'));
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
    buildWidgetPlaceholder_() {
      const doc = this.getDoc_();

      this.placeholder_ = doc.createElement('div');
      this.placeholder_.className = 'amp-cxense-player-placeholder';

      const spinner = doc.createElement('div');
      spinner.className = 'amp-cxense-player-loader';
      spinner.appendChild(doc.createElement('div'));
      spinner.appendChild(doc.createElement('div'));
      spinner.appendChild(doc.createElement('div'));

      this.placeholder_.appendChild(spinner);
      this.element.appendChild(this.placeholder_);
      this.applyFillContent(this.placeholder_);
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
