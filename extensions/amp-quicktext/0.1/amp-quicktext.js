/**
 * Copyright 2019 The AMP HTML Authors. All Rights Reserved.
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
import {userAssert} from '../../../src/log';

export class AmpQuicktext extends AMP.BaseElement {
  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {string}  */
    this.license_ = '';

    /** @private {(string|Object)}  */
    this.lang_ = null;

    /** @private {(string|Object)}  */
    this.url_ = null;

    /** @private {(string|Object)}  */
    this.tags_ = null;

    window._qt = {
      license: null,
      lang: null,
      options: {tags: []},
    };
  }

  /** @override */
  buildCallback() {
    this.license_ = userAssert(
      this.element.getAttribute('license'),
      'The license attribute is required for <amp-quicktext> %s',
      this.element
    );
    this.url_ = this.element.getAttribute('url');
    this.lang_ = this.element.getAttribute('lang');
    this.tags_ = this.element.getAttribute('tags');

    if (this.lang_) {
      window._qt.lang = this.lang_;
    }
    if (this.tags_) {
      window._qt.options.tags = this.element.getAttribute('tags').split(',');
    }
    if (this.license_) {
      window._qt.license = this.license_;
      if (this.url_) {
        this.loadScript(this.url_);
      } else {
        this.loadScript('https://cdn.qt.im/qt.min.js');
      }
    }
  }

  /**
   * Load external JavaScript.
   *
   * @param {string} url external document source.
   */
  loadScript(url) {
    const script = document.createElement('script');
    script.type = 'text/javascript';
    if (script.readyState) {
      script.onreadystatechange = function() {
        if (
          script.readyState === 'loaded' ||
          script.readyState === 'complete'
        ) {
          script.onreadystatechange = null;
        }
      };
    } else {
      script.onload = function() {};
    }
    script.src = url;
    document.getElementsByTagName('head')[0].appendChild(script);
  }

  /** @override */
  isLayoutSupported(layout) {
    return isLayoutSizeDefined(layout);
  }
}

AMP.extension('amp-quicktext', '0.1', AMP => {
  AMP.registerElement('amp-quicktext', AmpQuicktext);
});
