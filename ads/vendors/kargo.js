import {computeInMasterFrame, loadScript, validateData} from '#3p/3p';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function kargo(global, data) {
  /*eslint "local/camelcase": 0*/

  validateData(data, ['site', 'slot'], ['options']);

  // Kargo AdTag url
  const kargoScriptUrl =
    'https://storage.cloud.kargo.com/ad/network/tag/v3/' + data.site + '.js';

  // parse extra ad call options (optional)
  let options = {};
  if (data.options != null) {
    try {
      options = JSON.parse(data.options);
    } catch (e) {}
  }

  // Add window source reference to ad options
  options.source_window = global;

  computeInMasterFrame(
    global,
    'kargo-load',
    function (done) {
      // load AdTag in Master window
      loadScript(global, kargoScriptUrl, () => {
        let success = false;
        if (global.Kargo != null && global.Kargo.loaded) {
          success = true;
        }

        done(success);
      });
    },
    (success) => {
      if (success) {
        const w = options.source_window;

        // Add reference to Kargo api to this window if it's not the Master window
        if (!w.context.isMaster) {
          w.Kargo = w.context.master.Kargo;
        }

        w.Kargo.getAd(data.slot, options);
      } else {
        throw new Error('Kargo AdTag failed to load');
      }
    }
  );
}
