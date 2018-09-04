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
import {dev, user} from '../src/log';
import {dict} from '../src/utils/object';
import {loadScript} from './3p';

/** @const {string} */
const TAG = 'RECAPTCHA';

/** @const {string} */
const MESSAGE_TAG = 'amp-recaptcha-';

/** {!IframeMessaginClient|null} **/
let iframeMessagingClient = null;

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function recaptcha(global, data) {
  dev().assert(
      data.sitekey,
      TAG +
    ' The data-sitekey attribute is required for <amp-recaptcha-input> %s',
      data.element
  );

  let recaptchaApiUrl = 'https://www.google.com/recaptcha/api.js?render=';
  const siteKey = data.sitekey;
  recaptchaApiUrl += siteKey;

  loadScript(global, recaptchaApiUrl, function() {
    const {grecaptcha} = global;

    grecaptcha.ready(function() {
      iframeMessagingClient = new IframeMessagingClient(global);
      iframeMessagingClient.setSentinel(global.context.sentinel);
      iframeMessagingClient.registerCallback(
          'action',
          actionTypeHandler.bind(this, grecaptcha, siteKey)
      );
      iframeMessagingClient./*OK*/sendMessage(MESSAGE_TAG + 'ready');
    });
  }, function() {
    user().error(TAG + ' Failed to load recaptcha api script');
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
    dev().error(TAG, 'IframeMessagingClient does not exist.');
    return;
  }

  grecaptcha.execute(siteKey, {
    action: data.action,
  })./*OK*/then(function(token) {
    // .then() promise pollyfilled by recaptcha api script
    iframeMessagingClient./*OK*/sendMessage(MESSAGE_TAG + 'token', {
      token,
    });
  }).catch(function(err) {
    user().error(TAG, err);
    iframeMessagingClient./*OK*/sendMessage(MESSAGE_TAG + 'error', dict({
      'error': err.message,
    }));
  });
}

