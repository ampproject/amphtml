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

import {Services} from '../../../src/services';
import {installVideoManagerForDoc} from '../../../src/service/video-manager-impl';
import {isLayoutSizeDefined} from '../../../src/layout';
import {removeElement} from '../../../src/dom';
import {setStyle} from '../../../src/style';
import {user} from '../../../src/log';

/**
 * @implements {../../../src/video-interface.VideoInterface}
 */
class AmpViqeo extends AMP.BaseElement {

  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {?string}  */
    this.videoId_ = '';

    this.profileId_ = '';

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
    this.videoId_ = user().assert(
        this.element.getAttribute('data-videoId'),
        'The data-videoId attribute is required for <amp-viqeo> %s',
        this.element);

    this.profileId_ = user().assert(
        this.element.getAttribute('data-profileId'),
        'The data-profileId attribute is required for <amp-viqeo> %s',
        this.element);

    installVideoManagerForDoc(this.element);
    Services.videoManagerForDoc(this.element).register(this);
  }

  /** @override */
  createPlaceholderCallback() {
    return null;
  }


  /** @override */
  layoutCallback() {
    const {videoId_, profileId_} = this;
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
    mark.setAttribute('data-vnd', videoId_);
    mark.setAttribute('data-profile', profileId_);
    mark.classList.add('viqeo-embed');

    const iframe = this.element.ownerDocument.createElement('iframe');
    iframe.setAttribute('width', iframeWidth);
    iframe.setAttribute('height', iframeHeight);
    iframe.setAttribute('style', iframeStyle);
    iframe.setAttribute('frameBorder', '0');
    iframe.setAttribute('allowFullScreen', '');
    iframe.src = `${viqeoPlayerUrl}/?vid=${videoId_}`;

    mark.appendChild(iframe);

    const wrapper = this.element.ownerDocument.createElement('div');
    setStyle(wrapper, 'position', 'absolute');
    setStyle(wrapper, 'top', '0');
    setStyle(wrapper, 'left', '0');
    wrapper.appendChild(mark);

    this.element.appendChild(wrapper);
    this.applyFillContent(wrapper);

    this.playerWrapperElement_ = wrapper;
    return Promise.resolve();
  }

  /** @override */
  unlayoutCallback() {
    if (this.playerWrapperElement_) {
      removeElement(this.playerWrapperElement_);
      this.playerWrapperElement_ = null;
    }
    return true;
  }

  /** @override */
  pauseCallback() {
    this.pause();
  }

  // VideoInterface Implementation. See ../src/video-interface.VideoInterface

  /**
   * @override
   */
  supportsPlatform() {
    return true;
  }

  /** @override */
  isInteractive() {
    return true;
  }

  /** @override */
  play() {}

  /** @override */
  pause() {}

  /** @override */
  mute() {}

  /** @override */
  unmute() {}

  /** @override */
  showControls() {
    // Not supported.
  }

  /** @override */
  hideControls() {
    // Not supported.
  }

  /** @override */
  fullscreenEnter() {}

  /** @override */
  fullscreenExit() {}

  /** @override */
  isFullscreen() {}

  /** @override */
  getMetadata() {
    // Not implemented
  }

  /** @override */
  preimplementsMediaSessionAPI() {
    return false;
  }

  /** @override */
  getCurrentTime() {
    // Not supported.
    return 0;
  }

  /** @override */
  getDuration() {
    // Not supported.
    return 1;
  }

  /** @override */
  getPlayedRanges() {
    // Not supported.
    return [];
  }
}


AMP.extension('amp-viqeo', '0.1', AMP => {
  AMP.registerElement('amp-viqeo', AmpViqeo);
});
