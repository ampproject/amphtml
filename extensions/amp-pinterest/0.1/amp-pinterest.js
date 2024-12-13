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

import {isLayoutSizeDefined} from '#core/dom/layout';
import {htmlFor} from '#core/dom/static-template';

import {Services} from '#service';

import {user, userAssert} from '#utils/log';

import {FollowButton} from './follow-button';
import {PinWidget} from './pin-widget';
import {SaveButton} from './save-button';

import {CSS} from '../../../build/amp-pinterest-0.1.css';

/**
 * AMP Pinterest
 * data-do
 *    - buttonPin: Save button
 *    - buttonFollow: User follow button
 */
class AmpPinterest extends AMP.BaseElement {
  /** @override  */
  static createLoaderLogoCallback(element) {
    const type = element.getAttribute('data-do');
    if (type != 'embedPin') {
      return {};
    }

    const html = htmlFor(element);
    return {
      color: '#E60019',
      content: html`
        <svg viewBox="0 0 72 72">
          <path
            fill="currentColor"
            d="M36,26c-5.52,0-9.99,4.47-9.99,9.99c0,4.24,2.63,7.85,6.35,9.31c-0.09-0.79-0.16-2.01,0.03-2.87
            c0.18-0.78,1.17-4.97,1.17-4.97s-0.3-0.6-0.3-1.48c0-1.39,0.81-2.43,1.81-2.43c0.86,0,1.27,0.64,1.27,1.41
            c0,0.86-0.54,2.14-0.83,3.33c-0.24,1,0.5,1.81,1.48,1.81c1.78,0,3.14-1.88,3.14-4.57c0-2.39-1.72-4.06-4.18-4.06
            c-2.85,0-4.51,2.13-4.51,4.33c0,0.86,0.33,1.78,0.74,2.28c0.08,0.1,0.09,0.19,0.07,0.29c-0.07,0.31-0.25,1-0.28,1.13
            c-0.04,0.18-0.15,0.22-0.34,0.13c-1.25-0.58-2.03-2.4-2.03-3.87c0-3.15,2.29-6.04,6.6-6.04c3.46,0,6.16,2.47,6.16,5.77
            c0,3.45-2.17,6.22-5.18,6.22c-1.01,0-1.97-0.53-2.29-1.15c0,0-0.5,1.91-0.62,2.38c-0.22,0.87-0.83,1.96-1.24,2.62
            c0.94,0.29,1.92,0.44,2.96,0.44c5.52,0,9.99-4.47,9.99-9.99C45.99,30.47,41.52,26,36,26z"
          ></path>
        </svg>
      `,
    };
  }

  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {string} */
    this.type_ = '';

    /** @private {*} */
    this.renderClass_ = null;
  }
  /**
   * @param {boolean=} onLayout
   * @override
   */
  preconnectCallback(onLayout) {
    // preconnect to widget APIpinMedia
    Services.preconnectFor(this.win).url(
      this.getAmpDoc(),
      'https://widgets.pinterest.com',
      onLayout
    );
  }

  /** @override */
  isLayoutSupported(layout) {
    return isLayoutSizeDefined(layout);
  }

  /** @override */
  buildCallback() {
    this.type_ = userAssert(
      this.element.getAttribute('data-do'),
      'The data-do attribute is required for <amp-pinterest> %s',
      this.element
    );

    switch (this.type_) {
      case 'embedPin':
        this.renderClass_ = new PinWidget(this.element);
        break;
      case 'buttonPin':
        this.renderClass_ = new SaveButton(this.element);
        break;
      case 'buttonFollow':
        this.renderClass_ = new FollowButton(this.element);
        break;
      default:
        return Promise.reject(
          user().createError('Invalid type: %s', this.type_)
        );
    }
  }

  /** @override */
  layoutCallback() {
    return this.renderClass_
      .render()
      .then((node) => this.element.appendChild(node));
  }

  /** @override */
  firstLayoutCompleted() {
    this.renderClass_.height().then((renderedHeight) => {
      if (renderedHeight !== null) {
        this.attemptChangeHeight(renderedHeight);
      }
    });
  }
}

AMP.extension('amp-pinterest', '0.1', (AMP) => {
  AMP.registerElement('amp-pinterest', AmpPinterest, CSS);
});
