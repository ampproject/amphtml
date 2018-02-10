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

import {
  loadScript,
  validateData,
  computeInMasterFrame,
} from '../3p/3p';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function ancora(global, data) {

  validateData(data, ['sectionId', 'slot', 'pubnetwork'], [
    'instance',
    'custom',
    'adServerUrl',
    'cacheSafe',
    'pageIdModifier',
    'click3rd',
    'debugsrc',
  ]);
  //TODO support dmp and cookie

  const SCRIPT_HOST = 'creatives.ancoraplatform.com/showad_';

  let scriptUrl = 'https://' + SCRIPT_HOST +
      data['pubnetwork'] + '.js';

  if (data['debugsrc']) {
    scriptUrl = data['debugsrc'];
  }

  computeInMasterFrame(global, 'ancora-request', done => {
    let success = false;
    const masterWin = this;
    if (!masterWin.showadAMPAdapter) {
      masterWin.showadAMPAdapter = {
        registerSlot: () => {},
      };
      loadScript(this, scriptUrl, () => {
        if (masterWin.showadAMPAdapter.inited) {
          success = true;
        }
        done(success);
      });
    } else {
      done(true);
    }
  }, success => {
    if (success) {
      global.showadAMPAdapter = global.context.master.showadAMPAdapter;
      global.showadAMPAdapter.registerSlot(data, global);
    } else {
      throw new Error('Ancora AdTag failed to load');
    }
  });
}
