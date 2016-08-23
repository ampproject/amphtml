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
// adagio
import {loadScript, checkData} from '../3p/3p';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function adagio(global, data) {

  checkData(data, ['sid', 'loc']);

  const $neodata = global;

  $neodata._adagio = {};
  $neodata._adagio.Q = [];
  $neodata._adagio.B = {};
  $neodata._adagio.B.setSid = null;
  $neodata._adagio.B.addBanner = null;
  $neodata._adagio.amp = data;

  $neodata._adagio.Q.push(['setup', function() {
    $neodata._adagio.B.setSid(data.sid);
    $neodata._adagio.B.addBanner(data.loc, 'c');
  }]);
  loadScript($neodata, 'https://js-ssl.neodatagroup.com/adagio_amp.js');
}
