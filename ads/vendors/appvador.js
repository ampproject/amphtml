import {validateData, writeScript} from '#3p/3p';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function appvador(global, data) {
  validateData(data, ['id'], ['options', 'jsType', 'customScriptSrc']);

  const container = global.document.getElementById('c');
  const apvDiv = global.document.createElement('div');
  apvDiv.setAttribute('id', 'apvad-' + data.id);
  container.appendChild(apvDiv);

  const scriptUrl = data.customScriptSrc
    ? data.customScriptSrc
    : 'https://cdn.apvdr.com/js/' +
      (data.jsType ? encodeURIComponent(data.jsType) : 'VastAdUnit') +
      '.min.js';
  const apvScript =
    'new APV.' +
    (data.jsType ? data.jsType : 'VASTAdUnit') +
    '({s:"' +
    data.id +
    '",isAmpAd:true' +
    (data.options ? ',' + data.options : '') +
    '}).load();';

  const cb = function () {
    const apvLoadScript = global.document.createElement('script');
    apvLoadScript.text = apvScript;
    container.appendChild(apvLoadScript);
  };

  writeScript(global, scriptUrl, cb);
}
