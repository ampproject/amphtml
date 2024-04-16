import {loadScript} from '#3p/3p';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function yieldmo(global, data) {
  const ymElem = global.document.createElement('div');
  ymElem.id = 'ym_' + data.ymid;
  ymElem.className = 'ym';
  ymElem.dataset['ampEnabled'] = true;
  global.document.getElementById('c').appendChild(ymElem);

  const swimLane = Math.round((5 * Math.random()) / 3);
  const ymJs = 'https://static.yieldmo.com/ym.' + swimLane + '.js';

  loadScript(global, ymJs);
}
