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

import {
  writeScript,
  validateData,
  validateSrcPrefix,
  validateSrcContains,
} from '../3p/3p';


export function adtech(global, data) {
  const adsrc = data.src;
  if (typeof adsrc != 'undefined') {
    validateSrcPrefix('https:', adsrc);
    validateSrcContains('/addyn/', adsrc);
    writeScript(global, adsrc);
  } else {
    validateData(data, ['atwmn', 'atwdiv'], [
      'atwco', 'atwheight', 'atwhtnmat',
      'atwmoat', 'atwnetid', 'atwothat', 'atwplid',
      'atwpolar', 'atwsizes', 'atwwidth',
    ]);
    global.atwco = data.atwco;
    global.atwdiv = data.atwdiv;
    global.atwheight = data.atwheight;
    global.atwhtnmat = data.atwhtnmat;
    global.atwmn = data.atwmn;
    global.atwmoat = data.atwmoat;
    global.atwnetid = data.atwnetid;
    global.atwothat = data.atwothat;
    global.atwplid = data.atwplid;
    global.atwpolar = data.atwpolar;
    global.atwsizes = data.atwsizes;
    global.atwwidth = data.atwwidth;
    writeScript(global,'https://s.aolcdn.com/os/ads/adsWrapper3.js');
  }
}
