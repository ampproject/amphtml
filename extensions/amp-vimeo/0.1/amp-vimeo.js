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
import {Services} from '../../../src/services';
import {dict} from '../../../src/utils/object';
import {htmlFor} from '../../../src/static-template';
import {
  installVideoManagerForDoc,
} from '../../../src/service/video-manager-impl';
import {isLayoutSizeDefined} from '../../../src/layout';
import {user} from '../../../src/log';


/** @implements {../../../src/video-interface.VideoInterface} */
class AmpVimeo extends AMP.BaseElement {

  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);
    /** @private {?Element} */
    this.iframe_ = null;
  }

  /**
   * @param {boolean=} onLayout
   * @override
   */
  preconnectCallback(onLayout) {
    this.preconnect.url('https://player.vimeo.com', onLayout);
    // Host that Vimeo uses to serve poster frames needed by player.
    this.preconnect.url('https://i.vimeocdn.com', onLayout);
    // Host that Vimeo uses to serve JS, CSS and other assets needed.
    this.preconnect.url('https://f.vimeocdn.com', onLayout);
  }

  /**
   * @override
   * @inheritdoc
   */
  isLayoutSupported(layout) {
    return isLayoutSizeDefined(layout);
  }

  /**
   * @override
   * @inheritdoc
   */
  buildCallback() {
    const {element} = this;
    installVideoManagerForDoc(element);
    Services.videoManagerForDoc(element).register(this);
  }

  /**
   * @override
   * @inheritdoc
   */
  layoutCallback() {
    const videoid = user().assert(
        this.element.getAttribute('data-videoid'),
        'The data-videoid attribute is required for <amp-vimeo> %s',
        this.element);
    // See
    // https://developer.vimeo.com/player/embedding
    const {element} = this;
    const iframe = htmlFor(element)`
        <iframe frameborder=0 alllowfullscreen=true></iframe>`;
    const encodedVideoId = encodeURIComponent(videoid);
    iframe.src = `https://player.vimeo.com/video/${encodedVideoId}`;
    this.applyFillContent(iframe);
    element.appendChild(iframe);
    this.iframe_ = iframe;
    return this.loadPromise(iframe);
  }

  /**
   * @override
   * @inheritdoc
   */
  pauseCallback() {
    this.pause();
  }

  /**
   * @override
   * @inheritdoc
   */
  pause() {
    this.sendCommand_('pause');
  }

  /**
   * @override
   * @inheritdoc
   */
  play() {
    this.sendCommand_('play');
  }

  /**
   * @override
   * @inheritdoc
   */
  preimplementsMediaSessionAPI() {
    // TODO(alanorozco)
    return false;
  }

  /**
   * @param {string} method
   * @param {?Object|string=} optParams
   * @private
   */
  sendCommand_(method, optParams = null) {
    // See
    // https://developer.vimeo.com/player/js-api
    const iframe = this.iframe_;
    const {contentWindow} = iframe;
    if (!iframe || !contentWindow) {
      return;
    }
    const message = {method};
    if (optParams) {
      message.value = optParams;
    }
    contentWindow./*OK*/postMessage(JSON.stringify(message), '*');
  }
}


AMP.extension('amp-vimeo', '0.1', AMP => {
  AMP.registerElement('amp-vimeo', AmpVimeo);
});
