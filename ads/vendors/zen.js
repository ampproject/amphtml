import {loadScript, validateData} from '#3p/3p';

const n = 'yandexZenAsyncCallbacks';
const renderTo = 'zen-widget';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function zen(global, data) {
  validateData(
    data,
    ['clid'],
    ['size', 'orientation', 'successCallback', 'failCallback']
  );

  addToQueue(global, data);
  loadScript(global, 'https://zen.yandex.ru/widget-loader');
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

    const {YandexZen} = global;
    const config = Object.assign(data, {
      clid: JSON.parse(data.clid),
      container: `#${renderTo}`,
      isAMP: true,
      successCallback: () => {
        if (typeof data.successCallback === 'function') {
          data.successCallback();
        }
      },
      failCallback: () => {
        if (typeof data.failCallback === 'function') {
          data.failCallback();
        }
      },
    });

    YandexZen.renderWidget(config);
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
