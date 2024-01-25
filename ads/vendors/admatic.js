import {validateData, writeScript} from '#3p/3p';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function admatic(global, data) {
  validateData(data, ['adNetwork', 'adPublisher', 'adTypeId']);
  global._admatic = global._admatic || {
    publisher: data['adNetwork'],
    adNetwork: data['adPublisher'],
    adTypeId: data['adTypeId'],
    host: `static.cdn.pixad.com.tr`,
    prefix: `px`,
  };

  if (global._admatic.publisher.indexOf('adm-pub') != -1) {
    global._admatic.host = `static.cdn.admatic.com.tr`;
    global._admatic.prefix = `adm`;
  }

  const ins = global.document.createElement('ins');
  ins.setAttribute('data-publisher', global._admatic.publisher);
  if (global._admatic.adTypeId == 'standard') {
    ins.setAttribute('data-ad-size', `[[${data.width},${data.height}]]`);
  }
  ins.setAttribute('data-ad-network', global._admatic.adNetwork);
  ins.setAttribute('data-ad-type-id', global._admatic.adTypeId);
  ins.setAttribute('class', `${global._admatic.prefix}-ads-area`);
  global.document.getElementById('c').appendChild(ins);
  ins.parentNode.addEventListener(
    'eventAdbladeRenderStart',
    global.context.renderStart()
  );

  writeScript(global, `https://${global._admatic.host}/showad/showad.min.js`);
}
