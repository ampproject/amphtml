/**
 * Returns true if executing in a testing environment. Calls may be DCE'd when
 * @param {!Window=} opt_win
 * @return {boolean}
 */
export function isTest(opt_win) {
  if (IS_PROD) {
    return false;
  }
  const win = opt_win || self;
  return !(
    win.AMP_CONFIG?.test === false || win.AMP_CONFIG?.localDev === false
  );
}
