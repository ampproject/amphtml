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
import {ClickLocationFilter} from './click-location';
import {FilterType} from './filter';
import {InactiveElementFilter} from './inactive-element';

/**
 * @param {string} name
 * @param {!../config.FilterConfig} spec
 * @param {!../amp-ad-exit.AmpAdExit} adExitInstance
 */
export function createFilter(name, spec, adExitInstance) {
  switch (spec.type) {
    case FilterType.CLICK_DELAY:
      return new ClickDelayFilter(
          name,
          /** @type {!../config.ClickDelayConfig} **/(spec),
          adExitInstance.win);
    case FilterType.CLICK_LOCATION:
      return new ClickLocationFilter(name, spec, adExitInstance);
    case FilterType.INACTIVE_ELEMENT:
      return new InactiveElementFilter(
          name, /** @type {!../config.InactiveElementConfig} */(spec));
    default:
      return undefined;
  }
}
