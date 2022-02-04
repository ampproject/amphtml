import {upgradePolyfill} from '#polyfills/stubs/resize-observer-stub';

import {registerServiceBuilder} from '../../../src/service-helpers';
import {installResizeObserver} from '../../../third_party/resize-observer-polyfill/ResizeObserver.install';

const TAG = 'amp-resize-observer-polyfill';

/**
 * @param {!Window} win
 * @return {!Object}
 */
function upgrade(win) {
  upgradePolyfill(win, () => {
    installResizeObserver(win);
  });
  return {};
}

/**
 * Registers the polyfill.
 * @param {!Window} win
 */
export function upgradeResizeObserverPolyfill(win) {
  registerServiceBuilder(win, TAG, upgrade, /* instantiate */ true);
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
AMP.extension(TAG, '0.1', function (AMP) {
  upgradeResizeObserverPolyfill(window);
});
