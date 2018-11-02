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

import ampToolboxCacheUrl from
  '../third_party/amp-toolbox-cache-url/dist/amp-toolbox-cache-url.esm';

import {IframeMessagingClient} from './iframe-messaging-client';
import {dev, initLogConstructor, setReportError, user} from '../src/log';
import {dict} from '../src/utils/object';
import {isProxyOrigin, parseUrlDeprecated} from '../src/url';
import {loadScript} from './3p';
import {parseJson} from '../src/json';

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

/** {?IframeMessaginClient} **/
let iframeMessagingClient = null;

/**
 * Initialize 3p frame.
 */
function init() {
  initLogConstructor();
  setReportError(console.error.bind(console));
}

// Immediately call init
init();

/**
 * Main function called by the recaptcha bootstrap frame
 */
window.initRecaptcha = function() {

  const win = window;

  /**
   *  Get the data from our name attribute
   * sitekey {string} - reCAPTCHA sitekey used to identify the site
   * sentinel {string} - string used to psuedo-confirm that we are
   *    receiving messages from the recaptcha frame
   */
  let dataObject;
  try {
    dataObject = parseJson(win.name);
  } catch (e) {
    dev().error(TAG + ' Could not parse the window name.');
    return;
  }

  // Get our sitekey from the iframe name attribute
  dev().assert(
      dataObject.sitekey,
      'The sitekey is required for the <amp-recaptcha-input> iframe'
  );
  const {sitekey} = dataObject;
  const recaptchaApiUrl = RECAPTCHA_API_URL + sitekey;

  loadScript(win, recaptchaApiUrl, function() {
    const {grecaptcha} = win;

    grecaptcha.ready(function() {
      initializeIframeMessagingClient(win, grecaptcha, dataObject);
      iframeMessagingClient./*OK*/sendMessage('amp-recaptcha-ready');
    });
  }, function() {
    dev().error(TAG + ' Failed to load recaptcha api script');
  });
};

/**
 * Function to initialize our IframeMessagingClient
 * @param {Window} win
 * @param {*} grecaptcha
 * @param {Object} dataObject
 */
function initializeIframeMessagingClient(win, grecaptcha, dataObject) {
  iframeMessagingClient = new IframeMessagingClient(win);
  iframeMessagingClient.setSentinel(dataObject.sentinel);
  iframeMessagingClient.registerCallback(
      'amp-recaptcha-action',
      actionTypeHandler.bind(this, win, grecaptcha)
  );
}

/**
 * Function to handle executing actions using the grecaptcha Object,
 * and sending the token back to the parent amp-recaptcha component
 *
 * Data Object will have the following fields
 * sitekey {string} - reCAPTCHA sitekey used to identify the site
 * action {string} - action to be dispatched with grecaptcha.execute
 * id {number} - id given to us by a counter in the recaptcha service
 *
 * @param {Window} win
 * @param {*} grecaptcha
 * @param {Object} data
 */
function actionTypeHandler(win, grecaptcha, data) {
  doesOriginDomainMatchIframeSrc(win, data).then(() => {
    // TODO: @torch2424: Verify sitekey is the same as original
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
      user().error(TAG, '%s', err.message);
      iframeMessagingClient./*OK*/sendMessage('amp-recaptcha-error', dict({
        'id': data.id,
        'error': err.message,
      }));
    });
  }).catch(error => {
    dev().error(TAG, '%s', error.message);
  });
}

/**
 * Function to verify our origin domain from the
 * parent window.
 * @param {Window} win
 * @param {Object} data
 * @return {!Promise}
 */
function doesOriginDomainMatchIframeSrc(win, data) {

  if (!data.origin) {
    return Promise.reject(
        new Error('Could not retreive the origin domain')
    );
  }

  const originLocation = parseUrlDeprecated(data.origin);

  if (originLocation.hostname.includes('localhost') &&
    win.location.hostname.includes('localhost')) {
    return Promise.resolve();
  }

  if (isProxyOrigin(data.origin)) {
    const curlsSubdomain = originLocation.hostname.split('.')[0];
    if (compareCurlsSubdomain(win, curlsSubdomain)) {
      return Promise.resolve();
    }

    return Promise.reject(
        new Error('Origin domain does not match Iframe src: ' + data.origin)
    );
  }

  return ampToolboxCacheUrl.createCurlsSubdomain(data.origin)
      .then(curlsSubdomain => {
        if (compareCurlsSubdomain(win, curlsSubdomain)) {
          return Promise.resolve();
        }

        return Promise.reject(
            new Error('Origin domain does not match Iframe src: ' + data.origin)
        );
      });
}

/**
 * Function to compare curls subdomains with the passed string
 * and window
 * @param {Window} win
 * @param {string} curlsSubdomain
 * @return {boolean}
 */
function compareCurlsSubdomain(win, curlsSubdomain) {
  const iframeSrcCurlsSubdomain = win.location.hostname.split('.')[0];
  if (curlsSubdomain === iframeSrcCurlsSubdomain) {
    return true;
  }
  return false;
}

