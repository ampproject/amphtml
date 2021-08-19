import {validateData, validateSrcPrefix, writeScript} from '#3p/3p';

// Valid adform ad source hosts
const hosts = {
  track: 'https://track.adform.net',
  adx: 'https://adx.adform.net',
  a2: 'https://a2.adform.net',
  adx2: 'https://adx2.adform.net',
  asia: 'https://asia.adform.net',
  adx3: 'https://adx3.adform.net',
};

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function adform(global, data) {
  validateData(data, [['src', 'bn', 'mid']]);
  global.Adform = {ampData: data};
  const {bn, mid, src} = data;
  let url;

  // Custom ad url using "data-src" attribute
  if (src) {
    validateSrcPrefix(
      Object.keys(hosts).map((type) => hosts[type]),
      src
    );
    url = src;
  }
  // Ad tag using "data-bn" attribute
  else if (bn) {
    url = hosts.track + '/adfscript/?bn=' + encodeURIComponent(bn) + ';msrc=1';
  }
  // Ad placement using "data-mid" attribute
  else if (mid) {
    url = hosts.adx + '/adx/?mid=' + encodeURIComponent(mid);
  }

  writeScript(global, url);
}
