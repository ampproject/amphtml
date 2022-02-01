import {validateData, writeScript} from '#3p/3p';

import {setStyle} from '#core/dom/style';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function inmobi(global, data) {
  validateData(data, ['siteid', 'slotid'], []);

  const inmobiConf = {
    siteid: data.siteid,
    slot: data.slotid,
    manual: true,
    onError: (code) => {
      if (code == 'nfr') {
        global.context.noContentAvailable();
        setStyle(document.getElementById('my-ad-slot'), 'display', 'none');
      }
    },
    onSuccess: () => {
      global.context.renderStart();
    },
  };

  writeScript(global, 'https://cf.cdn.inmobi.com/ad/inmobi.secure.js', () => {
    global.document.write("<div id='my-ad-slot'></div>");
    global._inmobi.getNewAd(document.getElementById('my-ad-slot'), inmobiConf);
  });
}
