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

/**
 * @fileoverview Embeds a story
 *
 * Example:
 * <code>
 * <amp-story>
 * </amp-story>
 * </code>
 */

import {CSS} from '../../../build/amp-story-0.1.css';
import {Layout} from '../../../src/layout';
import {user} from '../../../src/log';
import {isExperimentOn} from '../../../src/experiments';

/** @const */
const TAG = 'amp-story';

export class AmpStory extends AMP.BaseElement {

  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);
  }

  buildCallback() {
    user().assert(isExperimentOn(this.win, TAG), 'enable amp-story experiment');
  }

  /** @override */
  isLayoutSupported(layout) {
    return layout == Layout.CONTAINER;
  }
}

AMP.registerElement('amp-story', AmpStory, CSS);
