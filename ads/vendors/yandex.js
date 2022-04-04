import {loadScript, validateData} from '#3p/3p';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function yandex(global, data) {
  validateData(data, ['blockId'], ['data', 'onRender', 'onError']);
  loadScript(global, 'https://yandex.ru/ads/system/context.js', () =>
    renderYandex(global, data)
  );
}

/**
 * @param {!Window} global
 * @param {!Object} data
 */
function renderYandex(global, data) {
  const renderTo = 'yandex_rtb';

  createContainer(global, renderTo);

  global.Ya.Context.AdvManager.render(
    {
      blockId: data.blockId,
      statId: data.statId,
      renderTo,
      data: data.data,
      onRender: () => {
        if (typeof data.onRender === 'function') {
          data.onRender();
        }
        global.context.renderStart();
      },
    },
    () => {
      if (typeof data.onError === 'function') {
        data.onError();
      } else {
        global.context.noContentAvailable();
      }
    }
  );
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
