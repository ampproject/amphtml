/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
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

import {user} from '../src/log';
import {writeScript} from './3p';

/**
 * Get the recaptcha script.
 *
 * Use writeScript: Failed to execute 'write' on 'Document': It isn't possible
 * to write into a document from an asynchronously-loaded external script unless
 * it is explicitly opened.
 *
 * @param {!Window} global
 * @param {string} scriptSource The source of the script, different for post and comment embeds.
 * @param {function(*)} cb
 */
function getRecaptchaApiJs(global, scriptSource, cb) {
  writeScript(global, scriptSource, function() {
    cb(global.gist);
  });
}


/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function recaptcha(global, data) {
  console.log('recaptcha is called!');
  
  let recaptchaApiUrl = 'https://www.google.com/recaptcha/api.js?render=';
  recaptchaApiUrl += '6LebBGoUAAAAAHbj1oeZMBU_rze_CutlbyzpH8VE' // TODO: Get sitekey from data

  getRecaptchaApiJs(global, recaptchaApiUrl, function() {
    console.log('got recaptcha!');
    console.log('recaptcha object', grecaptcha);
  });
}
