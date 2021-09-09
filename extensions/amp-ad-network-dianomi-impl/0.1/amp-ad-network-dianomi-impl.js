import {userAssert} from '../../../src/log';
import {AmpA4A} from '../../amp-a4a/0.1/amp-a4a';

const REQUEST_PARAM_ID = new RegExp(/^.[0-9]*$/);

/**
 * Dianomi ad types
 * @type {string[]}
 * @private
 */
const TYPES = ['smartads', 'recirc', 'context'];

/**
 * Dianomi environments
 * @type {object}
 * @private
 */
const ENVIRONMENTS = {
  dev: 'dev',
  live: 'www',
};

export class AmpAdNetworkDianomiImpl extends AmpA4A {
  /** @override */
  getAdUrl() {
    const paramId = this.element.getAttribute('data-request-param-id');
    const typeAttr = this.element.getAttribute('data-dianomi-type');
    let type = TYPES[0];
    const envAttr = this.element.getAttribute('data-dianomi-env');
    let env = ENVIRONMENTS['live'];

    if (envAttr) {
      assertArray(Object.keys(ENVIRONMENTS), envAttr.toLowerCase(), 'env');
      env = ENVIRONMENTS[envAttr.toLowerCase()];
    }

    if (typeAttr) {
      assertArray(TYPES, typeAttr.toLowerCase(), 'type');
      type = typeAttr.toLowerCase();
    }

    userAssert(
      REQUEST_PARAM_ID.test(paramId),
      'The Dianomi request parameter ID provided is invalid'
    );

    return `https://${env}.dianomi.com/${type}.pl?format=a4a&id=${paramId}`;
  }
}

/**
 * Checks if value is in array and throws error if not
 * @param {Array} arr
 * @param {string} value
 * @param {string} type
 */
function assertArray(arr, value, type) {
  userAssert(
    arr.includes(value),
    `The Dianomi ${type} parameter '${value}' is not a valid input`
  );
}

AMP.extension('amp-ad-network-dianomi-impl', '0.1', (AMP) => {
  AMP.registerElement('amp-ad-network-dianomi-impl', AmpAdNetworkDianomiImpl);
});
