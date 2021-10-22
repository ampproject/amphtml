import {validateData, writeScript} from '#3p/3p';

/**
 * @param {string=} input
 * @return {JsonObject|undefined}
 */
function queryParametersToObject(input) {
  if (!input) {
    return undefined;
  }
  return input
    .split('&')
    .filter(Boolean)
    .reduce((obj, val) => {
      const kv = val.split('=');
      return Object.assign(obj, {[kv[0]]: kv[1] || true});
    }, {});
}

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function fusion(global, data) {
  validateData(
    data,
    [],
    ['mediaZone', 'layout', 'adServer', 'space', 'parameters']
  );

  const container = global.document.getElementById('c');
  const ad = global.document.createElement('div');
  ad.setAttribute('data-fusion-space', data.space);
  container.appendChild(ad);
  const parameters = queryParametersToObject(data.parameters);

  writeScript(
    global,
    'https://assets.adtomafusion.net/fusion/latest/fusion-amp.min.js',
    () => {
      global.Fusion.apply(container, global.Fusion.loadAds(data, parameters));

      global.Fusion.on.warning.run((ev) => {
        if (ev.msg === 'Space not present in response.') {
          global.context.noContentAvailable();
        }
      });
    }
  );
}
