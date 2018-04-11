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

import {CSS} from '../../../build/amp-next-page-0.1.css';
import {Layout} from '../../../src/layout';
import {NextPage} from './next-page-impl';
import {getService} from '../../../src/service';
import {isExperimentOn} from '../../../src/experiments';
import {user} from '../../../src/log';

const TAG = 'amp-next-page';

const SERVICE_ID = 'document-recommendations';

export class AmpNextPage extends AMP.BaseElement {

  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);
    this.service_ = getService(this.win, SERVICE_ID);
  }

  /** @override */
  isLayoutSupported(layout) {
    return layout == Layout.CONTAINER;
  }

  /** @override */
  buildCallback() {
    user().assert(isExperimentOn(this.win, TAG), `Experiment ${TAG} disabled`);
    this.service_.register(this);
  }
}

AMP.extension(TAG, '0.1', AMP => {
  const service = new NextPage();
  AMP.registerServiceForDoc(SERVICE_ID, () => service);
  AMP.registerElement(TAG, AmpNextPage, CSS);
});
