import {loadScript, validateData, writeScript} from '#3p/3p';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function pubscale(global, data) {
  // TODO: check mandatory fields
  validateData(
    data,
    ['pid'],
    ['format', 'appid', 'size', 'params', 'load-strategy', 'version']
  );
  global.pubscale = data;
  const VERSION = data['version'] || 'v1';

  const URL = `https://static.pubscale.com/lib/amp/${VERSION}/index.js`;
  const load = data['load-strategy'] !== 'sync' ? writeScript : loadScript;

  load(global, URL);
}
