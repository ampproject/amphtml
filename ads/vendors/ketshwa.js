import {validateData, writeScript} from '#3p/3p';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function ketshwa(global, data) {
  validateData(data, ['widgetid', 'externalid'], []);

  const {externalid, widgetid} = data;
  const skey = `widget_${widgetid}`;

  const dv = global.document.createElement('div');
  dv.id = skey;
  global.document.getElementById('c').appendChild(dv);

  writeScript(
    global,
    `https://widget-cdn.ketshwa.com/m/p/${widgetid}/${externalid}.js`,
    () => {
      global.KetshwaSDK.showWidget(widgetid, skey);
    }
  );
}
