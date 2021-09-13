import {loadScript, validateData} from '#3p/3p';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function mantisDisplay(global, data) {
  validateData(data, ['property', 'zone'], []);

  global.mantis = global.mantis || [];
  global.mantis.push([
    'display',
    'load',
    {
      property: data['property'],
    },
  ]);

  const d = global.document.createElement('div');
  d.setAttribute('data-mantis-zone', data['zone']);
  global.document.getElementById('c').appendChild(d);

  loadScript(global, 'https://assets.mantisadnetwork.com/mantodea.min.js');
}

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function mantisRecommend(global, data) {
  validateData(data, ['property'], ['css']);

  global.mantis = global.mantis || [];
  global.mantis.push([
    'recommend',
    'load',
    {
      property: data['property'],
      render: 'recommended',
      css: data['css'],
    },
  ]);

  const d = global.document.createElement('div');
  d.setAttribute('id', 'recommended');
  global.document.getElementById('c').appendChild(d);

  loadScript(global, 'https://assets.mantisadnetwork.com/recommend.min.js');
}
