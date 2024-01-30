import {validateData, writeScript} from '#3p/3p';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function pixad(global, data) {
  validateData(data, ['adNetwork', 'adPublisher', 'adTypeId']);
  global._pixad = global._pixad || {
    publisher: data['adNetwork'],
    adNetwork: data['adPublisher'],
    adTypeId: data['adTypeId'],
    host: `static.cdn.pixad.com.tr`,
    prefix: `px`,
  };

  if (global._pixad.publisher.indexOf('adm-pub') != -1) {
    global._pixad.host = `static.cdn.admatic.com.tr`;
    global._pixad.prefix = `adm`;
  }

  const ins = global.document.createElement('ins');
  ins.setAttribute('data-publisher', global._pixad.publisher);
  if (global._pixad.adTypeId == 'standard') {
    ins.setAttribute('data-ad-size', `[[${data.width},${data.height}]]`);
  }
  ins.setAttribute('data-ad-network', global._pixad.adNetwork);
  ins.setAttribute('data-ad-type-id', global._pixad.adTypeId);
  ins.setAttribute('class', `${global._pixad.prefix}-ads-area`);
  global.document.getElementById('c').appendChild(ins);
  ins.parentNode.addEventListener(
    'eventAdbladeRenderStart',
    global.context.renderStart()
  );

  writeScript(global, `https://${global._pixad.host}/showad/showad.min.js`);
}
