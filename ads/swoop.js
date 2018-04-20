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

import {
  computeInMasterFrame,
  loadScript,
  validateData,
} from '../3p/3p';

export function swoop(global, data) {
  // Required properties
  validateData(data, [
    'layout',
    'placement',
    'publisher',
    'slot',
  ]);

  computeInMasterFrame(global, 'swoop-load', done => {
    global.swoopIabConfig = data;

    loadScript(global, 'https://www.swoop-amp.com/amp.js', () => done(global.Swoop != null));
  }, success => {
    if (success) {
      if (!global.context.isMaster) {
        global.context.master.Swoop.announcePlace(global, data);
      }
    } else {
      global.context.noContentAvailable();
      throw new Error('Swoop failed to load');
    }
  });
}
