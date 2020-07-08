/**
 * Copyright 2020 The AMP HTML Authors. All Rights Reserved.
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

import {Layout} from '../../../src/layout';
import {Services} from '../../../src/services';
import {addParamsToUrl} from '../../../src/url';
import {parseJson} from '../../../src/json';
import {removeElement} from '../../../src/dom';
import {userAssert} from '../../../src/log';

/** @private @const {!string} */
const TAG = 'amp-viralize-player';

export class AmpViralizePlayer extends AMP.BaseElement {
  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {string} */
    this.zid_ = null;

    /** @private {object} */
    this.extraParams_ = null;

    /** @private {Element} */
    this.container_ = null;
  }

  /** @override */
  buildCallback() {
    this.zid_ = userAssert(
      this.element.getAttribute('data-zid'),
      `The data-zid attribute is required for <${TAG}> %s`,
      this.element
    );
    this.extraParams_ = parseJson(
      this.element.getAttribute('data-extra') || '{}'
    );
    this.extraParams_['vip_mode'] = 'no';
  }

  /** @override */
  preconnectCallback(opt_onLayout) {
    Services.preconnectFor(this.win).url(
      this.getAmpDoc(),
      this.getPlayerUrl_(this.zid_),
      opt_onLayout
    );
  }

  /** @override */
  layoutCallback() {
    this.container_ = this.element.ownerDocument.createElement('div');
    this.element.appendChild(this.container_);
    this.applyFillContent(this.container_);

    const script = this.element.ownerDocument.createElement('script');
    script.src = this.getPlayerUrl_(this.zid_);
    script.async = true;
    this.container_.appendChild(script);

    return new Promise((resolve) => {
      const {win} = this.getAmpDoc();
      win.vpt = win.vpt || {};
      win.vpt.queue = win.vpt.queue || [];

      win.vpt.queue.push(function () {
        // This is always the first event emitted by the player
        win.vpt.on(win.vpt.EVENTS.AD_SESSION_START, function () {
          resolve();
        });
      });
    });
  }

  /** @override */
  unlayoutCallback() {
    if (this.container_) {
      removeElement(this.container_);
      this.container_ = null;
    }
    return true;
  }

  /** @override */
  isLayoutSupported(layout) {
    return layout === Layout.RESPONSIVE;
  }

  /**
   * Evaluate the player url
   * @param {string} zid
   * @return {string}
   * @private
   */
  getPlayerUrl_(zid) {
    return addParamsToUrl(
      `https://content.viralize.tv/display/?zid=${zid}`,
      this.extraParams_
    );
  }
}

AMP.extension(TAG, '0.1', (AMP) => {
  AMP.registerElement(TAG, AmpViralizePlayer);
});
