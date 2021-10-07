import {loadScript, validateData} from '#3p/3p';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function adfox(global, data) {
  validateData(data, ['adfoxParams', 'ownerId']);
  loadScript(global, 'https://yandex.ru/ads/system/context.js', () =>
    renderAdFox(global, data)
  );
}

/**
 * @param {!Window} global
 * @param {!Object} data
 */
function renderAdFox(global, data) {
  const renderTo = 'adfox_container';

  createContainer(global, renderTo);

  global.Ya.adfoxCode.create({
    ownerId: data.ownerId,
    containerId: renderTo,
    params: JSON.parse(data.adfoxParams),
    onRender: () => global.context.renderStart(),
    onError: () => global.context.noContentAvailable(),
    onStub: () => global.context.noContentAvailable(),
  });
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
