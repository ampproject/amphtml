import {loadScript, validateData} from '#3p/3p';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function marfeel(global, data) {
  validateData(data, ['tenant']);

  const {tenant, version} = data;
  const versionQS = version ? `?v=${version}` : '';

  loadScript(global, `https://live.mrf.io/amp-ad/${tenant}/index${versionQS}`);
}
