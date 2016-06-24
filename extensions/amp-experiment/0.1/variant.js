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

import {isObject} from '../../../src/types';
import {user} from '../../../src/log';

const nameValidator = /^[\w-]+$/;

/**
 * Allocates the current page view to an experiment variant based on the given
 * experiment config.
 * @param {!Window} win
 * @param {!Object} config
 * @return {!Promise<?string>}
 */
export function allocateVariant(win, config) {
  validateConfig(config);

  const cidScope =
      config.cidScope === undefined ? 'amp-experiment' : config.cidScope;

  return getBucketTicket(win, cidScope).then(bucketTicket => {
    let upperBound = 0;

    // Loop through keys in a specific order since the default object key
    // enumeration is implementation (browser) dependent.
    const variantNames = Object.keys(config.variants).sort();
    for (let i = 0; i < variantNames.length; i++) {
      upperBound += config.variants[variantNames[i]];
      if (bucketTicket < upperBound) {
        return variantNames[i];
      }
    }
    return null;
  });
}

/**
 * Validates an experiment config.
 * @param {!Object} config
 * @throws {!Error}
 */
function validateConfig(config) {
  const variants = config.variants;
  user.assert(isObject(variants) && Object.keys(variants).length > 0,
    'Missing experiment variants config.');

  let totalPercentage = 0;
  for (const variantName in variants) {
    if (variants.hasOwnProperty(variantName)) {
      user.assert(nameValidator.test(variantName),
          'Invalid variant name: %s. Allowed chars are [a-zA-Z0-9-_].',
          variantName);

      const percentage = variants[variantName];
      user.assert(
          typeof percentage === 'number' && percentage > 0 && percentage < 100,
          'Invalid percentage %s:%s. Has to be in range of (0,100)',
          variantName, percentage);
      totalPercentage += percentage;
    }
  }
  user.assert(totalPercentage <= 100,
      'Total percentage is bigger than 100: ' + totalPercentage);
}

/**
 * Returns a float number (bucket ticket) in the range of [0, 100). The number
 * is hashed from the CID of the given scope (opt_cidScope). If the
 * scope is not provided, a random number is used.
 * @param {!Window} win
 * @param {string=} opt_cidScope
 * @return {!Promise<!number>} a float number in the range of [0, 100)
 */
function getBucketTicket(win, opt_cidScope) {
  if (opt_cidScope) {
    // TODO(@lannka, #1411): implement hashing with CID
    return Promise.resolve(1);
  } else {
    return Promise.resolve(win.Math.random() * 100);
  }
}
