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

import {writeScript, loadScript, validateData} from '../3p/3p';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
/** @type {{nxasync:string}} */
/** @type {{nxv:string}} */
/** @type {{nxsite:string}} */
/** @type {{nxid:string}} */
/** @type {{nxscript:string}} */
/** @type {{nxkey:string}} */
/** @type {{nxunit:string}} */
/** @type {{nxwidth:string}} */
/** @type {{nxheight:string}} */

export function netletix(global, data) {
  /*eslint "google-camelcase/google-camelcase": 0*/
  global._netletix_amp = {
    allowed_data: ['nxasync','nxv','nxsite','nxid','nxscript'],
    mandatory_data: ['nxkey','nxunit','nxwidth','nxheight'],
    data,
  };



  validateData(data,
      global._netletix_amp.mandatory_data, global._netletix_amp.allowed_data);

  const rand = Math.round(Math.random() * 100000000);
  const ls = 'https://call.adadapter.netzathleten-media.de';
  const nxkey = (data.nxkey ? data.nxkey : 'default');
  const nxunit = (data.nxunit ? data.nxunit : 'default');
  const nxwidth = (data.nxwidth ? data.nxwidth : 'fluid');
  const nxheight = (data.nxheight ? data.nxheight : 'fluid');
  const nxv = (data.nxv ? data.nxv : '0002');
  const nxsite = (data.nxsite ? data.nxsite : 'none');
  const url = ls + '/pb/'
    + encodeURIComponent(nxkey)
    + '?unit=' + encodeURIComponent(nxunit)
    + '&width=' + encodeURIComponent(nxwidth)
    + '&height=' + encodeURIComponent(nxheight)
    + '&v=' + encodeURIComponent(nxv)
    + '&site=' + encodeURIComponent(nxsite)
    + '&ord=' + rand;

  console.group('NETLETIX AMP:');

  const receiveNxAction = function(event)
  {
    if (event.data.type && event.data.type.indexOf('nx-') == 0) {
      switch (event.data.type) {
        case 'nx-resize':
          console.info('renderStart - resize if required.');
          const renderconfig = {
            'width': event.data.width,
            'height': event.data.height,
          };
          global.context.renderStart(renderconfig);
          if (event.data.width != nxwidth ||
              event.data.height != nxheight) {
            console.log('Requesting resize to: %s x %s.',
                        event.data.width,
                        event.data.height);
            window.context.requestResize(event.data.width, event.data.height);
          }
          break;
        case 'nx-empty':
          console.info('noContentAvailable - trying collapse.');
          global.context.noContentAvailable();
          break;
        case 'nx-info':
          console.info('Info: %s', event.data.message);
          break;
        case 'nx-identifier':
          console.info('Sending AMP identifier: %s', event.data.identifier);
          window.context.reportRenderedEntityIdentifier(
            event.data.identifier
          );
          break;
        default:
          break;
      }
    }
  };
  window.addEventListener('message', receiveNxAction);
  window.context.onResizeDenied(
    function(requestedHeight, requestedWidth) {
      console.log('Resize failed: %s x %s',requestedHeight, requestedWidth);
    }
  );


  if (data.async && data.async.toLowerCase() === 'true') {
    loadScript(global, url);
  } else {
    writeScript(global, url);
  }
}
