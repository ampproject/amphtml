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
import {setStyle} from '../../../src/style';
import {user} from '../../../src/log';

class AmpViqeo extends AMP.BaseElement {

  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    this.playerWrapperElement_ = null;
  }

  /**
  * @param {boolean=} opt_onLayout
  * @override
  */
  preconnectCallback(opt_onLayout) {
    this.preconnect.url('https://static.viqeo.tv', opt_onLayout);
    this.preconnect.url('https://stage.embed.viqeo.tv', opt_onLayout);
  }

  /** @override */
  isLayoutSupported(layout) {
    return isLayoutSizeDefined(layout);
  }

  /** @override */
  buildCallback() {
  }

  /** @override */
  createPlaceholderCallback() {
    return null;
  }


  /** @override */
  layoutCallback() {
    const videoId = user().assert(
        this.element.getAttribute('data-videoId'),
        'The data-videoId attribute is required for <amp-viqeo> %s',
        this.element);

    const profileId = user().assert(
        this.element.getAttribute('data-profileId'),
        'The data-profileId attribute is required for <amp-viqeo> %s',
        this.element);

    const kindIsProd = this.element.getAttribute('data-kind') !== 'stage';

    const iframeStyle = this.element.getAttribute('data-iframe-style')
      || 'position: absolute';
    const iframeHeight = this.element.getAttribute('data-iframe-height')
      || '100%';
    const iframeWidth = this.element.getAttribute('data-iframe-width')
      || '100%';

    let viqeoPlayerUrl = this.element.getAttribute('data-player-url');
    viqeoPlayerUrl =
      (viqeoPlayerUrl
        && viqeoPlayerUrl.length && decodeURI(viqeoPlayerUrl)
      )
      ||
      (kindIsProd ? 'https://cdn.viqeo.tv/embed'
        : 'https://stage.embed.viqeo.tv'
      );

    let scriptPlayerInit = this.element.getAttribute('data-script-url');
    scriptPlayerInit =
      (scriptPlayerInit
        && scriptPlayerInit.length && decodeURI(scriptPlayerInit)
      )
      ||
      (kindIsProd ? 'https://cdn.viqeo.tv/js/vq_player_init.js'
        : 'https://static.viqeo.tv/js/vq_player_init.js?branch=dev1'
      );

    const scr = this.element.ownerDocument.createElement('script');
    scr.async = true;
    scr.src = scriptPlayerInit;
    this.element.appendChild(scr);

    const mark = this.element.ownerDocument.createElement('div');

    setStyle(mark, 'position', 'relative');
    setStyle(mark, 'width', '100%');
    setStyle(mark, 'height', '0');
    setStyle(mark, 'paddingBottom', '100%');
    mark.setAttribute('data-vnd', videoId);
    mark.setAttribute('data-profile', profileId);
    mark.classList.add('viqeo-embed');

    const iframe = this.element.ownerDocument.createElement('iframe');
    iframe.setAttribute('width', iframeWidth);
    iframe.setAttribute('height', iframeHeight);
    iframe.setAttribute('style', iframeStyle);
    iframe.setAttribute('frameBorder', '0');
    iframe.setAttribute('allowFullScreen', '');
    iframe.src = `${viqeoPlayerUrl}/?vid=${videoId}`;

    mark.appendChild(iframe);

    const wrapper = this.element.ownerDocument.createElement('div');
    wrapper.appendChild(mark);

    this.element.appendChild(wrapper);
    this.applyFillContent(wrapper);

    return loadPromise(iframe);
  }
}

AMP.extension('amp-viqeo', '0.1', AMP => {
  AMP.registerElement('amp-viqeo', AmpViqeo);
});
