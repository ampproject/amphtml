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
import {user} from '../../../src/log';


class AmpDailymotion extends AMP.BaseElement {

  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {?Element} */
    this.iframe_ = null;
  }

 /**
  * @param {boolean=} opt_onLayout
  * @override
  */
  preconnectCallback(opt_onLayout) {
    this.preconnect.url('https://www.dailymotion.com', opt_onLayout);
    // Host that Dailymotion uses to serve JS needed by player.
    this.preconnect.url('https://static1.dmcdn.net', opt_onLayout);
  }

  /** @override */
  isLayoutSupported(layout) {
    return isLayoutSizeDefined(layout);
  }

  /** @override */
  layoutCallback() {
    const videoid = user().assert(
        this.element.getAttribute('data-videoid'),
        'The data-videoid attribute is required for <amp-dailymotion> %s',
        this.element);
    const iframe = this.element.ownerDocument.createElement('iframe');
    iframe.setAttribute('frameborder', '0');
    iframe.setAttribute('allowfullscreen', 'true');
    iframe.src = 'https://www.dailymotion.com/embed/video/' + encodeURIComponent(
        videoid) + '?' + this.getQuery_();

    this.applyFillContent(iframe);
    this.element.appendChild(iframe);
    this.iframe_ = iframe;
    return this.loadPromise(iframe);
  }

  /** @private */
  addQueryParam_(param, query) {
    const val = this.element.getAttribute(`data-${param}`);
    if (val) {
      query.push(`${encodeURIComponent(param)}=${encodeURIComponent(val)}`);
    }
  }

  /** @private */
  getQuery_() {
    const query = [
      'api=1',
      'html=1',
      'app=amp',
    ];

    const settings = [
      'mute',
      'endscreen-enable',
      'sharing-enable',
      'start',
      'ui-highlight',
      'ui-logo',
      'info',
    ];

    settings.forEach(setting => {
      this.addQueryParam_(setting, query);
    });

    return query.join('&');
  }

  /** @override */
  pauseCallback() {
    if (this.iframe_ && this.iframe_.contentWindow) {
      this.iframe_.contentWindow./*OK*/postMessage('pause', '*');
    }
  }
};

AMP.registerElement('amp-dailymotion', AmpDailymotion);
