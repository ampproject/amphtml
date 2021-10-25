import {loadScript, validateData} from '#3p/3p';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function ezoic(global, data) {
  // TODO: check mandatory fields
  validateData(data, [], ['slot', 'targeting', 'extras']);
  loadScript(global, 'https://g.ezoic.net/ezoic/ampad.js', () => {
    loadScript(
      global,
      'https://www.googletagservices.com/tag/js/gpt.js',
      () => {
        global.googletag.cmd.push(() => {
          new window.EzoicAmpAd(global, data).createAd();
        });
      }
    );
  });
}
