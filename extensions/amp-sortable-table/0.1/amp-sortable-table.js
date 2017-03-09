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

import {CSS} from '../../../build/amp-sortable-table-0.1.css';
import {isExperimentOn} from '../../../src/experiments';
import {Layout} from '../../../src/layout';
import {isLayoutSizeDefined} from '../../../src/layout';
import {user} from '../../../src/log';

/** @const */
const EXPERIMENT = 'amp-sortable-table';

/** @const */
const TAG = 'amp-sortable-table';

class AmpSortableTable extends AMP.BaseElement {
  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);
  }

  /** @override */
  isLayoutSupported(layout) {
    return isLayoutSizeDefined(layout) || Layout.CONTAINER;
  }

  /** @override */
  buildCallback() {
    user().assert(isExperimentOn(this.win, TAG),
        `Experiment ${EXPERIMENT} disabled`);
  }
}

AMP.registerElement('amp-sortable-table', AmpSortableTable, CSS);
