import {validateData, writeScript} from '#3p/3p';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function adenza(global, data) {
  validateData(data, ['blockId']);

  const url =
    'https://adenza.network/network/data/teasers/' +
    encodeURIComponent(data['blockId']) +
    '/script?async=1&div=c';

  const mainBlock = global.document.getElementById('c');
  const insertionBlock = global.document.createElement('div');
  insertionBlock.setAttribute('id', 'pw-net-' + data.blockId);
  mainBlock.append(insertionBlock);

  window.context.observeIntersection(function (changes) {
    changes.forEach(function () {
      const findIframe = global.document
        .getElementById('c')
        .querySelector('iframe');
      if (findIframe) {
        const styleString = findIframe.getAttribute('style');
        const height = getStyleAdenza(styleString, 'height');
        if (height) {
          window.context.requestResize(undefined, height);
        }
      }
    });
  });

  writeScript(
    global,
    url,
    () => {
      global.context.renderStart();
    },
    () => {
      global.context.noContentAvailable();
    }
  );
}

/**
 * @param {string} style
 * @param {string} prop
 * @return {string}
 */
function getStyleAdenza(style, prop) {
  const styleArr = style.split(';');
  const res = styleArr.filter(function (value) {
    return value.includes(prop);
  });
  if (res) {
    return res
      .join('')
      .replace(prop + ':', '')
      .replace(/\s+/g, '');
  } else {
    return '480px';
  }
}
