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

import {validateData, writeScript} from '../3p/3p';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function weboramaDisplay(global, data) {
  const mandatoryFields = [
    'width',
    'height',
    'wbo_account_id',
    'wbo_tracking_element_id',
    'wbo_fullhost',
  ];

  const optionalFields = [
    'wbo_bid_price',
    'wbo_price_paid',
    'wbo_random',
    'wbo_debug',
    'wbo_host',
    'wbo_publisherclick',
    // 'wbo_clicktrackers',
    // 'wbo_imptrackers',
    // 'wbo_zindex',
    'wbo_customparameter',
    'wbo_disable_unload_event',
    'wbo_donottrack',
    'wbo_script_variant',
    'wbo_is_mobile',
    'wbo_vars',
    'wbo_weak_encoding',
  ];

  validateData(data, mandatoryFields, optionalFields);

  /*eslint "google-camelcase/google-camelcase": 0*/
  global.weborama_display_tag = {
    // Default settings to work with AMP
    forcesecure: true,
    bursttarget: 'self',
    burst: 'never',

    // Settings taken from component config
    width: data.width,
    height: data.height,
    account_id: data.wbo_account_id,
    customparameter: data.wbo_customparameter,
    tracking_element_id: data.wbo_tracking_element_id,
    host: data.wbo_host,
    fullhost: data.wbo_fullhost,
    bid_price: data.wbo_bid_price,
    price_paid: data.wbo_price_paid,
    random: data.wbo_random,
    debug: data.wbo_debug,
    publisherclick: data.wbo_publisherclick,
    // clicktrackers: data.wbo_clicktrackers,
    // imptrackers: data.wbo_imptrackers,
    // zindex: data.wbo_zindex, // This is actually quite useless for now, since we are launced in a non-friendly iframe.
    disable_unload_event: data.wbo_disable_unload_event,
    donottrack: data.wbo_donottrack,
    script_variant: data.wbo_script_variant,
    is_mobile: data.wbo_is_mobile,
    vars: data.wbo_vars,
    weak_encoding: data.wbo_weak_encoding,
  };

  writeScript(global, 'https://cstatic.weborama.fr/js/advertiserv2/adperf_launch_1.0.0_scrambled.js');
}
