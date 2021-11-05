import {loadScript, validateData} from '#3p/3p';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function freewheel(global, data) {
  /*eslint "local/camelcase": 0*/
  global._freewheel_amp = {
    data,
  };

  validateData(
    data,
    ['zone'],
    [
      'zone',
      'gdpr',
      'gdpr_consent',
      'gdpr_consented_providers',
      'useCCPA_USPAPI',
      '_fw_us_privacy',
      'useCMP',
      'zIndex',
      'blurDisplay',
      'timeline',
      'soundButton',
      'defaultMute',
      'onOver',
      'closeAction',
      'errorAction',
      'pauseRatio',
      'label',
      'vastUrlParams',
    ]
  );

  loadScript(global, 'https://cdn.stickyadstv.com/prime-time/fw-amp.min.js');
}
