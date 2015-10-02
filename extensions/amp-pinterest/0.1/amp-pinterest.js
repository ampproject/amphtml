/**
 * Copyright 2015 The AMP HTML Authors.
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


/**
 * @fileoverview Shows a Pinterest widget.
 * Examples:
 * <code>
 *
 *  <amp-pinterest height=20 width=40
 *    data-do="buttonPin"
 *    data-url="http://www.flickr.com/photos/kentbrew/6851755809/"
 *    data-media="http://farm8.staticflickr.com/7027/6851755809_df5b2051c9_z.jpg"
 *    data-description="Next stop: Pinterest">
 *  </amp-pinterest>
 *
 *  <amp-pinterest width=239 height=400
 *    data-do="embedBoard"
 *    data-scale-height="289"
 *    data-scale-width="107"
 *    data-url="http://www.pinterest.com/kentbrew/art-i-wish-i-d-made/">
 *  </amp-pinterest>
 *
 * </code>
 */

import {isLayoutSizeDefined} from '../../../src/layout';
import {loadPromise} from '../../../src/event-helper';

const VALID_PARAMS = [
    'data-config',
    'data-height',
    'data-width',
    'data-shape',
    'data-color',
    'data-lang',
    'data-scale-width',
    'data-scale-height',
    'data-board-width' ];

class AmpPinterest extends AMP.BaseElement {
  /** @override */
  isLayoutSupported(layout) {
    return isLayoutSizeDefined(layout);
  }
  /** @override */
  layoutCallback() {

    let height = this.element.getAttribute('height');

    let width = this.element.getAttribute('width');

    var pinDo = AMP.assert(this.element.getAttribute('data-do'),
        'The data-do attribute is required for <amp-pinterest> %s',
        this.element);

    var pinUrl = AMP.assert(this.element.getAttribute('data-url'),
        'The data-url attribute is required for <amp-pinterest> %s',
        this.element);

    // set by data-do -- buttonPin renders a Pin It button and requires media and description
    if (pinDo === 'buttonPin') {

        var pinMedia = AMP.assert(this.element.getAttribute('data-media'),
            'The data-media attribute is required when <amp-pinterest> makes a Pin It button %s',
            this.element);

        var pinDescription = AMP.assert(this.element.getAttribute('data-description'),
            'The data-description attribute is required when <amp-pinterest> makes a Pin It button %s',
            this.element);
    }

    let iframe = document.createElement('iframe');
    iframe.setAttribute('frameborder', '0');
    iframe.setAttribute('allowtransparency', 'true');

    // start setting the source of our iframe
    let src = 'https://assets.pinterest.com/ext/iffy.html?' +
        'act=' + encodeURIComponent(pinDo) +
        '&url=' + encodeURIComponent(pinUrl);

    // if we are making a Pin It button and are missing media or description, we should already have failed
    if (pinDo === 'buttonPin') {
        src = src + '&media=' + encodeURIComponent(pinMedia);
        src = src + '&description=' + encodeURIComponent(pinDescription);
    }

    for (let i = 0; i < VALID_PARAMS.length; i = i + 1) {
        let v = this.element.getAttribute(VALID_PARAMS[i]);
        if (v) {
            // remove data- prefix from params
            src = src + '&' + VALID_PARAMS[i].replace(/data-/, '') + '=' + encodeURIComponent(v);
        }
    }

    iframe.src = src;

    this.applyFillContent(iframe);
    iframe.width = width;
    iframe.height = height;
    this.element.appendChild(iframe);
    return loadPromise(iframe);
  }
};

AMP.registerElement('amp-pinterest', AmpPinterest);
