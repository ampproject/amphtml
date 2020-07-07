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

import {Services} from '../../../src/services';
import {findIndex} from '../../../src/utils/array';
import {isLayoutSizeDefined} from '../../../src/layout';
import {setIsMediaComponent} from '../../../src/video-interface';
import {userAssert} from '../../../src/log';

const makeStringParam = (param) =>
  `?${param[0]}=${encodeURIComponent(param[1])}`;
// const SERVER_URL = 'https://spkt.io/';
const SERVER_URL = 'https://staging.spkt.io/';
const DEFAULT_HEIGHT = 40;
const mediaProps = ['podcast_id', 'external_id', 'article_url'];

export class AmpSpeechkit extends AMP.BaseElement {
  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /**
     * @private {?Element}
     * @visibleForTesting
     */
    this.iframe_ = null;
  }

  /**
   * @param {boolean=} opt_onLayout
   * @override
   */
  preconnectCallback(opt_onLayout) {
    Services.preconnectFor(this.win).url(
      this.getAmpDoc(),
      SERVER_URL,
      opt_onLayout
    );
  }

  /** @override */
  isLayoutSupported(layout) {
    return isLayoutSizeDefined(layout);
  }

  /** @override */
  buildCallback() {
    setIsMediaComponent(this.element);
  }

  /**@override*/
  layoutCallback() {
    const height = this.element.getAttribute('height') || DEFAULT_HEIGHT;
    const projectId = userAssert(
      this.element.getAttribute('data-projectid'),
      'data-projectid is required for <amp-speechkit> %s',
      this.element
    );
    const mediaValues = [
      this.element.getAttribute('data-podcastid'),
      this.element.getAttribute('data-externalid'),
      this.element.getAttribute('data-articleurl'),
    ];
    const mediaIndex = findIndex(mediaValues, (value) => value != null);

    userAssert(
      mediaIndex !== -1,
      'data-podcastid or data-externalid or data-articleurl is required for <amp-speechkit> %s'
    );
    const iframe = this.element.ownerDocument.createElement('iframe');
    iframe.setAttribute('frameborder', 'no');
    iframe.setAttribute('scrolling', 'no');
    iframe.src = `${SERVER_URL}amp/${encodeURIComponent(
      projectId
    )}${makeStringParam([mediaProps[mediaIndex], mediaValues[mediaIndex]])}`;
    this.applyFillContent(iframe);
    iframe.height = height;
    this.element.appendChild(iframe);

    this.iframe_ = iframe;

    return this.loadPromise(iframe);
  }
}

AMP.extension('amp-speechkit', '0.1', (AMP) => {
  AMP.registerElement('amp-speechkit', AmpSpeechkit);
});
