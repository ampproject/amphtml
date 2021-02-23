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

import {CSS} from '../../../build/amp-next-page-1.0.css';
import {Layout} from '../../../src/layout';
import {NextPageService} from './service';
import {Services} from '../../../src/services';

const TAG = 'amp-next-page';
const SERVICE = 'next-page';

export class AmpNextPage extends AMP.BaseElement {
  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {?NextPageService} */
    this.nextPageService_ = null;
  }

  /** @override */
  isLayoutSupported(layout) {
    return layout === Layout.CONTAINER;
  }

  /** @override */
  buildCallback() {
    this.nextPageService_ = Services.nextPageServiceForDoc(this.element);
    return this.nextPageService_.build(this.element);
  }
}

AMP.extension(TAG, '1.0', (AMP) => {
  AMP.registerServiceForDoc(SERVICE, NextPageService);
  AMP.registerElement(TAG, AmpNextPage, CSS);
});
