import {loadScript} from '#3p/3p';

import {dev} from '#utils/log';

/**
 * @param {!Window} global
 * @param {!Object} data
 */

export function _4wmarketplace(global, data) {
  const $4wm = global;
  console.log('------------------------------------------------4W------------------------------------------------')
  console.log(data)
  const obj = {
                  cid: 'c',
                  ic: data.id,
                  dim: data.dim ? data.dim : null,

                };
  console.log(obj)

  $4wm.obj_4w = [];
  $4wm.obj_4w.push(obj);

  console.log($4wm)

  loadScript($4wm, 'https://next-vagrant.4wmarketplace.com/js/sdk.min.js?v=0', () => {
    console.log('°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°4W------------------------------------------------')

    console.log(obj_4w)
  });
}


