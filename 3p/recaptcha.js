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

import {dev, user} from '../src/log';
import {dict} from '../src/utils/object';
import {loadScript} from './3p';

/**
 * @fileoverview
 * Boostrap Iframe for communicating with the recaptcha API.
 *
 * Here are the following iframe messages using .postMessage()
 * used between the iframe and recaptcha service:
 * amp-recaptcha-ready / Service <- Iframe :
 *   Iframe and Recaptcha API are ready.
 * amp-recaptcha-action / Service -> Iframe :
 *   Execute and action using supplied data
 * amp-recaptcha-token / Service <- Iframe :
 *   Response to 'amp-recaptcha-action'. The token
 *   returned by the recaptcha API.
 * amp-recaptcha-error / Service <- Iframe :
 *   Response to 'amp-recaptcha-action'. Error
 *   From attempting to get a token from action.
 */

/** @const {string} */
const TAG = 'RECAPTCHA';

/** @const {string} */
const MESSAGE_TAG = 'amp-recaptcha-';

/** @const {string} */
const RECAPTCHA_API_URL = 'https://www.google.com/recaptcha/api.js?render=';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function recaptcha(global, data) {
  dev().assert(
      data.sitekey,
      TAG +
    ' The data-sitekey attribute is required for <amp-recaptcha-input>'
  );

  if (data.fortesting) {
    mockRecaptchaApi_(global);
    recaptchaApiLoaded_(global);
  } else {
    const {sitekey} = data;
    const recaptchaApiUrl = RECAPTCHA_API_URL + sitekey;
    loadScript(
        global,
        recaptchaApiUrl,
        recaptchaApiLoaded_.bind(this, global),
        recaptchaApiLoadError_.bind(this)
    );
  }
}

/**
 * Function to mock out the grecaptcha Object for testing
 * @param {!Window} global
 * @visibleForTesting
 * @private
 */
function mockRecaptchaApi_(global) {
  global.grecaptcha = {
    ready: function(callback) {
      callback();
    },
    execute: function() {
      return {
        then: function(callback) {
          callback('mock token');
        },
      };
    },
  };
}

/**
 * Function called after succesfully getting the recaptcha Api
 * @param {!Window} global
 * @private
 */
function recaptchaApiLoaded_(global) {
  const {grecaptcha} = global;

  grecaptcha.ready(function() {
    global.context.registerCallback(
        MESSAGE_TAG + 'action',
        actionTypeHandler_.bind(this, global, grecaptcha)
    );
    global.context./*OK*/sendMessage(MESSAGE_TAG + 'ready');
  });
}

/**
 * Function called after failing to get the recaptcha Api
 * @private
 */
function recaptchaApiLoadError_() {
  user().error(TAG + ' Failed to load recaptcha api script');
}

/**
 * Function to handle executing actions using the grecaptcha Object,
 * and sending the token back to the parent amp-recaptcha component
 *
 * @param {!Window} global
 * @param {*} grecaptcha
 * @param {Object} data
 * @private
 */
function actionTypeHandler_(global, grecaptcha, data) {

  const executePromise = grecaptcha.execute(data.sitekey, {
    action: data.action,
  });

  // .then() promise pollyfilled by recaptcha api script
  executePromise./*OK*/then(function(token) {
    global.context./*OK*/sendMessage(MESSAGE_TAG + 'token', dict({
      'id': data.id,
      'token': token,
    }));
  }, function(err) {
    user().error(TAG, err);
    global.context./*OK*/sendMessage(MESSAGE_TAG + 'error', dict({
      'id': data.id,
      'error': err.message,
    }));
  });
}



