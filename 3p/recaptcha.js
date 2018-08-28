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

import {IframeMessagingClient} from './iframe-messaging-client';
import {dict} from '../src/utils/object';
import {user} from '../src/log';
import {writeScript} from './3p';

/** @const {!String} */
const TAG = 'RECAPTCHA';

/** {!IframeMessaginClient|null} **/
let iframeMessagingClient = null;

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
    cb(global.grecaptcha);
  });
}

/**
 * Function to handle executing actions using the grecaptcha Object,
 * and sending the token back to the parent amp-recaptcha component
 *
 * @param {*} grecaptcha
 * @param {string} siteKey
 * @param {Object} data
 */
function actionTypeHandler(grecaptcha, siteKey, data) {
  if (!iframeMessagingClient) {
    user().error(TAG, 'IframeMessagingClient does not exist.');
    return;
  }

  grecaptcha.execute(siteKey, {
    action: data.action,
  })./*OK*/then(function(token) {
    iframeMessagingClient.sendMessage('token', {
      token,
    });
  }).catch(function(err) {
    user().error(TAG, err);
    iframeMessagingClient.sendMessage('error', dict({
      'error': (err || '').toString(),
    }));
  });
}

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function recaptcha(global, data) {
  user().assert(
    data.sitekey,
    TAG + ' The data-sitekey attribute is required for <amp-recaptcha-input> %s',
    data.element
  );

  let recaptchaApiUrl = 'https://www.google.com/recaptcha/api.js?render=';
  const siteKey = data.sitekey || '6LebBGoUAAAAAHbj1oeZMBU_rze_CutlbyzpH8VE';
  recaptchaApiUrl += siteKey;

  getRecaptchaApiJs(global, recaptchaApiUrl, function(grecaptcha) {
    grecaptcha.ready(function() {
      iframeMessagingClient = new IframeMessagingClient(global);
      iframeMessagingClient.setSentinel(global.context.sentinel);
      iframeMessagingClient.registerCallback(
          'action',
          actionTypeHandler.bind(this, grecaptcha, siteKey)
      );
      iframeMessagingClient.sendMessage('ready');
    });
  });
}
