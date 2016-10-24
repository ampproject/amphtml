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

import {accessServiceFor} from '../../../src/access-service';
import {isExperimentOn} from '../../../src/experiments';
import {user} from '../../../src/log';


/**
 * @implements {AccessVendor}
 */
export class LaterpayVendor {

  /**
   * @param {!AccessService} accessService
   */
  constructor(accessService) {
    /** @private @const */
    this.accessService_ = accessService;
    // TODO: implement
  }

  /**
   * @return {!Promise<!JSONType>}
   */
  authorize() {
    const win = this.accessService_.win;
    user().assert(isExperimentOn(win, 'amp-access-laterpay'),
        'Enable "amp-access-laterpay" experiment');
    // TODO: implement
    return Promise.resolve({access: true});
  }

  /**
   * @return {!Promise}
   */
  pingback() {
    // TODO: implement
    return Promise.resolve();
  }
}


// Register the vendor within the access service.
accessServiceFor(AMP.win).then(accessService => {
  accessService.registerVendor('laterpay', new LaterpayVendor(accessService));
});
