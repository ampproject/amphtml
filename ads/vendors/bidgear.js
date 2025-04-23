import {loadScript, validateData} from '#3p/3p';

const requiredParams = ['zoneid'];

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function bidgear(global, data) {
  validateData(data, requiredParams);

  const container = document.getElementById('c');
  const adDivId = 'bg-ssp-' + encodeURIComponent(data.zoneid);
  const adDiv = document.createElement('div');
  adDiv.setAttribute('id', adDivId);
  container.appendChild(adDiv);

  loadScript(
    global,
    'https://platform.bidgear.com/bidgear-amp.js',
    () => {
      // Bidgear has been loaded
      window.pubbidgeartag = window.pubbidgeartag || [];
      window.pubbidgeartag.push({
        zoneid: encodeURIComponent(data.zoneid),
        id: encodeURIComponent(adDivId),
        wu: window.location.href,
      });
    },
    () => {
      // Cannot load bidgear-amp.js
      global.context.noContentAvailable();
    }
  );
}
