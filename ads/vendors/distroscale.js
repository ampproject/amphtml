import {loadScript, validateData} from '#3p/3p';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function distroscale(global, data) {
  validateData(data, ['pid'], ['zid', 'tid']);
  let src = '//c.jsrdn.com/s/cs.js?p=' + encodeURIComponent(data.pid);

  if (data.zid) {
    src += '&z=' + encodeURIComponent(data.zid);
  } else {
    src += '&z=amp';
  }

  if (data.tid) {
    src += '&t=' + encodeURIComponent(data.tid);
  }

  let srcUrl = global.context.sourceUrl;

  srcUrl = srcUrl.replace(/#.+/, '').replace(/\?.+/, '');

  src += '&f=' + encodeURIComponent(srcUrl);

  global.dsAMPCallbacks = {
    renderStart: global.context.renderStart,
    noContentAvailable: global.context.noContentAvailable,
  };
  loadScript(
    global,
    src,
    () => {},
    () => {
      global.context.noContentAvailable();
    }
  );
}
