import {dev} from '#utils/log';

const TAG = 'AMP.require';

/**
 * Allows `require`ing modules exported by non-AMP build code.
 * @param {string} module
 * @return {?}
 */
export function requireExternal(module) {
  const required =
    (AMP.dependencies && AMP.dependencies[module]) ||
    (AMP.require && AMP.require(module));
  if (required) {
    return required;
  } else {
    dev().error(
      TAG,
      'Could not require external module %s.' +
        ' Did you import the bundle in the extension?',
      module
    );
  }
}
