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

import {computeInMasterFrame, loadScript, validateData} from '#3p/3p';

import {setStyle, setStyles} from '#core/dom/style';
import {parseJson} from '#core/types/object/json';

/*
 * How to develop:
 * https://github.com/ampproject/amphtml/blob/main/docs/getting-started-e2e.md
 */

/**
 * @param {!Array.<!Object>} array
 * @param {!Function} iteratee
 *
 * @return {object}
 */
export function keyBy(array, iteratee) {
  return array.reduce(
    (itemById, item) => Object.assign(itemById, {[iteratee(item)]: item}),
    {}
  );
}

/**
 * @param {!Object} fetchingSSPs
 * @param {!Function} cb
 */
export function runWhenFetchingSettled(fetchingSSPs, cb) {
  const sspCleanupInterval = setInterval(() => {
    if (!Object.keys(fetchingSSPs).length) {
      clearInterval(sspCleanupInterval);
      cb();
    }
  }, 100);
}

/**
 * @param {!Element} element
 * @param {boolean} center
 * @param {object} dimensions
 */
export function handlePosition(element, center, dimensions) {
  const styles = {
    ...(center
      ? {
          position: 'absolute',
          top: '50%',
          left: '50%',
          'max-width': '100%',
          transform: 'translate(-50%, -50%)',
          '-ms-transform': 'translate(-50%, -50%)',
        }
      : {}),
    ...(dimensions || {}),
  };
  setStyles(element, styles);
}

/**
 * @param {!MessageEvent} e
 * @param {!Element} element
 */
export function handlePositionResponsive(e, element) {
  try {
    const {height} = JSON.parse(e.data);
    if (height) {
      handlePosition(element, true, {
        height: `${height}px`,
      });
    }
  } catch (e) {
    // no-op
  }
}

/**
 * @param {number} availableWidth
 * @param {!Object} data
 * @return {?Object}
 */
export function sizeAgainstWindow(availableWidth, data) {
  if (data.width > availableWidth) {
    const newWidth = availableWidth;
    const newHeight = data.height / (data.width / availableWidth);
    return {width: newWidth, height: newHeight};
  }
}

/**
 * @param {!Element} element
 */
export function forceElementReflow(element) {
  // force reflow
  setStyle(element, 'display', 'none');
  element./*OK*/ offsetHeight;
  setStyle(element, 'display', 'block');
}

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function ssp(global, data) {
  // validate AMP input data- attributes
  validateData(data, ['position'], ['site', 'said']);

  let position = {id: -1};

  try {
    position = parseJson(data.position);

    if (position['id'] === undefined) {
      position = {id: -1};
    }
  } catch (error) {
    global.context.noContentAvailable();
    return;
  }

  if (position['id'] === -1) {
    global.context.noContentAvailable();
    return;
  }

  // This is super important. Without this any variables on context are not shared
  const mW = global.context.isMaster ? global : global.context.master;

  // create parent element
  const parentElement = document.createElement('div');

  parentElement.id = position['id'];

  // https://github.com/ampproject/amphtml/tree/main/ads#the-iframe-sandbox
  global.document.getElementById('c').appendChild(parentElement);

  // validate dimensions against available space (window)
  const sizing = sizeAgainstWindow(parentElement./*OK*/ clientWidth, data);

  // https://github.com/ampproject/amphtml/blob/main/3p/3p.js#L186
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
        const sssp = global['sssp'];

        sssp.config({
          site: data.site || global.context.canonicalUrl,
          said: data.said || null,
        });

        // propagate relevant data across all ad units
        mW.sssp = sssp;
        mW.fetchingSSPs = {};

        done(true);
      });
    },
    (loaded) => {
      if (!loaded) {
        global.context.noContentAvailable();
        return;
      }

      // perform cleanup only after all SSP XHRs are settled
      const noContent = () => {
        runWhenFetchingSettled(mW.fetchingSSPs, () =>
          global.context.noContentAvailable()
        );
      };

      // register XHR and start fetching
      mW.fetchingSSPs[position.zoneId] = true;

      mW.sssp.getAds([position], {
        // todo on SSP side (option to register error callback)
        // requestErrorCallback: () => {},
        AMPcallback: (ads) => {
          const adById = keyBy(ads, (item) => item.id);
          const ad = adById[position['id']];

          if (!ad || ['error', 'empty'].includes(ad.type)) {
            noContent();
          } else {
            // listen to message with "height" property -> for responsive ads (111x111) -> set new height / center
            if (ad.responsive) {
              global.addEventListener('message', (e) => {
                handlePositionResponsive(e, parentElement);
              });
            }

            // listen to intersections and force element reflow (external DSPs)
            if (['APPNEXUS', 'PUBMATIC', 'PUBMATIC2'].includes(ad.dsp)) {
              global.context.observeIntersection(() => {
                forceElementReflow(parentElement);
              });
            }

            // SSP need parentElement as value in "position.id"
            mW.sssp.writeAd(ad, {...position, id: parentElement});

            // init dimensions / centering
            const d = ad.responsive ? {width: '100%', height: '100%'} : null;
            handlePosition(parentElement, true, d);
            global.context.renderStart(sizing);
          }

          // unregister XHR
          delete mW.fetchingSSPs[position.zoneId];
        },
      });
    }
  );
}
