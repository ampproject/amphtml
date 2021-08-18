import {computeInMasterFrame, loadScript, validateData} from '#3p/3p';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function swoop(global, data) {
  // Required properties
  validateData(data, ['layout', 'placement', 'publisher', 'slot']);

  computeInMasterFrame(
    global,
    'swoop-load',
    (done) => {
      global.swoopIabConfig = data;

      loadScript(global, 'https://www.swoop-amp.com/amp.js', () =>
        done(global.Swoop != null)
      );
    },
    (success) => {
      if (success) {
        if (!global.context.isMaster) {
          global.context.master.Swoop.announcePlace(global, data);
        }
      } else {
        global.context.noContentAvailable();
        throw new Error('Swoop failed to load');
      }
    }
  );
}
