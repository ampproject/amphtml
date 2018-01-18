/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
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

import {CSS} from '../../../build/amp-access-scroll-0.1.css';
import {AccessClientAdapter} from '../../amp-access/0.1/amp-access-client';
import {Services} from '../../../src/services';
import {installStylesForDoc} from '../../../src/style-installer';

const TAG = 'amp-access-scroll-elt';

/** @const {!JsonObject} */
const CONFIG = /** @type {!JsonObject} */ ({
  'authorization': 'https://connect.scroll.com/amp/access?' +
                   'rid=READER_ID&o=SOURCE_URL&' +
                   'cid=CLIENT_ID(cid-fallback-cookie)',
  'pingback': 'https://connect.scroll.com/amp/pingback?' +
              'rid=READER_ID&o=SOURCE_URL&cid=CLIENT_ID(cid-fallback-cookie)&' +
              'd=AUTHDATA(scroll)&v=AUTHDATA(visitId)',
  'namespace': 'scroll',
});

/**
 * amp-access vendor that authenticates against the scroll.com service.
 * If the user is authenticated, also adds a fixed position iframe
 * to the page.
 *
 * A little gross, but avoid some duplicate code by inheriting
 * from ClientAdapter.
 * @implements {../../amp-access/0.1/access-vendor.AccessVendor}
 */
export class ScrollAccessVendor extends AccessClientAdapter {
  constructor(ampdoc, accessService) {
    super(ampdoc, CONFIG, {
      buildUrl: accessService.buildUrl.bind(accessService),
      collectUrlVars: accessService.collectUrlVars_.bind(accessService),
    });
    this.element_ = null;
  }

  authorize() {
    return super.authorize()
        .then(response => {
          if (response && response.scroll) {
            this.element_ = new ScrollElement(this.ampdoc);
            this.ampdoc.getBody().appendChild(this.element_);
            this.element_.show();
          }
        });
  }
}

/**
 * @extends {HTMLElement}
 */
class ScrollElement extends HTMLElement {
  constructor(ampdoc) {
    super();
    installStylesForDoc(ampdoc, CSS, () => {}, false, TAG);

    this.ampdoc = ampdoc;

    this.wrapper_ = document.createElement('div');
    this.wrapper_.classList.add('amp-access-scroll-bar');
    this.appendChild(this.wrapper_);


    this.placeholder_ = document.createElement('div');
    this.placeholder_.classList.add('amp-access-scroll-placeholder');
    this.wrapper_.appendChild(this.placeholder_);

    const img = document.createElement('amp-img');
    img.setAttribute('src',
        'https://static.scroll.com/assets/icn-scroll-logo.svg');
    img.setAttribute('layout', 'fixed');
    img.setAttribute('width', 26);
    img.setAttribute('height', 26);
    this.placeholder_.appendChild(img);

    this.iframe_ = document.createElement('iframe');
    this.iframe_.setAttribute('scrolling', 'no');
    this.iframe_.setAttribute('frameborder', '0');
    this.iframe_.setAttribute('allowtransparency', 'true');
    this.iframe_.setAttribute('title', 'Scroll');
    this.iframe_.setAttribute('width', '100%');
    this.iframe_.setAttribute('height', '100%');
    this.wrapper_.appendChild(this.iframe_);
  }

  show() {
    Services.accessServiceForDoc(this.ampdoc)
        .then(accessService => accessService.getAccessReaderId())
        .then(readerId => {
          this.iframe_.onload = () => {
            this.wrapper_.removeChild(this.placeholder_);
          };
          this.iframe_.setAttribute('src',
              'https://connect.scroll.com/amp/scrollbar?readerId=' + readerId);
        });
  }
}

customElements.define('amp-access-scroll-elt',
    /** @type {function(new:HTMLElement)} */ (ScrollElement));
