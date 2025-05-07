import {validateData, writeScript} from '#3p/3p';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function yobee(global, data) {
  validateData(data, ['adNetwork', 'adPublisher', 'adTypeId']);
  global._yobee = global._yobee || {
    adNetwork: data['adPublisher'],
    publisher: data['adNetwork'],
    adTypeId: data['adTypeId'],
    host: `static.cdn.yobee.it`,
    prefix: `ybe`,
  };

  const ins = global.document.createElement('ins');
  ins.setAttribute('data-publisher', global._yobee.publisher);
  if (global._yobee.adTypeId == 'standard') {
    ins.setAttribute('data-ad-size', `[[${data.width},${data.height}]]`);
  }
  ins.setAttribute('data-ad-network', global._yobee.adNetwork);
  ins.setAttribute('data-ad-type-id', global._yobee.adTypeId);
  ins.setAttribute('class', `${global._yobee.prefix}-ads-area`);
  global.document.getElementById('c').appendChild(ins);
  ins.parentNode.addEventListener('eventAdbladeRenderStart', () =>
    global.context.renderStart()
  );
  writeScript(global, `https://${global._yobee.host}/showad/showad.min.js`);
}
