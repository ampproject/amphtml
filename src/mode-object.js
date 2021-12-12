import {getMode} from './mode';

/**
 * Provides info about the current app. This return value may be cached and
 * passed around as it will always be DCE'd.
 * @param {?Window=} opt_win
 * @return {!./mode.ModeDef}
 */
export function getModeObject(opt_win) {
  return {
    localDev: getMode(opt_win).localDev,
    development: getMode(opt_win).development,
    esm: getMode(opt_win).esm,
    test: getMode(opt_win).test,
    rtvVersion: getMode(opt_win).rtvVersion,
  };
}
