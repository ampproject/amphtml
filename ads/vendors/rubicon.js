import {validateData, writeScript} from '#3p/3p';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function rubicon(global, data) {
  // TODO: check mandatory fields
  validateData(
    data,
    [],
    [
      'account',
      'site',
      'zone',
      'size',
      'kw',
      'visitor',
      'inventory',
      'method',
      'callback',
    ]
  );

  if (data.method === 'smartTag') {
    smartTag(global, data);
  }
}

/**
 * @param {!Window} global
 * @param {!Object} data
 */
function smartTag(global, data) {
  /* eslint-disable */
  global.rp_account = data.account;
  global.rp_site = data.site;
  global.rp_zonesize = data.zone + '-' + data.size;
  global.rp_adtype = 'js';
  global.rp_page = context.sourceUrl;
  global.rp_kw = data.kw;
  global.rp_visitor = data.visitor;
  global.rp_inventory = data.inventory;
  global.rp_amp = 'st';
  global.rp_callback = data.callback;
  /* eslint-enable */
  writeScript(
    global,
    'https://ads.rubiconproject.com/ad/' +
      encodeURIComponent(data.account) +
      '.js'
  );
}
