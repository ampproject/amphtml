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

import {loadScript} from './3p';

import {camelCaseToDash, dashToUnderline} from '../src/string';
import {dict} from '../src/utils/object';
import {user} from '../src/log';

const CONFIG = {
  debug: false,
  forceWidget: null,
  loginButtonEnabled: true,
  signatureEnabled: true,
  userIsPremium: false,
  videoClient: 'vast',
  customSegment: null,
  cookiesEnabled: false,
};

const EVENTS = [
  'lock',
  'release',
  'hidden',
  'disabled',
  'register',
  'error',
  'adblock',
  'outdatedBrowser',
  'userOutsideCohort',
  'identityAvailable',
  'subscribeClick',
  'loginClick',
  'dataPolicyClick',
];

/**
 * Produces the Poool SDK object for the passed in callback.
 *
 * @param {!Window} global
 * @param {function(!Object)} cb
 */
function getPooolSDK(global, cb) {
  loadScript(global, 'https://assets.poool.fr/poool.min.js', function() {
    cb(global.poool);
  });
}

export function poool(global, data) {

  // Check for required attributes
  const bundleID = user().assert(
      data.appId,
      'The data-app-id attribute is required for <amp-poool> %s',
      data.element
  );

  const pageType = user().assert(
      data.pageType,
      'The data-page-type attribute is required for <amp-poool> %s',
      data.element
  );

  // Create paywall container
  const container = document.createElement('div');
  container.id = 'poool-widget';
  global.document.querySelector('#c').appendChild(container);

  getPooolSDK(global, _poool => {

    // Init poool
    _poool('init', bundleID);
    _poool('config', 'mode', 'custom', true);
    _poool('event', 'onIdentityAvailable', function() {
      const size = container.getBoundingClientRect();
      global.context.updateDimensions(size.width, size.height);
    });

    // Set config
    for (const configEntry in Object.entries(CONFIG)) {
      const configKey = configEntry[0],
          configDefaultValue = configEntry[1];

      const configValue = data[configKey] || configDefaultValue;

      if (configValue) {
        _poool('config', dashToUnderline(camelCaseToDash(configKey)),
            configValue);
      }
    }

    // Set event handlers
    for (const eventName in EVENTS) {
      _poool(
          'event',
          `on${eventName[0].toUpperCase()}${eventName.slice(1)}`,
          function(eventData) {
            const message = JSON.stringify(dict({
              'action': eventName,
              'data': eventData,
            }));

            global.parent.postMessage(message, '*');
          }
      );
    }

    // Create hit
    _poool('send', 'page-view', pageType);

  });
}
