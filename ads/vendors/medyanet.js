import {validateData} from '#3p/3p';

import {setStyles} from '#core/dom/style';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function medyanet(global, data) {
  validateData(data, ['slot', 'domain']);

  global.adunit = data.slot;
  global.size = '[' + data.width + ',' + data.height + ']';
  global.domain = data.domain;

  medyanetAds(global, data);
}

/**
 * @param {!Window} global
 * @param {!Object} data
 */
function medyanetAds(global, data) {
  const f = global.document.createElement('iframe');
  f.setAttribute('id', 'adframe');
  f.setAttribute('width', data.width);
  f.setAttribute('height', data.height);
  f.setAttribute('frameborder', '0');
  f.setAttribute('marginheight', '0');
  f.setAttribute('marginwidth', '0');
  f.setAttribute('allowfullscreen', 'true');
  f.setAttribute('scrolling', 'no');
  setStyles(f, {
    border: '0 none transparent',
    position: 'relative',
  });
  f.onload = function () {
    window.context.renderStart();
  };
  f.src = `https://app.medyanetads.com/amp/medyanetads.html?bidderData=${global.domain}&adunit=${global.adunit}&size=${global.size}`;
  const url = window.top.location.search.substring(1);
  if (url && url.indexOf('hb=true') !== -1) {
    f.src = f.src + '&hb=true';
  }
  global.document.body.appendChild(f);
}
