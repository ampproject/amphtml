import {loadScript, validateData} from '#3p/3p';

const mandatoryParams = ['id'];
const optionalParams = ['fluid'];

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function playstream(global, data) {
  /*eslint "local/camelcase": 0*/
  global.playstream = {
    unitData: data['id'],
    fluid: data['fluid'],
  };
  validateData(data, mandatoryParams, optionalParams);
  const searchParams = new URLSearchParams(data);
  loadScript(
    global,
    'https://app.playstream.media/js/amp.js?' + searchParams.toString()
  );
}
