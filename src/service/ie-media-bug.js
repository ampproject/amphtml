

import {Services} from '#service';

import {dev} from '../log';

const TAG = 'ie-media-bug';

/**
 * An ugly fix for IE's problem with `matchMedia` API, where media queries
 * are evaluated incorrectly. See #2577 for more details. Returns the promise
 * that will be resolved when the bug is fixed.
 * @param {!Window} win
 * @param {!../service/platform-impl.Platform=} opt_platform
 * @return {?Promise}
 * @package
 */
export function ieMediaCheckAndFix(win, opt_platform) {
  const platform = opt_platform || Services.platformFor(win);
  if (!platform.isIe() || matchMediaIeQuite(win)) {
    return null;
  }

  // Poll until the expression resolves correctly, but only up to a point.
  return new Promise((resolve) => {
    /** @const {number} */
    const endTime = Date.now() + 2000;
    /** @const {number} */
    const interval = win.setInterval(() => {
      const now = Date.now();
      const matches = matchMediaIeQuite(win);
      if (matches || now > endTime) {
        win.clearInterval(interval);
        resolve();
        if (!matches) {
          dev().error(TAG, 'IE media never resolved');
        }
      }
    }, 10);
  });
}

/**
 * @param {!Window} win
 * @return {boolean}
 * @private
 */
function matchMediaIeQuite(win) {
  // The expression is `min-width <= W <= max-width`.
  // In IE `min-width: X` actually compares string `<`, thus we add -1 to
  // `min-width` and add +1 to `max-width`. Given the expression above, it's
  // a non-essential correction by 1px.
  const q =
    `(min-width: ${win./*OK*/ innerWidth - 1}px)` +
    ` AND (max-width: ${win./*OK*/ innerWidth + 1}px)`;
  try {
    return win.matchMedia(q).matches;
  } catch (e) {
    dev().error(TAG, 'IE matchMedia failed: ', e);
    // Return `true` to avoid polling on a broken API.
    return true;
  }
}
