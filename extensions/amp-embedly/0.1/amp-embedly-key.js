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

import {BASE_API_URL} from './embedly-service';
import {Layout} from '../../../src/layout';
import {getEmbedlyServiceForDoc} from './embedly-service';
import {user} from '../../../src/log';

/** @const {string} */
export const TAG = 'amp-embedly-key';

/**
 * Implementation of the amp-embedly-key component.
 *
 * Gets api key from user input and sets it in the service
 * to be used with subsequent api requests.
 *
 * See {@link ../amp-embedly-key.md} for the spec.
 */
export class AmpEmbedlyKey extends AMP.BaseElement {
  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);
  }

  /** @override */
  buildCallback() {
    const apiKey = user().assert(
        this.element.getAttribute('value'),
        `The value attribute is required for <${TAG}> %s`,
        this.element
    );

    return getEmbedlyServiceForDoc(this.element)
        .then(service => service.key = apiKey);
  }

  /**
   * @param {boolean=} opt_onLayout
   * @override
   */
  preconnectCallback(opt_onLayout) {
    this.preconnect.url(BASE_API_URL, opt_onLayout);
  }

  /** @override */
  isLayoutSupported(layout) {
    return layout === Layout.NODISPLAY;
  }
}
