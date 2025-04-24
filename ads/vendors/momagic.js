import {validateData} from '#3p/3p';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function momagic(global, data) {
  validateData(data, ['publisher', 'container'], ['format', 'url', 'extras']);

  const scriptRoot = document.createElement('div');
  scriptRoot.id = data.container;

  document.body.appendChild(scriptRoot);

  let url = '';

  if (data.format) {
    url =
      `https://amp.truereach.co.in/publisher/${encodeURIComponent(data.publisher)}/${encodeURIComponent(data.format)}/` +
      `truereachAdRender.js?t=` +
      Math.floor(Date.now() / 36e5);
  } else {
    url =
      `https://amp.truereach.co.in/publisher/${encodeURIComponent(data.publisher)}/` +
      `truereachAdRender.js?t=` +
      Math.floor(Date.now() / 36e5);
  }

  // Path to Script
  const pathtoscript = data.url ? data.url : url;
  loadScriptNew(pathtoscript, function () {
    global.momagicAmpInit(data);
  });
}

/**
 * Load the script asynchronously
 * @param {string} url
 * @param {!Function} callback
 */
function loadScriptNew(url, callback) {
  const script = document.createElement('script');
  script.type = 'text/javascript';
  if (script.readyState) {
    // only required for IE <9
    script.onreadystatechange = function () {
      if (script.readyState === 'loaded' || script.readyState === 'complete') {
        script.onreadystatechange = null;
        callback();
      }
    };
  } else {
    //Others
    script.onload = function () {
      callback();
    };
  }
  script.id = 'interactive_js_ampcode';
  script.defer = true;
  script.src = url;
  document.getElementsByTagName('head')[0].appendChild(script);
}
