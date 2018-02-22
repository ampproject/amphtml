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

import {AmpAdNetworkBase} from '../../amp-ad-network-base/0.1/amp-ad-network-base';
import {
  RenderingDataInputDef,
  ValidationResult,
  ValidationResultType, // eslint-disable-line no-unused-vars
} from '../../amp-a4a/0.1/a4a-render';
import {
  SizeInfoDef,
  getAmpAdMetadata,
  sendXhrRequest,
} from '../../amp-a4a/0.1/a4a-utils';
import {dev} from '../../../src/log';

// Only need this for development phase
import {utf8Decode, utf8Encode} from '../../../src/utils/bytes';

const TAG = 'amp-ad-network-template-base';

export class AmpAdNetworkTemplateBase extends AmpAdNetworkBase {
  /**
   * @param {!Element} element
   */
  constructor(element) {
    super(element);
    this.bindAdRequestUrl('foo');
    this.bindValidator((bytes, header, impl) => Promise.resolve(bytes));
    this.bindRenderer(ValidationResult.AMP,
        creative => dev().info(TAG, creative));
  }
}

AMP.extension(TAG, '0.1', AMP => {
  AMP.registerElement(TAG, AmpAdNetworkTemplateBase);
});
