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
import {addParamsToUrl} from '../../../src/url';
import {getDataParamsFromAttributes} from '../../../src/dom';
import {dict} from '../../../src/utils/object';
import {user} from '../../../src/log';

class AmpKaltura extends AMP.BaseElement {

  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {?HTMLIFrameElement} */
    this.iframe_ = null;

    /** @private {string} */
    this.partnerId_ = '';

    /** @private {string} */
    this.entryId_ = '';
  }

  /**
  * @param {boolean=} opt_onLayout
  * @override
  */
  preconnectCallback(opt_onLayout) {
    this.preconnect.url('https://cdnapisec.kaltura.com', opt_onLayout);
  }

  /** @override */
  isLayoutSupported(layout) {
    return isLayoutSizeDefined(layout);
  }

  /** @override */
  buildCallback() {
    this.partnerId_ = user().assert(
        this.element.getAttribute('data-partner'),
        'The data-partner attribute is required for <amp-kaltura-player> %s',
        this.element);

    this.entryId_ = this.element.getAttribute('data-entryid') || 'default';
  }

  /** @override */
  layoutCallback() {
    const uiconfId = this.element.getAttribute('data-uiconf') ||
        this.element.getAttribute('data-uiconf-id') || 'default';
    const iframe = this.element.ownerDocument.createElement('iframe');
    let src = `https://cdnapisec.kaltura.com/p/${encodeURIComponent(this.partnerId_)}/sp/${encodeURIComponent(this.partnerId_)}00/embedIframeJs/uiconf_id/${encodeURIComponent(uiconfId)}/partner_id/${encodeURIComponent(this.partnerId_)}?iframeembed=true&playerId=kaltura_player_amp&entry_id=${encodeURIComponent(this.entryId_)}`;
    const params = getDataParamsFromAttributes(
        this.element, key => `flashvars[${key}]`);
    src = addParamsToUrl(src, params);
    iframe.setAttribute('frameborder', '0');
    iframe.setAttribute('allowfullscreen', 'true');
    iframe.src = src;
    this.applyFillContent(iframe);
    this.element.appendChild(iframe);
    this.iframe_ = iframe;
    return this.loadPromise(iframe);
  }

  /** @override */
  createPlaceholderCallback() {
    const placeholder = this.win.document.createElement('amp-img');
    const width = this.element.getAttribute('width');
    const height = this.element.getAttribute('height');
    let src = `https://cdnapisec.kaltura.com/p/${encodeURIComponent(this.partnerId_)}/thumbnail/entry_id/${encodeURIComponent(this.entryId_)}`;
    if (width) {
      src += `/width/${width}`;
    }
    if (height) {
      src += `/height/${height}`;
    }
    placeholder.setAttribute('src', src);
    placeholder.setAttribute('layout', 'fill');
    placeholder.setAttribute('placeholder', '');
    placeholder.setAttribute('referrerpolicy', 'origin');
    return placeholder;
  }

  /** @override */
  pauseCallback() {
    if (this.iframe_ && this.iframe_.contentWindow) {
      this.iframe_.contentWindow./*OK*/postMessage(JSON.stringify(dict({
        'method': 'pause' ,
        'value': '' ,
      })) , '*');
    }
  }

};

AMP.registerElement('amp-kaltura-player', AmpKaltura);
