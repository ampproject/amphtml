

import {loadScript, validateData} from '#3p/3p';
import {yandex} from './yandex';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function adfox(global, data) {
  validateData(data, ['adfoxParams', 'ownerId']);
  loadScript(global, 'https://yastatic.net/pcode/adfox/loader.js', () =>
    initAdFox(global, data)
  );
}

/**
 * @param {!Window} global
 * @param {Object} data
 */
function initAdFox(global, data) {
  const params = JSON.parse(data.adfoxParams);

  createContainer(global, 'adfox_container');

  global.Ya.adfoxCode.create({
    ownerId: data.ownerId,
    containerId: 'adfox_container',
    params,
    onLoad: (data, onRender, onError) => {
      checkLoading(global, data, onRender, onError);
    },
    onRender: () => global.context.renderStart(),
    onError: () => global.context.noContentAvailable(),
    onStub: () => global.context.noContentAvailable(),
  });
}

/**
 * @param {!Window} global
 * @param {!Object} data
 * @param {!Object} onRender
 * @param {!Object} onError
 * @return {boolean}
 */
function checkLoading(global, data, onRender, onError) {
  if (data.bundleName === 'banner.direct') {
    const dblParams = {
      blockId: data.bundleParams.blockId,
      data: data.bundleParams.data,
      onRender,
      onError,
    };

    yandex(global, dblParams);
    return false;
  }
  return true;
}

/**
 * @param {!Window} global
 * @param {string} id
 */
function createContainer(global, id) {
  const container = global.document.createElement('div');
  container.setAttribute('id', id);
  global.document.getElementById('c').appendChild(container);
}
