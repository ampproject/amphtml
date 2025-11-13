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
    data,
  };

  // Early
  console.log('[playwire] early isMaster:', window.context.isMaster, 'name=', window.name);
  
  global.context.slotNumber = data.slotNumber;

  validateData(
    data,
    global.playwire.mandatory_data,
    global.playwire.allowed_data
  );

  computeInMasterFrame(global, 'playwire-load', (done) => {
    loadScript(
      global,
      `https://cdn.intergient.com/amp/amp.js`
    );
  })
}
