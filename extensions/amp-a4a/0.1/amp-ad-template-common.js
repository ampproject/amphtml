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

import {AmpAdNetworkTemplateBase} from './amp-ad-network-template-base';
import {NetworkRegistry} from './template-common-config';
import {dev} from '../../../src/log';

const TAG = 'amp-ad-template-common';

export class AmpAdTemplateCommon extends AmpAdNetworkTemplateBase {
  /**
   * @param {!Element} element
   */
  constructor(element) {
    super(element);
    const networkType = element.getAttribute('type');
    dev().assert(networkType, 'Element did not specify network type!');
    const networkConfig = NetworkRegistry[element.getAttribute('type')];
    dev().assert(networkConfig, `Network ${networkType} not registered!`);

    /** @const {string} */
    this.requestUrl_ = networkConfig.requestUrl;
  }

  /** @override */
  getRequestUrl() {
    return this.requestUrl_;
  }
}

AMP.extension(TAG, '0.1', AMP => {
  AMP.registerElement(TAG, AmpAdTemplateCommon);
});

