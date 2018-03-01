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

import {AmpAdNetworkBase} from './amp-ad-network-base';
import {ValidatorResult} from './amp-ad-type-defs';
import {dev} from '../../../src/log';
import {templateRenderer} from './amp-ad-render';
import {utf8Decode} from '../../../src/utils/bytes'; // For testing/debugging purposes

const TAG = 'amp-ad-network-template-base';

export class AmpAdNetworkTemplateBase extends AmpAdNetworkBase {
  /**
   * @param {!Element} element
   */
  constructor(element) {
    super(element);
    this.bindValidator(bytes => Promise.resolve(
        /** @type {!./amp-ad-type-defs.ValidatorOutputDef} */({
          creative: utf8Decode(bytes),
          templateData: {},
          result: 'amp',
        })));
    this.bindRenderer(ValidatorResult.AMP,
        (input, base) => {
          dev().info(TAG, input.creativeMetadata.minifiedCreative);
          return templateRenderer(input, base);
        });
  }
}

AMP.extension(TAG, '0.1', AMP => {
  AMP.registerElement(TAG, AmpAdNetworkTemplateBase);
});
