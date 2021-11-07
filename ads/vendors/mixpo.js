import {validateData, writeScript} from '#3p/3p';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function mixpo(global, data) {
  validateData(data, ['guid', 'subdomain']);

  const g = global,
    cdnSubdomain = data.subdomain == 'www' ? 'cdn' : data.subdomain + '-cdn',
    url = data.loader || `https://${cdnSubdomain}.mixpo.com/js/loader.js`;

  g.mixpoAd = {
    amp: true,
    noflash: true,
    width: data.width,
    height: data.height,
    guid: data.guid,
    subdomain: data.subdomain,
    embedv: data.embedv,
    clicktag: data.clicktag,
    customTarget: data.customtarget,
    dynClickthrough: data.dynclickthrough,
    viewTracking: data.viewtracking,
    customCSS: data.customcss,
    local: data.local,
    enableMRAID: data.enablemraid,
    jsPlayer: data.jsplayer,
  };

  writeScript(g, url);
}
