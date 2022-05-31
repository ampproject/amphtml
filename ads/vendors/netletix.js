import {loadScript, validateData, writeScript} from '#3p/3p';

import {dev} from '#utils/log';

import {addParamsToUrl, assertHttpsUrl} from '../../src/url';

const NX_URL_HOST = 'https://call.adadapter.netzathleten-media.de';
const NX_URL_PATHPREFIX = '/pb/';
const NX_URL_FULL = NX_URL_HOST + NX_URL_PATHPREFIX;
const DEFAULT_NX_KEY = 'default';
const DEFAULT_NX_UNIT = 'default';
const DEFAULT_NX_WIDTH = 'fluid';
const DEFAULT_NX_HEIGHT = 'fluid';
const DEFAULT_NX_V = '0002';
const DEFAULT_NX_SITE = 'none';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function netletix(global, data) {
  /*eslint "local/camelcase": 0*/
  global._netletix_amp = {
    allowed_data: ['nxasync', 'nxv', 'nxsite', 'nxid', 'nxscript'],
    mandatory_data: ['nxkey', 'nxunit', 'nxwidth', 'nxheight'],
    data,
  };

  validateData(
    data,
    global._netletix_amp.mandatory_data,
    global._netletix_amp.allowed_data
  );

  const nxh = data.nxheight || DEFAULT_NX_HEIGHT;
  const nxw = data.nxwidth || DEFAULT_NX_WIDTH;
  const url = assertHttpsUrl(
    addParamsToUrl(
      NX_URL_FULL + encodeURIComponent(data.nxkey || DEFAULT_NX_KEY),
      {
        'unit': data.nxunit || DEFAULT_NX_UNIT,
        'width': data.nxwidth || DEFAULT_NX_WIDTH,
        'height': data.nxheight || DEFAULT_NX_HEIGHT,
        'v': data.nxv || DEFAULT_NX_V,
        'site': data.nxsite || DEFAULT_NX_SITE,
        'ord': Math.round(Math.random() * 100000000),
      }
    ),
    data.ampSlotIndex
  );

  window.addEventListener('message', (event) => {
    if (
      event.data.type &&
      dev().assertString(event.data.type).startsWith('nx-')
    ) {
      switch (event.data.type) {
        case 'nx-resize':
          const renderconfig = {
            'width': event.data.width,
            'height': event.data.height,
          };
          global.context.renderStart(renderconfig);
          if (
            event.data.width &&
            event.data.height &&
            (event.data.width != nxw || event.data.height != nxh)
          ) {
            global.context.requestResize(event.data.width, event.data.height);
          }
          break;
        case 'nx-empty':
          global.context.noContentAvailable();
          break;
        case 'nx-identifier':
          global.context.reportRenderedEntityIdentifier(event.data.identifier);
          break;
        default:
          break;
      }
    }
  });

  if (data.async && data.async.toLowerCase() === 'true') {
    loadScript(global, url);
  } else {
    writeScript(global, url);
  }
}
