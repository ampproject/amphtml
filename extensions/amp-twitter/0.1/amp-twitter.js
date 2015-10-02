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


import {getIframe, listen} from '../../../src/3p-frame';
import * as dom from '../../../src/dom';
import {isLayoutSizeDefined} from '../../../src/layout';
import {loadPromise} from '../../../src/event-helper';
import {setStyles} from '../../../src/style';
import {vsync} from '../../../src/vsync';


class AmpTwitter extends AMP.BaseElement {
  /** @override */
  createdCallback() {
    // This domain serves the actual tweets as JSONP.
    this.preconnect.url('https://syndication.twitter.com');
    // Hosts the script that renders tweets.
    this.preconnect.url('https://platform.twitter.com');
    this.preconnect.threePFrame();
  }

  /** @override */
  isLayoutSupported(layout) {
    return isLayoutSizeDefined(layout);
  }

  /** @override */
  layoutCallback() {
    // TODO(malteubl): Preconnect to twitter.
    var iframe = getIframe(this.element.ownerDocument.defaultView,
        this.element, 'twitter');
    this.applyFillContent(iframe);
    this.element.appendChild(iframe);
    // Triggered by context.updateDimensions() inside the iframe.
    listen(iframe, 'embed-size', (data) => {
      iframe.height = data.height;
      iframe.width = data.width;
      console.error('RESIZE: ', this.element.id, data);
      var amp = iframe.parentElement;
      amp.setAttribute('height', data.height);
      amp.setAttribute('width', data.width);
      var sizer = dom.elementByTag(amp, 'i-amp-sizer');
      // By using a vsync to set the height, we set many tweets in the same
      // instant because Twitter batches requests, so they come back at
      // the same time (but each tweet updates comes in its own postMessage).
      // NOTE: If prerendering is enabled for Twitter we need to move this
      // into a non-vsync in that case.
      vsync.mutate(() => {
        if (sizer) {
          // The sizer is no longer dynamic, but as soon as the height
          // was set once we expect it gets reset on resize of the container.
          setStyles(sizer, {
            paddingTop: data.height + 'px'
          });
        } else {
          setStyles(amp, {
            height: data.height + 'px'
          });
        }
      });
    });
    return loadPromise(iframe);
  }
};

AMP.registerElement('amp-twitter', AmpTwitter);
