/**
 * Copyright 2017 The AMP HTML Authors. All Rights Reserved.
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

import {ClickDelayFilter} from './click-delay';
import {FilterType} from './filter';

export function createFilter(name, spec) {
  switch (spec.type) {
    case FilterType.CLICK_DELAY:
      return new ClickDelayFilter(name, spec.delay);
    case FilterType.CLICK_LOCATION:
      // TODO(clawr): Implement this.
    default:
      return undefined;
  }
}
