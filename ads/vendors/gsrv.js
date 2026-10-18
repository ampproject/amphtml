import {loadScript, validateData} from '#3p/3p';

import {tryParseJson} from '#core/types/object/json';

import {userAssert} from '#utils/log';

/**
 * gsrv: ad zones served by a GoAdserver ad server. The network's ad
 * controller (goCtrl) renders the zone into the frame and reports to AMP
 * itself: renderStart() with the ad's size once it shows,
 * noContentAvailable() when the zone does not fill.
 * @param {!Window} global
 * @param {!Object} data
 */
export function gsrv(global, data) {
  validateData(data, ['host', 'ctrl', 'zone'], ['plugin', 'options']);
  userAssert(
    /^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$/i.test(
      data['host']
    ),
    'gsrv: data-host must be a host name, e.g. ads.example.com'
  );
  userAssert(/^\d+$/.test(data['ctrl']), 'gsrv: data-ctrl must be a number');
  userAssert(/^\d+$/.test(data['zone']), 'gsrv: data-zone must be a number');
  const plugin = data['plugin'] || 'banner';
  userAssert(/^[a-z_]+$/.test(plugin), 'gsrv: invalid data-plugin');

  const slot = global.document.createElement('div');
  slot.id = 'gsrv-ad';
  global.document.getElementById('c').appendChild(slot);

  // Read by the controller: only with this object (and window.context) does
  // it run in AMP mode.
  global.gsrvAmp = {
    zone: data['zone'],
    plugin,
    display: slot.id,
    extra: tryParseJson(data['options']) || {},
  };

  loadScript(
    global,
    `https://${data['host']}/ctrl/${data['ctrl']}.js`,
    undefined,
    () => global.context.noContentAvailable()
  );
}
