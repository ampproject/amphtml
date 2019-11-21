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
/*
 *********
 * Existing sovrn customers feel free to contact amp-implementations@sovrn.com
 * for assistance with setting up your amp-ad tagid New customers please see
 * www.sovrn.com to sign up and get started!
 *********
 */
import {writeScript} from '../3p/3p';
/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function sovrn(global, data) {
  /*eslint "google-camelcase/google-camelcase": 0*/
  global.width = data.width;
  global.height = data.height;
  global.domain = data.domain;
  global.u = data.u;
  global.iid = data.iid;
  global.aid = data.aid;
  global.z = data.z;
  global.tf = data.tf;
  writeScript(global, 'https://ap.lijit.com/www/sovrn_amp/sovrn_ads.js');
}
