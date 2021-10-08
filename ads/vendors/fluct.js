import {loadScript, validateData, writeScript} from '#3p/3p';

/* global adingoFluct: false */
/* global fluctAdScript: false */

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function fluct(global, data) {
  validateData(data, ['g', 'u']);

  if (data['tagtype'] === 'api') {
    const cls = `fluct-unit-${data['u']}`;
    const d = global.document.createElement('div');
    d.setAttribute('class', cls);
    global.document.getElementById('c').appendChild(d);

    loadScript(global, 'https://pdn.adingo.jp/p.js', function () {
      fluctAdScript.cmd.push(function (cmd) {
        cmd.loadByGroup(data['g']);
        cmd.display(`.${cls}`, data['u']);
      });
    });
  } else {
    writeScript(
      global,
      `https://cdn-fluct.sh.adingo.jp/f.js?G=${encodeURIComponent(data['g'])}`,
      function () {
        adingoFluct.showAd(data['u']);
      }
    );
  }
}
