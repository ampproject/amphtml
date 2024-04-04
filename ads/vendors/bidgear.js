import {validateData, writeScript} from '#3p/3p';

const requiredParams = ['zoneid'];

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function bidgear(global, data) {
  validateData(data, requiredParams);
  writeScript(global, 'https://platform.bidgear.com/bidgear-amp.js');

  global.document.write(
    '<div id="bg-ssp-' + data.zoneid + '"><script>var bg_id = document.getElementById("bg-ssp-' + data.zoneid + '");bg_id.id = "bg-ssp-' + data.zoneid + '-" + Math.floor(Math.random() * Date.now());window.pubbidgeartag = window.pubbidgeartag || [];window.pubbidgeartag.push({zoneid: ' + data.zoneid + ', id: bg_id.id, wu: window.location.href})</script></div>'
  );
}
