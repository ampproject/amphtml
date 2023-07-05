// src/polyfills.js must be the first import.
import './polyfills';

import {hasOwn} from '#core/types/object';
import {parseJson} from '#core/types/object/json';

import {
  dev,
  devAssert,
  initLogConstructor,
  setReportError,
  user,
} from '#utils/log';

import {loadScript} from './3p';
import {IframeMessagingClient} from './iframe-messaging-client';

import {isProxyOrigin, parseUrlDeprecated} from '../src/url';
import ampToolboxCacheUrl from '../third_party/amp-toolbox-cache-url/dist/amp-toolbox-cache-url.esm';

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

/** @const {string} */
const GLOBAL_RECAPTCHA_API_URL =
  'https://www.recaptcha.net/recaptcha/api.js?render=';

/** {?IframeMessaginClient} */
let iframeMessagingClient = null;

/** {?string} */
let sitekey = null;

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
 * @param {string} recaptchaApiBaseUrl
 */
export function initRecaptcha(recaptchaApiBaseUrl = RECAPTCHA_API_URL) {
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
    throw new Error(TAG + ' Could not parse the window name.');
  }

  // Get our sitekey from the iframe name attribute
  devAssert(
    dataObject.sitekey,
    'The sitekey is required for the <amp-recaptcha-input> iframe'
  );
  sitekey = dataObject.sitekey;
  // Determine the recaptcha api URL based on global property
  devAssert(
    hasOwn(dataObject, 'global'),
    'The global property is required for the <amp-recaptcha-input> iframe'
  );
  if (dataObject.global) {
    recaptchaApiBaseUrl = GLOBAL_RECAPTCHA_API_URL;
  }
  const recaptchaApiUrl = recaptchaApiBaseUrl + sitekey;

  loadScript(
    win,
    recaptchaApiUrl,
    function () {
      const {grecaptcha} = win;

      grecaptcha.ready(function () {
        initializeIframeMessagingClient(win, grecaptcha, dataObject);
        iframeMessagingClient./*OK*/ sendMessage('amp-recaptcha-ready');
      });
    },
    function () {
      dev().error(TAG + ' Failed to load recaptcha api script');
    }
  );
}
window.initRecaptcha = initRecaptcha;

/**
 * Function to initialize our IframeMessagingClient
 * @param {Window} win
 * @param {*} grecaptcha
 * @param {!JsonObject} dataObject
 */
function initializeIframeMessagingClient(win, grecaptcha, dataObject) {
  iframeMessagingClient = new IframeMessagingClient(win, win.parent);
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
 * action {string} - action to be dispatched with grecaptcha.execute
 * id {number} - id given to us by a counter in the recaptcha service
 *
 * @param {Window} win
 * @param {*} grecaptcha
 * @param {object} data
 */
function actionTypeHandler(win, grecaptcha, data) {
  doesOriginDomainMatchIframeSrc(win, data)
    .then(() => {
      const executePromise = grecaptcha.execute(sitekey, {
        action: data.action,
      });

      // .then() promise pollyfilled by recaptcha api script
      executePromise./*OK*/ then(
        function (token) {
          iframeMessagingClient./*OK*/ sendMessage('amp-recaptcha-token', {
            'id': data.id,
            'token': token,
          });
        },
        function (err) {
          let message =
            'There was an error running ' +
            'execute() on the reCAPTCHA script.';
          if (err) {
            message = err.toString();
          }
          user().error(TAG, '%s', message);
          iframeMessagingClient./*OK*/ sendMessage('amp-recaptcha-error', {
            'id': data.id,
            'error': message,
          });
        }
      );
    })
    .catch((error) => {
      dev().error(TAG, '%s', error.message);
    });
}

/**
 * Function to verify our origin domain from the
 * parent window.
 * @param {Window} win
 * @param {object} data
 * @return {!Promise}
 */
export function doesOriginDomainMatchIframeSrc(win, data) {
  if (!data.origin) {
    return Promise.reject(new Error('Could not retreive the origin domain'));
  }

  // Using the deprecated parseUrl here, as we don't have access
  // to the URL service in a 3p frame.
  const originLocation = parseUrlDeprecated(data.origin);

  if (isProxyOrigin(data.origin)) {
    const curlsSubdomain = originLocation.hostname.split('.')[0];
    return compareCurlsDomain(win, curlsSubdomain, data.origin);
  }

  return ampToolboxCacheUrl
    .createCurlsSubdomain(data.origin)
    .then((curlsSubdomain) => {
      return compareCurlsDomain(win, curlsSubdomain, data.origin);
    });
}

/**
 * Function to compare curls domains with the passed subdomain
 * and window
 * @param {Window} win
 * @param {string} curlsSubdomain
 * @param {string} origin
 * @return {!Promise}
 */
function compareCurlsDomain(win, curlsSubdomain, origin) {
  // Get the hostname after the culrs subdomain of the current iframe window
  const locationWithoutCurlsSubdomain = win.location.hostname
    .split('.')
    .slice(1)
    .join('.');
  const curlsHostname = curlsSubdomain + '.' + locationWithoutCurlsSubdomain;

  if (curlsHostname === win.location.hostname) {
    return Promise.resolve();
  }

  return Promise.reject(
    new Error('Origin domain does not match Iframe src: ' + origin)
  );
}
