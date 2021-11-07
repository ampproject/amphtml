import {loadScript, validateData} from '#3p/3p';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function colombia(global, data) {
  validateData(data, [
    'clmb_slot',
    'clmb_position',
    'clmb_section',
    'clmb_divid',
    'loadingStrategy',
  ]);
  // push the two object into the '_colombia' global
  (global._colombia = global._colombia || []).push({
    clmbslot: data.clmb_slot,
    clmbposition: data.clmb_position,
    clmbsection: data.clmb_section,
    clmbdivid: data.clmb_divid,
    gam: data.gam,
    clmbcustom: data.clmb_custom,
  });
  // install observation on entering/leaving the view
  global.context.observeIntersection(function (newrequest) {
    /** @type {!Array} */ (newrequest).forEach(function (d) {
      if (d.intersectionRect.height > 0) {
        global._colombia.push({
          visible: true,
          rect: d,
        });
      }
    });
  });
  loadScript(
    global,
    'https://static.clmbtech.com/ad/commons/js/colombia-amp.js'
  );
}
