import {validateData, writeScript} from '#3p/3p';

const requiredParams = ['id'];

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function pubfuture(global, data) {
  validateData(data, requiredParams);
  writeScript(global, 'https://cdn.pubfuture-ad.com/amp/js/pt.js');
  global.document.write(
    '<script>pubfuturetag.display("' + data.id + '")</script>'
  );
}
