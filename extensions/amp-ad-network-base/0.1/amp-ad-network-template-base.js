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
import {
  TemplateRenderer,
  TemplateValidator,
} from './amp-ad-render';
import {ValidatorResult} from './amp-ad-type-defs';

// These should be re-used for each instance.
const validator = new TemplateValidator();
const renderer = new TemplateRenderer();

export class AmpAdNetworkTemplateBase extends AmpAdNetworkBase {
  /**
   * @param {!Element} element
   */
  constructor(element) {
    super(element);

    this.registerValidator(validator);
    this.registerRenderer(ValidatorResult.AMP, renderer);
  }
}
