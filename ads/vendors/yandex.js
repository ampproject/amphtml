
import {loadScript, validateData} from '#3p/3p';

const n = 'yandexContextAsyncCallbacks';
const renderTo = 'yandex_rtb';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function yandex(global, data) {
  validateData(data, ['blockId'], ['data', 'onRender', 'onError']);

  addToQueue(global, data);
  loadScript(global, 'https://an.yandex.ru/system/context_amp.js');
}

/**
 * @param {!Window} global
 * @param {!Object} data
 */
function addToQueue(global, data) {
  global[n] = global[n] || [];
  global[n].push(() => {
    // Create container
    createContainer(global, renderTo);

    // Show Ad in container
    global.Ya.Context.AdvManager.render(
      {
        blockId: data.blockId,
        statId: data.statId,
        renderTo,
        data: data.data,
        async: true,
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
  });
}

/**
 * @param {!Window} global
 * @param {string} id
 */
function createContainer(global, id) {
  const d = global.document.createElement('div');
  d.id = id;
  global.document.getElementById('c').appendChild(d);
}
