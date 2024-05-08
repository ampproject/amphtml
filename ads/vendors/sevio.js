import {loadScript, validateData} from '#3p/3p';

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
    'https://cdn.adx.ws/scripts/amp.js',
    () => {
      window.sevioAmpLoader = window.sevioAmpLoader || [];
      window.sevioAmpLoader.push({
        zoneId: encodeURIComponent(data.zone),
        placeholderId: encodeURIComponent(adDivId),
        wu: window.location.href,
        width: data.width,
        height: data.height,
      });
    },
    () => {
      global.context.noContentAvailable();
    }
  );
}
