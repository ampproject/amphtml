import { loadScript, validateData, computeInMasterFrame } from '#3p/3p';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function playwire(global, data) {
  /*eslint "local/camelcase": 0*/
  global.playwire = {
    allowed_data: ['publisher', 'website', 'slot', 'path', 'slotNumber'],
    mandatory_data: ['publisher', 'website', 'slot'],
    isAmp: true,
    data,
  };

  validateData(
    data,
    global.playwire.mandatory_data,
    global.playwire.allowed_data
  );

  loadScript(
    global,
    `https://cdn.intergient.com/amp/amp.js`
  );
}
