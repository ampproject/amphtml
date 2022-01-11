import {computeInMasterFrame, loadScript, validateData} from '#3p/3p';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function yieldpro(global, data) {
  validateData(
    data,
    ['sectionId', 'slot', 'pubnetwork'],
    [
      'instance',
      'custom',
      'adServerUrl',
      'cacheSafe',
      'pageIdModifier',
      'click3rd',
      'debugsrc',
    ]
  );
  //TODO support dmp and cookie

  const SCRIPT_HOST = 'creatives.yieldpro.eu/showad_';

  let scriptUrl = 'https://' + SCRIPT_HOST + data['pubnetwork'] + '.js';

  if (data['debugsrc']) {
    scriptUrl = data['debugsrc'];
  }

  computeInMasterFrame(
    global,
    'yieldpro-request',
    (done) => {
      let success = false;
      if (!global.showadAMPAdapter) {
        global.showadAMPAdapter = {
          registerSlot: () => {},
        };
        loadScript(global, scriptUrl, () => {
          if (global.showadAMPAdapter.inited) {
            success = true;
          }
          done(success);
        });
      } else {
        done(true);
      }
    },
    (success) => {
      if (success) {
        global.showadAMPAdapter = global.context.master.showadAMPAdapter;
        global.showadAMPAdapter.registerSlot(data, global);
      } else {
        throw new Error('Yieldpro AdTag failed to load');
      }
    }
  );
}
