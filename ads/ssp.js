/**
 * Copyright 2019 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *  http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {computeInMasterFrame, loadScript, validateData} from '../3p/3p';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function ssp(global, data) {
  // validate AMP input data- attributes
  validateData(data, ['id', 'width', 'height', 'zoneid'], ['site']);

  // create parent element
  const adWrapper = document.createElement('div');

  adWrapper.id = data.id;

  // https://github.com/ampproject/amphtml/tree/master/ads#the-iframe-sandbox
  global.document.getElementById('c').appendChild(adWrapper);

  // https://github.com/ampproject/amphtml/blob/master/3p/3p.js#L186
  computeInMasterFrame(
    global,
    'ssp-load',
    done => {
      loadScript(global, 'https://ssp.imedia.cz/static/js/ssp.js', () => {
        // Script will inject "sssp" object on Window
        if (!global['sssp']) {
          done(null);

          return;
        }

        /** @type {{config: Function, getAds: Function}} */
        const ssp = global['sssp'];

        ssp.config({
          site: data.site || global.context.canonicalUrl,
        });

        ssp.getAds(
          {
            zoneId: data.zoneid,
            id: data.id,
            width: data.width,
            height: data.height,
          },
          {
            requestErrorCallback: () => done(null),
            AMPcallback: ads => done(ads),
          }
        );
      });
    },
    ads => {
      if (ads && ads[0] && ads[0].type !== 'error') {
        global.context.renderStart();
      } else {
        global.context.noContentAvailable();
      }
    }
  );
}
