/**
 * Copyright 2015 The AMP HTML Authors. All Rights Reserved.
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

import {getService} from '../service';
import {installActionService} from './action-impl';
import {installResourcesService} from './resources-impl';


class StandardActions {
  /**
   * @param {!Window} win
   */
  constructor(win) {
    /** @const @private {!ActionService} */
    this.actions_ = installActionService(win);

    /** @const @private {!Resources} */
    this.resources_ = installResourcesService(win);

    this.actions_.addGlobalMethodHandler('hide', invocation => {
      this.resources_.mutateElement(invocation.target, () => {
        invocation.target.style.display = 'none';
      });
    });
  }
}


/**
 * @param {!Window} win
 * @return {!ActionService}
 */
export function installStandardActions(win) {
  return getService(win, 'standard-actions', () => {
    return new StandardActions(win);
  });
};
