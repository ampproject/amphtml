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

// src/polyfills.js must be the first import.
import './polyfills'; // eslint-disable-line sort-imports-es6-autofix/sort-imports-es6

import {IframeMessagingClient} from './iframe-messaging-client';
import {MessageType} from '../src/3p-frame-messaging';
import {dev, initLogConstructor, setReportError} from '../src/log';
import {dict} from '../src/utils/object';
import {loadScript, setExperimentToggles, validateData} from './3p';

import {tryParseJson} from '../src/json';

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
const RECAPTCHA_API_URL = 'https://www.google.com/recaptcha/api.js?render=';

/** {!IframeMessaginClient|null} **/
let iframeMessagingClient = null;

/**
 * Initialize 3p frame.
 * @param {!Window} win
 */
function init(win) {
  initLogConstructor();
  setReportError(console.error.bind(console));
}

// Immediately call init
init(window);

/**
 * Main function called by the recaptcha bootstrap frame
 */
function recaptcha() {

  // Get the data from our name attribute
  const dataObject = dev().assert(
      typeof window.name === 'string' ? tryParseJson(window.name) : window.name,
      'Could not parse the window name.');

  // Get our sitekey from the iframe name attribute
  const {sitekey} = dataObject;
  const recaptchaApiUrl = RECAPTCHA_API_URL + sitekey;

  loadScript(window, recaptchaApiUrl, function() {
    const {grecaptcha} = window;

    grecaptcha.ready(function() {
      // TODO(@torch2424) Send Ready Event, and listen to actions
      iframeMessagingClient = new IframeMessagingClient(window);
      iframeMessagingClient.setSentinel(dataObject.sentinel);
      iframeMessagingClient.registerCallback(
          'amp-recaptcha-action',
          actionTypeHandler_.bind(this, grecaptcha)
      );
      iframeMessagingClient./*OK*/sendMessage('amp-recaptcha-ready');
    });
  }, function() {
    report3pError(
        TAG + ' Failed to load recaptcha api script'
    );
    dev().error(TAG + ' Failed to load recaptcha api script');
  });
}

/**
 * Function to handle executing actions using the grecaptcha Object,
 * and sending the token back to the parent amp-recaptcha component
 *
 * @param {*} grecaptcha
 * @param {Object} data
 * @private
 */
function actionTypeHandler_(grecaptcha, data) {

  const executePromise = grecaptcha.execute(data.sitekey, {
    action: data.action,
  });

  // .then() promise pollyfilled by recaptcha api script
  executePromise./*OK*/then(function(token) {
    iframeMessagingClient./*OK*/sendMessage('amp-recaptcha-token', dict({
      'id': data.id,
      'token': token,
    }));
  }, function(err) {
    user().error(TAG, err);
    iframeMessagingClient./*OK*/sendMessage('amp-recaptcha-error', dict({
      'id': data.id,
      'error': err.message,
    }));
  });
}

/**
 * Send 3p error to parent iframe
 * @param {!Error} e
 */
function report3pError(e) {
  if (!e.message) {
    return;
  }
  iframeMessagingClient.sendMessage(MessageType.USER_ERROR_IN_IFRAME, dict({
    'message': e.message,
  }));
}


// Finally bind recaptcha to window
window.recaptcha = recaptcha.bind(this);


