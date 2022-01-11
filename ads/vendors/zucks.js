import {loadScript, validateData, writeScript} from '#3p/3p';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function zucks(global, data) {
  validateData(data, ['frameId']);
  if (data['adtype'] === 'zoe') {
    loadScript(global, 'https://j.zoe.zucks.net/zoe.min.js', function () {
      const frameId = data['frameId'];
      const elementId = 'zucks-widget-parent';

      const d = global.document.createElement('ins');
      d.id = elementId;
      global.document.getElementById('c').appendChild(d);

      if (data['zoeMultiAd'] !== 'true') {
        (global.gZgokZoeQueue = global.gZgokZoeQueue || []).push({frameId});
      }

      (global.gZgokZoeWidgetQueue = global.gZgokZoeWidgetQueue || []).push({
        frameId,
        parent: `#${elementId}`,
      });
    });
  } else if (data['adtype'] === 'native') {
    const s = global.document.createElement('script');
    s.src = `https://j.zucks.net.zimg.jp/n?f=${data['frameId']}`;
    global.document.getElementById('c').appendChild(s);
  } else {
    writeScript(global, `https://j.zucks.net.zimg.jp/j?f=${data['frameId']}`);
  }
}
