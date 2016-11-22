/**
 * Copyright 2016 The AMP HTML Authors. All Rights Reserved.
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

import {dev, user} from '../../../src/log';
import {xhrFor} from '../../../src/xhr';
import {getConfigUrl} from './config-url';
import {isExperimentOn} from '../../../src/experiments';

/** @const */
const TAG = 'amp-auto-ads';

export class AmpAutoAds extends AMP.BaseElement {

  /** @override */
  buildCallback() {
    user().assert(isExperimentOn(self, 'amp-auto-ads'), 'Experiment is off');

    const type = this.element.getAttribute('type');
    user().assert(type, 'Missing type attribute');

    const configUrl = getConfigUrl(type, this.element);
    if (!configUrl) {
      return;
    }
    this.getConfig_(configUrl).then(() => {
      // TODO: Use the configuration to place ads.
    });
  }

  /** @override */
  isLayoutSupported() {
    return true;
  }

  /**
   * Tries to load an auto-ads configuration from the given URL.
   * @param {string} configUrl
   * @return {!Promise<?JSONType>}
   * @private
   */
  getConfig_(configUrl) {
    const xhrInit = {
      mode: 'cors',
      method: 'GET',
      requireAmpResponseSourceOrigin: false,
    };
    return xhrFor(this.win)
        .fetchJson(configUrl, xhrInit)
        .catch(reason => {
          dev().error(TAG, 'amp-auto-ads config xhr failed: ' + reason);
          return null;
        });
  }
}

AMP.registerElement('amp-auto-ads', AmpAutoAds);
