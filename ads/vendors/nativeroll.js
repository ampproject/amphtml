import {loadScript, validateData} from '#3p/3p';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function nativeroll(global, data) {
  validateData(data, ['gid']);
  loadScript(
    global,
    'https://cdn01.nativeroll.tv/js/seedr-player.min.js',
    () => {
      initPlayer(global, data);
    }
  );
}

/**
 * @param {!Window} global
 * @param {!Object} data
 */
function initPlayer(global, data) {
  const config = {
    container: '#c',
    desiredOffset: 50,
    gid: data.gid,
    onError: () => {
      global.context.noContentAvailable();
    },
    onLoad: () => {
      const height =
        global.document.getElementsByClassName('nr-player')[0]
          ./* OK */ offsetHeight;
      global.context.requestResize(undefined, height);
    },
    onDestroy: () => {
      global.context.noContentAvailable();
    },
  };
  // eslint-disable-next-line no-undef
  SeedrPlayer(config);
}
