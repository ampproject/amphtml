import {validateData} from '#3p/3p';

import {setStyles} from '#core/dom/style';

import {parseUrlDeprecated} from '../../src/url';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function cedato(global, data) {
  const requiredParams = ['id'];
  const optionalParams = [
    'domain',
    'servingDomain',
    'subid',
    'version',
    'extraParams',
  ];
  validateData(data, requiredParams, optionalParams);

  if (!data || !data.id) {
    global.context.noContentAvailable();
    return;
  }

  const cb = Math.floor(Math.random() * 10000);
  const domain =
    data.domain || parseUrlDeprecated(global.context.sourceUrl).origin;

  /* Create div for ad to target */
  const playerDiv = global.document.createElement('div');
  playerDiv.id = 'video' + data.id + cb;
  setStyles(playerDiv, {
    width: '100%',
    height: '100%',
  });
  const playerScript = global.document.createElement('script');
  const servingDomain = data.servingDomain
    ? encodeURIComponent(data.servingDomain)
    : 'algovid.com';
  const srcParams = [
    'https://p.' + servingDomain + '/player/player.js',
    '?p=' + encodeURIComponent(data.id),
    '&cb=' + cb,
    '&w=' + encodeURIComponent(data.width),
    '&h=' + encodeURIComponent(data.height),
    data.version ? '&pv=' + encodeURIComponent(data.version) : '',
    data.subid ? '&subid=' + encodeURIComponent(data.subid) : '',
    domain ? '&d=' + encodeURIComponent(domain) : '',
    data.extraParams || '', // already encoded url query string
  ];

  playerScript.onload = () => {
    global.context.renderStart();
  };

  playerScript.src = srcParams.join('');
  playerDiv.appendChild(playerScript);
  global.document.getElementById('c').appendChild(playerDiv);
}
