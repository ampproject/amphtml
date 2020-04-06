
import {getService, registerServiceBuilder} from '../../../src/service';
import {upgradePolyfill} from '../../../src/polyfills/intersection-observer';

const TAG = 'amp-intersection-observer-polyfill';


/**
 * @param {!Window} win
 */
function install(win) {
  upgradePolyfill(win, () => {
    // QQQQQQ: install polyfill.
    win.IntersectionObserver = win.QqqqInOb;
    win.IntersectionObserverEntry = win.QqqqInObEntry;
  });
  return {};
}

/**
 * Registers the polyfill.
 * @param {!Window} win
 */
export function installIntersectionObserverPolyfill(win) {
  registerServiceBuilder(win, TAG, install, /* instantiate */ true);
}

installIntersectionObserverPolyfill(window);
