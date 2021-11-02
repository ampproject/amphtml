import {loadScript, validateData} from '#3p/3p';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function baidu(global, data) {
  validateData(data, ['cproid']);

  const id = '_' + Math.random().toString(36).slice(2);
  const container = global.document.createElement('div');
  container.id = id;
  global.document.getElementById('c').appendChild(container);

  global.slotbydup = global.slotbydup || [];
  global.slotbydup.push({
    id: data['cproid'],
    container: id,
    display: 'inlay-fix',
    async: true,
  });

  global.addEventListener('message', () => {
    global.context.renderStart();
  });

  loadScript(
    global,
    'https://dup.baidustatic.com/js/dm.js',
    () => {},
    () => {
      // noContentAvailable should be called,
      // if parent iframe receives no message.
      // setTimeout can work, but it's not that reliable.
      // So, only the faliure of JS loading is dealed with for now.
      global.context.noContentAvailable();
    }
  );
}
