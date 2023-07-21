import {loadScript, validateData} from '#3p/3p';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function affinity(global, data) {
  validateData(
    data,
    ['width', 'height', 'adtype', ['adslot', 'slot']],
    [
      'affLayout',
      'multiSize',
      'affSticky',
      'affTitle',
      'affJson',
      'affRtcConfig',
      'jsontargeting',
      'extras',
    ]
  );

  const runV1 = function (g, d) {
      if (false === g.isInitCalled) {
        g.isInitCalled = true;
        loadScript(g, gGPT, () => {
          loadScript(g, affCDN + '/amp/v2022/amp.js', () => {
            (function () {
              window.affinity.initAMP(g, d);
            })();
          });
        });
      }
    },
    O2s = Object.prototype.toString,
    isObject = function (val) {
      return '[object Object]' == O2s.call(val);
    },
    chkIsvalidContext = function (mixContext) {
      if ('string' == typeof mixContext) {
        try {
          mixContext = JSON.parse(mixContext);
        } catch (e) {
          return false;
        }
      }
      if (isObject(mixContext) && mixContext.sourceUrl) {
        return true;
      }
      return false;
    },
    getAmpContext = function () {
      if (chkIsvalidContext(W.context)) {
        return W.context;
      }
      if (chkIsvalidContext(W.AMP_CONTEXT_DATA)) {
        return W.AMP_CONTEXT_DATA;
      }

      return undefined;
    },
    jsonParse = function (strJson) {
      let ret = null;
      try {
        ret = JSON.parse(strJson);
      } catch (e) {
        try {
          ret = JSON.parse(strJson.split("'").join('"'));
        } catch (e2) {}
      }
      return ret;
    };
  const W = global,
    affCDN = 'https://cdn4-hbs.affinitymatrix.com',
    gGPT = 'https://securepubads.g.doubleclick.net/tag/js/gpt.js',
    extras = jsonParse(String(data.extras));

  global.affinity = global.affinity || {task: []};
  global.isInitCalled = false;
  global.affinity.initAMP = function (global, data) {
    if (global.isInitCalled == true) {
      return;
    }
    global.isInitCalled = true;
    try {
      const dtObj = new Date();
      const cb = String(dtObj.getDate()) + dtObj.getMonth() + dtObj.getHours();
      const dmn = extras.d.replace('www.', '');

      const cfgData = {...data, ...extras};

      const libUrl = affCDN + '/amplib/' + dmn + '/a' + cb + '/amp.php?t=' + cb;
      loadScript(global, libUrl);
      global.affinity.task.push(function () {
        global.affinity.init(cfgData);
      });
    } catch (e) {
      runV1(global, data);
    }
  };
  try {
    if (getAmpContext() !== undefined) {
      if (extras && extras.ver && extras.ver == 1) {
        // console.log('extras.ver == 1');
        global.affinity.initAMP(global, data);
        data.adStatus = Date.now();
        return;
      }
    }
  } catch (e) {}
  runV1(global, data);
}
