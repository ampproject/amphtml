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
 * <amp-pinterest height=20 width=40
 *   data-do="buttonPin"
 *   data-url="http://www.flickr.com/photos/kentbrew/6851755809/"
 *   data-media="http://farm8.staticflickr.com/7027/6851755809_df5b2051c9_z.jpg"
 *   data-description="Next stop: Pinterest">
 * </amp-pinterest>
 *
 * <amp-pinterest width=245 height=330
 *   data-do="embedPin"
 *   data-url="https://www.pinterest.com/pin/99360735500167749/">
 * </amp-pinterest>
 *
 * </code>
 */

import {CSS} from '../../../build/amp-pinterest-0.1.css';
import {isLayoutSizeDefined} from '../../../src/layout';
import {user} from '../../../src/log';

import {FollowButton} from './follow-button';
import {PinItButton} from './pinit-button';
import {PinWidget} from './pin-widget';

/**
 * AMP Pinterest
 * @attr data-do
 *    - buttonPin: Pin It button
 *    - buttonFollow: User follow button
 */
class AmpPinterest extends AMP.BaseElement {

  /** @override */
  preconnectCallback(onLayout) {
    // preconnect to widget APIpinMedia
    this.preconnect.url('https://widgets.pinterest.com', onLayout);
  }

  /** @override */
  isLayoutSupported(layout) {
    return isLayoutSizeDefined(layout);
  }

  /** @override */
  layoutCallback() {
    const selector = user().assert(this.element.getAttribute('data-do'),
        'The data-do attribute is required for <amp-pinterest> %s',
        this.element);

    return this.render(selector).then(node => {
      return this.element.appendChild(node);
    });
  }

  render(selector) {
    switch (selector) {
      case 'embedPin':
        return new PinWidget(this.element).render();
      case 'buttonPin':
        return new PinItButton(this.element).render();
      case 'buttonFollow':
        return new FollowButton(this.element).render();
    }
    return Promise.reject(user().createError('Invalid selector: ' + selector));
  }

};

AMP.registerElement('amp-pinterest', AmpPinterest, CSS);
