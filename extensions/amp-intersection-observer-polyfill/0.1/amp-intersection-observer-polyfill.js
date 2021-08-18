

import {installIntersectionObserver} from 'intersection-observer/intersection-observer.install';

import {upgradePolyfill} from '#polyfills/stubs/intersection-observer-stub';

import {maybeSetupCrossOriginObserver} from './cross-origin-observer';

import {registerServiceBuilder} from '../../../src/service-helpers';

const TAG = 'amp-intersection-observer-polyfill';

/**
 * @param {!Window} win
 * @return {!Object}
 */
function upgrade(win) {
  upgradePolyfill(win, () => {
    installIntersectionObserver();
    maybeSetupCrossOriginObserver(win);
  });
  return {};
}

/**
 * Registers the polyfill.
 * @param {!Window} win
 */
export function upgradeIntersectionObserverPolyfill(win) {
  registerServiceBuilder(win, TAG, upgrade, /* instantiate */ true);
}

// eslint-disable-next-line no-unused-vars
AMP.extension(TAG, '0.1', function (AMP) {
  upgradeIntersectionObserverPolyfill(window);
});
