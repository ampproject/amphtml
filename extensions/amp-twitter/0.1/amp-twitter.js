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


import {getIframe, preloadBootstrap} from '../../../src/3p-frame';
import {isLayoutSizeDefined} from '../../../src/layout';
import {listenFor} from '../../../src/iframe-helper';
import {loadPromise} from '../../../src/event-helper';


class AmpTwitter extends AMP.BaseElement {
  /** @override */
  preconnectCallback(onLayout) {
    // This domain serves the actual tweets as JSONP.
    this.preconnect.url('https://syndication.twitter.com', onLayout);
    // All images
    this.preconnect.url('https://pbs.twimg.com', onLayout);
    // Hosts the script that renders tweets.
    this.preconnect.preload(
        'https://platform.twitter.com/widgets.js', 'script');
    preloadBootstrap(this.win);
  }

  /** @override */
  isLayoutSupported(layout) {
    return isLayoutSizeDefined(layout);
  }

  /** @override */
  firstLayoutCompleted() {
    // Do not hide placeholder
  }

  /** @override */
  layoutCallback() {
    const iframe = getIframe(this.element.ownerDocument.defaultView,
        this.element, 'twitter');
    this.applyFillContent(iframe);
    // Triggered by context.updateDimensions() inside the iframe.
    listenFor(iframe, 'embed-size', data => {
      // We only get the message if and when there is a tweet to display,
      // so hide the placeholder.
      this.togglePlaceholder(false);
      iframe.height = data.height;
      iframe.width = data.width;
      const amp = iframe.parentElement;
      amp.setAttribute('height', data.height);
      amp.setAttribute('width', data.width);
      this./*OK*/changeHeight(data.height);
    }, /* opt_is3P */true);
    this.element.appendChild(iframe);
    return loadPromise(iframe);
  }

  /** @override */
  toThumbnail() {
    const div = this.element.ownerDocument.createElement('div');
    div.style.width = '100px';
    div.style.height = '100px';
    div.style.backgroundImage = "url('data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%22-49%20141%20512%20512%22%3E%3Cpath%20fill%3D%22%23ffffff%22%20d%3D%22M432.9%2C256.9c-16.6%2C7.4-34.5%2C12.4-53.2%2C14.6c19.2-11.5%2C33.8-29.7%2C40.8-51.3c-17.9%2C10.6-37.8%2C18.4-58.9%2C22.5%20c-16.9-18-41-29.2-67.7-29.2c-51.2%2C0-92.7%2C41.5-92.7%2C92.7c0%2C7.2%2C0.8%2C14.3%2C2.4%2C21.1c-77-3.9-145.3-40.8-191.1-96.9%20C4.6%2C244%2C0%2C259.9%2C0%2C276.9C0%2C309%2C16.4%2C337.4%2C41.3%2C354c-15.2-0.4-29.5-4.7-42-11.6c0%2C0.4%2C0%2C0.8%2C0%2C1.1c0%2C44.9%2C31.9%2C82.4%2C74.4%2C90.9%20c-7.8%2C2.1-16%2C3.3-24.4%2C3.3c-6%2C0-11.7-0.6-17.5-1.7c11.8%2C36.8%2C46.1%2C63.6%2C86.6%2C64.4c-31.8%2C24.9-71.7%2C39.7-115.2%2C39.7%20c-7.5%2C0-14.8-0.4-22.2-1.3c41.1%2C26.4%2C89.8%2C41.7%2C142.2%2C41.7c170.5%2C0%2C263.8-141.3%2C263.8-263.8c0-4.1-0.1-8-0.3-12%20C404.8%2C291.8%2C420.5%2C275.5%2C432.9%2C256.9z%22%2F%3E%3C%2Fsvg%3E')";
    return div;
  }
};

AMP.registerElement('amp-twitter', AmpTwitter);
