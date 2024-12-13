import {loadScript, validateData, writeScript} from '#3p/3p';

import {setStyle} from '#core/dom/style';
import {hasOwn} from '#core/types/object';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function jioads(global, data) {
  global.context.container = `uid${Math.floor(Date.now())}`;
  global.context.initialViewAbility = false;
  validateData(
    data,
    ['adspot', 'pkgName'],
    ['adMetaData', 'refreshRate', 'videoAd']
  );
  if (!data) {
    global.context.noContentAvailable();
    return;
  }
  writeScript(
    global,
    'https://mercury.akamaized.net/jioads/websdk/amp/jioAds.js?rnd=' +
      Math.random()
  );
  loadScript(
    global,
    'https://mercury.akamaized.net/jioads/websdk/amp/ampwrapper.js?rnd=' +
      Math.random(),
    () => {
      let refresh = '';
      let adMetaData = '';
      let video = '';
      let videocontainer = '';
      if (hasOwn(data, 'refreshRate')) {
        refresh = ` data-refresh-rate="${data['refreshRate']}"`;
      }
      if (hasOwn(data, 'adMetaData')) {
        adMetaData = ` data-adMetaData="${data['adMetaData']}"`;
      }
      if (hasOwn(data, 'videoAd') && data['videoAd'] == '1') {
        video = `<div id="instreamContainer" style="width:100%;"></div>`;
        videocontainer = ` data-container-id="instreamContainer"`;
      }
      let html = '';
      const container = document.createElement('div');
      container.classList.add('jads-flex-center', 'jads-f-align-center');
      container.setAttribute('id', 'jads_amp_ad');
      setStyle(
        container,
        'width',
        `${global.context.initialIntersection.boundingClientRect.width}px`
      );
      setStyle(
        container,
        'height',
        `${global.context.initialIntersection.boundingClientRect.height}px`
      );
      html = `${video} <ins id="${global.context.container}"
       data-adspot-key="${data['adspot']}"
       data-source="${data['pkgName']}"
       ${refresh} ${adMetaData} ${videocontainer}></ins>`;
      container./*OK*/ innerHTML = html;
      global.document.getElementById('c').appendChild(container);
    },
    () => {
      global.context.noContentAvailable();
    }
  );
  // addon observation on entering/leaving the view when scroll vertically and horizontally
  window.context.observeIntersection(function (newrequest) {
    /** @type {!Array} */
    (newrequest).forEach(function (data) {
      if (data.intersectionRatio >= 0.5) {
        global.context.initialViewAbility = true;
      } else {
        global.context.initialViewAbility = false;
      }
    });
  });
}
