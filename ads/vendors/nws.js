import {validateSrcPrefix, writeScript} from '#3p/3p';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function nws(global, data) {
  const {src} = data;
  validateSrcPrefix(
    [
      'https://tags.nws.ai/',
      'https://echo.nws.press/',
      'https://stories.nws.ai/',
    ],
    src
  );
  writeScript(global, src);
}

// Keep the following for backwards compatibility

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function chargeads(global, data) {
  const {src} = data;
  validateSrcPrefix(
    ['https://www.chargeplatform.com/', 'https://tags.chargeplatform.com/'],
    src
  );
  writeScript(global, src);
}
