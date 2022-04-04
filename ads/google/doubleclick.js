import {dev} from '#utils/log';

const TAG = 'DOUBLECLICK - DEPRECATED';
/**
 * @param {!Window} opt_global
 * @param {!Object} opt_data
 */
export function doubleclick(opt_global, opt_data) {
  dev().error(
    TAG,
    'The use of doubleclick.js has been deprecated. Please ' +
      'switch to Fast Fetch. See documentation here: ' +
      'https://github.com/ampproject/amphtml/issues/11834'
  );
}
