import {isProd} from './prod';

/**
 * Returns true if executing in a testing environment. Calls may be DCE'd when
 * compiled based on isForDistribution.
 * @param {Window=} opt_win
 * @return {boolean}
 */
export function isTest(opt_win) {
  if (isProd()) {
    return false;
  }
  const win = opt_win || self;
  return !!(win.AMP_CONFIG?.test || win.__AMP_TEST || win['__karma__']);
}
