import {isProd} from './prod';
import {isTest} from './test';

/**
 * Returns true if executing in a local development or testing environment.
 * Calls may be DCE'd when compiled based on isForDistribution and isTest.
 *
 * @param {Window=} opt_win
 * @return {boolean}
 */
export function isLocalDev(opt_win) {
  if (isProd()) {
    return false;
  }

  return !!self.AMP_CONFIG?.localDev || isTest(opt_win);
}
