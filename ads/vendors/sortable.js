import {loadScript, validateData} from '#3p/3p';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function sortable(global, data) {
  validateData(data, ['site', 'name'], ['responsive']);

  const slot = global.document.getElementById('c');
  const ad = global.document.createElement('div');
  const size =
    data.responsive === 'true' ? 'auto' : data.width + 'x' + data.height;
  ad.className = 'ad-tag';
  ad.setAttribute('data-ad-name', data.name);
  ad.setAttribute('data-ad-size', size);
  slot.appendChild(ad);
  loadScript(
    global,
    'https://tags-cdn.deployads.com/a/' + encodeURIComponent(data.site) + '.js'
  );
}
