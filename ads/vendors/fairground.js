import {validateData, loadScript} from '#3p/3p';
import {setStyles} from "#core/dom/style";

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function fairground(global, data) {
  validateData(data, ['adType', 'id']);

  const { adType, id } = data

  if (adType === 'campaign') {
    loadScript(global, `http://127.0.0.1:8081/${id}/script.js`);
  }
  else if (adType === 'embed') {
    createIframe(global,  `http://127.0.0.1:3000/embed/${id}`);
  }
  else {
    console.warn(
      `%cFairground%c adType '${adType}' does not exist`,
      'font-weight: bold; color: white; background: red; border-radius: 5px; padding: 1px 3px; font-size:11px;',
      'color: green; font-size:13px;'
    )
  }
}

/**
 * @param {!Window} global
 * @param {!String} url
 **/
function createIframe(global, url) {

  if (url) {
    const iframe = global.document.createElement('iframe');

    iframe.setAttribute('class', 'fairground-iframe');
    iframe.setAttribute('frameborder', '0');
    iframe.setAttribute('marginheight', '0');
    iframe.setAttribute('marginwidth', '0');
    iframe.setAttribute('scrolling', 'no');
    iframe.setAttribute('src', url);

    setStyles(iframe, {
      border: '0 none transparent',
      position: 'relative',
      height: '100%',
      width: '100%',
    });

    global.document.getElementById('c').appendChild(iframe);
  }

}
