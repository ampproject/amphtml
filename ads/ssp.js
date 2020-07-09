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
import {parseJson} from '../src/json';

/*
 * How to develop:
 * https://github.com/ampproject/amphtml/blob/master/contributing/getting-started-e2e.md
 */

/**
 * @param {!Array.<!Object>} array
 * @param {!Function} iteratee
 *
 * @return {Object}
 */
function keyBy(array, iteratee) {
  return array.reduce(
    (itemById, item) => Object.assign(itemById, {[iteratee(item)]: item}),
    {}
  );
}

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function ssp(global, data) {
  // validate AMP input data- attributes
  validateData(data, ['position'], ['site']);

  let position = {id: -1};

  try {
    position = parseJson(data.position);

    if (position['id'] === undefined) {
      position = {id: -1};
    }
  } catch (error) {}

  if (position['id'] === -1) {
    global.context.noContentAvailable();

    return;
  }

  // This is super important. Without this any variables on context are not shared
  const mW = global.context.isMaster ? global : global.context.master;

  // create parent element
  const parentElement = document.createElement('div');

  parentElement.id = position['id'];

  // https://github.com/ampproject/amphtml/tree/master/ads#the-iframe-sandbox
  global.document.getElementById('c').appendChild(parentElement);

  // https://github.com/ampproject/amphtml/blob/master/3p/3p.js#L186
  computeInMasterFrame(
    global,
    'ssp-load',
    (done) => {
      loadScript(global, 'https://ssp.imedia.cz/static/js/ssp.js', () => {
        // This callback is run just once for amp-ad with same type
        // Script will inject "sssp" object on Window
        if (!global['sssp']) {
          done(false);

          return;
        }

        /** @type {{config: Function, getAds: Function, writeAd: Function}} */
        const ssp = global['sssp'];

        ssp.config({
          site: data.site || global.context.canonicalUrl,
        });

        mW.ssp = ssp;

        done(true);
      });
    },
    (loaded) => {
      if (!loaded) {
        global.context.noContentAvailable();

        return;
      }

      mW.ssp.getAds([position], {
        requestErrorCallback: () => global.context.noContentAvailable(),
        AMPcallback: (ads) => {
          /** @suppress {checkTypes} */
          const adById = keyBy(ads, (item) => item.id);
          const ad = adById[position['id']];

          if (!ad || ['error', 'empty'].includes(ad.type)) {
            global.context.noContentAvailable();

            return;
          }

          // SSP need parentElement as value in "position.id"
          mW.ssp.writeAd(ad, {...position, id: parentElement});

          parentElement.setAttribute(
            'style',
            [
              'position: absolute',
              'top: 50%',
              'left: 50%',
              'transform: translate(-50%, -50%)',
              '-ms-transform: translate(-50%, -50%)',
            ].join('; ')
          );

          const {width, height} = ad;

          global.context.renderStart({width, height});
        },
      });
    }
  );
}
