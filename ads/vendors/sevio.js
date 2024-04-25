import {validateData, loadScript} from '#3p/3p';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function sevio(global, data) {

  validateData(data, ['zone']);

  const container = document.getElementById('c');
  const adDivId = 'sevioads-amp-' + encodeURIComponent(data.zone);
  const adDiv = document.createElement('div');
  adDiv.setAttribute('id', adDivId);
  container.appendChild(adDiv);

  loadScript(
    global,
    'https://adtech.org/wp-content/themes/adtech/assets/js/loader-amp.js?timestamp=' + Date.now(),
    () => {
      window.sevioAmpLoader = window.sevioAmpLoader || [];
      window.sevioAmpLoader.push({
        zoneId: encodeURIComponent(data.zone),
        placeholderId: encodeURIComponent(adDivId),
        wu: window.location.href,
        width: window.innerWidth,
        height: window.innerHeight
      });
    },
    () => {
      global.context.noContentAvailable();
    }
  );
}
