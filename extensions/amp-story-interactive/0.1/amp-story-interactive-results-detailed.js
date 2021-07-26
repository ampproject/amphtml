/**
 * Copyright 2021 The AMP HTML Authors. All Rights Reserved.
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

import {
  AmpStoryInteractive,
  InteractiveType,
} from './amp-story-interactive-abstract';
import {CSS} from '../../../build/amp-story-interactive-results-detailed-0.1.css';
import {htmlFor} from '#core/dom/static-template';

export class AmpStoryInteractiveResultsDetailed extends AmpStoryInteractive {
  /**
   * @param {!AmpElement} element
   */
  constructor(element) {
    super(element, InteractiveType.RESULTS, [2, 4]);
  }

  /** @override */
  buildCallback() {
    return super.buildCallback(CSS);
  }

  /** @override */
  buildComponent() {
    this.rootEl_ = htmlFor(this.element)`<p>Detailed results component</p>`;
    return this.rootEl_;
  }
}
