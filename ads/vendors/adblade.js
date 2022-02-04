import {validateData, writeScript} from '#3p/3p';

const adbladeFields = ['width', 'height', 'cid'];
const adbladeHostname = 'web.adblade.com';
const industrybrainsHostname = 'web.industrybrains.com';

/**
 * @param {string} hostname
 * @param {!Window} global
 * @param {!Object} data
 */
function addAdiantUnit(hostname, global, data) {
  validateData(data, adbladeFields, []);

  // create a data element so our script knows what to do
  const ins = global.document.createElement('ins');
  ins.setAttribute('class', 'adbladeads');
  ins.setAttribute('data-width', data.width);
  ins.setAttribute('data-height', data.height);
  ins.setAttribute('data-cid', data.cid);
  ins.setAttribute('data-host', hostname);
  ins.setAttribute('data-protocol', 'https');
  ins.setAttribute('data-tag-type', 1);
  global.document.getElementById('c').appendChild(ins);

  ins.parentNode.addEventListener(
    'eventAdbladeRenderStart',
    global.context.renderStart()
  );

  // run our JavaScript code to display the ad unit
  writeScript(global, 'https://' + hostname + '/js/ads/async/show.js');
}

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function adblade(global, data) {
  addAdiantUnit(adbladeHostname, global, data);
}

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function industrybrains(global, data) {
  addAdiantUnit(industrybrainsHostname, global, data);
}
