import {writeScript} from '#3p/3p';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function seedingalliance(global, data) {
  writeScript(
    global,
    'https://d.nativendo.de/cds/delivery/init?url=' +
      encodeURIComponent(data.url)
  );
}
