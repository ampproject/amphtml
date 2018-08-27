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
import {listenParent, nonSensitiveDataPostMessage} from './messaging';
import {writeScript} from './3p';

const postMessageListeners = [];

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
 * Function to handle executing actions using the grecaptcha Object,
 * and sending the token back to the parent amp-recaptcha component
 *
 * @param {!Window} global
 * @param {!Object} grecaptcha
 * @param {!String} siteKey
 * @return {function(!JsonObject)}
 */
function getActionTypeHandler(global, grecaptcha, siteKey) {
  return (data) => {
    // TODO(torch2424) May have to get sitKey from data
    console.log('Action type handler', 'data', data);

    grecaptcha.execute(siteKey, {
      action: data.action
    }).then(function(token) {
      nonSensitivePostMessage('token', {
        token: token
      });
    }).catch(function(error) {
      // TODO(torch2424)
    });
  };
}



/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function recaptcha(global, data) {
  console.log('recaptcha is called!');

  let recaptchaApiUrl = 'https://www.google.com/recaptcha/api.js?render=';
  // TODO: Get sitekey from data
  const siteKey = '6LebBGoUAAAAAHbj1oeZMBU_rze_CutlbyzpH8VE';
  recaptchaApiUrl += siteKey;

  getRecaptchaApiJs(global, recaptchaApiUrl, function() {
    console.log('got recaptcha!');
    console.log('recaptcha object', grecaptcha);
    
    const actionTypeListener = listenParent(global, 'action', getActionTypeHandler(global, grecaptcha, siteKey));
    postMessageListeners.push(actionTypeListener);
  });
}
