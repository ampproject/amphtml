/**
 * Copyright 2019 The AMP HTML Authors. All Rights Reserved.
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

import {Deferred} from '../../../src/utils/promise';
import {Services} from '../../../src/services';
import {dev, userAssert} from '../../../src/log';
import {hasOwn} from '../../../src/utils/object';
import {isArray, isObject} from '../../../src/types';

export const ATTR_PREFIX = 'amp-x-';
const nameValidator = /^[\w-]+$/;

/**
 * Variants service provides VARIANT variables for the experiment config.
 * @implements {../../../src/render-delaying-services.RenderDelayingService}
 */
export class Variants {
  /**
   * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
   */
  constructor(ampdoc) {
    /** @const */
    this.ampdoc = ampdoc;

    /** @private @const {!Deferred<!Object<string, ?string>>} */
    this.variantsDeferred_ = new Deferred();
  }

  /**
   * @param {!Promise<!Object>} variants
   * @package
   * @restricted
   */
  init(variants) {
    variants.then(result => this.variantsDeferred_.resolve(result));
  }

  /**
   * Returns a promise for the experiment variants.
   * @return {!Promise<!Object<string, ?string>>}
   */
  getVariants() {
    return this.variantsDeferred_.promise;
  }

  /**
   * Function to return a promise for when
   * it is finished delaying render, and is ready.
   * Implemented from RenderDelayingService
   * @return {!Promise}
   */
  whenReady() {
    return this.getVariants();
  }
}

/**
 * Allocates the current page view to an experiment variant based on the given
 * experiment from the config.
 * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
 * @param {!../../../src/service/viewer-impl.Viewer} viewer
 * @param {string} experimentName
 * @param {!JsonObject} experimentObject
 * @return {!Promise<?string>}
 */
export function allocateVariant(
  ampdoc,
  viewer,
  experimentName,
  experimentObject
) {
  assertName(experimentName);
  validateExperiment(experimentName, experimentObject);

  // Variant can be overridden from URL fragment.
  const override = viewer.getParam(ATTR_PREFIX + experimentName);
  if (override && hasOwn(experimentObject['variants'], override)) {
    return Promise.resolve(/** @type {?string} */ (override));
  }

  const sticky = experimentObject['sticky'] !== false;
  const cidScope = experimentObject['cidScope'] || 'amp-experiment';

  let hasConsentPromise = Promise.resolve(true);

  if (sticky && experimentObject['consentNotificationId']) {
    const element = ampdoc.getHeadNode();
    hasConsentPromise = Services.userNotificationManagerForDoc(element)
      .then(manager =>
        manager.getNotification(experimentObject['consentNotificationId'])
      )
      .then(userNotification => {
        userAssert(
          userNotification,
          'Notification not found: ' +
            `${experimentObject['consentNotificationId']}`
        );
        return userNotification.isDismissed();
      });
  }

  return hasConsentPromise.then(hasConsent => {
    if (!hasConsent) {
      return null;
    }
    const group = experimentObject['group'] || experimentName;
    return getBucketTicket(ampdoc, group, sticky ? cidScope : null).then(
      ticket => {
        let upperBound = 0;

        // Loop through keys in a specific order since the default object key
        // enumeration is implementation (browser) dependent.
        const variants = experimentObject['variants'];
        const variantNames = Object.keys(variants).sort();
        for (let i = 0; i < variantNames.length; i++) {
          upperBound += variants[variantNames[i]]['weight'];
          if (ticket < upperBound) {
            return variantNames[i];
          }
        }
        return null;
      }
    );
  });
}

/**
 * Validates an experiment from the config.
 * @param {string} experimentName
 * @param {!JsonObject} experimentObject
 * @throws {!Error}
 */
function validateExperiment(experimentName, experimentObject) {
  const variants = experimentObject['variants'];
  userAssert(
    isObject(variants) && Object.keys(variants).length > 0,
    'Missing variants object from experiment.'
  );
  if (experimentObject['group']) {
    assertName(experimentObject['group']);
  }

  let totalPercentage = 0;
  for (const variantName in variants) {
    if (hasOwn(variants, variantName)) {
      assertName(variantName);

      const variant = variants[variantName];
      assertVariant(variant, experimentName, variantName);

      const percentage = variant['weight'];
      totalPercentage += percentage;
    }
  }
  userAssert(
    totalPercentage./*avoid float precision*/ toFixed(6) <= 100,
    'Total percentage is bigger than 100: ' + totalPercentage
  );
}

/**
 * Returns a float number (bucket ticket) in the range of [0, 100). The number
 * is hashed from the CID of the given scope (opt_cidScope). If the
 * scope is not provided, a random number is used.
 * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
 * @param {string} group
 * @param {string=} opt_cidScope
 * @return {!Promise<number>} a float number in the range of [0, 100)
 */
function getBucketTicket(ampdoc, group, opt_cidScope) {
  if (!opt_cidScope) {
    return Promise.resolve(ampdoc.win.Math.random() * 100);
  }

  const cidPromise = Services.cidForDoc(ampdoc).then(cidService =>
    cidService.get(
      {
        scope: dev().assertString(opt_cidScope),
        createCookieIfNotPresent: true,
      },
      Promise.resolve()
    )
  );

  return Promise.all([cidPromise, Services.cryptoFor(ampdoc.win)])
    .then(results => results[1].uniform(group + ':' + results[0]))
    .then(hash => hash * 100);
}

/**
 * Asserts if the nae is valid.
 * @param {string} name
 */
function assertName(name) {
  userAssert(
    nameValidator.test(name),
    'Invalid name: %s. Allowed chars are [a-zA-Z0-9-_].',
    name
  );
}

/**
 * Validates the variant schema of a config.
 * @param {!JsonObject} variant
 * @param {string} experimentName
 * @param {string} variantName
 * @throws {!Error}
 */
function assertVariant(variant, experimentName, variantName) {
  // Assert that the variant is an object
  userAssert(
    isObject(variant),
    `${experimentName}.variants.${variantName} must be an object.`
  );

  // Assert the variant weight
  userAssert(
    variant['weight'] !== undefined && typeof variant['weight'] === 'number',
    `${experimentName}.variants.${variantName} must have a number weight.`
  );

  // Assert the variant weight is a percentage
  const percentage = variant['weight'];
  userAssert(
    percentage > 0 && percentage < 100,
    'Invalid weight percentage %s.' +
      ` ${experimentName}.variants.${variantName}` +
      ' Has to be greater than 0 and less than 100',
    percentage
  );

  // Assert the variant mutations
  userAssert(
    variant['mutations'] && isArray(variant['mutations']),
    `${experimentName}.variants.${variantName} must have a mutations array.`
  );

  // Assert the variant has mutations
  userAssert(
    variant['mutations'].length > 0,
    `${experimentName}.variants.${variantName} mutations` +
      ' must have at least one mutation.'
  );
}
