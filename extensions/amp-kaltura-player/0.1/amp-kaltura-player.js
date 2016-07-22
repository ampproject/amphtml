/**
 * Copyright 2016 The AMP HTML Authors. All Rights Reserved.
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

import {isLayoutSizeDefined} from '../../../src/layout';
import {loadPromise} from '../../../src/event-helper';
import {addParamsToUrl} from '../../../src/url';
import {getDataParamsFromAttributes} from '../../../src/dom';
import {setStyles} from '../../../src/style';
import {user} from '../../../src/log';

class AmpKaltura extends AMP.BaseElement {

  /** @override */
  createdCallback() {
    this.preconnect.url('https://cdnapisec.kaltura.com');
  }

  /** @override */
  isLayoutSupported(layout) {
    return isLayoutSizeDefined(layout);
  }

  /** @override */
  buildCallback() {
    if (!this.getPlaceholder()) {
      this.buildImagePlaceholder_();
    }
  }

  /** @override */
  layoutCallback() {
    const width = this.element.getAttribute('width');
    const height = this.element.getAttribute('height');
    const partnerid = user.assert(
        this.element.getAttribute('data-partner'),
        'The data-partner attribute is required for <amp-kaltura-player> %s',
        this.element);
    const uiconfid = this.element.getAttribute('data-uiconf') ||
    this.element.getAttribute('data-uiconf-id') ||
      'default';
    const entryid = this.element.getAttribute('data-entryid') || 'default';
    const iframe = this.element.ownerDocument.createElement('iframe');
    let src = `https://cdnapisec.kaltura.com/p/${encodeURIComponent(partnerid)}/sp/${encodeURIComponent(partnerid)}00/embedIframeJs/uiconf_id/${encodeURIComponent(uiconfid)}/partner_id/${encodeURIComponent(partnerid)}?iframeembed=true&playerId=kaltura_player_amp&entry_id=${encodeURIComponent(entryid)}`;
    const params = getDataParamsFromAttributes(
        this.element, key => `flashvars[${key}]`);
    src = addParamsToUrl(src, params);
    iframe.setAttribute('frameborder', '0');
    iframe.setAttribute('allowfullscreen', 'true');
    iframe.src = src;
    this.applyFillContent(iframe);
    iframe.width = width;
    iframe.height = height;
    this.element.appendChild(iframe);
      /** @private {?Element} */
    this.iframe_ = iframe;
    return loadPromise(iframe);
  }

  /** @private */
  buildImagePlaceholder_() {
    const imgPlaceholder = new Image();

    setStyles(imgPlaceholder, {
      'object-fit': 'cover',
      'visibility': 'hidden',
    });
    const width = this.element.getAttribute('width');
    const height = this.element.getAttribute('height');
    const partnerid = user.assert(
      this.element.getAttribute('data-partner'),
      'The data-partner attribute is required for <amp-kaltura-player> %s',
      this.element);
    const entryid = this.element.getAttribute('data-entryid') || 'default';
    let src = `https://cdnapisec.kaltura.com/p/${encodeURIComponent(partnerid)}/thumbnail/entry_id/${encodeURIComponent(entryid)}`;
    if (width) {
      src += `/width/${width}`;
    }
    if (height) {
      src += `/height/${height}`;
    }

    imgPlaceholder.src = src;
    imgPlaceholder.setAttribute('placeholder', '');
    imgPlaceholder.width = this.width_;
    imgPlaceholder.height = this.height_;
    imgPlaceholder.setAttribute('referrerpolicy', 'origin');

    this.element.appendChild(imgPlaceholder);
    this.applyFillContent(imgPlaceholder);

    loadPromise(imgPlaceholder).then(() => {
      setStyles(imgPlaceholder, {
        'visibility': '',
      });
    });
  }

  /** @override */
  pauseCallback() {
    if (this.iframe_ && this.iframe_.contentWindow) {
      this.iframe_.contentWindow./*OK*/postMessage(JSON.stringify({
        'method': 'pause' ,
        'value': '' ,
      }) , '*');
    }
  }

};

AMP.registerElement('amp-kaltura-player', AmpKaltura);
