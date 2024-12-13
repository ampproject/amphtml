import {Deferred} from '#core/data-structures/promise';
import {isObject} from '#core/types';
import {hasOwn} from '#core/types/object';

import {Services} from '#service';

import {dev, userAssert} from '#utils/log';

const ATTR_PREFIX = 'amp-x-';
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

    /** @private @const {!Deferred<!{[key: string]: ?string}>} */
    this.variantsDeferred_ = new Deferred();
  }

  /**
   * @param {!{[key: string]: ?string}|!Promise<!{[key: string]: ?string}>} variants
   * @package
   * @restricted
   */
  init(variants) {
    this.variantsDeferred_.resolve(variants);
  }

  /**
   * Returns a promise for the experiment variants.
   * @return {!Promise<!{[key: string]: ?string}>}
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
 * experiment config.
 * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
 * @param {string} experimentName
 * @param {!JsonObject} config
 * @return {!Promise<?string>}
 */
export function allocateVariant(ampdoc, experimentName, config) {
  assertName(experimentName);
  validateConfig(config);

  // Variant can be overridden from URL fragment.
  const override = ampdoc.getParam(ATTR_PREFIX + experimentName);
  if (override && hasOwn(config['variants'], override)) {
    return Promise.resolve(override);
  }

  const sticky = config['sticky'] !== false;
  const cidScope = config['cidScope'] || 'amp-experiment';

  let hasConsentPromise = Promise.resolve(true);

  if (sticky && config['consentNotificationId']) {
    const element = ampdoc.getHeadNode();
    hasConsentPromise = Services.userNotificationManagerForDoc(element)
      .then((manager) =>
        manager.getNotification(config['consentNotificationId'])
      )
      .then((userNotification) => {
        userAssert(
          userNotification,
          `Notification not found: ${config['consentNotificationId']}`
        );
        return userNotification.isDismissed();
      });
  }

  return hasConsentPromise.then((hasConsent) => {
    if (!hasConsent) {
      return null;
    }
    const group = config['group'] || experimentName;
    return getBucketTicket(ampdoc, group, sticky ? cidScope : null).then(
      (ticket) => {
        let upperBound = 0;

        // Loop through keys in a specific order since the default object key
        // enumeration is implementation (browser) dependent.
        const variantNames = Object.keys(config['variants']).sort();
        for (let i = 0; i < variantNames.length; i++) {
          upperBound += config['variants'][variantNames[i]];
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
 * Validates an experiment config.
 * @param {!JsonObject} config
 * @throws {!Error}
 */
function validateConfig(config) {
  const variants = config['variants'];
  userAssert(
    isObject(variants) && Object.keys(variants).length > 0,
    'Missing experiment variants config.'
  );
  if (config['group']) {
    assertName(config['group']);
  }
  let totalPercentage = 0;
  for (const variantName in variants) {
    if (hasOwn(variants, variantName)) {
      assertName(variantName);
      const percentage = variants[variantName];
      userAssert(
        typeof percentage === 'number' && percentage > 0 && percentage < 100,
        'Invalid percentage %s:%s.' +
          ' Has to be greater than 0 and less than 100',
        variantName,
        percentage
      );
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

  const cidPromise = Services.cidForDoc(ampdoc).then((cidService) =>
    cidService.get(
      {
        scope: dev().assertString(opt_cidScope),
        createCookieIfNotPresent: true,
      },
      Promise.resolve()
    )
  );

  return Promise.all([cidPromise, Services.cryptoFor(ampdoc.win)])
    .then((results) => results[1].uniform(group + ':' + results[0]))
    .then((hash) => hash * 100);
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
