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

import {BaseElement} from './base-element';
// import {CSS} from '../../../build/amp-fit-text-1.0.css';
import {batchFetchJsonFor} from '../../../src/batched-json';
import {dict} from '../../../src/utils/object';
// import {isExperimentOn} from '../../../src/experiments';
import {Services} from '../../../src/services';
import {user, userAssert} from '../../../src/log';

/** @const {string} */
const TAG = 'amp-render';

class AmpRender extends BaseElement {
  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);
  }

  /** @override */
  isLayoutSupported(layout) {
    // userAssert(
    //   isExperimentOn(this.win, 'amp-render'),
    //   'Experiment "amp-render" is not turned on.'
    // );
    return super.isLayoutSupported(layout);
  }

  /** @override */
  init() {
    return dict({
      // 'fetchFn': batchFetchJsonFor.bind(null, this.getAmpDoc(), this.element),
      'fetchFn': getAmpStateJson.bind(null, this.element),
    });
  }
}

AMP.extension(TAG, '1.0', (AMP) => {
  AMP.registerElement(TAG, AmpRender);
});

/**
 * Gets the json that has an "amp-state:" uri. For example,
 * src="amp-state:json.path".
 *
 * @param element
 * @return {Promise<!JsonObject>}
 */
function getAmpStateJson(element) {
  const src = element.getAttribute('src');
  return Services.bindForDocOrNull(element)
    .then((bind) => {
      userAssert(bind, '"amp-state:" URLs require amp-bind to be installed.');
      const ampStatePath = src.slice(
        /* AMP_STATE_URI_SCHEME.length */ 'amp-state:'.length
      );
      return bind.getStateAsync(ampStatePath).catch((err) => {
        const stateKey = ampStatePath.split('.')[0];
        user().error(
          TAG,
          `'amp-state' element with id '${stateKey}' was not found.`
        );
        throw err;
      });
    })
    .then((json) => {
      userAssert(
        typeof json !== 'undefined',
        `[amp-list] No data was found at provided uri: ${src}`
      );
      console.log(json);
      return json;
    });
}
