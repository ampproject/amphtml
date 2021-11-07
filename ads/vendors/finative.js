import {writeScript} from '#3p/3p';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function finative(global, data) {
  writeScript(
    global,
    'https://d.finative.cloud/cds/delivery/init?url=' +
      encodeURIComponent(data.url)
  );
}
