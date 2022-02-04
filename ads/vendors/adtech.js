import {
  validateData,
  validateSrcContains,
  validateSrcPrefix,
  writeScript,
} from '#3p/3p';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function adtech(global, data) {
  const adsrc = data.src;
  if (typeof adsrc != 'undefined') {
    validateSrcPrefix('https:', adsrc);
    validateSrcContains('/addyn/', adsrc);
    writeScript(global, adsrc);
  } else {
    validateData(
      data,
      ['atwmn', 'atwdiv'],
      [
        'atwco',
        'atwheight',
        'atwhtnmat',
        'atwmoat',
        'atwnetid',
        'atwothat',
        'atwplid',
        'atwpolar',
        'atwsizes',
        'atwwidth',
      ]
    );
    global.atwco = data.atwco;
    global.atwdiv = data.atwdiv;
    global.atwheight = data.atwheight;
    global.atwhtnmat = data.atwhtnmat;
    global.atwmn = data.atwmn;
    global.atwmoat = data.atwmoat;
    global.atwnetid = data.atwnetid;
    global.atwothat = data.atwothat;
    global.atwplid = data.atwplid;
    global.atwpolar = data.atwpolar;
    global.atwsizes = data.atwsizes;
    global.atwwidth = data.atwwidth;
    writeScript(global, 'https://s.aolcdn.com/os/ads/adsWrapper3.js');
  }
}
