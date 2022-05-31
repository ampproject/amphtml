import {sha384} from '#third_party/closure-library/sha384-generated';

import {registerServiceBuilder} from '../../../src/service-helpers';

/**
 * Registers crypto polyfill.
 * @param {!Window} win
 */
export function installCryptoPolyfill(win) {
  registerServiceBuilder(win, 'crypto-polyfill', function () {
    return sha384;
  });
}

installCryptoPolyfill(window);
